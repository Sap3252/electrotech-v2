import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { pool } from "@/lib/db";
import { RowDataPacket } from "mysql2/promise";
import bcrypt from "bcryptjs";

// GET: Listar todos los usuarios con sus grupos
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const connection = await pool.getConnection();
    try {
      // Obtener usuarios con sus grupos
      const [usuarios] = await connection.query<RowDataPacket[]>(`
        SELECT 
          u.id_usuario,
          u.email,
          u.nombre,
          u.apellido,
          GROUP_CONCAT(g.nombre ORDER BY g.nombre SEPARATOR ', ') as grupos,
          GROUP_CONCAT(g.id_grupo ORDER BY g.nombre SEPARATOR ',') as id_grupos
        FROM Usuario u
        LEFT JOIN GrupoUsuario gu ON gu.id_usuario = u.id_usuario
        LEFT JOIN Grupo g ON g.id_grupo = gu.id_grupo
        GROUP BY u.id_usuario
        ORDER BY u.email
      `);

      return NextResponse.json(usuarios);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    return NextResponse.json(
      { error: "Error al obtener usuarios" },
      { status: 500 }
    );
  }
}

// POST: Crear nuevo usuario
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Solo Admin puede crear usuarios
    if (!session.grupos.includes("Admin")) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    const body = await request.json();
    const { email, password, nombre, apellido, grupos } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña son requeridos" },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Verificar si el email ya existe
      const [existente] = await connection.query<RowDataPacket[]>(
        "SELECT id_usuario FROM Usuario WHERE email = ?",
        [email]
      );

      if (existente.length > 0) {
        await connection.rollback();
        return NextResponse.json(
          { error: "El email ya está registrado" },
          { status: 400 }
        );
      }

      // Hash de la contraseña
      const passwordHash = await bcrypt.hash(password, 10);

      // Insertar usuario
      const [resultado] = await connection.query(
        `INSERT INTO Usuario (email, password_hash, nombre, apellido) 
         VALUES (?, ?, ?, ?)`,
        [email, passwordHash, nombre || null, apellido || null]
      );

      const id_usuario = (resultado as any).insertId;

      // Asignar grupos si se proporcionaron
      if (grupos && Array.isArray(grupos) && grupos.length > 0) {
        const values = grupos.map((id_grupo: number) => [id_usuario, id_grupo]);
        await connection.query(
          "INSERT INTO GrupoUsuario (id_usuario, id_grupo) VALUES ?",
          [values]
        );
      }

      await connection.commit();

      return NextResponse.json(
        { message: "Usuario creado exitosamente", id_usuario },
        { status: 201 }
      );
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error al crear usuario:", error);
    return NextResponse.json(
      { error: "Error al crear usuario" },
      { status: 500 }
    );
  }
}
