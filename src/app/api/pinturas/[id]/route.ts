import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getSession, hasCoreAccess } from "@/lib/auth";

// ==========================================================
// GET – OBTENER UNA PINTURA
// ==========================================================
export async function GET(req: Request, { params }: any) {
  const session = await getSession();
  if (!hasCoreAccess(session, 1))
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });

  const { id } = params;

  try {
    const [rows]: any = await pool.query(
      `SELECT * FROM Pintura WHERE id_pintura = ?`,
      [id]
    );

    if (rows.length === 0)
      return NextResponse.json({ error: "No encontrada" }, { status: 404 });

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("Error al obtener pintura:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// ==========================================================
// PUT – ACTUALIZAR PINTURA
// ==========================================================
export async function PUT(req: Request, { params }: any) {
  const session = await getSession();
  if (!hasCoreAccess(session, 1))
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });

  const { id } = params;
  const { id_marca, id_color, id_tipo, espesor_um, densidad_g_cm3, cantidad_kg } =
    await req.json();

  try {
    await pool.query(
      `UPDATE Pintura
       SET id_marca=?, id_color=?, id_tipo=?, espesor_um=?, densidad_g_cm3=?, cantidad_kg=?
       WHERE id_pintura = ?`,
      [id_marca, id_color, id_tipo, espesor_um, densidad_g_cm3, cantidad_kg, id]
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error al actualizar pintura:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// ==========================================================
// DELETE – ELIMINAR PINTURA
// ==========================================================
export async function DELETE(req: Request, { params }: any) {
  const session = await getSession();
  if (!hasCoreAccess(session, 1))
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });

  const { id } = params;

  try {
    await pool.query(`DELETE FROM Pintura WHERE id_pintura = ?`, [id]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error al eliminar pintura:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
