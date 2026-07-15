import { NextRequest, NextResponse } from "next/server";
import { users } from "@/lib/db";
import { getSqliteDb, sqliteQuery } from "@/lib/db/sqlite";
import { hashPassword } from "@/lib/auth";

// GET /api/admin/users — list all registered users with their quote counts
export async function GET() {
  try {
    const db = await getSqliteDb();
    const rows = sqliteQuery(db, `
      SELECT u.id, u.name, u.email, u.whatsapp, u.country, u.createdAt,
             COUNT(DISTINCT q.id) AS quoteCount,
             (SELECT COUNT(*) FROM favorites f WHERE f.userId = u.id) AS favoriteCount
      FROM users u
      LEFT JOIN quotes q ON q.userId = u.id
      GROUP BY u.id
      ORDER BY u.createdAt DESC
    `);
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Admin users API error:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

// POST /api/admin/users — admin creates a new user
export async function POST(req: NextRequest) {
  try {
    const { name, email, password, whatsapp, country } = await req.json();
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
    }

    const existing = await users.findByEmail(email);
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const id = `user-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const passwordHash = hashPassword(password);
    await users.create({
      id,
      name,
      email,
      passwordHash,
      whatsapp: whatsapp || null,
      country: country || null,
    });

    return NextResponse.json({ success: true, id, name, email }, { status: 201 });
  } catch (error) {
    console.error("Admin create user error:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
