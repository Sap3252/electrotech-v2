import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getSession, hasPermission } from "@/lib/auth";
import { ResultSetHeader } from "mysql2";

// PUT: Actualizar política (activar/desactivar)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();

  // Verificar permiso (ID 134 - Botón Activar/Desactivar Política)
  if (!session || !(await hasPermission(session, 134))) {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const { activa } = body;

    await pool.query<ResultSetHeader>(
      `UPDATE politica_backup SET activa = ? WHERE id_politica = ?`,
      [activa, id]
    );

    return NextResponse.json({ message: "Política actualizada" });
  } catch (error) {
    console.error("Error actualizando política:", error);
    return NextResponse.json(
      { error: "Error al actualizar política" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();

  // Verificar permiso (ID 135 - Botón Eliminar Política)
  if (!session || !(await hasPermission(session, 135))) {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  try {
    const { id } = await params;

    await pool.query<ResultSetHeader>(
      `DELETE FROM politica_backup WHERE id_politica = ?`,
      [id]
    );

    return NextResponse.json({ message: "Política eliminada" });
  } catch (error) {
    console.error("Error eliminando política:", error);
    return NextResponse.json(
      { error: "Error al eliminar política" },
      { status: 500 }
    );
  }
}
