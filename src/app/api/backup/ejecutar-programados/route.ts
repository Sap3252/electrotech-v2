import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs";

const execAsync = promisify(exec);

interface PoliticaBackup {
  id_politica: number;
  nombre: string;
  tipo: "completo" | "parcial" | "incremental";
  tablas_seleccionadas: string | null;
  frecuencia: string;
  hora_ejecucion: string;
  dia_semana: number | null;
  dia_mes: number | null;
  proxima_ejecucion: string | null;
}

// GET: Ejecutar backups programados (llamar desde cron o task scheduler)
// Puede ser llamado sin autenticación para permitir ejecución automática
// Agregar un token secreto para seguridad
export async function GET(req: Request) {
  // Verificar token de seguridad (opcional pero recomendado)
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const expectedToken = process.env.BACKUP_CRON_TOKEN || "electrotech-backup-2025";
  
  if (token !== expectedToken) {
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }

  try {
    // Buscar políticas activas cuya próxima ejecución ya pasó
    const [politicas] = await pool.query<RowDataPacket[]>(`
      SELECT * FROM politica_backup 
      WHERE activa = TRUE 
        AND proxima_ejecucion IS NOT NULL 
        AND proxima_ejecucion <= NOW()
      ORDER BY proxima_ejecucion ASC
    `);

    if (politicas.length === 0) {
      return NextResponse.json({ 
        message: "No hay backups pendientes",
        ejecutados: 0 
      });
    }

    const resultados: { id: number; nombre: string; estado: string; archivo?: string; error?: string }[] = [];

    for (const politica of politicas as PoliticaBackup[]) {
      try {
        const resultado = await ejecutarBackup(politica);
        resultados.push({
          id: politica.id_politica,
          nombre: politica.nombre,
          estado: "completado",
          archivo: resultado.archivo
        });
      } catch (error) {
        resultados.push({
          id: politica.id_politica,
          nombre: politica.nombre,
          estado: "fallido",
          error: (error as Error).message
        });
      }
    }

    return NextResponse.json({
      message: `Proceso completado`,
      ejecutados: resultados.filter(r => r.estado === "completado").length,
      fallidos: resultados.filter(r => r.estado === "fallido").length,
      resultados
    });

  } catch (error) {
    console.error("Error en ejecución programada:", error);
    return NextResponse.json(
      { error: "Error en ejecución programada: " + (error as Error).message },
      { status: 500 }
    );
  }
}

async function ejecutarBackup(politica: PoliticaBackup): Promise<{ archivo: string; tamano: number }> {
  // Crear registro en historial
  const [historialResult] = await pool.query<ResultSetHeader>(
    `INSERT INTO historial_backup (id_politica, fecha_inicio, estado) VALUES (?, NOW(), 'en_progreso')`,
    [politica.id_politica]
  );
  const id_historial = historialResult.insertId;

  // Configuración de MySQL
  const mysqlHost = process.env.DB_HOST || process.env.MYSQL_HOST || "localhost";
  const mysqlUser = process.env.DB_USER || process.env.MYSQL_USER || "root";
  const mysqlPassword = process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || "";
  const mysqlDatabase = process.env.DB_NAME || process.env.MYSQL_DATABASE || "electrotech2";
  const mysqldumpPath = process.env.MYSQLDUMP_PATH || 
    "C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysqldump.exe";

  // Crear carpeta de backups
  const backupDir = path.join(process.cwd(), "backups");
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  // Nombre del archivo
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const fileName = `backup_${politica.tipo}_${politica.nombre.replace(/\s+/g, "_")}_${timestamp}.sql`;
  const filePath = path.join(backupDir, fileName);

  // Construir comando mysqldump
  let tablesArg = "";
  if (politica.tipo === "parcial" && politica.tablas_seleccionadas) {
    tablesArg = politica.tablas_seleccionadas.split(",").join(" ");
  }

  let dumpCommand = `"${mysqldumpPath}" -h ${mysqlHost} -u ${mysqlUser}`;
  if (mysqlPassword) {
    dumpCommand += ` -p${mysqlPassword}`;
  }
  dumpCommand += ` ${mysqlDatabase}`;
  
  if (tablesArg) {
    dumpCommand += ` ${tablesArg}`;
  }
  
  dumpCommand += ` > "${filePath}"`;

  try {
    await execAsync(dumpCommand);
    const stats = fs.statSync(filePath);

    // Actualizar historial como completado
    await pool.query<ResultSetHeader>(
      `UPDATE historial_backup 
       SET fecha_fin = NOW(), estado = 'completado', archivo_generado = ?, tamano_bytes = ?, tablas_respaldadas = ?
       WHERE id_historial = ?`,
      [
        fileName,
        stats.size,
        politica.tipo === "parcial" ? politica.tablas_seleccionadas : "TODAS",
        id_historial,
      ]
    );

    // Actualizar última ejecución y calcular próxima
    const proximaEjecucion = calcularProximaEjecucion(
      politica.frecuencia,
      politica.hora_ejecucion,
      politica.dia_semana,
      politica.dia_mes
    );

    await pool.query<ResultSetHeader>(
      `UPDATE politica_backup 
       SET ultima_ejecucion = NOW(), proxima_ejecucion = ?
       WHERE id_politica = ?`,
      [proximaEjecucion, politica.id_politica]
    );

    return { archivo: fileName, tamano: stats.size };

  } catch (dumpError) {
    // Marcar como fallido
    await pool.query<ResultSetHeader>(
      `UPDATE historial_backup 
       SET fecha_fin = NOW(), estado = 'fallido', mensaje_error = ?
       WHERE id_historial = ?`,
      [(dumpError as Error).message, id_historial]
    );

    throw dumpError;
  }
}

function calcularProximaEjecucion(
  frecuencia: string,
  hora_ejecucion: string,
  dia_semana?: number | null,
  dia_mes?: number | null
): Date | null {
  if (frecuencia === "unico") {
    return null; // No hay próxima ejecución para backups únicos
  }

  const ahora = new Date();
  const [horas, minutos] = hora_ejecucion.split(":").map(Number);

  const proxima = new Date(ahora);
  proxima.setHours(horas, minutos, 0, 0);

  switch (frecuencia) {
    case "diario":
      // Próxima ejecución es mañana a la misma hora
      proxima.setDate(proxima.getDate() + 1);
      break;

    case "semanal":
      if (dia_semana !== null && dia_semana !== undefined) {
        // Calcular días hasta el próximo día de la semana
        let diasHastaProximo = (dia_semana - ahora.getDay() + 7) % 7;
        if (diasHastaProximo === 0) diasHastaProximo = 7; // Si es hoy, próxima semana
        proxima.setDate(proxima.getDate() + diasHastaProximo);
      }
      break;

    case "mensual":
      if (dia_mes !== null && dia_mes !== undefined) {
        // Próximo mes, mismo día
        proxima.setMonth(proxima.getMonth() + 1);
        proxima.setDate(dia_mes);
      }
      break;
  }

  return proxima;
}
