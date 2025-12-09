import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getSession, hasPermission } from "@/lib/auth";
import { RowDataPacket } from "mysql2";

// GET: Obtener historial de backups (con filtro opcional por política)
export async function GET(req: NextRequest) {
  const session = await getSession();

  // Verificar permiso (ID 130 - Acceso Panel Base de Datos)
  if (!session || !(await hasPermission(session, 130))) {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id_politica = searchParams.get("id_politica");
    const tipo = searchParams.get("tipo");

    let query = `
      SELECT 
        h.*,
        p.nombre as politica_nombre,
        p.tipo as politica_tipo
      FROM historial_backup h
      JOIN politica_backup p ON h.id_politica = p.id_politica
      WHERE 1=1
    `;
    const params: (string | number)[] = [];

    if (id_politica) {
      query += ` AND h.id_politica = ?`;
      params.push(id_politica);
    }

    if (tipo) {
      query += ` AND p.tipo = ?`;
      params.push(tipo);
    }

    query += ` ORDER BY h.fecha_inicio DESC LIMIT 100`;

    const [historial] = await pool.query<RowDataPacket[]>(query, params);

    return NextResponse.json(historial);
  } catch (error) {
    console.error("Error obteniendo historial:", error);
    return NextResponse.json(
      { error: "Error al obtener historial de backups" },
      { status: 500 }
    );
  }
}
