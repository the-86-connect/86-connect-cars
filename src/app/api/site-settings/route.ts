import { NextResponse } from "next/server";
import { siteSettings } from "@/lib/db";

// Never cache — admin toggle must reflect instantly on the public site
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const settings = await siteSettings.get();
    return NextResponse.json(settings, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        Pragma: "no-cache",
      },
    });
  } catch {
    return NextResponse.json(
      { chatbotEnabled: true, testimonialsEnabled: true },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          Pragma: "no-cache",
        },
      },
    );
  }
}
