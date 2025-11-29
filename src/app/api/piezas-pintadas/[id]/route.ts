import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getSession, hasPermission } from "@/lib/auth";
import { RowDataPacket } from "mysql2";

export async function GET(req: Request, { params }: { params: { id: string } }) 
{
  const session = await getSession();

  // Verificar acceso al componente Ver Detalle Pieza Pintada (ID 9 tabla)
  if (!session || !(await hasPermission(session, 9)))
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });

  const id = Number(params.id);

  try {
    const [rows] = await pool.query<RowDataPacket[]>(
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

  // Verificar acceso al componente Editar Pieza Pintada (ID 8 formulario)
  if (!session || !(await hasPermission(session, 8)))
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

  // Verificar acceso al componente Eliminar Pieza Pintada (ID 23 crear)
  if (!session || !(await hasPermission(session, 23)))
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
