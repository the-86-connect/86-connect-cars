"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { Zap, Fuel, Cog, ArrowRight, Heart } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Badge } from "@/components/ui/Badge";
import { useUserAuth, useFavorites } from "@/hooks/useUserAuth";
import { Button } from "@/components/ui/Button";
import { fadeUp, stagger, viewportOnce, EASE } from "@/lib/motion";
import type { Vehicle } from "@/types";

const filters = ["All", "Electric", "Hybrid", "Petrol", "SUV", "Sedan", "Coupe", "Hatchback"] as const;
type Filter = (typeof filters)[number];

function matchesFilter(v: Vehicle, f: Filter) {
  if (f === "All") return true;
  if (f === "Electric" || f === "Hybrid" || f === "Petrol") return v.fuel === f;
  if (f === "SUV" || f === "Sedan" || f === "Coupe" || f === "Hatchback") return v.bodyType === f;
  return true;
}

const brandGradients: Record<string, string> = {
  BYD: "from-red-500/20 to-red-700/10",
  Toyota: "from-red-600/20 to-rose-800/10",
  Geely: "from-blue-500/20 to-blue-700/10",
  Honda: "from-slate-600/20 to-slate-800/10",
  Changan: "from-orange-500/20 to-orange-700/10",
};

function VehicleCard({
  vehicle, index, isFavorited, onToggleFavorite,
}: {
  vehicle: Vehicle; index: number;
  isFavorited: boolean; onToggleFavorite: (id: string) => void;
}) {
  const isTransparentPng = vehicle.image?.startsWith("/cars/") ?? false;
  const [imgError, setImgError] = useState(false);
  const hasImage = !imgError && !!vehicle.image && (isTransparentPng || vehicle.image?.startsWith("/vehicles/") || vehicle.image?.startsWith("http"));
  const gradient = brandGradients[vehicle.brand] ?? "from-brand-500/15 to-brand-700/5";

  // ponytail: hardcoded WhatsApp number matches the convention used in Contact, Footer,
  // VehicleDetailClient, and InventoryClient. Extract to a shared constant only if a 5th site appears.
  const waText = encodeURIComponent(
    `Hi, I'm interested in the ${vehicle.brand} ${vehicle.model} (${vehicle.year}). Can you provide more details?`,
  );
  const onInquiry = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(`https://wa.me/8617611533296?text=${waText}`, "_blank", "noopener,noreferrer");
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, ease: EASE, delay: index * 0.04 }}
    >
      <Link href={`/inventory/${vehicle.slug}`} className="glass-card group relative block overflow-hidden rounded-2xl">
      {/* Image / Gradient area */}
      <div className="relative h-36 overflow-hidden rounded-t-2xl bg-[var(--bg-elevated)]">
        {/* Favorite button */}
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleFavorite(vehicle.id); }}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm transition-all hover:bg-black/60"
          aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart
            className={cn("h-4 w-4 transition-colors", isFavorited ? "text-red-500" : "text-white")}
            fill={isFavorited ? "currentColor" : "none"}
          />
        </button>
        {hasImage ? (
          <Image
            src={vehicle.image}
            alt={`${vehicle.brand} ${vehicle.model}`}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            loading="lazy"
            className={cn(
              "transition-transform duration-700 group-hover:scale-110",
              isTransparentPng ? "object-contain p-4" : "object-cover",
            )}
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            className={cn(
              "flex h-full w-full items-center justify-center bg-gradient-to-br",
              gradient,
            )}
          >
            <span className="font-display text-xl font-bold text-[var(--text-muted)]">
              {vehicle.brand}
            </span>
          </div>
        )}

        {/* Badge */}
        {vehicle.badge && (
          <div className="absolute left-3 top-3">
            <Badge variant="brand" className="!px-2 !py-0.5 !text-[10px]">{vehicle.badge}</Badge>
          </div>
        )}

        {/* Hover overlay */}
        <div className="pointer-events-none absolute inset-0 flex items-end bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="w-full p-3">
            <div className="flex items-center justify-around rounded-lg bg-[var(--bg-card)] px-3 py-1.5 text-[10px] shadow-lg">
              {vehicle.range && (
                <span className="flex items-center gap-1 text-[var(--text-primary)]">
                  <Zap className="h-3 w-3 text-brand-500" />
                  {vehicle.range}
                </span>
              )}
              {vehicle.engine && (
                <span className="flex items-center gap-1 text-[var(--text-primary)]">
                  <Fuel className="h-3 w-3 text-brand-500" />
                  {vehicle.engine}
                </span>
              )}
              <span className="flex items-center gap-1 text-[var(--text-primary)]">
                <Cog className="h-3 w-3 text-brand-500" />
                {vehicle.transmission}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Card body */}
      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-500">
            {vehicle.brand}
          </span>
          <span className="text-[11px] text-[var(--text-muted)]">{vehicle.year}</span>
        </div>
        <h3 className="font-display text-base font-bold text-[var(--text-primary)]">{vehicle.model}</h3>
        <div className="flex flex-wrap gap-1.5">
          <Badge className="!px-2 !py-0.5 !text-[10px]">{vehicle.fuel}</Badge>
          <Badge className="!px-2 !py-0.5 !text-[10px]">{vehicle.bodyType}</Badge>
        </div>
        <div className="mt-1 flex items-end justify-between">
          <div>
            <div className="text-[10px] text-[var(--text-muted)]">From</div>
            <div className="font-display text-lg font-bold text-brand-500">
              {formatPrice(vehicle.price)}
            </div>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full border border-[var(--border-color)] bg-[var(--bg-elevated)] px-3 py-1.5 text-xs font-medium text-[var(--text-primary)] transition-all group-hover:border-brand-300 group-hover:bg-brand-500/10 group-hover:text-brand-600">
            Details
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>

        {/* Inquiry button — opens WhatsApp, does not navigate to detail page */}
        <button
          type="button"
          onClick={onInquiry}
          className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-green-500 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-green-600"
          aria-label={`Inquiry about ${vehicle.brand} ${vehicle.model}`}
        >
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Inquiry
        </button>
      </div>
      </Link>
    </motion.div>
  );
}

export function FeaturedVehicles({ vehicles }: { vehicles: Vehicle[] }) {
  const [active, setActive] = useState<Filter>("All");
  const filtered = vehicles.filter((v) => matchesFilter(v, active));

  const { user } = useUserAuth();
  const { favoriteIds, toggleFavorite } = useFavorites(user?.id ?? null);

  return (
    <section id="inventory" className="bg-[var(--bg-secondary)] pt-12 pb-24 lg:pt-16 lg:pb-32">
      <div className="mx-auto max-w-[1400px] px-2">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
        >
          <SectionHeading
            eyebrow="Inventory"
            title="Featured Vehicles"
            subtitle="Hand-picked vehicles from China's top manufacturers. Every car inspected, verified, and ready for export."
          />
        </motion.div>

        {/* Filter bar - scrollable on mobile */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mt-8 sm:mt-12"
        >
          <div className="flex gap-1.5 overflow-x-auto px-1 pb-2 scrollbar-hide sm:justify-center sm:px-0">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActive(f)}
                className={cn(
                  "shrink-0 rounded-full px-4 py-2 text-xs font-medium transition-all duration-300 sm:px-5 sm:text-sm",
                  active === f
                    ? "bg-brand-500 text-white shadow-[var(--shadow-soft)]"
                    : "border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-primary)]",
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Responsive grid — 2 cols on mobile, 3 on tablet, 4 on desktop */}
        <div className="mt-8 sm:mt-12">
          <motion.div
            layout
            className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4"
          >
            <AnimatePresence mode="popLayout">
              {filtered.slice(0, 8).map((v, i) => (
                <VehicleCard
                  key={v.id}
                  vehicle={v}
                  index={i}
                  isFavorited={favoriteIds.has(v.id)}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* View All button */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mt-10 flex justify-center sm:mt-12"
        >
          <Button variant="outline" size="lg" asChild>
            <Link href="/inventory">
              Browse All Vehicles <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
