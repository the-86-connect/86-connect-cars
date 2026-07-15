"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { testimonials } from "@/lib/data";
import type { Testimonial } from "@/types";
import { cn } from "@/lib/utils";

/** Split testimonials into two halves for the opposite-direction rows. */
const half = Math.ceil(testimonials.length / 2);
const rowOne = testimonials.slice(0, half);
const rowTwo = testimonials.slice(half);

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
    <div className="glass-card w-[380px] shrink-0 rounded-3xl p-6">
      <div className="flex items-center gap-3">
        <Avatar t={t} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-[var(--text-primary)]">{t.name}</p>
          <p className="truncate text-xs text-[var(--text-muted)]">{t.role}</p>
        </div>
        <span className="text-2xl leading-none" aria-hidden="true">
          {t.flag}
        </span>
      </div>

      <div className="mt-4 flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="h-4 w-4 text-brand-500" fill="currentColor" />
        ))}
      </div>

      <p className="mt-4 line-clamp-4 text-sm leading-relaxed text-[var(--text-secondary)]">
        &ldquo;{t.quote}&rdquo;
      </p>

      <p className="mt-5 text-xs text-[var(--text-muted)]">{t.country}</p>
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
        <div className="flex gap-6 pr-6">
          {items.map((t) => (
            <TestimonialCard key={t.id} t={t} />
          ))}
        </div>
        {/* Duplicated set for a seamless loop (translateX -50% = one copy width). */}
        <div className="flex gap-6 pr-6" aria-hidden="true">
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

export function Testimonials() {
  return (
    <section id="testimonials" className="bg-[var(--bg-primary)] pt-12 pb-24 lg:pt-16 lg:pb-32">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          eyebrow="Testimonials"
          title="Trusted Worldwide"
          subtitle="Real stories from buyers across 40+ countries who chose 86Connect for their vehicle export needs."
        />
      </div>

      <div className="mt-16 flex flex-col gap-6">
        <MarqueeRow items={rowOne} />
      </div>
    </section>
  );
}
