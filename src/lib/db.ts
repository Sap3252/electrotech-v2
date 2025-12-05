import mysql from "mysql2/promise";

const portFromEnv = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306;

const dbConfig = {
  host: process.env.DB_HOST!,
  port: Number.isNaN(portFromEnv) ? 3306 : portFromEnv,
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME!,
  waitForConnections: true,
  connectionLimit: 10,
};

export const pool = mysql.createPool(dbConfig);

// Runtime sanity check (only in non-production) to confirm which database the app connects to.
if (process.env.NODE_ENV !== "production") {
  // Print minimal config (no password) so you can confirm the target DB quickly.
  try {
    // eslint-disable-next-line no-console
    console.log('DB config:', { host: dbConfig.host, port: dbConfig.port, user: dbConfig.user, database: dbConfig.database });
  } catch (e) {
    // ignore
  }

  (async () => {
    try {
      const conn = await pool.getConnection();
      const [rows] = await conn.query("SELECT DATABASE() AS db");
      // eslint-disable-next-line no-console
      console.log('Connected database:', (rows as any)[0]?.db);
      conn.release();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('DB connection check failed:', err);
    }
  })();
}