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
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    await pool.query(
      "INSERT INTO ResetPasswordToken (email, token, expires_at) VALUES (?, ?, ?)",
      [email, token, expires]
    );

    const url = `${process.env.APP_URL || "http://localhost:3000"}/reset-password?token=${token}`;

    console.log("📧 Enviando correo desde:", process.env.SMTP_USER);
    console.log("📧 Enviando correo a:", email);
    
    // Mensaje del mail de recuperacion
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

    console.log("✅ Correo enviado exitosamente");
    console.log("📧 Enviado desde:", info.envelope.from);
    console.log("📧 Message ID:", info.messageId);
    return NextResponse.json({ ok: true, message: "Correo enviado correctamente" });
  } catch (error) {
    console.error("Error en forgot-password:", error);
    return NextResponse.json(
      { error: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}
