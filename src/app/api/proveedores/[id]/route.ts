import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { nombre, direccion } = await req.json();

    if (!nombre) {
      return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 });
    }

    await pool.query(
      `UPDATE Proveedor 
       SET nombre = ?, direccion = ?
       WHERE id_proveedor = ?`,
      [nombre, direccion || null, id]
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error PUT proveedor:", error);
    return NextResponse.json({ error: "Error al actualizar proveedor" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await pool.query("DELETE FROM Proveedor WHERE id_proveedor = ?", [id]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error DELETE proveedor:", error);
    return NextResponse.json({ error: "Error al eliminar proveedor" }, { status: 500 });
  }
}
