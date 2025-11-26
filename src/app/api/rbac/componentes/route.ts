import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getSession, isAdmin } from "@/lib/auth";
import { RowDataPacket } from "mysql2";

interface ComponenteRow extends RowDataPacket {
  id_componente: number;
  nombre: string;
  id_formulario: number;
  formulario: string;
  formulario_ruta: string;
  modulo: string;
  asignado: number;
}

export async function GET(req: Request) {
  const session = await getSession();
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const idGrupo = searchParams.get("id_grupo");

  if (!idGrupo) {
    return NextResponse.json({ error: "id_grupo es requerido" }, { status: 400 });
  }

  try {
    // Obtener todos los componentes con su informacion de modulo y formulario
    const [componentes] = await pool.query<ComponenteRow[]>(
      `SELECT 
        c.id_componente,
        c.nombre,
        c.id_formulario,
        f.nombre as formulario,
        f.ruta as formulario_ruta,
        m.nombre as modulo,
        CASE WHEN gc.id_grupo IS NOT NULL THEN 1 ELSE 0 END as asignado
      FROM Componente c
      JOIN Formulario f ON c.id_formulario = f.id_formulario
      JOIN Modulo m ON f.id_modulo = m.id_modulo
      LEFT JOIN GrupoComponente gc ON gc.id_componente = c.id_componente AND gc.id_grupo = ?
      ORDER BY m.nombre, f.nombre, c.nombre`,
      [idGrupo]
    );

    return NextResponse.json(
      componentes.map((c) => ({
        id_componente: c.id_componente,
        nombre: c.nombre,
        ruta: c.formulario_ruta,
        id_formulario: c.id_formulario,
        formulario: c.formulario,
        modulo: c.modulo,
        asignado: c.asignado === 1,
      }))
    );
  } catch (error) {
    console.error("Error al cargar componentes:", error);
    return NextResponse.json(
      { error: "Error al cargar componentes" },
      { status: 500 }
    );
  }
}
