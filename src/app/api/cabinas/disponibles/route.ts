import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { RowDataPacket } from "mysql2";

// GET: Obtener cabinas disponibles (activas) para pintar
export async function GET() {
  try {
    // Reset automático: Si el último uso fue de otro día, resetear piezas_hoy
    const hoy = new Date().toISOString().split('T')[0];
    await pool.query(
      `UPDATE cabina SET piezas_hoy = 0 WHERE ultimo_uso IS NOT NULL AND DATE(ultimo_uso) < ?`,
      [hoy]
    );

    const [cabinas] = await pool.query<RowDataPacket[]>(`
      SELECT 
        c.id_cabina,
        c.nombre,
        c.descripcion,
        c.max_piezas_diarias,
        c.piezas_hoy,
        c.estado,
        c.ultimo_uso,
        ROUND((c.piezas_hoy / c.max_piezas_diarias) * 100, 1) AS porcentaje_uso,
        (c.max_piezas_diarias - c.piezas_hoy) AS disponible
      FROM cabina c
      WHERE c.estado = 'activa'
      ORDER BY porcentaje_uso ASC
    `);

    // Para cada cabina, obtener info resumida de pistolas y hornos
    for (const cabina of cabinas) {
      const [pistolas] = await pool.query<RowDataPacket[]>(`
        SELECT p.id_pistola, p.nombre, p.estado,
          ROUND((p.horas_uso / p.horas_mantenimiento) * 100, 1) AS porcentaje_mantenimiento
        FROM pistola p
        INNER JOIN cabinapistola cp ON p.id_pistola = cp.id_pistola
        WHERE cp.id_cabina = ? AND cp.activa = TRUE AND p.estado = 'activa'
      `, [cabina.id_cabina]);

      const [hornos] = await pool.query<RowDataPacket[]>(`
        SELECT h.id_horno, h.nombre, h.estado,
          ROUND((h.horas_uso / h.horas_mantenimiento) * 100, 1) AS porcentaje_mantenimiento
        FROM horno h
        INNER JOIN cabinahorno ch ON h.id_horno = ch.id_horno
        WHERE ch.id_cabina = ? AND ch.activo = TRUE AND h.estado = 'activo'
      `, [cabina.id_cabina]);

      cabina.pistolas = pistolas;
      cabina.hornos = hornos;
      cabina.tiene_equipos = pistolas.length > 0 && hornos.length > 0;
    }

    // Filtrar solo cabinas que tienen pistola y horno activos
    const cabinasDisponibles = cabinas.filter((c: RowDataPacket) => c.tiene_equipos);

    return NextResponse.json(cabinasDisponibles);
  } catch (error) {
    console.error("Error obteniendo cabinas disponibles:", error);
    return NextResponse.json(
      { error: "Error al obtener cabinas disponibles" },
      { status: 500 }
    );
  }
}
