import { getSqliteDb, sqliteQuery, sqliteRun } from "./sqlite";
import type { Database } from "sql.js";

// ── Database abstraction layer ──
// Local dev: SQLite via sql.js (WASM)
// Production: Switch to Supabase PostgreSQL

// ponytail: no module-level db cache here. getSqliteDb() already caches by
// file mtime, and Turbopack gives each API route its own module instance —
// a cache at this layer would silently serve stale data after writes from
// another route. Delegating to getSqliteDb() every call is the correct fix.
async function getDb(): Promise<Database> {
  return getSqliteDb();
}

// ── Generic CRUD helpers ──

export async function dbQuery(table: string, where?: string, params?: unknown[]) {
  const db = await getDb();
  const sql = where
    ? `SELECT * FROM ${table} WHERE ${where} ORDER BY rowid`
    : `SELECT * FROM ${table} ORDER BY rowid`;
  return sqliteQuery(db, sql, params ?? []);
}

export async function dbFind(table: string, field: string, value: unknown) {
  const db = await getDb();
  const rows = sqliteQuery(db, `SELECT * FROM ${table} WHERE ${field} = ?`, [value]);
  return rows[0] ?? null;
}

export async function dbInsert(table: string, data: Record<string, unknown>) {
  const db = await getDb();
  const keys = Object.keys(data);
  const values = Object.values(data);
  const placeholders = keys.map(() => "?").join(", ");
  const sql = `INSERT INTO ${table} (${keys.join(", ")}) VALUES (${placeholders})`;
  sqliteRun(db, sql, values);
  return data;
}

export async function dbUpdate(table: string, id: string, data: Record<string, unknown>) {
  const db = await getDb();
  const keys = Object.keys(data);
  const values = Object.values(data);
  const setClause = keys.map((k) => `${k} = ?`).join(", ");
  const sql = `UPDATE ${table} SET ${setClause} WHERE id = ?`;
  sqliteRun(db, sql, [...values, id]);
  return { id, ...data };
}

export async function dbDelete(table: string, id: string) {
  const db = await getDb();
  sqliteRun(db, `DELETE FROM ${table} WHERE id = ?`, [id]);
}

export async function dbCount(table: string) {
  const db = await getDb();
  const rows = sqliteQuery(db, `SELECT COUNT(*) as count FROM ${table}`);
  return (rows[0]?.count as number) ?? 0;
}

// ── Table-specific helpers ──

export const vehicles = {
  list: async () => {
    const db = await getDb();
    // Newest first — admin-added vehicles appear at top of featured/inventory
    return sqliteQuery(db, "SELECT * FROM vehicles ORDER BY createdAt DESC, rowid DESC");
  },
  find: (id: string) => dbFind("vehicles", "id", id),
  findBySlug: (slug: string) => dbFind("vehicles", "slug", slug),
  create: (data: Record<string, unknown>) => dbInsert("vehicles", data),
  update: (id: string, data: Record<string, unknown>) => dbUpdate("vehicles", id, data),
  delete: (id: string) => dbDelete("vehicles", id),
  count: () => dbCount("vehicles"),
};

export const testimonials = {
  list: () => dbQuery("testimonials"),
  find: (id: string) => dbFind("testimonials", "id", id),
  create: (data: Record<string, unknown>) => dbInsert("testimonials", data),
  update: (id: string, data: Record<string, unknown>) => dbUpdate("testimonials", id, data),
  delete: (id: string) => dbDelete("testimonials", id),
};

export const faqs = {
  list: () => dbQuery("faqs"),
  find: (id: string) => dbFind("faqs", "id", id),
  create: (data: Record<string, unknown>) => dbInsert("faqs", data),
  update: (id: string, data: Record<string, unknown>) => dbUpdate("faqs", id, data),
  delete: (id: string) => dbDelete("faqs", id),
};

export const features = {
  list: () => dbQuery("features"),
  find: (id: string) => dbFind("features", "id", id),
  create: (data: Record<string, unknown>) => dbInsert("features", data),
  update: (id: string, data: Record<string, unknown>) => dbUpdate("features", id, data),
  delete: (id: string) => dbDelete("features", id),
};

export const processSteps = {
  list: () => dbQuery("process_steps"),
  find: (step: number) => dbFind("process_steps", "step", step),
  create: (data: Record<string, unknown>) => dbInsert("process_steps", data),
  update: (step: number, data: Record<string, unknown>) => {
    const db = getDb();
    // sync but ok for now
    return db.then((d) => {
      const keys = Object.keys(data);
      const values = Object.values(data);
      const setClause = keys.map((k) => `${k} = ?`).join(", ");
      sqliteRun(d, `UPDATE process_steps SET ${setClause} WHERE step = ?`, [...values, step]);
      return { step, ...data };
    });
  },
  delete: (step: number) => dbDelete("process_steps", String(step)),
};

export const quotes = {
  list: () => dbQuery("quotes"),
  find: (id: string) => dbFind("quotes", "id", id),
  create: (data: Record<string, unknown>) => dbInsert("quotes", data),
  update: (id: string, data: Record<string, unknown>) => dbUpdate("quotes", id, data),
  delete: (id: string) => dbDelete("quotes", id),
  count: () => dbCount("quotes"),
};

export const admins = {
  findByEmail: (email: string) => dbFind("admins", "email", email),
  create: (data: Record<string, unknown>) => dbInsert("admins", data),
};

export const gallery = {
  list: async () => {
    const db = await getDb();
    // Newest first — admin-added photos/videos appear at top of homepage gallery
    return sqliteQuery(db, "SELECT * FROM gallery WHERE active = 1 ORDER BY rowid DESC");
  },
  listAll: async () => {
    const db = await getDb();
    return sqliteQuery(db, "SELECT * FROM gallery ORDER BY rowid DESC");
  },
  find: (id: string) => dbFind("gallery", "id", id),
  create: (data: Record<string, unknown>) => dbInsert("gallery", data),
  update: (id: string, data: Record<string, unknown>) => dbUpdate("gallery", id, data),
  delete: (id: string) => dbDelete("gallery", id),
  count: () => dbCount("gallery"),
};

export const brands = {
  list: async () => {
    const db = await getDb();
    return sqliteQuery(db, "SELECT * FROM brands WHERE active = 1 ORDER BY sortOrder, name");
  },
  listAll: async () => {
    const db = await getDb();
    return sqliteQuery(db, "SELECT * FROM brands ORDER BY sortOrder, name");
  },
  find: (id: string) => dbFind("brands", "id", id),
  findByName: (name: string) => dbFind("brands", "name", name),
  create: (data: Record<string, unknown>) => dbInsert("brands", data),
  update: (id: string, data: Record<string, unknown>) => dbUpdate("brands", id, data),
  delete: (id: string) => dbDelete("brands", id),
  count: () => dbCount("brands"),
};

export const users = {
  list: async () => {
    const db = await getDb();
    // Don't return password hashes
    return sqliteQuery(db, "SELECT id, name, email, whatsapp, country, createdAt FROM users ORDER BY createdAt DESC");
  },
  find: (id: string) => dbFind("users", "id", id),
  findByEmail: (email: string) => dbFind("users", "email", email),
  create: (data: Record<string, unknown>) => dbInsert("users", data),
  update: (id: string, data: Record<string, unknown>) => dbUpdate("users", id, data),
  count: () => dbCount("users"),
};

export const favorites = {
  listByUser: (userId: string) => dbQuery("favorites", "userId = ?", [userId]),
  // JOIN with vehicles so the account page can render real cards without N+1 lookups.
  listByUserWithVehicle: async (userId: string) => {
    const db = await getDb();
    return sqliteQuery(
      db,
      `SELECT f.id as favId, f.userId, f.vehicleId, f.createdAt as favoritedAt,
              v.slug, v.brand, v.model, v.year, v.price, v.fuel, v.bodyType,
              v.transmission, v.image, v.badge, v.engine, v.condition, v.availability
       FROM favorites f
       JOIN vehicles v ON v.id = f.vehicleId
       WHERE f.userId = ?
       ORDER BY f.rowid DESC`,
      [userId],
    );
  },
  find: (userId: string, vehicleId: string) => {
    const db = getDb();
    return db.then((d) => {
      const rows = sqliteQuery(d, "SELECT * FROM favorites WHERE userId = ? AND vehicleId = ?", [userId, vehicleId]);
      return rows[0] ?? null;
    });
  },
  add: (userId: string, vehicleId: string) => {
    const id = `fav-${userId}-${vehicleId}`;
    return dbInsert("favorites", { id, userId, vehicleId });
  },
  remove: (userId: string, vehicleId: string) => {
    const db = getDb();
    return db.then((d) => {
      sqliteRun(d, "DELETE FROM favorites WHERE userId = ? AND vehicleId = ?", [userId, vehicleId]);
    });
  },
  isFavorited: (userId: string, vehicleId: string) => {
    const db = getDb();
    return db.then((d) => {
      const rows = sqliteQuery(d, "SELECT 1 FROM favorites WHERE userId = ? AND vehicleId = ?", [userId, vehicleId]);
      return rows.length > 0;
    });
  },
};

// Quotes by user
export const userQuotes = {
  listByUser: (userId: string) => dbQuery("quotes", "userId = ?", [userId]),
};
