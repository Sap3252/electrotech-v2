import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { pool } from "./db";
import { RowDataPacket } from "mysql2";
import { RBACCompositeBuilder } from "@/domain/rbacComposite";

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
//  VERIFICAR PERMISO A COMPONENTE (RBAC) - Usa Patrón Composite
// ===========================

export async function hasPermission(
  session: SessionData | null,
  componenteId: number
): Promise<boolean> {
  if (!session) return false;
  
  // Admin siempre tiene acceso
  if (isAdmin(session)) return true;

  try {
    // Obtener IDs de grupos activos del usuario
    const gruposIds = await RBACCompositeBuilder.getGruposActivosUsuario(session.id_usuario);
    
    // Usar el patrón Composite para verificar acceso
    return await RBACCompositeBuilder.verificarAccesoComponente(componenteId, gruposIds);
  } catch (error) {
    console.error("Error verificando permiso:", error);
    return false;
  }
}

// ======================================
//  VERIFICAR PERMISO A FORMULARIO (RBAC) - Usa Patrón Composite
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
    // Obtener IDs de grupos activos del usuario
    const gruposIds = await RBACCompositeBuilder.getGruposActivosUsuario(session.id_usuario);
    
    // Usar el patrón Composite para verificar acceso a la ruta
    let tieneAcceso = await RBACCompositeBuilder.verificarAccesoRuta(formularioRuta, gruposIds);
    
    // Si no hay coincidencia exacta, permitir acceso al "padre" si existe alguna ruta hija accesible
    if (!tieneAcceso) {
      const prefix = formularioRuta.endsWith("/") ? formularioRuta : formularioRuta + "/";
      const formularios = await RBACCompositeBuilder.getFormulariosAccesiblesFormatted(gruposIds);
      tieneAcceso = formularios.some((f) => typeof f.ruta === "string" && f.ruta.startsWith(prefix));
    }
    
    console.log(`[hasFormularioAccess] Usuario ${session.id_usuario} (${session.grupos.join(',')}) - Ruta: ${formularioRuta} - Acceso: ${tieneAcceso}`);

    return tieneAcceso;
  } catch (error) {
    console.error("Error verificando acceso a formulario:", error);
    return false;
  }
}

// ==============================
// OBTENER FORMULARIOS ACCESIBLES - Usa Patrón Composite
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
    // Obtener IDs de grupos activos del usuario
    const gruposIds = await RBACCompositeBuilder.getGruposActivosUsuario(session.id_usuario);
    
    // Usar el patrón Composite para obtener formularios accesibles
    return await RBACCompositeBuilder.getFormulariosAccesiblesFormatted(gruposIds);
  } catch (error) {
    console.error("Error obteniendo formularios accesibles:", error);
    return [];
  }
}
