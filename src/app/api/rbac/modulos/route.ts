import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { RowDataPacket } from "mysql2/promise";

//Obtener estructura completa de modulos, formularios y componentes
export async function GET() {
  const session = await getSession();
  
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const [modulos] = await pool.query<RowDataPacket[]>(`
      SELECT 
        m.id_modulo,
        m.nombre,
        m.descripcion,
        m.icono,
        m.orden
      FROM Modulo m
      WHERE m.activo = TRUE
      ORDER BY m.orden
    `);

    // Cargar formularios y componentes para cada modulo
    for (const modulo of modulos) {
      const [formularios] = await pool.query<RowDataPacket[]>(`
        SELECT 
          f.id_formulario,
          f.nombre,
          f.ruta,
          f.descripcion,
          f.icono,
          f.orden
        FROM Formulario f
        WHERE f.id_modulo = ? AND f.activo = TRUE
        ORDER BY f.orden
      `, [modulo.id_modulo]);

      for (const formulario of formularios) {
        const [componentes] = await pool.query<RowDataPacket[]>(`
          SELECT 
            c.id_componente,
            c.nombre,
            c.descripcion,
            c.tipo
          FROM Componente c
          WHERE c.id_formulario = ? AND c.activo = TRUE
          ORDER BY c.id_componente
        `, [formulario.id_formulario]);

        formulario.componentes = componentes;
      }

      modulo.formularios = formularios;
    }

    return NextResponse.json(modulos);
  } catch (error) {
    console.error("Error obteniendo estructura RBAC:", error);
    return NextResponse.json(
      { error: "Error al obtener estructura de permisos" },
      { status: 500 }
    );
  }
}
