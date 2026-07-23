import type { Metadata } from "next";
import { InventoryClient } from "@/components/inventory/InventoryClient";
import { getVehicles } from "@/lib/vehicles.server";
import { getBrands, resolveLogo } from "@/lib/brands.server";

export const metadata: Metadata = {
  title: "Vehicle Inventory — Browse Premium Chinese Cars for Export",
  description:
    "Browse 86Connect's full inventory of premium cars for export from China. Filter by brand, fuel type, body type, and price — BYD, Geely, Toyota, Changan, Honda, Nio, Xpeng, Li Auto, all inspected and ready to ship worldwide.",
  alternates: { canonical: "/inventory" },
  keywords: [
    "China car inventory",
    "Chinese cars for sale",
    "BYD cars for export",
    "Geely cars wholesale",
    "Chinese EV inventory",
    "buy cars from China stock",
    "used cars China export",
    "new cars China wholesale",
  ],
  openGraph: {
    url: "/inventory",
    title: "Vehicle Inventory — Browse Premium Chinese Cars for Export",
    description:
      "Browse premium cars for export from China. Filter by brand, fuel, body type, and price. BYD, Geely, Toyota, and more.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vehicle Inventory — Browse Premium Chinese Cars for Export",
    description: "Browse premium cars for export from China. BYD, Geely, Toyota, and more.",
  },
};

export const revalidate = 0;

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ brand?: string }>;
}) {
  const { brand } = await searchParams;
  const [vehicles, brandRows] = await Promise.all([getVehicles(), getBrands()]);
  const brandLogos: Record<string, string> = {};
  for (const b of brandRows) brandLogos[b.name] = resolveLogo(b.logo);
  return <InventoryClient vehicles={vehicles} initialBrand={brand} brandLogos={brandLogos} />;
}
