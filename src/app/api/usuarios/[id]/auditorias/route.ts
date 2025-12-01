import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { id } = await params;

    const [rows]: any = await pool.query(
      `SELECT 
        a.id,
        a.fecha_hora_login,
        a.fecha_hora_logout,
        TIMESTAMPDIFF(SECOND, a.fecha_hora_login, a.fecha_hora_logout) as duracion_segundos
      FROM auditoriasesion a
      WHERE a.id_usuario = ?
      ORDER BY a.fecha_hora_login DESC
      LIMIT 50`,
      [id]
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error al obtener auditorías:", error);
    return NextResponse.json(
      { error: "Error al obtener auditorías" },
      { status: 500 }
    );
  }
}
