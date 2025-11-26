import { NextResponse } from "next/server";
import { jsPDF } from "jspdf";
import { pool } from "@/lib/db";
import { getSession, hasPermission } from "@/lib/auth";
import { RowDataPacket } from "mysql2/promise";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();

  // Verificar acceso al componente Botón Imprimir Factura (ID 17)
  if (!session || !(await hasPermission(session, 17))) {
    return new NextResponse("Acceso no autorizado", { status: 403 });
  }

  try {
    const { id: facturaId } = await params;

    // Datos de la factura
    const [facturaData] = await pool.query<RowDataPacket[]>(
      `
      SELECT f.*, c.nombre as cliente_nombre, c.direccion
      FROM Factura f
      JOIN Cliente c ON c.id_cliente = f.id_cliente
      WHERE f.id_factura = ?
      `,
      [facturaId]
    );

    if (!facturaData.length) {
      return new NextResponse("Factura no encontrada", { status: 404 });
    }

    const factura = facturaData[0];

    // Detalle de la factura
    const [detalle] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        fd.cantidad, 
        fd.precio_unitario, 
        (fd.cantidad * fd.precio_unitario) as subtotal, 
        CONCAT(pz.detalle, ' - ', m.nombre, ' ', c.nombre, ' ', t.nombre) as descripcion
      FROM facturadetalle fd
      JOIN PiezaPintada pp ON pp.id_pieza_pintada = fd.id_pieza_pintada
      JOIN Pieza pz ON pz.id_pieza = pp.id_pieza
      JOIN Pintura pt ON pt.id_pintura = pp.id_pintura
      JOIN Marca m ON m.id_marca = pt.id_marca
      JOIN Color c ON c.id_color = pt.id_color
      JOIN TipoPintura t ON t.id_tipo = pt.id_tipo
      WHERE fd.id_factura = ?
      `,
      [facturaId]
    );

    // Crear PDF con jsPDF
    const doc = new jsPDF();

    // ---------- ENCABEZADO ----------
    doc.setFontSize(20);
    doc.text("ElectroTech - Factura", 105, 20, { align: "center" });
    
    doc.setFontSize(12);
    doc.text(`Factura N°: ${factura.id_factura}`, 20, 40);
    doc.text(`Cliente: ${factura.cliente_nombre}`, 20, 50);
    doc.text(`Dirección: ${factura.direccion || "N/A"}`, 20, 60);
    doc.text(`Fecha: ${new Date(factura.fecha).toLocaleDateString()}`, 20, 70);

    doc.line(20, 75, 190, 75);

    // ---------- DETALLE ----------
    doc.setFontSize(14);
    doc.text("Detalle de items:", 20, 85);
    
    let y = 95;
    doc.setFontSize(12);
    detalle.forEach((item) => {
      doc.text(
        `• ${item.descripcion} | Cant: ${item.cantidad} | Precio: $${item.precio_unitario} | Subtotal: $${item.subtotal}`,
        25,
        y
      );
      y += 10;
    });

    // ---------- TOTAL ----------
    y += 10;
    doc.line(20, y, 190, y);
    y += 10;
    doc.setFontSize(14);
    doc.text(`TOTAL: $${factura.total}`, 20, y);

    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="factura-${facturaId}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generando PDF de factura:", error);
    return new NextResponse("Error generando PDF", { status: 500 });
  }
}
