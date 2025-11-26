import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { RowDataPacket } from "mysql2/promise";

// GET: Listar todos los grupos
export async function GET() {
  const session = await getSession();
  
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const [grupos] = await pool.query<RowDataPacket[]>(`
      SELECT 
        g.id_grupo,
        g.nombre,
        eg.nombre as estado,
        eg.id_estado,
        COUNT(DISTINCT gc.id_componente) as total_componentes
      FROM Grupo g
      LEFT JOIN EstadoGrupo eg ON eg.id_estado = g.id_estado
      LEFT JOIN GrupoComponente gc ON gc.id_grupo = g.id_grupo
      GROUP BY g.id_grupo
      ORDER BY g.nombre
    `);

    return NextResponse.json(grupos);
  } catch (error) {
    console.error("Error obteniendo grupos:", error);
    return NextResponse.json(
      { error: "Error al obtener grupos" },
      { status: 500 }
    );
  }
}
