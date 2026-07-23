import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id || !/^[A-Za-z0-9_-]{11}$/.test(id)) {
    return new NextResponse("Invalid video ID", { status: 400 });
  }

  const qualities = ["mqdefault", "hqdefault", "0"];

  for (const q of qualities) {
    try {
      const url = `https://i.ytimg.com/vi/${id}/${q}.jpg`;
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0" },
        cache: "force-cache",
      });
      if (res.ok) {
        const buf = await res.arrayBuffer();
        return new NextResponse(buf, {
          headers: {
            "Content-Type": "image/jpeg",
            "Cache-Control": "public, max-age=86400, s-maxage=31536000, immutable",
          },
        });
      }
    } catch {
      continue;
    }
  }

  return new NextResponse("Thumbnail not found", { status: 404 });
}
