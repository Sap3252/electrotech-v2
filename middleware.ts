import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function middleware(req: NextRequest) {
  console.log("🔒 Middleware ejecutándose para:", req.nextUrl.pathname);
  
  const token = req.cookies.get("session")?.value;
  const { pathname } = req.nextUrl;

  // Rutas públicas
  const publicPaths = ["/", "/login", "/register", "/forgot-password", "/reset-password"];
  
  if (publicPaths.includes(pathname) || pathname.startsWith("/api/auth")) {
    console.log("✅ Ruta pública, permitiendo acceso");
    return NextResponse.next();
  }

  // Si no hay token, redirigir a login
  if (!token) {
    console.log("❌ No hay token, redirigiendo a /login");
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Verificar token
  try {
    await jwtVerify(token, SECRET);
    console.log("✅ Token válido, permitiendo acceso");
    return NextResponse.next();
  } catch (error) {
    console.log("❌ Token inválido, redirigiendo a /login");
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
