"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Car, Search, X, ChevronLeft, ChevronRight } from "lucide-react";
import type { BrandCategory } from "@/lib/brands";
import { formatPrice } from "@/lib/utils";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";
import type { Vehicle } from "@/types";

export interface BrandMeta {
  name: string;
  logo: string; // resolved: /brands/file.png or https://...
  category: BrandCategory;
}

interface BrandInfo {
  name: string;
  count: number;
  minPrice: number;
  models: string[];
  image: string;
  logo: string;
  category: BrandCategory;
}

export function BrandsClient({
  vehicles,
  brands,
}: {
  vehicles: Vehicle[];
  brands: BrandMeta[];
}) {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "chinese" | "foreign" | "trucks">("all");
  const [page, setPage] = useState(0);
  const gridTopRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  const PAGE_SIZE = 20;

  const brandList = useMemo<BrandInfo[]>(() => {
    const map = new Map<string, BrandInfo>();
    // Start with all brands from the prop so every brand shows up
    for (const b of brands) {
      map.set(b.name, {
        name: b.name,
        count: 0,
        minPrice: 0,
        models: [],
        image: "",
        logo: b.logo,
        category: b.category,
      });
    }
    // Merge in actual vehicle data from DB
    for (const v of vehicles) {
      const existing = map.get(v.brand);
      if (existing) {
        existing.count += 1;
        if (existing.minPrice === 0 || v.price < existing.minPrice) {
          existing.minPrice = v.price;
        }
        if (!existing.models.includes(v.model)) existing.models.push(v.model);
      } else {
        // Vehicle has a brand not in the brands list — show it anyway
        map.set(v.brand, {
          name: v.brand,
          count: 1,
          minPrice: v.price,
          models: [v.model],
          image: v.image,
          logo: "",
          category: "foreign" as BrandCategory,
        });
      }
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [vehicles, brands]);

  const filteredBrands = useMemo(() => {
    return brandList.filter((b) => {
      const matchSearch = b.name.toLowerCase().includes(search.toLowerCase());
      const matchFilter =
        filter === "all" ||
        (filter === "chinese" && b.category === "chinese") ||
        (filter === "foreign" && b.category === "foreign") ||
        (filter === "trucks" && b.category === "trucks");
      return matchSearch && matchFilter;
    });
  }, [brandList, search, filter]);

  // ponytail: reset to first page whenever filter/search changes — otherwise
  // user lands on an out-of-range page after narrowing results.
  useEffect(() => { setPage(0); }, [filter, search]);

  const totalPages = Math.ceil(filteredBrands.length / PAGE_SIZE);
  const safePage = Math.min(page, Math.max(0, totalPages - 1));
  const pagedBrands = filteredBrands.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  // Scroll to top of brand grid when page changes so user sees the new page's first row.
  // ponytail: skips initial mount; uses sentinel div (not the motion.div) to avoid
  // Framer Motion layout-animation transform interfering with scroll position.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    gridTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [safePage]);

  const chineseCount = brandList.filter((b) => b.category === "chinese").length;
  const foreignCount = brandList.filter((b) => b.category === "foreign").length;
  const truckCount = brandList.filter((b) => b.category === "trucks").length;

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden pt-28 pb-12">
        <div className="gradient-mesh absolute inset-0 -z-10" />
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="flex flex-col gap-5"
          >
            <motion.span
              variants={fadeUp}
              className="inline-flex items-center gap-2 self-start rounded-full bg-brand-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-brand-600"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
              Brands
            </motion.span>
            <motion.h1
              variants={fadeUp}
              className="font-display text-4xl font-bold tracking-tight text-[var(--text-primary)] sm:text-5xl lg:text-6xl"
            >
              Vehicle Brands
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="max-w-2xl text-lg leading-relaxed text-[var(--text-muted)]"
            >
              We source vehicles from China&apos;s top manufacturers and
              international brands. Click a brand to browse available models.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Brand grid */}
      <section className="bg-[var(--bg-secondary)] pb-24">
        <div className="mx-auto max-w-7xl px-6">
          {/* Quick-jump brand tabs */}
          <div className="mb-6 flex flex-wrap gap-1.5">
            {brandList.map((brand) => (
              <Link
                key={brand.name}
                href={`/inventory?brand=${encodeURIComponent(brand.name)}`}
                className="glass-btn inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium text-[var(--text-primary)] transition-all hover:scale-105 hover:border-brand-500/40 active:scale-95"
              >
                {brand.logo ? (
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    className="h-4 w-4 object-contain"
                    loading="lazy"
                  />
                ) : null}
                {brand.name}
              </Link>
            ))}
          </div>

          {/* Search + Filter */}
          <div className="mb-8 flex flex-col gap-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSearch(searchInput);
              }}
              className="glass-card flex items-center gap-3 rounded-full px-5 py-3"
            >
              <Search className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search brands..."
                className="w-full bg-transparent text-sm text-[var(--text-primary)] outline-none placeholder:text-muted"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput("");
                    setSearch("");
                  }}
                  className="shrink-0 text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <button
                type="submit"
                className="shrink-0 rounded-full bg-brand-500 px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-600"
              >
                Search
              </button>
            </form>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all ${
                  filter === "all"
                    ? "bg-brand-500 text-white shadow-[0_0_0_2px_rgba(227,30,36,0.3)]"
                    : "bg-[var(--bg-elevated)] text-[var(--text-primary)] hover:scale-105"
                }`}
              >
                All Brands
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${filter === "all" ? "bg-white/20" : "bg-[var(--bg-secondary)]"}`}>
                  {brandList.length}
                </span>
              </button>
              <button
                onClick={() => setFilter("chinese")}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all ${
                  filter === "chinese"
                    ? "bg-green-500 text-white shadow-[0_0_0_2px_rgba(34,197,94,0.3)]"
                    : "bg-[var(--bg-elevated)] text-[var(--text-primary)] hover:scale-105"
                }`}
              >
                Chinese
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${filter === "chinese" ? "bg-white/20" : "bg-[var(--bg-secondary)]"}`}>
                  {chineseCount}
                </span>
              </button>
              <button
                onClick={() => setFilter("foreign")}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all ${
                  filter === "foreign"
                    ? "bg-blue-500 text-white shadow-[0_0_0_2px_rgba(59,130,246,0.3)]"
                    : "bg-[var(--bg-elevated)] text-[var(--text-primary)] hover:scale-105"
                }`}
              >
                Foreign
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${filter === "foreign" ? "bg-white/20" : "bg-[var(--bg-secondary)]"}`}>
                  {foreignCount}
                </span>
              </button>
              <button
                onClick={() => setFilter("trucks")}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all ${
                  filter === "trucks"
                    ? "bg-amber-500 text-white shadow-[0_0_0_2px_rgba(245,158,11,0.3)]"
                    : "bg-[var(--bg-elevated)] text-[var(--text-primary)] hover:scale-105"
                }`}
              >
                🚚 Trucks
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${filter === "trucks" ? "bg-white/20" : "bg-[var(--bg-secondary)]"}`}>
                  {truckCount}
                </span>
              </button>
            </div>
          </div>

          {/* Sentinel for scroll-to-top on page change */}
          <div ref={gridTopRef} className="-mt-4" aria-hidden />

          <AnimatePresence mode="wait">
            {filteredBrands.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-3 py-16 text-center"
              >
                <Search className="h-10 w-10 text-[var(--text-muted)]" />
                <p className="text-[var(--text-muted)]">No brands found for &quot;{search}&quot;</p>
              </motion.div>
            ) : (
              <motion.div
                key="grid"
                layout
                className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
              >
                {pagedBrands.map((brand) => {
                  const brandId = brand.name.toLowerCase().replace(/\s+/g, "-");
                  return (
                    <motion.div
                      key={brand.name}
                      id={brandId}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Link
                        href={`/inventory?brand=${encodeURIComponent(brand.name)}`}
                        className="group relative block overflow-hidden rounded-3xl border border-[var(--border-color)] bg-gradient-to-br from-white/80 to-white/40 p-6 backdrop-blur-xl transition-all duration-500 hover:scale-[1.02] hover:border-brand-500/40 hover:shadow-2xl hover:shadow-brand-500/10 dark:from-white/10 dark:to-white/5"
                      >
                        {/* Logo */}
                        <div className="relative mx-auto mb-4 flex h-24 items-center justify-center">
                          {brand.logo ? (
                            <img
                              src={brand.logo}
                              alt={`${brand.name} logo`}
                              className="h-full w-full object-contain transition-all duration-500 group-hover:scale-110"
                            />
                          ) : (
                            <span className="font-display text-2xl font-bold text-[var(--text-primary)]">
                              {brand.name}
                            </span>
                          )}
                        </div>

                        {/* Name */}
                        <h3
                          id={`brand-heading-${brandId}`}
                          className="mb-3 text-center font-display text-lg font-bold tracking-tight text-[var(--text-primary)]"
                        >
                          {brand.name}
                        </h3>

                        {/* Models */}
                        {brand.models.length > 0 ? (
                          <p className="mb-4 text-center text-xs text-[var(--text-muted)]">
                            {brand.models.slice(0, 3).join(" · ")}
                            {brand.models.length > 3 && ` +${brand.models.length - 3} more`}
                          </p>
                        ) : (
                          <p className="mb-4 text-center text-xs italic text-[var(--text-muted)]">
                            Coming soon
                          </p>
                        )}

                        {/* Footer */}
                        <div className="flex items-center justify-between border-t border-white/20 pt-3 dark:border-white/10">
                          {brand.minPrice > 0 ? (
                            <span className="text-xs text-[var(--text-muted)]">
                              From <span className="font-bold text-[var(--text-primary)]">{formatPrice(brand.minPrice)}</span>
                            </span>
                          ) : (
                            <span className="text-xs text-[var(--text-muted)]">—</span>
                          )}
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-500 transition-all group-hover:gap-2">
                            Browse
                            <ArrowRight className="h-3 w-3" />
                          </span>
                        </div>

                        {/* Hover glow */}
                        <div className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: "radial-gradient(circle at 50% 0%, rgba(227,30,36,0.08) 0%, transparent 70%)" }} />
                      </Link>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pagination — only show when more than one page */}
          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setPage(Math.max(0, safePage - 1))}
                disabled={safePage === 0}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] transition-all hover:border-brand-500 hover:text-brand-500 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[var(--border-color)] disabled:hover:text-[var(--text-primary)]"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i).map((i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setPage(i)}
                    className={`h-10 min-w-10 rounded-full px-3 text-sm font-semibold transition-all ${
                      i === safePage
                        ? "bg-brand-500 text-white shadow-[0_0_0_2px_rgba(227,30,36,0.3)]"
                        : "border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:border-brand-500 hover:text-brand-500"
                    }`}
                    aria-label={`Page ${i + 1}`}
                    aria-current={i === safePage ? "page" : undefined}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setPage(Math.min(totalPages - 1, safePage + 1))}
                disabled={safePage >= totalPages - 1}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] transition-all hover:border-brand-500 hover:text-brand-500 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[var(--border-color)] disabled:hover:text-[var(--text-primary)]"
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* CTA */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="glass-card mt-10 flex flex-col items-center gap-4 rounded-3xl px-6 py-12 text-center"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-500/10 text-brand-500">
              <Car className="h-7 w-7" />
            </span>
            <h3 className="font-display text-2xl font-bold text-[var(--text-primary)]">
              Can&apos;t find your brand?
            </h3>
            <p className="max-w-md text-sm leading-relaxed text-[var(--text-muted)]">
              We source from 50+ manufacturers. Contact us with your specific
              requirements and we&apos;ll find the right vehicle for you.
            </p>
            <Link
              href="/#contact"
              className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-600"
            >
              Request a Quote
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
