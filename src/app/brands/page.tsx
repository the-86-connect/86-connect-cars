import type { Metadata } from "next";
import { BrandsClient, type BrandMeta } from "@/components/brands/BrandsClient";
import { getVehicles } from "@/lib/vehicles.server";
import { getBrands, resolveLogo } from "@/lib/brands.server";

export const metadata: Metadata = {
  title: "Car Brands — Chinese Vehicle Manufacturers for Export",
  description:
    "Browse all Chinese and international vehicle brands available for export from China. BYD, Geely, Changan, Nio, Xpeng, Li Auto, Zeekr, Toyota, Honda, Volkswagen and more — all inspected and ready to ship worldwide.",
  alternates: { canonical: "/brands" },
  keywords: [
    "Chinese car brands",
    "BYD export",
    "Geely export",
    "Changan cars",
    "Nio export",
    "Xpeng export",
    "Li Auto export",
    "Chinese EV brands",
    "car brands China export",
  ],
  openGraph: {
    url: "/brands",
    title: "Car Brands — Chinese Vehicle Manufacturers for Export",
    description: "Browse all vehicle brands available for export from China. BYD, Geely, Nio, Xpeng and more.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Car Brands — Chinese Vehicle Manufacturers for Export",
    description: "Browse all vehicle brands available for export from China.",
  },
};

export const revalidate = 0;

export default async function BrandsPage() {
  const [vehicles, brandRows] = await Promise.all([getVehicles(), getBrands()]);
  const brands: BrandMeta[] = brandRows.map((b) => ({
    name: b.name,
    logo: resolveLogo(b.logo),
    category: b.category,
  }));
  return <BrandsClient vehicles={vehicles} brands={brands} />;
}
