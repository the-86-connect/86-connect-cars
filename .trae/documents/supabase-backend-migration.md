# Plan: Migrate Backend to Supabase + PostgreSQL

## Summary

Replace the current SQLite (sql.js WASM) backend with Supabase PostgreSQL for production. Migrate all 11 database tables, user auth (signup/login), admin auth (password-only), favorites, rate limiting, and all 22 API routes. The frontend remains Next.js on Vercel.

---

## Current State Analysis

### Database
- **SQLite** via `sql.js` (WASM), file-based at `dev.db`
- 11 tables: `vehicles`, `testimonials`, `faqs`, `features`, `process_steps`, `quotes`, `users`, `favorites`, `admins`, `gallery`, `brands`
- Schema defined in `src/lib/db/schema.ts`
- DB helpers in `src/lib/db/sqlite.ts` (initialization, migration, save)
- CRUD abstraction in `src/lib/db/index.ts` (generic `dbQuery`, `dbInsert`, `dbUpdate`, `dbDelete` + table-specific helpers)

### Auth
- **Custom JWT** with `httpOnly` cookies (no external provider)
- Admin: `admin-session` cookie, `createSessionToken`/`verifySessionToken` in `src/lib/auth.ts`
- User: `user-session` cookie, `createUserSessionToken`/`verifyUserSessionToken`
- Password hashing: SHA-256 (weak — should upgrade to bcrypt/argon2)
- Admin login: POST `/api/auth/login` (email + password) → `src/app/admin/login/page.tsx`
- User signup: POST `/api/user/signup` (name, email, password, whatsapp, country)
- User login: POST `/api/user/login` (email + password)
- Proxy (`src/proxy.ts`): protects `/admin/*` routes via `admin-session` cookie

### Rate Limiting
- In-memory `Map` in `src/lib/rate-limit.ts`
- `rateLimitAuth`: 5 req/15min per IP
- `rateLimitForm`: 10 req/1hr per IP
- Ponytail note: "Fine for single-process. Upgrade to Redis/Upstash when scaling."

### Supabase (current)
- `@supabase/ssr` and `@supabase/supabase-js` already installed
- Client and server helpers scaffolded in `src/lib/supabase/` but **not used anywhere**
- Env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` already in `.env.local`

### User Requirements
1. Admin login: **password only** (no email)
2. Rate limiting for sign in, sign up, and form submissions
3. All existing systems must work (vehicles, quotes, gallery, brands, testimonials, FAQs, features, users, favorites, etc.)

---

## Proposed Changes

### Step 1: Supabase Project & Schema Setup

**What**: Create Supabase project, set up PostgreSQL schema, configure env vars.

**Files to create/modify**:
- `supabase/migrations/00001_initial_schema.sql` — SQL migration for all 11 tables
- `.env.local` — add `DATABASE_URL` (Supabase connection string for server-side)
- `.env.example` — update with Supabase vars

**Migration SQL** translates the existing `src/lib/db/schema.ts` SQLite schema to PostgreSQL:
- `TEXT` stays `TEXT`
- `INTEGER` stays `INTEGER`
- `datetime('now')` → `NOW()`
- `CHECK` constraints stay
- Add UUID primary keys via `gen_random_uuid()`
- Add `created_at`/`updated_at` with `TIMESTAMPTZ DEFAULT NOW()`
- Add `UNIQUE` constraints
- Add indexes on frequently queried columns (slug, email, brand, userId)

### Step 2: Database Layer — Replace sql.js with Supabase Client

**What**: Rewrite `src/lib/db/index.ts` to use Supabase's `@supabase/supabase-js` server client instead of SQLite.

**Files to modify**:
- `src/lib/db/index.ts` — replace all `getSqliteDb()`/`sqliteQuery`/`sqliteRun` calls with Supabase queries
- `src/lib/db/sqlite.ts` — keep for local dev fallback (optional), or remove
- `src/lib/db/schema.ts` — keep as reference, mark as "Supabase mirror"

**New file**:
- `src/lib/supabase/admin.ts` — Supabase admin client with service_role key for server-side operations (bypasses RLS)

**How**: Each table helper (`vehicles`, `testimonials`, etc.) will use Supabase's query builder:
```ts
// Before (SQLite)
const db = await getSqliteDb();
return sqliteQuery(db, "SELECT * FROM vehicles ORDER BY createdAt DESC");

// After (Supabase)
const supabase = await getSupabaseServer();
const { data } = await supabase.from("vehicles").select("*").order("created_at", { ascending: false });
return data ?? [];
```

**Key differences to handle**:
- `id` in SQLite is `TEXT` (custom IDs like `vehicle-1234567890-abc`). Keep same ID generation.
- `images`, `specs`, `features`, `colors`, `exportDocs` are JSON strings — use PostgreSQL `JSONB` type
- `createdAt`/`updatedAt` column names → `created_at`/`updated_at` (snake_case for PostgreSQL convention)
- **All existing code references `createdAt`** — either map in the DB layer or use a view. **Decision**: use `created_at` in DB, map back to `createdAt` in the API response layer.

### Step 3: User Auth — Supabase Auth for Signup/Login

**What**: Replace custom JWT user auth with Supabase Auth. Users get managed auth with email verification, password reset, etc.

**Files to modify**:
- `src/app/api/user/signup/route.ts` — use Supabase Auth `signUp()`
- `src/app/api/user/login/route.ts` — use Supabase Auth `signInWithPassword()`
- `src/app/api/user/logout/route.ts` — use Supabase Auth `signOut()`
- `src/app/api/user/me/route.ts` — use Supabase `getUser()`
- `src/app/api/user/favorites/route.ts` — use Supabase `getUser()` for auth check
- `src/app/api/user/quotes/route.ts` — use Supabase `getUser()` for auth check
- `src/app/account/login/page.tsx` — update to use Supabase client
- `src/app/account/signup/page.tsx` — update to use Supabase client
- `src/app/account/page.tsx` — update to use Supabase session

**User session management**: Supabase handles cookies via `@supabase/ssr`. The `user-session` cookie is replaced by Supabase's built-in session management.

**Rate limiting**: Supabase Auth has built-in rate limiting on the Supabase side. We'll also add custom rate limiting on our API routes (Step 5).

### Step 4: Admin Auth — Password-Only Login

**What**: Change admin login from email+password to password-only. The admin table still stores credentials, but the login form only asks for a password.

**Files to modify**:
- `src/app/admin/login/page.tsx` — remove email field, add password-only form
- `src/app/api/auth/login/route.ts` — query by role instead of email, validate password only
- `src/app/api/auth/me/route.ts` — update to return admin role info
- `src/app/api/auth/logout/route.ts` — keep as-is (clear cookie)

**Admin table update**: The `admins` table has `email` and `passwordHash`. For password-only login:
- Find the admin by `role = 'admin'` (or the first admin)
- Verify password hash
- Issue session token

**New admin creation**: Admin accounts are created via Supabase dashboard or seed script, not through the public UI. Password is hashed with bcrypt/argon2.

### Step 5: Rate Limiting — Upgrade to Production-Ready

**What**: Replace in-memory rate limiter with a Supabase-based or Upstash Redis solution.

**Decision**: Use **Upstash Redis** (free tier, 10k commands/day). It's a Vercel integration, works across serverless instances, and has a simple REST API.

**Files to modify**:
- `src/lib/rate-limit.ts` — replace `Map`-based with `@upstash/ratelimit` + `@upstash/redis`
- All API routes that use `rateLimitAuth`/`rateLimitForm` — no change needed (same API)

**Rate limits**:
- Auth endpoints (signup, login): 5 req/15min per IP
- Form submissions (quotes): 10 req/1hr per IP
- Admin login: 5 req/15min per IP

### Step 6: API Route Updates

**What**: Update all 22 API routes to use Supabase instead of SQLite.

**Files to modify** (all `src/app/api/**/route.ts`):
- `vehicles/route.ts` — GET, POST
- `vehicles/[id]/route.ts` — GET, PUT, DELETE
- `quotes/route.ts` — GET, POST, PUT, DELETE
- `testimonials/route.ts` — GET, POST, PUT, DELETE (uses `CrudPage` generic)
- `faqs/route.ts` — same
- `features/route.ts` — same
- `process-steps/route.ts` — same
- `gallery/route.ts` — GET, POST
- `gallery/[id]/route.ts` — GET, PUT, DELETE
- `brands/route.ts` — GET, POST
- `brands/[id]/route.ts` — GET, PUT, DELETE
- `admin/users/route.ts` — GET, POST
- `admin/users/[id]/route.ts` — GET, PUT, DELETE
- `user/favorites/route.ts` — GET, POST, DELETE
- `user/quotes/route.ts` — GET
- `user/signup/route.ts` — Supabase Auth
- `user/login/route.ts` — Supabase Auth
- `user/logout/route.ts` — Supabase Auth
- `user/me/route.ts` — Supabase Auth
- `auth/login/route.ts` — password-only admin
- `auth/me/route.ts` — admin session check
- `auth/logout/route.ts` — admin logout

**Pattern**: All routes change from:
```ts
import { vehicles } from "@/lib/db";
const data = await vehicles.list();
```
to:
```ts
import { getSupabaseServer } from "@/lib/supabase/server";
const supabase = await getSupabaseServer();
const { data } = await supabase.from("vehicles").select("*").order("created_at", { ascending: false });
```

### Step 7: Row Level Security (RLS)

**What**: Enable RLS on all tables. Public read, admin-only write.

**Files to create**:
- `supabase/migrations/00002_rls_policies.sql`

**Policies**:
- `vehicles`: public SELECT, admin INSERT/UPDATE/DELETE
- `testimonials`: public SELECT, admin INSERT/UPDATE/DELETE
- `faqs`: public SELECT, admin INSERT/UPDATE/DELETE
- `features`: public SELECT, admin INSERT/UPDATE/DELETE
- `process_steps`: public SELECT, admin INSERT/UPDATE/DELETE
- `gallery`: public SELECT, admin INSERT/UPDATE/DELETE
- `brands`: public SELECT, admin INSERT/UPDATE/DELETE
- `quotes`: public INSERT (from form), admin SELECT/UPDATE/DELETE, user SELECT own
- `users`: user SELECT own, admin SELECT all
- `favorites`: authenticated user SELECT/INSERT/DELETE own
- `admins`: admin-only (no public access)

### Step 8: Frontend Updates

**What**: Update account pages and admin login to work with new auth.

**Files to modify**:
- `src/app/account/login/page.tsx` — Supabase Auth UI
- `src/app/account/signup/page.tsx` — Supabase Auth UI
- `src/app/account/page.tsx` — get user from Supabase session
- `src/app/admin/login/page.tsx` — password-only form
- `src/hooks/useUserAuth.ts` — use Supabase session instead of custom JWT cookie
- `src/components/inventory/VehicleDetailClient.tsx` — favorite toggle uses Supabase
- `src/components/inventory/InventoryClient.tsx` — favorite state uses Supabase
- `src/components/layout/Navbar.tsx` — user menu uses Supabase session
- `src/proxy.ts` — update to check Supabase admin session (or keep cookie-based)

### Step 9: Cleanup & Environment

**What**: Remove SQLite dependencies, update env files, add Vercel env vars.

**Files to modify/remove**:
- `src/lib/db/sqlite.ts` — remove or keep commented for reference
- `package.json` — remove `sql.js` dependency
- `.env.local` — add `SUPABASE_SERVICE_ROLE_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
- `.env.example` — update

**New Vercel env vars**:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
SESSION_SECRET=
```

---

## Assumptions & Decisions

1. **Supabase Auth for users, custom JWT for admin** — Supabase Auth handles user signup/login with managed security. Admin stays custom (password-only) since it's a single admin account and doesn't need Supabase Auth features.

2. **Upstash Redis for rate limiting** — Free tier, Vercel integration, works across serverless instances. Alternative: Supabase Edge Functions, but Upstash is simpler.

3. **Column naming**: PostgreSQL uses `snake_case` (`created_at`). The DB layer maps to `camelCase` (`createdAt`) in API responses so no frontend changes are needed.

4. **ID generation**: Keep the same custom ID format (`vehicle-{timestamp}-{random}`) to maintain backward compatibility with existing data.

5. **Data migration**: Existing SQLite `dev.db` data can be exported to CSV and imported into Supabase. Not covered in this plan — handled separately.

6. **Password hashing**: Upgrade from SHA-256 to bcrypt (via `bcryptjs` package) for admin passwords. Supabase Auth handles user password hashing automatically.

7. **Local dev**: Supabase local development CLI or point to a Supabase dev project. SQLite removed from local dev.

---

## Verification

1. Run `supabase db push` to apply migrations
2. Start dev server, verify all admin CRUD pages work
3. Test user signup + login flow
4. Test quote submission with rate limiting
5. Test admin login with password-only
6. Test favorites add/remove
7. Test gallery, brands, testimonials, FAQs, features CRUD
8. Verify rate limiting returns 429 after threshold
9. Run `npm run build` — ensure no TypeScript errors
10. Deploy to Vercel with production Supabase project