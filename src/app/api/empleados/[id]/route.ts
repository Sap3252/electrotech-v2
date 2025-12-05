import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { pool } from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";

// GET - Obtener empleado por ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const id_empleado = parseInt(id);

    if (isNaN(id_empleado)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const connection = await pool.getConnection();
    try {
      const [empleados] = await connection.query<RowDataPacket[]>(
        `SELECT 
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
          e.created_at
        FROM empleado e
        WHERE e.id_empleado = ?`,
        [id_empleado]
      );

      if (empleados.length === 0) {
        return NextResponse.json(
          { error: "Empleado no encontrado" },
          { status: 404 }
        );
      }

      return NextResponse.json(empleados[0]);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error al obtener empleado:", error);
    return NextResponse.json(
      { error: "Error al obtener empleado" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar empleado
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const id_empleado = parseInt(id);

    if (isNaN(id_empleado)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const body = await request.json();
    const { nombre, apellido, funcion, telefono, dni, direccion, salario_base, fecha_ingreso, activo } = body;

    const connection = await pool.getConnection();
    try {
      // Verificar que el empleado existe
      const [existente] = await connection.query<RowDataPacket[]>(
        "SELECT id_empleado FROM empleado WHERE id_empleado = ?",
        [id_empleado]
      );

      if (existente.length === 0) {
        return NextResponse.json(
          { error: "Empleado no encontrado" },
          { status: 404 }
        );
      }

      // Verificar DNI duplicado (si se cambió)
      if (dni) {
        const [dniExistente] = await connection.query<RowDataPacket[]>(
          "SELECT id_empleado FROM empleado WHERE dni = ? AND id_empleado != ?",
          [dni, id_empleado]
        );

        if (dniExistente.length > 0) {
          return NextResponse.json(
            { error: "Ya existe otro empleado con ese DNI" },
            { status: 400 }
          );
        }
      }

      await connection.query<ResultSetHeader>(
        `UPDATE empleado SET 
          nombre = COALESCE(?, nombre),
          apellido = COALESCE(?, apellido),
          funcion = ?,
          telefono = ?,
          dni = COALESCE(?, dni),
          direccion = ?,
          salario_base = COALESCE(?, salario_base),
          fecha_ingreso = ?,
          activo = COALESCE(?, activo)
        WHERE id_empleado = ?`,
        [
          nombre,
          apellido,
          funcion || null,
          telefono || null,
          dni,
          direccion || null,
          salario_base,
          fecha_ingreso || null,
          activo,
          id_empleado
        ]
      );

      return NextResponse.json({ mensaje: "Empleado actualizado exitosamente" });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error al actualizar empleado:", error);
    return NextResponse.json(
      { error: "Error al actualizar empleado" },
      { status: 500 }
    );
  }
}

// DELETE - Desactivar empleado (soft delete)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const id_empleado = parseInt(id);

    if (isNaN(id_empleado)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const connection = await pool.getConnection();
    try {
      const [resultado] = await connection.query<ResultSetHeader>(
        "UPDATE empleado SET activo = 0 WHERE id_empleado = ?",
        [id_empleado]
      );

      if (resultado.affectedRows === 0) {
        return NextResponse.json(
          { error: "Empleado no encontrado" },
          { status: 404 }
        );
      }

      return NextResponse.json({ mensaje: "Empleado desactivado exitosamente" });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error al desactivar empleado:", error);
    return NextResponse.json(
      { error: "Error al desactivar empleado" },
      { status: 500 }
    );
  }
}
