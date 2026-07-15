"use client";

import { motion } from "motion/react";
import {
  Search,
  ShieldCheck,
  FileText,
  Ship,
  Network,
  Globe,
  type LucideIcon,
} from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  slideInLeft,
  slideInRight,
  fadeUp,
  staggerSlow,
  viewportOnce,
} from "@/lib/motion";

const aboutFeatures: {
  icon: LucideIcon;
  title: string;
  description: string;
}[] = [
  {
    icon: Search,
    title: "Smart Sourcing",
    description: "AI-powered matching across thousands of verified listings.",
  },
  {
    icon: ShieldCheck,
    title: "Verified Quality",
    description: "Rigorous 150-point inspection on every vehicle before export.",
  },
  {
    icon: FileText,
    title: "Export Docs",
    description: "Complete export documentation handled end-to-end.",
  },
  {
    icon: Ship,
    title: "Global Shipping",
    description: "RoRo and container shipping to 40+ countries worldwide.",
  },
  {
    icon: Network,
    title: "Supplier Network",
    description: "Direct access to China's most trusted dealers and makers.",
  },
  {
    icon: Globe,
    title: "Worldwide Reach",
    description: "Delivering to every major port across the globe.",
  },
];

export function About() {
  return (
    <section
      id="about"
      className="relative overflow-hidden bg-[var(--bg-secondary)] py-24 lg:py-32"
    >
      <div className="mx-auto max-w-7xl px-6">
        {/* Top: image + text in two columns */}
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Left: visual — taller to match content height */}
          <motion.div
            variants={slideInLeft}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="relative"
          >
            <div className="glass-card relative h-full min-h-[320px] overflow-hidden rounded-3xl sm:min-h-[400px] lg:min-h-[560px]">
              {/* Real port imagery */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/hero/about-port.jpg"
                alt="Aerial view of a major Chinese container shipping port with cargo ships and stacked containers"
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
              />
              {/* Subtle gradient overlay for depth */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/10" />
            </div>
          </motion.div>

          {/* Right: content */}
          <motion.div
            variants={slideInRight}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="flex flex-col justify-center"
          >
            <SectionHeading
              center={false}
              eyebrow="Who We Are"
              title="Your Trusted Partner in Chinese Vehicle Export"
              subtitle="We bridge the gap between China's automotive market and global buyers — combining deep supplier relationships with rigorous quality control and seamless logistics."
            />

            <div className="mt-6 flex flex-col gap-4 text-base leading-relaxed text-[var(--text-secondary)]">
              <p>
                86Connect is a specialist vehicle export company headquartered
                in Shanghai. We source premium cars — from electric vehicles to
                SUVs and sedans — directly from China&apos;s most trusted
                dealerships and manufacturers.
              </p>
              <p>
                Our team handles every step of the journey: sourcing the right
                vehicle, negotiating the best price, conducting a comprehensive
                150-point inspection, preparing all export documentation, and
                arranging reliable shipping to your destination port.
              </p>
            </div>


          </motion.div>
        </div>

        {/* Feature cards — full width below the two-column layout */}
        <motion.div
          variants={staggerSlow}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mt-20 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {aboutFeatures.map(({ icon: Icon, title, description }) => (
            <motion.div
              key={title}
              variants={fadeUp}
              className="glass-card rounded-2xl p-6"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold text-[var(--text-primary)]">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                {description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
