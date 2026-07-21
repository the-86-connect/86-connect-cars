import { NextResponse } from "next/server";
import { quotes, users } from "@/lib/db";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

// GET /api/admin/purge — count soft-deleted records + database stats
export async function GET() {
  try {
    const [softDeletedQuotes, softDeletedUsers] = await Promise.all([
      quotes.countSoftDeleted(),
      users.countSoftDeleted(),
    ]);

    // Database stats: count tables and total records
    const client = getSupabaseAdmin();
    let dbStats = { tables: 0, totalRecords: 0, connection: false };
    if (client) {
      const tables = ["vehicles", "brands", "quotes", "users", "favorites", "gallery", "testimonials", "faqs", "features", "process_steps", "admins"];
      const counts = await Promise.all(
        tables.map(async (t) => {
          const { count } = await client.from(t).select("*", { count: "exact", head: true });
          return count ?? 0;
        })
      );
      dbStats = {
        tables: tables.length,
        totalRecords: counts.reduce((a, b) => a + b, 0),
        connection: true,
      };
    }

    return NextResponse.json({
      softDeleted: {
        quotes: softDeletedQuotes,
        users: softDeletedUsers,
        total: softDeletedQuotes + softDeletedUsers,
      },
      database: dbStats,
    });
  } catch (error) {
    console.error("Purge stats error:", error);
    return NextResponse.json({ error: "Failed to fetch purge stats" }, { status: 500 });
  }
}

// POST /api/admin/purge — hard-delete ALL soft-deleted records
export async function POST() {
  try {
    await Promise.all([
      quotes.purgeAllSoftDeleted(),
      users.purgeAllSoftDeleted(),
    ]);

    const [softDeletedQuotes, softDeletedUsers] = await Promise.all([
      quotes.countSoftDeleted(),
      users.countSoftDeleted(),
    ]);

    return NextResponse.json({
      success: true,
      remaining: {
        quotes: softDeletedQuotes,
        users: softDeletedUsers,
        total: softDeletedQuotes + softDeletedUsers,
      },
    });
  } catch (error) {
    console.error("Purge error:", error);
    return NextResponse.json({ error: "Failed to purge soft-deleted data" }, { status: 500 });
  }
}
