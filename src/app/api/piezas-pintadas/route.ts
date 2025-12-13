import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getSession, hasPermission } from "@/lib/auth";
import { StandardPaintStrategy } from "@/domain/strategy/StandardPaintStrategy";
import { HighDensityPaintStrategy } from "@/domain/strategy/HighDensityPaintStrategy";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { getCabinaSubject, Cabina, Pistola, Horno } from "@/domain/cabinaObserver";

export async function GET() {
  const session = await getSession();

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
        pp.cantidad_facturada,
        (pp.cantidad - pp.cantidad_facturada) AS cantidad_pendiente,
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

export async function POST(req: Request) {
  const session = await getSession();

  if (!session || !(await hasPermission(session, 8))) {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  const body = await req.json();
  const { id_pieza, id_pintura, id_cabina, cantidad, espesor_um, densidad_g_cm3, estrategia } = body;

  try {
    if (!id_cabina) {
      
      return NextResponse.json(
        { error: "Debe seleccionar una cabina para pintar" },
        { status: 400 }
      );
    }

    const [cabinaRows] = await pool.query<RowDataPacket[]>(
      `SELECT id_cabina, nombre, descripcion, max_piezas_diarias, piezas_hoy, estado
       FROM cabina
       WHERE id_cabina = ?`,
      [id_cabina]
    );

    if (!cabinaRows[0]) {
      return NextResponse.json({ error: "Cabina no encontrada" }, { status: 404 });
    }

    let cabinaData = cabinaRows[0];

    const hoy = new Date().toISOString().split('T')[0];
    const [lastRows] = await pool.query<RowDataPacket[]>(
      `SELECT DATE(MAX(fecha)) AS last_fecha FROM cabinahistorial WHERE id_cabina = ?`,
      [id_cabina]
    );
    const lastFecha = lastRows[0]?.last_fecha ? String(lastRows[0].last_fecha) : null;
    if (lastFecha && lastFecha !== hoy) {
      await pool.query(`UPDATE cabina SET piezas_hoy = 0 WHERE id_cabina = ?`, [id_cabina]);
      cabinaData.piezas_hoy = 0;
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

    const [piezaRows] = await pool.query<RowDataPacket[]>(
      "SELECT detalle, ancho_m, alto_m FROM Pieza WHERE id_pieza = ?",
      [id_pieza]
    );

    if (!piezaRows[0]) {
      return NextResponse.json({ error: "Pieza no encontrada" }, { status: 404 });
    }

    const pieza = piezaRows[0];
    const piezaNombre = pieza.detalle;

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

    const [pinturaRows] = await pool.query<RowDataPacket[]>(
      `SELECT p.cantidad_kg, CONCAT(m.nombre, ' - ', c.nombre, ' (', t.nombre, ')') as pintura_nombre
       FROM Pintura p
       JOIN Marca m ON m.id_marca = p.id_marca
       JOIN Color c ON c.id_color = p.id_color
       JOIN TipoPintura t ON t.id_tipo = p.id_tipo
       WHERE p.id_pintura = ?`,
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

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

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

      const [insertRows] = insertResult as [ResultSetHeader, unknown];
      const idPiezaPintada = insertRows.insertId;

      const pinturaNombre = pinturaRows[0]?.pintura_nombre || 'N/A';
      const cabinaNombre = cabinaData.nombre || 'N/A';
      const datosNuevos = JSON.stringify({
        id_pieza_pintada: idPiezaPintada,
        fecha: new Date().toISOString().split('T')[0],
        cantidad: cantidad,
        pieza_nombre: piezaNombre,
        cabina_nombre: cabinaNombre,
        pintura_nombre: pinturaNombre,
        cantidad_facturada: 0,
        consumo_estimado_kg: consumo_total_kg
      });

      await conn.query(
        `INSERT INTO AuditoriaTrazabilidad 
         (tabla_afectada, id_registro, accion, datos_nuevos, usuario_sistema, id_usuario)
         VALUES ('PiezaPintada', ?, 'INSERT', ?, ?, ?)`,
        [idPiezaPintada, datosNuevos, 'app_user', session.id_usuario]
      );

      await conn.query(
        `UPDATE Pintura SET cantidad_kg = cantidad_kg - ? WHERE id_pintura = ?`,
        [consumo_total_kg, id_pintura]
      );

      await conn.query(
        `UPDATE StockPieza SET 
          total_pintada = total_pintada + ?,
          stock_disponible = stock_disponible - ?
         WHERE id_pieza = ?`,
        [cantidad, cantidad, id_pieza]
      );

      const horas_trabajo = cantidad * 0.1;

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

      for (const alerta of alertas) {
        await conn.query(
          `INSERT INTO alertasmaquinaria (tipo_equipo, id_equipo, tipo_alerta, mensaje, nivel, leida, fecha)
           VALUES (?, ?, ?, ?, ?, 0, NOW())`,
          [alerta.tipo_equipo, alerta.id_equipo, alerta.tipo_alerta, alerta.mensaje, alerta.nivel]
        );
      }

      const numPistolas = pistolasRows.length || 1;
      const numHornos = hornosRows.length || 1;
      const horasPorPistola = horas_trabajo / numPistolas;
      const horasPorHorno = horas_trabajo / numHornos;

      for (const p of pistolasRows) {
        await conn.query(
          `UPDATE pistola SET horas_uso = horas_uso + ? WHERE id_pistola = ?`,
          [horasPorPistola, p.id_pistola]
        );
      }

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

      await conn.query(
        `INSERT INTO cabinahistorial (id_cabina, fecha, piezas_pintadas, id_pieza, id_pintura, horas_trabajo, gas_consumido)
         VALUES (?, NOW(), ?, ?, ?, ?, ?)`,
        [id_cabina, cantidad, id_pieza, id_pintura, horas_trabajo, gasConsumido]
      );

      await conn.query(
        `UPDATE cabina SET piezas_hoy = piezas_hoy + ? WHERE id_cabina = ?`,
        [cantidad, id_cabina]
      );

      await conn.commit();

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

export async function PATCH(
  req: Request,
  context: { params: { id: string } }
) {
  const session = await getSession();

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
