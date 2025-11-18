import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function PUT(req: Request, { params }: any) {
  try {
    const id = params.id;
    const body = await req.json();
    const { id_cliente, ancho_m, alto_m, detalle } = body;

    await pool.execute(
      `UPDATE Pieza SET id_cliente = ?, ancho_m = ?, alto_m = ?, detalle = ? 
       WHERE id_pieza = ?`,
      [id_cliente, ancho_m, alto_m, detalle, id]
    );

    return NextResponse.json({ message: "Pieza actualizada correctamente" });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al actualizar la pieza" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: any) {
  try {
    const id = params.id;

    await pool.execute("DELETE FROM Pieza WHERE id_pieza = ?", [id]);

    return NextResponse.json({ message: "Pieza eliminada correctamente" });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al eliminar la pieza" }, { status: 500 });
  }
}
