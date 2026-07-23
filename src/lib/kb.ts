import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import mammoth from "mammoth";
import { randomUUID } from "crypto";
import { kbDocuments, kbChunks } from "@/lib/db";

const GLM_BASE = "https://open.bigmodel.cn/api/paas/v4";
const GLM_KEY = process.env.ZHIPU_API_KEY;

// ponytail: GLM API is OpenAI-compatible REST — plain fetch, no SDK needed
async function embed(texts: string[]): Promise<number[][]> {
  if (!GLM_KEY) throw new Error("ZHIPU_API_KEY not set");
  const res = await fetch(`${GLM_BASE}/embeddings`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GLM_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: "embedding-3", input: texts }),
  });
  if (!res.ok) throw new Error(`GLM embed ${res.status}: ${await res.text()}`);
  const json = await res.json();
  return (json.data as { index: number; embedding: number[] }[])
    .sort((a, b) => a.index - b.index)
    .map((d) => d.embedding);
}

async function chat(prompt: string, context: string): Promise<string> {
  if (!GLM_KEY) throw new Error("ZHIPU_API_KEY not set");
  const res = await fetch(`${GLM_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GLM_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "glm-4-flash",
      messages: [
        {
          role: "system",
          content:
            "You are an assistant for 86Connect Cars, a China car export company. Answer using ONLY the provided context. If the context doesn't contain the answer, say you don't know and suggest contacting the team via WhatsApp or email. Be concise and helpful. When discussing prices, shipping, or vehicles, reference the specific details from the context.",
        },
        {
          role: "user",
          content: `Context:\n${context}\n\nQuestion: ${prompt}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    }),
  });
  if (!res.ok) throw new Error(`GLM chat ${res.status}: ${await res.text()}`);
  const json = await res.json();
  return json.choices?.[0]?.message?.content ?? "No response";
}

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
  const text = await parseDocx(arrayBuffer);
  const chunks = await chunkText(text);
  if (chunks.length === 0) throw new Error("Document has no extractable text");

  const docId = `kb-${Date.now()}-${randomUUID().slice(0, 8)}`;
  const charCount = text.length;

  // Embed in batches of 20 (GLM supports batch input)
  const EMBED_BATCH = 20;
  const allEmbeddings: number[][] = [];
  for (let i = 0; i < chunks.length; i += EMBED_BATCH) {
    const batch = chunks.slice(i, i + EMBED_BATCH);
    const embeddings = await embed(batch);
    allEmbeddings.push(...embeddings);
  }

  // Store doc metadata
  await kbDocuments.create({
    id: docId,
    title,
    filename,
    chunkCount: chunks.length,
    charCount,
  });

  // Store chunks + embeddings in batches of 50 (avoids huge payloads)
  const INSERT_BATCH = 50;
  for (let i = 0; i < chunks.length; i += INSERT_BATCH) {
    const batch = chunks.slice(i, i + INSERT_BATCH).map((content, j) => ({
      docId,
      content,
      embedding: allEmbeddings[i + j],
      chunkIndex: i + j,
      metadata: { source: filename, chunk: i + j },
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
  // Delete old doc (cascade removes old chunks)
  await kbDocuments.delete(docId);
  // Insert new
  return upsertDocument(arrayBuffer, filename, title);
}

/** Delete a document and all its chunks (cascade). */
export async function deleteDocument(docId: string): Promise<void> {
  await kbDocuments.delete(docId);
}

export type KbSource = { docId: string; content: string; similarity: number };

/** RAG query: embed question, search pgvector, call GLM chat with context. */
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
