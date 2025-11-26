import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getSession, hasPermission } from "@/lib/auth";

// =======================
// GET por ID
// =======================
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();

  // Verificar acceso al componente Ver Detalle Pintura (ID 23 - crear si no existe)
  if (!session || !(await hasPermission(session, 6))) {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const [rows]: any = await pool.query(
      `
      SELECT 
        p.id_pintura,
        p.cantidad_kg,
        p.precio_unitario,
        m.id_marca,
        m.nombre AS marca,
        t.id_tipo,
        t.nombre AS tipo,
        c.id_color,
        c.nombre AS color,
        pr.id_proveedor,
        pr.nombre AS proveedor
      FROM Pintura p
      JOIN Marca m ON m.id_marca = p.id_marca
      JOIN TipoPintura t ON t.id_tipo = p.id_tipo
      JOIN Color c ON c.id_color = p.id_color
      JOIN Proveedor pr ON pr.id_proveedor = p.id_proveedor
      WHERE p.id_pintura = ?
      `,
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Pintura no encontrada" }, { status: 404 });
    }

    return NextResponse.json(rows[0]);

  } catch (error) {
    console.error("Error GET pintura por ID:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// =======================
// PUT (actualizar pintura)
// =======================
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();

  // Verificar acceso al componente Editar Pintura (ID 24 - crear si no existe)
  if (!session || !(await hasPermission(session, 24))) {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const {
      id_marca,
      id_tipo,
      id_color,
      id_proveedor,
      cantidad_kg,
      precio_unitario
    } = await req.json();

    await pool.query(
      `
      UPDATE Pintura
      SET id_marca = ?, 
          id_tipo = ?, 
          id_color = ?, 
          id_proveedor = ?, 
          cantidad_kg = ?, 
          precio_unitario = ?
      WHERE id_pintura = ?
      `,
      [
        id_marca,
        id_tipo,
        id_color,
        id_proveedor,
        cantidad_kg,
        precio_unitario,
        id
      ]
    );

    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error("Error PUT pintura:", error);
    return NextResponse.json({ error: "Error interno al actualizar" }, { status: 500 });
  }
}

// =======================
// DELETE
// =======================
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();

  // Verificar acceso al componente Botón Eliminar Pintura (ID 7)
  if (!session || !(await hasPermission(session, 7))) {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  const { id } = await params;

  try {
    await pool.query("DELETE FROM Pintura WHERE id_pintura = ?", [id]);
    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error("Error DELETE pintura:", error);
    return NextResponse.json({ error: "No se puede eliminar la pintura" }, { status: 500 });
  }
}
