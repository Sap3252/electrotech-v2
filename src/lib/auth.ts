import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET!;

// Crear token
export function createToken(payload: any) {
  return jwt.sign(payload, SECRET, { expiresIn: "8h" });
}

// Guardar cookie de sesión (Next.js 14)
export async function setSession(token: string) {
  const cookieStore = await cookies();
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
  });
}

// Borrar cookie de sesión
export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}
