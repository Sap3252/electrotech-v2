import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getSession, hasPermission } from "@/lib/auth";

export async function GET() {
  const session = await getSession();

  // Verificar acceso al componente Ver Piezas Disponibles (ID 2 tabla piezas)
  if (!session || !(await hasPermission(session, 2))) {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  try {
    const [rows] = await pool.query(`
      SELECT 
        p.id_pieza,
        p.detalle,
        p.ancho_m,
        p.alto_m,
        COALESCE(sp.stock_disponible, 0) as stock_disponible
      FROM Pieza p
      LEFT JOIN StockPieza sp ON sp.id_pieza = p.id_pieza
      WHERE COALESCE(sp.stock_disponible, 0) > 0
      ORDER BY p.id_pieza DESC
    `);

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error al obtener piezas disponibles:", error);
    return NextResponse.json(
      { error: "Error al obtener piezas disponibles" },
      { status: 500 }
    );
  }
}
