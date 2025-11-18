const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "electrotechrecuperacion@gmail.com",
    pass: "qrmshtgncedjsfhr",
  },
});

async function testEmail() {
  try {
    console.log("Verificando conexión...");
    await transporter.verify();
    console.log("✅ Conexión exitosa");

    console.log("Enviando correo de prueba...");
    const info = await transporter.sendMail({
      from: "electrotechrecuperacion@gmail.com",
      to: "electrotechrecuperacion@gmail.com",
      subject: "Test de correo",
      text: "Este es un correo de prueba",
    });

    console.log("✅ Correo enviado:", info.messageId);
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

testEmail();
