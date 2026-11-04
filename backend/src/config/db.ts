import mysql, { Pool, PoolConnection } from 'mysql2/promise';
import { ENV } from './env';

let pool: Pool;

export async function initDatabaseConnection(): Promise<Pool> {
  if (pool) return pool;

  // First connect without database to ensure database exists
  try {
    const rootConn = await mysql.createConnection({
      host: ENV.DB_HOST,
      port: ENV.DB_PORT,
      user: ENV.DB_USER,
      password: ENV.DB_PASSWORD,
    });
    await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${ENV.DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await rootConn.end();
  } catch (err: any) {
    console.error('Failed to create database if not exists:', err.message);
  }

  // Create pool
  pool = mysql.createPool({
    host: ENV.DB_HOST,
    port: ENV.DB_PORT,
    user: ENV.DB_USER,
    password: ENV.DB_PASSWORD,
    database: ENV.DB_NAME,
    waitForConnections: true,
    connectionLimit: 20,
    queueLimit: 0,
    dateStrings: true,
  });

  return pool;
}

export function getPool(): Pool {
  if (!pool) {
    throw new Error('Database pool has not been initialized yet. Call initDatabaseConnection() first.');
  }
  return pool;
}

export async function query<T = any>(sql: string, params: any[] = []): Promise<T> {
  const p = getPool();
  const [rows] = await p.query(sql, params);
  return rows as T;
}

export async function execute(sql: string, params: any[] = []): Promise<any> {
  const p = getPool();
  const [result] = await p.execute(sql, params);
  return result;
}

export async function getConnection(): Promise<PoolConnection> {
  const p = getPool();
  return await p.getConnection();
}
