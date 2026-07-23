/**
 * Shared helpers for gallery API routes.
 * Kept server-only because the routes that use it are server routes.
 */
import "server-only";

/**
 * Normalize a YouTube input (full URL, share URL, embed URL, or raw 11-char ID)
 * into { src: embed URL, thumbnail: hqdefault URL }.
 * Returns null if input is not recognisable as a YouTube video.
 */
export function normalizeYouTube(input: string): { src: string; thumbnail: string } | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (/^[A-Za-z0-9_-]{11}$/.test(trimmed)) {
    return {
      src: `https://www.youtube.com/embed/${trimmed}`,
      thumbnail: `https://i.ytimg.com/vi/${trimmed}/hqdefault.jpg`,
    };
  }
  const match = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/))([A-Za-z0-9_-]{11})/);
  if (match) {
    const id = match[1];
    return {
      src: `https://www.youtube.com/embed/${id}`,
      thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    };
  }
  if (trimmed.includes("youtube.com/embed/")) {
    const id = trimmed.split("/embed/")[1]?.split(/[?&]/)[0];
    if (id && /^[A-Za-z0-9_-]{11}$/.test(id)) {
      return {
        src: trimmed,
        thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      };
    }
  }
  return null;
}

/** Build the canonical record stored in DB from a raw admin payload. */
export function normalizeGalleryPayload(body: Record<string, unknown>) {
  const type = (body.type as string) === "video" ? "video" : "photo";
  const rawSrc = String(body.src ?? "").trim();
  const title = String(body.title ?? "").trim();
  const sortOrder = Number(body.sortOrder ?? 0) || 0;
  const active = body.active === false || body.active === 0 ? 0 : 1;

  let src = rawSrc;
  let thumbnail = String(body.thumbnail ?? "").trim();

  if (type === "video") {
    const yt = normalizeYouTube(rawSrc);
    if (yt) {
      src = yt.src;
      thumbnail = yt.thumbnail;
    } else if (!thumbnail) {
      thumbnail = rawSrc;
    }
  } else if (!thumbnail) {
    thumbnail = rawSrc;
  }

  return { type, src, thumbnail, title, sortOrder, active };
}
