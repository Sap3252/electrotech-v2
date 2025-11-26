import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import bcrypt from "bcryptjs";
import { RowDataPacket } from "mysql2";

export async function POST(req: Request) {
  const { token, password } = await req.json();

  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT * FROM ResetPasswordToken WHERE token = ? AND expires_at > NOW()",
    [token]
  );

  const row = rows[0];

  if (!row) {
    return NextResponse.json(
      { error: "Token inválido o expirado" },
      { status: 400 }
    );
  }

  const hash = await bcrypt.hash(password, 10);
// Se actualiza la contraseña del usuario
  await pool.query(
    "UPDATE Usuario SET password_hash = ? WHERE email = ?",
    [hash, row.email]
  );

  await pool.query("DELETE FROM ResetPasswordToken WHERE token = ?", [token]);

  return NextResponse.json({ ok: true });
}
