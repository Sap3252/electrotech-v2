import { NextResponse } from "next/server";
import { getSession, hasFormularioAccess } from "@/lib/auth";

//Verificar si el usuario tiene acceso a una ruta especifica
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { ruta } = await request.json();

    if (!ruta) {
      return NextResponse.json(
        { error: "Ruta es requerida" },
        { status: 400 }
      );
    }

    console.log(`[verificar-acceso] Usuario ${session.id_usuario} (grupos: ${session.grupos.join(',')}) verificando acceso a: ${ruta}`);

    const tieneAcceso = await hasFormularioAccess(session, ruta);
    
    console.log(`[verificar-acceso] Resultado para ${ruta}: ${tieneAcceso ? 'PERMITIDO' : 'DENEGADO'}`);

    // Consultar únicamente los grupos INACTIVOS/SUSPENDIDOS del usuario
    // que además tienen permisos sobre el formulario/route solicitado.
    try {
      const { pool } = await import("@/lib/db");
      const [rows] = await pool.query(
        `SELECT DISTINCT g.id_grupo, g.nombre, g.id_estado, eg.nombre as estado
         FROM GrupoUsuario gu
         JOIN Grupo g ON g.id_grupo = gu.id_grupo
         LEFT JOIN EstadoGrupo eg ON eg.id_estado = g.id_estado
         JOIN GrupoComponente gc ON gc.id_grupo = g.id_grupo
         JOIN Componente c ON c.id_componente = gc.id_componente
         JOIN Formulario f ON f.id_formulario = c.id_formulario
         WHERE gu.id_usuario = ? AND (f.ruta = ? OR f.ruta LIKE CONCAT(?, '/%')) AND g.id_estado <> 1`,
        [session.id_usuario, ruta, ruta]
      );

      type GrupoInactivaRuta = {
        id_grupo: number;
        nombre: string;
        id_estado: number;
        estado: string;
      };

      const gruposInactivasRuta = (rows as GrupoInactivaRuta[]).map((r) => ({
        id_grupo: r.id_grupo,
        nombre: r.nombre,
        id_estado: r.id_estado,
        estado: r.estado,
      }));

      return NextResponse.json({
        tieneAcceso,
        grupos: session.grupos,
        grupos_inactivas_ruta: gruposInactivasRuta,
      });
    } catch (err) {
      console.error("Error obteniendo estados de grupos for ruta:", err);
      return NextResponse.json({ tieneAcceso, grupos: session.grupos, grupos_inactivas_ruta: [] });
    }
  } catch (error) {
    console.error("Error verificando acceso:", error);
    return NextResponse.json(
      { error: "Error al verificar acceso" },
      { status: 500 }
    );
  }
}
