import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getSession, hasPermission } from "@/lib/auth";
import { RowDataPacket } from "mysql2";

// GET: Obtener reportes de cabinas
export async function GET(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const tipo = searchParams.get("tipo") || "uso-cabinas";
  const fechaDesde = searchParams.get("fechaDesde");
  const fechaHasta = searchParams.get("fechaHasta");

  try {
    let result;

    switch (tipo) {
      case "uso-cabinas":
        // Reporte de uso de cabinas (piezas pintadas por cabina)
        result = await getUsoCabinas(fechaDesde, fechaHasta);
        break;

      case "mantenimiento-pistolas":
        // Estado de mantenimiento de pistolas
        result = await getMantenimientoPistolas();
        break;

      case "mantenimiento-hornos":
        // Estado de mantenimiento de hornos
        result = await getMantenimientoHornos();
        break;

      case "consumo-gas":
        // Consumo de gas por horno
        result = await getConsumoGas(fechaDesde, fechaHasta);
        break;

      case "productividad-diaria":
        // Productividad diaria por cabina
        result = await getProductividadDiaria(fechaDesde, fechaHasta);
        break;

      default:
        return NextResponse.json({ error: "Tipo de reporte no válido" }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error en reporte de cabinas:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// Uso de cabinas - Total de piezas pintadas por cabina
async function getUsoCabinas(fechaDesde: string | null, fechaHasta: string | null) {
  let query = `
    SELECT 
      c.id_cabina,
      c.nombre AS cabina,
      c.estado,
      c.max_piezas_diarias,
      COUNT(ch.id_historial) AS total_registros,
      COALESCE(SUM(ch.piezas_pintadas), 0) AS total_piezas,
      COALESCE(SUM(ch.horas_trabajo), 0) AS total_horas,
      COALESCE(SUM(ch.gas_consumido), 0) AS total_gas,
      ROUND(AVG(ch.piezas_pintadas), 1) AS promedio_piezas_dia
    FROM cabina c
    LEFT JOIN cabinahistorial ch ON c.id_cabina = ch.id_cabina
  `;

  const params: any[] = [];
  const conditions: string[] = [];

  if (fechaDesde) {
    conditions.push("ch.fecha >= ?");
    params.push(fechaDesde);
  }
  if (fechaHasta) {
    conditions.push("ch.fecha <= ?");
    params.push(fechaHasta);
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  query += " GROUP BY c.id_cabina ORDER BY total_piezas DESC";

  const [rows] = await pool.query<RowDataPacket[]>(query, params);
  return rows;
}

// Estado de mantenimiento de pistolas
async function getMantenimientoPistolas() {
  const [rows] = await pool.query<RowDataPacket[]>(`
    SELECT 
      p.id_pistola,
      p.nombre,
      p.estado,
      p.horas_uso,
      p.horas_mantenimiento,
      ROUND((p.horas_uso / p.horas_mantenimiento) * 100, 1) AS porcentaje_uso,
      p.ultimo_mantenimiento,
      DATEDIFF(CURDATE(), p.ultimo_mantenimiento) AS dias_desde_mantenimiento,
      CASE 
        WHEN p.horas_uso >= p.horas_mantenimiento THEN 'URGENTE'
        WHEN p.horas_uso >= p.horas_mantenimiento * 0.9 THEN 'PRONTO'
        WHEN p.horas_uso >= p.horas_mantenimiento * 0.8 THEN 'PROGRAMAR'
        ELSE 'OK'
      END AS alerta,
      GROUP_CONCAT(DISTINCT cab.nombre ORDER BY cab.nombre SEPARATOR ', ') AS cabinas_asignadas
    FROM pistola p
    LEFT JOIN cabinapistola cp ON p.id_pistola = cp.id_pistola AND cp.activa = TRUE
    LEFT JOIN cabina cab ON cp.id_cabina = cab.id_cabina
    GROUP BY p.id_pistola
    ORDER BY porcentaje_uso DESC
  `);
  return rows;
}

// Estado de mantenimiento de hornos
async function getMantenimientoHornos() {
  const [rows] = await pool.query<RowDataPacket[]>(`
    SELECT 
      h.id_horno,
      h.nombre,
      h.estado,
      h.horas_uso,
      h.horas_mantenimiento,
      h.temperatura_max,
      h.gasto_gas_hora,
      ROUND((h.horas_uso / h.horas_mantenimiento) * 100, 1) AS porcentaje_uso,
      h.ultimo_mantenimiento,
      DATEDIFF(CURDATE(), h.ultimo_mantenimiento) AS dias_desde_mantenimiento,
      CASE 
        WHEN h.horas_uso >= h.horas_mantenimiento THEN 'URGENTE'
        WHEN h.horas_uso >= h.horas_mantenimiento * 0.9 THEN 'PRONTO'
        WHEN h.horas_uso >= h.horas_mantenimiento * 0.8 THEN 'PROGRAMAR'
        ELSE 'OK'
      END AS alerta,
      GROUP_CONCAT(DISTINCT cab.nombre ORDER BY cab.nombre SEPARATOR ', ') AS cabinas_asignadas
    FROM horno h
    LEFT JOIN cabinahorno ch ON h.id_horno = ch.id_horno AND ch.activo = TRUE
    LEFT JOIN cabina cab ON ch.id_cabina = cab.id_cabina
    GROUP BY h.id_horno
    ORDER BY porcentaje_uso DESC
  `);
  return rows;
}

// Consumo de gas por horno
async function getConsumoGas(fechaDesde: string | null, fechaHasta: string | null) {
  let query = `
    SELECT 
      h.id_horno,
      h.nombre AS horno,
      h.gasto_gas_hora,
      COALESCE(SUM(ch.gas_consumido), 0) AS total_gas_consumido,
      COALESCE(SUM(ch.horas_trabajo), 0) AS total_horas,
      COUNT(DISTINCT ch.fecha) AS dias_trabajados
    FROM horno h
    LEFT JOIN cabinahorno cab_h ON h.id_horno = cab_h.id_horno AND cab_h.activo = TRUE
    LEFT JOIN cabinahistorial ch ON cab_h.id_cabina = ch.id_cabina
  `;

  const params: any[] = [];
  const conditions: string[] = [];

  if (fechaDesde) {
    conditions.push("ch.fecha >= ?");
    params.push(fechaDesde);
  }
  if (fechaHasta) {
    conditions.push("ch.fecha <= ?");
    params.push(fechaHasta);
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  query += " GROUP BY h.id_horno ORDER BY total_gas_consumido DESC";

  const [rows] = await pool.query<RowDataPacket[]>(query, params);
  return rows;
}

// Productividad diaria por cabina
async function getProductividadDiaria(fechaDesde: string | null, fechaHasta: string | null) {
  let query = `
    SELECT 
      ch.fecha,
      c.nombre AS cabina,
      SUM(ch.piezas_pintadas) AS piezas_dia,
      SUM(ch.horas_trabajo) AS horas_dia,
      SUM(ch.gas_consumido) AS gas_dia,
      c.max_piezas_diarias,
      ROUND((SUM(ch.piezas_pintadas) / c.max_piezas_diarias) * 100, 1) AS porcentaje_capacidad
    FROM cabinahistorial ch
    JOIN cabina c ON ch.id_cabina = c.id_cabina
  `;

  const params: any[] = [];
  const conditions: string[] = [];

  if (fechaDesde) {
    conditions.push("ch.fecha >= ?");
    params.push(fechaDesde);
  }
  if (fechaHasta) {
    conditions.push("ch.fecha <= ?");
    params.push(fechaHasta);
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  query += " GROUP BY ch.fecha, c.id_cabina ORDER BY ch.fecha DESC, piezas_dia DESC";

  const [rows] = await pool.query<RowDataPacket[]>(query, params);
  return rows;
}
