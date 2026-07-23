import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://cars.the86connect.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/_next/",
          "/images/",
          "/hero/",
          "/vehicles/",
          "/cars/",
          "/brands/",
          "/public/",
          "/*.css",
          "/*.js",
          "/*.png",
          "/*.jpg",
          "/*.jpeg",
          "/*.webp",
          "/*.svg",
          "/*.ico",
        ],
        disallow: [
          "/admin/",
          "/api/",
          "/account/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
