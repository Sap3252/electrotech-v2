import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function middleware(req: Request) {
  const url = new URL(req.url);

  if (url.pathname === "/") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (url.pathname.startsWith("/login") ||
      url.pathname.startsWith("/register") ||
      url.pathname.startsWith("/forgot-password"))
    return NextResponse.next();

  const session = await getSession();
  if (!session)
    return NextResponse.redirect(new URL("/login", req.url));

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
