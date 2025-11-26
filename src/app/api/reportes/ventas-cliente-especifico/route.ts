import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getSession, hasPermission } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await getSession();

  // Verificar acceso al componente Ventas Cliente Específico (ID 27 - crear)
  if (!session || !(await hasPermission(session, 27))) {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id_cliente = searchParams.get("id_cliente");

  if (!id_cliente) {
    return NextResponse.json({ error: "id_cliente requerido" }, { status: 400 });
  }

  try {
    const [rows]: any = await pool.query(
      `SELECT 
        f.id_factura,
        f.fecha,
        f.total
      FROM Factura f
      WHERE f.id_cliente = ?
      ORDER BY f.fecha DESC`,
      [id_cliente]
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
