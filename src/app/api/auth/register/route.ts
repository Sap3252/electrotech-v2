import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const { nombre, apellido, email, password } = await req.json();

  // Validar si ya existe
  const [rows] = await pool.query(
    "SELECT * FROM Usuario WHERE email = ?",
    [email]
  );

  if ((rows as any[]).length > 0) {
    return NextResponse.json(
      { error: "El email ya está registrado" },
      { status: 400 }
    );
  }

  const hash = await bcrypt.hash(password, 10);

  await pool.query(
    "INSERT INTO Usuario (nombre, apellido, email, password_hash, rol) VALUES (?, ?, ?, ?, 'OPERARIO')",
    [nombre, apellido, email, hash]
  );

  return NextResponse.json({ ok: true });
}