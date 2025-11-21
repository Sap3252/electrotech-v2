import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, SECRET);
    
    // Devolver los datos del JWT (id_usuario, email, grupos, etc.)
    return NextResponse.json({
      id_usuario: payload.id_usuario,
      email: payload.email,
      grupos: payload.grupos || [],
      idAuditoria: payload.idAuditoria
    });
  } catch {
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }
}
