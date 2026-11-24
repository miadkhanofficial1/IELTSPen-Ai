import mysql, { Pool, PoolOptions, RowDataPacket, ResultSetHeader } from "mysql2/promise";

let pool: Pool | null = null;

function createDatabasePool(): Pool {
  // 1. Prioritize discrete TiDB / MySQL credentials from .env.local
  const host = process.env.DB_HOST || process.env.TIDB_HOST;
  const port = parseInt(process.env.DB_PORT || process.env.TIDB_PORT || "4000", 10);
  const user = process.env.DB_USER || process.env.TIDB_USER;
  const password = process.env.DB_PASSWORD || process.env.TIDB_PASSWORD || "";
  const database = process.env.DB_NAME || process.env.TIDB_DATABASE || "ieltspen_ai";

  if (host && user && host !== "localhost") {
    const isTiDBorCloud =
      host.includes("tidbcloud.com") ||
      host.includes("aws") ||
      host.includes("render") ||
      process.env.NODE_ENV === "production" ||
      port === 4000;

    return mysql.createPool({
      host,
      port,
      user,
      password,
      database,
      charset: "utf8mb4",
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      ssl: isTiDBorCloud
        ? {
            minVersion: "TLSv1.2",
            rejectUnauthorized: true,
          }
        : undefined,
    });
  }

  // 2. Full connection URI fallback (Render / Docker)
  const databaseUrl = process.env.DATABASE_URL;
  if (databaseUrl && !databaseUrl.includes("<USERNAME>") && !databaseUrl.includes("placeholder")) {
    return mysql.createPool({
      uri: databaseUrl,
      charset: "utf8mb4",
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      ssl: {
        minVersion: "TLSv1.2",
        rejectUnauthorized: true,
      },
    });
  }

  // 3. Local fallback
  return mysql.createPool({
    host: host || "localhost",
    port,
    user: user || "root",
    password,
    database: database || "ieltspen_ai",
    charset: "utf8mb4",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
}

export function getPool(): Pool {
  if (!pool) {
    pool = createDatabasePool();
  }
  return pool;
}

/**
 * Execute a query that returns multiple rows
 */
export async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const p = getPool();
  const [rows] = await p.query<RowDataPacket[] & T[]>(sql, params);
  return rows as T[];
}

/**
 * Execute a query that returns a single row (or null)
 */
export async function queryOne<T = any>(sql: string, params: any[] = []): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Execute an INSERT / UPDATE / DELETE statement
 */
export async function execute(sql: string, params: any[] = []): Promise<ResultSetHeader> {
  const p = getPool();
  const [result] = await p.execute<ResultSetHeader>(sql, params);
  return result;
}

/**
 * Safe JSON parser for MySQL JSON columns
 */
export function parseJson<T = any>(val: any, fallback: T): T {
  if (val === null || val === undefined) return fallback;
  if (typeof val === "object") return val as T;
  try {
    return JSON.parse(val) as T;
  } catch {
    return fallback;
  }
}
