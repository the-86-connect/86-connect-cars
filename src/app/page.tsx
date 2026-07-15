import dynamic from "next/dynamic";
import { Hero } from "@/components/sections/Hero";
import { FeaturedVehicles } from "@/components/sections/FeaturedVehicles";
import { getVehicles } from "@/lib/vehicles.server";
import { getBrands, resolveLogo } from "@/lib/brands.server";
import type { BrandCategory } from "@/lib/brands";

// Below-the-fold sections load on demand — keeps first paint fast
const RecentlyViewed = dynamic(() => import("@/components/sections/RecentlyViewed").then(m => ({ default: m.RecentlyViewed })));
const Gallery = dynamic(() => import("@/components/sections/Gallery").then(m => ({ default: m.Gallery })));
const GlobalShipping = dynamic(() => import("@/components/sections/GlobalShipping").then(m => ({ default: m.GlobalShipping })));
const HowItWorks = dynamic(() => import("@/components/sections/HowItWorks").then(m => ({ default: m.HowItWorks })));
const Brands = dynamic(() => import("@/components/sections/Brands").then(m => ({ default: m.Brands })));
const WhyChooseUs = dynamic(() => import("@/components/sections/WhyChooseUs").then(m => ({ default: m.WhyChooseUs })));
const Testimonials = dynamic(() => import("@/components/sections/Testimonials").then(m => ({ default: m.Testimonials })));
const FAQ = dynamic(() => import("@/components/sections/FAQ").then(m => ({ default: m.FAQ })));
const Contact = dynamic(() => import("@/components/sections/Contact").then(m => ({ default: m.Contact })));

export const revalidate = 0; // Always fetch fresh vehicles from DB (admin can add at any time)

export default async function Home() {
  const [vehicles, brandRows] = await Promise.all([getVehicles(), getBrands()]);
  const brands = brandRows.map((b) => ({
    name: b.name,
    logo: resolveLogo(b.logo),
    category: b.category as BrandCategory,
  }));

  return (
    <>
      <Hero />
      <FeaturedVehicles vehicles={vehicles} />
      <RecentlyViewed />
      <Gallery />
      <GlobalShipping />
      <HowItWorks />
      <Brands vehicles={vehicles} brands={brands} />
      <WhyChooseUs />
      <Testimonials />
      <FAQ />
      <Contact />
    </>
  );
}
