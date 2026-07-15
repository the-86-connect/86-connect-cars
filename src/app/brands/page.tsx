import type { Metadata } from "next";
import { BrandsClient, type BrandMeta } from "@/components/brands/BrandsClient";
import { getVehicles } from "@/lib/vehicles.server";
import { getBrands, resolveLogo } from "@/lib/brands.server";

export const metadata: Metadata = {
  title: "Vehicle Brands — Chinese Car Manufacturers | 86Connect",
  description:
    "Browse all vehicle brands available for export from China. BYD, Toyota, Geely, Honda, Changan and more — all inspected and ready to ship worldwide.",
  openGraph: {
    title: "Vehicle Brands — Chinese Car Manufacturers | 86Connect",
    description:
      "Browse all vehicle brands available for export from China.",
  },
};

export const revalidate = 0; // Brand counts must reflect admin-added inventory

export default async function BrandsPage() {
  const [vehicles, brandRows] = await Promise.all([getVehicles(), getBrands()]);
  const brands: BrandMeta[] = brandRows.map((b) => ({
    name: b.name,
    logo: resolveLogo(b.logo),
    category: b.category,
  }));
  return <BrandsClient vehicles={vehicles} brands={brands} />;
}
