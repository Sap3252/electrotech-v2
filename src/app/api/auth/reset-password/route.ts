import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const { token, password } = await req.json();

  const [rows] = await pool.query(
    "SELECT * FROM ResetPasswordToken WHERE token = ? AND expires_at > NOW()",
    [token]
  );

  const row: any = (rows as any[])[0];

  if (!row) {
    return NextResponse.json(
      { error: "Token inválido o expirado" },
      { status: 400 }
    );
  }

  const hash = await bcrypt.hash(password, 10);

  await pool.query(
    "UPDATE Usuario SET password_hash = ? WHERE email = ?",
    [hash, row.email]
  );

  await pool.query("DELETE FROM ResetPasswordToken WHERE token = ?", [token]);

  return NextResponse.json({ ok: true });
}
