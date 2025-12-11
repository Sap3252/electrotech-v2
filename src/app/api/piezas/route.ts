import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id_cliente = searchParams.get("id_cliente");
  const soloHabilitadas = searchParams.get("habilitadas") === "true";

  let query = "SELECT * FROM Pieza";
  const params: any[] = [];
  const conditions: string[] = [];

  if (id_cliente) {
    conditions.push("id_cliente = ?");
    params.push(id_cliente);
  }

  if (soloHabilitadas) {
    conditions.push("habilitada = 1");
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  query += " ORDER BY id_pieza DESC";

  const [rows] = await pool.query(query, params);
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id_cliente, ancho_m, alto_m, detalle } = body;

    if (!id_cliente || !ancho_m || !alto_m) {
      return NextResponse.json(
        { error: "Todos los campos obligatorios deben completarse." },
        { status: 400 }
      );
    }

    await pool.execute(
      `INSERT INTO Pieza (id_cliente, ancho_m, alto_m, detalle)
       VALUES (?, ?, ?, ?)`,
      [id_cliente, ancho_m, alto_m, detalle]
    );

    return NextResponse.json({ message: "Pieza creada correctamente" }, { status: 201 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al crear la pieza" }, { status: 500 });
  }
}
