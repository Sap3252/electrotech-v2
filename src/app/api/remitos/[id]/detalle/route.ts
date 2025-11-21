import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getSession, hasCoreAccess } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!hasCoreAccess(session, 2)) {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const [rows] = await pool.query(
      `
      SELECT 
        d.id_detalle,
        d.cantidad,
        p.id_pieza,
        p.detalle,
        p.ancho_m,
        p.alto_m
      FROM RemitoDetalle d
      JOIN Pieza p ON p.id_pieza = d.id_pieza
      WHERE d.id_remito = ?
      `,
      [id]
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error obteniendo detalle:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
