# Plan: App Analysis & Improvement Documentation

## Summary

Create a single comprehensive Markdown documentation file at `docs/PROJECT_ANALYSIS.md` that explains how the 86Connect Cars app currently works, identifies missing logic/functions, and recommends improvements. The file is grounded in actual codebase exploration (Next.js 16 App Router, SQLite via sql.js, hardcoded `lib/data.ts`, hand-rolled HMAC auth, admin CRUD, public marketing pages).

This is a documentation-only task — no source code changes. The deliverable is one new file under `docs/`.

---

## Current State Analysis (informs doc content)

The codebase has two parallel data worlds that don't talk to each other:

1. **Hardcoded marketing data** (`src/lib/data.ts`) — 21 vehicles, testimonials, FAQs, features, processSteps, heroStats, shippingRoutes, navLinks. Imported directly by every public page (`/`, `/inventory`, `/inventory/[slug]`, `/brands`, `/about`) and by `FeaturedVehicles`/`Brands`/`Testimonials`/`FAQ` sections.

2. **SQLite DB via sql.js** (`src/lib/db/`) — vehicles, quotes, faqs, features, process_steps, testimonials, users, admins, favorites tables. Written to by all `/api/*` routes and the admin panel.

**The disconnect:** admin edits go to SQLite; public pages read from the hardcoded file. Admin-created vehicles never appear on the public site. This is the single biggest functional gap.

### Other confirmed gaps (will be documented)
- `CrudPage.tsx` calls `PUT /api/{path}` and `DELETE /api/{path}/{id}`, but only `vehicles` has a `[id]` route with PUT/DELETE. Editing/deleting FAQs, features, process-steps, testimonials will 405/404.
- `QuoteForm.tsx` success message says "Your email app should now be open" — no email is sent, no `mailto:` opens. Submission is silently saved to SQLite. Errors are swallowed in an empty `catch {}` and success UI shows regardless.
- `QuoteForm.tsx` collects `referenceImage` (with preview) but never includes it in the POST body. No upload endpoint exists.
- `auth.ts` uses plain `crypto.createHash("sha256")` for passwords — no salt, no slow hash. Token signing uses HMAC-SHA256 with a default secret `"86connect-dev-secret-change-in-production"` when `SESSION_SECRET` is unset.
- Default admin `admin@86connect.com / admin123` seeded by `src/lib/db/seed.ts`. No `npm run seed` script — must run `npx tsx src/lib/db/seed.ts` manually.
- `src/lib/supabase/` is scaffold-only (placeholder env values, no calls).
- `/account` favorites link uses `fav.vehicleId` as a slug — works only because `id === slug` for hardcoded vehicles.
- No sitemap.ts, no robots.ts, no JSON-LD, no analytics (GA/Vercel/Plausible), no i18n.
- No email integration (no Resend/Nodemailer/SMTP). No payment integration.
- `InventoryClient.tsx` is ~1000+ lines (filters, sorting, saved presets, PDF brochure via html2canvas/jsPDF, share, compare, favorites) — a maintainability flag.
- `.env.local` is a verbatim copy of `.env.example` with placeholder Supabase values.

---

## Proposed Changes

### Single deliverable: `docs/PROJECT_ANALYSIS.md`

**Location:** `d:\86Connect Cars\docs\PROJECT_ANALYSIS.md` (new `docs/` directory at project root)

**Why this location:** Project-root `docs/` is conventional, discoverable, and isolated from `src/`. The user explicitly requested a Markdown file, so this is not proactive doc creation.

### Document structure (sections + content)

The file will be written in English (user's working language) with these top-level sections:

#### 1. Overview
- What the app is: Chinese vehicle export lead-capture + marketing site.
- Stack: Next.js 16.2.10 (App Router, Turbopack), React 19, Tailwind v4 (CSS `@theme`, no `tailwind.config.ts`), sql.js (SQLite WASM), motion/react (Framer Motion successor), GSAP, three.js + @react-three/fiber, react-hook-form + Zod, html2canvas + jsPDF.
- Two data worlds (hardcoded vs SQLite) — flagged up front because it explains most gaps.

#### 2. Architecture & Directory Map
- `src/app/` — App Router routes (public, account, admin, api). List every route.
- `src/components/` — by subfolder (admin, brands, forms, hero, inventory, layout, sections, three, ui). Note client vs server.
- `src/lib/` — `data.ts` (hardcoded), `db/` (SQLite + seed), `auth.ts` (HMAC tokens), `supabase/` (unused scaffold), `motion.ts`, `utils.ts`.
- `src/hooks/` — `useMediaQuery`, `useMousePosition`, `useRecentlyViewed`, `useReducedMotion`, `useUserAuth` (auth + favorites).
- `src/types/index.ts` — `Vehicle`, `Testimonial`, `FAQItem`, `ProcessStep`, `Feature`, `QuoteFormData`.
- `src/middleware.ts` — protects `/admin/*` except `/admin/login`.
- Root configs: `package.json` (no `seed` script), `next.config.ts` (empty), `tsconfig.json`, `.env.example`/`.env.local` (identical placeholders).

#### 3. How the App Works (by flow)
- **Public browse flow:** Home → FeaturedVehicles → `/inventory` (filters from hardcoded `vehicles`) → `/inventory/[slug]` (statically pre-rendered via `generateStaticParams`). Recently-viewed saved to `localStorage` (`86connect-recently-viewed`, max 5).
- **Lead capture flow:** Contact section QuoteForm → `POST /api/quotes` → SQLite `quotes` table. Auto-links to logged-in user via `user-session` cookie if present. No email sent. Success UI shows regardless of API result.
- **User account flow:** `/account/signup` → `POST /api/user/signup` → sets `user-session` cookie (30d). `/account` shows user's quotes + favorites. Favorites via `GET/POST/DELETE /api/user/favorites`. `/account` is client-side protected (fetch `/api/user/me`, redirect on 401) — NOT middleware-protected.
- **Admin flow:** `/admin/login` → `POST /api/auth/login` → `admin-session` cookie (7d). Middleware blocks `/admin/*`. Dashboard + CRUD pages. Vehicles have full CRUD; testimonials/faqs/features/process-steps can only be created (edit/delete broken — see §5).
- **Brands flow:** `/brands` reads `vehicles` from `lib/data.ts`, computes per-brand counts/min-prices, filters by Chinese/Foreign/Trucks sets. Quick-jump pills link to `/inventory?brand=…`.
- **Theming:** CSS custom properties in `globals.css` (`--text-primary`, `--bg-primary`, etc.). Light/dark toggle via `ThemeToggle` + `useSyncExternalStore` + custom `86connect:theme-change` event. **Not** Tailwind color tokens — `text-ink`/`bg-surface-2` will not work.
- **DB persistence:** `dev.db` at project root. `sqlite.ts` stats file mtime on every request and reloads if changed (handles re-seed). All writes flushed synchronously via `saveSqliteDb`.

#### 4. API Reference
- Table of every route under `/api/*` with method, purpose, auth, DB table touched, known issues.
- Group: admin auth, user auth + favorites + quotes, content CRUD (vehicles vs the four broken ones), quotes.

#### 5. Missing Logic & Functions (the "what's missing" section the user asked for)
Concrete list with file paths:
1. **Public/admin data disconnect** — public pages import `lib/data.ts`; admin writes to SQLite. Admin edits never reach the public site.
2. **Broken CRUD for FAQs/features/process-steps/testimonials** — `CrudPage.tsx` issues PUT/DELETE that the route handlers don't implement. Only vehicles has `[id]` route.
3. **No email integration** — quote submissions silently saved; no notification to business; no auto-reply to user; misleading success copy in `QuoteForm.tsx:140`.
4. **`referenceImage` is dead** — collected + previewed but never sent; no upload endpoint.
5. **QuoteForm swallows errors** — empty `catch {}`, unconditional success UI.
6. **Weak password hashing** — plain SHA-256, no salt, no slow hash (`auth.ts:5-7`).
7. **Default session secret** — `SESSION_SECRET` falls back to a hardcoded string; tokens forgeable in any deployment that forgets to set it.
8. **Default admin credentials** — `admin@86connect.com / admin123` seeded; no forced change on first login.
9. **No `npm run seed` script** — fresh checkout won't have a working DB until manual `npx tsx src/lib/db/seed.ts`.
10. **`/account` favorites link uses `vehicleId` as slug** — works only because hardcoded `id === slug`.
11. **`/account` routes not middleware-protected** — client-side redirect only; deep links to `/account` flash content before redirect.
12. **No password reset, no email verification, no OAuth.**
13. **No sitemap.ts / robots.ts / JSON-LD** — SEO gaps despite per-page metadata.
14. **No analytics** — GA, Vercel, Plausible, etc. all absent.
15. **No i18n** — hardcoded English only.
16. **No image optimization config** — `next.config.ts` empty; all images use raw `<img>` (some with eslint-disable). No `next/image`, no remote patterns.
17. **Recently-viewed not synced to account** — device-local only, even for logged-in users.
18. **Supabase scaffold is dead weight** — `src/lib/supabase/` + `@supabase/ssr` + `@supabase/supabase-js` installed but unused; env values are placeholders.
19. **`.env.local` is a verbatim copy of `.env.example`** — Supabase values are placeholders; would throw if any code path reached them.
20. **`InventoryClient.tsx` monolith** — ~1000+ lines mixing filters, sorting, presets, PDF brochure, share, compare, favorites. Maintainability risk.

#### 6. Improvement Recommendations (the "what should I improve" section the user asked for)
Prioritized, with effort hints and the specific files to touch:

**P0 — Fix the data disconnect (functional correctness)**
- Option A (smaller diff, recommended): make public pages fetch from `/api/vehicles` at runtime (or use Server Components with `fetch` + `revalidate`). Delete the hardcoded `vehicles` array from `lib/data.ts` or keep it only as a seed source.
- Option B: keep `lib/data.ts` as the source of truth and have the admin write back to it (not viable — file writes at runtime are not portable).

**P0 — Finish the admin CRUD**
- Add `PUT`/`DELETE` to `/api/faqs/route.ts`, `/api/features/route.ts`, `/api/process-steps/route.ts`, `/api/testimonials/route.ts`, plus matching `[id]/route.ts` files. Mirror the `vehicles/[id]/route.ts` pattern.

**P0 — Security: password hashing + session secret**
- Replace `hashPassword` with `bcrypt` (or `argon2`). Add a `password_hash` migration (re-hash on next login).
- Require `SESSION_SECRET` to be set in production (throw on boot if unset and `NODE_ENV === "production"`).
- Force admin password change on first login, or generate a random password on seed and log it once.

**P1 — Email integration**
- Add Resend (or Nodemailer + SMTP). On `POST /api/quotes`: (a) notify `info@the86connect.com`, (b) auto-reply to the submitter. Fix the misleading success copy in `QuoteForm.tsx:140`. Surface real API errors to the user instead of swallowing them.

**P1 — File upload for `referenceImage`**
- Either: (a) add a `/api/upload` route that stores to disk (or Supabase Storage / S3) and returns a URL the quote form includes in its POST body, or (b) drop the image field from the form. Don't ship dead UI.

**P1 — Seed script + first-run docs**
- Add `"seed": "tsx src/lib/db/seed.ts"` to `package.json`. Document the dev setup in `README.md` (or this doc).

**P2 — SEO**
- Add `src/app/sitemap.ts` (enumerate vehicles + static pages).
- Add `src/app/robots.ts`.
- Add JSON-LD: `Organization` on home, `Vehicle` on `/inventory/[slug]`, `FAQPage` on the FAQ section, `BreadcrumbList` everywhere.
- Add a canonical URL to each page's metadata.
- Configure `next/image` remote patterns in `next.config.ts` and migrate `<img>` → `<Image>` for vehicle/brand assets.

**P2 — Analytics**
- Add Vercel Analytics (smallest diff) or GA4. One `<Script>` or `@vercel/analytics` import in the root layout.

**P2 — Account protection**
- Extend `middleware.ts` to protect `/account/*` (redirect to `/account/login` if no `user-session`). Stops the flash-of-content on deep links.

**P2 — Favorites link correctness**
- `/account` should link to `/inventory/${fav.slug}` (store slug alongside vehicleId, or fetch slug from the vehicle). Add a `slug` column to `favorites` or join through `vehicles`.

**P3 — Recently-viewed sync**
- Persist recently-viewed to the user account (new `recently_viewed` table or merge into a `user_meta` table). Sync on login.

**P3 — Remove Supabase dead weight**
- Either wire Supabase properly (replace sql.js with Supabase Postgres + Supabase Auth + Supabase Storage for uploads) or delete `src/lib/supabase/` and the two `@supabase/*` deps. Don't ship unused code with placeholder env values.

**P3 — Split `InventoryClient.tsx`**
- Extract: `useInventoryFilters` hook, `InventoryGrid`, `InventoryCard`, `SavedPresets`, `BrochureDownloader`, `CompareTray`. One concern per file.

**P3 — i18n**
- If the business targets Africa/Europe/Americas, add `next-intl` with at least EN. Defer until copy is stable.

#### 7. Quick Reference: File Index
- One-liner per critical file with its path, so the doc reader can jump to source.
- Group by: routing, data, auth, components, config.

#### 8. Dev Setup Notes
- `npm install`, `npm run dev` (Turbopack), `npx tsx src/lib/db/seed.ts` (manual seed — flag the missing script), admin login `admin@86connect.com / admin123`.
- Note that `.env.local` needs real Supabase values only if/when Supabase is wired (currently unused).

---

## Assumptions & Decisions

1. **Single file, not a docs site.** User said "make a md file" (singular). One `docs/PROJECT_ANALYSIS.md`. No `docs/` index, no multi-file split.
2. **English.** User's working language is English throughout the session.
3. **Documentation only — no code changes.** The user asked for analysis, not implementation. P0/P1/P2/P3 items are listed as recommendations with file paths; nothing is edited.
4. **No deletion of the Supabase scaffold in this task.** Flagged as a recommendation only.
5. **File path grounded.** Every path in the doc is from actual Phase 1 exploration (search agent + three verified reads: `auth.ts`, `QuoteForm.tsx`, `CrudPage.tsx`).
6. **`docs/` directory created implicitly by the Write tool** — no need to `mkdir` separately.
7. **No emojis** per workspace style unless the user asks. The doc uses plain Markdown headings, tables, and code fences with `ts`/`bash` language tags.
8. **Proportional length.** Aim for a focused doc (~400-600 lines) — detailed enough to be actionable, not a sprawling wiki. Every recommendation names the file to touch.

## Verification Steps

After writing `docs/PROJECT_ANALYSIS.md`:

1. **Read the file back** to confirm structure renders as Markdown (headings, tables, code fences).
2. **Spot-check 3 file paths** cited in the doc against the actual filesystem (e.g. `src/lib/auth.ts:5`, `src/components/forms/QuoteForm.tsx:140`, `src/components/admin/CrudPage.tsx:33`) to confirm line references are accurate.
3. **Confirm no source files were modified** — only `docs/PROJECT_ANALYSIS.md` should be new. `git status` should show exactly one untracked file.
4. **Sanity-check that the doc answers the user's three questions:** (a) how the app works (§1-4), (b) what logic/functions are missing (§5), (c) what to improve (§6).
