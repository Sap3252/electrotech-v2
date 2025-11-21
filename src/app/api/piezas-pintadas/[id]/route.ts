import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getSession, hasCoreAccess } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!hasCoreAccess(session, 1))
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });

  const id = Number(params.id);

  try {
    const [rows]: any = await pool.query(
      `SELECT * FROM PiezaPintada WHERE id_pieza_pintada = ?`,
      [id]
    );

    if (!rows.length)
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("Error al obtener pieza pintada:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!hasCoreAccess(session, 1))
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });

  const id = Number(params.id);
  const { cantidad, consumo_estimado_kg, fecha } = await req.json();

  try {
    await pool.query(
      `
      UPDATE PiezaPintada
      SET cantidad = ?, consumo_estimado_kg = ?, fecha = ?
      WHERE id_pieza_pintada = ?
      `,
      [cantidad, consumo_estimado_kg, fecha, id]
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error al actualizar pieza pintada:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!hasCoreAccess(session, 1))
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });

  const id = Number(params.id);

  try {
    await pool.query(
      `DELETE FROM PiezaPintada WHERE id_pieza_pintada = ?`,
      [id]
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error al eliminar pieza pintada:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
