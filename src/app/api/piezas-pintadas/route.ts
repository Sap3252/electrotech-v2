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
        pp.fecha,
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


// ============================
// POST: crear nueva pieza pintada
// ============================
export async function POST(req: Request) {
  const session = await getSession();

  // Verificar acceso al componente Formulario Registrar Produccion (ID 8)
  if (!session || !(await hasPermission(session, 8))) {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  const { id_pieza, id_pintura, id_cabina, cantidad, espesor_um, densidad_g_cm3, estrategia } = await req.json();

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
      `SELECT id_cabina, nombre, descripcion, max_piezas_diarias, piezas_hoy, estado
       FROM cabina
       WHERE id_cabina = ?`,
      [id_cabina]
    );

    if (!cabinaRows[0]) {
      return NextResponse.json({ error: "Cabina no encontrada" }, { status: 404 });
    }

    const cabinaData = cabinaRows[0];
    
    if (cabinaData.estado !== 'activa') {
      return NextResponse.json(
        { error: `La cabina "${cabinaData.nombre}" no está activa (estado: ${cabinaData.estado})` },
        { status: 400 }
      );
    }

    // Verificar límite diario
    const piezas_restantes = cabinaData.max_piezas_diarias - Number(cabinaData.piezas_hoy);
    if (piezas_restantes < cantidad) {
      return NextResponse.json(
        { 
          error: `La cabina "${cabinaData.nombre}" solo puede pintar ${piezas_restantes} piezas más hoy (límite diario: ${cabinaData.max_piezas_diarias})`,
          piezas_restantes,
          limite_diario: cabinaData.max_piezas_diarias
        },
        { status: 400 }
      );
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

    // 5) Insertar registro (el trigger actualizará contadores y horas)
    await pool.query<ResultSetHeader>(
      `INSERT INTO PiezaPintada (id_pieza, id_pintura, id_cabina, cantidad, consumo_estimado_kg, fecha)
       VALUES (?, ?, ?, ?, ?, CURDATE())`,
      [id_pieza, id_pintura, id_cabina, cantidad, consumo_total_kg]
    );

    // 6) Descontar la pintura consumida del stock
    await pool.query(
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
      await pool.query(
        `INSERT INTO alertasmaquinaria (tipo_equipo, id_equipo, tipo_alerta, mensaje, nivel, fecha)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [alerta.tipo_equipo, alerta.id_equipo, alerta.tipo_alerta, alerta.mensaje, alerta.nivel]
      );
    }

    // Calcular nuevo estado de la cabina
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
        pistolas: pistolasRows.map(p => p.nombre),
        hornos: hornosRows.map(h => h.nombre)
      },
      alertas: alertas.map(a => ({ 
        tipo_equipo: a.tipo_equipo,
        nombre_equipo: a.nombre_equipo,
        tipo: a.tipo_alerta, 
        mensaje: a.mensaje, 
        nivel: a.nivel 
      }))
    });
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
