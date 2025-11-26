import { NextResponse } from "next/server";
import { getSession, getAccesibleFormularios } from "@/lib/auth";

//Obtener lista de formularios/páginas a las que el usuario tiene acceso
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const formularios = await getAccesibleFormularios(session);

    return NextResponse.json({ formularios });
  } catch (error) {
    console.error("Error obteniendo formularios accesibles:", error);
    return NextResponse.json(
      { error: "Error al obtener formularios" },
      { status: 500 }
    );
  }
}
