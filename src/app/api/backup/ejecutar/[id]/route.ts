import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getSession, hasPermission } from "@/lib/auth";
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
  proxima_ejecucion: string | null;
}

// POST: Ejecutar backup manualmente
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();

  // Verificar permiso (ID 133 - Botón Ejecutar Backup)
  if (!session || !(await hasPermission(session, 133))) {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  try {
    const { id } = await params;

    // Obtener la política
    const [politicas] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM politica_backup WHERE id_politica = ?`,
      [id]
    );

    if (politicas.length === 0) {
      return NextResponse.json(
        { error: "Política no encontrada" },
        { status: 404 }
      );
    }

    const politica = politicas[0] as PoliticaBackup;

    // Crear registro en historial
    const [historialResult] = await pool.query<ResultSetHeader>(
      `INSERT INTO historial_backup (id_politica, fecha_inicio, estado) VALUES (?, NOW(), 'en_progreso')`,
      [id]
    );
    const id_historial = historialResult.insertId;

    // Configuración de MySQL (leer de variables de entorno - compatible con DB_* y MYSQL_*)
    const mysqlHost = process.env.DB_HOST || process.env.MYSQL_HOST || "localhost";
    const mysqlUser = process.env.DB_USER || process.env.MYSQL_USER || "root";
    const mysqlPassword = process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || "";
    const mysqlDatabase = process.env.DB_NAME || process.env.MYSQL_DATABASE || "electrotech2";
    
    // Ruta de mysqldump - ajustar según instalación de MySQL
    const mysqldumpPath = process.env.MYSQLDUMP_PATH || 
      "C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysqldump.exe";

    // Crear carpeta de backups si no existe
    const backupDir = path.join(process.cwd(), "backups");
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Nombre del archivo
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `backup_${politica.tipo}_${timestamp}.sql`;
    const filePath = path.join(backupDir, fileName);

    // Construir comando mysqldump
    let tablesArg = "";
    if (politica.tipo === "parcial" && politica.tablas_seleccionadas) {
      tablesArg = politica.tablas_seleccionadas.split(",").join(" ");
    }

    // Construir el comando mysqldump con ruta completa
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
      // Ejecutar mysqldump
      await execAsync(dumpCommand);

      // Obtener tamaño del archivo
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

      // Actualizar última ejecución de la política
      await pool.query<ResultSetHeader>(
        `UPDATE politica_backup SET ultima_ejecucion = NOW() WHERE id_politica = ?`,
        [id]
      );

      return NextResponse.json({
        message: "Backup ejecutado exitosamente",
        archivo: fileName,
        tamano: stats.size,
      });
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
  } catch (error) {
    console.error("Error ejecutando backup:", error);
    return NextResponse.json(
      { error: "Error al ejecutar backup: " + (error as Error).message },
      { status: 500 }
    );
  }
}
