-- 86Connect Cars — Initial PostgreSQL Schema
-- Converts the SQLite schema from src/lib/db/schema.ts to PostgreSQL
-- Column naming uses snake_case (PostgreSQL convention)

-- ── Vehicles ──
CREATE TABLE IF NOT EXISTS vehicles (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  price INTEGER NOT NULL,
  fuel TEXT NOT NULL,
  body_type TEXT NOT NULL,
  transmission TEXT NOT NULL,
  condition TEXT DEFAULT 'New',
  availability TEXT DEFAULT 'In Stock',
  image TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  badge TEXT,
  engine TEXT,
  description TEXT,
  specs JSONB DEFAULT '{}'::jsonb,
  features JSONB DEFAULT '[]'::jsonb,
  colors JSONB DEFAULT '[]'::jsonb,
  mileage INTEGER,
  fob_price INTEGER,
  port_of_loading TEXT,
  hand_drive TEXT,
  shipping_estimate TEXT,
  export_docs JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vehicles_slug ON vehicles(slug);
CREATE INDEX idx_vehicles_brand ON vehicles(brand);
CREATE INDEX idx_vehicles_fuel ON vehicles(fuel);
CREATE INDEX idx_vehicles_body_type ON vehicles(body_type);
CREATE INDEX idx_vehicles_created_at ON vehicles(created_at DESC);

-- ── Testimonials ──
CREATE TABLE IF NOT EXISTS testimonials (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT,
  country TEXT,
  flag TEXT,
  rating INTEGER DEFAULT 5,
  quote TEXT NOT NULL,
  avatar TEXT,
  sort_order INTEGER DEFAULT 0,
  active INTEGER DEFAULT 1
);

-- ── FAQs ──
CREATE TABLE IF NOT EXISTS faqs (
  id TEXT PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  active INTEGER DEFAULT 1
);

-- ── Features ──
CREATE TABLE IF NOT EXISTS features (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  active INTEGER DEFAULT 1
);

-- ── Process Steps ──
CREATE TABLE IF NOT EXISTS process_steps (
  step SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  active INTEGER DEFAULT 1
);

-- ── Quotes ──
CREATE TABLE IF NOT EXISTS quotes (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  whatsapp TEXT,
  email TEXT NOT NULL,
  country TEXT,
  vehicle_brand TEXT,
  model TEXT,
  budget TEXT,
  message TEXT,
  status TEXT DEFAULT 'new',
  delivery_status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_quotes_user_id ON quotes(user_id);
CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_quotes_created_at ON quotes(created_at DESC);

-- ── Users (profiles — mirrors Supabase auth.users) ──
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT, -- nullable: Supabase Auth handles password; kept for migration
  whatsapp TEXT,
  country TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

-- ── Favorites ──
CREATE TABLE IF NOT EXISTS favorites (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vehicle_id TEXT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, vehicle_id)
);

CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_vehicle_id ON favorites(vehicle_id);

-- ── Admins (custom auth, not Supabase Auth) ──
CREATE TABLE IF NOT EXISTS admins (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'admin'
);

-- ── Gallery ──
CREATE TABLE IF NOT EXISTS gallery (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('photo', 'video')),
  src TEXT NOT NULL,
  thumbnail TEXT,
  title TEXT,
  sort_order INTEGER DEFAULT 0,
  active INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Brands ──
CREATE TABLE IF NOT EXISTS brands (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  logo TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('chinese', 'foreign', 'trucks')),
  sort_order INTEGER DEFAULT 0,
  active INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_brands_name ON brands(name);
CREATE INDEX idx_brands_category ON brands(category);