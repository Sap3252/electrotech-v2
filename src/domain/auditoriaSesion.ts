import { pool } from "@/lib/db";

export class AuditoriaSesion {
  static async registrarLogin(id_usuario: number): Promise<number> {
    const [result]: any = await pool.query(
      "INSERT INTO AuditoriaSesion (id_usuario, fecha_hora_login) VALUES (?, NOW())",
      [id_usuario]
    );
    return result.insertId;
  }

  static async registrarLogout(id_auditoria: number) {
    await pool.query(
      "UPDATE AuditoriaSesion SET fecha_hora_logout = NOW() WHERE id = ?",
      [id_auditoria]
    );
  }
}
