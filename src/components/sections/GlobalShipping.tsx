"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Ship, Globe, Package, Clock, ArrowRight } from "lucide-react";
import { shippingRoutes } from "@/lib/data";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { WorldMap } from "@/components/ui/WorldMap";
import { Button } from "@/components/ui/Button";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";

const shippingMethods = [
  {
    icon: Ship,
    title: "Sea Shipping (RoRo)",
    description:
      "Roll-on/Roll-off for drivable vehicles. Cost-effective bulk shipping.",
    time: "40-60 days",
  },
  {
    icon: Package,
    title: "Container Shipping",
    description:
      "20ft & 40ft containers. Secure, weatherproof, ideal for multiple vehicles.",
    time: "45-65 days",
  },
  {
    icon: Clock,
    title: "Express Options",
    description:
      "Priority handling and direct routes for time-sensitive shipments.",
    time: "20-30 days",
  },
];

const deliveryRegions = [
  {
    region: "Africa",
    countries: [
      { name: "Nigeria", flag: "🇳🇬" },
      { name: "Ghana", flag: "🇬🇭" },
      { name: "Kenya", flag: "🇰🇪" },
      { name: "South Africa", flag: "🇿🇦" },
      { name: "Egypt", flag: "🇪🇬" },
      { name: "Tanzania", flag: "🇹🇿" },
    ],
    ports: ["Lagos", "Tema", "Mombasa", "Durban", "Alexandria", "Dar es Salaam"],
  },
  {
    region: "Americas",
    countries: [
      { name: "USA", flag: "🇺🇸" },
      { name: "Canada", flag: "🇨🇦" },
      { name: "Mexico", flag: "🇲🇽" },
      { name: "Brazil", flag: "🇧🇷" },
      { name: "Chile", flag: "🇨🇱" },
      { name: "Colombia", flag: "🇨🇴" },
    ],
    ports: ["Los Angeles", "Vancouver", "Veracruz", "Santos", "Valparaiso", "Cartagena"],
  },
  {
    region: "Europe",
    countries: [
      { name: "Germany", flag: "🇩🇪" },
      { name: "UK", flag: "🇬🇧" },
      { name: "Netherlands", flag: "🇳🇱" },
      { name: "France", flag: "🇫🇷" },
      { name: "Spain", flag: "🇪🇸" },
      { name: "Italy", flag: "🇮🇹" },
    ],
    ports: ["Hamburg", "Southampton", "Rotterdam", "Le Havre", "Barcelona", "Genoa"],
  },
];

export function GlobalShipping() {
  return (
    <section
      id="shipping"
      className="bg-[var(--bg-secondary)] pt-12 pb-24 lg:pt-16 lg:pb-32"
    >
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
        >
          <SectionHeading
            eyebrow="Global Reach"
            title="Worldwide Shipping"
            subtitle="From Shanghai to your nearest port — we deliver to 40+ countries with real-time tracking and full customs support."
          />
        </motion.div>

        {/* Shipping methods */}
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {shippingMethods.map((method) => (
            <motion.div
              key={method.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="glass-card flex flex-col gap-3 rounded-2xl p-6"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
                <method.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-base font-semibold text-[var(--text-primary)]">
                {method.title}
              </h3>
              <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                {method.description}
              </p>
              <div className="mt-auto flex items-center gap-2 text-xs font-medium text-[var(--text-muted)]">
                <Clock className="h-3.5 w-3.5" />
                {method.time}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Delivery Regions */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3"
        >
          {deliveryRegions.map((region) => (
            <motion.div
              key={region.region}
              variants={fadeUp}
              className="glass-card rounded-2xl p-6"
            >
              <h3 className="mb-4 font-display text-lg font-bold text-[var(--text-primary)]">
                {region.region}
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    Countries
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {region.countries.map((country) => (
                      <span
                        key={country.name}
                        className="inline-flex items-center gap-1 rounded-full bg-[var(--bg-elevated)] px-2.5 py-1 text-xs text-[var(--text-secondary)]"
                      >
                        <span>{country.flag}</span>
                        {country.name}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    Major Ports
                  </p>
                  <div className="space-y-1">
                    {region.ports.map((port) => (
                      <div
                        key={port}
                        className="flex items-center gap-2 text-xs text-[var(--text-secondary)]"
                      >
                        <Ship className="h-3 w-3 text-brand-500" />
                        {port}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats row */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4"
        >
          {[
            { icon: Globe, value: "40+", label: "Countries Served" },
            { icon: Ship, value: "500+", label: "Vehicles Shipped" },
            { icon: Package, value: "100%", label: "Customs Cleared" },
            { icon: Clock, value: "15-45", label: "Days Delivery" },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              variants={fadeUp}
              className="glass-card flex flex-col items-center gap-2 rounded-2xl p-5 text-center"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <div className="font-display text-xl font-bold text-[var(--text-primary)] sm:text-2xl">
                  {stat.value}
                </div>
                <div className="text-xs text-[var(--text-muted)]">
                  {stat.label}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Map + Country scroller side by side */}
        <div className="mt-6 grid items-start gap-6 lg:grid-cols-5">
          {/* Map */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="glass-card overflow-hidden rounded-2xl p-3 lg:col-span-3 lg:p-4"
          >
            <WorldMap />
          </motion.div>

          {/* Scrolling destinations */}
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="lg:col-span-2"
          >
            <div className="glass-card relative h-[330px] overflow-hidden rounded-2xl">
              {/* Top fade */}
              <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-8 bg-gradient-to-b from-[var(--bg-secondary)] to-transparent" />
              {/* Bottom fade */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-8 bg-gradient-to-t from-[var(--bg-secondary)] to-transparent" />

              <div className="scroll-country-list flex flex-col gap-1 p-3">
                {[...shippingRoutes, ...shippingRoutes].map((route, i) => (
                  <div
                    key={`${route.country}-${i}`}
                    className="flex items-center justify-between rounded-lg px-3 py-2 transition-colors hover:bg-[var(--bg-elevated)]"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{route.flag}</span>
                      <span className="text-xs font-medium text-[var(--text-primary)]">
                        {route.country}
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-brand-500/10 px-2 py-0.5 text-[10px] font-semibold text-brand-500">
                      <Ship className="h-2.5 w-2.5" />
                      Active
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* CTA */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mt-12 flex justify-center"
        >
          <Button variant="outline" size="lg" asChild>
            <Link href="/#contact">
              Get Shipping Quote
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
