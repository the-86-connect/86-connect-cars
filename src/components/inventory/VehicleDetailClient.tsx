"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Zap,
  Gauge,
  Fuel,
  Cog,
  Ruler,
  Weight,
  Users,
  Package,
  Palette,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  MessageCircle,
  X,
  Heart,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Vehicle } from "@/types";
import { cn, formatPrice } from "@/lib/utils";
import { fadeUp, stagger, viewportOnce, EASE } from "@/lib/motion";
import { vehicles } from "@/lib/data";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { useUserAuth, useFavorites } from "@/hooks/useUserAuth";

/** Convert any YouTube input (URL/share/embed/ID) into an embeddable URL. Returns null if not YouTube. */
function toYouTubeEmbed(input: string): string | null {
  const s = input.trim();
  if (!s) return null;
  if (/^[A-Za-z0-9_-]{11}$/.test(s)) return `https://www.youtube.com/embed/${s}`;
  const m = s.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/))([A-Za-z0-9_-]{11})/);
  if (m) return `https://www.youtube.com/embed/${m[1]}`;
  if (s.includes("youtube.com/embed/")) {
    const id = s.split("/embed/")[1]?.split(/[?&]/)[0];
    if (id && /^[A-Za-z0-9_-]{11}$/.test(id)) return s;
  }
  return null;
}

interface SpecRow {
  icon: LucideIcon;
  label: string;
  value: string;
}

const availabilityDot: Record<Vehicle["availability"], string> = {
  "In Stock": "bg-green-500",
  "On Request": "bg-amber-500",
  Sold: "bg-red-500",
};

// ── Financing Calculator ───────────────────────────────────────
function FinancingCalculator({
  price,
  brand,
  model,
}: {
  price: number;
  brand: string;
  model: string;
}) {
  const [downPaymentPct, setDownPaymentPct] = useState(20);
  const [term, setTerm] = useState(36);
  const [open, setOpen] = useState(false);

  const downPayment = Math.round(price * (downPaymentPct / 100));
  const loanAmount = price - downPayment;
  const monthlyRate = 0.05 / 12; // 5% annual rate
  const monthly = Math.round(
    (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, term))) /
      (Math.pow(1 + monthlyRate, term) - 1),
  );
  const totalCost = downPayment + monthly * term;

  return (
    <section className="py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="glass-card flex w-full items-center justify-between rounded-2xl px-6 py-5 transition-all hover:shadow-lg"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
              <span className="text-lg font-bold">$</span>
            </span>
            <div className="text-left">
              <h3 className="font-display text-base font-bold text-[var(--text-primary)]">
                Financing Calculator
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Estimate monthly payments for the {brand} {model}
              </p>
            </div>
          </div>
          <ChevronDown
            className={cn(
              "h-5 w-5 text-[var(--text-muted)] transition-transform",
              open && "rotate-180",
            )}
          />
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="overflow-hidden"
            >
              <div className="glass-card mt-3 rounded-2xl p-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                  {/* Down payment */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[var(--text-muted)]">
                        Down Payment
                      </span>
                      <span className="text-xs font-bold text-brand-500">
                        {downPaymentPct}% ({formatPrice(downPayment)})
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={50}
                      step={5}
                      value={downPaymentPct}
                      onChange={(e) =>
                        setDownPaymentPct(Number(e.target.value))
                      }
                      className="w-full cursor-pointer accent-brand-500"
                    />
                    <div className="flex justify-between text-[9px] text-[var(--text-muted)]">
                      <span>0%</span>
                      <span>50%</span>
                    </div>
                  </div>

                  {/* Term */}
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-semibold text-[var(--text-muted)]">
                      Loan Term
                    </span>
                    <div className="flex gap-1.5">
                      {[12, 24, 36, 48].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setTerm(t)}
                          className={cn(
                            "flex-1 rounded-lg py-2 text-xs font-medium transition-all min-h-[40px]",
                            term === t
                              ? "bg-brand-500 text-white"
                              : "bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[var(--text-primary)]",
                          )}
                        >
                          {t}mo
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Results */}
                  <div className="flex flex-col items-center justify-center rounded-xl bg-brand-500/5 p-4 text-center">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                      Estimated Monthly
                    </span>
                    <span className="mt-1 font-display text-3xl font-bold text-brand-500">
                      {formatPrice(monthly)}
                    </span>
                    <span className="mt-1 text-[10px] text-[var(--text-muted)]">
                      Total: {formatPrice(totalCost)} (5% APR)
                    </span>
                  </div>
                </div>
                <p className="mt-4 text-center text-[10px] text-[var(--text-muted)]">
                  *Estimate only. Actual rates may vary. Contact us for exact
                  financing options.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

/** Map a color name to a representative hex for the swatch. */
function colorToHex(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("white")) return "#f8fafc";
  if (n.includes("black") || n.includes("obsidian") || n.includes("nebula"))
    return "#0a0a0a";
  if (n.includes("grey") || n.includes("gray") || n.includes("slate"))
    return "#6b7280";
  if (n.includes("blue") || n.includes("cosmos")) return "#1d4ed8";
  if (n.includes("green")) return "#059669";
  if (
    n.includes("red") ||
    n.includes("ruby") ||
    n.includes("ember") ||
    n.includes("flare") ||
    n.includes("rallye") ||
    n.includes("mars")
  )
    return "#dc2626";
  return "#9ca3af";
}

export function VehicleDetailClient({ vehicle }: { vehicle: Vehicle }) {
  const [activeImg, setActiveImg] = useState(0);
  const [showWeChat, setShowWeChat] = useState(false);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const [expanded, setExpanded] = useState(false);
  const router = useRouter();
  const { add: addRecentlyViewed } = useRecentlyViewed();
  const { user } = useUserAuth();
  const { favoriteIds, toggleFavorite } = useFavorites(user?.id ?? null);
  const isFav = favoriteIds.has(vehicle.id);

  useEffect(() => {
    addRecentlyViewed(vehicle.slug);
  }, [vehicle.slug, addRecentlyViewed]);

  const isTransparentPng = (src: string) => src.startsWith("/cars/");

  const quickSpecs: SpecRow[] = [
    { icon: Zap, label: "Power", value: vehicle.specs.power },
    { icon: Gauge, label: "0–100 km/h", value: vehicle.specs.acceleration },
    {
      icon: vehicle.specs.range ? Zap : Fuel,
      label: vehicle.specs.range ? "Range" : "Fuel Economy",
      value: vehicle.specs.range ?? vehicle.specs.fuelEconomy ?? "—",
    },
    { icon: Cog, label: "Drivetrain", value: vehicle.specs.drivetrain },
  ];

  const specRows: SpecRow[] = [
    { icon: Zap, label: "Power", value: vehicle.specs.power },
    { icon: Gauge, label: "Torque", value: vehicle.specs.torque },
    {
      icon: Gauge,
      label: "Acceleration (0–100 km/h)",
      value: vehicle.specs.acceleration,
    },
    { icon: Gauge, label: "Top Speed", value: vehicle.specs.topSpeed },
    ...(vehicle.specs.range
      ? [{ icon: Zap, label: "Range", value: vehicle.specs.range }]
      : []),
    ...(vehicle.specs.fuelEconomy
      ? [
          {
            icon: Fuel,
            label: "Fuel Economy",
            value: vehicle.specs.fuelEconomy,
          },
        ]
      : []),
    ...(vehicle.specs.batteryCapacity
      ? [
          {
            icon: Zap,
            label: "Battery Capacity",
            value: vehicle.specs.batteryCapacity,
          },
        ]
      : []),
    ...(vehicle.specs.chargingTime
      ? [
          {
            icon: Zap,
            label: "Charging Time",
            value: vehicle.specs.chargingTime,
          },
        ]
      : []),
    ...(vehicle.specs.engineDisplacement
      ? [
          {
            icon: Cog,
            label: "Engine",
            value: vehicle.specs.engineDisplacement,
          },
        ]
      : []),
    { icon: Cog, label: "Drivetrain", value: vehicle.specs.drivetrain },
    { icon: Cog, label: "Transmission", value: vehicle.transmission },
    { icon: Ruler, label: "Length", value: vehicle.specs.length },
    { icon: Ruler, label: "Width", value: vehicle.specs.width },
    { icon: Ruler, label: "Height", value: vehicle.specs.height },
    { icon: Ruler, label: "Wheelbase", value: vehicle.specs.wheelbase },
    { icon: Weight, label: "Weight", value: vehicle.specs.weight },
    {
      icon: Users,
      label: "Seating Capacity",
      value: String(vehicle.specs.seatingCapacity),
    },
    ...(vehicle.specs.bootSpace
      ? [{ icon: Package, label: "Boot Space", value: vehicle.specs.bootSpace }]
      : []),
    ...(vehicle.specs.payloadCapacity
      ? [
          {
            icon: Package,
            label: "Payload",
            value: vehicle.specs.payloadCapacity,
          },
        ]
      : []),
  ];

  return (
    <div className="pb-24">
      {/* ============ Top: breadcrumb + two-column ============ */}
      <section className="relative overflow-hidden bg-surface pt-28 pb-20">
        <div
          className="gradient-mesh pointer-events-none absolute inset-0 opacity-60"
          aria-hidden
        />

        <div className="relative mx-auto max-w-7xl px-6">
          {/* Breadcrumb */}
          <motion.nav
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="flex flex-wrap items-center gap-1.5 text-sm text-muted"
          >
            <Link href="/" className="transition-colors hover:text-ink">
              Home
            </Link>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-soft" />
            <Link
              href="/inventory"
              className="transition-colors hover:text-ink"
            >
              Inventory
            </Link>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-soft" />
            <span className="font-medium text-ink">
              {vehicle.brand} {vehicle.model}
            </span>
          </motion.nav>

          {/* Two-column */}
          <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-14">
            {/* LEFT — image gallery */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={viewportOnce}
            >
              <div
                className="glass-card relative aspect-[4/3] w-full overflow-hidden rounded-3xl"
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setZoom({
                    x: ((e.clientX - rect.left) / rect.width) * 100,
                    y: ((e.clientY - rect.top) / rect.height) * 100,
                  });
                }}
                onMouseEnter={() => setZoom({ x: 50, y: 50 })}
                onMouseLeave={() => setZoom(null)}
              >
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeImg}
                    src={vehicle.images[activeImg]}
                    alt={`${vehicle.brand} ${vehicle.model} — view ${activeImg + 1}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease: EASE }}
                    className={cn(
                      "h-full w-full",
                      isTransparentPng(vehicle.images[activeImg])
                        ? "object-contain bg-[var(--bg-elevated)] p-8"
                        : "object-cover",
                    )}
                  />
                </AnimatePresence>

                {/* Hover zoom square indicator */}
                {zoom && (
                  <div
                    className="pointer-events-none absolute z-20 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-lg border-2 border-white/80 shadow-lg backdrop-invert"
                    style={{ left: `${zoom.x}%`, top: `${zoom.y}%` }}
                  />
                )}

                {/* Zoom preview box */}
                {zoom && (
                  <div
                    className="pointer-events-none absolute right-4 top-4 z-30 h-28 w-28 overflow-hidden rounded-xl border-2 border-white/80 bg-[var(--bg-elevated)] shadow-xl"
                    style={{
                      backgroundImage: `url(${vehicle.images[activeImg]})`,
                      backgroundRepeat: "no-repeat",
                      backgroundSize: "500%",
                      backgroundPosition: `${zoom.x}% ${zoom.y}%`,
                    }}
                  />
                )}

                {vehicle.badge && (
                  <div className="absolute right-5 top-5">
                    <Badge variant="brand">{vehicle.badge}</Badge>
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              <div className="mt-4 grid grid-cols-3 gap-3">
                {vehicle.images.map((img, i) => (
                  <button
                    key={img + i}
                    type="button"
                    onClick={() => setActiveImg(i)}
                    aria-label={`View image ${i + 1}`}
                    aria-pressed={activeImg === i}
                    className={cn(
                      "relative aspect-[4/3] overflow-hidden rounded-2xl border-2 transition-all duration-300",
                      activeImg === i
                        ? "border-brand-500 shadow-[var(--shadow-soft)]"
                        : "border-transparent opacity-60 hover:opacity-100",
                    )}
                  >
                    <img
                      src={img}
                      alt={`${vehicle.brand} ${vehicle.model} thumbnail ${i + 1}`}
                      className={cn(
                        "h-full w-full",
                        isTransparentPng(img)
                          ? "object-contain bg-[var(--bg-elevated)] p-2"
                          : "object-cover",
                      )}
                    />
                  </button>
                ))}
              </div>

              {/* YouTube video — rendered below thumbnails when set */}
              {vehicle.video && toYouTubeEmbed(vehicle.video) && (
                <div className="mt-4 overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--bg-elevated)]">
                  <div className="aspect-video w-full">
                    <iframe
                      src={toYouTubeEmbed(vehicle.video)!}
                      title={`${vehicle.brand} ${vehicle.model} video`}
                      loading="lazy"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="h-full w-full"
                    />
                  </div>
                </div>
              )}
            </motion.div>

            {/* RIGHT — vehicle info */}
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={viewportOnce}
              className="flex flex-col"
            >
              <motion.span
                variants={fadeUp}
                className="text-sm font-semibold uppercase tracking-widest text-brand-500"
              >
                {vehicle.brand}
              </motion.span>

              <div className="mt-2 flex items-center justify-between gap-4">
                <motion.h1
                  variants={fadeUp}
                  className="font-display text-4xl font-bold tracking-tight text-ink lg:text-5xl"
                >
                  {vehicle.model}
                </motion.h1>
                <motion.button
                  variants={fadeUp}
                  type="button"
                  onClick={() => toggleFavorite(vehicle.id)}
                  aria-label={
                    isFav ? "Remove from favorites" : "Save to favorites"
                  }
                  className={cn(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300",
                    isFav
                      ? "border-red-500 bg-red-500 text-white"
                      : "border-[var(--border-color)] bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:border-red-500 hover:text-red-500",
                  )}
                >
                  <Heart
                    className="h-5 w-5"
                    fill={isFav ? "currentColor" : "none"}
                  />
                </motion.button>
              </div>

              <motion.div
                variants={fadeUp}
                className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-muted"
              >
                <span>{vehicle.year}</span>
                <span className="text-muted-soft">·</span>
                <span>{vehicle.condition}</span>
                <span className="text-muted-soft">·</span>
                <span>{vehicle.bodyType}</span>
                <span className="text-muted-soft">·</span>
                <span>{vehicle.fuel}</span>
              </motion.div>

              {/* Price + availability */}
              <motion.div
                variants={fadeUp}
                className="mt-6 flex flex-wrap items-center gap-4"
              >
                <span className="font-display text-3xl font-bold text-gradient-brand">
                  {formatPrice(vehicle.price)}
                </span>
                <span className="bg-[var(--bg-elevated)] border border-[var(--border-color)] inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium text-[var(--text-primary)]">
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full",
                      availabilityDot[vehicle.availability],
                    )}
                  />
                  {vehicle.availability}
                </span>
              </motion.div>

              {/* Quick specs pills */}
              <motion.div
                variants={fadeUp}
                className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4"
              >
                {quickSpecs.map((s) => (
                  <div
                    key={s.label}
                    className="bg-[var(--bg-elevated)] border border-[var(--border-color)] flex flex-col gap-1 rounded-2xl px-4 py-3"
                  >
                    <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                      <s.icon className="h-3.5 w-3.5 text-brand-500" />
                      {s.label}
                    </span>
                    <span className="text-sm font-semibold text-[var(--text-primary)]">
                      {s.value}
                    </span>
                  </div>
                ))}
              </motion.div>

              {/* Description */}
              <motion.p
                variants={fadeUp}
                className="mt-6 leading-relaxed text-muted"
              >
                {vehicle.description.length > 500 && !expanded ? (
                  <>
                    {vehicle.description.slice(0, 500)}...{" "}
                    <button
                      type="button"
                      onClick={() => setExpanded(true)}
                      className="font-semibold text-brand-500 transition-colors hover:text-brand-600"
                    >
                      Read more
                    </button>
                  </>
                ) : (
                  <>
                    {vehicle.description}
                    {expanded && vehicle.description.length > 500 && (
                      <>
                        {" "}
                        <button
                          type="button"
                          onClick={() => setExpanded(false)}
                          className="font-semibold text-brand-500 transition-colors hover:text-brand-600"
                        >
                          Read less
                        </button>
                      </>
                    )}
                  </>
                )}
              </motion.p>

              {/* Colors */}
              <motion.div variants={fadeUp} className="mt-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                  <Palette className="h-4 w-4 text-brand-500" />
                  Available Colors
                </div>
                <div className="mt-3 flex flex-wrap gap-3">
                  {vehicle.colors.map((c) => {
                    const hex = colorToHex(c);
                    return (
                      <div
                        key={c}
                        className="bg-[var(--bg-elevated)] border border-[var(--border-color)] flex items-center gap-2 rounded-full px-3 py-1.5"
                      >
                        <span
                          className={cn(
                            "h-4 w-4 rounded-full border",
                            hex.toLowerCase() === "#f8fafc"
                              ? "border-[var(--border-color)]"
                              : "border-black/10",
                          )}
                          style={{ backgroundColor: hex }}
                          aria-hidden
                        />
                        <span className="text-xs font-medium text-[var(--text-primary)]">
                          {c}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              {/* CTAs */}
              <motion.div
                variants={fadeUp}
                className="mt-6 flex flex-wrap gap-3"
              >
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() =>
                    router.push(
                      `/?brand=${encodeURIComponent(vehicle.brand)}&model=${encodeURIComponent(vehicle.model)}#contact`,
                    )
                  }
                >
                  Request Quote
                  <ArrowRight className="h-5 w-5" />
                </Button>
                <a
                  href={`https://wa.me/8617611533296?text=${encodeURIComponent(
                    `Hi, I'm interested in the ${vehicle.brand} ${vehicle.model} (${vehicle.year}). Listed: ${formatPrice(vehicle.price)}. View car: ${typeof window !== "undefined" ? window.location.href : ""} Can you provide more details?`,
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 font-semibold tracking-tight transition-all duration-300 cursor-pointer select-none rounded-xl bg-[#25D366] px-9 py-4 text-base text-white hover:bg-[#1ebe5d]"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Inquiry
                </a>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setShowWeChat(true)}
                  className="border-[#07C160] text-[#07C160] hover:bg-[#07C160] hover:text-white"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-3.04-5.91-6.785-6.124h-.277zm-2.229 2.957c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z" />
                  </svg>
                  WeChat
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => router.push("/inventory")}
                >
                  <ArrowLeft className="h-5 w-5" />
                  Back to Inventory
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============ Full specs ============ */}
      <section className="bg-surface-2 py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeading
            eyebrow="Specifications"
            title="Technical Specifications"
            subtitle={`Detailed performance and dimension data for the ${vehicle.brand} ${vehicle.model}.`}
            center={false}
          />

          <Card className="mt-10 p-6 lg:p-10">
            <div className="grid grid-cols-1 gap-x-12 gap-y-5 sm:grid-cols-2">
              {specRows.map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between gap-4 border-b border-[var(--border-color)] pb-3"
                >
                  <span className="flex items-center gap-2.5 text-sm text-[var(--text-muted)]">
                    <row.icon className="h-4 w-4 text-brand-500" />
                    {row.label}
                  </span>
                  <span className="text-right text-sm font-medium text-[var(--text-primary)]">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* ============ Features ============ */}
      <section className="bg-surface py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeading
            eyebrow="Equipment"
            title="Features & Equipment"
            subtitle="Premium features and technology included with this vehicle."
            center={false}
          />

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
          >
            {vehicle.features.map((f) => (
              <motion.div
                key={f}
                variants={fadeUp}
                className="bg-[var(--bg-elevated)] border border-[var(--border-color)] flex items-center gap-3 rounded-2xl px-4 py-3.5"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-brand-500">
                  <Check className="h-4 w-4" />
                </span>
                <span className="text-sm font-medium text-[var(--text-primary)]">
                  {f}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Similar Vehicles ── */}
      {(() => {
        const similar = vehicles
          .filter(
            (v) =>
              v.id !== vehicle.id &&
              (v.brand === vehicle.brand || v.bodyType === vehicle.bodyType),
          )
          .slice(0, 4);
        if (similar.length === 0) return null;
        return (
          <section className="py-16 lg:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
              <SectionHeading
                eyebrow="You may also like"
                title="Similar Vehicles"
                subtitle={`More ${vehicle.bodyType.toLowerCase()}s from our inventory.`}
              />
              <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {similar.map((v) => (
                  <Link
                    key={v.id}
                    href={`/inventory/${v.slug}`}
                    className="glass-card group flex flex-col overflow-hidden rounded-2xl transition-all duration-300 hover:scale-[1.02]"
                  >
                    <div className="relative h-36 overflow-hidden bg-[var(--bg-elevated)]">
                      <img
                        src={v.image}
                        alt={`${v.brand} ${v.model}`}
                        className={cn(
                          "h-full w-full transition-transform duration-500 group-hover:scale-110",
                          v.image.startsWith("/cars/")
                            ? "object-contain p-3"
                            : "object-cover",
                        )}
                      />
                    </div>
                    <div className="flex flex-col gap-1 p-4">
                      <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
                        {v.brand}
                      </span>
                      <h3 className="text-sm font-bold text-[var(--text-primary)]">
                        {v.model}
                      </h3>
                      <p className="text-sm font-semibold text-brand-500">
                        {formatPrice(v.price)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        );
      })()}

      {/* ── CTA ── */}
      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <Card className="flex flex-col items-center gap-6 rounded-3xl px-6 py-16 text-center sm:px-12">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-500/10 text-brand-500">
              <CheckCircle2 className="h-7 w-7" />
            </span>
            <h3 className="font-display text-3xl font-bold tracking-tight text-[var(--text-primary)] lg:text-4xl">
              Interested in this vehicle?
            </h3>
            <p className="max-w-xl text-[var(--text-muted)]">
              Get a free, no-obligation quote for the {vehicle.brand}{" "}
              {vehicle.model}. Our team responds within 24 hours with
              transparent pricing and shipping to your destination.
            </p>
            <div className="mt-2 flex flex-wrap justify-center gap-3">
              <Button
                variant="primary"
                size="lg"
                onClick={() => router.push("/#contact")}
              >
                Get Free Quote
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => router.push("/inventory")}
              >
                Browse More Vehicles
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* WeChat QR popup */}
      <AnimatePresence>
        {showWeChat && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            onClick={() => setShowWeChat(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.25, ease: EASE }}
              className="glass-card relative w-full max-w-sm rounded-3xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setShowWeChat(false)}
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--bg-elevated)] text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-500/10 text-green-500">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-6 w-6"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-3.04-5.91-6.785-6.124h-.277zm-2.229 2.957c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z" />
                  </svg>
                </div>
                <h3 className="font-display text-lg font-bold text-[var(--text-primary)]">
                  Scan to add us on WeChat
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Open WeChat, tap the + icon, choose Scan, and point your
                  camera at the QR code below.
                </p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/wechat-qr.png"
                  alt="86Connect WeChat QR code"
                  className="h-56 w-56 rounded-2xl border border-[var(--border-color)] object-contain"
                />
                <p className="text-xs font-medium text-[var(--text-muted)]">
                  WeChat ID: 86Connect
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
