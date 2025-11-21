import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getSession, hasCoreAccess } from "@/lib/auth";
import { StandardPaintStrategy } from "@/domain/strategy/StandardPaintStrategy";
import { HighDensityPaintStrategy } from "@/domain/strategy/HighDensityPaintStrategy";

// ============================
// GET: obtener todas las piezas pintadas
// ============================
export async function GET() {
  const session = await getSession();
  if (!hasCoreAccess(session, 1)) {
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
        pz.detalle AS pieza_detalle,
        m.nombre AS marca,
        c.nombre AS color,
        t.nombre AS tipo
      FROM PiezaPintada pp
      JOIN Pieza pz ON pz.id_pieza = pp.id_pieza
      JOIN Pintura pt ON pt.id_pintura = pp.id_pintura
      JOIN Marca m ON m.id_marca = pt.id_marca
      JOIN Color c ON c.id_color = pt.id_color
      JOIN TipoPintura t ON t.id_tipo = pt.id_tipo
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
  if (!hasCoreAccess(session, 1)) {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  const { id_pieza, id_pintura, cantidad, espesor_um, densidad_g_cm3, estrategia } = await req.json();

  try {
    // 1) Verificar stock disponible
    const [stockRows] = await pool.query(
      "SELECT stock_disponible FROM StockPieza WHERE id_pieza = ?",
      [id_pieza]
    );
    const stockRow: any = (stockRows as any[])[0];
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
    const [piezaRows]: any = await pool.query(
      "SELECT ancho_m, alto_m FROM Pieza WHERE id_pieza = ?",
      [id_pieza]
    );

    if (!piezaRows[0]) {
      return NextResponse.json({ error: "Pieza no encontrada" }, { status: 404 });
    }

    const pieza = piezaRows[0];

    // 3) Calcular consumo usando Strategy pattern
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

    // 4) Insertar registro
    await pool.query(
      `
      INSERT INTO PiezaPintada (id_pieza, id_pintura, cantidad, consumo_estimado_kg, fecha)
      VALUES (?, ?, ?, ?, NOW())
      `,
      [id_pieza, id_pintura, cantidad, consumo_total_kg]
    );

    return NextResponse.json({ 
      ok: true, 
      consumo_por_pieza_kg: consumo_por_pieza.toFixed(4),
      consumo_total_kg: consumo_total_kg.toFixed(4)
    });
  } catch (error) {
    console.error("Error POST pieza pintada:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// ============================
// PATCH: actualizar cantidad_facturada
// ============================
export async function PATCH(
  req: Request,
  context: { params: { id: string } }
) {
  const session = await getSession();
  if (!hasCoreAccess(session, 1)) {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  const id = Number(context.params.id);
  const { cantidad_facturada } = await req.json();

  try {
    const [result]: any = await pool.query(
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
