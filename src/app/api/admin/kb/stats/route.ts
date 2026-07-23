import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";
import { kbDocuments, kbChunks, getKbStorageBytes } from "@/lib/db";
import { getKbProviderInfo } from "@/lib/kb";

function requireAdmin(req: NextRequest): NextResponse | null {
  const token = req.cookies.get("admin-session")?.value;
  if (!token || !verifySessionToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

// GET /api/admin/kb/stats — doc count, chunk count, storage bytes, config flag
export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (auth) return auth;

  try {
    const [docCount, chunkCount, storageBytes, providerInfo] = await Promise.all([
      kbDocuments.count(),
      kbChunks.count(),
      getKbStorageBytes(),
      Promise.resolve(getKbProviderInfo()),
    ]);

    return NextResponse.json({
      docCount,
      chunkCount,
      storageBytes,
      storageLabel: formatBytes(storageBytes),
      provider: providerInfo.provider,
      providerLabel: providerInfo.label,
      embeddingDims: providerInfo.dims,
      providerConfigured: providerInfo.configured,
      // Used by admin UI to show projected storage growth
      avgBytesPerChunk: chunkCount > 0 ? Math.round(storageBytes / chunkCount) : 0,
    });
  } catch (error) {
    console.error("KB stats error:", error);
    return NextResponse.json({ error: "Failed to fetch KB stats" }, { status: 500 });
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(i === 0 ? 0 : 2)} ${units[i]}`;
}
