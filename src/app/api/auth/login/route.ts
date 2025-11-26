import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import bcrypt from "bcryptjs";
import { createToken, setSession } from "@/lib/auth";
import { AuditoriaSesion } from "@/domain/auditoriaSesion";
import { RowDataPacket } from "mysql2";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  // 1. Buscar usuario
  const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM Usuario WHERE email = ?", [
    email,
  ]);

  const user = rows[0];
  if (!user) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 401 });
  }

  // 2. Comparar contraseñas
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
  }

  // 3. OBTENER GRUPOS DEL USUARIO (CLAVE DEL SISTEMA)
  const [gruposRows] = await pool.query<RowDataPacket[]>(
    `SELECT g.nombre 
     FROM GrupoUsuario gu
     JOIN Grupo g ON g.id_grupo = gu.id_grupo
     WHERE gu.id_usuario = ?`,
    [user.id_usuario]
  );

  const grupos = gruposRows.map((g) => g.nombre as string);

  // 4. Registrar login en auditoría
  const idAuditoria = await AuditoriaSesion.registrarLogin(user.id_usuario);

  // 5. Crear token con grupos incluidos
  const token = createToken({
    id_usuario: user.id_usuario,
    email: user.email,
    grupos,
    idAuditoria,
  });

  // 6. Guardar cookie de sesión
  await setSession(token);

  return NextResponse.json({ ok: true });
}
