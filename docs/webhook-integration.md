# Webhook Integration — 86Connect Cars App ↔ Main Admin Panel

This document describes the bidirectional webhook bridge between the **Cars app** (`cars.the86connect.com`, this repo) and the **Main Admin Panel** (`api.the86connect.com`, separate backend). The bridge keeps quote submissions, delivery tracking, and deletions in sync across both systems.

> **Why two systems?**
> The Cars app owns the customer-facing flow (quote form, user account, delivery tracker UI). The Main Admin Panel is the central ops dashboard where operators manage every lead across all 86Connect properties. The webhook keeps them from drifting.

---

## 1. Architecture at a Glance

```
┌─────────────────────────────┐        ┌──────────────────────────────────┐
│   Cars App (this repo)      │        │   Main Admin Panel               │
│   cars.the86connect.com     │        │   api.the86connect.com           │
│                             │        │                                  │
│  - Quote form               │        │  - Unified submissions inbox     │
│  - User account page        │        │  - Operator tracking updates     │
│  - Delivery tracker UI      │        │  - Cross-property admin tools    │
│  - Supabase (PostgreSQL)    │        │  - Owns its own DB               │
└──────────────┬──────────────┘        └──────────────┬───────────────────┘
               │                                       │
               │  (1) POST quote  →                    │
               │  (2) DELETE quote →                   │
               │      (cars UI / admin cascade)        │
               │                                       │
               │  ← (3) PATCH deliveryStatus           │
               │  ← (4) DELETE ?hard=true/false        │
               │                                       │
               └───────────────┬───────────────────────┘
                               │
                      Shared secret auth
                      (WEBHOOK_SECRET / Bearer token)
```

### Two systems, two DBs, one shared secret

| Concern                | Cars App                                  | Main Admin Panel                     |
| ---------------------- | ----------------------------------------- | ------------------------------------ |
| Owns quote record      | ✅ (source of truth for customer view)    | ✅ (mirror copy for ops)             |
| Quote ID format        | `quote-{epoch-ms}-{4-char-random}`        | Stores Cars app ID as `externalId`   |
| DB                     | Supabase / PostgreSQL                     | Own DB                               |
| Auth for webhooks      | `Authorization: Bearer $WEBHOOK_SECRET`   | Same shared secret                   |
| Frontend               | Next.js (public + `/account`)             | Separate admin dashboard             |

---

## 2. Environment Variables

Both systems must agree on the shared secret. Set these on the Cars app (Vercel):

```bash
# Main admin panel forwarding (Render backend URL, NOT frontend)
MAIN_ADMIN_CAR_QUOTE_API=https://api.the86connect.com/api/car-quote-webhook

# Shared secret for webhook auth between cars app and main admin panel
# Must match CARS_APP_WEBHOOK_SECRET on the main admin panel
WEBHOOK_SECRET=replace-with-shared-secret-string
```

On the Main Admin Panel side, the same value lives in `CARS_APP_WEBHOOK_SECRET` and is used both to (a) authenticate incoming POST/DELETE from the Cars app, and (b) sign outbound PATCH/DELETE to the Cars app.

> **Security rule:** `PATCH /api/quotes` rejects ALL requests if `WEBHOOK_SECRET` is not configured — fail-closed, not fail-open. See `src/app/api/quotes/route.ts` lines 187–193.

---

## 3. Flow 1 — New Quote Forwarding (Cars App → Main Admin)

**Trigger:** A user submits the quote form on the Cars app.

**File:** [`src/app/api/quotes/route.ts`](file:///d:/86Connect%20Cars/src/app/api/quotes/route.ts) — `forwardToMainAdmin()` (lines 16–60) + `POST` handler (lines 80–104)

**What happens:**

1. `POST /api/quotes` is rate-limited (`rateLimitForm`).
2. A new quote row is inserted into Supabase with a generated ID `quote-{timestamp}-{4-char-random}`.
3. Three side-effects fire concurrently via `Promise.allSettled` (fire-and-forget — one failing doesn't block the others):
   - `sendQuoteConfirmationEmail` → to the user
   - `sendQuoteNotificationEmail` → to admin (currently `beijingbridgepath@gmail.com` per memory, switching to `info@the86connect.com`)
   - `forwardToMainAdmin` → webhook to main admin panel

**Webhook payload (Cars App → Main Admin):**

```http
POST https://api.the86connect.com/api/car-quote-webhook
Authorization: Bearer $WEBHOOK_SECRET
Content-Type: application/json

{
  "externalId": "quote-1758xxxx-ab12",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1 555 ...",          // from quote.whatsapp
  "serviceInterest": "BYD Han",    // "{brand} {model}" or "Car Quote"
  "message": "Country: ...\n\nBudget: ...\n\n<user message>\n\nVehicle: https://cars.the86connect.com/inventory/<slug>",
  "submissionType": "car-quote",
  "source": "cars.the86connect.com",
  "vehicleLink": "https://cars.the86connect.com/inventory/<slug>",
  "referenceImages": ["https://res.cloudinary.com/.../img1.jpg", ...]  // only if attached
}
```

**Key fields:**
- `externalId` — the Cars app's quote ID. The Main Admin Panel stores this so it can call back the Cars app later (status updates, deletes).
- `referenceImages` — structured array (not text blob) of Cloudinary URLs.
- `vehicleLink` — clickable inventory URL when the quote originated from a specific vehicle page.

**Failure handling:** 10s timeout (`AbortSignal.timeout(10_000)`). Errors are logged but never surfaced to the user — the quote is already saved in Supabase.

---

## 4. Flow 2 — Delivery Status Update (Main Admin → Cars App)

**Trigger:** An operator in the Main Admin Panel advances a shipment to the next status step.

**File:** [`src/app/api/quotes/route.ts`](file:///d:/86Connect%20Cars/src/app/api/quotes/route.ts) — `PATCH` handler (lines 187–224)

**Request:**

```http
PATCH https://cars.the86connect.com/api/quotes
Authorization: Bearer $WEBHOOK_SECRET
Content-Type: application/json

{
  "id": "quote-1758xxxx-ab12",
  "deliveryStatus": "in_transit",
  "updatedAt": "2026-07-22T10:30:00.000Z"
}
```

**Valid `deliveryStatus` values** (enforced as a 7-step timeline):

| # | Key                       | Label                |
| - | ------------------------- | -------------------- |
| 0 | `pending`                 | Shipment Pending     |
| 1 | `booking_confirmed`       | Booking Confirmed    |
| 2 | `loading`                 | Loading              |
| 3 | `in_transit`              | In Transit           |
| 4 | `at_destination_port`     | At Destination Port  |
| 5 | `customs_clearance`       | Customs Clearance    |
| 6 | `delivered`               | Delivered            |

**Cars app response:**

- `401` if `Authorization` header missing or wrong token.
- `400` if `id` or `deliveryStatus` missing.
- `404` if quote not found in Supabase.
- `200 { success: true, id, deliveryStatus }` on success.

**What the Cars app does:**

1. Validates `Authorization: Bearer $WEBHOOK_SECRET` (fail-closed if secret unset).
2. Looks up the quote by `id`.
3. **Optimization:** only writes to DB if the status actually changed (avoids spurious `statusUpdatedAt` updates).
4. Stores `delivery_status` and `status_updated_at` (uses `updatedAt` from payload, falls back to `now()` if omitted).

**No emails sent.** Per project memory: *"App does not send tracking emails; tracking updates handled by main admin panel."* The Cars app is just the persistence layer + UI renderer.

---

## 5. Flow 3 — User Sees Updated Tracking (Cars App UI)

**Trigger:** User opens their `/account` page.

**Files:**
- [`src/app/api/user/quotes/route.ts`](file:///d:/86Connect%20Cars/src/app/api/user/quotes/route.ts) — session-auth'd `GET` returning the user's quotes (including `deliveryStatus` + `statusUpdatedAt`).
- [`src/app/account/page.tsx`](file:///d:/86Connect%20Cars/src/app/account/page.tsx) — `DeliveryTracker` component (lines 49–95) renders the 7-step timeline.

**UI behavior:**

- All steps `≤ currentStep` are filled (brand color).
- Current step gets a `ring-4` highlight.
- Below the timeline: `"In Transit — updated July 22, 2026 at 10:30 AM"` (formatted from `statusUpdatedAt`).

---

## 6. Flow 4 — Deletion Sync (Bidirectional)

Deletion is the most complex flow because either side can initiate it and the semantics differ.

### Case A — User or admin deletes via Cars UI (Cars App → Main Admin)

**File:** [`src/app/api/quotes/route.ts`](file:///d:/86Connect%20Cars/src/app/api/quotes/route.ts) — `DELETE` handler (lines 148–185)

```http
DELETE https://cars.the86connect.com/api/quotes?id=quote-1758xxxx-ab12
Cookie: <session>      # NOT Bearer auth — this is a UI-initiated delete
```

**Logic:**

1. If the request has `Authorization: Bearer $WEBHOOK_SECRET` → it's the Main Admin calling (see Case B). Skip this branch.
2. Otherwise, require a valid user session (`getUserIdFromSession`).
3. Branch on `?hard=1`:
   - `hard=1` (admin purge) → `quotes.delete(id)` — permanent removal from Supabase.
   - no `hard` (user self-delete) → `quotes.softDelete(id)` — sets `deleted_at`, recoverable, admin can purge later.
4. **Always** calls `notifyMainAdminDelete(id, false)` — soft-delete the mirror copy on the Main Admin side. The Cars app never hard-deletes on the Main Admin Panel; the Main Admin's own purge flow handles that.

**Webhook to Main Admin:**

```http
DELETE https://api.the86connect.com/api/car-quote-webhook/quote-1758xxxx-ab12?hard=false
Authorization: Bearer $WEBHOOK_SECRET
```

- `hard=false` always, per project memory: *"When admin deletes a user...notify main admin panel to soft-delete."*
- 404 is treated as success (already deleted — not an error).

### Case B — Main Admin Panel deletes (Main Admin → Cars App)

**File:** same `DELETE` handler, Bearer-auth branch (lines 155–160)

```http
DELETE https://cars.the86connect.com/api/quotes?id=quote-1758xxxx-ab12&hard=true
Authorization: Bearer $WEBHOOK_SECRET
```

**Logic:**

1. `isWebhookAuthorized(req)` → true → this is the Main Admin.
2. Branch on `?hard=true`:
   - `hard=true` → `quotes.delete(id)` — hard delete from Supabase.
   - `hard=false` (or omitted) → also `quotes.delete(id)` — per project memory: *"cars app has no soft-delete system"* on the receiving end of a webhook. (Soft-delete only exists for user-initiated UI deletes, not webhook-driven ones.)
3. **No callback to Main Admin.** The Main Admin initiated this; no need to notify it back.

### Case C — Admin deletes a USER (cascade)

**File:** [`src/app/api/admin/users/[id]/route.ts`](file:///d:/86Connect%20Cars/src/app/api/admin/users/[id]/route.ts)

When an admin deletes a user, all of that user's quotes must also be cleaned up:

1. **Fetch all quote IDs for the user FIRST** (before deletion) — so we still know which IDs to notify the Main Admin about.
2. Cascade-delete `favorites`, then `quotes`, then (optionally) the `users` row.
3. `?dataOnly=1` keeps the user account, deletes only their data.
4. For each quote ID, call `notifyMainAdminDelete(quoteId, false)` — fire-and-forget via `Promise.allSettled`. Always `hard=false`.

---

## 7. Auth Model Summary

| Endpoint                          | Auth required                                  | Who calls it                  |
| --------------------------------- | ---------------------------------------------- | ----------------------------- |
| `POST /api/quotes`                | Rate limit only (public form)                  | Anonymous user submitting     |
| `GET /api/quotes`                 | None (admin UI uses session separately)        | Internal                      |
| `PUT /api/quotes`                 | Session (UI)                                   | Admin/user via UI             |
| `PATCH /api/quotes`               | `Bearer $WEBHOOK_SECRET` (fail-closed)         | Main Admin Panel only         |
| `DELETE /api/quotes`              | **Either** Bearer (webhook) **or** session (UI) | Main Admin **or** user/admin UI |
| `DELETE /api/quotes?hard=1`       | Session (admin UI)                             | Admin purging soft-deleted    |
| `DELETE /api/quotes?hard=true`    | Bearer (webhook)                               | Main Admin hard-deleting      |
| `GET /api/user/quotes`            | Session                                        | Logged-in user viewing account |

---

## 8. Database Schema (Cars App side)

**Supabase migration:** [`supabase/migrations/00001_initial_schema.sql`](file:///d:/86Connect%20Cars/supabase/migrations/00001_initial_schema.sql) (line 57) + [`00005_add_quote_status_updated_at.sql`](file:///d:/86Connect%20Cars/supabase/migrations/00005_add_quote_status_updated_at.sql)

```sql
-- quotes table, relevant columns
CREATE TABLE quotes (
  id TEXT PRIMARY KEY,                          -- "quote-{epoch}-{rand}"
  user_id UUID REFERENCES auth.users(id),
  ...
  delivery_status TEXT DEFAULT 'pending',       -- set by webhook PATCH
  status_updated_at TIMESTAMPTZ,                -- set by webhook PATCH (from payload's updatedAt)
  deleted_at TIMESTAMPTZ,                       -- soft-delete marker (user UI only)
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**SQLite (local dev) equivalent:** [`src/lib/db/schema.ts`](file:///d:/86Connect%20Cars/src/lib/db/schema.ts) uses camelCase columns (`deliveryStatus`, `createdAt`) — see schema.ts line 90. The DB layer handles the mapping.

> **Note on `updatedAt` vs `status_updated_at`:** The webhook payload field is `updatedAt` (ISO string). The Supabase column is `status_updated_at`. The PATCH handler maps between them explicitly (line 215–216).

---

## 9. Failure Modes & Idempotency

| Scenario                                   | Behavior                                                                                          |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| `WEBHOOK_SECRET` unset on Cars app         | PATCH returns `503 Webhook not configured`. POST/DELETE forwarding silently skipped (no endpoint). |
| Main Admin unreachable                     | 10s timeout, error logged, quote still saved locally. No retry queue (fire-and-forget).            |
| PATCH for non-existent quote ID            | Returns `404`. Main Admin should treat as "already deleted / unknown".                             |
| DELETE for already-deleted quote (404 back)| `notifyMainAdminDelete` treats 404 as success — idempotent.                                        |
| Duplicate PATCH with same status           | No DB write (status-unchanged guard, lines 213–217). Idempotent.                                   |
| Webhook arrives before user session exists | User account page just shows `pending` until next refresh — eventually consistent.                 |

**Known ceiling (`ponytail:`):** No retry queue. If the Main Admin is down at submission time, that quote's mirror copy is lost forever on the Main Admin side. The Cars app keeps its copy. Acceptable for current volume; if this becomes a problem, add a `pending_forward` flag on the quote row + a cron retry.

---

## 10. How We Implemented It (Decisions Log)

1. **Single shared secret, not OAuth/JWT.** Two trusted servers, one secret in env vars. Simpler than OAuth, secure enough for server-to-server on HTTPS. Both sides rotate together.
2. **Fire-and-forget via `Promise.allSettled`.** User-facing POST must not block on the Main Admin's latency. Emails and webhook all run concurrently; one failure doesn't fail the others.
3. **Fail-closed on missing secret for PATCH.** The PATCH endpoint is the one place the Main Admin pushes data INTO our DB. If the secret isn't configured, we'd rather reject all updates than accept unauthenticated ones. (POST forwarding is fail-open — it's outbound only, so a missing secret just means no forwarding.)
4. **Status-change guard before DB write.** Avoids bumping `status_updated_at` on no-op PATCHs (which the Main Admin might send for idempotency retries).
5. **Hard vs soft delete split by direction.** Cars UI deletes → soft on Cars side, soft on Main Admin side. Main Admin deletes → hard on Cars side (no Cars soft-delete path for webhooks), Main Admin decides its own soft/hard. This matches the project memory rule: *"cars app has no soft-delete system"* on the webhook receive path.
6. **Cascade delete fetches IDs first.** Obvious in hindsight, but easy to get wrong: if you delete the quotes before fetching their IDs, you've lost the list of IDs to notify the Main Admin about. See [`src/app/api/admin/users/[id]/route.ts`](file:///d:/86Connect%20Cars/src/app/api/admin/users/[id]/route.ts) lines 33–34.
7. **`referenceImages` as structured array.** Earlier versions sent them as a text blob inside `message`. Now a dedicated field — lets the Main Admin render thumbnails instead of parsing text. (Memory note: 32px thumbnails + lightbox per the user's preference.)
8. **No tracking emails from the Cars app.** Per project memory, the Main Admin Panel owns email notifications for tracking updates. The Cars app only renders the UI.

---

## 11. Testing the Webhooks Locally

### Test PATCH (status update) from Main Admin:

```bash
curl -X PATCH https://cars.the86connect.com/api/quotes \
  -H "Authorization: Bearer $WEBHOOK_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "quote-1758xxxx-ab12",
    "deliveryStatus": "in_transit",
    "updatedAt": "2026-07-22T10:30:00.000Z"
  }'
```

Expected: `200 {"success":true,"id":"quote-...","deliveryStatus":"in_transit"}`

### Test DELETE (Main Admin hard-deleting):

```bash
curl -X DELETE "https://cars.the86connect.com/api/quotes?id=quote-1758xxxx-ab12&hard=true" \
  -H "Authorization: Bearer $WEBHOOK_SECRET"
```

Expected: `200 {"success":true}`

### Test POST (new quote forwarding to Main Admin):

Submit the quote form on the Cars app UI. Check the Cars app server logs for `"Failed to forward quote to main admin"` (should be absent on success). Verify the quote appears in the Main Admin Panel's submissions inbox.

---

## 12. Related Files

| File | Role |
| --- | --- |
| [`src/app/api/quotes/route.ts`](file:///d:/86Connect%20Cars/src/app/api/quotes/route.ts) | Main webhook hub: POST/GET/PUT/PATCH/DELETE for quotes |
| [`src/app/api/admin/users/[id]/route.ts`](file:///d:/86Connect%20Cars/src/app/api/admin/users/[id]/route.ts) | User cascade-delete with quote ID forwarding |
| [`src/app/api/user/quotes/route.ts`](file:///d:/86Connect%20Cars/src/app/api/user/quotes/route.ts) | Session-auth'd GET for account page |
| [`src/app/account/page.tsx`](file:///d:/86Connect%20Cars/src/app/account/page.tsx) | `DeliveryTracker` UI (7-step timeline) |
| [`src/lib/db/schema.ts`](file:///d:/86Connect%20Cars/src/lib/db/schema.ts) | SQLite schema with `deliveryStatus` column |
| [`supabase/migrations/00001_initial_schema.sql`](file:///d:/86Connect%20Cars/supabase/migrations/00001_initial_schema.sql) | Postgres `delivery_status` column |
| [`supabase/migrations/00005_add_quote_status_updated_at.sql`](file:///d:/86Connect%20Cars/supabase/migrations/00005_add_quote_status_updated_at.sql) | Postgres `status_updated_at` column |
| [`.env.example`](file:///d:/86Connect%20Cars/.env.example) | `MAIN_ADMIN_CAR_QUOTE_API` + `WEBHOOK_SECRET` |
