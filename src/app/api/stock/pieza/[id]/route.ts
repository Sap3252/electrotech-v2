import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getSession, hasCoreAccess } from "@/lib/auth";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!hasCoreAccess(session, 1)) {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  const id_pieza = Number(params.id);
  if (Number.isNaN(id_pieza)) {
    return NextResponse.json({ error: "ID de pieza inválida" }, { status: 400 });
  }

  try {
    const [rows] = await pool.query(
      `SELECT total_recibida, total_pintada, stock_disponible
         FROM StockPieza
        WHERE id_pieza = ?`,
      [id_pieza]
    );

    const row: any = (rows as any[])[0];

    if (!row) {
      // Nunca entró por remito → stock 0
      return NextResponse.json({
        id_pieza,
        total_recibida: 0,
        total_pintada: 0,
        stock_disponible: 0,
      });
    }

    return NextResponse.json({
      id_pieza,
      total_recibida: row.total_recibida,
      total_pintada: row.total_pintada,
      stock_disponible: row.stock_disponible,
    });
  } catch (error) {
    console.error("Error obteniendo stock de pieza:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
