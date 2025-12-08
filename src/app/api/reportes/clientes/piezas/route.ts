import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getSession, hasPermission } from "@/lib/auth";
import { RowDataPacket } from "mysql2/promise";

export async function GET() {
  const session = await getSession();

  // Verificar acceso al componente Participacion Clientes (ID 116)
  if (!session || !(await hasPermission(session, 116))) {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  try {
    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT 
        c.nombre AS cliente,
        SUM(fd.cantidad) AS piezas_totales,
        ROUND(
            SUM(fd.cantidad) / 
            (SELECT SUM(fd2.cantidad) FROM FacturaDetalle fd2) * 100,
            2
        ) AS porcentaje
      FROM FacturaDetalle fd
      JOIN Factura f ON f.id_factura = fd.id_factura
      JOIN Cliente c ON c.id_cliente = f.id_cliente
      GROUP BY c.id_cliente
      ORDER BY piezas_totales DESC
    `);

    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
