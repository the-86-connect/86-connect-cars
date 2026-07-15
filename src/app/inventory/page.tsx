import type { Metadata } from "next";
import { InventoryClient } from "@/components/inventory/InventoryClient";
import { getVehicles } from "@/lib/vehicles.server";
import { getBrands, resolveLogo } from "@/lib/brands.server";

export const metadata: Metadata = {
  title: "Vehicle Inventory — Browse Premium Cars for Export",
  description:
    "Browse 86Connect's full inventory of premium cars for export from China. Filter by brand, fuel type, body type, and price — BYD, Toyota, Geely, Honda, and Changan, all inspected and ready to ship worldwide.",
  openGraph: {
    title: "Vehicle Inventory — Browse Premium Cars for Export | 86Connect",
    description:
      "Browse premium cars for export from China. Filter by brand, fuel, body type, and price.",
  },
};

export const revalidate = 0; // Admin can add vehicles at any time

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ brand?: string }>;
}) {
  const { brand } = await searchParams;
  const [vehicles, brandRows] = await Promise.all([getVehicles(), getBrands()]);
  // ponytail: merge DB brands (admin-added/edited) over hardcoded baseline.
  // DB rows override hardcoded entries when names collide — admin edits win.
  const brandLogos: Record<string, string> = {};
  for (const b of brandRows) brandLogos[b.name] = resolveLogo(b.logo);
  return <InventoryClient vehicles={vehicles} initialBrand={brand} brandLogos={brandLogos} />;
}
