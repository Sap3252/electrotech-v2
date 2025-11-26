import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getSession, hasPermission } from "@/lib/auth";
import { RowDataPacket } from "mysql2/promise";

export async function GET(req: Request) {
  const session = await getSession();

  // Verificar acceso al componente Tabla Historial Producción (ID 9)
  if (!session || !(await hasPermission(session, 9))) {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id_cliente = searchParams.get("id_cliente");

  try {
    let query = `
      SELECT 
        pp.id_pieza_pintada,
        pp.id_pieza,
        p.detalle AS descripcion,
        pp.cantidad,
        pp.cantidad_facturada,
        (pp.cantidad - pp.cantidad_facturada) AS disponible
      FROM PiezaPintada pp
      JOIN Pieza p ON p.id_pieza = pp.id_pieza`;
    
    const params: string[] = [];
    
    if (id_cliente) {
      query += " WHERE p.id_cliente = ? AND pp.cantidad > pp.cantidad_facturada";
      params.push(id_cliente);
    } else {
      query += " WHERE pp.cantidad > pp.cantidad_facturada";
    }
    
    query += " ORDER BY pp.fecha DESC";

    const [rows] = await pool.query<RowDataPacket[]>(query, params);

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error obteniendo piezas disponibles:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
