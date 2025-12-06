import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getSession, hasPermission } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSession();

  // Verificar acceso al módulo de Reportes de Maquinarias (ID 108 - Acceso Reportes Maquinarias)
  if (!session || !(await hasPermission(session, 108))) {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  try {
    const tipo = req.nextUrl.searchParams.get("tipo");
    const fechaDesde = req.nextUrl.searchParams.get("fechaDesde");
    const fechaHasta = req.nextUrl.searchParams.get("fechaHasta");

    let query = "";
    const params: any[] = [];

    if (tipo === "uso-cabinas") {
      query = `
        SELECT 
          c.id_cabina,
          c.nombre AS cabina,
          c.estado,
          COALESCE(SUM(ch.piezas_pintadas), 0) AS total_piezas,
          COALESCE(SUM(ch.horas_trabajo), 0) AS total_horas,
          COALESCE(SUM(ch.gas_consumido), 0) AS total_gas,
          COALESCE(AVG(ch.piezas_pintadas), 0) AS promedio_piezas_dia,
          COALESCE(MAX(ch.piezas_pintadas), 0) AS max_piezas_diarias
        FROM cabina c
        LEFT JOIN cabinahistorial ch ON c.id_cabina = ch.id_cabina
      `;

      if (fechaDesde || fechaHasta) {
        query += " WHERE 1=1 ";
        if (fechaDesde) {
          query += " AND DATE(ch.fecha) >= ? ";
          params.push(fechaDesde);
        }
        if (fechaHasta) {
          query += " AND DATE(ch.fecha) <= ? ";
          params.push(fechaHasta);
        }
      }

      query += " GROUP BY c.id_cabina ORDER BY c.nombre";
    } else if (tipo === "mantenimiento-pistolas") {
      query = `
        SELECT 
          p.id_pistola,
          p.nombre,
          p.estado,
          COALESCE(p.horas_uso, 0) AS horas_uso,
          COALESCE(p.horas_mantenimiento, 0) AS horas_mantenimiento,
          COALESCE(ROUND((p.horas_uso / NULLIF(p.horas_mantenimiento, 0)) * 100, 1), 0) AS porcentaje_uso,
          p.ultimo_mantenimiento,
          CASE 
            WHEN p.horas_uso IS NULL OR p.horas_mantenimiento IS NULL THEN 'OK'
            WHEN (p.horas_uso / p.horas_mantenimiento) >= 0.9 THEN 'URGENTE'
            WHEN (p.horas_uso / p.horas_mantenimiento) >= 0.75 THEN 'PRONTO'
            WHEN (p.horas_uso / p.horas_mantenimiento) >= 0.5 THEN 'PROGRAMAR'
            ELSE 'OK'
          END AS alerta,
          GROUP_CONCAT(DISTINCT c.nombre SEPARATOR ', ') AS cabinas
        FROM pistola p
        LEFT JOIN cabinapistola cp ON p.id_pistola = cp.id_pistola
        LEFT JOIN cabina c ON cp.id_cabina = c.id_cabina
        GROUP BY p.id_pistola
        ORDER BY porcentaje_uso DESC, p.nombre
      `;
    } else if (tipo === "mantenimiento-hornos") {
      query = `
        SELECT 
          h.id_horno,
          h.nombre,
          h.estado,
          COALESCE(h.horas_uso, 0) AS horas_uso,
          COALESCE(h.horas_mantenimiento, 0) AS horas_mantenimiento,
          COALESCE(ROUND((h.horas_uso / NULLIF(h.horas_mantenimiento, 0)) * 100, 1), 0) AS porcentaje_uso,
          COALESCE(h.temperatura_max, 0) AS temperatura_max,
          COALESCE(h.gasto_gas_hora, 0) AS gasto_gas_hora,
          CASE 
            WHEN h.horas_uso IS NULL OR h.horas_mantenimiento IS NULL THEN 'OK'
            WHEN (h.horas_uso / h.horas_mantenimiento) >= 0.9 THEN 'URGENTE'
            WHEN (h.horas_uso / h.horas_mantenimiento) >= 0.75 THEN 'PRONTO'
            WHEN (h.horas_uso / h.horas_mantenimiento) >= 0.5 THEN 'PROGRAMAR'
            ELSE 'OK'
          END AS alerta,
          GROUP_CONCAT(DISTINCT c.nombre SEPARATOR ', ') AS cabinas
        FROM horno h
        LEFT JOIN cabinahorno ch ON h.id_horno = ch.id_horno
        LEFT JOIN cabina c ON ch.id_cabina = c.id_cabina
        GROUP BY h.id_horno
        ORDER BY porcentaje_uso DESC, h.nombre
      `;
    } else if (tipo === "consumo-gas") {
      query = `
        SELECT 
          h.id_horno,
          h.nombre AS horno,
          COALESCE(h.gasto_gas_hora, 0) AS gasto_gas_hora,
          COALESCE(SUM(ch.gas_consumido), 0) AS total_gas_consumido,
          COALESCE(SUM(ch.horas_trabajo), 0) AS total_horas,
          COALESCE(COUNT(DISTINCT DATE(ch.fecha)), 0) AS dias_trabajados
        FROM horno h
        LEFT JOIN cabinahorno chh ON h.id_horno = chh.id_horno
        LEFT JOIN cabina c ON chh.id_cabina = c.id_cabina
        LEFT JOIN cabinahistorial ch ON c.id_cabina = ch.id_cabina
      `;

      if (fechaDesde || fechaHasta) {
        query += " WHERE 1=1 ";
        if (fechaDesde) {
          query += " AND DATE(ch.fecha) >= ? ";
          params.push(fechaDesde);
        }
        if (fechaHasta) {
          query += " AND DATE(ch.fecha) <= ? ";
          params.push(fechaHasta);
        }
      }

      query += " GROUP BY h.id_horno ORDER BY total_gas_consumido DESC";
    } else if (tipo === "productividad-diaria") {
      query = `
        SELECT 
          ch.fecha,
          c.id_cabina,
          c.nombre AS cabina,
          COALESCE(SUM(ch.piezas_pintadas), 0) AS piezas_dia,
          COALESCE(SUM(ch.horas_trabajo), 0) AS horas_dia,
          COALESCE(SUM(ch.gas_consumido), 0) AS gas_dia
        FROM cabinahistorial ch
        JOIN cabina c ON ch.id_cabina = c.id_cabina
      `;

      if (fechaDesde || fechaHasta) {
        query += " WHERE 1=1 ";
        if (fechaDesde) {
          query += " AND DATE(ch.fecha) >= ? ";
          params.push(fechaDesde);
        }
        if (fechaHasta) {
          query += " AND DATE(ch.fecha) <= ? ";
          params.push(fechaHasta);
        }
      }

      query += " GROUP BY ch.fecha, c.id_cabina ORDER BY ch.fecha DESC, c.nombre";
    } else {
      return NextResponse.json({ error: "Tipo de reporte no válido" }, { status: 400 });
    }

    const [rows]: any = await pool.query(query, params);

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error en reportes de cabinas:", error);
    return NextResponse.json(
      { error: "Error al obtener datos del reporte" },
      { status: 500 }
    );
  }
}
