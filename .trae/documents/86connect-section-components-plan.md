# 86Connect Section Components - Implementation Plan

## Summary

Create 4 production-grade React components for the 86Connect luxury car-export website: `FeaturedVehicles.tsx` (filterable vehicle grid), `WhyChooseUs.tsx` (glass feature cards), `WorldMap.tsx` (animated SVG world map), and `GlobalShipping.tsx` (map + destination list layout). All components follow the established Apple/Tesla/Rivian aesthetic with glassmorphism, motion animations, and the brand's red accent (#E31E24).

## Current State Analysis

### Verified Contracts

**Types** (`src/types/index.ts`):
- `Vehicle`: `{ id, brand, model, year, price, fuel: FuelType, bodyType: BodyType, transmission: Transmission, image: string, badge?: string, range?: string, engine?: string }`
- `FuelType = "Electric" | "Hybrid" | "Petrol" | "Diesel"`
- `BodyType = "Sedan" | "SUV" | "Coupe" | "Hatchback"`
- `Feature`: `{ id, title, description, icon: string }`

**Data** (`src/lib/data.ts`):
- `vehicles`: 6 cars. Only `byd-seal` has real image at `/cars/byd-seal.png` (confirmed exists in `public/cars/`). Others use `/vehicles/*.jpg` (do NOT exist).
- `features`: 6 items. Icons: `BadgeCheck`, `ShieldCheck`, `Ship`, `ReceiptText`, `Headphones`, `Globe2`.
- `shippingRoutes`: 6 destinations with percentage coords. Max y=75 (Australia), max x=85 (Japan).
  - Bangladesh (72,48), Japan (85,38), Australia (82,75), Africa (48,58), Middle East (58,48), Europe (48,28)

**Motion** (`src/lib/motion.ts`):
- `EASE = [0.16, 1, 0.3, 1] as const` (readonly tuple - safe in Variants, also confirmed safe in inline transitions per existing `About.tsx` line 103)
- `fadeUp`: hidden={opacity:0,y:24,filter:"blur(8px)"} / show={opacity:1,y:0,filter:"blur(0px)",transition:{duration:0.7,ease:EASE}}
- `stagger`: { staggerChildren: 0.08, delayChildren: 0.05 }
- `viewportOnce`: { once: true, margin: "-80px" }

**Utils** (`src/lib/utils.ts`):
- `cn(...inputs)`: clsx + tailwind-merge
- `formatPrice(value)`: USD currency, 0 fraction digits
- `scrollToId(id)`: smooth scroll with 80px offset

**UI Components**:
- `Button`: forwardRef motion.button. Variants: primary/ghost/outline. Sizes: sm(px-5 py-2.5)/md/lg. Has whileHover scale 1.03, whileTap 0.97. Spreads `...props`.
- `GlassCard`: forwardRef motion.div. Props: hover?, strong?, delay?, children, ...props. **Self-animating**: `variants={fadeUp} initial="hidden" whileInView="show" viewport={viewportOnce} transition={{delay}}`. whileHover y:-8 when hover=true. Spreads `...props` (layout/exit pass through).
- `SectionHeading`: Props: eyebrow?, title, subtitle?, center?=true. Self-animating with stagger+fadeUp+whileInView.
- `Badge`: Props: children, variant?("default"|"brand"|"glass"), className. Has gap-1.5, rounded-full, px-3 py-1. No "use client" (works in both server/client).

**globals.css**:
- `--animate-pulse-ring: pulse-ring 2.5s var(--ease-out-soft) infinite` with keyframes: 0%{scale(0.8),opacity:0.8} 80%,100%{scale(2.2),opacity:0}
- `.glass`: rgba(255,255,255,0.55) backdrop-blur(20px) border rgba(255,255,255,0.6)
- `.glass-strong`: rgba(255,255,255,0.72) backdrop-blur(28px)
- `.text-gradient-brand`: linear-gradient brand-500→700, clip-text, fill-color transparent
- Reduced-motion media query disables infinite animations

**Existing patterns** (from `HowItWorks.tsx`, `About.tsx`):
- Icon mapping: `const iconMap: Record<string, LucideIcon> = { ... }` then `const Icon = iconMap[step.icon] ?? FallbackIcon`
- Section structure: `<section id="..." className="relative bg-surface py-24 lg:py-32">` with `<div className="mx-auto max-w-7xl px-6">`
- Parent stagger: `variants={stagger} initial="hidden" whileInView="show" viewport={viewportOnce}`, children with `variants={fadeUp}` (no initial/whileInView on children - they inherit)
- `About.tsx` uses plain `motion.div` with `className="glass rounded-2xl"` instead of GlassCard for some cards
- `About.tsx` line 103: `transition={{ duration: 6, repeat: Infinity, ease: EASE }}` confirms EASE works in inline transitions

**lucide-react v1.24.0**:
- Confirmed exports: `BadgeCheck`, `ShieldCheck`, `Ship`, `ReceiptText`, `Headphones`, `Globe`, `Car`, `Zap`, `Gauge`, `type LucideIcon`
- **`Globe2` is NOT exported** (only `Globe`). Must map data key `"Globe2"` to `Globe` component.
- `Globe`, `Network` confirmed used in existing `About.tsx`

## Proposed Changes

### File 1: `src/components/sections/FeaturedVehicles.tsx`

**What**: Premium vehicle showcase with filterable glass cards.

**Why**: Core inventory display section. Must support category filtering with smooth animations.

**How**:

Imports: `useState`, `useMemo` from react; `AnimatePresence`, `motion` from `motion/react`; `Gauge`, `Zap` from lucide-react; `SectionHeading`, `Button`, `Badge` from UI; `vehicles` from data; `fadeUp`, `viewportOnce` from motion; `cn`, `formatPrice`, `scrollToId` from utils; `Vehicle` type.

Filter system:
- `FilterKey = "All" | "Electric" | "Hybrid" | "SUV" | "Sedan"`
- `FILTERS` array: `[{key, label}]` for each filter
- `useState<FilterKey>("All")` for active filter
- `useMemo` to filter: "All" returns all; "Electric"/"Hybrid" filters by `fuel`; "SUV"/"Sedan" filters by `bodyType`
- Filter results: All=6, Electric=2, Hybrid=1, SUV=3, Sedan=3

VehicleCard component (inner):
- **NOT using GlassCard** (to avoid whileInView conflict with AnimatePresence exit). Instead uses plain `motion.div` with `glass` class, mirroring the pattern in `About.tsx`.
- Outer `motion.div`: `layout` + `variants={fadeUp}` + `initial="hidden"` + `whileInView="show"` + `viewport={viewportOnce}` + `exit={{opacity:0, scale:0.92, filter:"blur(4px)", transition:{duration:0.3, ease:[0.16,1,0.3,1]}}}` + `transition={{delay: Math.min(index*0.06, 0.3)}}`
- Inner `motion.div`: `whileHover={{y:-8}}` + `transition={{type:"spring", stiffness:400, damping:25}}` + `className="group glass rounded-3xl overflow-hidden transition-shadow duration-300 hover:shadow-[var(--shadow-float)]"`
- Image area: `h-52` div, `overflow-hidden`. Check `vehicle.image.startsWith("/cars/")`:
  - If true: `<img src={vehicle.image} alt={...} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />`
  - If false: gradient placeholder div with `brandGradient[vehicle.brand]` (per-brand dark gradient map) + brand name as large `text-white/20` text
- Hover overlay: `absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100`
- Badge: absolute top-right, `badgeStyles[vehicle.badge]` map (New=emerald, Popular=brand-500, Premium=ink). Uses custom span (not Badge component) for backdrop-blur styling.
- Card body (`p-6`):
  - Brand: `text-sm font-semibold uppercase tracking-wide text-brand-500`
  - Model: `font-display text-xl font-bold text-ink`
  - Year/Fuel/Transmission: `text-xs text-muted` with bullet separators
  - Spec row (if range or engine): glass info row with `Zap` icon for range, `Gauge` icon for engine
  - Price + CTA row: `formatPrice(vehicle.price)` as `font-display text-2xl font-bold` + `Button variant="outline" size="sm"` with `onClick={() => scrollToId("contact")}`

FeaturedVehicles component (outer):
- `<section id="inventory" className="relative bg-surface-2 py-24 lg:py-32">`
- Ambient glow: `pointer-events-none absolute left-1/2 top-0 h-64 w-[600px] -translate-x-1/2 rounded-full bg-brand-500/5 blur-3xl`
- `<div className="mx-auto max-w-7xl px-6">`
- `SectionHeading` with eyebrow="Inventory", title="Featured Vehicles", subtitle="Hand-picked vehicles from China's top manufacturers. Every car inspected, verified, and ready for export."
- Filter bar: `glass` container, `flex gap-2 overflow-x-auto rounded-full p-2`, hidden scrollbar via `[scrollbar-width:none] [&::-webkit-scrollbar]:hidden`. Each filter button: `shrink-0 rounded-full px-5 py-2 text-sm font-medium transition-all duration-300`. Active: `bg-brand-500 text-white shadow-[var(--shadow-brand-glow)]`. Inactive: `text-muted hover:text-ink`.
- Vehicle grid: `motion.div` with `layout`, `className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"`. Contains `<AnimatePresence mode="popLayout">` wrapping filtered VehicleCards.

### File 2: `src/components/sections/WhyChooseUs.tsx`

**What**: Premium glass feature cards with animated Lucide icons.

**Why**: Highlights the company's competitive advantages.

**How**:

Imports: `motion` from `motion/react`; `BadgeCheck`, `ShieldCheck`, `Ship`, `ReceiptText`, `Headphones`, `Globe`, `type LucideIcon` from lucide-react; `SectionHeading`, `GlassCard` from UI; `features` from data.

Icon map:
```typescript
const iconMap: Record<string, LucideIcon> = {
  BadgeCheck, ShieldCheck, Ship, ReceiptText, Headphones,
  Globe2: Globe,  // Globe2 not exported in lucide-react v1.24.0, use Globe
};
```

Structure:
- `<section id="why-us" className="relative bg-surface py-24 lg:py-32">`
- Ambient glow: `pointer-events-none absolute right-0 top-1/4 h-72 w-96 rounded-full bg-brand-500/5 blur-3xl`
- `SectionHeading` with eyebrow="Why 86Connect", title="Why Choose Us", subtitle="We combine deep Chinese market expertise with global logistics mastery to deliver an unmatched export experience."
- Grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`
- Each card: `<GlassCard hover delay={i * 0.08} className="group relative overflow-hidden p-7">`
  - Accent line: `absolute bottom-0 left-0 h-[3px] w-full origin-left scale-x-0 bg-gradient-to-r from-brand-500 to-brand-700 transition-transform duration-500 group-hover:scale-x-100`
  - Icon: `<motion.div whileHover={{ scale: 1.12, rotate: -4 }} transition={{ type: "spring", stiffness: 400, damping: 17 }} className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-500">` with `<Icon className="h-7 w-7" />`
  - Title: `font-display text-lg font-bold text-ink`
  - Description: `text-sm leading-relaxed text-muted`
- GlassCard's `delay` prop creates stagger effect (since GlassCard is self-animating with whileInView, delay is the mechanism for stagger).

### File 3: `src/components/ui/WorldMap.tsx`

**What**: Interactive SVG world map with animated shipping routes from China.

**Why**: Premium visual centerpiece showing global reach. Key differentiator for the shipping section.

**How**:

Imports: `type CSSProperties` from react; `shippingRoutes` from data.

Constants:
- `CHINA = { x: 75, y: 40 }`
- `CONTINENTS`: array of 5 simplified SVG path strings (Eurasia, Africa, Australia, North America, South America) - stylized shapes, not geographically accurate
- `pulseStyle: CSSProperties = { transformBox: "fill-box", transformOrigin: "center" }` - enables CSS scale animations on SVG circles

`buildRoute(from, to)` function:
- Calculates midpoint, distance, and bulge (min(dist*0.3, 12))
- Returns quadratic bezier: `M from.x from.y Q midX (midY - bulge) to.x to.y`
- All routes arc upward (negative Y in SVG = north)

SVG structure (viewBox="0 0 100 80" to fit Australia at y:75):
- `<defs>`:
  - `<pattern id="dotgrid">`: 2.5x2.5 grid with 0.3r circles, fill #e7e5e0 (ocean dot texture)
  - `<radialGradient id="hubGlow">`: brand-500 0.3 opacity → transparent (China hub glow)
  - `<filter id="glow">`: feGaussianBlur stdDeviation=0.4 + feMerge (glow effect for dots)
- Ocean: `<rect width="100" height="80" fill="url(#dotgrid)" />`
- Continents: `<g fill="#e7e5e0" opacity="0.85">` with 5 `<path>` elements
- China hub glow: `<circle cx="75" cy="40" r="8" fill="url(#hubGlow)" />`
- Routes (map over shippingRoutes):
  - Base path: `<path id={`route-path-${i}`} d={routePath} fill="none" stroke="#e31e24" strokeWidth="0.4" opacity="0.15" />` (has ID for mpath reference)
  - Flowing dashed path: same `d`, `strokeDasharray="1.5 1.5"`, `opacity="0.5"`, with `<animate attributeName="stroke-dashoffset" from="3" to="0" dur="2s" repeatCount="indefinite" />`
  - Ship dot: `<circle r="0.9" fill="#e31e24" filter="url(#glow)">` with `<animateMotion dur={`${3 + i * 0.5}s`} repeatCount="indefinite">` containing `<mpath href={`#route-path-${i}`} />`
  - Destination pulse ring: `<circle cx={dest.x} cy={dest.y} r="2" fill="none" stroke="#e31e24" strokeWidth="0.3" className="animate-pulse-ring" style={pulseStyle} />`
  - Destination dot: `<circle cx={dest.x} cy={dest.y} r="0.9" fill="#e31e24" filter="url(#glow)" />`
  - Flag label: `<text x={dest.x} y={dest.y - 3} fontSize="2.5" textAnchor="middle">{dest.flag}</text>`
  - Country name: `<text x={dest.x} y={dest.y + 4.5} fontSize="1.6" textAnchor="middle" fill="#6b6b6b" fontWeight="500">{dest.country}</text>`
- China hub (rendered last, on top):
  - Pulse ring: `<circle cx="75" cy="40" r="3" fill="none" stroke="#e31e24" strokeWidth="0.4" className="animate-pulse-ring" style={pulseStyle} />`
  - Main dot: `<circle cx="75" cy="40" r="1.4" fill="#e31e24" filter="url(#glow)" />`
  - Inner white dot: `<circle cx="75" cy="40" r="0.6" fill="white" />`
  - Flag: `<text x="75" y="34.5" fontSize="2.5" textAnchor="middle">🇨🇳</text>` (above dot to avoid Bangladesh collision)
  - Label: `<text x="75" y="37" fontSize="1.8" textAnchor="middle" fill="#0a0a0a" fontWeight="700">China</text>` (above dot)

SVG animation approach: Native SVG `<animateMotion>` + `<mpath>` (no JS/GSAP needed). The `href` attribute on `<mpath>` is supported in all modern browsers and is properly typed in React 19. Ship dots travel along routes at staggered speeds (3s + i*0.5s).

Responsive: `className="h-auto w-full"` on the SVG element.

### File 4: `src/components/sections/GlobalShipping.tsx`

**What**: Two-column layout with WorldMap and destination list.

**Why**: Wraps the WorldMap in a premium section with supporting destination information.

**How**:

Imports: `motion` from `motion/react`; `SectionHeading`, `Badge` from UI; `WorldMap` from `@/components/ui/WorldMap`; `shippingRoutes` from data; `fadeUp`, `stagger`, `viewportOnce` from motion.

Structure:
- `<section id="shipping" className="relative bg-surface-3 py-24 lg:py-32">`
- Ambient glow: `pointer-events-none absolute left-0 top-1/3 h-72 w-96 rounded-full bg-brand-500/5 blur-3xl`
- `SectionHeading` with eyebrow="Global Reach", title="Worldwide Shipping", subtitle="From Shanghai to your nearest port — we deliver to 40+ countries with real-time tracking and full customs support."
- Outer stagger container: `<motion.div variants={stagger} initial="hidden" whileInView="show" viewport={viewportOnce} className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-5">`
  - Left column (lg:col-span-3): `<motion.div variants={fadeUp}>` containing `<div className="glass-strong rounded-3xl p-6 sm:p-8"><WorldMap /></div>`
  - Right column (lg:col-span-2): `<motion.div variants={fadeUp}>` containing inner stagger:
    - Inner stagger: `<motion.div variants={stagger} className="flex flex-col gap-4">`
      - Stat card: `<motion.div variants={fadeUp} className="glass-strong rounded-3xl p-6">` with `<p className="font-display text-5xl font-bold text-gradient-brand">40+</p>` and `<p className="mt-1 text-sm text-muted">Countries Served</p>`
      - Destination items (map over shippingRoutes): `<motion.div variants={fadeUp} className="glass flex items-center justify-between rounded-2xl px-5 py-4">`
        - Left: flag emoji (`text-2xl`) + country name (`font-display text-base font-semibold text-ink`)
        - Right: `<Badge variant="glass" className="text-emerald-600">` with pulsing green dot (animate-ping) + "Active route" text

Nested stagger: The outer stagger animates left+right columns in sequence. The right column's `fadeUp` variant receives "show" and propagates it to the inner stagger, which staggers the stat card + destination items. Children do NOT have their own `initial`/`whileInView` — they inherit from the parent chain.

## Assumptions & Decisions

1. **Globe2 → Globe mapping**: `lucide-react` v1.24.0 does not export `Globe2`. The `iconMap` maps the data key `"Globe2"` to the `Globe` component. This is safe and visually equivalent.

2. **FeaturedVehicles uses plain motion.div (not GlassCard)**: GlassCard hardcodes `whileInView`/`initial`/`variants`, which conflicts with `AnimatePresence` exit animations. Using plain `motion.div` with `glass` class (mirroring `About.tsx` pattern) gives full control over `layout`, `exit`, `variants`, `initial`, and `whileInView`.

3. **SVG viewBox "0 0 100 80"** (not "0 0 100 60"): Australia's y=75 exceeds the spec-suggested 60 height. Using 80 ensures all destinations fit.

4. **SVG animateMotion + mpath** (not GSAP, not CSS offset-path): Native SVG animation is the simplest, most reliable approach. No JS needed. `<mpath href="...">` is properly typed in React 19 and supported in all modern browsers.

5. **Pulse ring on SVG circles**: The `animate-pulse-ring` CSS class from globals.css works on SVG elements when combined with inline style `{ transformBox: "fill-box", transformOrigin: "center" }`. This ensures the `transform: scale()` is relative to the circle's center, not the SVG canvas origin.

6. **China labels placed above the dot** (y=34.5 and y=37, dot at y=40): Bangladesh is at (72,48), close to China. Placing China's labels above prevents collision.

7. **WhyChooseUs uses GlassCard with delay prop**: GlassCard is self-animating (whileInView). Using `delay={i * 0.08}` creates a stagger effect without needing parent variant propagation.

8. **EASE readonly tuple**: Confirmed safe in both Variants objects (used in `motion.ts`) and inline transitions (used in existing `About.tsx` line 103). Used freely in both contexts.

9. **Vehicle image check**: `vehicle.image.startsWith("/cars/")` determines whether to use `<img>` or gradient placeholder. Only `byd-seal.png` passes this check.

10. **Filter bar hidden scrollbar**: Uses `[scrollbar-width:none]` (Firefox) and `[&::-webkit-scrollbar]:hidden` (Chrome/Safari) for horizontal scroll on mobile without visible scrollbar.

## Verification Steps

1. **TypeScript type-check**: Run `npx tsc --noEmit` to verify all types are correct. Key areas to verify:
   - `FilterKey` type and filter logic
   - `iconMap` Record type with `LucideIcon`
   - SVG element props (`animateMotion`, `mpath`, `animate`)
   - `CSSProperties` import and usage
   - `Vehicle` and `Feature` type imports

2. **Build check**: Run `npm run build` to verify Next.js production build succeeds.

3. **Visual verification**: Run `npm run dev` and verify:
   - FeaturedVehicles: filter buttons work, cards animate in/out smoothly, BYD Seal shows real image, others show gradient placeholders
   - WhyChooseUs: 6 feature cards with icons, hover lift + icon animation, accent line appears on hover
   - WorldMap: China highlighted in red, 6 animated routes with ship dots, pulse rings on China and destinations, flag emojis visible
   - GlobalShipping: two-column layout, map in glass card, stat card with "40+", destination list with "Active route" badges
