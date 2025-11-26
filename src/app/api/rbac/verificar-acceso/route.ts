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

    const tieneAcceso = await hasFormularioAccess(session, ruta);

    return NextResponse.json({ 
      tieneAcceso,
      grupos: session.grupos 
    });
  } catch (error) {
    console.error("Error verificando acceso:", error);
    return NextResponse.json(
      { error: "Error al verificar acceso" },
      { status: 500 }
    );
  }
}
