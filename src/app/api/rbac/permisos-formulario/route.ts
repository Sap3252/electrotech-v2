import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { pool } from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { RBACCompositeBuilder } from "@/domain/rbacComposite";

// Obtiene todos los componentes de un formulario con sus permisos para el usuario actual
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { ruta } = await request.json();
    if (!ruta) {
      return NextResponse.json({ error: "Ruta requerida" }, { status: 400 });
    }

    // Obtener grupos activos del usuario
    const gruposIds = await RBACCompositeBuilder.getGruposActivosUsuario(session.id_usuario);
    
    // Si es Admin, tiene acceso a todo
    const esAdmin = session.grupos.includes("Admin");

    // Obtener todos los componentes del formulario
    const [componentes] = await pool.query<RowDataPacket[]>(
      `SELECT c.id_componente, c.nombre, c.tipo, c.activo
       FROM Componente c
       JOIN Formulario f ON f.id_formulario = c.id_formulario
       WHERE f.ruta = ? AND c.activo = 1`,
      [ruta]
    );

    // Obtener permisos de los grupos del usuario para estos componentes
    let permisosMap = new Map<number, boolean>();
    
    if (gruposIds.length > 0 && !esAdmin) {
      const [permisos] = await pool.query<RowDataPacket[]>(
        `SELECT DISTINCT gc.id_componente
         FROM GrupoComponente gc
         JOIN Componente c ON c.id_componente = gc.id_componente
         JOIN Formulario f ON f.id_formulario = c.id_formulario
         WHERE f.ruta = ? AND gc.id_grupo IN (?)`,
        [ruta, gruposIds]
      );
      
      permisos.forEach((p: RowDataPacket) => {
        permisosMap.set(p.id_componente, true);
      });
    }

    // Construir respuesta
    const resultado = componentes.map((c: RowDataPacket) => ({
      id_componente: c.id_componente,
      nombre: c.nombre,
      tipo: c.tipo,
      tieneAcceso: esAdmin || permisosMap.has(c.id_componente)
    }));

    return NextResponse.json({
      ruta,
      esAdmin,
      gruposActivos: gruposIds,
      componentes: resultado
    });

  } catch (error) {
    console.error("Error obteniendo permisos de formulario:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
