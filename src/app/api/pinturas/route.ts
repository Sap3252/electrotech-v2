import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getSession, hasPermission } from "@/lib/auth";
import { ResultSetHeader } from "mysql2";

// =====================
// Obtener pinturas
// =====================
export async function GET(req: Request) {
  const session = await getSession();

  // Verificar acceso al componente Tabla Listado Pinturas (ID 6)
  if (!session || !(await hasPermission(session, 6))) {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const soloHabilitadas = searchParams.get("habilitadas") === "true";

    let query = `
      SELECT 
        p.id_pintura,
        p.cantidad_kg,
        p.precio_unitario,
        p.habilitada,
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
    `;

    if (soloHabilitadas) {
      query += " WHERE p.habilitada = 1";
    }

    query += " ORDER BY p.id_pintura DESC";

    const [rows] = await pool.query(query);

    return NextResponse.json(rows);
  } catch (err) {
    console.error("ERROR GET /api/pinturas:", err);
    return NextResponse.json({ error: "Error interno al obtener pinturas" }, { status: 500 });
  }
}

// =================
// Insertar pintura
// ================
export async function POST(req: Request) {
  const session = await getSession();

  // Verificar acceso al componente Formulario Nueva Pintura (ID 5)
  if (!session || !(await hasPermission(session, 5))) {
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

    const [result] = await pool.query<ResultSetHeader>(
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
