import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getSession, hasPermission } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getSession();
  
  // Verificar acceso al componente de formulario de facturas (ID 14)
  if (!session || !(await hasPermission(session, 14))) {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  try {
    const { id_cliente, items } = await req.json();

    if (!id_cliente || !items || items.length === 0) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // 1) CREAR FACTURA
      const [facturaResult]: any = await conn.query(
        `INSERT INTO Factura (id_cliente, fecha, total)
         VALUES (?, NOW(), 0)`,
        [id_cliente]
      );

      const id_factura = facturaResult.insertId;
      let totalFactura = 0;

      // 2) INSERTAR DETALLES
      for (const item of items) {
        const { id_pieza_pintada, cantidad, precio_unitario } = item;

        // 2A) Verificar disponibilidad real al momento
        const [rows]: any = await conn.query(
          `SELECT cantidad, cantidad_facturada 
           FROM PiezaPintada 
           WHERE id_pieza_pintada = ?`,
          [id_pieza_pintada]
        );
        const pp = rows[0];

        const disponible = pp.cantidad - pp.cantidad_facturada;

        if (cantidad > disponible) {
          await conn.rollback();
          return NextResponse.json(
            { error: `No hay suficientes unidades disponibles para la pieza pintada #${id_pieza_pintada}` },
            { status: 400 }
          );
        }

        const subtotal = cantidad * precio_unitario;
        totalFactura += subtotal;

        // 2B) Insertar detalle
        await conn.query(
          `INSERT INTO FacturaDetalle 
           (id_factura, id_pieza_pintada, cantidad, precio_unitario)
           VALUES (?, ?, ?, ?)`,
          [id_factura, id_pieza_pintada, cantidad, precio_unitario]
        );

        // 2C) Actualizar cantidad facturada
        await conn.query(
          `UPDATE PiezaPintada
           SET cantidad_facturada = cantidad_facturada + ?
           WHERE id_pieza_pintada = ?`,
          [cantidad, id_pieza_pintada]
        );
      }

      // 3) Actualizar total factura
      await conn.query(
        `UPDATE Factura SET total = ? WHERE id_factura = ?`,
        [totalFactura, id_factura]
      );

      await conn.commit();
      conn.release();

      return NextResponse.json({ ok: true, id_factura });
    } catch (error) {
      await conn.rollback();
      conn.release();
      console.error("Error al generar factura:", error);
      return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
  } catch (error) {
    console.error("Error de servidor:", error);
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}
