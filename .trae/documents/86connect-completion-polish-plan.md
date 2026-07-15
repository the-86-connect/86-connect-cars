# 86Connect — Completion & Polish Plan

## Summary

The 86Connect luxury landing website is **substantially built** — all 9 sections (Hero, About, HowItWorks, FeaturedVehicles, WhyChooseUs, GlobalShipping, Testimonials, FAQ, Contact) plus Navbar and Footer are implemented, rendering, and TypeScript-clean. The remaining work focuses on: generating missing premium imagery, running the production build check, and conducting full visual QA with refinements.

## Current State Analysis

**Fully built and verified:**
- Next.js 16.2.10 + React 19 + TypeScript + Tailwind v4 + Framer Motion (`motion` package) + R3F + Three.js
- All dependencies installed (package.json complete)
- 35+ source files across `src/components`, `src/lib`, `src/hooks`, `src/types`
- Design tokens in `globals.css` — brand red `#E31E24` scale, glassmorphism (`.glass`/`.glass-strong`), premium shadows/easings, reduced-motion support
- Hero: cinematic gradient mesh background + R3F particle field + BYD Seal PNG with 3D float/rotate/mouse-tilt + floating glass stats bar
- Navbar: sticky, transparent→glass on scroll, mobile sheet, smooth-scroll anchor nav
- All sections: Framer Motion scroll reveals, staggered animations, hover effects, glass cards
- Contact form: React Hook Form + Zod validation, file upload with preview, success state
- WorldMap: SVG with animated shipping routes via `<animateMotion>`
- Testimonials: dual-row CSS marquee, pause on hover
- Ponytail AGENTS.md integrated as project ruleset
- Supabase scaffold (client/server factories, no logic — deferred per user instruction)
- TypeScript check: zero errors (verified in previous session)
- Dev server: was running at localhost:3000, all sections confirmed rendering

**Gaps identified:**
1. **5 of 6 vehicle images are gradient placeholders** — only `byd-seal.png` exists; `rav4.jpg`, `monjaro.jpg`, `civic.jpg`, `byd-han.jpg`, `uni-k.jpg` are referenced but don't exist, falling back to branded gradient blocks with text
2. **Hero background is abstract** — spec called for Shanghai skyline, container port, cargo ship, light fog; currently gradient mesh + floating orbs only
3. **About section visual is abstract** — uses gradient mesh with floating icon chips instead of real imagery of China/port/logistics
4. **Production build not verified** — `npm run build` was never run; only `tsc --noEmit` and `npm run dev` were checked
5. **Visual QA incomplete** — only a hero section screenshot was taken; remaining 8 sections not visually verified

## Proposed Changes

### 1. Generate 5 Missing Vehicle Images

Use `GenerateImage` to create premium product-shot style images for each vehicle. Clean studio background, 3/4 front angle, professional automotive photography aesthetic. Save to `public/vehicles/`.

| Vehicle | File | Description |
|---------|------|-------------|
| Toyota RAV4 Hybrid | `public/vehicles/rav4.jpg` | Silver hybrid SUV, 3/4 front angle, studio white background |
| Geely Monjaro | `public/vehicles/monjaro.jpg` | White premium SUV, 3/4 front angle, studio white background |
| Honda Civic | `public/vehicles/civic.jpg` | Red sedan, 3/4 front angle, studio white background |
| BYD Han EV | `public/vehicles/byd-han.jpg` | Black luxury electric sedan, 3/4 front angle, studio white background |
| Changan UNI-K | `public/vehicles/uni-k.jpg` | Gray futuristic SUV, 3/4 front angle, studio white background |

**Why:** The gradient placeholders look decent but real car images will dramatically elevate the "expensive" feel the user wants. The `FeaturedVehicles.tsx` component already handles both cases (real image vs gradient fallback) via `hasImage = vehicle.image.startsWith("/cars/")` — need to update this check to also accept `/vehicles/` paths.

**How:** Generate each image with `GenerateImage` tool (landscape_4_3 aspect ratio for card compatibility). Update the `hasImage` check in `FeaturedVehicles.tsx` to `vehicle.image.startsWith("/cars/") || vehicle.image.startsWith("/vehicles/")` so real images render instead of gradient fallbacks.

### 2. Generate Cinematic Hero Background

Use `GenerateImage` to create a premium, wide cinematic background image inspired by modern China: Shanghai skyline at dawn, modern Chinese architecture, container port with cargo ship, light fog, soft sunlight. Desaturated/light enough to sit behind white glassmorphism layers without overwhelming.

**File:** `public/hero/shanghai-port.jpg`

**Update `HeroBackground.tsx`:** Add the image as the bottommost layer (before the gradient mesh), with low opacity (~0.15-0.25) and a white gradient overlay so it reads as a subtle atmospheric backdrop behind the existing gradient mesh, orbs, and fog. The car and content remain the visual focal points.

### 3. Generate About Section Visual

Use `GenerateImage` to create a premium photo-style image: aerial view of a massive Chinese container port with cargo ships and stacked containers, or a modern Chinese highway with luxury cars. Warm, cinematic, professional.

**File:** `public/hero/about-port.jpg`

**Update `About.tsx`:** Replace the abstract gradient mesh + floating icon chips in the visual column with the generated image inside the glass-strong rounded container. Keep the floating stat card overlay ("500+ Verified Suppliers") and the parallax effect. Remove the decorative orbs and centered "86 Connect" wordmark.

### 4. Production Build Check

Run `npm run build` to verify the production build passes with zero errors. This catches issues that `tsc --noEmit` and dev mode don't surface (e.g., SSR data fetching, static generation, image optimization config).

If build errors occur, fix them before proceeding to visual QA.

### 5. Full Visual QA

Start the dev server, navigate to `localhost:3000` in the integrated browser, and scroll through all sections taking screenshots:

- **Desktop (1440px):** Hero → About → HowItWorks → FeaturedVehicles → WhyChooseUs → GlobalShipping → Testimonials → FAQ → Contact → Footer
- **Mobile (375px):** Same sweep to verify responsive layout

Check for:
- Spacing rhythm and whitespace consistency
- Typography hierarchy (Sora display + Inter body)
- Color discipline (white/light-gray surfaces, `#E31E24` accent only, no stray colors)
- Glassmorphism rendering (backdrop-blur working)
- Animation smoothness (scroll reveals, hover effects, marquee, accordion)
- Image loading (all generated images render correctly)
- Button hover/tap states
- Navbar scroll behavior (transparent → glass)
- Form field styling and validation

### 6. Fix Visual Issues

Address any issues found during visual QA. Common areas:
- Adjust spacing/padding if sections feel cramped or too sparse
- Fix image aspect ratios or object-fit if vehicle images look stretched
- Tune animation timing if reveals feel too slow/fast
- Adjust glassmorphism opacity if text readability is compromised
- Fix any responsive layout issues at mobile breakpoints

## Assumptions & Decisions

- **Vehicle images as studio product shots** (not transparent PNGs): The BYD Seal uses a transparent PNG for the hero's floating 3D effect, but the vehicle cards look better with clean studio-style photos. The `FeaturedVehicles.tsx` already uses `object-contain` for the BYD Seal and gradient fallback for others — will update to use `object-cover` for the new studio images.
- **Hero background layered, not replacing**: The generated Shanghai image sits beneath the existing gradient mesh at low opacity, adding atmospheric depth without losing the clean white aesthetic. This preserves the glassmorphism design language.
- **About visual replaces abstract decoration**: The floating icon chips and centered wordmark are removed in favor of a real photo, which better communicates "we export vehicles from China" than abstract shapes.
- **Admin dashboard and backend logic remain deferred** per user's explicit instruction ("we will write logic and backend later just frontend and design").
- **No new dependencies**: All work uses existing tools (GenerateImage for images, existing CSS/Tailwind for styling updates).

## Verification Steps

1. All 5 vehicle images exist in `public/vehicles/` and render in the FeaturedVehicles grid (no gradient fallbacks)
2. Hero background image exists in `public/hero/` and renders as a subtle atmospheric layer behind the gradient mesh
3. About section image exists and replaces the abstract gradient mesh visual
4. `npm run build` passes with zero errors
5. Dev server screenshots confirm all 9 sections + Navbar + Footer render with premium polish at desktop and mobile widths
6. All animations function correctly (hero float/rotate/particles, scroll reveals, filter transitions, marquee, accordion, form validation)
7. No broken images, no console errors, no layout shifts
