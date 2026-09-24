import { Pool } from 'pg';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

let pool: Pool | null = null;
let sqliteDb: Database.Database | null = null;
let isSqlite = false;

// Check if PostgreSQL is configured
const dbUrl = process.env.DATABASE_URL;

if (dbUrl) {
  try {
    pool = new Pool({
      connectionString: dbUrl,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });
    console.log('[DB] Configured PostgreSQL Pool with DATABASE_URL');
  } catch (err) {
    console.warn('[DB] Failed to initialize PostgreSQL pool, falling back to SQLite:', err);
    initSqlite();
  }
} else {
  initSqlite();
}

const stmtCache = new Map<string, any>();

function initSqlite() {
  isSqlite = true;
  const dbDir = path.resolve(__dirname, '../../../database');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  const dbPath = path.join(dbDir, 'mastery_hub.sqlite');
  sqliteDb = new Database(dbPath);
  sqliteDb.pragma('journal_mode = WAL');
  sqliteDb.pragma('synchronous = NORMAL');
  sqliteDb.pragma('cache_size = -64000');
  sqliteDb.pragma('temp_store = MEMORY');
  sqliteDb.pragma('foreign_keys = ON');
  console.log(`[DB] Using SQLite local database at: ${dbPath}`);
}

function getPreparedStatement(sqliteSql: string) {
  if (!sqliteDb) throw new Error('[DB] SQLite DB not initialized');
  let stmt = stmtCache.get(sqliteSql);
  if (!stmt) {
    stmt = sqliteDb.prepare(sqliteSql);
    stmtCache.set(sqliteSql, stmt);
  }
  return stmt;
}

export async function query(sql: string, params: any[] = []): Promise<any> {
  if (isSqlite && sqliteDb) {
    // Convert booleans to 1 or 0 for SQLite
    const safeParams = params.map((p) => (typeof p === 'boolean' ? (p ? 1 : 0) : p));

    // Handle repeated $1, $2 by mapping each matched $n to its corresponding parameter
    const paramMatches = [...sql.matchAll(/\$(\d+)/g)];
    const expandedParams = paramMatches.length > 0
      ? paramMatches.map((m) => safeParams[parseInt(m[1], 10) - 1])
      : safeParams;

    // Translate postgres parameterized queries ($1, $2, ...) to sqlite ?
    let sqliteSql = sql.replace(/\$\d+/g, '?');

    // Convert PostgreSQL specific keywords if any
    sqliteSql = sqliteSql
      .replace(/TIMESTAMP WITH TIME ZONE/gi, 'DATETIME')
      .replace(/SERIAL PRIMARY KEY/gi, 'INTEGER PRIMARY KEY AUTOINCREMENT');

    try {
      const trimmed = sqliteSql.trim().toUpperCase();
      const stmt = getPreparedStatement(sqliteSql);
      if (trimmed.startsWith('SELECT') || trimmed.startsWith('WITH') || trimmed.startsWith('PRAGMA')) {
        const rows = stmt.all(...expandedParams);
        return { rows, rowCount: rows.length };
      } else {
        const info = stmt.run(...expandedParams);
        return {
          rows: info.lastInsertRowid ? [{ id: info.lastInsertRowid }] : [],
          rowCount: info.changes,
          lastInsertRowid: info.lastInsertRowid,
        };
      }
    } catch (error: any) {
      console.error('[DB] SQLite Query Error:', error.message, '\nSQL:', sqliteSql, '\nParams:', params);
      throw error;
    }
  } else if (pool) {
    try {
      const res = await pool.query(sql, params);
      return res;
    } catch (error: any) {
      console.error('[DB] Postgres Query Error:', error.message, '\nSQL:', sql, '\nParams:', params);
      throw error;
    }
  } else {
    throw new Error('[DB] No database connection available');
  }
}

export async function getOne(sql: string, params: any[] = []): Promise<any> {
  const result = await query(sql, params);
  return result.rows && result.rows.length > 0 ? result.rows[0] : null;
}

export async function getAll(sql: string, params: any[] = []): Promise<any[]> {
  const result = await query(sql, params);
  return result.rows || [];
}

export async function initSchema(): Promise<void> {
  const schemaPath = path.resolve(__dirname, '../../../database/schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  if (isSqlite && sqliteDb) {
    // Adapt schema for SQLite
    const cleanSql = schemaSql
      .replace(/--.*$/gm, '') // remove comments
      .replace(/TIMESTAMP WITH TIME ZONE/gi, 'DATETIME')
      .replace(/SERIAL PRIMARY KEY/gi, 'INTEGER PRIMARY KEY AUTOINCREMENT');

    const statements = cleanSql
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const stmt of statements) {
      try {
        sqliteDb.exec(stmt + ';');
      } catch (err: any) {
        if (!err.message.includes('already exists')) {
          console.warn('[DB Schema SQLite Warn]:', err.message, '\nIn statement:', stmt.slice(0, 60));
        }
      }
    }
    console.log('[DB] SQLite Schema tables verified/created successfully.');
  } else if (pool) {
    await pool.query(schemaSql);
    console.log('[DB] PostgreSQL Schema tables verified/created successfully.');
  }
}

export { isSqlite };
