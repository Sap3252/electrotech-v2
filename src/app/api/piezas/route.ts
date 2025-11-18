import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  const [rows] = await pool.query("SELECT * FROM Pieza ORDER BY id_pieza DESC");
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
