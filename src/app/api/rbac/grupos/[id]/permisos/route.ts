import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getSession, hasGroup } from "@/lib/auth";
import { RowDataPacket } from "mysql2/promise";

//Obtener permisos de un grupo
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const { id } = await params;
    
    const [permisos] = await pool.query<RowDataPacket[]>(`
      SELECT 
        gc.id_componente,
        c.nombre as componente,
        f.nombre as formulario,
        m.nombre as modulo
      FROM GrupoComponente gc
      JOIN Componente c ON c.id_componente = gc.id_componente
      JOIN Formulario f ON f.id_formulario = c.id_formulario
      JOIN Modulo m ON m.id_modulo = f.id_modulo
      WHERE gc.id_grupo = ?
      ORDER BY m.orden, f.orden, c.id_componente
    `, [id]);

    return NextResponse.json(permisos);
  } catch (error) {
    console.error("Error obteniendo permisos:", error);
    return NextResponse.json(
      { error: "Error al obtener permisos" },
      { status: 500 }
    );
  }
}

//Actualizar permisos de un grupo (sobrescribir)
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  
  if (!session || !hasGroup(session, "Admin")) {
    return NextResponse.json(
      { error: "Acceso denegado - Solo administradores" },
      { status: 403 }
    );
  }

  const conn = await pool.getConnection();
  
  try {
    const { id } = await params;
    const { componentes } = await req.json();

    if (!Array.isArray(componentes)) {
      return NextResponse.json(
        { error: "El campo 'componentes' debe ser un array" },
        { status: 400 }
      );
    }

    await conn.beginTransaction();

    // Eliminar permisos existentes
    await conn.execute(
      "DELETE FROM GrupoComponente WHERE id_grupo = ?",
      [id]
    );

    //Insertar nuevos permisos
    if (componentes.length > 0) {
      const values = componentes.map(id_componente => [id, id_componente]);
      await conn.query(
        "INSERT INTO GrupoComponente (id_grupo, id_componente) VALUES ?",
        [values]
      );
    }

    await conn.commit();

    return NextResponse.json({
      ok: true,
      mensaje: `Se actualizaron ${componentes.length} permisos para el grupo`,
    });
  } catch (error) {
    await conn.rollback();
    console.error("Error actualizando permisos:", error);
    return NextResponse.json(
      { error: "Error al actualizar permisos" },
      { status: 500 }
    );
  } finally {
    conn.release();
  }
}

//Agregar un permiso al grupo
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  
  if (!session || !hasGroup(session, "Admin")) {
    return NextResponse.json(
      { error: "Acceso denegado" },
      { status: 403 }
    );
  }

  try {
    const { id } = await params;
    const { id_componente } = await req.json();

    await pool.execute(
      "INSERT IGNORE INTO GrupoComponente (id_grupo, id_componente) VALUES (?, ?)",
      [id, id_componente]
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error agregando permiso:", error);
    return NextResponse.json(
      { error: "Error al agregar permiso" },
      { status: 500 }
    );
  }
}

//Remover un permiso del grupo
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  
  if (!session || !hasGroup(session, "Admin")) {
    return NextResponse.json(
      { error: "Acceso denegado" },
      { status: 403 }
    );
  }

  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const id_componente = searchParams.get("id_componente");

    if (!id_componente) {
      return NextResponse.json(
        { error: "Falta parámetro id_componente" },
        { status: 400 }
      );
    }

    await pool.execute(
      "DELETE FROM GrupoComponente WHERE id_grupo = ? AND id_componente = ?",
      [id, id_componente]
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error eliminando permiso:", error);
    return NextResponse.json(
      { error: "Error al eliminar permiso" },
      { status: 500 }
    );
  }
}
