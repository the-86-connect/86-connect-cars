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

      {/* Gradient overlay for text readability — stronger on mobile */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/70 via-black/30 to-black/60 lg:from-black/40 lg:via-transparent lg:to-black/30" />

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pt-28 pb-16 sm:px-6 sm:pt-32 sm:pb-28 lg:pt-40 lg:pb-32 lg:ml-12 xl:ml-16">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="flex flex-col items-center text-center lg:items-start lg:text-left"
        >
          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            className="font-display text-4xl font-bold leading-[1.02] tracking-tight text-white sm:text-5xl lg:text-[4.5rem]"
            style={{
              paintOrder: "stroke fill",
              WebkitTextStroke: "1.5px rgba(0,0,0,0.6)",
              textShadow: "0 2px 20px rgba(0,0,0,0.95), 0 0 50px rgba(0,0,0,0.6)",
            }}
          >
            <span
              className="block text-white"
              style={{
                fontSize: "0.55em",
                fontWeight: 600,
                letterSpacing: "0.02em",
                paintOrder: "stroke fill",
                WebkitTextStroke: "1px rgba(0,0,0,0.5)",
              }}
            >
              Source Premium Cars
            </span>
            <span className="mt-2 block">
              From China
              <br />
              <span
                style={{
                  color: "#ff2d2d",
                  paintOrder: "stroke fill",
                  WebkitTextStroke: "1.5px rgba(0,0,0,0.55)",
                  textShadow: "0 2px 20px rgba(0,0,0,0.95), 0 0 30px rgba(255,45,45,0.6)",
                }}
              >
                to the World.
              </span>
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.div variants={fadeUp} className="mt-6 flex items-start gap-4">
            <span className="mt-2 h-12 w-1 shrink-0 rounded-full bg-gradient-to-b from-brand-500 to-brand-700" />
            <p
              className="max-w-md text-base leading-relaxed text-white sm:text-lg"
              style={{
                paintOrder: "stroke fill",
                WebkitTextStroke: "0.5px rgba(0,0,0,0.5)",
                textShadow: "0 2px 12px rgba(0,0,0,0.95), 0 0 30px rgba(0,0,0,0.6)",
              }}
            >
              Affordable prices. Verified suppliers. Worldwide shipping. Professional export service.
            </p>
          </motion.div>

          {/* Buttons */}
          <motion.div variants={fadeUp} className="mt-8 flex flex-wrap justify-center gap-3 sm:gap-4 lg:justify-start">
            <MagneticButton>
              <Button
                variant="primary"
                size="lg"
                className="bg-brand-500 hover:bg-brand-600 shadow-[0_8px_32px_rgba(227,30,36,0.5)] ring-2 ring-white/20"
                onClick={() => scrollToId("contact")}
              >
                Get Free Quote <ArrowRight className="h-4 w-4" />
              </Button>
            </MagneticButton>
            <MagneticButton>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-white/80 bg-black/40 text-white backdrop-blur-md hover:bg-white hover:text-[var(--text-primary)] hover:border-white"
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
    <section className="relative z-10 bg-[var(--bg-primary)] pt-12 pb-8 sm:pt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.6, ease: EASE }}
        >
          <div className="grid grid-cols-2 gap-4 rounded-2xl glass-liquid p-4 shadow-[var(--shadow-soft)] sm:gap-6 sm:rounded-3xl sm:p-8 md:grid-cols-4 md:p-10">
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
