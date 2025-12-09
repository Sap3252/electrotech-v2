import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

// GET: Obtener todas las pistolas
export async function GET() {
  try {
    const [pistolas] = await pool.query<RowDataPacket[]>(`
      SELECT 
        p.*,
        ROUND((p.horas_uso / p.horas_mantenimiento) * 100, 1) AS porcentaje_mantenimiento,
        CASE 
          WHEN p.horas_uso >= p.horas_mantenimiento THEN 'URGENTE'
          WHEN p.horas_uso >= p.horas_mantenimiento * 0.9 THEN 'PRONTO'
          ELSE 'OK'
        END AS alerta_mantenimiento
      FROM pistola p
      ORDER BY p.nombre
    `);

    return NextResponse.json(pistolas);
  } catch (error) {
    console.error("Error obteniendo pistolas:", error);
    return NextResponse.json(
      { error: "Error al obtener pistolas" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nombre, descripcion, horas_mantenimiento } = body;

    if (!nombre) {
      return NextResponse.json(
        { error: "El nombre es requerido" },
        { status: 400 }
      );
    }

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO pistola (nombre, descripcion, horas_mantenimiento) VALUES (?, ?, ?)`,
      [nombre, descripcion || null, horas_mantenimiento || 500]
    );

    return NextResponse.json(
      { id_pistola: result.insertId, message: "Pistola creada exitosamente" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creando pistola:", error);
    return NextResponse.json(
      { error: "Error al crear pistola" },
      { status: 500 }
    );
  }
}
