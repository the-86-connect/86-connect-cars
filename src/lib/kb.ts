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

const SYSTEM_PROMPT =
  "You are an assistant for 86Connect Cars, a China car export company. Answer using ONLY the provided context. If the context doesn't contain the answer, say you don't know and suggest contacting the team via WhatsApp at +86 176 1153 3296 or email info@the86connect.com. Be concise and helpful. When discussing prices, shipping, or vehicles, reference the specific details from the context.";

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
  const result = await mammoth.extractRawText({ arrayBuffer });
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
      answer: "I don't have information about that yet. Please contact our team via WhatsApp at +86 176 1153 3296 or email info@the86connect.com for assistance.",
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
