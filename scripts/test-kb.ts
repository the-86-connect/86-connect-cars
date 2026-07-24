import { parseDocx, chunkText, getKbProviderInfo } from "../src/lib/kb";
import { readFileSync } from "fs";

async function main() {
  console.log("=== KB self-test ===\n");

  // 1. Provider check
  const info = getKbProviderInfo();
  console.log("Provider:", info.provider);
  console.log("Label:", info.label);
  console.log("Dims:", info.dims);
  console.log("Configured:", info.configured);
  console.log();

  // 2. Parse docx
  const buf = readFileSync("86Connect-Knowledge-Base.docx");
  // Convert Node Buffer to plain ArrayBuffer like the browser's File.arrayBuffer() would
  const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  const text = await parseDocx(ab);
  console.log("Parsed text length:", text.length, "chars");
  console.log("First 200 chars:", text.slice(0, 200).replace(/\n/g, "\\n"));
  console.log();

  // 3. Chunk
  const chunks = await chunkText(text);
  console.log("Chunk count:", chunks.length);
  console.log("First chunk length:", chunks[0]?.length ?? 0);
  console.log();

  console.log("=== All local checks passed ===");
  if (!info.configured) {
    console.log("\nWARNING: No AI provider configured. Upload will fail at embed step.");
    console.log("Set ZHIPU_API_KEY or OPENAI_API_KEY in your environment.");
  }
}

main().catch((e) => {
  console.error("TEST FAILED:", e);
  process.exit(1);
});
