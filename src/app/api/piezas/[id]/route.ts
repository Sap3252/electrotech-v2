import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { id_cliente, ancho_m, alto_m, detalle } = body;

    // Validar que no haya undefined
    if (!id_cliente || !ancho_m || !alto_m) {
      return NextResponse.json(
        { error: "Todos los campos obligatorios deben completarse" },
        { status: 400 }
      );
    }

    await pool.execute(
      `UPDATE Pieza SET id_cliente = ?, ancho_m = ?, alto_m = ?, detalle = ? 
       WHERE id_pieza = ?`,
      [id_cliente, ancho_m, alto_m, detalle || null, id]
    );

    return NextResponse.json({ message: "Pieza actualizada correctamente" });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al actualizar la pieza" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verificar si la pieza está siendo usada en piezas pintadas
    const [piezasPintadas] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) as total FROM PiezaPintada WHERE id_pieza = ?",
      [id]
    );

    const totalLotes = piezasPintadas[0]?.total || 0;

    if (totalLotes > 0) {
      return NextResponse.json(
        { 
          error: `No se puede eliminar la pieza porque está siendo usada en ${totalLotes} lote(s) de piezas pintadas. Puede deshabilitarla en su lugar.` 
        },
        { status: 400 }
      );
    }

    await pool.execute("DELETE FROM Pieza WHERE id_pieza = ?", [id]);

    return NextResponse.json({ message: "Pieza eliminada correctamente" });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al eliminar la pieza" }, { status: 500 });
  }
}

// PATCH - Habilitar/Deshabilitar pieza
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { habilitada } = await req.json();

    await pool.query(
      "UPDATE Pieza SET habilitada = ? WHERE id_pieza = ?",
      [habilitada ? 1 : 0, id]
    );

    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error("Error PATCH pieza:", error);
    return NextResponse.json({ error: "Error al actualizar estado" }, { status: 500 });
  }
}
