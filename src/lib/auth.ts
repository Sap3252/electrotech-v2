import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { pool } from "./db"; // 👈 NUEVO

const SECRET = process.env.JWT_SECRET!;

// ===========================
//  CREAR TOKEN
// ===========================
export function createToken(payload: { id_usuario: number; [k: string]: any }) {
  return jwt.sign(payload, SECRET, { expiresIn: "8h" });
}

// ===========================
//  GUARDAR SESIÓN EN COOKIE
// ===========================
export async function setSession(token: string) {
  const cookieStore = await cookies();
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
  });
}

// ===========================
//  BORRAR SESIÓN
// ===========================
export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}

// ===========================
//  LEER SESIÓN + GRUPOS
// ===========================

export type SessionData = {
  id_usuario: number;
  grupos: string[];
};

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) return null;

  try {
    const decoded: any = jwt.verify(token, SECRET);

    // ⚠️ IMPORTANTE:
    // el token debe tener al menos { id_usuario: number }
    // cuando lo crees en el login usá: createToken({ id_usuario: usuario.id_usuario, ... })

    const [rows]: any = await pool.query(
      `SELECT g.nombre 
       FROM GrupoUsuario gu
       JOIN Grupo g ON g.id_grupo = gu.id_grupo
       WHERE gu.id_usuario = ?`,
      [decoded.id_usuario]
    );

    const grupos = rows.map((r: any) => r.nombre as string);

    return {
      id_usuario: decoded.id_usuario,
      grupos,
    };
  } catch (err) {
    console.error("Error verificando sesión:", err);
    return null;
  }
}

// ===========================
//  PERMISOS POR CORE
// ===========================

const CORE_ACCESS: Record<number, string[]> = {
  1: ["Admin", "Admisión y Control"],          // Core 1 – Piezas & Pinturas
  2: ["Admin", "Contabilidad"],     // Core 2 – Facturación / Remitos 
  3: ["Admin", "Operario"],                    // Core 3 – Maquinaria
  4: ["Admin", "Recursos Humanos"],            // Core 4 – Empleados
  5: ["Admin", "Gerente"],                     // Core 5 – Reportes
};

export function hasCoreAccess(session: SessionData | null, core: number): boolean {
  if (!session) return false;
  const allowed = CORE_ACCESS[core] ?? [];
  return session.grupos.some((g) => allowed.includes(g));
}
