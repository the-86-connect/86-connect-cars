"use client";

import { useMemo, useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  SlidersHorizontal,
  ArrowRight,
  Car,
  Zap,
  Fuel,
  Cog,
  X,
  ShieldCheck,
  ChevronDown,
  ArrowUpDown,
  MessageCircle,
  Bookmark,
  BookmarkPlus,
  GitCompareArrows,
  Check,
  Download,
  Share2,
  Loader2,
  Heart,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useUserAuth, useFavorites } from "@/hooks/useUserAuth";
import { cn, formatPrice } from "@/lib/utils";
import { EASE } from "@/lib/motion";
import type { Vehicle, Availability } from "@/types";

// ── Filter options (static) ─────────────────────────────────────
const BODIES = [
  "All",
  "Sedan",
  "SUV",
  "Coupe",
  "Hatchback",
  "Convertible",
  "Wagon",
  "Pickup",
  "Van",
  "Minivan",
  "Crossover",
  "Truck",
];
const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: CURRENT_YEAR - 2000 + 1 }, (_, i) =>
  String(CURRENT_YEAR - i),
);
const YEARS = ["All", ...YEAR_OPTIONS];
const SEAT_OPTIONS = ["All", "2", "4", "5", "7", "8+"];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "price-asc", label: "Price: Low → High" },
  { value: "price-desc", label: "Price: High → Low" },
  { value: "year-desc", label: "Year: Newest" },
] as const;
type SortOption = (typeof SORT_OPTIONS)[number]["value"];

const availabilityDot: Record<Availability, string> = {
  "In Stock": "bg-green-500",
  "On Request": "bg-amber-500",
  Sold: "bg-red-500",
};

// ponytail: hardcoded production baseline. DB brands (admin-added/edited) merge
// on top at runtime in InventoryClient — admin edits win, baseline survives.
const HARDCODED_BRAND_LOGOS: Record<string, string> = {
  BYD: "/brands/byd-logo.png",
  Geely: "/brands/geely-logo.png",
  Changan: "/brands/changan-logo.png",
  Toyota: "/brands/toyota-logo.png",
  Honda: "/brands/honda-logo.png",
  BMW: "/brands/bmw-logo.png",
  "Mercedes-Benz": "/brands/mercedes-benz-logo.png",
  Audi: "/brands/audi-logo.png",
  Volkswagen: "/brands/volkswagen-logo.png",
  Tesla: "/brands/tesla-logo.png",
  Hyundai: "/brands/hyundai-logo.png",
  Kia: "/brands/kia-logo.png",
  Nissan: "/brands/nissan-logo.png",
  Ford: "/brands/ford-logo.png",
  Volvo: "/brands/volvo-logo.png",
  Buick: "/brands/buick-logo.png",
  Cadillac: "/brands/cadillac-logo.png",
  Lexus: "/brands/lexus-logo.png",
  Chevrolet: "/brands/chevrolet-logo.png",
  Mazda: "/brands/mazda-logo.png",
  Mitsubishi: "/brands/mitsubishi-logo.png",
  NIO: "/brands/nio-logo.png",
  XPeng: "/brands/xpeng-logo.png",
  "Li Auto": "/brands/lixiang-logo.png",
  "Great Wall": "/brands/great-wall-logo.png",
  Chery: "/brands/chery-logo.png",
  MG: "/brands/mg-logo.png",
  Hongqi: "/brands/hongqi-logo.png",
  Zeekr: "/brands/zeekr-logo.png",
  "Lynk & Co": "/brands/lynkco-logo.png",
  Sinotruk: "/brands/sinotruk-logo.png",
  FAW: "/brands/faw-logo.png",
  Dongfeng: "/brands/dongfeng-logo.png",
  Foton: "/brands/foton-logo.png",
  JAC: "/brands/jac-logo.png",
  Isuzu: "/brands/isuzu-logo.png",
};

const brandGradients: Record<string, string> = {
  BYD: "from-red-500/20 to-red-700/10",
  Toyota: "from-red-600/20 to-rose-800/10",
  Geely: "from-blue-500/20 to-blue-700/10",
  Honda: "from-slate-600/20 to-slate-800/10",
  Changan: "from-orange-500/20 to-orange-700/10",
  Sinotruk: "from-yellow-500/20 to-amber-700/10",
  FAW: "from-blue-600/20 to-blue-800/10",
  Dongfeng: "from-green-500/20 to-green-700/10",
  Foton: "from-sky-500/20 to-sky-700/10",
};

// ── Reusable FilterChip ────────────────────────────────────────
function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <button
      onClick={onRemove}
      className="flex items-center gap-1 rounded-full bg-[var(--bg-elevated)] px-2.5 py-1 text-[10px] font-medium text-[var(--text-primary)] hover:bg-brand-500/10 hover:text-brand-500 transition-colors"
    >
      {label} <X className="h-2.5 w-2.5" />
    </button>
  );
}

// ── FilterDropdown ─────────────────────────────────────────────
function FilterDropdown({
  label,
  options,
  value,
  onChange,
  compact = false,
}: {
  label: string;
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ top: boolean; left: boolean }>({
    top: false,
    left: false,
  });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  useEffect(() => {
    if (!open || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    // Check if dropdown should open upward
    const spaceBelow = viewportHeight - rect.bottom;
    const shouldOpenTop = spaceBelow < 200; // Less than 200px below

    // Check if dropdown should open to the left
    const spaceRight = viewportWidth - rect.right;
    const shouldOpenLeft = spaceRight < 150; // Less than 150px to the right

    setPosition({ top: shouldOpenTop, left: shouldOpenLeft });
  }, [open]);

  const isActive = value !== "All";

  if (compact) {
    return (
      <div className="relative" ref={ref}>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={cn(
            "flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all",
            open || isActive
              ? "bg-brand-500 text-white shadow-md"
              : "bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[var(--text-primary)]",
          )}
        >
          <span>{label}:</span>
          <span className="font-semibold">{value}</span>
          <ChevronDown
            className={cn("h-3 w-3 transition-transform", open && "rotate-180")}
          />
        </button>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className={cn(
                "absolute z-50 min-w-32 max-h-52 overflow-y-auto rounded-xl p-1.5 shadow-xl",
                position.top ? "bottom-full mb-1" : "top-full mt-1",
                position.left ? "right-0" : "left-0",
                "bg-[var(--bg-card)] border border-[var(--border-color)]",
              )}
            >
              {options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    onChange(opt);
                    setOpen(false);
                  }}
                  className={cn(
                    "w-full rounded-lg px-3 py-2 text-left text-xs transition-colors",
                    value === opt
                      ? "bg-brand-500/15 font-semibold text-brand-500"
                      : "text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]",
                  )}
                >
                  {opt}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5" ref={ref}>
      <span className="text-xs font-bold text-[var(--text-primary)]">
        {label}
      </span>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-all min-h-[48px]",
          open || isActive
            ? "bg-brand-500 text-white shadow-md"
            : "bg-[var(--bg-elevated)] text-[var(--text-primary)] active:scale-[0.98]",
        )}
      >
        <span className="flex-1 truncate text-left">{value}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="glass-card relative z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-xl p-1.5 shadow-lg"
          >
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
                className={cn(
                  "w-full rounded-lg px-3 py-2.5 text-left text-sm transition-colors min-h-[44px]",
                  value === opt
                    ? "bg-brand-500/15 font-semibold text-brand-500"
                    : "text-[var(--text-primary)] active:bg-[var(--bg-elevated)]",
                )}
              >
                {opt}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── BrandPills (desktop sidebar) ───────────────────────────────
function BrandPills({
  options,
  value,
  onChange,
  logoMap,
}: {
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
  logoMap: Record<string, string>;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
        Brand
      </span>
      <div className="flex max-h-36 flex-wrap gap-1 overflow-y-auto pr-1">
        {options.map((opt) => {
          const logo = logoMap[opt];
          return (
            <button
              key={opt}
              id={`brand-${opt.toLowerCase().replace(/\s+/g, "-")}`}
              type="button"
              onClick={() => onChange(opt)}
              className={cn(
                "flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[11px] font-medium transition-all min-h-[36px]",
                value === opt
                  ? "bg-green-500 text-white shadow-[0_0_0_2px_rgba(34,197,94,0.3)]"
                  : "bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[var(--text-primary)]",
              )}
            >
              {logo && (
                <img
                  src={logo}
                  alt=""
                  className="h-3.5 w-3.5 object-contain"
                  loading="lazy"
                />
              )}
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── BrandGrid (mobile bottom sheet — 3 column grid) ───────────
function BrandGrid({
  options,
  value,
  onChange,
  logoMap,
}: {
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
  logoMap: Record<string, string>;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-bold text-[var(--text-primary)]">
        Brand
      </span>
      <div className="grid grid-cols-3 gap-1.5">
        {options.map((opt) => {
          const logo = logoMap[opt];
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl px-2 py-2.5 text-[11px] font-medium transition-all min-h-[56px]",
                value === opt
                  ? "bg-brand-500 text-white shadow-md"
                  : "bg-[var(--bg-elevated)] text-[var(--text-muted)] active:scale-95",
              )}
            >
              {logo && (
                <img
                  src={logo}
                  alt=""
                  className="h-6 w-6 object-contain"
                  loading="lazy"
                />
              )}
              <span className="truncate w-full text-center leading-tight">
                {opt}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── QuickFilterChips (mobile — one-tap fuel/body filters) ─────
function QuickFilterChips({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-bold text-[var(--text-primary)]">
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={cn(
              "rounded-full px-3.5 py-2 text-xs font-medium transition-all min-h-[40px]",
              value === opt
                ? "bg-brand-500 text-white shadow-md"
                : "bg-[var(--bg-elevated)] text-[var(--text-muted)] active:scale-95",
            )}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── VehicleCard ────────────────────────────────────────────────
function VehicleCard({
  vehicle,
  index,
  compareMode,
  isSelected,
  onToggleCompare,
  isFavorited,
  onToggleFavorite,
}: {
  vehicle: Vehicle;
  index: number;
  compareMode: boolean;
  isSelected: boolean;
  onToggleCompare: (id: string) => void;
  isFavorited: boolean;
  onToggleFavorite: (id: string) => void;
}) {
  const isTransparentPng = vehicle.image.startsWith("/cars/");
  const [imgError, setImgError] = useState(false);
  const hasImage =
    !imgError && (isTransparentPng || vehicle.image.startsWith("/vehicles/"));
  const gradient =
    brandGradients[vehicle.brand] ?? "from-brand-500/15 to-brand-700/5";

  // ponytail: per-card image carousel — uses vehicle.images when present, else falls back to single image
  const galleryImages = useMemo(
    () =>
      vehicle.images && vehicle.images.length > 0
        ? vehicle.images
        : [vehicle.image],
    [vehicle.images, vehicle.image],
  );
  const [imgIndex, setImgIndex] = useState(0);
  const currentImage =
    galleryImages[Math.min(imgIndex, galleryImages.length - 1)] ??
    vehicle.image;
  const isCurrentTransparentPng = currentImage.startsWith("/cars/");
  const cycleImage = (e: React.MouseEvent, dir: 1 | -1) => {
    e.preventDefault();
    e.stopPropagation();
    setImgIndex((i) => (i + dir + galleryImages.length) % galleryImages.length);
  };

  const waText = encodeURIComponent(
    `Hi, I'm interested in the ${vehicle.brand} ${vehicle.model} (${vehicle.year}). ${vehicle.fobPrice ? `FOB: $${vehicle.fobPrice}` : `Listed: $${vehicle.price}`}. View car: ${typeof window !== "undefined" ? window.location.origin : ""}/inventory/${vehicle.slug} Can you provide more details?`,
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        ease: EASE,
        delay: Math.min(index * 0.04, 0.3),
      }}
      className="group"
    >
      <Link
        href={`/inventory/${vehicle.slug}`}
        className="glass-card flex h-full flex-col overflow-hidden rounded-2xl transition-all duration-300 hover:scale-[1.02]"
      >
        {/* Image */}
        <div className="relative h-36 overflow-hidden bg-[var(--bg-elevated)]">
          {hasImage ? (
            <img
              src={currentImage}
              alt={`${vehicle.brand} ${vehicle.model}`}
              className={cn(
                "h-full w-full transition-all duration-500 group-hover:scale-110",
                isCurrentTransparentPng ? "object-contain p-3" : "object-cover",
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
          {/* Image carousel controls — only when more than 1 image */}
          {hasImage && galleryImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => cycleImage(e, -1)}
                className="absolute left-1 top-1/2 z-10 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white opacity-0 backdrop-blur-sm transition-opacity duration-200 hover:bg-black/70 group-hover:opacity-100"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={(e) => cycleImage(e, 1)}
                className="absolute right-1 top-1/2 z-10 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white opacity-0 backdrop-blur-sm transition-opacity duration-200 hover:bg-black/70 group-hover:opacity-100"
                aria-label="Next image"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
              {/* Dot indicators */}
              <div className="absolute bottom-1 left-1/2 z-10 flex -translate-x-1/2 gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                {galleryImages.map((_, i) => (
                  <span
                    key={i}
                    className={cn(
                      "h-1 rounded-full transition-all",
                      i === imgIndex ? "w-3 bg-white" : "w-1 bg-white/50",
                    )}
                  />
                ))}
              </div>
            </>
          )}
          {vehicle.badge && (
            <span className="absolute left-2 top-2 rounded-full border border-[var(--border-color)] bg-[var(--bg-elevated)] px-2.5 py-0.5 text-[10px] font-semibold text-brand-500">
              {vehicle.badge}
            </span>
          )}
          {/* Compare checkbox */}
          {compareMode && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleCompare(vehicle.id);
              }}
              className={cn(
                "absolute left-2 top-2 flex h-7 w-7 items-center justify-center rounded-full border-2 transition-all z-10",
                isSelected
                  ? "border-brand-500 bg-brand-500 text-white"
                  : "border-white/80 bg-black/40 text-white backdrop-blur-sm",
              )}
              aria-label={`Compare ${vehicle.brand} ${vehicle.model}`}
            >
              {isSelected && <Check className="h-4 w-4" />}
            </button>
          )}
          {/* Favorite button */}
          {!compareMode && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleFavorite(vehicle.id);
              }}
              className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm transition-all hover:bg-black/60"
              aria-label={
                isFavorited ? "Remove from favorites" : "Add to favorites"
              }
            >
              <Heart
                className={cn(
                  "h-4 w-4 transition-colors",
                  isFavorited ? "text-red-500" : "text-white",
                )}
                fill={isFavorited ? "currentColor" : "none"}
              />
            </button>
          )}
          <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-green-500/90 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
            <ShieldCheck className="h-3 w-3" />
            Inspected
          </span>
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col gap-1.5 p-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              {vehicle.brand}
            </span>
            <span className="flex items-center gap-1 text-[10px] text-[var(--text-muted)]">
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  availabilityDot[vehicle.availability],
                )}
              />
              {vehicle.availability}
            </span>
          </div>

          <h3 className="font-display text-base font-bold text-[var(--text-primary)]">
            {vehicle.model}
          </h3>

          <div className="flex flex-wrap gap-1.5">
            <span className="rounded-full bg-[var(--bg-elevated)] px-2 py-0.5 text-[10px] text-[var(--text-muted)]">
              {vehicle.year}
            </span>
            <span className="flex items-center gap-0.5 rounded-full bg-[var(--bg-elevated)] px-2 py-0.5 text-[10px] text-[var(--text-muted)]">
              {vehicle.fuel === "Electric" ? (
                <Zap className="h-2.5 w-2.5" />
              ) : (
                <Fuel className="h-2.5 w-2.5" />
              )}
              {vehicle.fuel}
            </span>
            <span className="flex items-center gap-0.5 rounded-full bg-[var(--bg-elevated)] px-2 py-0.5 text-[10px] text-[var(--text-muted)]">
              <Cog className="h-2.5 w-2.5" />
              {vehicle.transmission}
            </span>
          </div>

          <div className="mt-auto pt-1 font-display text-xl font-bold text-[var(--text-primary)]">
            {formatPrice(vehicle.price)}
          </div>

          {/* Export info */}
          {vehicle.fobPrice && (
            <div className="flex items-center gap-2 text-[10px] text-[var(--text-muted)]">
              <span className="font-semibold text-green-600">
                FOB: {formatPrice(vehicle.fobPrice)}
              </span>
              {vehicle.portOfLoading && <span>• {vehicle.portOfLoading}</span>}
            </div>
          )}

          <div className="mt-2 flex gap-2">
            <span className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full border border-[var(--border-color)] bg-[var(--bg-elevated)] px-4 py-2 text-xs font-medium text-[var(--text-primary)] transition-colors group-hover:border-brand-500/30 group-hover:bg-brand-500/10">
              View Details
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </span>
            <a
              href={`https://wa.me/8617611533296?text=${waText}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-center gap-1.5 rounded-full bg-green-500 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-green-600 min-h-[36px]"
              aria-label={`Inquiry about ${vehicle.brand} ${vehicle.model}`}
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Inquiry
            </a>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ── Filter Sidebar Content (shared between desktop & mobile sheet) ──
function FilterSidebarContent({
  brand,
  setBrand,
  fuel,
  setFuel,
  body,
  setBody,
  year,
  setYear,
  drivetrain,
  setDrivetrain,
  transmission,
  setTransmission,
  seats,
  setSeats,
  color,
  setColor,
  maxPrice,
  setMaxPrice,
  hasActiveFilters,
  resetFilters,
  isMobile = false,
  brands,
  logoMap,
  fuels,
  priceMin,
  priceMax,
  drivetrains,
  transmissions,
  colors,
}: {
  brand: string;
  setBrand: (v: string) => void;
  fuel: string;
  setFuel: (v: string) => void;
  body: string;
  setBody: (v: string) => void;
  year: string;
  setYear: (v: string) => void;
  drivetrain: string;
  setDrivetrain: (v: string) => void;
  transmission: string;
  setTransmission: (v: string) => void;
  seats: string;
  setSeats: (v: string) => void;
  color: string;
  setColor: (v: string) => void;
  maxPrice: number;
  setMaxPrice: (v: number) => void;
  hasActiveFilters: boolean;
  resetFilters: () => void;
  isMobile?: boolean;
  brands: string[];
  logoMap: Record<string, string>;
  fuels: string[];
  priceMin: number;
  priceMax: number;
  drivetrains: string[];
  transmissions: string[];
  colors: string[];
}) {
  return (
    <div className={cn("flex flex-col", isMobile ? "gap-5" : "gap-3")}>
      {!isMobile && (
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-primary)]">
            <SlidersHorizontal className="h-3.5 w-3.5 text-brand-500" />
            Filters
          </span>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-[10px] font-medium text-[var(--text-muted)] transition-colors hover:text-brand-500"
            >
              Clear all
            </button>
          )}
        </div>
      )}

      {/* Brand — grid on mobile, pills on desktop */}
      {isMobile ? (
        <BrandGrid options={brands} value={brand} onChange={setBrand} logoMap={logoMap} />
      ) : (
        <BrandPills options={brands} value={brand} onChange={setBrand} logoMap={logoMap} />
      )}

      {/* Quick filter chips on mobile */}
      {isMobile && (
        <>
          <QuickFilterChips
            label="Fuel Type"
            options={fuels}
            value={fuel}
            onChange={setFuel}
          />
          <QuickFilterChips
            label="Body Type"
            options={BODIES}
            value={body}
            onChange={setBody}
          />
        </>
      )}

      {/* Price */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span
            className={cn(
              isMobile
                ? "text-xs font-bold text-[var(--text-primary)]"
                : "text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]",
            )}
          >
            Max Price
          </span>
          <span className="rounded-full bg-brand-500/10 px-2.5 py-1 text-xs font-bold text-brand-500">
            {formatPrice(maxPrice)}
          </span>
        </div>
        <input
          type="range"
          min={priceMin}
          max={priceMax}
          step={100}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full cursor-pointer accent-brand-500"
          aria-label="Maximum price"
        />
        <div className="flex items-center justify-between text-[10px] font-medium text-[var(--text-muted)]">
          <span>{formatPrice(priceMin)}</span>
          <span>{formatPrice(priceMax)}</span>
        </div>
      </div>

      {/* Desktop-only filters */}
      {!isMobile && (
        <>
          <FilterDropdown
            label="Fuel"
            options={fuels}
            value={fuel}
            onChange={setFuel}
          />
          <FilterDropdown
            label="Body"
            options={BODIES}
            value={body}
            onChange={setBody}
          />
        </>
      )}
      <FilterDropdown
        label="Year"
        options={YEARS}
        value={year}
        onChange={setYear}
      />
      <FilterDropdown
        label="Drivetrain"
        options={drivetrains}
        value={drivetrain}
        onChange={setDrivetrain}
      />
      <FilterDropdown
        label="Transmission"
        options={transmissions}
        value={transmission}
        onChange={setTransmission}
      />
      <FilterDropdown
        label="Seats"
        options={SEAT_OPTIONS}
        value={seats}
        onChange={setSeats}
      />
      {!isMobile && (
        <FilterDropdown
          label="Color"
          options={colors}
          value={color}
          onChange={setColor}
        />
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────
export function InventoryClient({
  vehicles,
  initialBrand,
  brandLogos = {},
}: {
  vehicles: Vehicle[];
  initialBrand?: string;
  brandLogos?: Record<string, string>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // ── Merged logo lookup: hardcoded baseline + DB overrides (admin edits win) ──
  const mergedLogoMap = useMemo(
    () => ({ ...HARDCODED_BRAND_LOGOS, ...brandLogos }),
    [brandLogos],
  );

  // ── Derived filter options (from live DB data) ──
  const BRANDS = useMemo(() => ["All", ...new Set(vehicles.map((v) => v.brand).sort())], [vehicles]);
  const FUELS = useMemo(() => ["All", ...new Set(vehicles.map((v) => v.fuel))], [vehicles]);
  const drivetrains = useMemo(() => ["All", ...new Set(vehicles.map((v) => v.specs?.drivetrain).filter(Boolean))], [vehicles]);
  const transmissions = useMemo(() => ["All", ...new Set(vehicles.map((v) => v.transmission))], [vehicles]);
  const colors = useMemo(() => ["All", ...new Set(vehicles.flatMap((v) => v.colors ?? []))], [vehicles]);
  const PRICES = useMemo(() => vehicles.map((v) => v.price), [vehicles]);
  const priceMin = PRICES.length ? Math.min(...PRICES) : 0;
  const priceMax = PRICES.length ? Math.max(...PRICES) : 100000;

  // Read initial state from URL
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [brand, setBrand] = useState(
    searchParams.get("brand") ?? initialBrand ?? "All",
  );
  const [fuel, setFuel] = useState(searchParams.get("fuel") ?? "All");
  const [body, setBody] = useState(searchParams.get("body") ?? "All");
  const [year, setYear] = useState(searchParams.get("year") ?? "All");
  const [drivetrain, setDrivetrain] = useState(
    searchParams.get("drivetrain") ?? "All",
  );
  const [transmission, setTransmission] = useState(
    searchParams.get("transmission") ?? "All",
  );
  const [seats, setSeats] = useState(searchParams.get("seats") ?? "All");
  const [color, setColor] = useState(searchParams.get("color") ?? "All");
  const [maxPrice, setMaxPrice] = useState(
    Number(searchParams.get("price")) || priceMax,
  );
  const [sortBy, setSortBy] = useState<SortOption>(
    (searchParams.get("sort") as SortOption) ?? "newest",
  );
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const isFirstPageRender = useRef(true);
  const ITEMS_PER_PAGE = 16; // 4 rows × 4 cols on desktop

  // ── Auth & Favorites ──
  const { user } = useUserAuth();
  const { favoriteIds, toggleFavorite } = useFavorites(user?.id ?? null);

  // ── Compare feature ──
  const [compareMode, setCompareMode] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showComparePanel, setShowComparePanel] = useState(false);

  const toggleCompare = (id: string) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev; // max 3
      return [...prev, id];
    });
  };

  const clearCompare = () => {
    setCompareIds([]);
    setCompareMode(false);
    setShowComparePanel(false);
  };

  const compareVehicles = compareIds
    .map((id) => vehicles.find((v) => v.id === id))
    .filter(Boolean) as typeof vehicles;

  // ── PDF export ──
  const compareTableRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  // Scroll to top of inventory grid when page changes.
  // ponytail: useEffect (not rAF) so DOM is committed before scroll measurement.
  // Skips initial mount to avoid jumping on first load.
  useEffect(() => {
    if (isFirstPageRender.current) {
      isFirstPageRender.current = false;
      return;
    }
    gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [currentPage]);

  const exportPDF = async () => {
    if (!compareTableRef.current) return;
    setExporting(true);
    try {
      const el = compareTableRef.current;
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor:
          getComputedStyle(document.documentElement)
            .getPropertyValue("--bg-primary")
            .trim() || "#ffffff",
      });
      const imgData = canvas.toDataURL("image/png");
      const imgW = canvas.width;
      const imgH = canvas.height;
      // Landscape A4 if wider than tall, else portrait
      const isLandscape = imgW > imgH;
      const pdf = new jsPDF({
        orientation: isLandscape ? "landscape" : "portrait",
        unit: "mm",
        format: "a4",
      });
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const availW = pdfW - margin * 2;
      const availH = pdfH - margin * 2;
      const ratio = Math.min(availW / imgW, availH / imgH);
      const w = imgW * ratio;
      const h = imgH * ratio;
      const x = (pdfW - w) / 2;
      const y = (pdfH - h) / 2;
      pdf.addImage(imgData, "PNG", x, y, w, h);
      pdf.save(
        `86connect-compare-${new Date().toISOString().slice(0, 10)}.pdf`,
      );
    } catch (err) {
      console.error("PDF export failed:", err);
    } finally {
      setExporting(false);
    }
  };

  const shareComparison = async () => {
    const names = compareVehicles
      .map((v) => `${v.brand} ${v.model}`)
      .join(" vs ");
    const text = `Vehicle Comparison: ${names}\n\nGenerated by 86Connect — Source Premium Cars From China`;
    if (navigator.share) {
      try {
        await navigator.share({ title: `Compare: ${names}`, text });
      } catch {
        /* user cancelled */
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(text);
      alert("Comparison summary copied to clipboard!");
    }
  };

  // ── Saved filter presets (localStorage) ──
  const SAVED_KEY = "86connect-saved-filters";
  type SavedPreset = {
    id: string;
    name: string;
    filters: Record<string, string>;
  };
  const [savedPresets, setSavedPresets] = useState<SavedPreset[]>([]);
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [presetName, setPresetName] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SAVED_KEY);
      if (stored) setSavedPresets(JSON.parse(stored));
    } catch {
      /* ignore */
    }
  }, []);

  const saveCurrentFilters = () => {
    if (!presetName.trim()) return;
    const preset: SavedPreset = {
      id: Date.now().toString(),
      name: presetName.trim(),
      filters: {
        brand,
        fuel,
        body,
        year,
        drivetrain,
        transmission,
        seats,
        color,
        maxPrice: String(maxPrice),
        sortBy,
      },
    };
    const next = [...savedPresets, preset];
    setSavedPresets(next);
    try {
      localStorage.setItem(SAVED_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
    setPresetName("");
    setShowSaveInput(false);
  };

  const applyPreset = (preset: SavedPreset) => {
    const f = preset.filters;
    setBrand(f.brand ?? "All");
    setFuel(f.fuel ?? "All");
    setBody(f.body ?? "All");
    setYear(f.year ?? "All");
    setDrivetrain(f.drivetrain ?? "All");
    setTransmission(f.transmission ?? "All");
    setSeats(f.seats ?? "All");
    setColor(f.color ?? "All");
    setMaxPrice(Number(f.maxPrice) || priceMax);
    setSortBy((f.sortBy as SortOption) ?? "newest");
  };

  const deletePreset = (id: string) => {
    const next = savedPresets.filter((p) => p.id !== id);
    setSavedPresets(next);
    try {
      localStorage.setItem(SAVED_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  // Sync filters to URL
  const updateURL = useCallback(() => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (brand !== "All") params.set("brand", brand);
    if (fuel !== "All") params.set("fuel", fuel);
    if (body !== "All") params.set("body", body);
    if (year !== "All") params.set("year", year);
    if (drivetrain !== "All") params.set("drivetrain", drivetrain);
    if (transmission !== "All") params.set("transmission", transmission);
    if (seats !== "All") params.set("seats", seats);
    if (color !== "All") params.set("color", color);
    if (maxPrice < priceMax) params.set("price", String(maxPrice));
    if (sortBy !== "newest") params.set("sort", sortBy);
    const qs = params.toString();
    router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
  }, [
    query,
    brand,
    fuel,
    body,
    year,
    drivetrain,
    transmission,
    seats,
    color,
    maxPrice,
    sortBy,
    pathname,
    router,
  ]);

  useEffect(() => {
    updateURL();
  }, [updateURL]);

  // Filter + sort
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let result = vehicles.filter((v) => {
      if (brand !== "All" && v.brand !== brand) return false;
      if (fuel !== "All" && v.fuel !== fuel) return false;
      if (body !== "All" && v.bodyType !== body) return false;
      if (year !== "All" && String(v.year) !== year) return false;
      if (drivetrain !== "All" && v.specs.drivetrain !== drivetrain)
        return false;
      if (transmission !== "All" && v.transmission !== transmission)
        return false;
      if (seats !== "All") {
        if (seats === "8+") {
          if (v.specs.seatingCapacity < 8) return false;
        } else if (String(v.specs.seatingCapacity) !== seats) return false;
      }
      if (color !== "All" && !v.colors.includes(color)) return false;
      if (v.price > maxPrice) return false;
      if (q && !`${v.brand} ${v.model}`.toLowerCase().includes(q)) return false;
      return true;
    });

    // Sort
    switch (sortBy) {
      case "price-asc":
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      case "year-desc":
        result = [...result].sort((a, b) => b.year - a.year);
        break;
      default:
        break; // "newest" = data order
    }
    return result;
  }, [
    query,
    brand,
    fuel,
    body,
    year,
    drivetrain,
    transmission,
    seats,
    color,
    maxPrice,
    sortBy,
  ]);

  const activeFilterCount = [
    brand !== "All",
    fuel !== "All",
    body !== "All",
    year !== "All",
    drivetrain !== "All",
    transmission !== "All",
    seats !== "All",
    color !== "All",
    maxPrice < priceMax,
  ].filter(Boolean).length;

  const hasActiveFilters = activeFilterCount > 0 || query.trim() !== "";

  const resetFilters = () => {
    setQuery("");
    setBrand("All");
    setFuel("All");
    setBody("All");
    setYear("All");
    setDrivetrain("All");
    setTransmission("All");
    setSeats("All");
    setColor("All");
    setMaxPrice(priceMax);
    setSortBy("newest");
    setCurrentPage(1);
  };

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginatedVehicles = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    query,
    brand,
    fuel,
    body,
    year,
    drivetrain,
    transmission,
    seats,
    color,
    maxPrice,
    sortBy,
  ]);

  // Build active filter chips
  const activeChips: { label: string; onRemove: () => void }[] = [];
  if (brand !== "All")
    activeChips.push({ label: brand, onRemove: () => setBrand("All") });
  if (fuel !== "All")
    activeChips.push({ label: fuel, onRemove: () => setFuel("All") });
  if (body !== "All")
    activeChips.push({ label: body, onRemove: () => setBody("All") });
  if (year !== "All")
    activeChips.push({ label: year, onRemove: () => setYear("All") });
  if (transmission !== "All")
    activeChips.push({
      label: transmission,
      onRemove: () => setTransmission("All"),
    });
  if (drivetrain !== "All")
    activeChips.push({
      label: drivetrain,
      onRemove: () => setDrivetrain("All"),
    });
  if (seats !== "All")
    activeChips.push({
      label: `${seats} seats`,
      onRemove: () => setSeats("All"),
    });
  if (color !== "All")
    activeChips.push({ label: color, onRemove: () => setColor("All") });
  if (maxPrice < priceMax)
    activeChips.push({
      label: `≤ ${formatPrice(maxPrice)}`,
      onRemove: () => setMaxPrice(priceMax),
    });

  return (
    <>
      <section className="relative z-10 bg-[var(--bg-secondary)] pt-20 pb-20 lg:pt-24">
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 xl:px-12">
          {/* ── Sticky filter bar (mobile + desktop) ── */}
          <div className="mb-4 flex flex-col gap-3 lg:mb-6">
            <h1 className="font-display text-lg font-bold tracking-tight text-[var(--text-primary)] sm:text-xl">
              Vehicle Inventory
            </h1>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              {/* Search */}
              <div className="glass-card flex flex-1 items-center gap-2 rounded-full px-4 py-2.5 sm:max-w-md">
                <Search className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search brand or model..."
                  className="w-full bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    aria-label="Clear search"
                    className="shrink-0 text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Sort dropdown */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="appearance-none rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-2.5 pr-9 text-xs font-medium text-[var(--text-primary)] transition-colors hover:border-brand-300 focus:border-brand-500 focus:outline-none min-h-[44px]"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ArrowUpDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-muted)]" />
                </div>

                {/* Compare toggle */}
                <button
                  type="button"
                  onClick={() => {
                    setCompareMode((m) => !m);
                    if (compareMode) setCompareIds([]);
                  }}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full border px-3.5 py-2.5 text-xs font-medium transition-all min-h-[44px]",
                    compareMode
                      ? "border-brand-500 bg-brand-500 text-white shadow-md"
                      : "border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:border-brand-300",
                  )}
                >
                  <GitCompareArrows className="h-4 w-4" />
                  <span className="hidden sm:inline">Compare</span>
                  {compareIds.length > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-[10px] font-bold">
                      {compareIds.length}
                    </span>
                  )}
                </button>

                {/* Mobile filter toggle */}
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(true)}
                  className="glass-btn flex items-center gap-2 rounded-full border border-[var(--border-color)] px-4 py-2.5 text-xs font-medium text-[var(--text-primary)] transition-colors hover:border-brand-300 min-h-[44px] lg:hidden"
                >
                  <SlidersHorizontal className="h-4 w-4 text-brand-500" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-[10px] text-white">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            <p className="text-[11px] text-[var(--text-muted)]">
              {filtered.length} of {vehicles.length} vehicles
            </p>

            {/* Saved filter presets */}
            <div className="flex flex-wrap items-center gap-2">
              {savedPresets.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="group flex items-center gap-1.5 rounded-full border border-dashed border-brand-300 bg-brand-50/50 px-3 py-1.5 text-xs font-medium text-brand-600 transition-all hover:border-brand-400 hover:bg-brand-50 min-h-[36px]"
                >
                  <Bookmark className="h-3 w-3" />
                  {preset.name}
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePreset(preset.id);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.stopPropagation();
                        deletePreset(preset.id);
                      }
                    }}
                    className="ml-0.5 rounded-full p-0.5 text-brand-400 opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100"
                    aria-label={`Delete ${preset.name}`}
                  >
                    <X className="h-3 w-3" />
                  </span>
                </button>
              ))}

              {/* Save current filters */}
              {hasActiveFilters && (
                <>
                  {showSaveInput ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={presetName}
                        onChange={(e) => setPresetName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveCurrentFilters();
                          if (e.key === "Escape") setShowSaveInput(false);
                        }}
                        placeholder="Filter name..."
                        className="w-32 rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-1.5 text-xs focus:border-brand-500 focus:outline-none min-h-[36px]"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={saveCurrentFilters}
                        className="rounded-full bg-brand-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-600 min-h-[36px]"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowSaveInput(false);
                          setPresetName("");
                        }}
                        className="rounded-full bg-[var(--bg-elevated)] p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowSaveInput(true)}
                      className="flex items-center gap-1 rounded-full border border-dashed border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-1.5 text-xs font-medium text-[var(--text-muted)] transition-colors hover:border-brand-300 hover:text-brand-500 min-h-[36px]"
                    >
                      <BookmarkPlus className="h-3 w-3" />
                      Save filters
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Active filter chips */}
          {activeChips.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1.5">
              {activeChips.map((chip) => (
                <FilterChip
                  key={chip.label}
                  label={chip.label}
                  onRemove={chip.onRemove}
                />
              ))}
            </div>
          )}

          {/* ── Horizontal filter bar ── */}
          <div className="glass-card relative z-20 mb-4 overflow-visible rounded-2xl p-4 lg:mb-6 lg:p-5">
            <div className="flex flex-col gap-4">
              {/* Brand pills - horizontal scroll */}
              <div className="flex items-center gap-3">
                <span className="shrink-0 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  Brand
                </span>
                <div
                  className="flex flex-1 gap-2 overflow-x-auto pb-1 scrollbar-hide"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  {BRANDS.map((opt) => {
                    const logo = mergedLogoMap[opt];
                    return (
                      <button
                        key={opt}
                        id={`brand-${opt.toLowerCase().replace(/\s+/g, "-")}`}
                        type="button"
                        onClick={() => setBrand(opt)}
                        className={cn(
                          "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium transition-all",
                          brand === opt
                            ? "bg-green-500 text-white shadow-[0_0_0_2px_rgba(34,197,94,0.3)]"
                            : "bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[var(--text-primary)]",
                        )}
                      >
                        {logo && (
                          <img
                            src={logo}
                            alt=""
                            className="h-4 w-4 object-contain"
                            loading="lazy"
                          />
                        )}
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Filter dropdowns row */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Price */}
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    Max Price
                  </span>
                  <span className="rounded-full bg-brand-500/10 px-3 py-1.5 text-sm font-bold text-brand-500">
                    {formatPrice(maxPrice)}
                  </span>
                  <input
                    type="range"
                    min={priceMin}
                    max={priceMax}
                    step={100}
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-32 cursor-pointer accent-brand-500"
                    aria-label="Maximum price"
                  />
                </div>

                {/* Dropdowns */}
                <FilterDropdown
                  label="Fuel"
                  options={FUELS}
                  value={fuel}
                  onChange={setFuel}
                  compact
                />
                <FilterDropdown
                  label="Body"
                  options={BODIES}
                  value={body}
                  onChange={setBody}
                  compact
                />
                <FilterDropdown
                  label="Year"
                  options={YEARS}
                  value={year}
                  onChange={setYear}
                  compact
                />
                <FilterDropdown
                  label="Drivetrain"
                  options={drivetrains}
                  value={drivetrain}
                  onChange={setDrivetrain}
                  compact
                />
                <FilterDropdown
                  label="Transmission"
                  options={transmissions}
                  value={transmission}
                  onChange={setTransmission}
                  compact
                />
                <FilterDropdown
                  label="Seats"
                  options={SEAT_OPTIONS}
                  value={seats}
                  onChange={setSeats}
                  compact
                />
                <FilterDropdown
                  label="Color"
                  options={colors}
                  value={color}
                  onChange={setColor}
                  compact
                />

                {/* Clear all */}
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="ml-auto text-[10px] font-medium text-[var(--text-muted)] transition-colors hover:text-brand-500"
                  >
                    Clear all
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ── Main grid ── */}
          <div ref={gridRef} className="scroll-mt-24">
            {filtered.length > 0 ? (
              <>
                <div
                  className="grid gap-4"
                  style={{
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(250px, 1fr))",
                  }}
                >
                  {paginatedVehicles.map((v, i) => (
                    <VehicleCard
                      key={v.id}
                      vehicle={v}
                      index={i}
                      compareMode={compareMode}
                      isSelected={compareIds.includes(v.id)}
                      onToggleCompare={toggleCompare}
                      isFavorited={favoriteIds.has(v.id)}
                      onToggleFavorite={toggleFavorite}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] transition-colors hover:border-brand-300 hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <button
                          key={page}
                          type="button"
                          onClick={() => setCurrentPage(page)}
                          className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-full border text-sm font-medium transition-all",
                            currentPage === page
                              ? "border-brand-500 bg-brand-500 text-white"
                              : "border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:border-brand-300 hover:bg-brand-50",
                          )}
                        >
                          {page}
                        </button>
                      ),
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        setCurrentPage(Math.min(totalPages, currentPage + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] transition-colors hover:border-brand-300 hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: EASE }}
                className="glass-card flex flex-col items-center gap-3 rounded-2xl px-6 py-16 text-center"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-500/10 text-brand-500">
                  <Car className="h-6 w-6" />
                </span>
                <h3 className="font-display text-lg font-bold text-[var(--text-primary)]">
                  No vehicles found
                </h3>
                <p className="max-w-sm text-xs text-[var(--text-muted)]">
                  Try adjusting your filters or search terms.
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-1 inline-flex items-center gap-2 rounded-full bg-brand-500 px-5 py-2.5 text-xs font-medium text-white transition-colors hover:bg-brand-600"
                >
                  Reset filters
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* ── Mobile filter bottom sheet ── */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileFiltersOpen(false)}
            />
            {/* Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-x-0 bottom-0 z-50 max-h-[88vh] overflow-y-auto rounded-t-3xl bg-[var(--bg-primary)] shadow-2xl lg:hidden"
            >
              {/* Handle */}
              <div className="sticky top-0 z-10 bg-[var(--bg-primary)] pt-3 pb-2 px-5">
                <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[var(--border-color)]" />
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">
                    Filters
                  </h2>
                  <div className="flex items-center gap-2">
                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={resetFilters}
                        className="text-xs font-medium text-brand-500"
                      >
                        Clear all
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setMobileFiltersOpen(false)}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--bg-elevated)] text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="px-5 pb-24">
                <FilterSidebarContent
                  brand={brand}
                  setBrand={setBrand}
                  fuel={fuel}
                  setFuel={setFuel}
                  body={body}
                  setBody={setBody}
                  year={year}
                  setYear={setYear}
                  drivetrain={drivetrain}
                  setDrivetrain={setDrivetrain}
                  transmission={transmission}
                  setTransmission={setTransmission}
                  seats={seats}
                  setSeats={setSeats}
                  color={color}
                  setColor={setColor}
                  maxPrice={maxPrice}
                  setMaxPrice={setMaxPrice}
                  hasActiveFilters={hasActiveFilters}
                  resetFilters={resetFilters}
                  isMobile
                  brands={BRANDS}
                  logoMap={mergedLogoMap}
                  fuels={FUELS}
                  priceMin={priceMin}
                  priceMax={priceMax}
                  drivetrains={drivetrains}
                  transmissions={transmissions}
                  colors={colors}
                />
              </div>

              {/* Sticky apply button */}
              <div className="fixed inset-x-0 bottom-0 z-10 border-t border-[var(--border-color)] bg-[var(--bg-primary)] p-4 pb-6 lg:hidden">
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  className="w-full rounded-full bg-brand-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-brand-600 min-h-[48px]"
                >
                  Show {filtered.length} results
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Floating compare bar ── */}
      <AnimatePresence>
        {compareMode && compareIds.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border-color)] bg-[var(--bg-primary)]/95 backdrop-blur-lg shadow-2xl"
          >
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500/10 text-brand-500">
                  <GitCompareArrows className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    {compareIds.length} of 3 selected
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    {compareIds.length < 2
                      ? "Select at least 2 vehicles to compare"
                      : "Ready to compare"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={clearCompare}
                  className="rounded-full px-4 py-2.5 text-xs font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)] min-h-[44px]"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => setShowComparePanel(true)}
                  disabled={compareIds.length < 2}
                  className={cn(
                    "rounded-full px-5 py-2.5 text-xs font-semibold transition-all min-h-[44px]",
                    compareIds.length >= 2
                      ? "bg-brand-500 text-white shadow-md hover:bg-brand-600"
                      : "bg-[var(--bg-elevated)] text-[var(--text-muted)] cursor-not-allowed",
                  )}
                >
                  Compare Now
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Compare panel (full-screen overlay) ── */}
      <AnimatePresence>
        {showComparePanel && compareVehicles.length >= 2 && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowComparePanel(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="fixed inset-2 z-50 overflow-y-auto rounded-2xl bg-[var(--bg-primary)] shadow-2xl sm:inset-4 lg:inset-8"
            >
              {/* Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-4 sm:px-6">
                <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">
                  Compare Vehicles ({compareVehicles.length})
                </h2>
                <div className="flex items-center gap-2">
                  {/* Share button */}
                  <button
                    type="button"
                    onClick={shareComparison}
                    className="flex items-center gap-1.5 rounded-full border border-[var(--border-color)] px-3 py-2 text-xs font-medium text-[var(--text-primary)] transition-colors hover:border-brand-300 hover:text-brand-500 min-h-[40px]"
                  >
                    <Share2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Share</span>
                  </button>
                  {/* Download PDF button */}
                  <button
                    type="button"
                    onClick={exportPDF}
                    disabled={exporting}
                    className="flex items-center gap-1.5 rounded-full bg-brand-500 px-4 py-2 text-xs font-semibold text-white shadow-md transition-colors hover:bg-brand-600 disabled:opacity-50 min-h-[40px]"
                  >
                    {exporting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    <span className="hidden sm:inline">
                      {exporting ? "Exporting..." : "Download PDF"}
                    </span>
                  </button>
                  {/* Close button */}
                  <button
                    type="button"
                    onClick={() => setShowComparePanel(false)}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--bg-elevated)] text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Comparison table */}
              <div ref={compareTableRef} className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  {/* Vehicle headers */}
                  <thead>
                    <tr className="border-b border-[var(--border-color)]">
                      <th className="sticky left-0 z-10 w-40 bg-[var(--bg-primary)] p-4 text-left text-xs font-semibold text-[var(--text-muted)]">
                        Vehicle
                      </th>
                      {compareVehicles.map((v) => (
                        <th key={v.id} className="p-4 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <div className="relative h-24 w-32 overflow-hidden rounded-xl bg-[var(--bg-elevated)]">
                              <img
                                src={v.image}
                                alt={`${v.brand} ${v.model}`}
                                className={cn(
                                  "h-full w-full",
                                  v.image.startsWith("/cars/")
                                    ? "object-contain p-2"
                                    : "object-cover",
                                )}
                              />
                            </div>
                            <div>
                              <p className="text-[10px] font-medium uppercase text-[var(--text-muted)]">
                                {v.brand}
                              </p>
                              <p className="text-sm font-bold text-[var(--text-primary)]">
                                {v.model}
                              </p>
                            </div>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {/* Price */}
                    <CompareRow
                      label="Price"
                      values={compareVehicles.map((v) => (
                        <span
                          key={v.id}
                          className="font-display text-lg font-bold text-brand-500"
                        >
                          {formatPrice(v.price)}
                        </span>
                      ))}
                    />
                    {compareVehicles.some((v) => v.fobPrice) && (
                      <CompareRow
                        label="FOB Price"
                        values={compareVehicles.map((v) => (
                          <span
                            key={v.id}
                            className="font-semibold text-green-600"
                          >
                            {v.fobPrice ? formatPrice(v.fobPrice) : "—"}
                          </span>
                        ))}
                      />
                    )}
                    <CompareRow
                      label="Year"
                      values={compareVehicles.map((v) => (
                        <span key={v.id}>{v.year}</span>
                      ))}
                    />
                    <CompareRow
                      label="Condition"
                      values={compareVehicles.map((v) => (
                        <span key={v.id}>{v.condition}</span>
                      ))}
                    />
                    <CompareRow
                      label="Fuel"
                      values={compareVehicles.map((v) => (
                        <span key={v.id}>{v.fuel}</span>
                      ))}
                    />
                    <CompareRow
                      label="Body Type"
                      values={compareVehicles.map((v) => (
                        <span key={v.id}>{v.bodyType}</span>
                      ))}
                    />
                    <CompareRow
                      label="Transmission"
                      values={compareVehicles.map((v) => (
                        <span key={v.id}>{v.transmission}</span>
                      ))}
                    />
                    <CompareRow
                      label="Drivetrain"
                      values={compareVehicles.map((v) => (
                        <span key={v.id}>{v.specs.drivetrain}</span>
                      ))}
                    />
                    <CompareRow
                      label="Power"
                      values={compareVehicles.map((v) => (
                        <span key={v.id}>{v.specs.power}</span>
                      ))}
                    />
                    <CompareRow
                      label="Torque"
                      values={compareVehicles.map((v) => (
                        <span key={v.id}>{v.specs.torque}</span>
                      ))}
                    />
                    <CompareRow
                      label="0-100 km/h"
                      values={compareVehicles.map((v) => (
                        <span key={v.id}>{v.specs.acceleration}</span>
                      ))}
                    />
                    <CompareRow
                      label="Top Speed"
                      values={compareVehicles.map((v) => (
                        <span key={v.id}>{v.specs.topSpeed}</span>
                      ))}
                    />
                    {compareVehicles.some((v) => v.specs.range) && (
                      <CompareRow
                        label="Range"
                        values={compareVehicles.map((v) => (
                          <span key={v.id}>{v.specs.range ?? "—"}</span>
                        ))}
                      />
                    )}
                    {compareVehicles.some((v) => v.specs.fuelEconomy) && (
                      <CompareRow
                        label="Fuel Economy"
                        values={compareVehicles.map((v) => (
                          <span key={v.id}>{v.specs.fuelEconomy ?? "—"}</span>
                        ))}
                      />
                    )}
                    <CompareRow
                      label="Length"
                      values={compareVehicles.map((v) => (
                        <span key={v.id}>{v.specs.length}</span>
                      ))}
                    />
                    <CompareRow
                      label="Width"
                      values={compareVehicles.map((v) => (
                        <span key={v.id}>{v.specs.width}</span>
                      ))}
                    />
                    <CompareRow
                      label="Height"
                      values={compareVehicles.map((v) => (
                        <span key={v.id}>{v.specs.height}</span>
                      ))}
                    />
                    <CompareRow
                      label="Weight"
                      values={compareVehicles.map((v) => (
                        <span key={v.id}>{v.specs.weight}</span>
                      ))}
                    />
                    <CompareRow
                      label="Seating"
                      values={compareVehicles.map((v) => (
                        <span key={v.id}>{v.specs.seatingCapacity} seats</span>
                      ))}
                    />
                    {compareVehicles.some((v) => v.specs.bootSpace) && (
                      <CompareRow
                        label="Boot Space"
                        values={compareVehicles.map((v) => (
                          <span key={v.id}>{v.specs.bootSpace ?? "—"}</span>
                        ))}
                      />
                    )}
                    {compareVehicles.some((v) => v.specs.payloadCapacity) && (
                      <CompareRow
                        label="Payload"
                        values={compareVehicles.map((v) => (
                          <span key={v.id}>
                            {v.specs.payloadCapacity ?? "—"}
                          </span>
                        ))}
                      />
                    )}
                    {compareVehicles.some((v) => v.portOfLoading) && (
                      <CompareRow
                        label="Port"
                        values={compareVehicles.map((v) => (
                          <span key={v.id}>{v.portOfLoading ?? "—"}</span>
                        ))}
                      />
                    )}
                    {compareVehicles.some((v) => v.handDrive) && (
                      <CompareRow
                        label="Hand Drive"
                        values={compareVehicles.map((v) => (
                          <span key={v.id}>{v.handDrive ?? "—"}</span>
                        ))}
                      />
                    )}

                    {/* Features */}
                    <tr className="border-t border-[var(--border-color)]">
                      <td className="sticky left-0 z-10 bg-[var(--bg-primary)] p-4 text-xs font-semibold text-[var(--text-muted)]">
                        Key Features
                      </td>
                      {compareVehicles.map((v) => (
                        <td key={v.id} className="p-4">
                          <ul className="space-y-1">
                            {v.features.slice(0, 5).map((f) => (
                              <li
                                key={f}
                                className="flex items-start gap-1.5 text-[11px] text-[var(--text-secondary)]"
                              >
                                <Check className="mt-0.5 h-3 w-3 shrink-0 text-green-500" />
                                {f}
                              </li>
                            ))}
                          </ul>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// ── Compare table row helper ───────────────────────────────────
function CompareRow({
  label,
  values,
}: {
  label: string;
  values: React.ReactNode[];
}) {
  return (
    <tr className="border-b border-[var(--border-color)]/50">
      <td className="sticky left-0 z-10 bg-[var(--bg-primary)] p-4 text-xs font-semibold text-[var(--text-muted)]">
        {label}
      </td>
      {values.map((val, i) => (
        <td
          key={i}
          className="p-4 text-center text-sm text-[var(--text-primary)]"
        >
          {val}
        </td>
      ))}
    </tr>
  );
}
