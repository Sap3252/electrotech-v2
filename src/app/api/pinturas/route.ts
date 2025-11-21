import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getSession, hasCoreAccess } from "@/lib/auth";

// ==========================================================
// GET – OBTENER TODAS LAS PINTURAS
// ==========================================================
export async function GET() {
  const session = await getSession();
  if (!hasCoreAccess(session, 1))
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });

  try {
    const [rows] = await pool.query(`
      SELECT p.*, m.nombre AS marca, c.nombre AS color, t.nombre AS tipo
      FROM Pintura p
      JOIN Marca m ON p.id_marca = m.id_marca
      JOIN Color c ON p.id_color = c.id_color
      JOIN TipoPintura t ON p.id_tipo = t.id_tipo
    `);
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error al obtener pinturas:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// ==========================================================
// POST – CREAR NUEVA PINTURA
// ==========================================================
export async function POST(req: Request) {
  const session = await getSession();
  if (!hasCoreAccess(session, 1))
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });

  try {
    const { id_marca, id_color, id_tipo, espesor_um, densidad_g_cm3, cantidad_kg } =
      await req.json();

    const [result]: any = await pool.query(
      `INSERT INTO Pintura (id_marca, id_color, id_tipo, espesor_um, densidad_g_cm3, cantidad_kg)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id_marca, id_color, id_tipo, espesor_um, densidad_g_cm3, cantidad_kg]
    );

    return NextResponse.json({ ok: true, id_pintura: result.insertId });
  } catch (error) {
    console.error("Error al crear pintura:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
