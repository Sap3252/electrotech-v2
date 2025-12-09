import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { pool } from "./db";
import { RowDataPacket } from "mysql2";
import { RBACCompositeBuilder } from "@/domain/rbacComposite";

const SECRET = process.env.JWT_SECRET!;

export function createToken(payload: { 
  id_usuario: number; 
  email: string;
  grupos: string[];
  idAuditoria: number;
  [k: string]: string | number | boolean | string[];
}) {
  return jwt.sign(payload, SECRET, { expiresIn: "8h" });
}

export async function setSession(token: string) {
  const cookieStore = await cookies();
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}

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

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT g.nombre 
       FROM GrupoUsuario gu
       JOIN Grupo g ON g.id_grupo = gu.id_grupo
       WHERE gu.id_usuario = ? AND g.id_estado = 1`,
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

export function hasGroup(session: SessionData | null, groupName: string): boolean {
  if (!session) return false;
  return session.grupos.includes(groupName);
}

export function isAdmin(session: SessionData | null): boolean {
  return hasGroup(session, "Admin");
}

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
  if (!session) {
    return false;
  }
  
  // Admin siempre tiene acceso (solo si está en grupo activo)
  if (isAdmin(session)) {
    return true;
  }

  try {
    // Obtener IDs de grupos activos del usuario
    const gruposIds = await RBACCompositeBuilder.getGruposActivosUsuario(session.id_usuario);
    
    if (gruposIds.length === 0) {
      return false;
    }
    
    // Usar el patrón Composite para verificar acceso a la ruta
    let tieneAcceso = await RBACCompositeBuilder.verificarAccesoRuta(formularioRuta, gruposIds);
    
    // Si no hay coincidencia exacta, permitir acceso al "padre" si existe alguna ruta hija accesible
    if (!tieneAcceso) {
      const prefix = formularioRuta.endsWith("/") ? formularioRuta : formularioRuta + "/";
      const formularios = await RBACCompositeBuilder.getFormulariosAccesiblesFormatted(gruposIds);
      tieneAcceso = formularios.some((f) => typeof f.ruta === "string" && f.ruta.startsWith(prefix));
    }

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
