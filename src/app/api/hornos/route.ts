import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

// GET: Obtener todos los hornos
export async function GET() {
  try {
    const [hornos] = await pool.query<RowDataPacket[]>(`
      SELECT 
        h.*,
        ROUND((h.horas_uso / h.horas_mantenimiento) * 100, 1) AS porcentaje_mantenimiento,
        CASE 
          WHEN h.horas_uso >= h.horas_mantenimiento THEN 'URGENTE'
          WHEN h.horas_uso >= h.horas_mantenimiento * 0.9 THEN 'PRONTO'
          ELSE 'OK'
        END AS alerta_mantenimiento
      FROM horno h
      ORDER BY h.nombre
    `);

    return NextResponse.json(hornos);
  } catch (error) {
    console.error("Error obteniendo hornos:", error);
    return NextResponse.json(
      { error: "Error al obtener hornos" },
      { status: 500 }
    );
  }
}

// POST: Crear nuevo horno
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nombre, descripcion, horas_mantenimiento, temperatura_max, gasto_gas_hora } = body;

    if (!nombre) {
      return NextResponse.json(
        { error: "El nombre es requerido" },
        { status: 400 }
      );
    }

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO horno (nombre, descripcion, horas_mantenimiento, temperatura_max, gasto_gas_hora) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        nombre, 
        descripcion || null, 
        horas_mantenimiento || 1000,
        temperatura_max || 200,
        gasto_gas_hora || 0
      ]
    );

    return NextResponse.json(
      { id_horno: result.insertId, message: "Horno creado exitosamente" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creando horno:", error);
    return NextResponse.json(
      { error: "Error al crear horno" },
      { status: 500 }
    );
  }
}
