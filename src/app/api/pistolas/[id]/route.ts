import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

// GET: Obtener pistola por ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [pistolas] = await pool.query<RowDataPacket[]>(
      `SELECT p.*,
        ROUND((p.horas_uso / p.horas_mantenimiento) * 100, 1) AS porcentaje_mantenimiento
      FROM pistola p WHERE p.id_pistola = ?`,
      [id]
    );

    if (pistolas.length === 0) {
      return NextResponse.json(
        { error: "Pistola no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(pistolas[0]);
  } catch (error) {
    console.error("Error obteniendo pistola:", error);
    return NextResponse.json(
      { error: "Error al obtener pistola" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { nombre, descripcion, horas_mantenimiento, estado } = body;

    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE pistola SET 
        nombre = COALESCE(?, nombre),
        descripcion = COALESCE(?, descripcion),
        horas_mantenimiento = COALESCE(?, horas_mantenimiento),
        estado = COALESCE(?, estado)
      WHERE id_pistola = ?`,
      [nombre, descripcion, horas_mantenimiento, estado, id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: "Pistola no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Pistola actualizada exitosamente" });
  } catch (error) {
    console.error("Error actualizando pistola:", error);
    return NextResponse.json(
      { error: "Error al actualizar pistola" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [result] = await pool.query<ResultSetHeader>(
      `DELETE FROM pistola WHERE id_pistola = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: "Pistola no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Pistola eliminada exitosamente" });
  } catch (error) {
    console.error("Error eliminando pistola:", error);
    return NextResponse.json(
      { error: "Error al eliminar pistola" },
      { status: 500 }
    );
  }
}
