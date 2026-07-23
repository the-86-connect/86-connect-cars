import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { VehicleDetailClient } from "@/components/inventory/VehicleDetailClient";
import { getVehicles, getVehicleBySlug } from "@/lib/vehicles.server";
import type { Vehicle } from "@/types";
import { JsonLd } from "@/components/seo/JsonLd";

type Props = {
  params: Promise<{ slug: string }>;
};

const SITE_URL = "https://cars.the86connect.com";

export async function generateStaticParams() {
  try {
    const vehicles = await getVehicles();
    return vehicles.map((v) => ({ slug: v.slug }));
  } catch {
    return [];
  }
}

function mapCondition(condition: Vehicle["condition"]) {
  switch (condition) {
    case "New": return "https://schema.org/NewCondition";
    case "Used": return "https://schema.org/UsedCondition";
    case "Certified Pre-Owned": return "https://schema.org/NewCondition";
    default: return "https://schema.org/UsedCondition";
  }
}

function mapAvailability(availability: Vehicle["availability"]) {
  switch (availability) {
    case "In Stock": return "https://schema.org/InStock";
    case "On Request": return "https://schema.org/PreOrder";
    case "Sold": return "https://schema.org/SoldOut";
    default: return "https://schema.org/InStock";
  }
}

function mapFuelType(fuel: Vehicle["fuel"]) {
  switch (fuel) {
    case "Electric": return "ELECTRIC";
    case "Hybrid": return "HYBRID";
    case "Petrol": return "GASOLINE";
    case "Diesel": return "DIESEL";
    default: return fuel;
  }
}

function buildVehicleJsonLd(v: Vehicle) {
  const images = [v.image, ...(v.images ?? [])].filter(Boolean);
  return {
    "@context": "https://schema.org",
    "@type": "Car",
    name: `${v.brand} ${v.model} ${v.year}`,
    brand: { "@type": "Brand", name: v.brand },
    model: v.model,
    productionDate: String(v.year),
    vehicleModelDate: String(v.year),
    bodyType: v.bodyType,
    vehicleEngine: { "@type": "EngineSpecification", fuelType: mapFuelType(v.fuel) },
    vehicleTransmission: v.transmission,
    driveWheelConfiguration: v.specs.drivetrain,
    numberOfDoors: v.bodyType === "Sedan" || v.bodyType === "Coupe" ? 4 : 5,
    seatingCapacity: v.specs.seatingCapacity,
    mileage: v.mileage ? { "@type": "QuantitativeValue", value: v.mileage, unitCode: "KMT" } : undefined,
    color: v.colors?.[0],
    vehicleConfiguration: `${v.bodyType} ${v.fuel} ${v.transmission}`,
    image: images,
    description: v.description,
    itemCondition: mapCondition(v.condition),
    offers: {
      "@type": "Offer",
      price: v.price,
      priceCurrency: "USD",
      availability: mapAvailability(v.availability),
      url: `${SITE_URL}/inventory/${v.slug}`,
      priceSpecification: v.fobPrice
        ? {
            "@type": "UnitPriceSpecification",
            price: v.fobPrice,
            priceCurrency: "USD",
            priceType: "FOB",
          }
        : undefined,
      seller: {
        "@type": "Organization",
        name: "86Connect",
        legalName: "Beijing BridgePath International Consulting Co., Ltd",
        url: SITE_URL,
        email: "b*************************",
        telephone: "+86-176-1153-3296",
      },
    },
  };
}

function buildBreadcrumbJsonLd(v: Vehicle) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Inventory",
        item: `${SITE_URL}/inventory`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `${v.brand} ${v.model} ${v.year}`,
        item: `${SITE_URL}/inventory/${v.slug}`,
      },
    ],
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const vehicle = await getVehicleBySlug(slug);

  if (!vehicle) {
    return { title: { absolute: "Vehicle Not Found | 86Connect" } };
  }

  const images = (vehicle.images ?? []).map((src) => ({
    url: src,
    width: 1200,
    height: 800,
    alt: `${vehicle.brand} ${vehicle.model} ${vehicle.year}`,
  }));

  const canonical = `/inventory/${vehicle.slug}`;

  return {
    title: {
      absolute: `${vehicle.brand} ${vehicle.model} ${vehicle.year} — ${formatPrice(vehicle.price)} | China Car Export | 86Connect`,
    },
    description:
      `${vehicle.brand} ${vehicle.model} ${vehicle.year} for export from China. ${vehicle.bodyType}, ${vehicle.fuel}, ${vehicle.transmission}. ${formatPrice(vehicle.price)} FOB. Worldwide shipping, full export documentation. ${vehicle.description.slice(0, 120)}`,
    alternates: { canonical },
    keywords: [
      `${vehicle.brand} ${vehicle.model}`,
      `${vehicle.brand} export`,
      `buy ${vehicle.brand} ${vehicle.model} from China`,
      `${vehicle.brand} ${vehicle.year} for sale`,
      `China car export`,
      `${vehicle.fuel} car export China`,
    ],
    openGraph: {
      title: `${vehicle.brand} ${vehicle.model} ${vehicle.year} — ${formatPrice(vehicle.price)} | 86Connect`,
      description: `${vehicle.brand} ${vehicle.model} ${vehicle.year} for export from China. ${formatPrice(vehicle.price)} FOB. Worldwide shipping available.`,
      url: canonical,
      type: "article",
      images: images.length > 0 ? images : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${vehicle.brand} ${vehicle.model} ${vehicle.year} — ${formatPrice(vehicle.price)}`,
      description: `${vehicle.bodyType}, ${vehicle.fuel}, ${vehicle.transmission}. Export from China. Worldwide shipping.`,
      images: images.length > 0 ? images.map((i) => i.url) : undefined,
    },
  };
}

export const revalidate = 0;

export default async function VehicleDetailPage({ params }: Props) {
  const { slug } = await params;
  const vehicle: Vehicle | null = await getVehicleBySlug(slug);

  if (!vehicle) {
    notFound();
  }

  return (
    <>
      <JsonLd data={buildVehicleJsonLd(vehicle)} />
      <JsonLd data={buildBreadcrumbJsonLd(vehicle)} />
      <VehicleDetailClient vehicle={vehicle} />
    </>
  );
}
