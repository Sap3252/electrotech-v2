import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  const [rows] = await pool.query(
    "SELECT id_proveedor, nombre, direccion FROM Proveedor ORDER BY nombre ASC"
  );
  return NextResponse.json(rows);
}
