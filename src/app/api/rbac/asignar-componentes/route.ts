import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getSession, isAdmin } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getSession();
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  try {
    const { id_grupo, componentes } = await req.json();

    if (!id_grupo || !Array.isArray(componentes)) {
      return NextResponse.json(
        { error: "id_grupo y componentes son requeridos" },
        { status: 400 }
      );
    }

    // Iniciar transaccion
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Eliminar todos los permisos actuales del grupo
      await connection.query(
        "DELETE FROM GrupoComponente WHERE id_grupo = ?",
        [id_grupo]
      );

      if (componentes.length > 0) {
        const values = componentes.map((id_componente) => [id_grupo, id_componente]);
        await connection.query(
          "INSERT INTO GrupoComponente (id_grupo, id_componente) VALUES ?",
          [values]
        );
      }

      await connection.commit();
      
      return NextResponse.json({ 
        ok: true, 
        message: "Permisos actualizados exitosamente" 
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error al asignar componentes:", error);
    return NextResponse.json(
      { error: "Error al asignar componentes" },
      { status: 500 }
    );
  }
}
