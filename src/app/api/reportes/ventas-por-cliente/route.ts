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
        c.id_cliente,
        c.nombre,
        SUM(f.total) AS total_comprado
      FROM Factura f
      JOIN Cliente c ON c.id_cliente = f.id_cliente
      GROUP BY c.id_cliente
      ORDER BY total_comprado DESC
    `);

    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
