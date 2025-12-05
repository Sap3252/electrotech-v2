import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { pool } from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";

// GET - Obtener recibo específico
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
    const id_recibo = parseInt(id);

    if (isNaN(id_recibo)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const connection = await pool.getConnection();
    try {
      const [recibos] = await connection.query<RowDataPacket[]>(
        `SELECT 
          r.*,
          e.nombre,
          e.apellido,
          e.dni,
          e.funcion,
          e.direccion,
          e.telefono,
          e.fecha_ingreso
        FROM recibo_sueldo r
        JOIN empleado e ON e.id_empleado = r.id_empleado
        WHERE r.id_recibo = ?`,
        [id_recibo]
      );

      if (recibos.length === 0) {
        return NextResponse.json(
          { error: "Recibo no encontrado" },
          { status: 404 }
        );
      }

      return NextResponse.json(recibos[0]);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error al obtener recibo:", error);
    return NextResponse.json(
      { error: "Error al obtener recibo" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar recibo (solo bonificaciones, descuentos y observaciones)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const id_recibo = parseInt(id);

    if (isNaN(id_recibo)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const body = await request.json();
    const { bonificaciones, otros_descuentos, observaciones } = body;

    const connection = await pool.getConnection();
    try {
      // Obtener recibo actual
      const [recibos] = await connection.query<RowDataPacket[]>(
        "SELECT * FROM recibo_sueldo WHERE id_recibo = ?",
        [id_recibo]
      );

      if (recibos.length === 0) {
        return NextResponse.json(
          { error: "Recibo no encontrado" },
          { status: 404 }
        );
      }

      const recibo = recibos[0];

      // Recalcular totales
      const nuevaBonificacion = bonificaciones ?? recibo.bonificaciones;
      const nuevoOtrosDescuentos = otros_descuentos ?? recibo.otros_descuentos;

      const totalHaberes = parseFloat(recibo.salario_base) + 
                          parseFloat(recibo.presentismo) + 
                          parseFloat(recibo.horas_extra_monto) + 
                          parseFloat(nuevaBonificacion);

      const totalDescuentos = parseFloat(recibo.descuento_ausencias) + 
                             parseFloat(nuevoOtrosDescuentos);

      const totalNeto = totalHaberes - totalDescuentos;

      await connection.query<ResultSetHeader>(
        `UPDATE recibo_sueldo SET 
          bonificaciones = ?,
          otros_descuentos = ?,
          total_haberes = ?,
          total_descuentos = ?,
          total_neto = ?,
          observaciones = ?
        WHERE id_recibo = ?`,
        [
          nuevaBonificacion,
          nuevoOtrosDescuentos,
          totalHaberes,
          totalDescuentos,
          totalNeto,
          observaciones ?? recibo.observaciones,
          id_recibo
        ]
      );

      return NextResponse.json({
        mensaje: "Recibo actualizado exitosamente",
        total_neto: totalNeto
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error al actualizar recibo:", error);
    return NextResponse.json(
      { error: "Error al actualizar recibo" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar recibo
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
    const id_recibo = parseInt(id);

    if (isNaN(id_recibo)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const connection = await pool.getConnection();
    try {
      const [resultado] = await connection.query<ResultSetHeader>(
        "DELETE FROM recibo_sueldo WHERE id_recibo = ?",
        [id_recibo]
      );

      if (resultado.affectedRows === 0) {
        return NextResponse.json(
          { error: "Recibo no encontrado" },
          { status: 404 }
        );
      }

      return NextResponse.json({ mensaje: "Recibo eliminado exitosamente" });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error al eliminar recibo:", error);
    return NextResponse.json(
      { error: "Error al eliminar recibo" },
      { status: 500 }
    );
  }
}
