import { getSupabaseAdmin } from "@/lib/supabase/admin";

// ── Database abstraction layer — Supabase PostgreSQL ──
// Column mapping: DB uses snake_case (created_at, body_type), API returns camelCase (createdAt, bodyType).
// All existing frontend code continues to use camelCase — no frontend changes needed.

// ── Helpers ──

type Row = Record<string, unknown>;

/** Map snake_case DB columns back to camelCase for the frontend. */
function toCamel(row: Row): Row {
  const out: Row = {};
  for (const [key, value] of Object.entries(row)) {
    const camel = key.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
    out[camel] = value;
  }
  return out;
}

function toCamelList(rows: Row[]): Row[] {
  return rows.map(toCamel);
}

/** Map camelCase data keys to snake_case for DB writes. */
function toSnake(data: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    const snake = key.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
    out[snake] = value;
  }
  return out;
}

const supabase = () => getSupabaseAdmin();

// ponytail: When Supabase is not configured, return empty results for build-time static generation
const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return !!(url && url.startsWith("http") && key && key !== "your-service-role-key");
};

// ── Generic CRUD helpers ──

async function dbSelect(table: string, where?: Record<string, unknown>, order?: string) {
  const client = supabase();
  if (!client) return [];
  const { data, error } = await client
    .from(table)
    .select("*")
    .match(where ?? {})
    .order(order ?? "id", { ascending: true });
  if (error) throw error;
  return toCamelList(data ?? []);
}

async function dbFind(table: string, field: string, value: unknown) {
  const client = supabase();
  if (!client) return null;
  const { data, error } = await client
    .from(table)
    .select("*")
    .eq(field, value)
    .maybeSingle();
  if (error) throw error;
  return data ? toCamel(data) : null;
}

async function dbInsert(table: string, data: Record<string, unknown>) {
  const client = supabase();
  if (!client) throw new Error("Supabase not configured");
  const { error } = await client.from(table).insert(toSnake(data));
  if (error) throw error;
  return data;
}

async function dbUpdate(table: string, id: string, data: Record<string, unknown>) {
  const client = supabase();
  if (!client) throw new Error("Supabase not configured");
  const { error } = await client.from(table).update(toSnake(data)).eq("id", id);
  if (error) throw error;
  return { id, ...data };
}

async function dbDelete(table: string, id: string) {
  const client = supabase();
  if (!client) throw new Error("Supabase not configured");
  const { error } = await client.from(table).delete().eq("id", id);
  if (error) throw error;
}

async function dbCount(table: string) {
  const client = supabase();
  if (!client) return 0;
  const { count, error } = await client
    .from(table)
    .select("*", { count: "exact", head: true });
  if (error) throw error;
  return count ?? 0;
}

// ── Table-specific helpers ──

export const vehicles = {
  list: async () => {
    const client = supabase();
    if (!client) return [];
    const { data, error } = await client
      .from("vehicles")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return toCamelList(data ?? []);
  },
  find: (id: string) => dbFind("vehicles", "id", id),
  findBySlug: (slug: string) => dbFind("vehicles", "slug", slug),
  create: (data: Record<string, unknown>) => dbInsert("vehicles", data),
  update: (id: string, data: Record<string, unknown>) => dbUpdate("vehicles", id, data),
  delete: (id: string) => dbDelete("vehicles", id),
  count: () => dbCount("vehicles"),
};

export const testimonials = {
  list: () => dbSelect("testimonials", undefined, "sort_order"),
  find: (id: string) => dbFind("testimonials", "id", id),
  create: (data: Record<string, unknown>) => dbInsert("testimonials", data),
  update: (id: string, data: Record<string, unknown>) => dbUpdate("testimonials", id, data),
  delete: (id: string) => dbDelete("testimonials", id),
};

export const faqs = {
  list: () => dbSelect("faqs", undefined, "sort_order"),
  find: (id: string) => dbFind("faqs", "id", id),
  create: (data: Record<string, unknown>) => dbInsert("faqs", data),
  update: (id: string, data: Record<string, unknown>) => dbUpdate("faqs", id, data),
  delete: (id: string) => dbDelete("faqs", id),
};

export const features = {
  list: () => dbSelect("features", undefined, "sort_order"),
  find: (id: string) => dbFind("features", "id", id),
  create: (data: Record<string, unknown>) => dbInsert("features", data),
  update: (id: string, data: Record<string, unknown>) => dbUpdate("features", id, data),
  delete: (id: string) => dbDelete("features", id),
};

export const processSteps = {
  list: () => dbSelect("process_steps", undefined, "step"),
  find: (step: number) => dbFind("process_steps", "step", step),
  create: (data: Record<string, unknown>) => dbInsert("process_steps", data),
  update: (step: number, data: Record<string, unknown>) => {
    const client = supabase();
    if (!client) throw new Error("Supabase not configured");
    return client.from("process_steps").update(toSnake(data)).eq("step", step).then(({ error }) => {
      if (error) throw error;
      return { step, ...data };
    });
  },
  delete: (step: number) => {
    const client = supabase();
    if (!client) throw new Error("Supabase not configured");
    return client.from("process_steps").delete().eq("step", step).then(({ error }) => {
      if (error) throw error;
    });
  },
};

export const quotes = {
  list: () => dbSelect("quotes", undefined, "created_at"),
  find: (id: string) => dbFind("quotes", "id", id),
  create: (data: Record<string, unknown>) => dbInsert("quotes", data),
  update: (id: string, data: Record<string, unknown>) => dbUpdate("quotes", id, data),
  delete: (id: string) => dbDelete("quotes", id),
  count: () => dbCount("quotes"),
};

export const admins = {
  findByEmail: (email: string) => dbFind("admins", "email", email),
  findFirst: async () => {
    const client = supabase();
    if (!client) return null;
    const { data, error } = await client.from("admins").select("*").limit(1).maybeSingle();
    if (error) throw error;
    return data ? toCamel(data) : null;
  },
  create: (data: Record<string, unknown>) => dbInsert("admins", data),
};

export const gallery = {
  list: async () => {
    const client = supabase();
    if (!client) return [];
    const { data, error } = await client
      .from("gallery")
      .select("*")
      .eq("active", 1)
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return toCamelList(data ?? []);
  },
  listAll: async () => {
    const client = supabase();
    if (!client) return [];
    const { data, error } = await client
      .from("gallery")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return toCamelList(data ?? []);
  },
  find: (id: string) => dbFind("gallery", "id", id),
  create: (data: Record<string, unknown>) => dbInsert("gallery", data),
  update: (id: string, data: Record<string, unknown>) => dbUpdate("gallery", id, data),
  delete: (id: string) => dbDelete("gallery", id),
  count: () => dbCount("gallery"),
};

export const brands = {
  list: async () => {
    const client = supabase();
    if (!client) return [];
    const { data, error } = await client
      .from("brands")
      .select("*")
      .eq("active", 1)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });
    if (error) throw error;
    return toCamelList(data ?? []);
  },
  listAll: async () => {
    const client = supabase();
    if (!client) return [];
    const { data, error } = await client
      .from("brands")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });
    if (error) throw error;
    return toCamelList(data ?? []);
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
    const client = supabase();
    if (!client) return [];
    const { data, error } = await client
      .from("users")
      .select("id, name, email, whatsapp, country, created_at")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return toCamelList(data ?? []);
  },
  find: (id: string) => dbFind("users", "id", id),
  findByEmail: (email: string) => dbFind("users", "email", email),
  create: (data: Record<string, unknown>) => dbInsert("users", data),
  update: (id: string, data: Record<string, unknown>) => dbUpdate("users", id, data),
  count: () => dbCount("users"),
};

export const favorites = {
  listByUser: async (userId: string) => {
    const client = supabase();
    if (!client) return [];
    const { data, error } = await client
      .from("favorites")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return toCamelList(data ?? []);
  },
  listByUserWithVehicle: async (userId: string) => {
    const client = supabase();
    if (!client) return [];
    const { data, error } = await client
      .from("favorites")
      .select(
        `id, user_id, vehicle_id, created_at,
         vehicles!inner(slug, brand, model, year, price, fuel, body_type, transmission, image, badge, engine, condition, availability)`,
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    // Manual mapping: favorites + nested vehicles
    return (data ?? []).map((row: Record<string, unknown>) => {
      const v = row.vehicles as Record<string, unknown> | undefined;
      return {
        favId: row.id,
        userId: row.user_id,
        vehicleId: row.vehicle_id,
        favoritedAt: row.created_at,
        slug: v?.slug,
        brand: v?.brand,
        model: v?.model,
        year: v?.year,
        price: v?.price,
        fuel: v?.fuel,
        bodyType: (v?.body_type as string) ?? "",
        transmission: v?.transmission,
        image: v?.image,
        badge: v?.badge,
        engine: v?.engine,
        condition: v?.condition,
        availability: v?.availability,
      };
    });
  },
  find: async (userId: string, vehicleId: string) => {
    const client = supabase();
    if (!client) return null;
    const { data, error } = await client
      .from("favorites")
      .select("*")
      .eq("user_id", userId)
      .eq("vehicle_id", vehicleId)
      .maybeSingle();
    if (error) throw error;
    return data ? toCamel(data) : null;
  },
  add: async (userId: string, vehicleId: string) => {
    const id = `fav-${userId}-${vehicleId}`;
    return dbInsert("favorites", { id, userId, vehicleId });
  },
  remove: async (userId: string, vehicleId: string) => {
    const client = supabase();
    if (!client) return;
    const { error } = await client
      .from("favorites")
      .delete()
      .eq("user_id", userId)
      .eq("vehicle_id", vehicleId);
    if (error) throw error;
  },
  isFavorited: async (userId: string, vehicleId: string) => {
    const client = supabase();
    if (!client) return false;
    const { count } = await client
      .from("favorites")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("vehicle_id", vehicleId);
    return (count ?? 0) > 0;
  },
};

export const userQuotes = {
  listByUser: (userId: string) => dbSelect("quotes", { user_id: userId }, "created_at"),
};