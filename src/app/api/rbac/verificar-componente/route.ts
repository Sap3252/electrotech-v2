import { NextResponse } from "next/server";
import { getSession, hasPermission } from "@/lib/auth";

//Verificar si el usuario tiene acceso a un componente especifico
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id_componente } = await request.json();

    if (!id_componente) {
      return NextResponse.json(
        { error: "id_componente es requerido" },
        { status: 400 }
      );
    }

    const tieneAcceso = await hasPermission(session, id_componente);

    return NextResponse.json({ 
      tieneAcceso,
      id_usuario: session.id_usuario,
      grupos: session.grupos 
    });
  } catch (error) {
    console.error("Error verificando acceso a componente:", error);
    return NextResponse.json(
      { error: "Error al verificar acceso" },
      { status: 500 }
    );
  }
}
