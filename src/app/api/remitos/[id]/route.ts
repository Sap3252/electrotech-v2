import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getSession, hasPermission } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  
  // Verificar acceso al componente Ver Detalle de remitos (ID 12)
  if (!session || !(await hasPermission(session, 12))) {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const [rows] = await pool.query(
      `
      SELECT r.*, c.nombre, c.apellido
      FROM Remito r
      JOIN Cliente c ON c.id_cliente = r.id_cliente
      WHERE r.id_remito = ?
      `,
      [id]
    );

    if ((rows as any[]).length === 0) {
      return NextResponse.json({ error: "Remito no encontrado" }, { status: 404 });
    }

    return NextResponse.json((rows as any[])[0]);
  } catch (error) {
    console.error("Error obteniendo remito:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
