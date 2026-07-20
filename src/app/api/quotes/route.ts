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
  if (!endpoint) return;

  try {
    const vehicleDetails = [quote.vehicleBrand, quote.model].filter(Boolean).join(" ");
    const messageParts = [];
    if (quote.country) messageParts.push(`Country: ${quote.country}`);
    if (quote.budget) messageParts.push(`Budget: ${quote.budget}`);
    if (quote.message) messageParts.push(String(quote.message));
    if (quote.referenceImages && Array.isArray(quote.referenceImages) && quote.referenceImages.length > 0) {
      messageParts.push(`Images: ${(quote.referenceImages as string[]).join(", ")}`);
    }

    await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: quote.name,
        email: quote.email,
        phone: quote.whatsapp,
        serviceInterest: vehicleDetails || "Car Quote",
        message: messageParts.join("\n\n"),
        submissionType: "car-quote",
        source: "cars.the86connect.com",
      }),
    });
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
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    await quotes.update(id, updates);
    return NextResponse.json({ id, ...updates });
  } catch {
    return NextResponse.json({ error: "Failed to update quote" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    await quotes.delete(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete quote" }, { status: 500 });
  }
}
