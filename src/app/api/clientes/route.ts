import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM Cliente ORDER BY nombre ASC"
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error GET clientes:", error);
    return NextResponse.json({ error: "Error al obtener clientes" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { nombre, direccion } = await req.json();

    if (!nombre) {
      return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 });
    }

    const [result]: any = await pool.query(
      `INSERT INTO Cliente (nombre, direccion) 
       VALUES (?, ?)`,
      [nombre, direccion || null]
    );

    return NextResponse.json({ 
      ok: true, 
      id_cliente: result.insertId 
    });
  } catch (error) {
    console.error("Error POST cliente:", error);
    return NextResponse.json({ error: "Error al crear cliente" }, { status: 500 });
  }
}
