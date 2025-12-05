import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { pool } from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";

// GET - Obtener asistencias de un empleado específico
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const id_empleado = parseInt(id);

    if (isNaN(id_empleado)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const mes = searchParams.get("mes");
    const anio = searchParams.get("anio");

    const connection = await pool.getConnection();
    try {
      // Obtener datos del empleado
      const [empleados] = await connection.query<RowDataPacket[]>(
        `SELECT id_empleado, nombre, apellido, dni, salario_base 
         FROM empleado WHERE id_empleado = ?`,
        [id_empleado]
      );

      if (empleados.length === 0) {
        return NextResponse.json(
          { error: "Empleado no encontrado" },
          { status: 404 }
        );
      }

      // Construir query de asistencias
      let query = `
        SELECT 
          id_asistencia,
          fecha,
          presente,
          es_sabado,
          horas_extra,
          justificada,
          motivo
        FROM asistencia
        WHERE id_empleado = ?
      `;
      const params_query: (string | number)[] = [id_empleado];

      if (mes && anio) {
        query += " AND MONTH(fecha) = ? AND YEAR(fecha) = ?";
        params_query.push(parseInt(mes), parseInt(anio));
      }

      query += " ORDER BY fecha DESC";

      const [asistencias] = await connection.query<RowDataPacket[]>(query, params_query);

      // Calcular resumen
      const resumen = {
        dias_presentes: 0,
        ausencias_justificadas: 0,
        ausencias_injustificadas: 0,
        total_horas_extra: 0,
        sabados_trabajados: 0
      };

      for (const a of asistencias) {
        if (a.presente) {
          resumen.dias_presentes++;
          if (a.es_sabado) resumen.sabados_trabajados++;
          resumen.total_horas_extra += parseFloat(a.horas_extra || 0);
        } else {
          if (a.justificada) {
            resumen.ausencias_justificadas++;
          } else {
            resumen.ausencias_injustificadas++;
          }
        }
      }

      return NextResponse.json({
        empleado: empleados[0],
        asistencias,
        resumen
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error al obtener asistencias del empleado:", error);
    return NextResponse.json(
      { error: "Error al obtener asistencias del empleado" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar registro de asistencia específico
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const id_asistencia = parseInt(id);

    if (isNaN(id_asistencia)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const connection = await pool.getConnection();
    try {
      const [resultado] = await connection.query<ResultSetHeader>(
        "DELETE FROM asistencia WHERE id_asistencia = ?",
        [id_asistencia]
      );

      if (resultado.affectedRows === 0) {
        return NextResponse.json(
          { error: "Registro de asistencia no encontrado" },
          { status: 404 }
        );
      }

      return NextResponse.json({ mensaje: "Registro eliminado exitosamente" });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error al eliminar asistencia:", error);
    return NextResponse.json(
      { error: "Error al eliminar asistencia" },
      { status: 500 }
    );
  }
}
