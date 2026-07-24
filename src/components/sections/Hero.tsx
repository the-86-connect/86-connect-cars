"use client";

import { motion } from "motion/react";
import { ArrowRight, Compass } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { StatBadge } from "@/components/ui/StatBadge";
import { heroStats } from "@/lib/data";
import { scrollToId } from "@/lib/utils";
import { fadeUp, stagger, EASE } from "@/lib/motion";

export function Hero() {
  return (
    <>
    <section
      id="home"
      className="relative flex min-h-screen items-center overflow-hidden"
    >
      {/* Hero Images - Responsive */}
      {/* Mobile hero image */}
      <div className="absolute inset-0 z-0 lg:hidden">
        <Image
          src="/hero/screen.png"
          alt="86Connect Hero Mobile"
          fill
          priority
          sizes="100vw"
          quality={100}
          className="object-cover"
        />
      </div>
      {/* Desktop hero image */}
      <div className="absolute inset-0 z-0 hidden lg:block">
        <Image
          src="/hero/hero stich pc 1.png"
          alt="86Connect Hero Desktop"
          fill
          priority
          sizes="100vw"
          quality={100}
          className="object-cover object-[center_65%]"
        />
      </div>

      {/* Dark gradient overlay */}
      {/* Desktop: left-heavy gradient for left-aligned text; Mobile: centered/vertical for centered text */}
      <div
        className="absolute inset-0 z-[1] lg:hidden"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.35) 40%, rgba(0,0,0,0.25) 60%, rgba(0,0,0,0.5) 100%)",
        }}
      />
      <div
        className="absolute inset-0 z-[1] hidden lg:block"
        style={{
          background:
            "linear-gradient(to right, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.45) 8%, rgba(0,0,0,0.35) 35%, rgba(0,0,0,0.05) 65%, transparent 85%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pt-24 pb-20 sm:px-6 sm:pt-32 sm:pb-28 lg:ml-12 lg:pt-40 lg:pb-32 xl:ml-16">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="flex flex-col items-center text-center lg:items-start lg:text-left"
        >
          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            className="font-display text-3xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl sm:leading-[1.02] lg:text-[4.5rem]"
          >
            <span
              className="block text-white/85"
              style={{
                fontSize: "0.55em",
                fontWeight: 600,
                letterSpacing: "0.02em",
              }}
            >
              Source Premium Cars
            </span>
            <span className="mt-2 block">
              From China
              <br />
              <span
                className="bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600 bg-clip-text text-transparent"
              >
                to the World.
              </span>
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.div variants={fadeUp} className="mt-5 flex flex-col items-center gap-3 sm:mt-6 sm:flex-row sm:items-start sm:gap-4 lg:items-start">
            <span className="hidden h-12 w-1 shrink-0 rounded-full bg-gradient-to-b from-brand-400 to-brand-600 sm:block lg:block" />
            <span className="block h-1 w-16 shrink-0 rounded-full bg-gradient-to-r from-brand-400 to-brand-600 sm:hidden" />
            <p className="max-w-sm text-center text-sm leading-relaxed text-white/85 sm:max-w-md sm:text-left sm:text-base lg:max-w-md">
              Affordable prices. Verified suppliers. Worldwide shipping. Professional export service.
            </p>
          </motion.div>

          {/* Buttons */}
          <motion.div variants={fadeUp} className="mt-7 flex w-full flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-4 lg:justify-start">
            <MagneticButton>
              <Button
                variant="primary"
                size="lg"
                className="w-full bg-brand-500 shadow-[0_4px_20px_rgba(227,30,36,0.4)] hover:bg-brand-600 sm:w-auto"
                onClick={() => scrollToId("contact")}
              >
                Get Free Quote <ArrowRight className="h-4 w-4" />
              </Button>
            </MagneticButton>
            <MagneticButton>
              <Button
                variant="outline"
                size="lg"
                className="w-full border-2 border-white/40 bg-transparent text-white hover:border-white hover:bg-white/10 sm:w-auto"
                onClick={() => scrollToId("inventory")}
              >
                <Compass className="h-4 w-4" /> Browse Vehicles
              </Button>
            </MagneticButton>
          </motion.div>
        </motion.div>
      </div>
    </section>

    {/* Stats bar — separate section under hero */}
    <section className="relative z-10 bg-[var(--bg-primary)] pt-8 pb-6 sm:pt-16 sm:pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.6, ease: EASE }}
        >
          <div className="grid grid-cols-2 gap-3 rounded-2xl glass-liquid p-3 shadow-[var(--shadow-soft)] sm:gap-6 sm:rounded-3xl sm:p-8 md:grid-cols-4 md:p-10">
            {heroStats.map((stat, i) => (
              <StatBadge
                key={stat.label}
                value={stat.value}
                label={stat.label}
                icon={stat.icon}
                target={stat.target}
                suffix={stat.suffix}
                delay={0.3 + i * 0.1}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
    </>
  );
}
