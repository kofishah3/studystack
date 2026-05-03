import "server-only";
import { Pool, type PoolClient, type QueryResultRow } from "pg";

declare global {
  var __pgPool: Pool | undefined;
}

export const pool: Pool =
  globalThis.__pgPool ??
  new Pool({
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    database: process.env.DB_NAME || "studystack",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "",
    max: 10,
  });

if (process.env.NODE_ENV !== "production") globalThis.__pgPool = pool;

export async function q<T extends QueryResultRow>(
  sql: string,
  params: readonly unknown[] = [],
): Promise<T[]> {
  const res = await pool.query<T>(sql, params as unknown[]);
  return res.rows;
}

export async function one<T extends QueryResultRow>(
  sql: string,
  params: readonly unknown[] = [],
): Promise<T | null> {
  const rows = await q<T>(sql, params);
  return rows[0] ?? null;
}

export async function qOn<T extends QueryResultRow>(
  client: PoolClient,
  sql: string,
  params: readonly unknown[] = [],
): Promise<T[]> {
  const res = await client.query<T>(sql, params as unknown[]);
  return res.rows;
}

export async function oneOn<T extends QueryResultRow>(
  client: PoolClient,
  sql: string,
  params: readonly unknown[] = [],
): Promise<T | null> {
  const rows = await qOn<T>(client, sql, params);
  return rows[0] ?? null;
}

export async function withTransaction<T>(
  fn: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    try {
      await client.query("ROLLBACK");
    } catch {
      // ignore rollback errors; surface the original
    }
    throw err;
  } finally {
    client.release();
  }
}
