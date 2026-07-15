# 86Connect — Premium Luxury Landing Website (Frontend + Design)

## Summary

Build a premium, luxury landing website for **86Connect**, a company that sources and exports vehicles from China to customers worldwide. The site must feel like Apple, Tesla, Rivian, Porsche, Linear, Stripe, Nothing, and Mercedes-Benz — minimal, expensive, trustworthy. **Frontend and design only** in this phase; Supabase/PostgreSQL backend logic comes later.

The design uses a white/cream surface foundation (adapted from the Claude design library's neutral token structure), brand red `#E31E24` as the single accent, glassmorphism / liquid glass surfaces, 24–32px radii, generous whitespace, and Framer Motion throughout. A cinematic hero features the uploaded BYD Seal PNG with CSS/Framer 3D float-rotate-tilt effects plus an R3F particle layer. Ponytail's lean-coding ruleset is adopted project-wide to keep code minimal.

Tech stack: Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · `motion` (Framer Motion) · React Three Fiber + Three.js · GSAP (world-map only) · React Hook Form + Zod · Lucide Icons · Supabase (scaffold only).

---

## Current State Analysis

- **Workspace** `d:\86Connect Cars` is greenfield — contains only an empty `.uploads` folder. No Next.js project exists; full scaffolding is required.
- **Uploaded assets**: A BYD Seal car PNG (transparent background) intended as the 3D hero car, and a mockup image showing the target red/white/black layout (desktop + mobile) with sections Hero, How It Works, Featured Cars, Why Choose Us, Testimonials, Footer, and a mobile quote form.
- **Reference Design Library**: Claude (`dl_builtin_claude`) — provides a token structure (warm neutrals, spacing rhythm, soft shadows, serif/sans pairing). Its terra-cotta accent `#C96442` is replaced with brand red `#E31E24`; its paper-like surfaces are retained and layered with glassmorphism per the 86Connect design system.
- **Ponytail** (`github.com/DietrichGebert/ponytail`): a coding-ruleset plugin (not a context manager). Its `AGENTS.md` defines a 7-rung "lazy senior dev" ladder — YAGNI, reuse-in-codebase, stdlib, native-platform, installed-dependency, one-liner, minimum-that-works — without ever cutting validation, security, or accessibility. Adopted as the project's governing rule file.
- **Skills in scope**: `solo-design` (canvas delivery + validation), `frontend-design` (distinctive production-grade UI, avoid generic AI slop), `gral-frontend-design` (typography/layout/color/animation/responsive commands), `ui-ux-pro-max` (UI/UX intelligence), `frontend-skill` (visually strong landing page).
- **Key technical facts** (researched): Tailwind v4 is CSS-first (`@import "tailwindcss"` + `@theme {}`, no `tailwind.config.js`); the Framer Motion library is now published as `motion` (import from `motion/react`); R3F `<Canvas>` must be client-only in Next 15 via `next/dynamic({ ssr: false })` inside a `"use client"` wrapper.

---

## Proposed Changes

### 1. Project Scaffolding

Scaffold a Next.js 15 App Router project with TypeScript, Tailwind v4, ESLint, `src/` dir, Turbopack, and `@/*` import alias. Then install runtime deps: `motion`, `@react-three/fiber`, `@react-three/drei`, `three`, `react-hook-form`, `@hookform/resolvers`, `zod`, `lucide-react`, `clsx`, `tailwind-merge`, `@supabase/supabase-js`, `@supabase/ssr`, `gsap`; plus `@types/three` as dev dep. Copy the uploaded BYD Seal PNG to `public/cars/byd-seal.png`. Add `.env.local` / `.env.example` with placeholder Supabase vars. Clone Ponytail and copy its `AGENTS.md` to project root.

### 2. Full File / Folder Structure

```
d:\86Connect Cars\
├── AGENTS.md                       # Ponytail ruleset (universal rule file)
├── .env.local / .env.example       # NEXT_PUBLIC_SUPABASE_* placeholders
├── next.config.ts, tsconfig.json, postcss.config.mjs, package.json
├── public/
│   ├── cars/byd-seal.png           # hero car (from .uploads)
│   ├── hero/shanghai-skyline.jpg   # cinematic bg
│   ├── vehicles/*.webp             # featured vehicle images
│   └── og-image.png, favicon.ico
└── src/
    ├── app/
    │   ├── layout.tsx              # fonts, metadata, Navbar, Footer shell
    │   ├── page.tsx                # composes 11 sections in order
    │   ├── globals.css             # @import tailwindcss + @theme tokens + base
    │   └── api/                    # reserved for later backend
    ├── components/
    │   ├── layout/   Navbar.tsx, Footer.tsx, PageShell.tsx
    │   ├── sections/ Hero, About, HowItWorks, FeaturedVehicles, WhyChooseUs, GlobalShipping, Testimonials, FAQ, Contact
    │   ├── ui/       Button, MagneticButton, GlassCard, SectionHeading, Badge, Accordion, StatBadge, WorldMap
    │   ├── three/    Hero3D (dynamic ssr:false wrapper), ParticleField (R3F Canvas)
    │   ├── hero/     HeroCar (PNG + motion 3D float/rotate/tilt), HeroBackground (cinematic bg + parallax + fog)
    │   └── forms/    QuoteForm (RHF + Zod), schema.ts
    ├── lib/
    │   ├── supabase/ client.ts, server.ts   # scaffold only, no calls
    │   ├── motion.ts                        # shared variants + easings
    │   ├── data.ts                          # mock vehicles/testimonials/faqs/steps
    │   └── utils.ts                         # cn() = clsx + tailwind-merge
    ├── hooks/  useScrollReveal, useMousePosition, useMediaQuery, useReducedMotion
    └── types/  index.ts (Vehicle, Testimonial, FAQItem, Step)
```

### 3. Design Tokens (`src/app/globals.css`)

Tailwind v4 `@theme` block. Brand red scale (`--color-brand-50` → `--color-brand-900`, with `--color-brand-500: #E31E24`), ink neutrals (`#0A0A0A` text, `#FAFAF9` warm cream surface, `#F4F4F2` light-gray section bands), 24–32px radii, soft/float/glass shadow tokens, premium cubic-bezier easings, float + gradient-shift keyframes. Base layer sets `color-scheme: light` (no dark mode), smooth scroll, brand-red text selection. Component layer defines `.glass` primitive (rgba white + `backdrop-filter: blur(20px) saturate(160%)` + inset highlight). Fonts wired from `next/font/google` (Sora display + Inter body) exposed as CSS vars consumed by `@theme`.

### 4. Component Breakdown — 11 Sections

**Navbar** (`"use client"`): transparent over hero → `.glass` after `scrollY > 24` via Framer `useScroll`/`useMotionValueEvent`. Logo "86Connect" wordmark with red dot accent. Links: Home / Inventory / How It Works / Why Us / FAQ / Contact (anchor scroll). CTA "Get Quote" = MagneticButton. Mobile: hamburger → slide-up glass sheet via `AnimatePresence`.

**Hero** (full viewport): layered — `HeroBackground` (cinematic Shanghai skyline/port image + animated gradient mesh + fog gradient, parallax on scroll) → `Hero3D` particle field (R3F) → `HeroCar` (BYD Seal PNG with 3D float/rotate/tilt + mouse-tilt + breathing scale + moving soft shadow) → content (headline "Source Premium Cars From China to the World", subtitle, buttons "Get Free Quote" + "Browse Vehicles", 4 floating `StatBadge`s: 2000+ Cars / 40+ Countries / 24/7 Support / 100% Transparent, staggered float).

**About**: two-column — large media on one side; narrative + 4–6 glass icon cards (Lucide: Search, ShieldCheck, FileText, Ship, Network, Globe) on the other. Covers who we are, sourcing, supplier network, inspection, export docs, logistics. Hover scale + icon micro-animation.

**How It Works**: horizontal timeline on `lg+` (6 numbered glass nodes connected by a gradient line that fills on scroll via `useScroll` `scaleX`), vertical stack on mobile. Steps: Tell Us → Source → Quotation → Inspection → Shipping → Delivered. `whileInView` stagger reveal.

**Featured Vehicles**: filter bar (Brand / Price / Electric / SUV / Sedan / Hybrid) filtering mock data in `lib/data.ts`. Grid of `VehicleCard`s: image, brand, model, year, price, fuel, transmission, "Request Quote" button. Hover: card lifts (`y: -8`), glass overlay with quick-spec summary fades in, image subtle zoom.

**Why Choose Us**: premium glass cards (3–4 across desktop) with animated Lucide icons (draw-on or pulse on inView). Points: Verified Suppliers, 150-Point Inspection, End-to-End Logistics, Transparent Pricing, 24/7 Support, Global Compliance.

**Global Shipping**: `WorldMap` — simplified SVG world (light-gray landmasses) with China highlighted in brand red. Curved SVG path routes to Bangladesh, Japan, Australia, Africa, Middle East, Europe. **GSAP `MotionPathPlugin` animates ship dots along the routes** (the single place GSAP is used, where Framer is weaker). Pulsing destination markers + region legend.

**Testimonials**: auto-scrolling marquee of glass cards (two rows, opposite directions, pause on hover). Each card: country flag, photo, 5-star rating, quote, name. Infinite loop via duplicated content + CSS `@keyframes` marquee (native, per Ponytail rung 4).

**FAQ**: `Accordion` items with smooth height auto animation (`AnimatePresence` + `motion.div` height/opacity) and chevron rotate. 6–8 Q&As on sourcing, payment, shipping time, inspection, warranty, customs.

**Contact**: large glass form — Name / WhatsApp / Email / Country / Vehicle Brand / Model / Budget / Message / Upload Reference Image / Submit. `react-hook-form` + `zodResolver`; client-side validation only; on submit → optimistic success state (no backend call — `// TODO: supabase.from("quotes").insert(payload)`). File upload via native `<input type="file" accept="image/*">` (rung 4) with glass drop-zone styling + `URL.createObjectURL` preview. Mobile: floating "Get Quote" button opens slide-up glass sheet reusing `QuoteForm`.

**Footer**: logo + tagline, nav columns (Company / Services / Resources / Legal), socials (Lucide icons), contact (email / WhatsApp / address), copyright. Subtle top hairline.

### 5. Animation Strategy (Framer Motion throughout)

Centralized in `src/lib/motion.ts`: `fadeUp` (opacity+y+blur), `stagger` (staggerChildren 0.08), `scaleIn`, `slideIn`, `blurReveal` variants with premium `cubic-bezier(0.16, 1, 0.3, 1)` easing. Scroll reveals via `whileInView="show"` + `viewport={{ once: true, margin: "-80px" }}`. Parallax via `useScroll`/`useTransform` on hero bg + section images. Magnetic buttons via `useMousePosition` → spring `x/y`. Mouse-follow glow: fixed radial-gradient div translated to cursor (brand-red tint, low opacity), hidden on coarse pointers. Floating objects use infinite `animate` loops. `useReducedMotion()` gates all infinite/parallax animations — non-negotiable accessibility.

### 6. 3D Hero Implementation

Layered hybrid (the uploaded asset is a 2D PNG, not a 3D model):
1. `HeroBackground` — cinematic image (low opacity) + animated gradient mesh + fog gradient overlay; parallax on scroll.
2. `Hero3D` → `ParticleField` (R3F) — `<Canvas>` with ~250 points (BufferGeometry, additive blending, slow drift, brand-red/white tint, `dpr={[1,2]}`). Client-only via `dynamic(() => import("./ParticleField"), { ssr: false })` inside `"use client"` wrapper. Pauses when offscreen.
3. `HeroCar` — PNG in `motion.div` with `perspective: 1200px` + `preserve-3d`. Infinite float `y:[0,-18,0]` (6s), rotation oscillation `rotateY:[-6,6,-6]` (8s), mouse-tilt `rotateX/rotateY` ±8° (spring), breathing `scale:[1,1.02,1]`, soft drop-shadow that moves with float.
4. Content + `StatBadge`s on top.
Guards: R3F client-only (no SSR `window` error), trivial geometry (points only, capped count), reduced-motion static fallback, lazy-load hero + below-fold sections via `next/dynamic` to protect LCP.

### 7. Responsive Strategy (mobile-first)

Breakpoints: Tailwind defaults (sm 640 / md 768 / lg 1024 / xl 1280 / 2xl 1536). Hero full-viewport desktop, ~85vh mobile; car scales via `clamp()`; stats reflow 2x2 grid on mobile, floating on desktop. Navbar full links at `lg+`, hamburger sheet below. Timeline vertical mobile, horizontal `lg+`. Vehicle grid 1→2→3 cols. Contact form single-column mobile, 2-col desktop; mobile floating "Get Quote" → slide-up sheet. World map simplified on mobile, routes still animate. Section padding via `clamp()`/responsive `py-*` for whitespace. Mouse-follow glow + magnetic effects disabled on coarse pointers.

### 8. Supabase Scaffold (frontend-only, ready for later)

No logic — just client factories + env. `lib/supabase/client.ts` (`createBrowserClient`) and `lib/supabase/server.ts` (`createServerClient` via `cookies()`). `QuoteForm` submit handler calls `console.info(payload)` + success state; single `// TODO: supabase.from("quotes").insert(payload)` marker is the only later change.

### 9. Ponytail Integration

Clone `github.com/DietrichGebert/ponytail` to scratch dir, copy `AGENTS.md` to `d:\86Connect Cars\AGENTS.md`. Adopt the 7-rung ladder as governing rule: prefer CSS/Tailwind over JS (marquee via CSS keyframes); reuse one `GlassCard`/`Button`/`SectionHeading` everywhere; use native `<input type="file">` + `URL.createObjectURL`; don't abstract until a second use case appears; GSAP used in one place only; never cut Zod validation, reduced-motion accessibility, R3F SSR safety, or env handling.

---

## Assumptions & Decisions

- **`motion` package, not legacy `framer-motion`**: current name, best React 19 / Next 15 support, import from `motion/react`.
- **GSAP scoped to one feature**: installed per the user's stack but used only for SVG `MotionPathPlugin` ship animation on the world map, where Framer is genuinely weaker — honoring Ponytail's dependency-minimalism.
- **PNG-as-3D car via Framer + CSS transforms + R3F particles**: avoids the cost/complexity of sourcing a real 3D car model while still delivering the "rotating luxury car + particles" cinematic hero.
- **CSS-first Tailwind v4 tokens in `@theme`**: no `tailwind.config.js`; brand red scale, ink neutrals, glass radii, premium shadows/easings all live in `globals.css` — single source of truth.
- **Claude token structure adapted, not copied**: keeps the warm-neutral surface foundation and spacing rhythm; swaps terra-cotta → `#E31E24`; layers glassmorphism on top per the 86Connect design system.
- **No backend logic this phase**: Supabase client/server factories scaffolded with placeholder env; form submissions are client-only optimistic success. Database schema (Cars, Requests, Testimonials, FAQ, Admins) and admin dashboard are deferred to the backend phase.
- **Frontend-only deliverable**: This is a real Next.js codebase in the workspace (not a `.design` canvas project), per the user's explicit tech-stack requirements.

---

## Verification Steps

1. **Dev render**: `npm run dev` → `http://localhost:3000` shows all 11 sections in order with working scroll-anchor nav.
2. **SSR safety**: no `window is not defined` / `self is not defined` errors; R3F `<Canvas>` mounts client-only via dynamic import.
3. **Production build**: `npm run build` passes with zero TypeScript errors; `npm start` serves correctly.
4. **Core Web Vitals**: LCP < 2.5s (hero image + car), CLS < 0.1 (reserve space for fonts/images), responsive INP; optimize hero PNG (WebP/AVIF fallback if large).
5. **Reduced motion**: enable OS "reduce motion"; verify float/particles/marquee/parallax stop and render static.
6. **Responsive sweep**: test 375px / 768px / 1024px / 1440px / 1920px — navbar sheet, timeline orientation, vehicle grid columns, contact form layout, mobile floating "Get Quote" sheet.
7. **Form validation**: empty submit → Zod errors per field; valid submit → success state; file upload shows preview; no network call fires.
8. **Supabase scaffold**: importing `lib/supabase/client` does not throw with placeholder env; no unintended DB/auth calls in the bundle.
9. **Ponytail conformance**: review each component against the 7-rung ladder — no unused deps, no premature abstractions, no duplicate primitives.
10. **Design QA**: confirm white/cream surfaces, `#E31E24` accent only (no stray terra-cotta), glassmorphism on cards/navbar/stats/form, 24–32px radii, generous whitespace, premium type hierarchy, no dark mode anywhere.
