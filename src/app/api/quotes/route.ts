import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { quotes } from "@/lib/db";
import { rateLimitForm } from "@/lib/rate-limit";
import { sendQuoteConfirmationEmail, sendQuoteNotificationEmail } from "@/lib/email";

export async function GET() {
  try {
    const data = await quotes.list();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch quotes" }, { status: 500 });
  }
}

async function forwardToMainAdmin(quote: Record<string, unknown>) {
  const endpoint = process.env.MAIN_ADMIN_CAR_QUOTE_API;
  const webhookSecret = process.env.WEBHOOK_SECRET;
  if (!endpoint) return;

  try {
    const vehicleDetails = [quote.vehicleBrand, quote.model].filter(Boolean).join(" ");
    const messageParts = [];
    if (quote.country) messageParts.push(`Country: ${quote.country}`);
    if (quote.budget) messageParts.push(`Budget: ${quote.budget}`);
    if (quote.message) messageParts.push(String(quote.message));
    if (quote.vehicleSlug) messageParts.push(`Vehicle: https://cars.the86connect.com/inventory/${quote.vehicleSlug}`);
    if (quote.referenceImages && Array.isArray(quote.referenceImages) && quote.referenceImages.length > 0) {
      messageParts.push(`Images: ${(quote.referenceImages as string[]).join(", ")}`);
    }

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (webhookSecret) headers["Authorization"] = `Bearer ${webhookSecret}`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({
        externalId: quote.id,
        name: quote.name,
        email: quote.email,
        phone: quote.whatsapp,
        serviceInterest: vehicleDetails || "Car Quote",
        message: messageParts.join("\n\n"),
        submissionType: "car-quote",
        source: "cars.the86connect.com",
        vehicleLink: quote.vehicleSlug ? `https://cars.the86connect.com/inventory/${quote.vehicleSlug}` : undefined,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) {
      console.error(`Failed to forward quote to main admin: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error("Failed to forward quote to main admin:", error);
  }
}

async function getUserIdFromSession(req: NextRequest): Promise<string | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !url.startsWith("http") || !key) return null;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return req.cookies.getAll().map(({ name, value }) => ({ name, value }));
      },
      setAll() {},
    },
  });

  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

export async function POST(req: NextRequest) {
  const limited = await rateLimitForm(req);
  if (limited) return limited;

  try {
    const body = await req.json();

    const userId = await getUserIdFromSession(req);

    const id = `quote-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const data = { id, userId, status: "new", createdAt: new Date().toISOString(), ...body };
    await quotes.create(data);

    Promise.allSettled([
      sendQuoteConfirmationEmail(data.email, data).catch((e) => console.error("User email failed:", e)),
      sendQuoteNotificationEmail(data).catch((e) => console.error("Admin email failed:", e)),
      forwardToMainAdmin(data).catch((e) => console.error("Admin forward failed:", e)),
    ]);

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Quote submission error:", error);
    return NextResponse.json({ error: "Failed to submit quote", details: String(error) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, deliveryStatus, ...updates } = body;
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const updateData = deliveryStatus !== undefined ? { ...updates, delivery_status: deliveryStatus } : updates;
    await quotes.update(id, updateData);

    return NextResponse.json({ id, ...updateData });
  } catch {
    return NextResponse.json({ error: "Failed to update quote" }, { status: 500 });
  }
}

function isWebhookAuthorized(req: NextRequest): boolean {
  const secret = process.env.WEBHOOK_SECRET;
  if (!secret) return false;
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return false;
  return authHeader === `Bearer ${secret}`;
}

async function notifyMainAdminDelete(quoteId: string, hard: boolean): Promise<void> {
  const adminApiUrl = process.env.MAIN_ADMIN_CAR_QUOTE_API;
  const webhookSecret = process.env.WEBHOOK_SECRET;
  if (!adminApiUrl || !webhookSecret) return;

  const deleteUrl = `${adminApiUrl}/${encodeURIComponent(quoteId)}?hard=${hard ? "true" : "false"}`;
  try {
    const response = await fetch(deleteUrl, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${webhookSecret}` },
      signal: AbortSignal.timeout(10_000),
    });
    if (response.status === 404) return; // already deleted — not an error
    if (!response.ok) console.error(`Main admin delete webhook failed: ${response.status} for quote ${quoteId}`);
  } catch (error) {
    console.error(`Main admin delete webhook error for quote ${quoteId}:`, (error as Error).message);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    // Case 1: Main admin panel webhook calling us (Bearer auth) — just delete, no callback
    if (isWebhookAuthorized(req)) {
      const isHardDelete = searchParams.get("hard") === "true";
      console.log(`Admin panel webhook: ${isHardDelete ? "hard" : "soft"} delete for quote ${id}`);
      await quotes.delete(id);
      return NextResponse.json({ success: true });
    }

    // Cases 2 & 3: User or admin deleting via the cars app UI — need session auth
    const userId = await getUserIdFromSession(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await quotes.delete(id);

    // Notify main admin panel to soft-delete the corresponding submission
    // Always pass hard=false because the admin panel handles its own hard-delete
    // via its 7-day auto-purge or manual "Purge" button
    notifyMainAdminDelete(id, false).catch(() => {});

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete quote" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  // Security guard: reject ALL requests if WEBHOOK_SECRET is not configured
  const expectedToken = process.env.WEBHOOK_SECRET;
  if (!expectedToken) {
    console.error("PATCH /api/quotes: WEBHOOK_SECRET is not set — rejecting all webhook requests");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, deliveryStatus } = body;

    if (!id || !deliveryStatus) {
      return NextResponse.json({ error: "id and deliveryStatus are required" }, { status: 400 });
    }

    const existingQuote = await quotes.find(id);
    if (!existingQuote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    if (existingQuote.delivery_status !== deliveryStatus) {
      await quotes.update(id, { delivery_status: deliveryStatus });
    }

    return NextResponse.json({ success: true, id, deliveryStatus });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Failed to process webhook" }, { status: 500 });
  }
}
