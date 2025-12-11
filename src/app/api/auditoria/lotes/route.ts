import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function GET() {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        pp.id_pieza_pintada,
        p.detalle as pieza_nombre,
        CONCAT(m.nombre, ' - ', c.nombre, ' (', t.nombre, ')') as pintura_nombre
       FROM PiezaPintada pp
       LEFT JOIN Pieza p ON p.id_pieza = pp.id_pieza
       LEFT JOIN Pintura pin ON pin.id_pintura = pp.id_pintura
       LEFT JOIN Marca m ON m.id_marca = pin.id_marca
       LEFT JOIN Color c ON c.id_color = pin.id_color
       LEFT JOIN TipoPintura t ON t.id_tipo = pin.id_tipo
       ORDER BY pp.id_pieza_pintada DESC`
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error al obtener lotes:", error);
    return NextResponse.json(
      { error: "Error al obtener lotes" },
      { status: 500 }
    );
  }
}
