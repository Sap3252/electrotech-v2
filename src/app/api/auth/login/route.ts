import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import bcrypt from "bcryptjs";
import { createToken, setSession } from "@/lib/auth";
import { AuditoriaSesion } from "@/domain/auditoriaSesion";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const [rows] = await pool.query("SELECT * FROM Usuario WHERE email = ?", [
    email,
  ]);

  const user: any = (rows as any[])[0];
  if (!user) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
  }

  // REGISTRA LOGIN
  const idAuditoria = await AuditoriaSesion.registrarLogin(user.id_usuario);

  const token = createToken({
    id_usuario: user.id_usuario,
    email: user.email,
    rol: user.rol,
    idAuditoria,
  });

  await setSession(token);

  return NextResponse.json({ ok: true });
}
