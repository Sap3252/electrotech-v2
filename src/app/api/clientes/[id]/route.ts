import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { nombre, direccion } = await req.json();

    if (!nombre) {
      return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 });
    }

    await pool.query(
      `UPDATE Cliente 
       SET nombre = ?, direccion = ?
       WHERE id_cliente = ?`,
      [nombre, direccion || null, id]
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error PUT cliente:", error);
    return NextResponse.json({ error: "Error al actualizar cliente" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    await pool.query("DELETE FROM Cliente WHERE id_cliente = ?", [id]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error DELETE cliente:", error);
    return NextResponse.json({ error: "Error al eliminar cliente" }, { status: 500 });
  }
}
