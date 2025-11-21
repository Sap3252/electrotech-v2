import { NextResponse } from "next/server";
import { jsPDF } from "jspdf";
import { pool } from "@/lib/db";
import { getSession, hasCoreAccess } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!hasCoreAccess(session, 2)) {
    return new NextResponse("Acceso no autorizado", { status: 403 });
  }

  try {
    const { id: remitoId } = await params;

    // Datos del remito
    const [remitoData]: any = await pool.query(
      `
      SELECT r.*, c.nombre
      FROM Remito r
      JOIN Cliente c ON c.id_cliente = r.id_cliente
      WHERE r.id_remito = ?
      `,
      [remitoId]
    );

    if (!remitoData.length) {
      return new NextResponse("Remito no encontrado", { status: 404 });
    }

    const remito = remitoData[0];

    // Detalle del remito
    const [detalle]: any = await pool.query(
      `
      SELECT d.cantidad, p.detalle, p.ancho_m, p.alto_m
      FROM RemitoDetalle d
      JOIN Pieza p ON p.id_pieza = d.id_pieza
      WHERE d.id_remito = ?
      `,
      [remitoId]
    );

    // Crear PDF con jsPDF
    const doc = new jsPDF();

    // ---------- ENCABEZADO ----------
    doc.setFontSize(20);
    doc.text("ElectroTech - Remito", 105, 20, { align: "center" });
    
    doc.setFontSize(12);
    doc.text(`Remito N°: ${remito.id_remito}`, 20, 40);
    doc.text(`Cliente: ${remito.nombre}`, 20, 50);
    doc.text(`Fecha: ${new Date(remito.fecha_recepcion).toLocaleDateString()}`, 20, 60);
    doc.text(`Cantidad total: ${remito.cantidad_piezas}`, 20, 70);

    doc.line(20, 75, 190, 75);

    // ---------- DETALLE ----------
    doc.setFontSize(14);
    doc.text("Detalle de piezas:", 20, 85);
    
    let y = 95;
    doc.setFontSize(12);
    detalle.forEach((item: { detalle: string; ancho_m: number; alto_m: number; cantidad: number }) => {
      doc.text(
        `• ${item.detalle} | ${item.ancho_m}m x ${item.alto_m}m | Cant: ${item.cantidad}`,
        25,
        y
      );
      y += 10;
    });

    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename=remito_${remitoId}.pdf`,
      }
    });

  } catch (error) {
    console.error("Error generando PDF:", error);
    return new NextResponse("Error generando PDF", { status: 500 });
  }
}
