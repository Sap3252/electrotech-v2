import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { clearSession } from "@/lib/auth";
import { AuditoriaSesion } from "@/domain/auditoriaSesion";

export async function POST(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const match = cookie.match(/session=([^;]+)/);

  if (match) {
    const token = match[1];
    try {
      const decoded: any = jwt.decode(token);
      if (decoded?.idAuditoria) {
        await AuditoriaSesion.registrarLogout(decoded.idAuditoria);
      }
    } catch {}
  }

  clearSession();

  return NextResponse.json({ ok: true });
}
