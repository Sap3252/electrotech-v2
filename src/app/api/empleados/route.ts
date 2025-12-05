import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { pool } from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";

// GET - Listar todos los empleados
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const connection = await pool.getConnection();
    try {
      const [empleados] = await connection.query<RowDataPacket[]>(`
        SELECT 
          e.id_empleado,
          e.nombre,
          e.apellido,
          e.funcion,
          e.telefono,
          e.dni,
          e.direccion,
          e.salario_base,
          e.fecha_ingreso,
          e.activo,
          e.created_at,
          (SELECT COUNT(*) FROM asistencia a WHERE a.id_empleado = e.id_empleado AND a.presente = 1) as dias_trabajados,
          (SELECT COUNT(*) FROM asistencia a WHERE a.id_empleado = e.id_empleado AND a.presente = 0) as dias_ausentes
        FROM empleado e
        ORDER BY e.apellido, e.nombre
      `);

      return NextResponse.json(empleados);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error al obtener empleados:", error);
    return NextResponse.json(
      { error: "Error al obtener empleados" },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo empleado
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { nombre, apellido, funcion, telefono, dni, direccion, salario_base, fecha_ingreso } = body;

    // Validaciones
    if (!nombre || !apellido) {
      return NextResponse.json(
        { error: "Nombre y apellido son requeridos" },
        { status: 400 }
      );
    }

    if (!dni) {
      return NextResponse.json(
        { error: "El DNI es requerido" },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();
    try {
      // Verificar si el DNI ya existe
      const [existente] = await connection.query<RowDataPacket[]>(
        "SELECT id_empleado FROM empleado WHERE dni = ?",
        [dni]
      );

      if (existente.length > 0) {
        return NextResponse.json(
          { error: "Ya existe un empleado con ese DNI" },
          { status: 400 }
        );
      }

      const [resultado] = await connection.query<ResultSetHeader>(
        `INSERT INTO empleado (nombre, apellido, funcion, telefono, dni, direccion, salario_base, fecha_ingreso, activo) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [
          nombre,
          apellido,
          funcion || null,
          telefono || null,
          dni,
          direccion || null,
          salario_base || 0,
          fecha_ingreso || null
        ]
      );

      return NextResponse.json({
        id_empleado: resultado.insertId,
        mensaje: "Empleado creado exitosamente"
      }, { status: 201 });

    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error al crear empleado:", error);
    return NextResponse.json(
      { error: "Error al crear empleado" },
      { status: 500 }
    );
  }
}
