import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getSession, hasPermission } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  
  // Verificar acceso al componente de tabla de facturas (ID 15)
  if (!session || !(await hasPermission(session, 15))) {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  try {
    const [rows] = await pool.query(`
      SELECT 
        f.id_factura,
        f.fecha,
        f.total,
        c.nombre AS cliente_nombre
      FROM Factura f
      JOIN Cliente c ON c.id_cliente = f.id_cliente
      ORDER BY f.fecha DESC
    `);

    return NextResponse.json(rows);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
