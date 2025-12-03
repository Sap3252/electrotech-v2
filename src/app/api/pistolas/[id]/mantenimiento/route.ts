import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { ResultSetHeader } from "mysql2";

// POST: Registrar mantenimiento de pistola (resetear horas de uso)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE pistola SET 
        horas_uso = 0,
        ultimo_mantenimiento = CURDATE(),
        estado = 'activa'
      WHERE id_pistola = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: "Pistola no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      message: "Mantenimiento registrado exitosamente. Horas de uso reseteadas." 
    });
  } catch (error) {
    console.error("Error registrando mantenimiento:", error);
    return NextResponse.json(
      { error: "Error al registrar mantenimiento" },
      { status: 500 }
    );
  }
}
