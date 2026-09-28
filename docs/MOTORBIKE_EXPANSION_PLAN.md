# Motorbike Expansion — Plan (Separate Sections Model)

**Product:** 86Connect Cars
**Goal:** Add motorbike selling/export alongside cars using **separate sections and pages** — no car/bike toggle switch.
**Stack:** Next.js 16 App Router + Supabase Postgres
**Date:** 2026-09-29
**Web version:** [motorbike-plan.html](motorbike-plan.html)
**Supersedes:** the earlier toggle-based approach in this file.

---

## 1. Decision summary

Do **not** build a parallel `motorcycles` system. Add **one discriminator column** (`vehicle_type`) to the existing data model, then expose cars and bikes through **separate routes, sections, and admin pages** that **reuse the same components**.

- Same database, same API, same admin form, same quote/WhatsApp flow.
- Different URLs, different homepage sections, different nav entries.
- One code path → half the maintenance, no duplicated 2,000-line inventory component.

Alternative rejected: a second `motorcycles` table + parallel pages. It duplicates the catalogue UI, detail page, admin CRUD, and API routes — roughly 2× the work for identical behaviour.

---

## 2. What already exists (verified)

| Area | File | Notes |
|---|---|---|
| Hero CTAs | `src/components/sections/Hero.tsx:107-128` | "Browse Vehicles" scrolls to `#inventory` (in-page), not a route |
| Featured section | `src/components/sections/FeaturedVehicles.tsx` | `id="inventory"`, title "Featured Vehicles", fuel/body chips |
| Brand section (home) | `src/components/sections/Brands.tsx` | all brands + counts, links `/inventory?brand=<name>` |
| Brand page | `src/app/brands/page.tsx` + `src/components/brands/BrandsClient.tsx` | category tabs chinese/foreign/trucks; **no per-brand route** |
| Car inventory | `src/app/inventory/page.tsx` + `src/components/inventory/InventoryClient.tsx` | brand/fuel/body/year/drivetrain/transmission/seats/color/price/sort + URL sync |
| Car detail | `src/app/inventory/[slug]/page.tsx` + `VehicleDetailClient.tsx` | WhatsApp + Request Quote → `/?vehicleSlug=…#contact` |
| Quote flow | `src/components/forms/QuoteForm.tsx` → `src/app/api/quotes/route.ts` | writes `quotes` table |
| Quote → main admin | `forwardToMainAdmin()` in `api/quotes/route.ts` | webhook POST to `MAIN_ADMIN_CAR_QUOTE_API` (admin.the86connect.com) with `submissionType: "car-quote"`; `vehicleLink` hardcoded to `/inventory/<slug>`; PATCH webhook syncs `delivery_status` back; DELETE syncs both ways |
| Email system | `src/lib/email.ts` (Resend) | user confirmation + admin notification (`eightysixconnect@outlook.com`); vehicle links hardcoded `/inventory/<slug>` |
| Order tracking | `quotes.delivery_status` + account page | main admin updates status via PATCH webhook; users track submissions from their account page |
| Brand registry | `src/lib/brands.ts`, `src/lib/brands.server.ts` | 3 categories only; auto-seeds `brands` table |
| Admin | `src/app/admin/vehicles/**`, `brands`, `quotes`, `users`, `gallery`, `testimonials`, `faqs`, `features`, `process-steps`, `knowledge-base`, dashboard | see §9 |
| Sitemap | `src/app/sitemap.ts` | `/`, `/inventory`, `/brands`, `/gallery`, `/about`, `/inventory/<slug>` |

**Clarification on "features page":** there is **no `/features` route**. What you see is the homepage **"Featured Vehicles"** section (`FeaturedVehicles.tsx`, anchor `#inventory`). The admin **"Features"** page manages a *site-features* list (used by the static `Why Choose Us` section) — it does **not** show cars. Keep these two separate in your head.

---

## 3. Target public structure

| Concept | Cars | Bikes |
|---|---|---|
| Catalogue | `/cars` | `/bikes` |
| Product detail | `/cars/[slug]` | `/bikes/[slug]` |
| Brand listing page | `/cars/brands` | `/bikes/brands` |
| Homepage featured section | "Featured Cars" | "Featured Bikes" |
| Homepage brand section | "Car Brands" | "Bike Brands" |

**Redirects (preserve existing SEO, no broken links):**
- `/inventory` → `/cars` (301)
- `/inventory/[slug]` → `/cars/[slug]` (301)
- `/brands` → `/cars/brands` (301)

Slugs stay globally unique (one `vehicles` table), so `/cars/[slug]` and `/bikes/[slug]` never collide.

---

## 4. Data model

### Migration `supabase/migrations/00010_add_vehicle_type.sql`

```sql
-- 1. Vehicles: car | motorbike
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS vehicle_type TEXT NOT NULL DEFAULT 'car';
ALTER TABLE vehicles DROP CONSTRAINT IF EXISTS vehicles_vehicle_type_check;
ALTER TABLE vehicles ADD CONSTRAINT vehicles_vehicle_type_check
  CHECK (vehicle_type IN ('car', 'motorbike'));
CREATE INDEX IF NOT EXISTS idx_vehicles_vehicle_type ON vehicles(vehicle_type);

-- 2. Brands: car | motorbike (a brand can exist once per type, e.g. Honda)
ALTER TABLE brands ADD COLUMN IF NOT EXISTS vehicle_type TEXT NOT NULL DEFAULT 'car';
ALTER TABLE brands DROP CONSTRAINT IF EXISTS brands_vehicle_type_check;
ALTER TABLE brands ADD CONSTRAINT brands_vehicle_type_check
  CHECK (vehicle_type IN ('car', 'motorbike'));
ALTER TABLE brands DROP CONSTRAINT IF EXISTS brands_name_key;   -- old UNIQUE(name); verify actual constraint name
ALTER TABLE brands ADD CONSTRAINT brands_name_type_key UNIQUE (name, vehicle_type);
ALTER TABLE brands DROP CONSTRAINT IF EXISTS brands_category_check;
ALTER TABLE brands ADD CONSTRAINT brands_category_check
  CHECK (category IN ('chinese', 'foreign', 'trucks', 'bikes'));
CREATE INDEX IF NOT EXISTS idx_brands_vehicle_type ON brands(vehicle_type);
-- 3. Quotes: remember which line the enquiry came from (drives admin panel,
--    email wording, and correct /cars|/bikes links in webhook + emails)
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS vehicle_type TEXT NOT NULL DEFAULT 'car';
CREATE INDEX IF NOT EXISTS idx_quotes_vehicle_type ON quotes(vehicle_type);
```

- `DEFAULT 'car'` → every existing row is untouched (zero-downtime).
- Brands become type-scoped, so "Car Brands" and "Bike Brands" are two clean lists.

### Types — `src/types/index.ts`
```ts
export type VehicleType = "car" | "motorbike";
export type BodyType = /* existing */ | "Scooter" | "Sport" | "Cruiser" | "Dirt Bike" | "Electric Bike" | "Three-Wheeler";
export interface Vehicle { /* ... */ vehicleType: VehicleType; }
```
Add optional bike spec fields (`engineType`, `fuelCapacity`, `abs`, …) to `VehicleSpecs` — no DB change, `specs` is JSONB.

### Query layer — `src/lib/db/index.ts`
Add `vehicles.listByType(type)` and `brands.listByType(type)` (both already have a generic helper).

---

## 5. Component reuse strategy (the key to doing this cheaply)

Generalize, do not duplicate. Each component gains **one prop** (`vehicleType`, and where it links, `basePath`).

| Component | Change | Reused by |
|---|---|---|
| `InventoryClient.tsx` | add `vehicleType` + `basePath` props; filter brand list to that type; links use `basePath` | `/cars`, `/bikes` |
| `VehicleDetailClient.tsx` | add `vehicleType` prop (labels: "Back to Cars/Bikes", WhatsApp text, spec headings) | `/cars/[slug]`, `/bikes/[slug]` |
| `BrandsClient.tsx` | add `vehicleType` + `basePath`; category tabs adapt per type | `/cars/brands`, `/bikes/brands` |
| `FeaturedVehicles.tsx` | add `title` + `vehicleType` props | homepage "Featured Cars" & "Featured Bikes" |
| `Brands.tsx` (section) | add `title` + `vehicleType` props | homepage "Car Brands" & "Bike Brands" |
| `VehicleCard` (inside Featured) | unchanged — already generic | both |

**Rule:** a new page is a thin server component that fetches type-filtered data and renders the shared client. No copy-paste of UI.

---

## 6. Homepage changes — `src/app/page.tsx`

Add two sections, reusing components:

```
Hero
FeaturedVehicles  title="Featured Cars"  vehicleType="car"       (existing, retitled)
FeaturedVehicles  title="Featured Bikes" vehicleType="motorbike" (new instance)
...
Brands            title="Car Brands"     vehicleType="car"       (existing, retitled)
Brands            title="Bike Brands"    vehicleType="motorbike" (new instance)
...
```

- Data: add `getVehiclesByType("motorbike")` and `getBrandsByType("motorbike")` to the `Promise.all` in `page.tsx:47-53`.
- Keep distinct anchors (`#featured-cars`, `#featured-bikes`) so nav can scroll to each.

---

## 7. Inventory + brand pages

**`/cars` and `/bikes`** — thin server pages:
- Fetch `getVehiclesByType(type)`, `getBrandsByType(type)`.
- Render `<InventoryClient vehicleType={type} basePath="/cars|/bikes" … />`.

**Brand filter (already exists, just scoped):**
- The brand filter pills derive options from the vehicles passed in → automatically show only brands that have cars (or bikes).
- Brand links **inside** a catalogue must point to the correct path: `/cars?brand=<name>` / `/bikes?brand=<name>` (driven by the new `basePath` prop).

**Brand pages** — `/cars/brands`, `/bikes/brands`:
- Same `BrandsClient` with `vehicleType` + `basePath`.
- Category tabs become type-aware (car: Chinese/Foreign/Trucks; bike: e.g. Chinese/Japanese/European — configurable via `brands.category`).
- Every brand card links `/cars?brand=<name>` or `/bikes?brand=<name>`.

---

## 8. Detail page, WhatsApp, quote

- `/cars/[slug]` and `/bikes/[slug]` both render `VehicleDetailClient` with the type prop.
- **WhatsApp** button: reuse `https://wa.me/8617611533296` as-is.
- **Request Quote**: reuse the existing `/?vehicleSlug=…#contact` flow — no change needed; the `Contact` section already pre-fills brand/model/slug from search params.
- **SEO / structured data** in the server page: emit `@type: "Car"` for cars, `@type: "Motorcycle"` for bikes; breadcrumbs per section.
- **Quote → main admin panel (admin.the86connect.com):** every quote is forwarded by `forwardToMainAdmin()` in `src/app/api/quotes/route.ts`. For bikes this needs three changes:
  - persist `quotes.vehicle_type` (migration §4) and include it in the webhook payload so the main panel can tell car and bike enquiries apart;
  - build `vehicleLink` from the vehicle's type (`/cars/<slug>` vs `/bikes/<slug>`) instead of today's hardcoded `/inventory/<slug>`;
  - send `submissionType: "motorbike-quote"` for bikes (keep `"car-quote"` for cars) **and** a `vehicleType` field — pending confirmation of what the main panel accepts (§14).
- **Email system (Resend, `src/lib/email.ts`):** user confirmation and admin notification emails must link to the right catalogue (`/cars/<slug>` vs `/bikes/<slug>`, "Browse Inventory" → `/cars` or `/bikes`) and say "motorbike" when the quote is for a bike.
- **Order tracking: unchanged.** Same `quotes` table, same PATCH webhook (main admin updates `delivery_status`), same account-page tracking. Bike orders are tracked exactly like car orders once `vehicle_type` is stored; the account page can show a Car/Bike label from the same column.

---

## 9. Admin changes

Owner mental model: "Car management" and "Bike management" as separate entries.

| Admin page | Change |
|---|---|
| `/admin/vehicles` | Car management — same component, fixed `vehicleType="car"` |
| `/admin/bikes` **(new)** | Bike management — same list component, fixed `motorbike` (own sidebar entry) |
| `VehicleForm.tsx` | add "Vehicle Type" field (or fixed by route) + bike spec fields |
| `/admin/brands` | add a **Cars / Bikes** tab; category options per type |
| `/admin` dashboard | add a "Bikes" stat card + include bikes in distribution |
| `/admin/quotes` | show a Car/Bike badge per quote + type filter (reads `quotes.vehicle_type`); forwarded webhook + emails already handled in §8 |
| `api/vehicles` (GET) | support `?type=car|motorbike`; POST/PUT persist `vehicle_type` |
| `api/brands` | persist `vehicle_type`; validate category list |
| Admin sidebar (`src/app/admin/layout.tsx:14-26`) | add "Bikes" nav item |

---

## 10. Navigation, footer, sitemap

- **`src/lib/data.ts` (`navLinks`, ~line 1358):** add `Cars` → `/cars`, `Bikes` → `/bikes` (keep Brands → `/cars/brands`).
- **`src/components/layout/MobileBottomNav.tsx:9-15`:** add Bikes tab.
- **`src/components/layout/Footer.tsx`:** update link arrays (`companyLinks`, `serviceLinks`) to the new paths.
- **`src/components/sections/Hero.tsx`:** repoint "Browse Vehicles" → `/cars` (route, not just anchor), add a second CTA "Browse Bikes" → `/bikes`.
- **`src/app/sitemap.ts`:** emit `/cars`, `/bikes`, `/cars/brands`, `/bikes/brands`, and split vehicle slugs into `/cars/<slug>` / `/bikes/<slug>`.

---

## 11. Build order (safe, incremental)

1. **Migration + types + query layer** — append-only, nothing breaks.
2. **Generalize components** — add props with defaults so existing `/inventory` still works.
3. **Add `/cars` and `/bikes`** routes (thin pages over the generalized components).
4. **Admin** — `/admin/bikes`, form field, brand tabs, dashboard card.
5. **Homepage** — retitle existing sections; add the two bike sections.
6. **Nav / footer / hero / sitemap.**
7. **Add redirects** `/inventory → /cars`, `/brands → /cars/brands`.
8. **QA + deploy.**

---

## 12. Verification checklist

1. `npx tsc --noEmit` and `npm run lint` clean.
2. `npm run build` passes (all new routes build).
3. Migration applied on a Supabase branch; `SELECT count(*) FROM vehicles WHERE vehicle_type='car'` unchanged.
4. Add a bike in `/admin/bikes` → appears on `/bikes` + `/` Featured Bikes, never on `/cars`.
5. Brand filter on `/bikes` shows only bike brands; clicking a brand → `/bikes?brand=<name>` filtered correctly.
6. `/cars/brands` and `/bikes/brands` show separate brand lists.
7. Bike detail page: WhatsApp opens with bike text; Request Quote pre-fills the Contact form; JSON-LD is `Motorcycle`.
8. Old URLs `/inventory`, `/inventory/<slug>`, `/brands` 301-redirect correctly.
9. Sitemap contains the new paths.

---

## 13. Files touched

**New:** `supabase/migrations/00010_add_vehicle_type.sql`, `src/app/cars/page.tsx`, `src/app/cars/[slug]/page.tsx`, `src/app/cars/brands/page.tsx`, `src/app/bikes/page.tsx`, `src/app/bikes/[slug]/page.tsx`, `src/app/bikes/brands/page.tsx`, `src/app/admin/bikes/page.tsx`, plus redirect entries in `next.config.ts`.

**Edited:** `src/types/index.ts`, `src/lib/db/index.ts`, `src/lib/vehicles.server.ts`, `src/lib/brands.ts`, `src/lib/brands.server.ts`, `src/lib/email.ts`, `src/app/api/quotes/route.ts`, `src/components/inventory/InventoryClient.tsx`, `src/components/inventory/VehicleDetailClient.tsx`, `src/components/brands/BrandsClient.tsx`, `src/components/sections/FeaturedVehicles.tsx`, `src/components/sections/Brands.tsx`, `src/components/sections/Hero.tsx`, `src/components/admin/VehicleForm.tsx`, `src/app/page.tsx`, `src/app/admin/layout.tsx`, `src/app/admin/brands/page.tsx`, `src/app/admin/quotes/page.tsx`, `src/app/admin/page.tsx`, `src/app/api/vehicles/route.ts`, `src/app/api/vehicles/[id]/route.ts`, `src/app/api/brands/route.ts`, `src/app/api/brands/[id]/route.ts`, `src/app/sitemap.ts`, `src/lib/data.ts`, `src/components/layout/Navbar.tsx`, `src/components/layout/MobileBottomNav.tsx`, `src/components/layout/Footer.tsx`, `next.config.ts` (redirects).

**Unchanged:** uploads (Cloudinary), auth, RLS, WhatsApp number, order-tracking flow (PATCH/DELETE webhooks keep their shape — the payload only gains `vehicleType` and correct links).

---

## 14. Open decisions

1. **URL scheme** — recommended `/cars` + `/bikes` (with 301s from `/inventory`). Alternative: keep `/inventory` for cars and add only `/bikes`.
2. **Brand pages** — recommended nested `/cars/brands` + `/bikes/brands`. Alternative: flat `/car-brands` + `/bike-brands`.
3. **Bike brand categories** — decide the grouping shown on `/bikes/brands` (e.g. Chinese / Japanese / European).
4. **Main admin panel compatibility** — the quote-forwarding webhook (`MAIN_ADMIN_CAR_QUOTE_API`) targets the separate admin.the86connect.com system. Confirm whether it accepts a `vehicleType` field and/or a `"motorbike-quote"` submission type so bike enquiries are labelled correctly there. Safe default: keep the existing payload shape and add `vehicleType` as a new field.