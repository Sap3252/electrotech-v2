import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getSession, hasCoreAccess } from "@/lib/auth";

export async function GET() {
  const session = await getSession();

  if (!hasCoreAccess(session, 5)) {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  try {
    const [rows]: any = await pool.query(`
      SELECT 
        p.id_pintura,
        m.nombre AS marca,
        c.nombre AS color,
        t.nombre AS tipo,
        SUM(pp.consumo_estimado_kg) AS total_consumido
      FROM PiezaPintada pp
      JOIN Pintura p ON p.id_pintura = pp.id_pintura
      JOIN Marca m ON m.id_marca = p.id_marca
      JOIN Color c ON c.id_color = p.id_color
      JOIN TipoPintura t ON t.id_tipo = p.id_tipo
      GROUP BY p.id_pintura
      ORDER BY total_consumido DESC
    `);

    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
