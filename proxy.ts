import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function proxy(req: NextRequest) {
  const token = req.cookies.get("session")?.value;

  const { pathname } = req.nextUrl;

  // Rutas públicas
  const publicPaths = ["/", "/login", "/register", "/forgot-password", "/reset-password"];
  
  if (publicPaths.includes(pathname) || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Si no hay token, redirigir a login
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Verificar token
  try {
    await jwtVerify(token, SECRET);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
