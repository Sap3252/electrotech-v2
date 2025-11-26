import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { pool } from "./db";
import { RowDataPacket } from "mysql2";

const SECRET = process.env.JWT_SECRET!;

// ===========================
//  CREAR TOKEN
// ===========================
export function createToken(payload: { 
  id_usuario: number; 
  email: string;
  grupos: string[];
  idAuditoria: number;
  [k: string]: string | number | boolean | string[];
}) {
  return jwt.sign(payload, SECRET, { expiresIn: "8h" });
}

// ===========================
//  GUARDAR SESIÓN EN COOKIE
// ===========================
export async function setSession(token: string) {
  const cookieStore = await cookies();
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 horas (igual que el token JWT)
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
    const decoded = jwt.verify(token, SECRET) as { id_usuario: number };

    // ⚠️ IMPORTANTE:
    // el token debe tener al menos { id_usuario: number }
    // cuando lo crees en el login usá: createToken({ id_usuario: usuario.id_usuario, ... })

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT g.nombre 
       FROM GrupoUsuario gu
       JOIN Grupo g ON g.id_grupo = gu.id_grupo
       WHERE gu.id_usuario = ?`,
      [decoded.id_usuario]
    );

    const grupos = rows.map((r) => r.nombre as string);

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
//  VERIFICAR PERTENENCIA A GRUPO
// ===========================

export function hasGroup(session: SessionData | null, groupName: string): boolean {
  if (!session) return false;
  return session.grupos.includes(groupName);
}

// ===========================
//  VERIFICAR SI ES ADMINISTRADOR
// ===========================

export function isAdmin(session: SessionData | null): boolean {
  return hasGroup(session, "Admin");
}

// ===========================
//  VERIFICAR PERMISO A COMPONENTE (RBAC)
// ===========================

export async function hasPermission(
  session: SessionData | null,
  componenteId: number
): Promise<boolean> {
  if (!session) return false;
  
  // Admin siempre tiene acceso
  if (isAdmin(session)) return true;

  try {
    // Verificar si alguno de los grupos del usuario tiene acceso al componente
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as count
       FROM GrupoComponente gc
       JOIN GrupoUsuario gu ON gu.id_grupo = gc.id_grupo
       WHERE gu.id_usuario = ? AND gc.id_componente = ?`,
      [session.id_usuario, componenteId]
    );

    return rows[0].count > 0;
  } catch (error) {
    console.error("Error verificando permiso:", error);
    return false;
  }
}

// ======================================
//  VERIFICAR PERMISO A FORMULARIO (RBAC)
// ======================================

export async function hasFormularioAccess(
  session: SessionData | null,
  formularioRuta: string
): Promise<boolean> {
  if (!session) return false;
  
  // Admin siempre tiene acceso
  if (isAdmin(session)) {
    console.log(`[hasFormularioAccess] Usuario ${session.id_usuario} es Admin - Acceso permitido a ${formularioRuta}`);
    return true;
  }

  try {
    // Verificar si el usuario tiene acceso a componentes del formulario
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(DISTINCT gc.id_componente) as count
       FROM GrupoComponente gc
       JOIN GrupoUsuario gu ON gu.id_grupo = gc.id_grupo
       JOIN Componente c ON c.id_componente = gc.id_componente
       JOIN Formulario f ON f.id_formulario = c.id_formulario
       WHERE gu.id_usuario = ? AND f.ruta = ?`,
      [session.id_usuario, formularioRuta]
    );

    const tieneAcceso = rows[0].count > 0;
    console.log(`[hasFormularioAccess] Usuario ${session.id_usuario} (${session.grupos.join(',')}) - Ruta: ${formularioRuta} - Componentes: ${rows[0].count} - Acceso: ${tieneAcceso}`);
    
    return tieneAcceso;
  } catch (error) {
    console.error("Error verificando acceso a formulario:", error);
    return false;
  }
}

// ==============================
//OBTENER FORMULARIOS ACCESIBLES
// ==============================

interface FormularioAccesible {
  id_modulo: number;
  modulo: string;
  modulo_icono: string;
  modulo_orden: number;
  id_formulario: number;
  formulario: string;
  ruta: string;
  formulario_orden: number;
}

export async function getAccesibleFormularios(
  session: SessionData | null
): Promise<FormularioAccesible[]> {
  if (!session) return [];

  try {
    const [formularios] = await pool.query<RowDataPacket[]>(
      `SELECT DISTINCT 
         m.id_modulo,
         m.nombre as modulo,
         m.icono as modulo_icono,
         m.orden as modulo_orden,
         f.id_formulario,
         f.nombre as formulario,
         f.ruta,
         f.descripcion,
         f.orden as formulario_orden
       FROM GrupoComponente gc
       JOIN GrupoUsuario gu ON gu.id_grupo = gc.id_grupo
       JOIN Componente c ON c.id_componente = gc.id_componente
       JOIN Formulario f ON f.id_formulario = c.id_formulario
       JOIN Modulo m ON m.id_modulo = f.id_modulo
       WHERE gu.id_usuario = ? AND f.activo = TRUE AND m.activo = TRUE
       ORDER BY m.orden, f.orden`,
      [session.id_usuario]
    );

    return formularios as FormularioAccesible[];
  } catch (error) {
    console.error("Error obteniendo formularios accesibles:", error);
    return [];
  }
}
