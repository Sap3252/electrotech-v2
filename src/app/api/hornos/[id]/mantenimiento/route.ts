import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { ResultSetHeader } from "mysql2";

// POST: Registrar mantenimiento de horno (resetear horas de uso)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE horno SET 
        horas_uso = 0,
        ultimo_mantenimiento = CURDATE(),
        estado = 'activo'
      WHERE id_horno = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: "Horno no encontrado" },
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
