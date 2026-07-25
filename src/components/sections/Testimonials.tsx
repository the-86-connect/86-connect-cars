"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Testimonial } from "@/types";
import { cn } from "@/lib/utils";

function Avatar({ t }: { t: Testimonial }) {
  const [errored, setErrored] = useState(false);
  const initials = t.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (errored || !t.avatar) {
    return (
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-sm font-semibold text-brand-500">
        {initials}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={t.avatar}
      alt={t.name}
      width={48}
      height={48}
      onError={() => setErrored(true)}
      className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-[var(--bg-card)]"
    />
  );
}

function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <div className="glass-card w-[300px] shrink-0 rounded-2xl p-5 sm:w-[380px] sm:rounded-3xl sm:p-6">
      <div className="flex items-center gap-3">
        <Avatar t={t} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-[var(--text-primary)] sm:text-base">{t.name}</p>
          <p className="truncate text-xs text-[var(--text-muted)]">{t.role}</p>
        </div>
        <span className="text-xl leading-none sm:text-2xl" aria-hidden="true">
          {t.flag}
        </span>
      </div>

      <div className="mt-3 flex gap-0.5 sm:mt-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="h-3.5 w-3.5 text-brand-500 sm:h-4 sm:w-4" fill="currentColor" />
        ))}
      </div>

      <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-[var(--text-secondary)] sm:mt-4">
        &ldquo;{t.quote}&rdquo;
      </p>

      <p className="mt-4 text-xs text-[var(--text-muted)] sm:mt-5">{t.country}</p>
    </div>
  );
}

function MarqueeRow({
  items,
  reverse = false,
}: {
  items: Testimonial[];
  reverse?: boolean;
}) {
  return (
    <div className="relative overflow-hidden">
      <div
        className={cn(
          "flex w-max hover:[animation-play-state:paused]",
          reverse ? "animate-marquee-reverse" : "animate-marquee",
        )}
      >
        <div className="flex gap-4 pr-4 sm:gap-6 sm:pr-6">
          {items.map((t) => (
            <TestimonialCard key={t.id} t={t} />
          ))}
        </div>
        {/* Duplicated set for a seamless loop (translateX -50% = one copy width). */}
        <div className="flex gap-4 pr-4 sm:gap-6 sm:pr-6" aria-hidden="true">
          {items.map((t) => (
            <TestimonialCard key={`${t.id}-dup`} t={t} />
          ))}
        </div>
      </div>

      {/* Edge fade masks matching the section background. */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[var(--bg-primary)] to-transparent sm:w-24" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[var(--bg-primary)] to-transparent sm:w-24" />
    </div>
  );
}

export function Testimonials({ items, enabled = true }: { items: Testimonial[]; enabled?: boolean }) {
  if (!enabled || items.length === 0) return null;

  const half = Math.ceil(items.length / 2);
  const rowOne = items.slice(0, half);

  return (
    <section id="testimonials" className="bg-[var(--bg-primary)] py-12 sm:pt-12 sm:pb-20 lg:pt-16 lg:pb-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Testimonials"
          title="Trusted Worldwide"
          subtitle="Real stories from buyers across 40+ countries who chose 86Connect for their vehicle export needs."
        />
      </div>

      <div className="mt-8 flex flex-col gap-4 sm:mt-16 sm:gap-6">
        <MarqueeRow items={rowOne} />
      </div>
    </section>
  );
}
