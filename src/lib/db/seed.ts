/**
 * Seed script — imports hardcoded data from data.ts into Supabase PostgreSQL.
 * Run: npx tsx src/lib/db/seed.ts
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars.
 * Set them via: $env:NEXT_PUBLIC_SUPABASE_URL="..."; $env:SUPABASE_SERVICE_ROLE_KEY="..."; npx tsx src/lib/db/seed.ts
 */
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

async function main() {
  console.log("🌱 Seeding database...");

  // Import vehicles
  const { vehicles } = await import("../data");
  for (const v of vehicles) {
    const { data: existing } = await supabase.from("vehicles").select("id").eq("id", v.id);
    if (existing && existing.length > 0) continue;

    await supabase.from("vehicles").insert({
      id: v.id, slug: v.slug, brand: v.brand, model: v.model, year: v.year,
      price: v.price, fuel: v.fuel, body_type: v.bodyType, transmission: v.transmission,
      condition: v.condition, availability: v.availability, image: v.image,
      images: v.images, badge: v.badge ?? null, engine: v.engine ?? null,
      description: v.description, specs: v.specs, features: v.features,
      colors: v.colors, mileage: v.mileage ?? null, fob_price: v.fobPrice ?? null,
      port_of_loading: v.portOfLoading ?? null, hand_drive: v.handDrive ?? null,
      shipping_estimate: v.shippingEstimate ?? null, export_docs: v.exportDocs ?? [],
    });
  }
  console.log(`  ✓ Vehicles: ${vehicles.length}`);

  // Import testimonials
  const { testimonials } = await import("../data");
  for (const t of testimonials) {
    const { data: existing } = await supabase.from("testimonials").select("id").eq("id", t.id);
    if (existing && existing.length > 0) continue;

    await supabase.from("testimonials").insert({
      id: t.id, name: t.name, role: t.role, country: t.country, flag: t.flag,
      rating: t.rating, quote: t.quote, avatar: t.avatar, sort_order: 0,
    });
  }
  console.log(`  ✓ Testimonials: ${testimonials.length}`);

  // Import FAQs
  const { faqs } = await import("../data");
  for (const f of faqs) {
    const { data: existing } = await supabase.from("faqs").select("id").eq("id", f.id);
    if (existing && existing.length > 0) continue;

    await supabase.from("faqs").insert({
      id: f.id, question: f.question, answer: f.answer, sort_order: 0,
    });
  }
  console.log(`  ✓ FAQs: ${faqs.length}`);

  // Import features
  const { features } = await import("../data");
  for (const f of features) {
    const { data: existing } = await supabase.from("features").select("id").eq("id", f.id);
    if (existing && existing.length > 0) continue;

    await supabase.from("features").insert({
      id: f.id, title: f.title, description: f.description, icon: f.icon, sort_order: 0,
    });
  }
  console.log(`  ✓ Features: ${features.length}`);

  // Import process steps
  const { processSteps } = await import("../data");
  for (const s of processSteps) {
    const { data: existing } = await supabase.from("process_steps").select("step").eq("step", s.step);
    if (existing && existing.length > 0) continue;

    await supabase.from("process_steps").insert({
      step: s.step, title: s.title, description: s.description, icon: s.icon,
    });
  }
  console.log(`  ✓ Process Steps: ${processSteps.length}`);

  // Create default admin user (password: admin123)
  const crypto = await import("crypto");
  const passwordHash = crypto.createHash("sha256").update("admin123").digest("hex");
  const { data: adminExists } = await supabase.from("admins").select("id").eq("email", "admin@86connect.com");
  if (!adminExists || adminExists.length === 0) {
    await supabase.from("admins").insert({
      id: "admin-1", email: "admin@86connect.com", password_hash: passwordHash, role: "superadmin",
    });
    console.log("  ✓ Admin user: admin@86connect.com / admin123");
  }

  // Seed gallery
  const galleryItems = [
    { id: "g-1", type: "photo", src: "/vehicles/byd-han.jpg", title: "BYD Han ready for export", sort_order: 1 },
    { id: "g-2", type: "photo", src: "/vehicles/rav4.jpg", title: "Toyota RAV4 ready for export", sort_order: 2 },
    { id: "g-3", type: "photo", src: "/vehicles/monjaro.jpg", title: "Geely Monjaro ready for export", sort_order: 3 },
    { id: "g-4", type: "photo", src: "/vehicles/civic.jpg", title: "Honda Civic ready for export", sort_order: 4 },
    { id: "g-5", type: "photo", src: "/vehicles/uni-k.jpg", title: "Changan UNI-K ready for export", sort_order: 5 },
    { id: "g-v1", type: "video", src: "https://www.youtube.com/embed/dQw4w9WgXcQ", thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg", title: "Vehicle loading at Tianjin Port", sort_order: 6 },
    { id: "g-v2", type: "video", src: "https://www.youtube.com/embed/dQw4w9WgXcQ", thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg", title: "Container shipping process walkthrough", sort_order: 7 },
    { id: "g-v3", type: "video", src: "https://www.youtube.com/embed/dQw4w9WgXcQ", thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg", title: "Quality inspection at factory", sort_order: 8 },
  ];
  let galleryAdded = 0;
  for (const g of galleryItems) {
    const { data: existing } = await supabase.from("gallery").select("id").eq("id", g.id);
    if (existing && existing.length > 0) continue;

    await supabase.from("gallery").insert({
      id: g.id, type: g.type, src: g.src, thumbnail: g.thumbnail ?? g.src, title: g.title,
      sort_order: g.sort_order, active: 1,
    });
    galleryAdded++;
  }
  if (galleryAdded > 0) console.log(`  ✓ Gallery: ${galleryAdded} items`);

  console.log("\n✅ Database seeded successfully!");
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});