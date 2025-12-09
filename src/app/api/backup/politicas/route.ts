import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getSession, hasPermission } from "@/lib/auth";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export async function GET() {
  const session = await getSession();

  // Verificar permiso (ID 130 - Acceso Panel Base de Datos)
  if (!session || !(await hasPermission(session, 130))) {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  try {
    const [politicas] = await pool.query<RowDataPacket[]>(`
      SELECT * FROM politica_backup 
      ORDER BY created_at DESC
    `);

    return NextResponse.json(politicas);
  } catch (error) {
    console.error("Error obteniendo políticas:", error);
    return NextResponse.json(
      { error: "Error al obtener políticas de backup" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();

  // Verificar permiso (ID 131 - Botón Nueva Política)
  if (!session || !(await hasPermission(session, 131))) {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const {
      nombre,
      tipo,
      tablas_seleccionadas,
      frecuencia,
      hora_ejecucion,
      dia_semana,
      dia_mes,
    } = body;

    if (!nombre || !tipo || !frecuencia || !hora_ejecucion) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    const proxima_ejecucion = calcularProximaEjecucion(
      frecuencia,
      hora_ejecucion,
      dia_semana,
      dia_mes
    );

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO politica_backup 
        (nombre, tipo, tablas_seleccionadas, frecuencia, hora_ejecucion, dia_semana, dia_mes, proxima_ejecucion)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nombre,
        tipo,
        tablas_seleccionadas || null,
        frecuencia,
        hora_ejecucion,
        dia_semana || null,
        dia_mes || null,
        proxima_ejecucion,
      ]
    );

    return NextResponse.json(
      { id_politica: result.insertId, message: "Política creada exitosamente" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creando política:", error);
    return NextResponse.json(
      { error: "Error al crear política de backup" },
      { status: 500 }
    );
  }
}

function calcularProximaEjecucion(
  frecuencia: string,
  hora_ejecucion: string,
  dia_semana?: number | null,
  dia_mes?: number | null
): Date {
  const ahora = new Date();
  const [horas, minutos] = hora_ejecucion.split(":").map(Number);

  const proxima = new Date(ahora);
  proxima.setHours(horas, minutos, 0, 0);

  switch (frecuencia) {
    case "diario":
      if (proxima <= ahora) {
        proxima.setDate(proxima.getDate() + 1);
      }
      break;

    case "semanal":
      if (dia_semana !== null && dia_semana !== undefined) {
        const diasHastaProximo = (dia_semana - ahora.getDay() + 7) % 7;
        proxima.setDate(proxima.getDate() + (diasHastaProximo === 0 && proxima <= ahora ? 7 : diasHastaProximo));
      }
      break;

    case "mensual":
      if (dia_mes !== null && dia_mes !== undefined) {
        proxima.setDate(dia_mes);
        if (proxima <= ahora) {
          proxima.setMonth(proxima.getMonth() + 1);
        }
      }
      break;

    case "unico":
      if (proxima <= ahora) {
        proxima.setDate(proxima.getDate() + 1);
      }
      break;
  }

  return proxima;
}
