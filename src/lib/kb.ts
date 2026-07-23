import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import mammoth from "mammoth";
import { randomUUID } from "crypto";
import { kbDocuments, kbChunks } from "@/lib/db";

// ── Provider selection ──────────────────────────────────────────────────
// GLM (Zhipu) is primary; OpenAI is fallback.
// Both use OpenAI-compatible REST APIs — plain fetch, no SDK needed.

export type KbProvider = "glm" | "openai";

const GLM_BASE = "https://open.bigmodel.cn/api/paas/v4";
const OPENAI_BASE = "https://api.openai.com/v1";

function resolveProvider(): KbProvider {
  const pref = process.env.KB_PROVIDER?.toLowerCase() ?? "auto";
  const hasGlm = !!process.env.ZHIPU_API_KEY;
  const hasOai = !!process.env.OPENAI_API_KEY;

  if (pref === "glm") return "glm";
  if (pref === "openai") return "openai";

  // auto mode: prefer GLM if key set, else OpenAI
  return hasGlm ? "glm" : (hasOai ? "openai" : "glm");
}

function getProviderConfig(provider: KbProvider) {
  if (provider === "openai") {
    const key = process.env.OPENAI_API_KEY;
    if (!key) throw new Error("OPENAI_API_KEY not set");
    return {
      baseUrl: OPENAI_BASE,
      key,
      embedModel: "text-embedding-3-small",
      chatModel: "gpt-4o-mini",
      dims: 1536,
      label: "OpenAI",
    };
  }
  // glm
  const key = process.env.ZHIPU_API_KEY;
  if (!key) throw new Error("ZHIPU_API_KEY not set");
  return {
    baseUrl: GLM_BASE,
    key,
    embedModel: "embedding-3",
    chatModel: "glm-4-flash",
    dims: 2048,
    label: "GLM (Zhipu)",
  };
}

export function getKbProviderInfo(): {
  provider: KbProvider;
  label: string;
  dims: number;
  configured: boolean;
} {
  const provider = resolveProvider();
  const hasKey =
    provider === "glm" ? !!process.env.ZHIPU_API_KEY : !!process.env.OPENAI_API_KEY;
  try {
    const cfg = getProviderConfig(provider);
    return { provider, label: cfg.label, dims: cfg.dims, configured: hasKey };
  } catch {
    return { provider, label: provider === "glm" ? "GLM (Zhipu)" : "OpenAI", dims: provider === "glm" ? 2048 : 1536, configured: false };
  }
}

// ── Embedding ───────────────────────────────────────────────────────────

async function embed(texts: string[]): Promise<number[][]> {
  const provider = resolveProvider();
  const cfg = getProviderConfig(provider);

  const res = await fetch(`${cfg.baseUrl}/embeddings`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${cfg.key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: cfg.embedModel, input: texts }),
  });
  if (!res.ok) throw new Error(`${cfg.label} embed ${res.status}: ${await res.text()}`);
  const json = await res.json();
  return (json.data as { index: number; embedding: number[] }[])
    .sort((a, b) => a.index - b.index)
    .map((d) => d.embedding);
}

// ── Chat ────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are 86Connect Cars Assistant — the official representative of 86Connect, a professional China vehicle export company (Beijing BridgePath International Consulting Co., Ltd).

PERSONA:
- You are a knowledgeable, courteous export consultant who speaks on behalf of 86Connect.
- Always refer to the company as "86Connect" or "we" / "our". Never mention any AI model, provider, or technology by name (no "GLM", "OpenAI", "GPT", "AI model", etc.).
- Be concise, professional, and helpful. Answer in the same language as the question.
- Use "I" when responding (you are the 86Connect assistant).

BREVITY RULES (strict):
- Keep answers SHORT — 2 to 5 sentences maximum. One short paragraph.
- Only include the most important details. Never list 5+ items or give step-by-step guides.
- If the answer is longer, give a brief summary and suggest contacting the team or using the quote form for full details.
- Do NOT include numbered lists, bullet points, or multiple sections.

FORMATTING RULES (strict):
- Do NOT use markdown. No **bold**, no # headings, no - bullet points, no 1. numbered lists.
- Write in plain natural paragraphs only.
- You may include URLs in plain text — they will be made clickable automatically.
- When you share contact details, put them at the END of your reply in plain text format.

WHEN ANSWERING:
- Answer using ONLY the provided context. Do not invent information, prices, or specifications.
- If the context covers the topic but is incomplete, give what you have briefly and suggest contacting the team for full details.
- When mentioning prices, always clarify they are approximate / subject to quotation.

QUOTE / PRICING REQUESTS:
- When a user asks about pricing, getting a quote, or wants to buy/source a specific vehicle, answer briefly then encourage them to use the quote form.
- Say something like: "For a detailed quotation, please submit a quote request through our website and our team will get back to you within 24 hours."
- Do NOT try to give exact prices unless they are explicitly in the context.

WHEN THE ANSWER IS NOT IN CONTEXT (out of scope):
- Do NOT say "I don't know" directly. Respond briefly with one of these:
  1. Vehicle/export related: "Great question. Our team can help you with this — please reach out via WhatsApp or submit a quote request and we'll get you a precise answer within 24 hours."
  2. Unrelated: "I specialize in helping clients source and export vehicles from China. How can I assist you with your vehicle sourcing needs?"
  3. Unlisted vehicle pricing: "We source hundreds of models from China. Share the specific vehicle you're interested in and our team will send you a custom quotation within 24 hours."

CONTACT INFORMATION (use these exact details — only when relevant):
- WhatsApp: +86 176 1153 3296
- Email: beijingbridgepath@gmail.com
- Website: https://cars.the86connect.com
- Only share contact info when the user asks for it, or when you need to direct them to the team. Do not put contact info in every reply.

FINAL RULE:
- Never disclose that you are an AI or mention any technology provider.`;

async function chat(prompt: string, context: string): Promise<string> {
  const provider = resolveProvider();
  const cfg = getProviderConfig(provider);

  const res = await fetch(`${cfg.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${cfg.key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: cfg.chatModel,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Context:\n${context}\n\nQuestion: ${prompt}` },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    }),
  });
  if (!res.ok) throw new Error(`${cfg.label} chat ${res.status}: ${await res.text()}`);
  const json = await res.json();
  return json.choices?.[0]?.message?.content ?? "No response";
}

// ── Document processing ─────────────────────────────────────────────────

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});

/** Parse .docx ArrayBuffer → plain text. */
export async function parseDocx(arrayBuffer: ArrayBuffer): Promise<string> {
  // Mammoth expects Node Buffer (not browser ArrayBuffer).
  const buf = Buffer.from(arrayBuffer);
  const result = await mammoth.extractRawText({ buffer: buf });
  return result.value;
}

/** Chunk text into ~1000-char pieces with 200-char overlap. */
export async function chunkText(text: string): Promise<string[]> {
  return splitter.splitText(text);
}

/** Process + embed + store a .docx. Returns doc metadata. */
export async function upsertDocument(
  arrayBuffer: ArrayBuffer,
  filename: string,
  title: string
): Promise<{ id: string; chunkCount: number; charCount: number }> {
  const provider = resolveProvider();
  const cfg = getProviderConfig(provider);

  const text = await parseDocx(arrayBuffer);
  const chunks = await chunkText(text);
  if (chunks.length === 0) throw new Error("Document has no extractable text");

  const docId = `kb-${Date.now()}-${randomUUID().slice(0, 8)}`;
  const charCount = text.length;

  // Embed in batches of 20 (both providers support batch input)
  const EMBED_BATCH = 20;
  const allEmbeddings: number[][] = [];
  for (let i = 0; i < chunks.length; i += EMBED_BATCH) {
    const batch = chunks.slice(i, i + EMBED_BATCH);
    const embeddings = await embed(batch);
    allEmbeddings.push(...embeddings);
  }

  // Store doc metadata with provider info
  await kbDocuments.create({
    id: docId,
    title,
    filename,
    chunkCount: chunks.length,
    charCount,
    provider,
    embeddingDim: cfg.dims,
  });

  // Store chunks + embeddings in batches of 50 (avoids huge payloads)
  const INSERT_BATCH = 50;
  for (let i = 0; i < chunks.length; i += INSERT_BATCH) {
    const batch = chunks.slice(i, i + INSERT_BATCH).map((content, j) => ({
      docId,
      content,
      embedding: allEmbeddings[i + j],
      chunkIndex: i + j,
      metadata: { source: filename, chunk: i + j, provider },
    }));
    await kbChunks.insertMany(batch);
  }

  return { id: docId, chunkCount: chunks.length, charCount };
}

/** Replace a document: delete old chunks (cascade), process new .docx, update metadata. */
export async function replaceDocument(
  docId: string,
  arrayBuffer: ArrayBuffer,
  filename: string,
  title: string
): Promise<{ id: string; chunkCount: number; charCount: number }> {
  await kbDocuments.delete(docId);
  return upsertDocument(arrayBuffer, filename, title);
}

/** Delete a document and all its chunks (cascade). */
export async function deleteDocument(docId: string): Promise<void> {
  await kbDocuments.delete(docId);
}

// ── RAG query ───────────────────────────────────────────────────────────

export type KbSource = { docId: string; content: string; similarity: number };

/** RAG query: embed question, search pgvector, call chat with context. */
export async function askQuestion(question: string): Promise<{
  answer: string;
  sources: KbSource[];
}> {
  const [qVec] = await embed([question]);
  const matches = await kbChunks.search(qVec, 5);

  if (matches.length === 0) {
    return {
      answer: "I don't have information about that yet. Please contact our team via WhatsApp at +86 176 1153 3296 or email beijingbridgepath@gmail.com for assistance.",
      sources: [],
    };
  }

  const context = matches
    .map((m) => `[${m.docId}] ${m.content}`)
    .join("\n\n---\n\n");

  const answer = await chat(question, context);
  return {
    answer,
    sources: matches.map((m) => ({
      docId: m.docId,
      content: m.content,
      similarity: m.similarity,
    })),
  };
}
