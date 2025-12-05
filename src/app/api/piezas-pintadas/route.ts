import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getSession, hasPermission } from "@/lib/auth";
import { StandardPaintStrategy } from "@/domain/strategy/StandardPaintStrategy";
import { HighDensityPaintStrategy } from "@/domain/strategy/HighDensityPaintStrategy";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { getCabinaSubject, Cabina, Pistola, Horno } from "@/domain/cabinaObserver";

// ============================
// GET: obtener todas las piezas pintadas
// ============================
export async function GET() {
  const session = await getSession();

  // Verificar acceso al componente Tabla Historial Producción (ID 9)
  if (!session || !(await hasPermission(session, 9))) {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  try {
    const [rows] = await pool.query(
      `
      SELECT 
        pp.id_pieza_pintada,
        DATE_FORMAT(pp.fecha, '%Y-%m-%d %H:%i:%s') AS fecha,
        pp.cantidad,
        pp.consumo_estimado_kg,
        pp.id_cabina,
        pz.detalle AS pieza_detalle,
        pz.id_cliente AS pieza_id_cliente,
        cl.nombre AS cliente_nombre,
        m.nombre AS marca,
        c.nombre AS color,
        t.nombre AS tipo,
        cab.nombre AS cabina_nombre
      FROM PiezaPintada pp
      JOIN Pieza pz ON pz.id_pieza = pp.id_pieza
      JOIN Cliente cl ON cl.id_cliente = pz.id_cliente
      JOIN Pintura pt ON pt.id_pintura = pp.id_pintura
      JOIN Marca m ON m.id_marca = pt.id_marca
      JOIN Color c ON c.id_color = pt.id_color
      JOIN TipoPintura t ON t.id_tipo = pt.id_tipo
      LEFT JOIN cabina cab ON cab.id_cabina = pp.id_cabina
      ORDER BY pp.fecha DESC
      `
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error GET piezas pintadas:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}


// 2) A partir de acá seguís con el cálculo de consumo + INSERT


// Lock para prevenir requests duplicados simultáneos
// ============================
// POST: crear nueva pieza pintada
// ============================
export async function POST(req: Request) {
  const session = await getSession();

  // Verificar acceso al componente Formulario Registrar Produccion (ID 8)
  if (!session || !(await hasPermission(session, 8))) {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  const body = await req.json();
  const { id_pieza, id_pintura, id_cabina, cantidad, espesor_um, densidad_g_cm3, estrategia } = body;

  try {
    // 0) Validar que se seleccionó una cabina
    if (!id_cabina) {
      
      return NextResponse.json(
        { error: "Debe seleccionar una cabina para pintar" },
        { status: 400 }
      );
    }

    // 0.1) Obtener información completa de la cabina
    const [cabinaRows] = await pool.query<RowDataPacket[]>(
      `SELECT id_cabina, nombre, descripcion, max_piezas_diarias, piezas_hoy, estado, ultimo_uso
       FROM cabina
       WHERE id_cabina = ?`,
      [id_cabina]
    );

    if (!cabinaRows[0]) {
      return NextResponse.json({ error: "Cabina no encontrada" }, { status: 404 });
    }

    let cabinaData = cabinaRows[0];

    // 0.2) Reset automático: Si el último uso fue de otro día, resetear piezas_hoy
    const hoy = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const ultimoUso = cabinaData.ultimo_uso ? new Date(cabinaData.ultimo_uso).toISOString().split('T')[0] : null;
    
    if (ultimoUso && ultimoUso !== hoy) {
      // El último uso fue otro día, resetear contador
      await pool.query(
        `UPDATE cabina SET piezas_hoy = 0, ultimo_uso = CURDATE() WHERE id_cabina = ?`,
        [id_cabina]
      );
      cabinaData.piezas_hoy = 0;
      console.log(`[Reset Automático] Cabina "${cabinaData.nombre}" reseteada. Último uso: ${ultimoUso}, Hoy: ${hoy}`);
    } else if (!ultimoUso) {
      // Primera vez que se usa, establecer fecha
      await pool.query(
        `UPDATE cabina SET ultimo_uso = CURDATE() WHERE id_cabina = ?`,
        [id_cabina]
      );
    }
    
    if (cabinaData.estado !== 'activa') {
      return NextResponse.json(
        { error: `La cabina "${cabinaData.nombre}" no está activa (estado: ${cabinaData.estado})` },
        { status: 400 }
      );
    }

    // Verificar límite diario (solo warning, no bloquea)
    const piezas_restantes = cabinaData.max_piezas_diarias - Number(cabinaData.piezas_hoy);
    const excedeLimit = piezas_restantes < cantidad;
    let warningLimite: string | null = null;
    if (excedeLimit) {
      warningLimite = `Se excedió el límite recomendado. La cabina "${cabinaData.nombre}" tenía ${piezas_restantes} piezas disponibles de su límite diario (${cabinaData.max_piezas_diarias}), pero se pintaron ${cantidad}.`;
    }

    // Obtener pistolas activas de la cabina
    const [pistolasRows] = await pool.query<RowDataPacket[]>(`
      SELECT p.* 
      FROM pistola p
      INNER JOIN cabinapistola cp ON p.id_pistola = cp.id_pistola
      WHERE cp.id_cabina = ? AND cp.activa = TRUE AND p.estado = 'activa'
    `, [id_cabina]);

    if (pistolasRows.length === 0) {
      return NextResponse.json(
        { error: `La cabina "${cabinaData.nombre}" no tiene pistolas activas asignadas` },
        { status: 400 }
      );
    }

    // Obtener hornos activos de la cabina
    const [hornosRows] = await pool.query<RowDataPacket[]>(`
      SELECT h.* 
      FROM horno h
      INNER JOIN cabinahorno ch ON h.id_horno = ch.id_horno
      WHERE ch.id_cabina = ? AND ch.activo = TRUE AND h.estado = 'activo'
    `, [id_cabina]);

    if (hornosRows.length === 0) {
      return NextResponse.json(
        { error: `La cabina "${cabinaData.nombre}" no tiene hornos activos asignados` },
        { status: 400 }
      );
    }
    // 1) Verificar stock disponible
    const [stockRows] = await pool.query<RowDataPacket[]>(
      "SELECT stock_disponible FROM StockPieza WHERE id_pieza = ?",
      [id_pieza]
    );
    const stockRow = stockRows[0];
    const stockDisponible = stockRow?.stock_disponible ?? 0;

    if (stockDisponible < cantidad) {
      return NextResponse.json(
        {
          error: `No hay stock suficiente para pintar esta cantidad. Stock disponible: ${stockDisponible}`,
        },
        { status: 400 }
      );
    }

    // 2) Obtener dimensiones de la pieza
    const [piezaRows] = await pool.query<RowDataPacket[]>(
      "SELECT ancho_m, alto_m FROM Pieza WHERE id_pieza = ?",
      [id_pieza]
    );

    if (!piezaRows[0]) {
      return NextResponse.json({ error: "Pieza no encontrada" }, { status: 404 });
    }

    const pieza = piezaRows[0];

    // 3) Calcular consumo usando patron Strategy 
    const strategy = estrategia === "highdensity" 
      ? new HighDensityPaintStrategy() 
      : new StandardPaintStrategy();
    
    const consumo_por_pieza = strategy.calcularConsumo(
      pieza.ancho_m,
      pieza.alto_m,
      espesor_um,
      densidad_g_cm3
    );
    
    const consumo_total_kg = consumo_por_pieza * cantidad;

    // 4) Verificar stock de pintura disponible
    const [pinturaRows] = await pool.query<RowDataPacket[]>(
      "SELECT cantidad_kg FROM Pintura WHERE id_pintura = ?",
      [id_pintura]
    );

    if (!pinturaRows[0]) {
      return NextResponse.json({ error: "Pintura no encontrada" }, { status: 404 });
    }

    const pinturaDisponible = Number(pinturaRows[0].cantidad_kg);

    if (pinturaDisponible < consumo_total_kg) {
      return NextResponse.json(
        {
          error: `No hay suficiente pintura disponible. Disponible: ${pinturaDisponible.toFixed(2)} kg, Necesario: ${consumo_total_kg.toFixed(2)} kg`,
        },
        { status: 400 }
      );
    }

    // 5) Insertar registro en PiezaPintada y ejecutar actualizaciones relacionadas
    // Usamos una transacción con lock para evitar duplicados
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Verificar duplicados DENTRO de la transacción con lock
      const [duplicadoRows] = await conn.query<RowDataPacket[]>(
        `SELECT id_pieza_pintada FROM PiezaPintada 
         WHERE id_pieza = ? AND id_pintura = ? AND id_cabina = ? AND cantidad = ?
         AND fecha > DATE_SUB(NOW(), INTERVAL 5 SECOND)
         FOR UPDATE`,
        [id_pieza, id_pintura, id_cabina, cantidad]
      );

      if (duplicadoRows.length > 0) {
        await conn.rollback();
        conn.release();
        
        console.log(`[Duplicado Detectado] Registro reciente encontrado en transacción`);
        return NextResponse.json({ 
          ok: true, 
          duplicado: true,
          mensaje: "Registro ya procesado" 
        });
      }

      const insertResult = await conn.query<ResultSetHeader>(
        `INSERT INTO PiezaPintada (id_pieza, id_pintura, id_cabina, cantidad, consumo_estimado_kg, fecha)
          VALUES (?, ?, ?, ?, ?, NOW())`,
        [id_pieza, id_pintura, id_cabina, cantidad, consumo_total_kg]
      );

      // 6) Descontar la pintura consumida del stock
      await conn.query(
        `UPDATE Pintura SET cantidad_kg = cantidad_kg - ? WHERE id_pintura = ?`,
        [consumo_total_kg, id_pintura]
      );

      // 7) Usar el sistema Observer para generar alertas
      const horas_trabajo = cantidad * 0.1; // Aproximado: 0.1 horas por pieza

      // Construir objeto cabina completo para el Observer
      const cabina: Cabina = {
      id_cabina: cabinaData.id_cabina,
      nombre: cabinaData.nombre,
      descripcion: cabinaData.descripcion,
      max_piezas_diarias: cabinaData.max_piezas_diarias,
      piezas_hoy: Number(cabinaData.piezas_hoy),
      estado: cabinaData.estado,
      pistolas: pistolasRows.map((p): Pistola => ({
        id_pistola: p.id_pistola,
        nombre: p.nombre,
        descripcion: p.descripcion,
        horas_uso: Number(p.horas_uso),
        horas_mantenimiento: Number(p.horas_mantenimiento),
        ultimo_mantenimiento: p.ultimo_mantenimiento,
        estado: p.estado
      })),
      hornos: hornosRows.map((h): Horno => ({
        id_horno: h.id_horno,
        nombre: h.nombre,
        descripcion: h.descripcion,
        horas_uso: Number(h.horas_uso),
        horas_mantenimiento: Number(h.horas_mantenimiento),
        temperatura_max: Number(h.temperatura_max),
        gasto_gas_hora: Number(h.gasto_gas_hora),
        ultimo_mantenimiento: h.ultimo_mantenimiento,
        estado: h.estado
      }))
    };
      const cabinaSubject = getCabinaSubject();
      const alertas = cabinaSubject.registerPainting({
        id_cabina: id_cabina,
        cabina: cabina,
        cantidad_piezas: cantidad,
        horas_trabajo: horas_trabajo,
        fecha: new Date()
      });

      // 8) Guardar alertas en la base de datos
      for (const alerta of alertas) {
        await conn.query(
          `INSERT INTO alertasmaquinaria (tipo_equipo, id_equipo, tipo_alerta, mensaje, nivel, fecha)
           VALUES (?, ?, ?, ?, ?, NOW())`,
          [alerta.tipo_equipo, alerta.id_equipo, alerta.tipo_alerta, alerta.mensaje, alerta.nivel]
        );
      }

      // 9) Persistir uso en cabinahistorial, actualizar horas de pistolas/hornos y contador de piezas en cabina
      // Assumptions:
      // - horas_trabajo es el total para la operacion; se distribuye equitativamente entre pistolas/hornos asignados
      // - gas_consumido se calcula como horas_trabajo * average(gasto_gas_hora) of assigned hornos
      const numPistolas = pistolasRows.length || 1;
      const numHornos = hornosRows.length || 1;
      const horasPorPistola = horas_trabajo / numPistolas;
      const horasPorHorno = horas_trabajo / numHornos;

      // Update pistolas horas_uso
      for (const p of pistolasRows) {
        await conn.query(
          `UPDATE pistola SET horas_uso = horas_uso + ? WHERE id_pistola = ?`,
          [horasPorPistola, p.id_pistola]
        );
      }

      // Update hornos horas_uso and compute gas
      let sumaGastoHora = 0;
      for (const h of hornosRows) {
        sumaGastoHora += Number(h.gasto_gas_hora) || 0;
        await conn.query(
          `UPDATE horno SET horas_uso = horas_uso + ? WHERE id_horno = ?`,
          [horasPorHorno, h.id_horno]
        );
      }

      const gastoPromedioHora = numHornos > 0 ? sumaGastoHora / numHornos : 0;
      const gasConsumido = horas_trabajo * gastoPromedioHora;

      // Insertar registro en cabinahistorial
      await conn.query(
        `INSERT INTO cabinahistorial (id_cabina, fecha, piezas_pintadas, id_pieza, id_pintura, horas_trabajo, gas_consumido)
         VALUES (?, NOW(), ?, ?, ?, ?, ?)`,
        [id_cabina, cantidad, id_pieza, id_pintura, horas_trabajo, gasConsumido]
      );

      // Actualizar contador de piezas_hoy y ultimo_uso en cabina
      await conn.query(
        `UPDATE cabina SET piezas_hoy = piezas_hoy + ?, ultimo_uso = CURDATE() WHERE id_cabina = ?`,
        [cantidad, id_cabina]
      );

      await conn.commit();

      // Preparar respuesta usando los datos ya calculados
      const nuevas_piezas_hoy = Number(cabinaData.piezas_hoy) + cantidad;
      const nuevo_porcentaje = Math.round((nuevas_piezas_hoy / cabinaData.max_piezas_diarias) * 100);

      return NextResponse.json({ 
        ok: true, 
        consumo_por_pieza_kg: consumo_por_pieza.toFixed(4),
        consumo_total_kg: consumo_total_kg.toFixed(4),
        stock_restante_kg: (pinturaDisponible - consumo_total_kg).toFixed(2),
        cabina: {
          nombre: cabinaData.nombre,
          piezas_hoy: nuevas_piezas_hoy,
          piezas_restantes: cabinaData.max_piezas_diarias - nuevas_piezas_hoy,
          porcentaje_uso: nuevo_porcentaje,
          excedio_limite: excedeLimit,
          pistolas: pistolasRows.map(p => p.nombre),
          hornos: hornosRows.map(h => h.nombre)
        },
        warning_limite: warningLimite,
        alertas: alertas.map(a => ({ 
          tipo_equipo: a.tipo_equipo,
          nombre_equipo: a.nombre_equipo,
          tipo: a.tipo_alerta, 
          mensaje: a.mensaje, 
          nivel: a.nivel 
        }))
      });
    } catch (txErr) {
      await conn.rollback();
      console.error("Transaction error POST pieza pintada:", txErr);
      
      return NextResponse.json({ error: "Error interno" }, { status: 500 });
    } finally {
      conn.release();
      
    }
  } catch (error) {
    console.error("Error POST pieza pintada:", error);
    
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// ============================
//actualizar cantidad_facturada
// ============================
export async function PATCH(
  req: Request,
  context: { params: { id: string } }
) {
  const session = await getSession();

  // Verificar acceso al componente Formulario Registrar Producción (ID 8)
  if (!session || !(await hasPermission(session, 8))) {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  const id = Number(context.params.id);
  const { cantidad_facturada } = await req.json();

  try {
    await pool.query(
      `
      UPDATE PiezaPintada 
      SET cantidad_facturada = ?
      WHERE id_pieza_pintada = ?
      `,
      [cantidad_facturada, id]
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error PATCH pieza pintada:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
