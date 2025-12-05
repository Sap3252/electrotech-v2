import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { pool } from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";

// Constantes de configuración
const PORCENTAJE_PRESENTISMO = 0.09; // 9%
const MAX_FALTAS_JUSTIFICADAS = 3;
const MULTIPLICADOR_HORA_EXTRA = 1.5;
const MULTIPLICADOR_HORA_EXTRA_SABADO = 2.0; // 50% adicional

// GET - Listar recibos de sueldo
export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id_empleado = searchParams.get("id_empleado");
    const mes = searchParams.get("mes");
    const anio = searchParams.get("anio");
    const quincena = searchParams.get("quincena");

    const connection = await pool.getConnection();
    try {
      let query = `
        SELECT 
          r.*,
          e.nombre,
          e.apellido,
          e.dni,
          e.funcion
        FROM recibo_sueldo r
        JOIN empleado e ON e.id_empleado = r.id_empleado
        WHERE 1=1
      `;
      const params: (string | number)[] = [];

      if (id_empleado && id_empleado !== "all") {
        query += " AND r.id_empleado = ?";
        params.push(parseInt(id_empleado));
      }

      if (mes && mes !== "all") {
        query += " AND r.periodo_mes = ?";
        params.push(parseInt(mes));
      }

      if (anio && anio !== "all") {
        query += " AND r.periodo_anio = ?";
        params.push(parseInt(anio));
      }

      if (quincena && quincena !== "all") {
        query += " AND r.periodo_quincena = ?";
        params.push(parseInt(quincena));
      }

      query += " ORDER BY r.periodo_anio DESC, r.periodo_mes DESC, r.periodo_quincena DESC, e.apellido";

      const [recibos] = await connection.query<RowDataPacket[]>(query, params);

      return NextResponse.json(recibos);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error al obtener recibos:", error);
    return NextResponse.json(
      { error: "Error al obtener recibos" },
      { status: 500 }
    );
  }
}

// POST - Generar recibo de sueldo
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { id_empleado, mes, anio, quincena, bonificaciones = 0, otros_descuentos = 0, observaciones } = body;

    // Validaciones
    if (!id_empleado || !mes || !anio || !quincena) {
      return NextResponse.json(
        { error: "Empleado, mes, año y quincena son requeridos" },
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
      // Verificar que el empleado existe
      const [empleados] = await connection.query<RowDataPacket[]>(
        "SELECT id_empleado, nombre, apellido, salario_base FROM empleado WHERE id_empleado = ? AND activo = 1",
        [id_empleado]
      );

      if (empleados.length === 0) {
        return NextResponse.json(
          { error: "Empleado no encontrado o inactivo" },
          { status: 404 }
        );
      }

      const empleado = empleados[0];
      const salarioBase = parseFloat(empleado.salario_base);

      // Calcular fechas del período
      let fechaDesde: string;
      let fechaHasta: string;

      if (quincena === 1) {
        fechaDesde = `${anio}-${String(mes).padStart(2, '0')}-01`;
        fechaHasta = `${anio}-${String(mes).padStart(2, '0')}-15`;
      } else {
        fechaDesde = `${anio}-${String(mes).padStart(2, '0')}-16`;
        // Último día del mes
        const ultimoDia = new Date(anio, mes, 0).getDate();
        fechaHasta = `${anio}-${String(mes).padStart(2, '0')}-${ultimoDia}`;
      }

      // Verificar si ya existe el recibo
      const [reciboExistente] = await connection.query<RowDataPacket[]>(
        `SELECT id_recibo FROM recibo_sueldo 
         WHERE id_empleado = ? AND periodo_quincena = ? AND periodo_mes = ? AND periodo_anio = ?`,
        [id_empleado, quincena, mes, anio]
      );

      if (reciboExistente.length > 0) {
        return NextResponse.json(
          { error: "Ya existe un recibo para este período" },
          { status: 400 }
        );
      }

      // Obtener asistencias del período
      const [asistencias] = await connection.query<RowDataPacket[]>(
        `SELECT 
          presente,
          es_sabado,
          horas_extra,
          justificada
        FROM asistencia
        WHERE id_empleado = ? AND fecha BETWEEN ? AND ?`,
        [id_empleado, fechaDesde, fechaHasta]
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

      // Calcular valor hora (salario quincenal / 15 días / 8 horas)
      const valorHora = salarioBase / 15 / 8;

      // Calcular monto de horas extra
      const montoHorasExtraNormales = totalHorasExtra * valorHora * MULTIPLICADOR_HORA_EXTRA;
      const montoHorasExtraSabado = horasExtraSabado * valorHora * MULTIPLICADOR_HORA_EXTRA_SABADO;
      const montoHorasExtra = montoHorasExtraNormales + montoHorasExtraSabado;

      // Calcular presentismo
      // Se pierde con 1 falta injustificada o más de 3 justificadas
      let presentismo = 0;
      if (ausenciasInjustificadas === 0 && ausenciasJustificadas <= MAX_FALTAS_JUSTIFICADAS) {
        presentismo = salarioBase * PORCENTAJE_PRESENTISMO;
      }

      // Calcular descuentos por ausencias injustificadas
      // Cada día ausente = 1/15 del salario quincenal
      const descuentoPorDia = salarioBase / 15;
      const descuentoAusencias = ausenciasInjustificadas * descuentoPorDia;

      // Calcular totales
      const totalHaberes = salarioBase + presentismo + montoHorasExtra + bonificaciones;
      const totalDescuentos = descuentoAusencias + otros_descuentos;
      const totalNeto = totalHaberes - totalDescuentos;

      // Insertar recibo
      const [resultado] = await connection.query<ResultSetHeader>(
        `INSERT INTO recibo_sueldo (
          id_empleado, periodo_quincena, periodo_mes, periodo_anio,
          fecha_desde, fecha_hasta,
          salario_base, presentismo, horas_extra_monto, bonificaciones,
          descuento_ausencias, otros_descuentos,
          total_haberes, total_descuentos, total_neto,
          dias_trabajados, dias_ausentes_justificados, dias_ausentes_injustificados,
          total_horas_extra, observaciones
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id_empleado, quincena, mes, anio,
          fechaDesde, fechaHasta,
          salarioBase, presentismo, montoHorasExtra, bonificaciones,
          descuentoAusencias, otros_descuentos,
          totalHaberes, totalDescuentos, totalNeto,
          diasTrabajados, ausenciasJustificadas, ausenciasInjustificadas,
          totalHorasExtra + horasExtraSabado, observaciones || null
        ]
      );

      return NextResponse.json({
        id_recibo: resultado.insertId,
        mensaje: "Recibo generado exitosamente",
        resumen: {
          salario_base: salarioBase,
          presentismo,
          horas_extra_monto: montoHorasExtra,
          bonificaciones,
          descuento_ausencias: descuentoAusencias,
          otros_descuentos,
          total_haberes: totalHaberes,
          total_descuentos: totalDescuentos,
          total_neto: totalNeto
        }
      }, { status: 201 });

    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error al generar recibo:", error);
    return NextResponse.json(
      { error: "Error al generar recibo" },
      { status: 500 }
    );
  }
}
