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