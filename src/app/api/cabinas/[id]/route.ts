import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

// GET: Obtener cabina por ID con sus pistolas y hornos
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [cabinas] = await pool.query<RowDataPacket[]>(
      `SELECT c.*, 
        ROUND((c.piezas_hoy / c.max_piezas_diarias) * 100, 1) AS porcentaje_uso
      FROM cabina c WHERE c.id_cabina = ?`,
      [id]
    );

    if (cabinas.length === 0) {
      return NextResponse.json(
        { error: "Cabina no encontrada" },
        { status: 404 }
      );
    }

    const cabina = cabinas[0];

    // Obtener pistolas asignadas
    const [pistolas] = await pool.query<RowDataPacket[]>(`
      SELECT p.* 
      FROM pistola p
      INNER JOIN cabinapistola cp ON p.id_pistola = cp.id_pistola
      WHERE cp.id_cabina = ? AND cp.activa = TRUE
    `, [id]);

    // Obtener hornos asignados
    const [hornos] = await pool.query<RowDataPacket[]>(`
      SELECT h.* 
      FROM horno h
      INNER JOIN cabinahorno ch ON h.id_horno = ch.id_horno
      WHERE ch.id_cabina = ? AND ch.activo = TRUE
    `, [id]);

    cabina.pistolas = pistolas;
    cabina.hornos = hornos;

    return NextResponse.json(cabina);
  } catch (error) {
    console.error("Error obteniendo cabina:", error);
    return NextResponse.json(
      { error: "Error al obtener cabina" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { nombre, descripcion, max_piezas_diarias, estado, pistolas_ids, hornos_ids } = body;

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Actualizar cabina
      await connection.query<ResultSetHeader>(
        `UPDATE cabina SET 
          nombre = COALESCE(?, nombre),
          descripcion = COALESCE(?, descripcion),
          max_piezas_diarias = COALESCE(?, max_piezas_diarias),
          estado = COALESCE(?, estado)
        WHERE id_cabina = ?`,
        [nombre, descripcion, max_piezas_diarias, estado, id]
      );

      // Si se proporcionaron pistolas, actualizar asignaciones
      if (pistolas_ids !== undefined) {
        // Desactivar asignaciones actuales
        await connection.query(
          `UPDATE cabinapistola SET activa = FALSE WHERE id_cabina = ?`,
          [id]
        );

        // Crear nuevas asignaciones
        for (const id_pistola of pistolas_ids) {
          await connection.query(
            `INSERT INTO cabinapistola (id_cabina, id_pistola, activa) 
             VALUES (?, ?, TRUE)
             ON DUPLICATE KEY UPDATE activa = TRUE, fecha_asignacion = CURDATE()`,
            [id, id_pistola]
          );
        }
      }

      // Si se proporcionaron hornos, actualizar asignaciones
      if (hornos_ids !== undefined) {
        // Desactivar asignaciones actuales
        await connection.query(
          `UPDATE cabinahorno SET activo = FALSE WHERE id_cabina = ?`,
          [id]
        );

        // Crear nuevas asignaciones
        for (const id_horno of hornos_ids) {
          await connection.query(
            `INSERT INTO cabinahorno (id_cabina, id_horno, activo) 
             VALUES (?, ?, TRUE)
             ON DUPLICATE KEY UPDATE activo = TRUE, fecha_asignacion = CURDATE()`,
            [id, id_horno]
          );
        }
      }

      await connection.commit();

      return NextResponse.json({ message: "Cabina actualizada exitosamente" });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error actualizando cabina:", error);
    return NextResponse.json(
      { error: "Error al actualizar cabina" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [result] = await pool.query<ResultSetHeader>(
      `DELETE FROM cabina WHERE id_cabina = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: "Cabina no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Cabina eliminada exitosamente" });
  } catch (error) {
    console.error("Error eliminando cabina:", error);
    return NextResponse.json(
      { error: "Error al eliminar cabina" },
      { status: 500 }
    );
  }
}
