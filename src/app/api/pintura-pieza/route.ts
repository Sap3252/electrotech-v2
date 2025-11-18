import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

import { PaintCalculator } from "@/domain/strategy/PaintCalculator";
import { StandardPaintStrategy } from "@/domain/strategy/StandardPaintStrategy";

export async function POST(req: Request) {
  const body = await req.json();
  const { id_pieza, id_pintura } = body;

  // Datos de la pieza
  const [[pieza]]: any = await pool.query(
    "SELECT ancho_m, alto_m FROM Pieza WHERE id_pieza = ?",
    [id_pieza]
  );

  // Datos de la pintura
  const [[pintura]]: any = await pool.query(
    "SELECT espesor_um, densidad_g_cm3 FROM Pintura WHERE id_pintura = ?",
    [id_pintura]
  );

  // Usar Strategy
  const calc = new PaintCalculator(new StandardPaintStrategy());

  const consumo = calc.calcular(
    pieza.ancho_m,
    pieza.alto_m,
    pintura.espesor_um,
    pintura.densidad_g_cm3
  );

  // Guardar en la tabla PinturaPieza
  await pool.execute(
    "INSERT INTO PinturaPieza (id_pintura, id_pieza, consumo_estimado_kg) VALUES (?, ?, ?)",
    [id_pintura, id_pieza, consumo]
  );

  return NextResponse.json({ consumo });
}
