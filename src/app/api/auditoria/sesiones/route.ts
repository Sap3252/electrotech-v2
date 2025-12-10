import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getSession, hasPermission } from "@/lib/auth";
import { RowDataPacket } from "mysql2";

interface SesionRow extends RowDataPacket {
  id: number;
  id_usuario: number;
  usuario_nombre: string;
  usuario_email: string;
  fecha_hora_login: string;
  fecha_hora_logout: string | null;
  duracion_minutos: number | null;
}

// ============================
// GET: obtener sesiones de usuarios
// ============================
export async function GET(request: Request) {
  const session = await getSession();

  // Verificar acceso - permiso de admin
  if (!session || !(await hasPermission(session, 1))) {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const idUsuario = searchParams.get("idUsuario");
    const fechaDesde = searchParams.get("fechaDesde");
    const fechaHasta = searchParams.get("fechaHasta");
    const limit = parseInt(searchParams.get("limit") || "100");
    const offset = parseInt(searchParams.get("offset") || "0");

    let query = `
      SELECT 
        a.id,
        a.id_usuario,
        u.nombre AS usuario_nombre,
        u.email AS usuario_email,
        DATE_FORMAT(a.fecha_hora_login, '%Y-%m-%d %H:%i:%s') AS fecha_hora_login,
        DATE_FORMAT(a.fecha_hora_logout, '%Y-%m-%d %H:%i:%s') AS fecha_hora_logout,
        CASE 
          WHEN a.fecha_hora_logout IS NOT NULL 
          THEN TIMESTAMPDIFF(MINUTE, a.fecha_hora_login, a.fecha_hora_logout)
          ELSE NULL
        END AS duracion_minutos
      FROM auditoriasesion a
      JOIN Usuario u ON u.id_usuario = a.id_usuario
      WHERE 1=1
    `;

    const params: (string | number)[] = [];

    if (idUsuario) {
      query += ` AND a.id_usuario = ?`;
      params.push(parseInt(idUsuario));
    }

    if (fechaDesde) {
      query += ` AND DATE(a.fecha_hora_login) >= ?`;
      params.push(fechaDesde);
    }

    if (fechaHasta) {
      query += ` AND DATE(a.fecha_hora_login) <= ?`;
      params.push(fechaHasta);
    }

    query += ` ORDER BY a.fecha_hora_login DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [rows] = await pool.query<SesionRow[]>(query, params);

    // Obtener total para paginación
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM auditoriasesion a 
      WHERE 1=1
    `;
    const countParams: (string | number)[] = [];

    if (idUsuario) {
      countQuery += ` AND a.id_usuario = ?`;
      countParams.push(parseInt(idUsuario));
    }

    if (fechaDesde) {
      countQuery += ` AND DATE(a.fecha_hora_login) >= ?`;
      countParams.push(fechaDesde);
    }

    if (fechaHasta) {
      countQuery += ` AND DATE(a.fecha_hora_login) <= ?`;
      countParams.push(fechaHasta);
    }

    const [countResult] = await pool.query<RowDataPacket[]>(countQuery, countParams);
    const total = (countResult[0] as { total: number }).total;

    // Estadísticas adicionales por usuario
    let statsQuery = `
      SELECT 
        COUNT(*) as total_sesiones,
        SUM(CASE WHEN fecha_hora_logout IS NOT NULL 
            THEN TIMESTAMPDIFF(MINUTE, fecha_hora_login, fecha_hora_logout) 
            ELSE 0 END) as tiempo_total_minutos
      FROM auditoriasesion
      WHERE 1=1
    `;
    const statsParams: (string | number)[] = [];

    if (idUsuario) {
      statsQuery += ` AND id_usuario = ?`;
      statsParams.push(parseInt(idUsuario));
    }

    if (fechaDesde) {
      statsQuery += ` AND DATE(fecha_hora_login) >= ?`;
      statsParams.push(fechaDesde);
    }

    if (fechaHasta) {
      statsQuery += ` AND DATE(fecha_hora_login) <= ?`;
      statsParams.push(fechaHasta);
    }

    const [statsResult] = await pool.query<RowDataPacket[]>(statsQuery, statsParams);
    const stats = statsResult[0] as { total_sesiones: number; tiempo_total_minutos: number };

    return NextResponse.json({
      data: rows,
      total,
      limit,
      offset,
      stats: {
        totalSesiones: stats.total_sesiones || 0,
        tiempoTotalMinutos: stats.tiempo_total_minutos || 0,
      },
    });
  } catch (error) {
    console.error("Error GET sesiones:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
