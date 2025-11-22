import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    const [rows]: any = await pool.query(
      `SELECT 
         CONCAT(pz.detalle, ' - ', m.nombre, ' ', c.nombre, ' ', t.nombre) as descripcion,
         fd.cantidad,
         fd.precio_unitario,
         (fd.cantidad * fd.precio_unitario) as subtotal
       FROM facturadetalle fd
       JOIN PiezaPintada pp ON pp.id_pieza_pintada = fd.id_pieza_pintada
       JOIN Pieza pz ON pz.id_pieza = pp.id_pieza
       JOIN Pintura pt ON pt.id_pintura = pp.id_pintura
       JOIN Marca m ON m.id_marca = pt.id_marca
       JOIN Color c ON c.id_color = pt.id_color
       JOIN TipoPintura t ON t.id_tipo = pt.id_tipo
       WHERE fd.id_factura = ?
       ORDER BY fd.id_detalle`,
      [id]
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error obteniendo detalle de factura:", error);
    return NextResponse.json(
      { error: "Error obteniendo detalle" },
      { status: 500 }
    );
  }
}
