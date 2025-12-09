import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import crypto from "crypto";
import { transporter } from "@/lib/mail";
import { RowDataPacket } from "mysql2";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM Usuario WHERE email = ?", [
      email,
    ]);

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "El correo no pertenece a ningún usuario" },
        { status: 404 }
      );
    }

    const token = crypto.randomBytes(40).toString("hex");
    const expiresDate = new Date(Date.now() + 60 * 60 * 1000); // 1 hora
    const expiresAt = expiresDate.toISOString().slice(0, 19).replace('T', ' ');

    await pool.query(
      "INSERT INTO ResetPasswordToken (email, token, expires_at) VALUES (?, ?, ?)",
      [email, token, expiresAt]
    );

    const url = `${process.env.APP_URL || "http://localhost:3000"}/reset-password?token=${token}`;


    const info = await transporter.sendMail({
      from: `"ElectroTech" <${process.env.SMTP_USER}>`, 
      to: email,
      subject: "Recuperar contraseña - ElectroTech",
      html: `
        <h2>Restablecer contraseña</h2>
        <p>Hacé clic en el siguiente enlace para cambiar tu contraseña:</p>
        <a href="${url}" target="_blank">${url}</a>
        <p>Este enlace vence en 1 hora.</p>
      `,
    });

    return NextResponse.json({ ok: true, message: "Correo enviado correctamente" });
  } catch (error) {
    console.error("Error en forgot-password:", error);
    return NextResponse.json(
      { error: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}
