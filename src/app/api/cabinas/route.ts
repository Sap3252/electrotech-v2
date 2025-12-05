import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

// GET: Obtener todas las cabinas con sus pistolas y hornos
export async function GET() {
  try {
    // Reset automático: Si la última fecha registrada en cabinahistorial fue de otro día, resetear piezas_hoy
    const hoy = new Date().toISOString().split('T')[0];
    await pool.query(
      `
      UPDATE cabina c
      JOIN (
        SELECT id_cabina, MAX(fecha) AS last_fecha
        FROM cabinahistorial
        GROUP BY id_cabina
      ) ch ON ch.id_cabina = c.id_cabina
      SET c.piezas_hoy = 0
      WHERE ch.last_fecha IS NOT NULL AND DATE(ch.last_fecha) < ?
      `,
      [hoy]
    );

    // Obtener cabinas
    const [cabinas] = await pool.query<RowDataPacket[]>(`
      SELECT 
        c.id_cabina,
        c.nombre,
        c.descripcion,
        c.max_piezas_diarias,
        c.piezas_hoy,
        c.estado,
        ROUND((c.piezas_hoy / c.max_piezas_diarias) * 100, 1) AS porcentaje_uso
      FROM cabina c
      ORDER BY c.nombre
    `);

    // Para cada cabina, obtener sus pistolas y hornos
    for (const cabina of cabinas) {
      const [pistolas] = await pool.query<RowDataPacket[]>(`
        SELECT p.* 
        FROM pistola p
        INNER JOIN cabinapistola cp ON p.id_pistola = cp.id_pistola
        WHERE cp.id_cabina = ? AND cp.activa = TRUE
      `, [cabina.id_cabina]);

      const [hornos] = await pool.query<RowDataPacket[]>(`
        SELECT h.* 
        FROM horno h
        INNER JOIN cabinahorno ch ON h.id_horno = ch.id_horno
        WHERE ch.id_cabina = ? AND ch.activo = TRUE
      `, [cabina.id_cabina]);

      cabina.pistolas = pistolas;
      cabina.hornos = hornos;
    }

    return NextResponse.json(cabinas);
  } catch (error) {
    console.error("Error obteniendo cabinas:", error);
    return NextResponse.json(
      { error: "Error al obtener cabinas" },
      { status: 500 }
    );
  }
}

// POST: Crear nueva cabina
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nombre, descripcion, max_piezas_diarias, pistolas_ids, hornos_ids } = body;

    if (!nombre) {
      return NextResponse.json(
        { error: "El nombre es requerido" },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Insertar cabina
      const [result] = await connection.query<ResultSetHeader>(
        `INSERT INTO cabina (nombre, descripcion, max_piezas_diarias) VALUES (?, ?, ?)`,
        [nombre, descripcion || null, max_piezas_diarias || 200]
      );

      const id_cabina = result.insertId;

      // Asignar pistolas si se proporcionaron
      if (pistolas_ids && pistolas_ids.length > 0) {
        for (const id_pistola of pistolas_ids) {
          await connection.query(
            `INSERT INTO cabinapistola (id_cabina, id_pistola) VALUES (?, ?)`,
            [id_cabina, id_pistola]
          );
        }
      }

      // Asignar hornos si se proporcionaron
      if (hornos_ids && hornos_ids.length > 0) {
        for (const id_horno of hornos_ids) {
          await connection.query(
            `INSERT INTO cabinahorno (id_cabina, id_horno) VALUES (?, ?)`,
            [id_cabina, id_horno]
          );
        }
      }

      await connection.commit();

      return NextResponse.json(
        { id_cabina, message: "Cabina creada exitosamente" },
        { status: 201 }
      );
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error creando cabina:", error);
    return NextResponse.json(
      { error: "Error al crear cabina" },
      { status: 500 }
    );
  }
}
