import { NextResponse } from "next/server";
import { getSession, hasCoreAccess } from "@/lib/auth";

export async function middleware(req: Request) {
  const url = new URL(req.url);

  // Rutas públicas
  if (url.pathname.startsWith("/login") ||
      url.pathname.startsWith("/register") ||
      url.pathname.startsWith("/forgot-password"))
    return NextResponse.next();

  const session = await getSession();
  if (!session)
    return NextResponse.redirect(new URL("/login", req.url));

  // Mapear rutas a Cores
  const CORE_ROUTES: Record<string, number> = {
    "/piezas": 1,
    "/pinturas": 1,
    "/facturacion": 2,
    "/remitos": 2,
    "/maquinarias": 3,
    "/empleados": 4,
  };

  const pathname = url.pathname;
  const matched = Object.keys(CORE_ROUTES).find((r) => pathname.startsWith(r));

  if (matched) {
    const core = CORE_ROUTES[matched];
    if (!hasCoreAccess(session, core))
      return NextResponse.redirect(new URL("/dashboard?denied=1", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/piezas/:path*",
    "/pinturas/:path*",
    "/facturacion/:path*",
    "/remitos/:path*",
    "/maquinarias/:path*",
    "/empleados/:path*",
    "/dashboard/:path*",
  ],
};
