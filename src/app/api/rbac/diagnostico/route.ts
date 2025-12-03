import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { pool } from "@/lib/db";
import { RowDataPacket } from "mysql2";

// Endpoint de diagnóstico RBAC - SOLO PARA DESARROLLO
export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const ruta = searchParams.get("ruta") || "/dashboard/maquinarias";

    // 1. Info del usuario y sus grupos
    const [gruposUsuario] = await pool.query<RowDataPacket[]>(
      `SELECT g.id_grupo, g.nombre, g.id_estado, eg.nombre as estado_nombre
       FROM GrupoUsuario gu
       JOIN Grupo g ON g.id_grupo = gu.id_grupo
       LEFT JOIN EstadoGrupo eg ON eg.id_estado = g.id_estado
       WHERE gu.id_usuario = ?`,
      [session.id_usuario]
    );

    // 2. Info del formulario
    const [formulario] = await pool.query<RowDataPacket[]>(
      `SELECT f.id_formulario, f.nombre, f.ruta, f.activo, m.nombre as modulo
       FROM Formulario f
       JOIN Modulo m ON m.id_modulo = f.id_modulo
       WHERE f.ruta = ?`,
      [ruta]
    );

    // 3. Componentes del formulario
    const [componentes] = await pool.query<RowDataPacket[]>(
      `SELECT c.id_componente, c.nombre, c.tipo, c.activo
       FROM Componente c
       JOIN Formulario f ON f.id_formulario = c.id_formulario
       WHERE f.ruta = ?`,
      [ruta]
    );

    // 4. Permisos por componente para los grupos del usuario
    const gruposIds = gruposUsuario.map((g: RowDataPacket) => g.id_grupo);
    const gruposActivos = gruposUsuario
      .filter((g: RowDataPacket) => g.id_estado === 1)
      .map((g: RowDataPacket) => g.id_grupo);

    let permisosComponentes: RowDataPacket[] = [];
    if (gruposActivos.length > 0) {
      const [permisos] = await pool.query<RowDataPacket[]>(
        `SELECT gc.id_componente, gc.id_grupo, g.nombre as grupo_nombre, c.nombre as componente_nombre
         FROM GrupoComponente gc
         JOIN Grupo g ON g.id_grupo = gc.id_grupo
         JOIN Componente c ON c.id_componente = gc.id_componente
         JOIN Formulario f ON f.id_formulario = c.id_formulario
         WHERE f.ruta = ? AND gc.id_grupo IN (?)`,
        [ruta, gruposActivos]
      );
      permisosComponentes = permisos;
    }

    // 5. Verificar si es Admin
    const esAdmin = session.grupos.includes("Admin");

    // 6. Resultado del análisis
    const componentesConPermisos = componentes.map((c: RowDataPacket) => ({
      id_componente: c.id_componente,
      nombre: c.nombre,
      tipo: c.tipo,
      activo: c.activo === 1,
      gruposConPermiso: permisosComponentes
        .filter((p: RowDataPacket) => p.id_componente === c.id_componente)
        .map((p: RowDataPacket) => ({ id_grupo: p.id_grupo, nombre: p.grupo_nombre })),
      tienePermiso: permisosComponentes.some((p: RowDataPacket) => p.id_componente === c.id_componente)
    }));

    const tieneAccesoCalculado = esAdmin || componentesConPermisos.some(c => c.tienePermiso && c.activo);

    return NextResponse.json({
      usuario: {
        id_usuario: session.id_usuario,
        grupos_session: session.grupos,
        es_admin: esAdmin
      },
      grupos_bd: gruposUsuario.map((g: RowDataPacket) => ({
        id_grupo: g.id_grupo,
        nombre: g.nombre,
        id_estado: g.id_estado,
        estado: g.estado_nombre,
        activo: g.id_estado === 1
      })),
      grupos_activos_ids: gruposActivos,
      formulario: formulario[0] || null,
      componentes: componentesConPermisos,
      resumen: {
        ruta_verificada: ruta,
        formulario_encontrado: formulario.length > 0,
        total_componentes: componentes.length,
        componentes_con_permiso: componentesConPermisos.filter(c => c.tienePermiso).length,
        tiene_acceso_calculado: tieneAccesoCalculado,
        razon: esAdmin 
          ? "Es Admin - acceso total" 
          : tieneAccesoCalculado 
            ? `Tiene permiso en ${componentesConPermisos.filter(c => c.tienePermiso).length} componente(s)` 
            : gruposActivos.length === 0 
              ? "No tiene grupos activos"
              : "Ningún grupo activo tiene permisos en componentes de esta ruta"
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Error en diagnóstico RBAC:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
