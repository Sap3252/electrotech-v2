import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getSession, hasPermission } from "@/lib/auth";

export async function GET() {
  const session = await getSession();

  // Verificar acceso al componente Consumo Pintura por Mes (ID 22)
  if (!session || !(await hasPermission(session, 22))) {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  try {
    const [rows]: any = await pool.query(`
      SELECT 
        p.id_pintura,
        CONCAT(m.nombre, ' ', c.nombre, ' ', t.nombre) as pintura,
        DATE_FORMAT(pp.fecha, "%Y-%m") AS mes,
        SUM(pp.consumo_estimado_kg) AS total_kg
      FROM PiezaPintada pp
      JOIN Pintura p ON p.id_pintura = pp.id_pintura
      JOIN Marca m ON m.id_marca = p.id_marca
      JOIN Color c ON c.id_color = p.id_color
      JOIN TipoPintura t ON t.id_tipo = p.id_tipo
      GROUP BY p.id_pintura, mes
      ORDER BY mes ASC, total_kg DESC
    `);

    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
