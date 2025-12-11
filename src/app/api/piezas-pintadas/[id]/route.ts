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

  // Obtener cantidad a eliminar del body (si no se envía, elimina todas las pendientes)
  let cantidadAEliminar: number | null = null;
  try {
    const body = await req.json();
    cantidadAEliminar = body.cantidad ? Number(body.cantidad) : null;
  } catch {
    // Si no hay body, se eliminará todo el registro (si no tiene facturadas)
  }

  try {
    // Obtener datos completos del registro antes de modificar/eliminar (para auditoría)
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT pp.*, p.detalle as pieza_nombre, 
              CONCAT(m.nombre, ' - ', c.nombre, ' (', t.nombre, ')') as pintura_nombre,
              cab.nombre as cabina_nombre,
              (pp.cantidad - pp.cantidad_facturada) as cantidad_pendiente
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
    const cantidadPendiente = registro.cantidad - registro.cantidad_facturada;

    // Validar que hay piezas pendientes para eliminar
    if (cantidadPendiente <= 0) {
      return NextResponse.json(
        { error: "No hay piezas pendientes para eliminar. Todas están facturadas." },
        { status: 400 }
      );
    }

    // Si no se especifica cantidad, eliminar todas las pendientes
    const cantidadReal = cantidadAEliminar ?? cantidadPendiente;

    // Validar cantidad
    if (cantidadReal <= 0) {
      return NextResponse.json(
        { error: "La cantidad a eliminar debe ser mayor a 0" },
        { status: 400 }
      );
    }

    if (cantidadReal > cantidadPendiente) {
      return NextResponse.json(
        { error: `Solo hay ${cantidadPendiente} piezas pendientes. No puede eliminar ${cantidadReal}.` },
        { status: 400 }
      );
    }

    // Calcular nuevo consumo proporcional
    const consumoPorPieza = registro.consumo_estimado_kg / registro.cantidad;
    const nuevoConsumo = (registro.cantidad - cantidadReal) * consumoPorPieza;
    const nuevaCantidad = registro.cantidad - cantidadReal;
    const nuevaCantidadPendiente = nuevaCantidad - registro.cantidad_facturada;

    // Si se eliminan todas las piezas pendientes, el lote se considera terminado (DELETE)
    if (cantidadReal === cantidadPendiente) {
      // ELIMINACIÓN COMPLETA DEL LOTE (todas las pendientes eliminadas)
      // Datos para DELETE: fecha, pieza, cabina, pintura, consumo, cantidad lote, facturadas, eliminadas
      const datosEliminacion = JSON.stringify({
        fecha: registro.fecha,
        pieza_nombre: registro.pieza_nombre || 'N/A',
        cabina_nombre: registro.cabina_nombre || 'N/A',
        pintura_nombre: registro.pintura_nombre || 'N/A',
        consumo_estimado_kg: Number(registro.consumo_estimado_kg).toFixed(4),
        cantidad_lote: registro.cantidad,
        cantidad_facturada: registro.cantidad_facturada,
        cantidad_eliminada: cantidadReal
      });

      if (registro.cantidad_facturada === 0) {
        // Si no hay facturadas, eliminar el registro completamente
        await pool.query(
          `INSERT INTO AuditoriaTrazabilidad 
           (tabla_afectada, id_registro, accion, datos_nuevos, usuario_sistema, id_usuario)
           VALUES ('PiezaPintada', ?, 'DELETE', ?, 'app_user', ?)`,
          [idNum, datosEliminacion, session.id_usuario]
        );

        await pool.query(
          `DELETE FROM PiezaPintada WHERE id_pieza_pintada = ?`,
          [idNum]
        );
      } else {
        // Si hay facturadas, solo reducir la cantidad a las facturadas
        await pool.query(
          `INSERT INTO AuditoriaTrazabilidad 
           (tabla_afectada, id_registro, accion, datos_nuevos, usuario_sistema, id_usuario)
           VALUES ('PiezaPintada', ?, 'DELETE', ?, 'app_user', ?)`,
          [idNum, datosEliminacion, session.id_usuario]
        );

        await pool.query(
          `UPDATE PiezaPintada 
           SET cantidad = ?, consumo_estimado_kg = ?
           WHERE id_pieza_pintada = ?`,
          [registro.cantidad_facturada, Number((consumoPorPieza * registro.cantidad_facturada).toFixed(4)), idNum]
        );
      }

      return NextResponse.json({ 
        ok: true, 
        message: `Lote finalizado: ${cantidadReal} piezas pendientes eliminadas.${registro.cantidad_facturada > 0 ? ` Quedan ${registro.cantidad_facturada} facturadas.` : ''}`,
        eliminadas: cantidadReal,
        tipo: "completo"
      });
    } else {
      // MODIFICACIÓN DEL LOTE (eliminación parcial)
      // Datos para UPDATE: fecha, pieza, cabina, pintura, consumo, cantidad lote, facturadas, pendientes restantes, eliminadas
      const datosModificacion = JSON.stringify({
        fecha: registro.fecha,
        pieza_nombre: registro.pieza_nombre || 'N/A',
        cabina_nombre: registro.cabina_nombre || 'N/A',
        pintura_nombre: registro.pintura_nombre || 'N/A',
        consumo_estimado_kg: Number(nuevoConsumo.toFixed(4)),
        cantidad_lote: nuevaCantidad,
        cantidad_facturada: registro.cantidad_facturada,
        cantidad_pendiente: nuevaCantidadPendiente,
        cantidad_eliminada: cantidadReal
      });

      await pool.query(
        `INSERT INTO AuditoriaTrazabilidad 
         (tabla_afectada, id_registro, accion, datos_nuevos, usuario_sistema, id_usuario)
         VALUES ('PiezaPintada', ?, 'UPDATE', ?, 'app_user', ?)`,
        [idNum, datosModificacion, session.id_usuario]
      );

      await pool.query(
        `UPDATE PiezaPintada 
         SET cantidad = ?, consumo_estimado_kg = ?
         WHERE id_pieza_pintada = ?`,
        [nuevaCantidad, Number(nuevoConsumo.toFixed(4)), idNum]
      );

      return NextResponse.json({ 
        ok: true, 
        message: `Lote modificado: ${cantidadReal} piezas eliminadas. Quedan ${nuevaCantidadPendiente} pendientes y ${registro.cantidad_facturada} facturadas.`,
        eliminadas: cantidadReal,
        restantes: nuevaCantidad,
        tipo: "parcial"
      });
    }
  } catch (error) {
    console.error("Error al eliminar pieza pintada:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
