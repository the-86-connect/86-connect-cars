# 86Connect Cars — Project Analysis

A grounded analysis of how the 86Connect Cars app currently works, what logic and functions are missing, and what should be improved. Every file path and line reference in this document comes from reading the actual codebase.

---

## 1. Overview

**What this app is:** A Chinese vehicle export lead-capture and marketing website. Public visitors browse vehicles, submit quote requests, and create accounts to save favorites. Admins manage inventory and content through a protected panel.

**Stack:**
- **Next.js 16.2.10** with App Router and Turbopack
- **React 19.2.4**
- **Tailwind CSS v4** configured via `@theme` in `src/app/globals.css` (no `tailwind.config.ts`)
- **sql.js 1.14.1** — SQLite compiled to WASM, persisted to `dev.db` at project root
- **motion 12** (Framer Motion successor) + **GSAP 3.15** for animation
- **three 0.185** + `@react-three/fiber` 9 + `@react-three/drei` 10 for the hero 3D background
- **react-hook-form 7** + **zod 4** for the quote form
- **html2canvas** + **jspdf** for inventory brochure PDF generation
- **lucide-react** for icons, **clsx** + **tailwind-merge** for class composition
- **@supabase/ssr** + **@supabase/supabase-js** — installed but unused (scaffold only)

**The architectural truth that explains most gaps:** the app has two parallel data worlds that do not talk to each other.

1. **Hardcoded marketing data** in [src/lib/data.ts](file:///d:/86Connect%20Cars/src/lib/data.ts) — 21 vehicles, testimonials, FAQs, features, processSteps, heroStats, shippingRoutes, navLinks. Every public page imports directly from this file.
2. **SQLite DB via sql.js** in [src/lib/db/](file:///d:/86Connect%20Cars/src/lib/db/) — vehicles, quotes, faqs, features, process_steps, testimonials, users, admins, favorites tables. Written to by all `/api/*` routes and the admin panel.

Admin edits land in SQLite. Public pages read from the hardcoded file. **Admin-created or admin-edited vehicles never appear on the public site.** This is the single biggest functional gap and the root cause of several reported issues (e.g. "no trucks in inventory" despite admin additions).

> **UPDATE (Phase 2):** The data disconnect described above is now **resolved** for vehicles, brands, and gallery. See [§ 9 — Phase 2 Architecture Updates](#9--phase-2-architecture-updates-resolved) at the bottom of this document for the full list of changes. The summary: public pages now read vehicles from SQLite via [src/lib/vehicles.server.ts](file:///d:/86Connect%20Cars/src/lib/vehicles.server.ts); brand names/logos come from a shared registry at [src/lib/brands.ts](file:///d:/86Connect%20Cars/src/lib/brands.ts); the admin vehicle form uses a brand dropdown; the Gallery section is now admin-managed via a new `gallery` table and `/api/gallery` routes (Cloudinary URLs for photos, YouTube IDs/URLs for videos). The `lib/data.ts` file remains only as a seed source.

---

## 2. Architecture & Directory Map

### `src/app/` — App Router routes

**Public (server components with client children):**
- `/` — [src/app/page.tsx](file:///d:/86Connect%20Cars/src/app/page.tsx) — home; below-fold sections are dynamically imported for fast first paint
- `/about` — [src/app/about/page.tsx](file:///d:/86Connect%20Cars/src/app/about/page.tsx)
- `/brands` — [src/app/brands/page.tsx](file:///d:/86Connect%20Cars/src/app/brands/page.tsx)
- `/inventory` — [src/app/inventory/page.tsx](file:///d:/86Connect%20Cars/src/app/inventory/page.tsx)
- `/inventory/[slug]` — [src/app/inventory/[slug]/page.tsx](file:///d:/86Connect%20Cars/src/app/inventory/%5Bslug%5D/page.tsx) — uses `generateStaticParams` from `lib/data.ts`

**Account (client components):**
- `/account` — [src/app/account/page.tsx](file:///d:/86Connect%20Cars/src/app/account/page.tsx) — shows user's quotes + favorites; client-side protected
- `/account/login` — [src/app/account/login/page.tsx](file:///d:/86Connect%20Cars/src/app/account/login/page.tsx)
- `/account/signup` — [src/app/account/signup/page.tsx](file:///d:/86Connect%20Cars/src/app/account/signup/page.tsx)

**Admin (client layout, middleware-protected):**
- `/admin` — dashboard
- `/admin/login` — bypasses admin layout
- `/admin/vehicles`, `/admin/vehicles/new`, `/admin/vehicles/[id]/edit`
- `/admin/gallery` — manage Gallery photos (Cloudinary) + videos (YouTube)
- `/admin/testimonials`, `/admin/faqs`, `/admin/features`, `/admin/process-steps`, `/admin/quotes`

**API routes — `src/app/api/`:**
- `auth/login`, `auth/logout`, `auth/me` — admin auth
- `user/signup`, `user/login`, `user/logout`, `user/me`, `user/favorites`, `user/quotes`
- `vehicles`, `vehicles/[id]` — full CRUD; calls `revalidatePath` on mutations so public pages refresh
- `gallery`, `gallery/[id]` — full CRUD for gallery items (photos + videos)
- `quotes` — GET, POST, PUT
- `faqs`, `features`, `process-steps`, `testimonials` — GET, POST only (no `[id]` route, no PUT/DELETE)

**Root files:** [src/app/layout.tsx](file:///d:/86Connect%20Cars/src/app/layout.tsx) (root layout, fonts, metadata), [src/app/globals.css](file:///d:/86Connect%20Cars/src/app/globals.css) (Tailwind v4 theme + design tokens), [src/app/loading.tsx](file:///d:/86Connect%20Cars/src/app/loading.tsx) (route skeleton), [src/middleware.ts](file:///d:/86Connect%20Cars/src/middleware.ts) (protects `/admin/*` except `/admin/login`).

### `src/components/` — by subfolder

| Subfolder | Files | Notes |
|---|---|---|
| `admin/` | `CrudPage.tsx`, `VehicleForm.tsx` | Client. `CrudPage` is generic table + inline-form CRUD. |
| `brands/` | `BrandsClient.tsx` | Client. Filters by Chinese / Foreign / Trucks. |
| `forms/` | `QuoteForm.tsx`, `schema.ts` | Client form + Zod schema. |
| `hero/` | `HeroBackground.tsx`, `HeroCar.tsx` | Client. Mux iframe video background. |
| `inventory/` | `InventoryClient.tsx`, `VehicleDetailClient.tsx` | Client. `InventoryClient` is ~1000+ lines. |
| `layout/` | `Navbar.tsx`, `Footer.tsx`, `MobileBottomNav.tsx` | Client. |
| `sections/` | About, Brands, Contact, FAQ, FeaturedVehicles, Gallery, GlobalShipping, Hero, HowItWorks, RecentlyViewed, Testimonials, WhyChooseUs | All client. 11 homepage sections. |
| `three/` | `Hero3D.tsx`, `ParticleField.tsx` | Client. react-three-fiber. |
| `ui/` | Accordion, Badge, Button, GlassCard, MagneticButton, MouseGlow, SectionHeading, Skeleton, StatBadge, ThemeToggle, WorldMap | All client. |

Server components: `src/app/page.tsx`, `src/app/layout.tsx`, `src/app/about/page.tsx`, `src/app/brands/page.tsx`, `src/app/inventory/page.tsx`, `src/app/inventory/[slug]/page.tsx`, `src/app/loading.tsx`. Every other component is `"use client"`.

### `src/lib/`

- [src/lib/data.ts](file:///d:/86Connect%20Cars/src/lib/data.ts) — hardcoded `vehicles`, `testimonials`, `faqs`, `features`, `processSteps`, `heroStats`, `shippingRoutes`, `navLinks`. **Now used only as a seed source** — public pages no longer import from here.
- [src/lib/db/](file:///d:/86Connect%20Cars/src/lib/db/) — `index.ts` (CRUD helpers, including new `gallery` helper), `schema.ts` (SQL DDL, including new `gallery` table), `sqlite.ts` (sql.js loader + save), `seed.ts` (seeds DB from `data.ts`, creates default admin, seeds 8 default gallery items)
- [src/lib/vehicles.server.ts](file:///d:/86Connect%20Cars/src/lib/vehicles.server.ts) — **server-only** vehicle accessors (`getVehicles`, `getVehicleBySlug`, `getFeaturedVehicles`) reading from SQLite. Used by all public server pages.
- [src/lib/brands.ts](file:///d:/86Connect%20Cars/src/lib/brands.ts) — **single source of truth** for brand names, logo files, and categories (chinese / foreign / trucks). 36 brands. Consumed by the admin vehicle form (dropdown), homepage Brands grid, and `/brands` page.
- [src/lib/gallery.server.ts](file:///d:/86Connect%20Cars/src/lib/gallery.server.ts) — **server-only** helpers for the gallery API: `normalizeYouTube()` (accepts raw ID, youtu.be, watch URL, embed URL, shorts URL), `normalizeGalleryPayload()` (canonical DB record from admin form input).
- [src/lib/auth.ts](file:///d:/86Connect%20Cars/src/lib/auth.ts) — HMAC-SHA256 session tokens (admin + user) + plain SHA-256 password hashing
- [src/lib/supabase/](file:///d:/86Connect%20Cars/src/lib/supabase/) — `client.ts`, `server.ts` — scaffold only, no calls anywhere
- [src/lib/motion.ts](file:///d:/86Connect%20Cars/src/lib/motion.ts) — motion variants (`fadeUp`, `stagger`, `viewportOnce`)
- [src/lib/utils.ts](file:///d:/86Connect%20Cars/src/lib/utils.ts) — `cn()`, `formatPrice()`, `scrollToId()`

### `src/hooks/`

- `useMediaQuery`, `useMousePosition`, `useRecentlyViewed` (localStorage `86connect-recently-viewed`, max 5), `useReducedMotion`, `useUserAuth` (auth state + favorites with optimistic updates)

### `src/types/index.ts`

Exports `Vehicle`, `Testimonial`, `FAQItem`, `ProcessStep`, `Feature`, `QuoteFormData`.

### Root configs

- [package.json](file:///d:/86Connect%20Cars/package.json) — no `seed` script (must run `npx tsx src/lib/db/seed.ts` manually)
- [next.config.ts](file:///d:/86Connect%20Cars/next.config.ts) — empty config; no `images` remote patterns
- [tsconfig.json](file:///d:/86Connect%20Cars/tsconfig.json) — `strict: true`, `@/*` → `./src/*`
- `.env.example` and `.env.local` are **identical** placeholder Supabase values; `.env.local` is not actually configured

---

## 3. How the App Works (by flow)

### Public browse flow
Home (`/`) is a **server component** that calls `getVehicles()` from [src/lib/vehicles.server.ts](file:///d:/86Connect%20Cars/src/lib/vehicles.server.ts) (reads SQLite) and passes the array as props to `FeaturedVehicles` and `Brands`. The page sets `export const revalidate = 0` so it re-renders on every request — admin-added vehicles appear immediately. `FeaturedVehicles` renders a horizontal carousel with filter tabs (All, Electric, Hybrid, Petrol, SUV, Sedan, Coupe, Hatchback). Clicking a card navigates to `/inventory/[slug]`, whose `generateStaticParams` now reads slugs from the DB (with a try/catch fallback to `[]` so build never fails on an empty/missing DB). `RecentlyViewed` reads/writes `localStorage` key `86connect-recently-viewed` (max 5 slugs).

### Lead capture flow
The Contact section renders [QuoteForm](file:///d:/86Connect%20Cars/src/components/forms/QuoteForm.tsx). Submission does `POST /api/quotes` with JSON body. The API auto-links the quote to the logged-in user via the `user-session` cookie if present, then writes to the SQLite `quotes` table. **No email is sent to the business or the user.** The form's `onSubmit` has an empty `catch {}` and shows the success UI regardless of whether the API call succeeded. The success message says "Your email app should now be open" — this is misleading; no `mailto:` link is opened.

### User account flow
`/account/signup` → `POST /api/user/signup` creates a `users` row and sets a `user-session` httpOnly cookie (30 days). `/account` fetches `/api/user/me`, `/api/user/quotes`, and `/api/user/favorites`. Favorites are stored server-side in the `favorites` table (`userId`, `vehicleId`, unique). The `useUserAuth` hook does optimistic updates and reverts on API error. `/account` is **not** middleware-protected — it does a client-side `fetch("/api/user/me")` and redirects to `/account/login` on 401, which means deep links to `/account` flash protected content before the redirect fires.

### Admin flow
`/admin/login` → `POST /api/auth/login` verifies credentials against the `admins` table and sets an `admin-session` httpOnly cookie (7 days). [middleware.ts](file:///d:/86Connect%20Cars/src/middleware.ts) blocks `/admin/*` except `/admin/login` and redirects unauthenticated users. The admin dashboard shows CRUD pages. **Vehicles have full CRUD** (`/api/vehicles` + `/api/vehicles/[id]` with GET, POST, PUT, DELETE) and the create/edit form ([VehicleForm.tsx](file:///d:/86Connect%20Cars/src/components/admin/VehicleForm.tsx)) uses a **brand dropdown** populated from `BRAND_NAMES` in [src/lib/brands.ts](file:///d:/86Connect%20Cars/src/lib/brands.ts) — no more free-text brand entry, so brand names always match the `/brands` page and `/inventory` filter pills. **Gallery has full CRUD** at `/admin/gallery` via the generic `CrudPage` component: type (photo/video), title, src (Cloudinary URL or YouTube URL/ID), sortOrder. **Testimonials, FAQs, features, and process-steps can only be created** — `CrudPage.tsx` issues `PUT /api/{path}` and `DELETE /api/{path}/{id}`, but those four route handlers only export `GET` and `POST`. Edit will 405; delete will 404.

### Brands flow
`/brands` is a **server component** that calls `getVehicles()` and passes the array to [BrandsClient](file:///d:/86Connect%20Cars/src/components/brands/BrandsClient.tsx). Per-brand counts and min-prices are computed in a `useMemo` from the live DB data — if admin adds 5 BYD cars, the BYD card shows "5 cars available" immediately. Brand names, logo files, and category membership (chinese / foreign / trucks) come from the shared registry at [src/lib/brands.ts](file:///d:/86Connect%20Cars/src/lib/brands.ts) — no more duplication across `BrandsClient`, `Brands`, and the admin form. Quick-jump pills link to `/inventory?brand=…`.

### Gallery flow
The Gallery section on `/` is a client component that fetches `GET /api/gallery` on mount. Items come from the `gallery` SQLite table, which the admin manages at `/admin/gallery`. **Photos** use Cloudinary URLs (or any direct image URL) pasted into the `src` field. **Videos** use YouTube — the admin pastes a video ID, `youtu.be/...` share link, `watch?v=...` URL, or embed URL, and the API normalizes it into `https://www.youtube.com/embed/{id}` for playback plus `https://img.youtube.com/vi/{id}/hqdefault.jpg` for the thumbnail. The `revalidatePath("/")` call after every gallery mutation means admin edits appear on the homepage without a manual refresh. The seed script inserts 8 default items (5 photos + 3 videos) so the section isn't empty on a fresh DB; the admin can delete or replace these.

### Theming
CSS custom properties in [globals.css](file:///d:/86Connect%20Cars/src/app/globals.css) — `--text-primary`, `--text-secondary`, `--text-muted`, `--bg-primary`, `--bg-secondary`, `--bg-elevated`, `--bg-card`, `--border-color`. Light/dark toggle via `ThemeToggle` using `useSyncExternalStore` + a custom `86connect:theme-change` event so multiple toggles stay in sync. **These are NOT Tailwind color tokens** — class names like `text-ink`, `bg-surface-2`, `text-muted-soft` will not work and must be replaced with `text-[var(--text-primary)]` etc.

### DB persistence
`dev.db` lives at the project root. [sqlite.ts](file:///d:/86Connect%20Cars/src/lib/db/sqlite.ts) stats the file mtime on every `getSqliteDb()` call and reloads the WASM instance if it changed (handles re-seed during dev). All writes flush synchronously to disk via `saveSqliteDb`. [db/index.ts](file:///d:/86Connect%20Cars/src/lib/db/index.ts) delegates to `getSqliteDb()` on every `getDb()` call — it does **not** cache the Database instance at its own module scope, because Turbopack gives each API route its own module instance and a cache here would serve stale data after a write from a sibling route (see [§ 9.7](#96--cross-route-db-cache-invalidation)).

---

## 4. API Reference

| Route | Methods | Purpose | Auth | DB table | Known issues |
|---|---|---|---|---|---|
| `/api/auth/login` | POST | Admin login, sets `admin-session` cookie (7d) | None | `admins` | SHA-256 password hash (no salt) |
| `/api/auth/logout` | POST | Clears `admin-session` | Cookie | — | — |
| `/api/auth/me` | GET | Verifies admin session | Cookie | `admins` | — |
| `/api/user/signup` | POST | Creates user, sets `user-session` (30d) | None | `users` | SHA-256 password hash |
| `/api/user/login` | POST | User login, sets `user-session` | None | `users` | SHA-256 password hash |
| `/api/user/logout` | POST | Clears `user-session` | Cookie | — | — |
| `/api/user/me` | GET | Returns logged-in user profile | Cookie | `users` | 401 if no cookie |
| `/api/user/favorites` | GET, POST, DELETE | List / add / remove favorites | Cookie (401 if missing) | `favorites` | — |
| `/api/user/quotes` | GET | Lists quotes for logged-in user | Cookie | `quotes` | — |
| `/api/vehicles` | GET, POST | List all / create new | None for GET | `vehicles` | POST calls `revalidatePath` for `/`, `/inventory`, `/inventory/[slug]`, `/brands` |
| `/api/vehicles/[id]` | GET, PUT, DELETE | Full CRUD for one vehicle | None for GET | `vehicles` | PUT and DELETE also call `revalidatePath` |
| `/api/gallery` | GET, POST | List active / create new | None for GET | `gallery` | GET accepts `?all=1` to include inactive. POST normalizes YouTube URLs/IDs into embed URL + thumbnail. |
| `/api/gallery/[id]` | GET, PUT, DELETE | Full CRUD for one gallery item | None for GET | `gallery` | Calls `revalidatePath("/")` on mutations |
| `/api/quotes` | GET, POST, PUT | List / submit / update quote | None to submit | `quotes` | No email sent; PUT exists but no UI uses it |
| `/api/faqs` | GET, POST | List / create | None for GET | `faqs` | **No PUT, no `[id]` route** — edit/delete from admin will 405/404 |
| `/api/features` | GET, POST | List / create | None for GET | `features` | Same — edit/delete broken |
| `/api/process-steps` | GET, POST | List / create | None for GET | `process_steps` | Same — edit/delete broken |
| `/api/testimonials` | GET, POST | List / create | None for GET | `testimonials` | Same — edit/delete broken |

**External service integrations: none.** No email provider (no Resend, Nodemailer, SMTP, Sendgrid, Mailgun, Postmark). No payment integration. No CRM. No analytics.

---

## 5. Missing Logic & Functions

Concrete gaps with file paths, in rough priority order:

1. **~~Public/admin data disconnect.~~** ✅ **RESOLVED in Phase 2.** Public pages ([src/app/page.tsx](file:///d:/86Connect%20Cars/src/app/page.tsx), [src/app/inventory/page.tsx](file:///d:/86Connect%20Cars/src/app/inventory/page.tsx), [src/app/inventory/[slug]/page.tsx](file:///d:/86Connect%20Cars/src/app/inventory/%5Bslug%5D/page.tsx), [src/app/brands/page.tsx](file:///d:/86Connect%20Cars/src/app/brands/page.tsx)) now fetch vehicles from SQLite via [src/lib/vehicles.server.ts](file:///d:/86Connect%20Cars/src/lib/vehicles.server.ts) and pass them as props to client components. The vehicle API routes call `revalidatePath` on every mutation so admin edits appear on the public site immediately.

2. **Broken CRUD for FAQs / features / process-steps / testimonials.** [src/components/admin/CrudPage.tsx:33](file:///d:/86Connect%20Cars/src/components/admin/CrudPage.tsx) issues `PUT /api/${apiPath}`, and [line 53](file:///d:/86Connect%20Cars/src/components/admin/CrudPage.tsx) issues `DELETE /api/${apiPath}/${id}`. Only `vehicles` has a `[id]` route with PUT/DELETE. The other four route files only export GET and POST. Edit will 405; delete will 404.

3. **No email integration.** Quote submissions are silently saved to SQLite. No notification to `info@the86connect.com`, no auto-reply to the submitter. The success copy at [src/components/forms/QuoteForm.tsx:140](file:///d:/86Connect%20Cars/src/components/forms/QuoteForm.tsx) — "Your email app should now be open. Send the prepared message to complete your request." — is misleading. No `mailto:` link opens.

4. **`referenceImage` is dead UI.** [src/components/forms/QuoteForm.tsx:99-108](file:///d:/86Connect%20Cars/src/components/forms/QuoteForm.tsx) collects the file, generates a preview with `URL.createObjectURL`, but the POST body omits it. There is no upload endpoint. The file is silently dropped.

5. **QuoteForm swallows all errors.** [src/components/forms/QuoteForm.tsx:110-112](file:///d:/86Connect%20Cars/src/components/forms/QuoteForm.tsx) has an empty `catch {}` and [line 113](file:///d:/86Connect%20Cars/src/components/forms/QuoteForm.tsx) sets `setSubmitted(true)` unconditionally. A failed submission looks identical to a successful one.

6. **Weak password hashing.** [src/lib/auth.ts:5-7](file:///d:/86Connect%20Cars/src/lib/auth.ts) uses `crypto.createHash("sha256")` — no salt, no slow hash. Any DB leak = instant credential exposure. Should be bcrypt / argon2 / scrypt.

7. **Default session secret.** [src/lib/auth.ts:3](file:///d:/86Connect%20Cars/src/lib/auth.ts) falls back to `"86connect-dev-secret-change-in-production"` when `SESSION_SECRET` is unset. Tokens are forgeable in any deployment that forgets to set the secret.

8. **Default admin credentials.** [src/lib/db/seed.ts](file:///d:/86Connect%20Cars/src/lib/db/seed.ts) seeds `admin@86connect.com / admin123`. No forced password change on first login.

9. **No `npm run seed` script.** [package.json](file:///d:/86Connect%20Cars/package.json) has no `seed` script. Fresh checkout won't have a working DB until someone manually runs `npx tsx src/lib/db/seed.ts`. Admin login will reject the default credentials until then.

10. **`/account` favorites link uses `vehicleId` as slug.** [src/app/account/page.tsx:145](file:///d:/86Connect%20Cars/src/app/account/page.tsx) does `href={`/inventory/${fav.vehicleId}`}`. Works only because `id === slug` for every hardcoded vehicle in `data.ts`. Admin-created vehicles with divergent ids/slugs would 404.

11. **`/account` routes not middleware-protected.** [src/middleware.ts](file:///d:/86Connect%20Cars/src/middleware.ts) only protects `/admin/*`. `/account/*` does a client-side `fetch("/api/user/me")` and redirects on 401 — deep links flash protected content before the redirect.

12. **No password reset, no email verification, no OAuth.** Self-serve account recovery is impossible.

13. **No `sitemap.ts`, no `robots.ts`, no JSON-LD.** SEO gaps despite per-page metadata being set. No `Organization`, `Vehicle`, `FAQPage`, or `BreadcrumbList` structured data. No canonical URLs.

14. **No analytics.** No GA, no Vercel Analytics, no Plausible, no Umami, no Microsoft Clarity. Zero insight into traffic or conversion.

15. **No i18n.** Hardcoded English copy throughout. `lang="en"` on `<html>`. No `next-intl`, no `app/[locale]/` routing.

16. **No image optimization config.** [next.config.ts](file:///d:/86Connect%20Cars/next.config.ts) is empty. All images use raw `<img>` (some with `eslint-disable @next/next/no-img-element`). No `next/image`, no remote patterns.

17. **Recently-viewed not synced to account.** `useRecentlyViewed` writes to `localStorage` only. Even logged-in users lose their history on device switch.

18. **Supabase scaffold is dead weight.** [src/lib/supabase/](file:///d:/86Connect%20Cars/src/lib/supabase/) + `@supabase/ssr` + `@supabase/supabase-js` are installed but no code path uses them. Env values in `.env.local` are placeholders.

19. **`.env.local` is a verbatim copy of `.env.example`.** Supabase values are placeholders. Any code path that reached Supabase would throw.

20. **`InventoryClient.tsx` is a monolith.** ~1000+ lines mixing filtering, sorting, saved presets (localStorage), PDF brochure generation via html2canvas + jsPDF, share, compare tray, and favorites. Maintainability risk.

---

## 6. Improvement Recommendations

Prioritized. Every item names the file to touch.

### P0 — ~~Fix the data disconnect~~ ✅ DONE in Phase 2
Public pages now fetch from SQLite via [src/lib/vehicles.server.ts](file:///d:/86Connect%20Cars/src/lib/vehicles.server.ts). All 4 server pages (`/`, `/inventory`, `/inventory/[slug]`, `/brands`) use `export const revalidate = 0` and pass vehicles as props to client components. Vehicle API routes call `revalidatePath` on every mutation. The hardcoded `vehicles` array in [src/lib/data.ts](file:///d:/86Connect%20Cars/src/lib/data.ts) is now only used by `seed.ts`. Brand names/logos consolidated into [src/lib/brands.ts](file:///d:/86Connect%20Cars/src/lib/brands.ts) (single source of truth for admin dropdown, homepage grid, and `/brands` page).

### P0 — Finish the admin CRUD
Add `PUT` / `DELETE` to `/api/faqs/route.ts`, `/api/features/route.ts`, `/api/process-steps/route.ts`, `/api/testimonials/route.ts`, plus matching `[id]/route.ts` files. Mirror the [src/app/api/vehicles/[id]/route.ts](file:///d:/86Connect%20Cars/src/app/api/vehicles/%5Bid%5D/route.ts) pattern.

### P0 — Security: password hashing + session secret
- Replace `hashPassword` in [src/lib/auth.ts:5-7](file:///d:/86Connect%20Cars/src/lib/auth.ts) with `bcrypt` (or `argon2`). Re-hash on next login.
- Throw on boot if `SESSION_SECRET` is unset and `NODE_ENV === "production"`.
- Generate a random admin password on seed and log it once, instead of hardcoding `admin123`.

### P1 — Email integration
Add Resend (or Nodemailer + SMTP). On `POST /api/quotes`: (a) notify `info@the86connect.com`, (b) auto-reply to the submitter. Fix the misleading copy at [src/components/forms/QuoteForm.tsx:140](file:///d:/86Connect%20Cars/src/components/forms/QuoteForm.tsx). Surface real API errors to the user instead of swallowing them at [line 110](file:///d:/86Connect%20Cars/src/components/forms/QuoteForm.tsx).

### P1 — File upload for `referenceImage`
Either add a `/api/upload` route that stores to disk (or Supabase Storage / S3) and returns a URL the quote form includes in its POST body, or drop the image field from [QuoteForm.tsx](file:///d:/86Connect%20Cars/src/components/forms/QuoteForm.tsx). Don't ship dead UI.

### P1 — Seed script + first-run docs
Add `"seed": "tsx src/lib/db/seed.ts"` to [package.json](file:///d:/86Connect%20Cars/package.json). Document the dev setup (install, seed, dev) in this file or a README.

### P2 — SEO
- Add [src/app/sitemap.ts](file:///d:/86Connect%20Cars/src/app/sitemap.ts) — enumerate vehicles + static pages.
- Add [src/app/robots.ts](file:///d:/86Connect%20Cars/src/app/robots.ts).
- Add JSON-LD: `Organization` on home, `Vehicle` on `/inventory/[slug]`, `FAQPage` on the FAQ section, `BreadcrumbList` everywhere.
- Add canonical URLs to each page's metadata.
- Configure `images.remotePatterns` in [next.config.ts](file:///d:/86Connect%20Cars/next.config.ts) and migrate `<img>` → `next/image`.

### P2 — Analytics
Add Vercel Analytics (smallest diff: `@vercel/analytics` import in [src/app/layout.tsx](file:///d:/86Connect%20Cars/src/app/layout.tsx)) or GA4 via `<Script>`.

### P2 — Account protection
Extend [src/middleware.ts](file:///d:/86Connect%20Cars/src/middleware.ts) to protect `/account/*` — redirect to `/account/login` if no `user-session` cookie. Stops the flash-of-content on deep links.

### P2 — Favorites link correctness
Fix [src/app/account/page.tsx:145](file:///d:/86Connect%20Cars/src/app/account/page.tsx) to link to `/inventory/${fav.slug}` — either add a `slug` column to `favorites`, or join through `vehicles` to resolve the slug.

### P3 — Recently-viewed sync
Persist recently-viewed to the user account (new `recently_viewed` table or `user_meta` JSON column). Sync on login.

### P3 — Remove Supabase dead weight
Either wire Supabase properly (replace sql.js with Supabase Postgres + Supabase Auth + Supabase Storage for uploads) or delete [src/lib/supabase/](file:///d:/86Connect%20Cars/src/lib/supabase/) and the two `@supabase/*` deps from [package.json](file:///d:/86Connect%20Cars/package.json). Don't ship unused code with placeholder env values.

### P3 — Split `InventoryClient.tsx`
Extract: `useInventoryFilters` hook, `InventoryGrid`, `InventoryCard`, `SavedPresets`, `BrochureDownloader`, `CompareTray`. One concern per file.

### P3 — i18n
If the business targets Africa / Europe / Americas, add `next-intl` with at least EN. Defer until copy is stable.

---

## 7. Quick Reference: File Index

**Routing**
- [src/app/page.tsx](file:///d:/86Connect%20Cars/src/app/page.tsx) — home, dynamic imports for below-fold
- [src/app/layout.tsx](file:///d:/86Connect%20Cars/src/app/layout.tsx) — root layout, fonts, metadata
- [src/middleware.ts](file:///d:/86Connect%20Cars/src/middleware.ts) — protects `/admin/*`
- [src/app/inventory/[slug]/page.tsx](file:///d:/86Connect%20Cars/src/app/inventory/%5Bslug%5D/page.tsx) — `generateStaticParams` from `lib/data.ts`

**Data**
- [src/lib/data.ts](file:///d:/86Connect%20Cars/src/lib/data.ts) — hardcoded marketing data (**seed source only** — public pages no longer import from here)
- [src/lib/vehicles.server.ts](file:///d:/86Connect%20Cars/src/lib/vehicles.server.ts) — server-only vehicle accessors (reads SQLite)
- [src/lib/brands.ts](file:///d:/86Connect%20Cars/src/lib/brands.ts) — single source of truth for brand names/logos/categories
- [src/lib/gallery.server.ts](file:///d:/86Connect%20Cars/src/lib/gallery.server.ts) — server-only gallery payload normalizer (YouTube URL/ID → embed + thumbnail)
- [src/lib/db/sqlite.ts](file:///d:/86Connect%20Cars/src/lib/db/sqlite.ts) — sql.js loader, mtime-based reload, sync save
- [src/lib/db/schema.ts](file:///d:/86Connect%20Cars/src/lib/db/schema.ts) — SQL DDL (vehicles, testimonials, faqs, features, process_steps, quotes, users, favorites, admins, **gallery**)
- [src/lib/db/seed.ts](file:///d:/86Connect%20Cars/src/lib/db/seed.ts) — seeds DB + default admin + 8 default gallery items
- [src/lib/db/index.ts](file:///d:/86Connect%20Cars/src/lib/db/index.ts) — CRUD helpers (including `gallery`)

**Auth**
- [src/lib/auth.ts](file:///d:/86Connect%20Cars/src/lib/auth.ts) — HMAC session tokens + SHA-256 password hash
- [src/hooks/useUserAuth.ts](file:///d:/86Connect%20Cars/src/hooks/useUserAuth.ts) — auth state + favorites

**Forms**
- [src/components/forms/QuoteForm.tsx](file:///d:/86Connect%20Cars/src/components/forms/QuoteForm.tsx) — quote form (misleading success, dead image field, swallows errors)
- [src/components/forms/schema.ts](file:///d:/86Connect%20Cars/src/components/forms/schema.ts) — Zod schema

**Admin**
- [src/components/admin/CrudPage.tsx](file:///d:/86Connect%20Cars/src/components/admin/CrudPage.tsx) — generic CRUD UI (used by testimonials, faqs, features, process-steps, **gallery**)
- [src/components/admin/VehicleForm.tsx](file:///d:/86Connect%20Cars/src/components/admin/VehicleForm.tsx) — vehicle create/edit with **brand dropdown** from `BRAND_NAMES`
- [src/app/admin/gallery/page.tsx](file:///d:/86Connect%20Cars/src/app/admin/gallery/page.tsx) — gallery management (type, title, src, sortOrder)

**Key client components**
- [src/components/inventory/InventoryClient.tsx](file:///d:/86Connect%20Cars/src/components/inventory/InventoryClient.tsx) — ~1000+ line monolith
- [src/components/inventory/VehicleDetailClient.tsx](file:///d:/86Connect%20Cars/src/components/inventory/VehicleDetailClient.tsx)
- [src/components/brands/BrandsClient.tsx](file:///d:/86Connect%20Cars/src/components/brands/BrandsClient.tsx)
- [src/components/sections/GlobalShipping.tsx](file:///d:/86Connect%20Cars/src/components/sections/GlobalShipping.tsx) — shipping methods + delivery regions + country scroller

**Config**
- [package.json](file:///d:/86Connect%20Cars/package.json) — no `seed` script
- [next.config.ts](file:///d:/86Connect%20Cars/next.config.ts) — empty
- [src/app/globals.css](file:///d:/86Connect%20Cars/src/app/globals.css) — Tailwind v4 `@theme` + design tokens
- `.env.local` — placeholder Supabase values, identical to `.env.example`

---

## 8. Dev Setup Notes

```bash
npm install
npx tsx src/lib/db/seed.ts   # manual seed — no `npm run seed` script yet
npm run dev                  # Turbopack, http://localhost:3000
```

**Admin login:** `admin@86connect.com` / `admin123` (set by `seed.ts`).

**`.env.local`:** Supabase values are placeholders. No code path uses Supabase today, so leaving them as-is is safe — but they would throw if any future code path reached them. Set `SESSION_SECRET` to a strong random string in production; the default `"86connect-dev-secret-change-in-production"` is for dev only.

**Theming gotcha:** Use `var(--text-primary)`, `var(--bg-primary)`, `var(--bg-secondary)`, `var(--bg-elevated)`, `var(--bg-card)`, `var(--text-secondary)`, `var(--text-muted)`, `var(--border-color)`. Tailwind color tokens like `text-ink`, `bg-surface-2`, `text-muted-soft` are not defined and will silently fail to apply styles.

**DB gotcha:** `dev.db` is a real file at the project root. Deleting it requires re-running `seed.ts`. The `sqlite.ts` module stats the file mtime on every `getSqliteDb()` call and reloads if it changed, so re-seeding during a running dev server works without a restart. The `gallery` table is auto-created on next server start (DDL uses `CREATE TABLE IF NOT EXISTS`) — no need to re-seed just to get the table. **Do not** re-introduce a module-level `dbInstance` cache in `db/index.ts` — Turbopack gives each API route file its own module instance, so a cache there would bypass the mtime check and serve stale data after writes from sibling routes (e.g. PUT in `[id]/route.ts` invisible to GET in `route.ts`). See [§ 9.7](#96--cross-route-db-cache-invalidation).

**Gallery gotcha:** The `gallery` table is seeded with 8 default items (5 photos + 3 videos) by `seed.ts`. If you skip seeding, the table will still exist (auto-created) but be empty — the Gallery section shows an "add photos and videos from the admin panel" placeholder. Admin can add items at `/admin/gallery`. Photos accept any direct image URL (Cloudinary recommended); videos accept any YouTube URL/ID format.

**Adding a vehicle as admin:** Go to `/admin/vehicles/new`, fill the form (brand is a dropdown from `BRAND_NAMES`), save. The new vehicle appears on `/`, `/inventory`, `/inventory/[slug]`, and the brand card on `/brands` shows the updated count — all without a manual refresh, because the API calls `revalidatePath`.

---

## 9. Phase 2 Architecture Updates (Resolved)

This section tracks the architectural changes made after the original analysis. Each entry names the problem, the fix, and the files touched.

### 9.1 ✅ Public/admin data disconnect (was § 5 item #1, § 6 P0)

**Problem:** Public pages imported `vehicles` from hardcoded `lib/data.ts`; admin wrote to SQLite. Admin edits never appeared publicly.

**Fix:** Created [src/lib/vehicles.server.ts](file:///d:/86Connect%20Cars/src/lib/vehicles.server.ts) — a server-only module with `getVehicles()`, `getVehicleBySlug()`, `getFeaturedVehicles()` that read from SQLite. Updated all 4 public server pages to call these accessors and pass vehicles as props to their client children. Added `export const revalidate = 0` to each page. Added `revalidatePath` calls in both vehicle API route files so mutations invalidate the caches.

**Files touched:**
- Created: [src/lib/vehicles.server.ts](file:///d:/86Connect%20Cars/src/lib/vehicles.server.ts)
- Modified: [src/app/page.tsx](file:///d:/86Connect%20Cars/src/app/page.tsx), [src/app/inventory/page.tsx](file:///d:/86Connect%20Cars/src/app/inventory/page.tsx), [src/app/inventory/[slug]/page.tsx](file:///d:/86Connect%20Cars/src/app/inventory/%5Bslug%5D/page.tsx), [src/app/brands/page.tsx](file:///d:/86Connect%20Cars/src/app/brands/page.tsx), [src/components/sections/FeaturedVehicles.tsx](file:///d:/86Connect%20Cars/src/components/sections/FeaturedVehicles.tsx), [src/components/sections/Brands.tsx](file:///d:/86Connect%20Cars/src/components/sections/Brands.tsx), [src/components/brands/BrandsClient.tsx](file:///d:/86Connect%20Cars/src/components/brands/BrandsClient.tsx), [src/components/inventory/InventoryClient.tsx](file:///d:/86Connect%20Cars/src/components/inventory/InventoryClient.tsx), [src/app/api/vehicles/route.ts](file:///d:/86Connect%20Cars/src/app/api/vehicles/route.ts), [src/app/api/vehicles/[id]/route.ts](file:///d:/86Connect%20Cars/src/app/api/vehicles/%5Bid%5D/route.ts)

### 9.2 ✅ Brand registry duplication + admin free-text brand entry

**Problem:** The 36-brand list (names, logos, categories) was duplicated across `BrandsClient.tsx`, `Brands.tsx`, and the admin vehicle form used a free-text brand input. Brand names could mismatch between admin entries and the public brand grid/filter pills.

**Fix:** Created [src/lib/brands.ts](file:///d:/86Connect%20Cars/src/lib/brands.ts) as the single source of truth — exports `BRAND_LIST`, `BRAND_NAMES`, `BRAND_LOGO_MAP`, `CHINESE_BRANDS`, `TRUCK_BRANDS`, `getBrandLogo()`, `getBrandCategory()`. All three consumers now import from it. The admin vehicle form ([VehicleForm.tsx](file:///d:/86Connect%20Cars/src/components/admin/VehicleForm.tsx)) uses a `<select>` populated from `BRAND_NAMES` — admin can only pick a brand that exists in the registry, so the inventory filter pills, the `/brands` page cards, and the homepage brand grid will always match.

**Files touched:**
- Created: [src/lib/brands.ts](file:///d:/86Connect%20Cars/src/lib/brands.ts)
- Modified: [src/components/sections/Brands.tsx](file:///d:/86Connect%20Cars/src/components/sections/Brands.tsx), [src/components/brands/BrandsClient.tsx](file:///d:/86Connect%20Cars/src/components/brands/BrandsClient.tsx), [src/components/admin/VehicleForm.tsx](file:///d:/86Connect%20Cars/src/components/admin/VehicleForm.tsx)

### 9.3 ✅ Brand count not reflecting admin-added inventory

**Problem:** `BrandsClient` computed per-brand vehicle counts from hardcoded `lib/data.ts`. If admin added 5 BYD cars, the BYD card still showed the old count.

**Fix:** `BrandsClient` now receives live DB vehicles as a prop (passed from the server page) and computes counts in a `useMemo` with `[vehicles]` dependency. If admin adds 5 BYD cars, the BYD card on `/brands` shows "5 cars available" on the next page load (immediately, because `revalidate = 0`).

**Files touched:** [src/app/brands/page.tsx](file:///d:/86Connect%20Cars/src/app/brands/page.tsx), [src/components/brands/BrandsClient.tsx](file:///d:/86Connect%20Cars/src/components/brands/BrandsClient.tsx)

### 9.4 ✅ Gallery now admin-managed (Cloudinary photos + YouTube videos)

**Problem:** The Gallery section on the homepage had 8 hardcoded items in [src/components/sections/Gallery.tsx](file:///d:/86Connect%20Cars/src/components/sections/Gallery.tsx). No way for admin to add/remove/reorder items.

**Fix:** Added a new `gallery` table to the schema, a `gallery` CRUD helper to [src/lib/db/index.ts](file:///d:/86Connect%20Cars/src/lib/db/index.ts), full CRUD API routes at `/api/gallery` and `/api/gallery/[id]`, an admin management page at `/admin/gallery` (using the existing `CrudPage` component), and a "Gallery" nav item in the admin sidebar. The public Gallery component now `fetch("/api/gallery")` on mount instead of reading a hardcoded array. The API normalizes YouTube input (raw 11-char ID, `youtu.be/...`, `watch?v=...`, `/embed/...`, `/shorts/...`) into the canonical embed URL + `hqdefault.jpg` thumbnail, so admin can paste any YouTube link format. Photos accept any direct image URL (Cloudinary recommended). `revalidatePath("/")` after every gallery mutation means admin edits appear on the homepage without a manual refresh.

**Schema:** `gallery(id TEXT PK, type TEXT CHECK IN ('photo','video'), src TEXT, thumbnail TEXT, title TEXT, sortOrder INTEGER, active INTEGER, createdAt TEXT)`.

**Files touched:**
- Created: [src/lib/gallery.server.ts](file:///d:/86Connect%20Cars/src/lib/gallery.server.ts), [src/app/api/gallery/route.ts](file:///d:/86Connect%20Cars/src/app/api/gallery/route.ts), [src/app/api/gallery/[id]/route.ts](file:///d:/86Connect%20Cars/src/app/api/gallery/%5Bid%5D/route.ts), [src/app/admin/gallery/page.tsx](file:///d:/86Connect%20Cars/src/app/admin/gallery/page.tsx)
- Modified: [src/lib/db/schema.ts](file:///d:/86Connect%20Cars/src/lib/db/schema.ts) (added `gallery` table), [src/lib/db/index.ts](file:///d:/86Connect%20Cars/src/lib/db/index.ts) (added `gallery` helper), [src/lib/db/seed.ts](file:///d:/86Connect%20Cars/src/lib/db/seed.ts) (seeds 8 default gallery items), [src/app/admin/layout.tsx](file:///d:/86Connect%20Cars/src/app/admin/layout.tsx) (added Gallery nav item), [src/components/sections/Gallery.tsx](file:///d:/86Connect%20Cars/src/components/sections/Gallery.tsx) (fetches from `/api/gallery`)

### 9.5 ✅ Quote submissions admin viewer (was already working)

Confirmed working: `/admin/quotes` fetches from `/api/quotes` and displays all submissions with name/email/whatsapp/country/vehicle/budget/message. Status can be updated (new → contacted → closed) via PUT. No changes needed.

### 9.6 ✅ Cross-route DB cache invalidation

**Problem:** PUT/DELETE on `/api/{table}/[id]/route.ts` returned success but subsequent GET on `/api/{table}/route.ts` returned stale data. Affected every table (gallery, vehicles, quotes, etc.), not just one route.

**Root cause:** [db/index.ts](file:///d:/86Connect%20Cars/src/lib/db/index.ts) cached the `Database` instance in a module-level `dbInstance` variable and only called `getSqliteDb()` (which does the mtime check) on the first call. Turbopack bundles each API route file as its own module, so `route.ts` (GET) and `[id]/route.ts` (PUT/DELETE) each had their own `dbInstance`. When `[id]/route.ts` wrote to disk via `saveSqliteDb`, `route.ts`'s cached `dbInstance` was never invalidated — the mtime check in `getSqliteDb()` was never reached after the first call.

**Fix:** Removed the `dbInstance` cache in `db/index.ts`. `getDb()` now delegates directly to `getSqliteDb()` on every call. The mtime check in `getSqliteDb()` is the real cache — it returns the cached in-memory `db` when mtime is unchanged (fast path) and reloads from disk when mtime changes (after any write). One-line fix:

```typescript
async function getDb(): Promise<Database> {
  return getSqliteDb();  // mtime check is the cache; no module-level cache here
}
```

**Files touched:**
- Modified: [src/lib/db/index.ts](file:///d:/86Connect%20Cars/src/lib/db/index.ts) (removed `dbInstance` cache, ~6 lines deleted)

**Verified:** POST photo → POST video (raw YouTube ID) → GET shows both → PUT update title/sortOrder → GET shows updated values → DELETE → GET shows item gone. All cross-route, all consistent.

### 9.7 What remains unresolved (still in § 5 and § 6)

The Phase 2 work resolved the data disconnect, brand registry, brand counts, gallery management, and the cross-route DB cache invalidation bug. These items from the original analysis are **still open**:
- § 5 item #2: Broken CRUD for FAQs / features / process-steps / testimonials (only GET + POST; edit/delete 405/404)
- § 5 item #3: No email integration for quote submissions
- § 5 item #4: `referenceImage` dead UI in QuoteForm
- § 5 item #5: QuoteForm swallows all errors
- § 5 items #6–#20: Security (password hashing, session secret, default admin), SEO, analytics, i18n, image optimization, etc.
- § 6 P0 "Finish the admin CRUD" — still pending for the 4 content tables
- § 6 P0 "Security: password hashing + session secret" — still pending
