import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getSession, hasPermission } from "@/lib/auth";
import { RowDataPacket } from "mysql2";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();

  if (!session || !(await hasPermission(session, 9)))
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });

  const { id } = await params;
  const idNum = Number(id);

  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM PiezaPintada WHERE id_pieza_pintada = ?`,
      [idNum]
    );

    if (!rows.length)
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("Error al obtener pieza pintada:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();

  // Verificar acceso al componente Editar Pieza Pintada (ID 8 formulario)
  if (!session || !(await hasPermission(session, 8)))
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });

  const { id } = await params;
  const idNum = Number(id);
  const { cantidad, consumo_estimado_kg, fecha } = await req.json();

  try {
    await pool.query(
      `UPDATE PiezaPintada
       SET cantidad = ?, consumo_estimado_kg = ?, fecha = ?
       WHERE id_pieza_pintada = ?`,
      [cantidad, consumo_estimado_kg, fecha, idNum]
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error al actualizar pieza pintada:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();

  // Verificar acceso al componente Eliminar Pieza Pintada (ID 23)
  if (!session || !(await hasPermission(session, 23)))
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });

  const { id } = await params;
  const idNum = Number(id);

  try {
    // Obtener datos completos del registro antes de eliminar (para auditoría)
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT pp.*, p.detalle as pieza_nombre, 
              CONCAT(m.nombre, ' - ', c.nombre, ' (', t.nombre, ')') as pintura_nombre,
              cab.nombre as cabina_nombre
       FROM PiezaPintada pp
       LEFT JOIN Pieza p ON p.id_pieza = pp.id_pieza
       LEFT JOIN Pintura pin ON pin.id_pintura = pp.id_pintura
       LEFT JOIN Marca m ON m.id_marca = pin.id_marca
       LEFT JOIN Color c ON c.id_color = pin.id_color
       LEFT JOIN TipoPintura t ON t.id_tipo = pin.id_tipo
       LEFT JOIN cabina cab ON cab.id_cabina = pp.id_cabina
       WHERE pp.id_pieza_pintada = ?`,
      [idNum]
    );

    if (!rows.length) {
      return NextResponse.json({ error: "Registro no encontrado" }, { status: 404 });
    }

    const registro = rows[0];

    // No permitir eliminar si hay piezas facturadas
    if (registro.cantidad_facturada > 0) {
      return NextResponse.json(
        { 
          error: `No se puede eliminar: ${registro.cantidad_facturada} de ${registro.cantidad} piezas ya fueron facturadas.` 
        }, 
        { status: 400 }
      );
    }

    // Verificar si está referenciado en alguna factura (por seguridad adicional)
    const [facturas] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM facturadetalle WHERE id_pieza_pintada = ?`,
      [idNum]
    );

    if (facturas[0].total > 0) {
      return NextResponse.json(
        { error: "No se puede eliminar: este registro está asociado a una o más facturas." },
        { status: 400 }
      );
    }

    // Crear registro de auditoría ANTES de eliminar
    const datosAnteriores = JSON.stringify({
      id_pieza_pintada: registro.id_pieza_pintada,
      fecha: registro.fecha,
      cantidad: registro.cantidad,
      pieza_nombre: registro.pieza_nombre || 'N/A',
      cabina_nombre: registro.cabina_nombre || 'N/A',
      pintura_nombre: registro.pintura_nombre || 'N/A',
      cantidad_facturada: registro.cantidad_facturada,
      consumo_estimado_kg: registro.consumo_estimado_kg
    });

    await pool.query(
      `INSERT INTO AuditoriaTrazabilidad 
       (tabla_afectada, id_registro, accion, datos_anteriores, usuario_sistema, id_usuario)
       VALUES ('PiezaPintada', ?, 'DELETE', ?, 'app_user', ?)`,
      [idNum, datosAnteriores, session.id_usuario]
    );

    // Si no hay piezas facturadas, se puede eliminar
    await pool.query(
      `DELETE FROM PiezaPintada WHERE id_pieza_pintada = ?`,
      [idNum]
    );
    
    return NextResponse.json({ ok: true, message: "Registro eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar pieza pintada:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
