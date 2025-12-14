import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getSession, hasPermission } from "@/lib/auth";
import { ResultSetHeader } from "mysql2";

export async function GET() {
  const session = await getSession();
  
  if (!session || !(await hasPermission(session, 11))) {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  try {
    const [rows] = await pool.query(`
      SELECT 
        r.id_remito,
        r.fecha_recepcion,
        r.cantidad_piezas,
        c.nombre AS cliente_nombre
      FROM Remito r
      JOIN Cliente c ON c.id_cliente = r.id_cliente
      ORDER BY r.fecha_recepcion DESC
    `);

    return NextResponse.json(rows);
  } catch (err) {
    console.error("Error GET /remitos:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getSession();
  
  if (!session || !(await hasPermission(session, 10))) {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { id_cliente, fecha_recepcion, piezas } = body;

    if (!piezas || piezas.length === 0) {
      return NextResponse.json(
        { error: "Debe enviar al menos una pieza" },
        { status: 400 }
      );
    }

    const cantidadTotalPiezas = piezas.reduce((sum: number, p: any) => sum + (p.cantidad || 0), 0);

    const [remitoRes] = await pool.query<ResultSetHeader>(
      `
      INSERT INTO Remito (id_cliente, fecha_recepcion, cantidad_piezas)
      VALUES (?, ?, ?)
      `,
      [id_cliente, fecha_recepcion, cantidadTotalPiezas]
    );

    const id_remito = remitoRes.insertId;

    for (const p of piezas) {
      await pool.query(
        `
        INSERT INTO RemitoDetalle (id_remito, id_pieza, cantidad)
        VALUES (?, ?, ?)
        `,
        [id_remito, p.id_pieza, p.cantidad]
      );
    }

    return NextResponse.json({ ok: true, id_remito });
  } catch (err) {
    console.error("Error POST /remitos:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
