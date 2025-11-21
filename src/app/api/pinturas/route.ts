import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getSession, hasCoreAccess } from "@/lib/auth";

// =====================
// GET - Obtener pinturas
// =====================
export async function GET() {
  const session = await getSession();
  if (!hasCoreAccess(session, 1)) {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  try {
    const [rows] = await pool.query(`
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
      ORDER BY p.id_pintura DESC
    `);

    return NextResponse.json(rows);
  } catch (err) {
    console.error("ERROR GET /api/pinturas:", err);
    return NextResponse.json({ error: "Error interno al obtener pinturas" }, { status: 500 });
  }
}

// =====================
// POST - Insertar pintura
// =====================
export async function POST(req: Request) {
  const session = await getSession();
  if (!hasCoreAccess(session, 1)) {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  try {
    const {
      id_marca,
      id_tipo,
      id_color,
      id_proveedor,
      cantidad_kg,
      precio_unitario,
    } = await req.json();

    const [result]: any = await pool.query(
      `
      INSERT INTO Pintura
      (id_marca, id_tipo, id_color, id_proveedor, cantidad_kg, precio_unitario)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        id_marca,
        id_tipo,
        id_color,
        id_proveedor,
        cantidad_kg,
        precio_unitario,
      ]
    );

    return NextResponse.json({
      ok: true,
      id_pintura: result.insertId,
    });
  } catch (err) {
    console.error("ERROR POST /api/pinturas:", err);
    return NextResponse.json(
      { error: "Error al registrar nueva pintura" },
      { status: 500 }
    );
  }
}
