import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function middleware(req: Request) {
  const url = new URL(req.url);

  // Redirigir raíz al login
  if (url.pathname === "/") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  //Rutas públicas
  if (url.pathname.startsWith("/login") ||
      url.pathname.startsWith("/register") ||
      url.pathname.startsWith("/forgot-password"))
    return NextResponse.next();

  //Verificar sesión activa
  const session = await getSession();
  if (!session)
    return NextResponse.redirect(new URL("/login", req.url));

  //RBAC se maneja en ProtectedPage y ProtectedComponent
  //Este middleware solo verifica autenticación
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/piezas/:path*",
    "/pinturas/:path*",
    "/facturacion/:path*",
    "/remitos/:path*",
    "/maquinarias/:path*",
    "/empleados/:path*",
    "/dashboard/:path*",
  ],
};
