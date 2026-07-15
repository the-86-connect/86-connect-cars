import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { VehicleDetailClient } from "@/components/inventory/VehicleDetailClient";
import { getVehicles, getVehicleBySlug } from "@/lib/vehicles.server";
import type { Vehicle } from "@/types";

type Props = {
  params: Promise<{ slug: string }>;
};

// Dynamic rendering — admin can add vehicles at any time, so we can't fully static-generate.
// generateStaticParams pre-renders known vehicles at build; new admin-added ones render on demand.
export async function generateStaticParams() {
  try {
    const vehicles = await getVehicles();
    return vehicles.map((v) => ({ slug: v.slug }));
  } catch {
    return [];
  }
}

/** SEO metadata — uses `absolute` so the layout template doesn't double the suffix. */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const vehicle = await getVehicleBySlug(slug);

  if (!vehicle) {
    return { title: { absolute: "Vehicle Not Found | 86Connect" } };
  }

  return {
    title: {
      absolute: `${vehicle.brand} ${vehicle.model} ${vehicle.year} — ${formatPrice(vehicle.price)} | 86Connect`,
    },
    description: vehicle.description,
    openGraph: {
      title: `${vehicle.brand} ${vehicle.model} ${vehicle.year}`,
      description: vehicle.description,
      images: (vehicle.images ?? []).map((src) => ({ url: src })),
    },
  };
}

export const revalidate = 0; // Admin edits must appear immediately

export default async function VehicleDetailPage({ params }: Props) {
  const { slug } = await params;
  const vehicle: Vehicle | null = await getVehicleBySlug(slug);

  if (!vehicle) {
    notFound();
  }

  return <VehicleDetailClient vehicle={vehicle} />;
}
