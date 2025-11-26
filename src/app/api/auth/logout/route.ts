import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { pool } from "@/lib/db";

interface JWTPayload {
  id_usuario: number;
  email: string;
  grupos: string[];
  idAuditoria: number;
}

export async function POST(req: Request) {
  try {
    const cookies = req.headers.get("cookie") ?? "";
    const sessionMatch = cookies.match(/session=([^;]+)/);

    if (!sessionMatch) {
      return NextResponse.json({ error: "No session cookie" }, { status: 400 });
    }

    const token = sessionMatch[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;

    const userId = decoded.id_usuario;

    if (!userId) {
      console.error("No userId found in token:", decoded);
      return NextResponse.json({ error: "Invalid token structure" }, { status: 400 });
    }

    console.log("Logging out user:", userId);

    // guardar logout en auditoria
    await pool.execute(
      `
      UPDATE AuditoriaSesion
      SET fecha_hora_logout = NOW()
      WHERE id_usuario = ? AND fecha_hora_logout IS NULL
      ORDER BY fecha_hora_login DESC
      LIMIT 1
      `,
      [userId]
    );

    // Borrar cookie de sesion
    const res = NextResponse.json({ message: "Logged out" });
    res.cookies.set("session", "", {
      httpOnly: true,
      secure: false,
      path: "/",
      expires: new Date(0),
    });

    return res;

  } catch (error) {
    console.error("Error in logout:", error);
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
