import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getSession, hasPermission } from "@/lib/auth";

export async function GET() {
  const session = await getSession();

  // Verificar acceso al componente Evolución de Ventas (ID 21)
  if (!session || !(await hasPermission(session, 21))) {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  try {
    const [rows]: any = await pool.query(`
      SELECT 
        DATE_FORMAT(f.fecha, "%Y-%m") AS mes,
        COUNT(f.id_factura) AS cantidad_facturas,
        SUM(f.total) AS total_ventas
      FROM Factura f
      GROUP BY mes
      ORDER BY mes ASC
    `);

    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
