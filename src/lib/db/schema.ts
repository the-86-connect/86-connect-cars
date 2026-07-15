// Database schema definitions — shared between SQLite and Supabase

export const TABLES = {
  vehicles: `
    CREATE TABLE IF NOT EXISTS vehicles (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      brand TEXT NOT NULL,
      model TEXT NOT NULL,
      year INTEGER NOT NULL,
      price INTEGER NOT NULL,
      fuel TEXT NOT NULL,
      bodyType TEXT NOT NULL,
      transmission TEXT NOT NULL,
      condition TEXT DEFAULT 'New',
      availability TEXT DEFAULT 'In Stock',
      image TEXT,
      images TEXT DEFAULT '[]',
      badge TEXT,
      engine TEXT,
      description TEXT,
      specs TEXT DEFAULT '{}',
      features TEXT DEFAULT '[]',
      colors TEXT DEFAULT '[]',
      mileage INTEGER,
      fobPrice INTEGER,
      portOfLoading TEXT,
      handDrive TEXT,
      shippingEstimate TEXT,
      exportDocs TEXT DEFAULT '[]',
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now'))
    )
  `,
  testimonials: `
    CREATE TABLE IF NOT EXISTS testimonials (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT,
      country TEXT,
      flag TEXT,
      rating INTEGER DEFAULT 5,
      quote TEXT NOT NULL,
      avatar TEXT,
      sortOrder INTEGER DEFAULT 0,
      active INTEGER DEFAULT 1
    )
  `,
  faqs: `
    CREATE TABLE IF NOT EXISTS faqs (
      id TEXT PRIMARY KEY,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      sortOrder INTEGER DEFAULT 0,
      active INTEGER DEFAULT 1
    )
  `,
  features: `
    CREATE TABLE IF NOT EXISTS features (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      icon TEXT,
      sortOrder INTEGER DEFAULT 0,
      active INTEGER DEFAULT 1
    )
  `,
  process_steps: `
    CREATE TABLE IF NOT EXISTS process_steps (
      step INTEGER PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      icon TEXT,
      active INTEGER DEFAULT 1
    )
  `,
  quotes: `
    CREATE TABLE IF NOT EXISTS quotes (
      id TEXT PRIMARY KEY,
      userId TEXT,
      name TEXT NOT NULL,
      whatsapp TEXT,
      email TEXT NOT NULL,
      country TEXT,
      vehicleBrand TEXT,
      model TEXT,
      budget TEXT,
      message TEXT,
      status TEXT DEFAULT 'new',
      deliveryStatus TEXT DEFAULT 'pending',
      createdAt TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (userId) REFERENCES users(id)
    )
  `,
  users: `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      passwordHash TEXT NOT NULL,
      whatsapp TEXT,
      country TEXT,
      createdAt TEXT DEFAULT (datetime('now'))
    )
  `,
  favorites: `
    CREATE TABLE IF NOT EXISTS favorites (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      vehicleId TEXT NOT NULL,
      createdAt TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (userId) REFERENCES users(id),
      FOREIGN KEY (vehicleId) REFERENCES vehicles(id),
      UNIQUE(userId, vehicleId)
    )
  `,
  admins: `
    CREATE TABLE IF NOT EXISTS admins (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      passwordHash TEXT NOT NULL,
      role TEXT DEFAULT 'admin'
    )
  `,
  gallery: `
    CREATE TABLE IF NOT EXISTS gallery (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL CHECK (type IN ('photo','video')),
      src TEXT NOT NULL,
      thumbnail TEXT,
      title TEXT,
      sortOrder INTEGER DEFAULT 0,
      active INTEGER DEFAULT 1,
      createdAt TEXT DEFAULT (datetime('now'))
    )
  `,
  brands: `
    CREATE TABLE IF NOT EXISTS brands (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      logo TEXT NOT NULL,
      category TEXT NOT NULL CHECK (category IN ('chinese','foreign','trucks')),
      sortOrder INTEGER DEFAULT 0,
      active INTEGER DEFAULT 1,
      createdAt TEXT DEFAULT (datetime('now'))
    )
  `,
} as const;
