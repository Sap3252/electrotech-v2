import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { pool } from "@/lib/db";
import { RowDataPacket } from "mysql2/promise";
import bcrypt from "bcryptjs";

// GET: Obtener usuario específico
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const id_usuario = parseInt(id);

    const connection = await pool.getConnection();
    try {
      const [usuarios] = await connection.query<RowDataPacket[]>(
        `SELECT 
          u.id_usuario,
          u.email,
          u.nombre,
          u.apellido
        FROM Usuario u
        WHERE u.id_usuario = ?`,
        [id_usuario]
      );

      if (usuarios.length === 0) {
        return NextResponse.json(
          { error: "Usuario no encontrado" },
          { status: 404 }
        );
      }

      // Obtener grupos del usuario
      const [grupos] = await connection.query<RowDataPacket[]>(
        `SELECT g.id_grupo, g.nombre
         FROM GrupoUsuario gu
         JOIN Grupo g ON g.id_grupo = gu.id_grupo
         WHERE gu.id_usuario = ?`,
        [id_usuario]
      );

      return NextResponse.json({
        ...usuarios[0],
        grupos: grupos.map((g) => g.id_grupo),
        grupos_nombres: grupos.map((g) => g.nombre),
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    return NextResponse.json(
      { error: "Error al obtener usuario" },
      { status: 500 }
    );
  }
}

// PUT: Actualizar usuario
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Solo Admin puede modificar usuarios
    if (!session.grupos.includes("Admin")) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    const { id } = await params;
    const id_usuario = parseInt(id);
    const body = await request.json();
    const { email, password, nombre, apellido, grupos } = body;

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Verificar si el email ya existe en otro usuario
      if (email) {
        const [existente] = await connection.query<RowDataPacket[]>(
          "SELECT id_usuario FROM Usuario WHERE email = ? AND id_usuario != ?",
          [email, id_usuario]
        );

        if (existente.length > 0) {
          await connection.rollback();
          return NextResponse.json(
            { error: "El email ya está registrado" },
            { status: 400 }
          );
        }
      }

      // Construir query de actualización
      const updates: string[] = [];
      const values: any[] = [];

      if (email !== undefined) {
        updates.push("email = ?");
        values.push(email);
      }
      if (nombre !== undefined) {
        updates.push("nombre = ?");
        values.push(nombre);
      }
      if (apellido !== undefined) {
        updates.push("apellido = ?");
        values.push(apellido);
      }
      if (password) {
        updates.push("password_hash = ?");
        const passwordHash = await bcrypt.hash(password, 10);
        values.push(passwordHash);
      }

      if (updates.length > 0) {
        values.push(id_usuario);
        await connection.query(
          `UPDATE Usuario SET ${updates.join(", ")} WHERE id_usuario = ?`,
          values
        );
      }

      // Actualizar grupos si se proporcionaron
      if (grupos !== undefined && Array.isArray(grupos)) {
        // Eliminar grupos actuales
        await connection.query(
          "DELETE FROM GrupoUsuario WHERE id_usuario = ?",
          [id_usuario]
        );

        // Insertar nuevos grupos
        if (grupos.length > 0) {
          const values = grupos.map((id_grupo: number) => [
            id_usuario,
            id_grupo,
          ]);
          await connection.query(
            "INSERT INTO GrupoUsuario (id_usuario, id_grupo) VALUES ?",
            [values]
          );
        }
      }

      await connection.commit();

      return NextResponse.json({ message: "Usuario actualizado exitosamente" });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    return NextResponse.json(
      { error: "Error al actualizar usuario" },
      { status: 500 }
    );
  }
}

// DELETE: Eliminar usuario
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Solo Admin puede eliminar usuarios
    if (!session.grupos.includes("Admin")) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    const { id } = await params;
    const id_usuario = parseInt(id);

    // No permitir que se elimine a sí mismo
    if (id_usuario === session.id_usuario) {
      return NextResponse.json(
        { error: "No puedes eliminar tu propio usuario" },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();
    try {
      // Las relaciones UsuarioGrupo se eliminan por CASCADE
      await connection.query("DELETE FROM Usuario WHERE id_usuario = ?", [
        id_usuario,
      ]);

      return NextResponse.json({ message: "Usuario eliminado exitosamente" });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    return NextResponse.json(
      { error: "Error al eliminar usuario" },
      { status: 500 }
    );
  }
}
