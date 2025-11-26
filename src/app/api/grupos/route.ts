import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { pool } from "@/lib/db";
import { RowDataPacket } from "mysql2/promise";

// GET: Listar todos los grupos con conteo de usuarios
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const connection = await pool.getConnection();
    try {
      const [grupos] = await connection.query<RowDataPacket[]>(`
        SELECT 
          g.id_grupo,
          g.nombre,
          g.id_estado,
          e.nombre AS estado,
          COALESCE(u.total, 0) AS total_usuarios,
          COALESCE(p.total, 0) AS total_permisos
        FROM Grupo g
        LEFT JOIN EstadoGrupo e ON e.id_estado = g.id_estado
        LEFT JOIN (
          SELECT id_grupo, COUNT(DISTINCT id_usuario) as total
          FROM GrupoUsuario
          GROUP BY id_grupo
        ) u ON u.id_grupo = g.id_grupo
        LEFT JOIN (
          SELECT id_grupo, COUNT(DISTINCT id_componente) as total
          FROM GrupoComponente
          GROUP BY id_grupo
        ) p ON p.id_grupo = g.id_grupo
        ORDER BY g.nombre
      `);

      return NextResponse.json(grupos);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error al obtener grupos:", error);
    return NextResponse.json(
      { error: "Error al obtener grupos" },
      { status: 500 }
    );
  }
}

// POST: Crear nuevo grupo
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Solo Admin puede crear grupos
    if (!session.grupos.includes("Admin")) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    const body = await request.json();
    const { nombre, id_estado } = body;

    if (!nombre) {
      return NextResponse.json(
        { error: "El nombre es requerido" },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();
    try {
      // Verificar si el nombre ya existe
      const [existente] = await connection.query<RowDataPacket[]>(
        "SELECT id_grupo FROM Grupo WHERE nombre = ?",
        [nombre]
      );

      if (existente.length > 0) {
        return NextResponse.json(
          { error: "Ya existe un grupo con ese nombre" },
          { status: 400 }
        );
      }

      const [resultado] = await connection.query(
        "INSERT INTO Grupo (nombre, id_estado) VALUES (?, ?)",
        [nombre, id_estado || 1]
      );

      const id_grupo = (resultado as any).insertId;

      return NextResponse.json(
        { message: "Grupo creado exitosamente", id_grupo },
        { status: 201 }
      );
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error al crear grupo:", error);
    return NextResponse.json(
      { error: "Error al crear grupo" },
      { status: 500 }
    );
  }
}
