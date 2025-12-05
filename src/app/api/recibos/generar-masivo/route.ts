import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { pool } from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";

// Constantes de configuración
const PORCENTAJE_PRESENTISMO = 0.09;
const MAX_FALTAS_JUSTIFICADAS = 3;
const MULTIPLICADOR_HORA_EXTRA = 1.5;
const MULTIPLICADOR_HORA_EXTRA_SABADO = 2.0;

// POST - Generar recibos masivos para todos los empleados activos
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { mes, anio, quincena } = body;

    if (!mes || !anio || !quincena) {
      return NextResponse.json(
        { error: "Mes, año y quincena son requeridos" },
        { status: 400 }
      );
    }

    if (quincena !== 1 && quincena !== 2) {
      return NextResponse.json(
        { error: "La quincena debe ser 1 o 2" },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Obtener todos los empleados activos
      const [empleados] = await connection.query<RowDataPacket[]>(
        "SELECT id_empleado, salario_base FROM empleado WHERE activo = 1 AND salario_base > 0"
      );

      if (empleados.length === 0) {
        return NextResponse.json(
          { error: "No hay empleados activos con salario configurado" },
          { status: 400 }
        );
      }

      // Calcular fechas del período
      let fechaDesde: string;
      let fechaHasta: string;

      if (quincena === 1) {
        fechaDesde = `${anio}-${String(mes).padStart(2, '0')}-01`;
        fechaHasta = `${anio}-${String(mes).padStart(2, '0')}-15`;
      } else {
        fechaDesde = `${anio}-${String(mes).padStart(2, '0')}-16`;
        const ultimoDia = new Date(anio, mes, 0).getDate();
        fechaHasta = `${anio}-${String(mes).padStart(2, '0')}-${ultimoDia}`;
      }

      const recibosGenerados: number[] = [];
      const errores: string[] = [];

      for (const empleado of empleados) {
        try {
          // Verificar si ya existe el recibo
          const [existente] = await connection.query<RowDataPacket[]>(
            `SELECT id_recibo FROM recibo_sueldo 
             WHERE id_empleado = ? AND periodo_quincena = ? AND periodo_mes = ? AND periodo_anio = ?`,
            [empleado.id_empleado, quincena, mes, anio]
          );

          if (existente.length > 0) {
            errores.push(`Empleado ${empleado.id_empleado}: ya tiene recibo`);
            continue;
          }

          const salarioBase = parseFloat(empleado.salario_base);

          // Obtener asistencias del período
          const [asistencias] = await connection.query<RowDataPacket[]>(
            `SELECT presente, es_sabado, horas_extra, justificada
             FROM asistencia
             WHERE id_empleado = ? AND fecha BETWEEN ? AND ?`,
            [empleado.id_empleado, fechaDesde, fechaHasta]
          );

          // Calcular estadísticas
          let diasTrabajados = 0;
          let ausenciasJustificadas = 0;
          let ausenciasInjustificadas = 0;
          let totalHorasExtra = 0;
          let horasExtraSabado = 0;

          for (const a of asistencias) {
            if (a.presente) {
              diasTrabajados++;
              const horas = parseFloat(a.horas_extra || 0);
              if (a.es_sabado) {
                horasExtraSabado += horas;
              } else {
                totalHorasExtra += horas;
              }
            } else {
              if (a.justificada) {
                ausenciasJustificadas++;
              } else {
                ausenciasInjustificadas++;
              }
            }
          }

          const valorHora = salarioBase / 15 / 8;
          const montoHorasExtraNormales = totalHorasExtra * valorHora * MULTIPLICADOR_HORA_EXTRA;
          const montoHorasExtraSabado = horasExtraSabado * valorHora * MULTIPLICADOR_HORA_EXTRA_SABADO;
          const montoHorasExtra = montoHorasExtraNormales + montoHorasExtraSabado;

          let presentismo = 0;
          if (ausenciasInjustificadas === 0 && ausenciasJustificadas <= MAX_FALTAS_JUSTIFICADAS) {
            presentismo = salarioBase * PORCENTAJE_PRESENTISMO;
          }

          const descuentoPorDia = salarioBase / 15;
          const descuentoAusencias = ausenciasInjustificadas * descuentoPorDia;

          const totalHaberes = salarioBase + presentismo + montoHorasExtra;
          const totalDescuentos = descuentoAusencias;
          const totalNeto = totalHaberes - totalDescuentos;

          const [resultado] = await connection.query<ResultSetHeader>(
            `INSERT INTO recibo_sueldo (
              id_empleado, periodo_quincena, periodo_mes, periodo_anio,
              fecha_desde, fecha_hasta,
              salario_base, presentismo, horas_extra_monto, bonificaciones,
              descuento_ausencias, otros_descuentos,
              total_haberes, total_descuentos, total_neto,
              dias_trabajados, dias_ausentes_justificados, dias_ausentes_injustificados,
              total_horas_extra
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, 0, ?, ?, ?, ?, ?, ?, ?)`,
            [
              empleado.id_empleado, quincena, mes, anio,
              fechaDesde, fechaHasta,
              salarioBase, presentismo, montoHorasExtra,
              descuentoAusencias,
              totalHaberes, totalDescuentos, totalNeto,
              diasTrabajados, ausenciasJustificadas, ausenciasInjustificadas,
              totalHorasExtra + horasExtraSabado
            ]
          );

          recibosGenerados.push(resultado.insertId);
        } catch (err) {
          errores.push(`Empleado ${empleado.id_empleado}: ${(err as Error).message}`);
        }
      }

      await connection.commit();

      return NextResponse.json({
        mensaje: `${recibosGenerados.length} recibos generados exitosamente`,
        recibos_generados: recibosGenerados.length,
        errores: errores.length > 0 ? errores : undefined
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error al generar recibos masivos:", error);
    return NextResponse.json(
      { error: "Error al generar recibos masivos" },
      { status: 500 }
    );
  }
}
