import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getSession, hasCoreAccess } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!hasCoreAccess(session, 2)) {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  try {
    const [rows]: any = await pool.query(`
      SELECT 
        pp.id_pieza_pintada,
        pp.id_pieza,
        p.detalle AS descripcion,
        pp.cantidad,
        pp.cantidad_facturada,
        (pp.cantidad - pp.cantidad_facturada) AS disponible
      FROM PiezaPintada pp
      JOIN Pieza p ON p.id_pieza = pp.id_pieza
      WHERE pp.cantidad > pp.cantidad_facturada
      ORDER BY pp.fecha DESC
    `);

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error obteniendo piezas disponibles:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
