import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getSession, hasPermission } from "@/lib/auth";
import { RowDataPacket } from "mysql2";

interface AuditoriaRow extends RowDataPacket {
  id_auditoria: number;
  tabla_afectada: string;
  id_registro: number;
  accion: "INSERT" | "UPDATE" | "DELETE" | "FACTURADO";
  datos_anteriores: object | null;
  datos_nuevos: object | null;
  usuario_sistema: string;
  id_usuario: number | null;
  usuario_nombre: string | null;
  usuario_apellido: string | null;
  usuario_email: string | null;
  grupo_nombre: string | null;
  fecha_hora: string;
}

// ============================
// GET: obtener registros de auditoría
// ============================
export async function GET(request: Request) {
  const session = await getSession();

  // Verificar acceso - usar permiso de admin (ID 1 o crear uno específico)
  if (!session || !(await hasPermission(session, 1))) {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const accion = searchParams.get("accion");
    const fechaDesde = searchParams.get("fechaDesde");
    const fechaHasta = searchParams.get("fechaHasta");
    const idRegistro = searchParams.get("idRegistro");
    const limit = parseInt(searchParams.get("limit") || "100");
    const offset = parseInt(searchParams.get("offset") || "0");

    let query = `
      SELECT 
        a.id_auditoria,
        a.tabla_afectada,
        a.id_registro,
        a.accion,
        a.datos_anteriores,
        a.datos_nuevos,
        a.usuario_sistema,
        a.id_usuario,
        u.nombre AS usuario_nombre,
        u.apellido AS usuario_apellido,
        u.email AS usuario_email,
        (SELECT g.nombre FROM Grupo g 
         JOIN grupousuario gu ON gu.id_grupo = g.id_grupo 
         WHERE gu.id_usuario = a.id_usuario 
         LIMIT 1) AS grupo_nombre,
        DATE_FORMAT(a.fecha_hora, '%Y-%m-%d %H:%i:%s') AS fecha_hora
      FROM AuditoriaTrazabilidad a
      LEFT JOIN Usuario u ON u.id_usuario = a.id_usuario
      WHERE 1=1
    `;

    const params: (string | number)[] = [];

    if (accion) {
      query += ` AND a.accion = ?`;
      params.push(accion);
    }

    if (fechaDesde) {
      query += ` AND DATE(a.fecha_hora) >= ?`;
      params.push(fechaDesde);
    }

    if (fechaHasta) {
      query += ` AND DATE(a.fecha_hora) <= ?`;
      params.push(fechaHasta);
    }

    if (idRegistro) {
      query += ` AND a.id_registro = ?`;
      params.push(parseInt(idRegistro));
    }

    query += ` ORDER BY a.fecha_hora DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [rows] = await pool.query<AuditoriaRow[]>(query, params);

    // También obtener el total para paginación
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM AuditoriaTrazabilidad a 
      WHERE 1=1
    `;
    const countParams: (string | number)[] = [];

    if (accion) {
      countQuery += ` AND a.accion = ?`;
      countParams.push(accion);
    }

    if (fechaDesde) {
      countQuery += ` AND DATE(a.fecha_hora) >= ?`;
      countParams.push(fechaDesde);
    }

    if (fechaHasta) {
      countQuery += ` AND DATE(a.fecha_hora) <= ?`;
      countParams.push(fechaHasta);
    }

    if (idRegistro) {
      countQuery += ` AND a.id_registro = ?`;
      countParams.push(parseInt(idRegistro));
    }

    const [countResult] = await pool.query<RowDataPacket[]>(countQuery, countParams);
    const total = (countResult[0] as { total: number }).total;

    return NextResponse.json({
      data: rows,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Error GET auditoría:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
