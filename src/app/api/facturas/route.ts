import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getSession, hasPermission } from "@/lib/auth";
import { RowDataPacket, ResultSetHeader } from "mysql2";

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
      const [facturaResult] = await conn.query<ResultSetHeader>(
        `INSERT INTO Factura (id_cliente, fecha, total)
         VALUES (?, NOW(), 0)`,
        [id_cliente]
      );

      const id_factura = facturaResult.insertId;
      let totalFactura = 0;

      // 2) INSERTAR DETALLES
      for (const item of items) {
        const { id_pieza_pintada, cantidad, precio_unitario } = item;

        // 2.1) Verificar disponibilidad real al momento
        const [rows] = await conn.query<RowDataPacket[]>(
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

        // 2.2) Insertar detalle
        await conn.query(
          `INSERT INTO FacturaDetalle 
           (id_factura, id_pieza_pintada, cantidad, precio_unitario)
           VALUES (?, ?, ?, ?)`,
          [id_factura, id_pieza_pintada, cantidad, precio_unitario]
        );

        // 2.3) Actualizar cantidad facturada
        await conn.query(
          `UPDATE PiezaPintada
           SET cantidad_facturada = cantidad_facturada + ?
           WHERE id_pieza_pintada = ?`,
          [cantidad, id_pieza_pintada]
        );

        // 2.4) Obtener info adicional para auditoría
        const [piezaInfo] = await conn.query<RowDataPacket[]>(
          `SELECT pp.id_pieza_pintada, p.detalle as pieza_nombre, 
                  CONCAT(m.nombre, ' - ', c.nombre, ' (', t.nombre, ')') as pintura_nombre, 
                  pp.cantidad as cantidad_total,
                  pp.cantidad_facturada as cantidad_facturada_actual
           FROM PiezaPintada pp
           JOIN Pieza p ON p.id_pieza = pp.id_pieza
           JOIN Pintura pi ON pi.id_pintura = pp.id_pintura
           JOIN Marca m ON m.id_marca = pi.id_marca
           JOIN Color c ON c.id_color = pi.id_color
           JOIN TipoPintura t ON t.id_tipo = pi.id_tipo
           WHERE pp.id_pieza_pintada = ?`,
          [id_pieza_pintada]
        );

        // 2.5) Registrar auditoría FACTURADO para cada lote
        const datosFacturado = JSON.stringify({
          id_factura: id_factura,
          id_pieza_pintada: id_pieza_pintada,
          pieza_nombre: piezaInfo[0]?.pieza_nombre || 'N/A',
          pintura_nombre: piezaInfo[0]?.pintura_nombre || 'N/A',
          cantidad_facturada: cantidad,
          precio_unitario: precio_unitario,
          subtotal: subtotal,
          cantidad_total_lote: piezaInfo[0]?.cantidad_total || 0,
          cantidad_facturada_acumulada: piezaInfo[0]?.cantidad_facturada_actual || 0
        });

        await conn.query(
          `INSERT INTO AuditoriaTrazabilidad 
           (tabla_afectada, id_registro, accion, datos_nuevos, usuario_sistema, id_usuario)
           VALUES ('PiezaPintada', ?, 'FACTURADO', ?, 'app_user', ?)`,
          [id_pieza_pintada, datosFacturado, session.id_usuario]
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
