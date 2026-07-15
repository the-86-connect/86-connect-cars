import initSqlJs, { type Database } from "sql.js";
import { TABLES } from "./schema";
import fs from "fs";
import path from "path";

// Use absolute path to avoid cwd issues in Next.js
const DB_PATH = path.resolve(process.cwd(), "dev.db");

let db: Database | null = null;
let dbMtime = 0;

export async function getSqliteDb(): Promise<Database> {
  // Check if file changed on disk (handles re-seed)
  try {
    const stat = fs.statSync(DB_PATH);
    if (db && stat.mtimeMs === dbMtime) return db;
    // File changed — invalidate cache
    db = null;
    dbMtime = stat.mtimeMs;
  } catch {
    // File doesn't exist yet — that's fine
  }

  if (db) return db;

  try {
    // In Node.js, sql.js bundles its own WASM file.
    // Pass locateFile explicitly — without it, Turbopack's bundled module
    // resolves the WASM to a wrong path (e.g. D:\ROOT\node_modules\...)
    // in API route contexts, causing ENOENT on every fresh route compile.
    const SQL = await initSqlJs({
      locateFile: (file) => path.join(process.cwd(), "node_modules", "sql.js", "dist", file),
    });

    // Load existing DB or create new one
    if (fs.existsSync(DB_PATH)) {
      const buffer = fs.readFileSync(DB_PATH);
      db = new SQL.Database(buffer);
    } else {
      db = new SQL.Database();
    }

    // Create tables
    for (const sql of Object.values(TABLES)) {
      db.run(sql);
    }

    // Migrations — add columns that don't exist yet (SQLite has no ADD COLUMN IF NOT EXISTS)
    // ponytail: ALTER TABLE errors are caught per-column; safe to run on every startup.
    const migrations = [
      { table: "quotes", column: "deliveryStatus", type: "TEXT DEFAULT 'pending'" },
      { table: "vehicles", column: "video", type: "TEXT" },
    ];
    for (const m of migrations) {
      try {
        db.run(`ALTER TABLE ${m.table} ADD COLUMN ${m.column} ${m.type}`);
      } catch {
        // Column already exists — ignore
      }
    }

    // Save after creating tables
    saveSqliteDb(db);
    dbMtime = Date.now();

    return db;
  } catch (error) {
    console.error("Failed to initialize SQLite:", error);
    throw error;
  }
}

export function saveSqliteDb(database: Database) {
  try {
    const data = database.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  } catch (error) {
    console.error("Failed to save SQLite database:", error);
  }
}

// Helper: run a query and return rows
export function sqliteQuery(database: Database, sql: string, params: unknown[] = []) {
  const stmt = database.prepare(sql);
  if (params.length) stmt.bind(params);
  const rows: Record<string, unknown>[] = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

// Helper: run a mutation (INSERT/UPDATE/DELETE)
export function sqliteRun(database: Database, sql: string, params: unknown[] = []) {
  database.run(sql, params);
  saveSqliteDb(database);
}
