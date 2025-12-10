import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getSession, hasPermission } from "@/lib/auth";
import { RowDataPacket } from "mysql2";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();

  // Verificar acceso al componente Ver Stock Pieza (ID 25 crear)
  if (!session || !(await hasPermission(session, 2))) {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  const { id } = await params;
  const id_pieza = Number(id);
  if (Number.isNaN(id_pieza)) {
    return NextResponse.json({ error: "ID de pieza inválida" }, { status: 400 });
  }

  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT total_recibida, total_pintada, stock_disponible
         FROM StockPieza
        WHERE id_pieza = ?`,
      [id_pieza]
    );

    const row = rows[0];

    if (!row) {
      // Nunca entró por remito -> stock 0
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
