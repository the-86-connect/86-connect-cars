import type { MetadataRoute } from "next";
import { getVehicles } from "@/lib/vehicles.server";

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://cars.the86connect.com";

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/inventory`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/brands`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/gallery`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  ];

  // Dynamic vehicle pages
  try {
    const vehicles = await getVehicles();

    const vehiclePages: MetadataRoute.Sitemap = vehicles.map((v) => ({
      url: `${baseUrl}/inventory/${v.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    return [...staticPages, ...vehiclePages];
  } catch {
    // ponytail: if DB is unreachable, still return static pages so sitemap doesn't 500.
    return staticPages;
  }
}
