import { NextRequest, NextResponse } from "next/server";
import { rateLimitChat } from "@/lib/rate-limit";
import { askQuestion } from "@/lib/kb";

const MAX_QUESTION_LEN = 500;

// POST /api/chat — public RAG endpoint
// Body: { question: string }
// Returns: { answer, sources }
export async function POST(req: NextRequest) {
  // 1. Rate limit: 10 questions per minute per IP (public endpoint)
  const limited = await rateLimitChat(req);
  if (limited) return limited;

  try {
    const { question } = await req.json();
    if (!question || typeof question !== "string") {
      return NextResponse.json({ error: "Question is required" }, { status: 400 });
    }
    const trimmed = question.trim();
    if (trimmed.length === 0) {
      return NextResponse.json({ error: "Question cannot be empty" }, { status: 400 });
    }
    if (trimmed.length > MAX_QUESTION_LEN) {
      return NextResponse.json(
        { error: `Question too long. Max ${MAX_QUESTION_LEN} characters.` },
        { status: 400 },
      );
    }

    // 2. GLM not configured → graceful fallback with contact info
    if (!process.env.ZHIPU_API_KEY) {
      return NextResponse.json({
        answer:
          "Our AI assistant is being set up. For immediate help, contact us via WhatsApp at +86 176 1153 3296 or email info@the86connect.com.",
        sources: [],
      });
    }

    // 3. RAG: embed question → pgvector search → GLM chat with context
    const result = await askQuestion(trimmed);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Chat API error:", error);
    const msg = error instanceof Error ? error.message : "Chat failed";
    return NextResponse.json(
      {
        answer: `Sorry, I couldn't process that request. ${msg}. Please try again or contact us via WhatsApp at +86 176 1153 3296.`,
        sources: [],
      },
      { status: 500 },
    );
  }
}
