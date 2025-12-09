import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { pool } from "@/lib/db";
import { RowDataPacket } from "mysql2/promise";

//Obtener grupo específico
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
    const id_grupo = parseInt(id);

    const connection = await pool.getConnection();
    try {
      const [grupos] = await connection.query<RowDataPacket[]>(
        `SELECT 
          g.id_grupo,
          g.nombre,
          g.id_estado,
          e.nombre AS estado
        FROM Grupo g
        LEFT JOIN EstadoGrupo e ON e.id_estado = g.id_estado
        WHERE g.id_grupo = ?`,
        [id_grupo]
      );

      if (grupos.length === 0) {
        return NextResponse.json(
          { error: "Grupo no encontrado" },
          { status: 404 }
        );
      }

      return NextResponse.json(grupos[0]);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error al obtener grupo:", error);
    return NextResponse.json(
      { error: "Error al obtener grupo" },
      { status: 500 }
    );
  }
}

//Actualizar grupo
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Solo Admin puede modificar grupos
    if (!session.grupos.includes("Admin")) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    const { id } = await params;
    const id_grupo = parseInt(id);
    const body = await request.json();
    const { nombre, id_estado } = body;

    const connection = await pool.getConnection();
    try {
      // Verificar si el nombre ya existe en otro grupo
      if (nombre) {
        const [existente] = await connection.query<RowDataPacket[]>(
          "SELECT id_grupo FROM Grupo WHERE nombre = ? AND id_grupo != ?",
          [nombre, id_grupo]
        );

        if (existente.length > 0) {
          return NextResponse.json(
            { error: "Ya existe un grupo con ese nombre" },
            { status: 400 }
          );
        }
      }

      // Construir query de actualización
      const updates: string[] = [];
      const values: (string | number)[] = [];

      if (nombre !== undefined) {
        updates.push("nombre = ?");
        values.push(nombre);
      }
      if (id_estado !== undefined) {
        updates.push("id_estado = ?");
        values.push(id_estado);
      }

      if (updates.length > 0) {
        values.push(id_grupo);
        await connection.query(
          `UPDATE Grupo SET ${updates.join(", ")} WHERE id_grupo = ?`,
          values
        );
      }

      return NextResponse.json({ message: "Grupo actualizado exitosamente" });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error al actualizar grupo:", error);
    return NextResponse.json(
      { error: "Error al actualizar grupo" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Solo Admin puede eliminar grupos
    if (!session.grupos.includes("Admin")) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    const { id } = await params;
    const id_grupo = parseInt(id);

    // No permitir eliminar grupo Admin
    if (id_grupo === 1) {
      return NextResponse.json(
        { error: "No se puede eliminar el grupo Admin" },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();
    try {
      // Verificar si hay usuarios en el grupo
      const [usuarios] = await connection.query<RowDataPacket[]>(
        "SELECT COUNT(*) as total FROM GrupoUsuario WHERE id_grupo = ?",
        [id_grupo]
      );

      if (usuarios[0].total > 0) {
        return NextResponse.json(
          {
            error: "No se puede eliminar el grupo porque tiene usuarios asignados",
          },
          { status: 400 }
        );
      }

      // Las relaciones GrupoComponente se eliminan por CASCADE
      await connection.query("DELETE FROM Grupo WHERE id_grupo = ?", [
        id_grupo,
      ]);

      return NextResponse.json({ message: "Grupo eliminado exitosamente" });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error al eliminar grupo:", error);
    return NextResponse.json(
      { error: "Error al eliminar grupo" },
      { status: 500 }
    );
  }
}
