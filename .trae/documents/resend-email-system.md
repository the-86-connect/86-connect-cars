# Plan: Email Notification System with Resend

## Summary

Add email notifications using Resend for two flows: (1) quote submissions (both user confirmation + admin notification), and (2) user signup welcome email (user only, no admin notification). The from address is `cars@the86connect.com`, admin receives notifications at `beijingbridgepath@gmail.com`.

**Verified facts (Phase 1 exploration):**
- Both the main `QuoteForm` (`src/components/forms/QuoteForm.tsx`) and the car-specific "Request Quote" button (`src/components/inventory/VehicleDetailClient.tsx:655`) funnel through `POST /api/quotes` — the car button navigates to `/?brand=X&model=Y#contact` which pre-fills the QuoteForm.
- Quote fields (from `src/components/forms/schema.ts`): `name, whatsapp, email, country, vehicleBrand, model, budget, message, referenceImages[]`.
- Signup page (`src/app/account/signup/page.tsx`) calls `supabase.auth.signUp()` directly from the browser, bypassing the server route.
- The server-side `/api/user/signup` route exists but is dead code — never called.
- `resend` package is already installed in `package.json` (v6.17.2).
- `RESEND_API_KEY` and `EMAIL_FROM` are already in `.env.local` and `.env.example` (placeholders).
- `src/lib/email.ts` does NOT exist yet.

---

## Current State Analysis

### Quote Submission Flow
- `POST /api/quotes` creates a DB record, then fire-and-forgets an HTTP forward to `MAIN_ADMIN_CAR_QUOTE_API`.
- **No email is sent** to either user or admin.
- **Existing bugs in QuoteForm.tsx**: `catch {}` silently swallows errors (line 90-92), misleading "email app should now be open" copy (line 120).

### User Signup Flow
- Signup page calls `supabase.auth.signUp()` directly from browser.
- The server-side `/api/user/signup` route exists but is dead code — never called.
- **No welcome email** is sent.

### Email Infrastructure
- `resend` package installed, env vars configured (placeholder API key).
- User already has a Resend project with verified domain `the86connect.com`.

---

## Proposed Changes

### Step 1: Configure Env (already done — verify only)

**Files**: `.env.local`, `.env.example`

Already contains:
```
RESEND_API_KEY=re_your_resend_api_key_here
EMAIL_FROM=cars@the86connect.com
```

**User action required**: Replace `re_your_resend_api_key_here` in `.env.local` with the actual Resend API key.

### Step 2: Create Email Utility (`src/lib/email.ts`)

**New file**: `src/lib/email.ts`

Creates the Resend client and exports three functions:

```ts
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM ?? "cars@the86connect.com";
const ADMIN_EMAIL = "beijingbridgepath@gmail.com";

// 1. Send quote confirmation to user
export async function sendQuoteConfirmationEmail(to: string, quoteData: QuoteEmailData): Promise<void>

// 2. Send quote notification to admin
export async function sendQuoteNotificationEmail(quoteData: QuoteEmailData): Promise<void>

// 3. Send welcome email to new user
export async function sendWelcomeEmail(to: string, name: string): Promise<void>
```

**`QuoteEmailData` type** (loose inline type, fields optional except name/email):
```ts
type QuoteEmailData = {
  name: string;
  email: string;
  whatsapp?: string;
  country?: string;
  vehicleBrand?: string;
  model?: string;
  budget?: string;
  message?: string;
  referenceImages?: string[];
};
```

Each function builds an HTML email string with inline CSS (brand colors, responsive layout). No React Email dependency — simple HTML strings keep it lean.

**Email templates** (inline HTML with 86Connect branding):
- **Quote confirmation (to user)**: "We received your quote request for [brand] [model]. Our team will contact you within 24 hours via WhatsApp/email."
- **Quote notification (to admin)**: "New quote submission from [name]. Details: brand, model, budget, message, contact info, images."
- **Welcome email (to user)**: "Welcome to 86Connect Cars, [name]! Your account is ready. Browse our inventory or request a quote."

All emails include the 86Connect branding, contact info (email: info@the86connect.com, WhatsApp: +86 176 1153 3296), and footer.

### Step 3: Wire Quote Emails into Quote API

**File**: `src/app/api/quotes/route.ts`

In the `POST` handler (after `quotes.create(data)` succeeds at line 63), replace the current `forwardToMainAdmin(data)` call (line 65) with a `Promise.allSettled` block that fires all three async operations in parallel:

```ts
// Replace line 65: forwardToMainAdmin(data);
await Promise.allSettled([
  sendQuoteConfirmationEmail(data.email, data).catch(e => console.error("User email failed:", e)),
  sendQuoteNotificationEmail(data).catch(e => console.error("Admin email failed:", e)),
  forwardToMainAdmin(data).catch(e => console.error("Admin forward failed:", e)),
]);
```

This covers both the main quote form AND car-specific quotes (they use the same endpoint).

### Step 4: Wire Welcome Email into Signup

**Problem**: The signup page calls `supabase.auth.signUp()` directly from the browser, bypassing the server. We need a server-side hook to send the email.

**Solution**: Route the signup page through the existing `/api/user/signup` server route (currently dead code). The server route already does `supabase.auth.signUp()` + creates a profile row. We just add the welcome email after successful signup.

**Files to modify**:

1. **`src/app/api/user/signup/route.ts`** — After successful signup + profile creation (line 54), add fire-and-forget welcome email:
   ```ts
   // After profile creation try/catch block (line 54):
   sendWelcomeEmail(email, name).catch(e => console.error("Welcome email failed:", e));
   ```

2. **`src/app/account/signup/page.tsx`** — Replace direct `supabase.auth.signUp()` call (lines 20-26) with `fetch("/api/user/signup", {...})`. On success, redirect to `/account`.
   ```ts
   const res = await fetch("/api/user/signup", {
     method: "POST",
     headers: { "Content-Type": "application/json" },
     body: JSON.stringify(form),
   });
   const data = await res.json();
   if (!res.ok) { setError(data.error || "Signup failed"); return; }
   router.push("/account");
   ```

### Step 5: Fix QuoteForm Bugs

**File**: `src/components/forms/QuoteForm.tsx`

1. **Line 90-92**: Replace `catch {}` with proper error handling — capture the response and show an error state if the API call fails:
   ```ts
   const res = await fetch("/api/quotes", { ... });
   if (!res.ok) throw new Error("Submission failed");
   ```
   Then in the catch block, set an error message instead of silently swallowing.

2. **Line 120**: Replace misleading "Your email app should now be open" copy with accurate: "Your quote request has been submitted. We'll contact you within 24 hours."

### Step 6: Vercel Env Vars

Add to Vercel (Settings → Environment Variables):
- `RESEND_API_KEY` = the actual Resend API key
- `EMAIL_FROM` = `cars@the86connect.com`

---

## Assumptions & Decisions

1. **Resend SDK** (not React Email) — 3 simple HTML email templates don't need a separate component library. Inline HTML strings are simpler and have zero extra dependencies.

2. **Fire-and-forget emails** — Email sending errors should never fail a quote submission or signup. All email calls are wrapped in `Promise.allSettled` with `.catch()` logging. The HTTP response is not blocked by email failures.

3. **Keep existing HTTP forward** — The `MAIN_ADMIN_CAR_QUOTE_API` forward to the admin panel stays. Email is an additional notification channel, not a replacement.

4. **Admin email is hardcoded** as `beijingbridgepath@gmail.com` in `src/lib/email.ts` — The user specified this explicitly. Could be moved to env var later if needed, but YAGNI for now.

5. **Signup routed through server API** — This re-activates the existing dead code route and gives us a server-side hook for the welcome email. The Supabase Auth signUp still happens server-side via the same `supabase.auth.signUp()` call.

6. **No Supabase confirmation email conflict** — If the user has Supabase email confirmation enabled, they'll get Supabase's confirmation email AND our welcome email. If they want only one, they can disable Supabase confirmation in the dashboard. This is a configuration choice, not a code issue.

7. **Welcome email fires immediately on signup** — Not waiting for Supabase email confirmation. If the user wants confirmation-gated welcome email, that's a future enhancement.

---

## Verification

1. Submit a quote via the main form → check that user gets confirmation email and admin gets notification email
2. Submit a quote via car detail page "Request Quote" button → same emails should fire (same endpoint)
3. Sign up as a new user → check that user gets welcome email, admin gets nothing
4. Test rate limiting still works on both endpoints
5. Verify the QuoteForm shows proper error messages if the API fails (no more silent catch)
6. Run `npm run build` — ensure no TypeScript errors
7. Push to GitHub → verify CI passes

---

## Files to Touch (Summary)

| File | Action | Purpose |
|------|--------|---------|
| `src/lib/email.ts` | CREATE | Resend client + 3 email functions |
| `src/app/api/quotes/route.ts` | EDIT | Wire quote emails in POST handler |
| `src/app/api/user/signup/route.ts` | EDIT | Add welcome email after signup |
| `src/app/account/signup/page.tsx` | EDIT | Route through server API instead of direct Supabase call |
| `src/components/forms/QuoteForm.tsx` | EDIT | Fix silent catch + misleading copy |

Total: 1 new file, 4 edits.
