# Vercel Setup Plan

## Repo Research Conclusion

- **Framework**: Next.js 16.2.10 (App Router) with React 19
- **Current DB**: SQLite via sql.js (WASM) — local dev only, will switch to Supabase PostgreSQL later
- **Supabase SDKs**: Already installed (`@supabase/ssr`, `@supabase/supabase-js`) but only scaffolded, not wired to data layer
- **Backend**: Next.js API Routes (same project — no separate Express server)
- **Existing files**: `.gitignore` already exists with `.vercel` entry; no `vercel.json` yet
- **Build command**: `next build` (standard, already in package.json)

Since this is a Next.js app, Vercel deploys it natively — frontend and API routes deploy together as one project.

---

## Files to Create / Edit

### 1. `vercel.json` (create)
Vercel project configuration. Since this is a standard Next.js app, the file can be minimal. We'll add:
- Framework preset hint
- Build command override (redundant but explicit)
- Ignored build step for non-prod branches (optional)
- Headers note (CSP is already in `next.config.ts` — no duplication needed)

### 2. `.gitignore` (edit — minor additions)
Current `.gitignore` is already solid. Add:
- `dev.db` (SQLite file — currently tracked? need to verify)
- `.env.local` (already covered by `.env*` wildcard)
- `.vscode/`, `.idea/` (editor configs — optional but common)
- `*.log` (catch-all for log files)

---

## Step-by-Step Modifications

### Step 1: Create `vercel.json`
Location: project root
Content: Minimal config — Next.js is auto-detected by Vercel. We add explicit build/dev commands and a note about environment variables.

### Step 2: Update `.gitignore`
Add `dev.db` and editor folders. Verify current state doesn't accidentally track `dev.db`.

### Step 3: Document Vercel deployment next steps
(This is informational — included in plan output, not committed as code.)

---

## Potential Dependencies & Considerations

1. **SQLite on Vercel = data loss on cold start**: The current SQLite (`dev.db`) is file-based. Vercel Serverless Functions have ephemeral filesystems — **data will not persist** between deployments/cold starts. This is expected per your plan (Supabase later), but worth flagging: until Supabase is wired up, the admin panel CRUD will reset on every deploy / function cold start.

2. **Environment variables required on Vercel**:
   - `SESSION_SECRET` (required — generate with `openssl rand -base64 32`)
   - `NEXT_PUBLIC_SITE_URL` (your production domain)
   - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` + `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` (for gallery uploads)
   - `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` (currently unused scaffold — safe to leave empty for now)
   - `MAIN_ADMIN_CAR_QUOTE_API` (if forwarding quotes to main admin)
   - `DATABASE_URL` (can be left empty until Supabase migration)

3. **No custom server needed**: API routes are part of Next.js and deploy automatically.

4. **Custom domain**: `cars.the86connect.com` can be connected in Vercel project settings after first deploy.

---

## Risk Handling

| Risk | Mitigation |
|------|------------|
| SQLite data loss on Vercel | Expected — Supabase migration is planned. For now, demo / smoke-test only on deployed admin panel. |
| Build failures due to Turbopack / Next 16 | Run `npm run build` locally before deploying to catch errors early. |
| Missing env vars causing runtime errors | Add all env vars in Vercel dashboard before first deploy (or right after — redeploy is quick). |
| `.env.local` accidentally committed | Already covered by `.env*` in `.gitignore`. Double-check before first push. |

---

## Next Steps for Frontend Hosting on Vercel

(after the code changes above are in place)

1. **Push code to GitHub** (private repo recommended)
2. **Sign up / log in to Vercel** (vercel.com)
3. **Import project** from GitHub repo
4. **Configure environment variables** in Vercel Project → Settings → Environment Variables (add for Production)
5. **Deploy** — Vercel auto-detects Next.js, runs `next build`
6. **Connect custom domain** `cars.the86connect.com` in Vercel → Settings → Domains
7. **Update DNS** at your domain registrar with Vercel's CNAME/ANAME records
8. **Verify deployment** — test homepage, inventory page, admin login
9. **Later**: Migrate DB from SQLite to Supabase, then update `src/lib/db/index.ts` to use Supabase instead of sql.js
