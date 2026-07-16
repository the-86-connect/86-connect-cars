// ponytail: simple in-memory rate limiter for Cloudinary uploads.
// Tracks timestamps in sessionStorage so it persists across page refreshes
// but resets when the tab is closed. O(n) scan, fine for ~10 entries.
const STORAGE_KEY = "86c_upload_ts";
const WINDOW_MS = 2 * 60 * 1000; // 2 minutes
const MAX_UPLOADS = 5;

function getTimestamps(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as number[]) : [];
  } catch {
    return [];
  }
}

function saveTimestamps(ts: number[]) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(ts));
  } catch { /* ignore quota errors */ }
}

function pruneTimestamps(ts: number[]): number[] {
  const cutoff = Date.now() - WINDOW_MS;
  return ts.filter((t) => t > cutoff);
}

export function checkUploadRateLimit(): boolean {
  const ts = pruneTimestamps(getTimestamps());
  return ts.length < MAX_UPLOADS;
}

export function recordUpload(): void {
  const ts = pruneTimestamps(getTimestamps());
  ts.push(Date.now());
  saveTimestamps(ts);
}

export function uploadsRemaining(): number {
  const ts = pruneTimestamps(getTimestamps());
  return Math.max(0, MAX_UPLOADS - ts.length);
}

export function rateLimitError(): string {
  return `Rate limit reached. You can upload ${MAX_UPLOADS} images per 2 minutes. Please wait.`;
}