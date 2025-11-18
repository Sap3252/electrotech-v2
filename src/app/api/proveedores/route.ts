import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  const [rows] = await pool.query(
    "SELECT id_proveedor, direccion FROM Proveedor ORDER BY id_proveedor ASC"
  );
  return NextResponse.json(rows);
}
