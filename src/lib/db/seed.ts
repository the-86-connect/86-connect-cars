/**
 * Seed script — imports hardcoded data from data.ts into SQLite.
 * Run: npx tsx src/lib/db/seed.ts
 */
import { getSqliteDb, saveSqliteDb, sqliteQuery, sqliteRun } from "./sqlite";
import { TABLES } from "./schema";

// Import data from the existing data file
// We need to use dynamic import for ESM compatibility
async function main() {
  console.log("🌱 Seeding database...");

  const db = await getSqliteDb();

  // Create tables
  for (const [name, sql] of Object.entries(TABLES)) {
    db.run(sql);
    console.log(`  ✓ Table: ${name}`);
  }

  // Import vehicles
  const { vehicles } = await import("../data");
  for (const v of vehicles) {
    const existing = sqliteQuery(db, "SELECT id FROM vehicles WHERE id = ?", [v.id]);
    if (existing.length > 0) continue;

    sqliteRun(db, `INSERT INTO vehicles (id, slug, brand, model, year, price, fuel, bodyType, transmission, condition, availability, image, images, badge, engine, description, specs, features, colors, mileage, fobPrice, portOfLoading, handDrive, shippingEstimate, exportDocs) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
      v.id, v.slug, v.brand, v.model, v.year, v.price, v.fuel, v.bodyType, v.transmission,
      v.condition, v.availability, v.image, JSON.stringify(v.images), v.badge ?? null,
      v.engine ?? null, v.description, JSON.stringify(v.specs), JSON.stringify(v.features),
      JSON.stringify(v.colors), v.mileage ?? null, v.fobPrice ?? null,
      v.portOfLoading ?? null, v.handDrive ?? null, v.shippingEstimate ?? null,
      JSON.stringify(v.exportDocs ?? []),
    ]);
  }
  console.log(`  ✓ Vehicles: ${vehicles.length}`);

  // Import testimonials
  const { testimonials } = await import("../data");
  for (const t of testimonials) {
    const existing = sqliteQuery(db, "SELECT id FROM testimonials WHERE id = ?", [t.id]);
    if (existing.length > 0) continue;

    sqliteRun(db, `INSERT INTO testimonials (id, name, role, country, flag, rating, quote, avatar, sortOrder) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
      t.id, t.name, t.role, t.country, t.flag, t.rating, t.quote, t.avatar, 0,
    ]);
  }
  console.log(`  ✓ Testimonials: ${testimonials.length}`);

  // Import FAQs
  const { faqs } = await import("../data");
  for (const f of faqs) {
    const existing = sqliteQuery(db, "SELECT id FROM faqs WHERE id = ?", [f.id]);
    if (existing.length > 0) continue;

    sqliteRun(db, `INSERT INTO faqs (id, question, answer, sortOrder) VALUES (?, ?, ?, ?)`, [
      f.id, f.question, f.answer, 0,
    ]);
  }
  console.log(`  ✓ FAQs: ${faqs.length}`);

  // Import features
  const { features } = await import("../data");
  for (const f of features) {
    const existing = sqliteQuery(db, "SELECT id FROM features WHERE id = ?", [f.id]);
    if (existing.length > 0) continue;

    sqliteRun(db, `INSERT INTO features (id, title, description, icon, sortOrder) VALUES (?, ?, ?, ?, ?)`, [
      f.id, f.title, f.description, f.icon, 0,
    ]);
  }
  console.log(`  ✓ Features: ${features.length}`);

  // Import process steps
  const { processSteps } = await import("../data");
  for (const s of processSteps) {
    const existing = sqliteQuery(db, "SELECT step FROM process_steps WHERE step = ?", [s.step]);
    if (existing.length > 0) continue;

    sqliteRun(db, `INSERT INTO process_steps (step, title, description, icon) VALUES (?, ?, ?, ?)`, [
      s.step, s.title, s.description, s.icon,
    ]);
  }
  console.log(`  ✓ Process Steps: ${processSteps.length}`);

  // Create default admin user (password: admin123 — SHA-256 hash)
  const crypto = await import("crypto");
  const passwordHash = crypto.createHash("sha256").update("admin123").digest("hex");
  const adminExists = sqliteQuery(db, "SELECT id FROM admins WHERE email = ?", ["admin@86connect.com"]);
  if (adminExists.length === 0) {
    sqliteRun(db, `INSERT INTO admins (id, email, passwordHash, role) VALUES (?, ?, ?, ?)`, [
      "admin-1", "admin@86connect.com", passwordHash, "superadmin",
    ]);
    console.log("  ✓ Admin user: admin@86connect.com / admin123");
  }

  // Seed gallery with default items (admin can replace via /admin/gallery)
  const galleryItems = [
    { id: "g-1", type: "photo", src: "/vehicles/byd-han.jpg", title: "BYD Han ready for export", sortOrder: 1 },
    { id: "g-2", type: "photo", src: "/vehicles/rav4.jpg", title: "Toyota RAV4 ready for export", sortOrder: 2 },
    { id: "g-3", type: "photo", src: "/vehicles/monjaro.jpg", title: "Geely Monjaro ready for export", sortOrder: 3 },
    { id: "g-4", type: "photo", src: "/vehicles/civic.jpg", title: "Honda Civic ready for export", sortOrder: 4 },
    { id: "g-5", type: "photo", src: "/vehicles/uni-k.jpg", title: "Changan UNI-K ready for export", sortOrder: 5 },
    { id: "g-v1", type: "video", src: "https://www.youtube.com/embed/dQw4w9WgXcQ", thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg", title: "Vehicle loading at Tianjin Port", sortOrder: 6 },
    { id: "g-v2", type: "video", src: "https://www.youtube.com/embed/dQw4w9WgXcQ", thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg", title: "Container shipping process walkthrough", sortOrder: 7 },
    { id: "g-v3", type: "video", src: "https://www.youtube.com/embed/dQw4w9WgXcQ", thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg", title: "Quality inspection at factory", sortOrder: 8 },
  ];
  let galleryAdded = 0;
  for (const g of galleryItems) {
    const existing = sqliteQuery(db, "SELECT id FROM gallery WHERE id = ?", [g.id]);
    if (existing.length > 0) continue;
    sqliteRun(db, `INSERT INTO gallery (id, type, src, thumbnail, title, sortOrder, active) VALUES (?, ?, ?, ?, ?, ?, 1)`, [
      g.id, g.type, g.src, g.thumbnail ?? g.src, g.title, g.sortOrder,
    ]);
    galleryAdded++;
  }
  if (galleryAdded > 0) console.log(`  ✓ Gallery: ${galleryAdded} items`);

  saveSqliteDb(db);
  console.log("\n✅ Database seeded successfully!");
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
