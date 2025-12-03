import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

// GET: Obtener horno por ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [hornos] = await pool.query<RowDataPacket[]>(
      `SELECT h.*,
        ROUND((h.horas_uso / h.horas_mantenimiento) * 100, 1) AS porcentaje_mantenimiento
      FROM horno h WHERE h.id_horno = ?`,
      [id]
    );

    if (hornos.length === 0) {
      return NextResponse.json(
        { error: "Horno no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(hornos[0]);
  } catch (error) {
    console.error("Error obteniendo horno:", error);
    return NextResponse.json(
      { error: "Error al obtener horno" },
      { status: 500 }
    );
  }
}

// PUT: Actualizar horno
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { nombre, descripcion, horas_mantenimiento, temperatura_max, gasto_gas_hora, estado } = body;

    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE horno SET 
        nombre = COALESCE(?, nombre),
        descripcion = COALESCE(?, descripcion),
        horas_mantenimiento = COALESCE(?, horas_mantenimiento),
        temperatura_max = COALESCE(?, temperatura_max),
        gasto_gas_hora = COALESCE(?, gasto_gas_hora),
        estado = COALESCE(?, estado)
      WHERE id_horno = ?`,
      [nombre, descripcion, horas_mantenimiento, temperatura_max, gasto_gas_hora, estado, id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: "Horno no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Horno actualizado exitosamente" });
  } catch (error) {
    console.error("Error actualizando horno:", error);
    return NextResponse.json(
      { error: "Error al actualizar horno" },
      { status: 500 }
    );
  }
}

// DELETE: Eliminar horno
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [result] = await pool.query<ResultSetHeader>(
      `DELETE FROM horno WHERE id_horno = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: "Horno no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Horno eliminado exitosamente" });
  } catch (error) {
    console.error("Error eliminando horno:", error);
    return NextResponse.json(
      { error: "Error al eliminar horno" },
      { status: 500 }
    );
  }
}
