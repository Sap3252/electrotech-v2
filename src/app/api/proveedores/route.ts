import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM Proveedor ORDER BY nombre ASC"
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error GET proveedores:", error);
    return NextResponse.json({ error: "Error al obtener proveedores" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { nombre, direccion } = await req.json();

    if (!nombre) {
      return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 });
    }

    // generate a string id for proveedor to match DB schema (id_proveedor is VARCHAR(20))
    const id_proveedor = `prov_${Date.now()}_${Math.floor(Math.random() * 1000)}`.slice(0, 20);

    await pool.query(
      `INSERT INTO Proveedor (id_proveedor, nombre, direccion) 
       VALUES (?, ?, ?)`,
      [id_proveedor, nombre, direccion || null]
    );

    return NextResponse.json({ ok: true, id_proveedor });
  } catch (error) {
    console.error("Error POST proveedor:", error);
    return NextResponse.json({ error: "Error al crear proveedor" }, { status: 500 });
  }
}
