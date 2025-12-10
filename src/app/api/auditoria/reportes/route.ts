import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function GET() {
  try {
    const conn = await pool.getConnection();

    // 1. Sesiones por usuario (top 10)
    const [sesionesPorUsuario] = await conn.query<RowDataPacket[]>(`
      SELECT 
        u.nombre,
        u.apellido,
        COUNT(a.id) as total_sesiones,
        COALESCE(SUM(TIMESTAMPDIFF(MINUTE, a.fecha_hora_login, a.fecha_hora_logout)), 0) as tiempo_total
      FROM AuditoriaSesion a
      JOIN Usuario u ON a.id_usuario = u.id_usuario
      GROUP BY a.id_usuario, u.nombre, u.apellido
      ORDER BY total_sesiones DESC
      LIMIT 10
    `);

    // 2. Sesiones por día (últimos 30 días)
    const [sesionesPorDia] = await conn.query<RowDataPacket[]>(`
      SELECT 
        DATE(fecha_hora_login) as fecha,
        COUNT(*) as sesiones
      FROM AuditoriaSesion
      WHERE fecha_hora_login >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY DATE(fecha_hora_login)
      ORDER BY fecha ASC
    `);

    // 3. Sesiones por hora del día
    const [sesionesPorHora] = await conn.query<RowDataPacket[]>(`
      SELECT 
        HOUR(fecha_hora_login) as hora,
        COUNT(*) as sesiones
      FROM AuditoriaSesion
      GROUP BY HOUR(fecha_hora_login)
      ORDER BY hora ASC
    `);

    // 4. Duración promedio de sesiones por usuario (top 10)
    const [duracionPromedio] = await conn.query<RowDataPacket[]>(`
      SELECT 
        CONCAT(u.nombre, ' ', u.apellido) as usuario,
        ROUND(AVG(TIMESTAMPDIFF(MINUTE, a.fecha_hora_login, a.fecha_hora_logout)), 1) as duracion_promedio
      FROM AuditoriaSesion a
      JOIN Usuario u ON a.id_usuario = u.id_usuario
      WHERE a.fecha_hora_logout IS NOT NULL
      GROUP BY a.id_usuario, u.nombre, u.apellido
      ORDER BY duracion_promedio DESC
      LIMIT 10
    `);

    // 5. Acciones de trazabilidad por tipo
    const [accionesPorTipo] = await conn.query<RowDataPacket[]>(`
      SELECT 
        accion,
        COUNT(*) as cantidad
      FROM AuditoriaTrazabilidad
      GROUP BY accion
    `);

    // 6. Trazabilidad por día (últimos 30 días)
    const [trazabilidadPorDia] = await conn.query<RowDataPacket[]>(`
      SELECT 
        DATE(fecha_hora) as fecha,
        COUNT(*) as operaciones
      FROM AuditoriaTrazabilidad
      WHERE fecha_hora >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY DATE(fecha_hora)
      ORDER BY fecha ASC
    `);

    // 7. Operaciones por usuario (top 10)
    const [operacionesPorUsuario] = await conn.query<RowDataPacket[]>(`
      SELECT 
        COALESCE(CONCAT(u.nombre, ' ', u.apellido), 'Sistema') as usuario,
        COUNT(*) as operaciones
      FROM AuditoriaTrazabilidad a
      LEFT JOIN Usuario u ON a.id_usuario = u.id_usuario
      GROUP BY a.id_usuario, u.nombre, u.apellido
      ORDER BY operaciones DESC
      LIMIT 10
    `);

    // 8. Acciones por tabla afectada
    const [accionesPorTabla] = await conn.query<RowDataPacket[]>(`
      SELECT 
        tabla_afectada,
        COUNT(*) as operaciones
      FROM AuditoriaTrazabilidad
      GROUP BY tabla_afectada
      ORDER BY operaciones DESC
    `);

    // 9. Actividad por hora del día (trazabilidad)
    const [actividadPorHora] = await conn.query<RowDataPacket[]>(`
      SELECT 
        HOUR(fecha_hora) as hora,
        COUNT(*) as operaciones
      FROM AuditoriaTrazabilidad
      GROUP BY HOUR(fecha_hora)
      ORDER BY hora ASC
    `);

    // 10. Tendencia semanal (últimas 12 semanas)
    const [tendenciaSemanal] = await conn.query<RowDataPacket[]>(`
      SELECT 
        YEARWEEK(fecha_hora, 1) as semana,
        COUNT(*) as operaciones
      FROM AuditoriaTrazabilidad
      WHERE fecha_hora >= DATE_SUB(CURDATE(), INTERVAL 12 WEEK)
      GROUP BY YEARWEEK(fecha_hora, 1)
      ORDER BY semana ASC
    `);

    // 11. Estadísticas generales
    const [statsGenerales] = await conn.query<RowDataPacket[]>(`
      SELECT
        (SELECT COUNT(*) FROM AuditoriaSesion) as total_sesiones,
        (SELECT COUNT(DISTINCT id_usuario) FROM AuditoriaSesion) as usuarios_activos,
        (SELECT COALESCE(ROUND(AVG(TIMESTAMPDIFF(MINUTE, fecha_hora_login, fecha_hora_logout)), 1), 0) FROM AuditoriaSesion WHERE fecha_hora_logout IS NOT NULL) as duracion_promedio,
        (SELECT COUNT(*) FROM AuditoriaTrazabilidad) as total_operaciones,
        (SELECT COUNT(*) FROM AuditoriaTrazabilidad WHERE accion = 'INSERT') as total_inserts,
        (SELECT COUNT(*) FROM AuditoriaTrazabilidad WHERE accion = 'UPDATE') as total_updates,
        (SELECT COUNT(*) FROM AuditoriaTrazabilidad WHERE accion = 'DELETE') as total_deletes
    `);

    conn.release();

    return NextResponse.json({
      sesiones: {
        porUsuario: sesionesPorUsuario,
        porDia: sesionesPorDia,
        porHora: sesionesPorHora,
        duracionPromedio: duracionPromedio,
      },
      trazabilidad: {
        porTipo: accionesPorTipo,
        porDia: trazabilidadPorDia,
        porUsuario: operacionesPorUsuario,
        porTabla: accionesPorTabla,
        porHora: actividadPorHora,
        tendenciaSemanal: tendenciaSemanal,
      },
      estadisticas: statsGenerales[0] || {},
    });
  } catch (error) {
    console.error("Error al obtener reportes:", error);
    return NextResponse.json(
      { error: "Error al obtener reportes de auditoría" },
      { status: 500 }
    );
  }
}
