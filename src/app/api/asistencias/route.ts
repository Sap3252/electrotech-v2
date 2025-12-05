import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { pool } from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";

// GET - Obtener asistencias (con filtros opcionales)
export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id_empleado = searchParams.get("id_empleado");
    const mes = searchParams.get("mes");
    const anio = searchParams.get("anio");
    const fecha_desde = searchParams.get("fecha_desde");
    const fecha_hasta = searchParams.get("fecha_hasta");

    const connection = await pool.getConnection();
    try {
      let query = `
        SELECT 
          a.id_asistencia,
          a.id_empleado,
          a.fecha,
          a.presente,
          a.es_sabado,
          a.horas_extra,
          a.justificada,
          a.motivo,
          e.nombre,
          e.apellido,
          e.dni
        FROM asistencia a
        JOIN empleado e ON e.id_empleado = a.id_empleado
        WHERE 1=1
      `;
      const params: (string | number)[] = [];

      if (id_empleado) {
        query += " AND a.id_empleado = ?";
        params.push(parseInt(id_empleado));
      }

      if (mes && anio) {
        query += " AND MONTH(a.fecha) = ? AND YEAR(a.fecha) = ?";
        params.push(parseInt(mes), parseInt(anio));
      }

      if (fecha_desde) {
        query += " AND a.fecha >= ?";
        params.push(fecha_desde);
      }

      if (fecha_hasta) {
        query += " AND a.fecha <= ?";
        params.push(fecha_hasta);
      }

      query += " ORDER BY a.fecha DESC, e.apellido, e.nombre";

      const [asistencias] = await connection.query<RowDataPacket[]>(query, params);

      return NextResponse.json(asistencias);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error al obtener asistencias:", error);
    return NextResponse.json(
      { error: "Error al obtener asistencias" },
      { status: 500 }
    );
  }
}

// POST - Registrar asistencia o ausencia
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { id_empleado, fecha, presente, es_sabado, horas_extra, justificada, motivo } = body;

    // Validaciones
    if (!id_empleado || !fecha) {
      return NextResponse.json(
        { error: "ID de empleado y fecha son requeridos" },
        { status: 400 }
      );
    }

    // Si es ausencia, validar justificación
    if (presente === false && justificada === undefined) {
      return NextResponse.json(
        { error: "Debe indicar si la ausencia es justificada o no" },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();
    try {
      // Verificar que el empleado existe
      const [empleado] = await connection.query<RowDataPacket[]>(
        "SELECT id_empleado FROM empleado WHERE id_empleado = ? AND activo = 1",
        [id_empleado]
      );

      if (empleado.length === 0) {
        return NextResponse.json(
          { error: "Empleado no encontrado o inactivo" },
          { status: 404 }
        );
      }

      // Insertar o actualizar asistencia (UPSERT)
      const [resultado] = await connection.query<ResultSetHeader>(
        `INSERT INTO asistencia (id_empleado, fecha, presente, es_sabado, horas_extra, justificada, motivo)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           presente = VALUES(presente),
           es_sabado = VALUES(es_sabado),
           horas_extra = VALUES(horas_extra),
           justificada = VALUES(justificada),
           motivo = VALUES(motivo),
           updated_at = CURRENT_TIMESTAMP`,
        [
          id_empleado,
          fecha,
          presente !== false ? 1 : 0,
          es_sabado ? 1 : 0,
          horas_extra || 0,
          presente !== false ? null : (justificada ? 1 : 0),
          presente !== false ? null : (motivo || null)
        ]
      );

      return NextResponse.json({
        id_asistencia: resultado.insertId,
        mensaje: presente !== false ? "Asistencia registrada" : "Ausencia registrada"
      }, { status: 201 });

    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error al registrar asistencia:", error);
    return NextResponse.json(
      { error: "Error al registrar asistencia" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar múltiples asistencias (útil para carga masiva)
export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { asistencias } = body;

    if (!Array.isArray(asistencias) || asistencias.length === 0) {
      return NextResponse.json(
        { error: "Debe proporcionar un array de asistencias" },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      for (const asist of asistencias) {
        const { id_empleado, fecha, presente, es_sabado, horas_extra, justificada, motivo } = asist;

        await connection.query(
          `INSERT INTO asistencia (id_empleado, fecha, presente, es_sabado, horas_extra, justificada, motivo)
           VALUES (?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             presente = VALUES(presente),
             es_sabado = VALUES(es_sabado),
             horas_extra = VALUES(horas_extra),
             justificada = VALUES(justificada),
             motivo = VALUES(motivo),
             updated_at = CURRENT_TIMESTAMP`,
          [
            id_empleado,
            fecha,
            presente !== false ? 1 : 0,
            es_sabado ? 1 : 0,
            horas_extra || 0,
            presente !== false ? null : (justificada ? 1 : 0),
            presente !== false ? null : (motivo || null)
          ]
        );
      }

      await connection.commit();

      return NextResponse.json({
        mensaje: `${asistencias.length} registros procesados exitosamente`
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error al actualizar asistencias:", error);
    return NextResponse.json(
      { error: "Error al actualizar asistencias" },
      { status: 500 }
    );
  }
}
