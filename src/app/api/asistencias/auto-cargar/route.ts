import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { pool } from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";

// POST - Auto-cargar asistencias como presente para días pasados (lunes a sábado)
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { id_empleado, fecha_desde, fecha_hasta } = body;

    // Si no se especifica empleado, cargar para todos los empleados activos
    // Si no se especifica fecha_desde, usar inicio del mes actual
    // Si no se especifica fecha_hasta, usar ayer

    const connection = await pool.getConnection();
    try {
      // Obtener empleados
      let empleadosQuery = "SELECT id_empleado FROM empleado WHERE activo = 1";
      const empleadosParams: number[] = [];
      
      if (id_empleado) {
        empleadosQuery += " AND id_empleado = ?";
        empleadosParams.push(parseInt(id_empleado));
      }

      const [empleados] = await connection.query<RowDataPacket[]>(empleadosQuery, empleadosParams);

      if (empleados.length === 0) {
        return NextResponse.json(
          { error: "No hay empleados activos" },
          { status: 400 }
        );
      }

      // Calcular rango de fechas
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      
      let desde: Date;
      let hasta: Date;

      if (fecha_desde) {
        desde = new Date(fecha_desde);
      } else {
        // Inicio del mes actual
        desde = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      }

      if (fecha_hasta) {
        hasta = new Date(fecha_hasta);
      } else {
        // Ayer
        hasta = new Date(hoy);
        hasta.setDate(hasta.getDate() - 1);
      }

      // No permitir fechas futuras más allá de hoy
      if (hasta > hoy) {
        hasta = new Date(hoy);
      }

      let registrosCreados = 0;
      let registrosExistentes = 0;

      await connection.beginTransaction();

      for (const emp of empleados) {
        const currentDate = new Date(desde);

        while (currentDate <= hasta) {
          const diaSemana = currentDate.getDay();
          
          // Solo lunes (1) a viernes (5), excluir sábado (6) y domingo (0)
          if (diaSemana >= 1 && diaSemana <= 5) {
            // Usar formato local para evitar problemas de zona horaria
            const year = currentDate.getFullYear();
            const month = String(currentDate.getMonth() + 1).padStart(2, '0');
            const day = String(currentDate.getDate()).padStart(2, '0');
            const fechaStr = `${year}-${month}-${day}`;

            try {
              // Intentar insertar solo si no existe
              const [result] = await connection.query<ResultSetHeader>(
                `INSERT IGNORE INTO asistencia (id_empleado, fecha, presente, es_sabado, horas_extra, justificada, motivo)
                 VALUES (?, ?, 1, 0, 0, NULL, NULL)`,
                [emp.id_empleado, fechaStr]
              );

              if (result.affectedRows > 0) {
                registrosCreados++;
              } else {
                registrosExistentes++;
              }
            } catch {
              // Si ya existe, continuar
              registrosExistentes++;
            }
          }

          currentDate.setDate(currentDate.getDate() + 1);
        }
      }

      await connection.commit();

      // Formatear fechas para respuesta
      const formatFecha = (date: Date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
      };

      return NextResponse.json({
        mensaje: `Asistencias cargadas exitosamente`,
        registros_creados: registrosCreados,
        registros_existentes: registrosExistentes,
        empleados_procesados: empleados.length,
        periodo: {
          desde: formatFecha(desde),
          hasta: formatFecha(hasta)
        }
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error al auto-cargar asistencias:", error);
    return NextResponse.json(
      { error: "Error al auto-cargar asistencias" },
      { status: 500 }
    );
  }
}
