import nodemailer from "nodemailer";

// Configuración del transporter de nodemailer para Gmail
export const transporter = nodemailer.createTransport({
  service: "gmail", // Usar el servicio de Gmail directamente
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verificar la conexión al iniciar (opcional)
export async function verifyMailConnection() {
  try {
    await transporter.verify();
    console.log("✅ Servidor de correo listo");
    return true;
  } catch (error) {
    console.error("❌ Error al conectar con el servidor de correo:", error);
    return false;
  }
}