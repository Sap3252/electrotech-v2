import nodemailer from "nodemailer";

// Validar que las credenciales estén configuradas
// Usamos prefijo ELECTROTECH_ para evitar conflictos con variables de entorno del sistema
if (!process.env.ELECTROTECH_SMTP_USER || !process.env.ELECTROTECH_SMTP_PASS) {
  throw new Error("ELECTROTECH_SMTP_USER y ELECTROTECH_SMTP_PASS deben estar configurados en .env.local");
}

console.log("📧 Configurando email con:", process.env.ELECTROTECH_SMTP_USER);

// Configuración del transporter de nodemailer
export const transporter = nodemailer.createTransport({
  host: process.env.ELECTROTECH_SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.ELECTROTECH_SMTP_PORT) || 465,
  secure: true, // true para 465, false para otros puertos
  auth: {
    user: process.env.ELECTROTECH_SMTP_USER,
    pass: process.env.ELECTROTECH_SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false
  },
  pool: true, // Usar pool de conexiones
  maxConnections: 1, // Limitar a 1 conexión
  maxMessages: 3, // Máximo de mensajes por conexión
  rateDelta: 1000, // Tiempo entre mensajes (1 segundo)
  rateLimit: 3, // Máximo 3 emails por segundo
  authMethod: "PLAIN" // Forzar autenticación PLAIN
});

/*
// Verificacion de la conexión al iniciar
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
*/