import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Hero } from "@/components/sections/Hero";
import { FeaturedVehicles } from "@/components/sections/FeaturedVehicles";
import { getVehicles } from "@/lib/vehicles.server";
import { getBrands, resolveLogo } from "@/lib/brands.server";
import type { BrandCategory } from "@/lib/brands";
import { faqs } from "@/lib/data";
import { JsonLd } from "@/components/seo/JsonLd";

const RecentlyViewed = dynamic(() => import("@/components/sections/RecentlyViewed").then(m => ({ default: m.RecentlyViewed })));
const Gallery = dynamic(() => import("@/components/sections/Gallery").then(m => ({ default: m.Gallery })));
const GlobalShipping = dynamic(() => import("@/components/sections/GlobalShipping").then(m => ({ default: m.GlobalShipping })));
const HowItWorks = dynamic(() => import("@/components/sections/HowItWorks").then(m => ({ default: m.HowItWorks })));
const About = dynamic(() => import("@/components/sections/About").then(m => ({ default: m.About })));
const Brands = dynamic(() => import("@/components/sections/Brands").then(m => ({ default: m.Brands })));
const WhyChooseUs = dynamic(() => import("@/components/sections/WhyChooseUs").then(m => ({ default: m.WhyChooseUs })));
const Testimonials = dynamic(() => import("@/components/sections/Testimonials").then(m => ({ default: m.Testimonials })));
const FAQ = dynamic(() => import("@/components/sections/FAQ").then(m => ({ default: m.FAQ })));
const Contact = dynamic(() => import("@/components/sections/Contact").then(m => ({ default: m.Contact })));

export const metadata: Metadata = {
  title: { absolute: "China Car Export | Buy & Import Cars from China Worldwide | 86Connect" },
  description:
    "86Connect — your trusted China car export partner. Source premium new & used vehicles directly from China. BYD, Geely, Toyota, Changan and more. Verified suppliers, worldwide shipping, full export documentation. Get a quote in 24 hours.",
  alternates: { canonical: "/" },
  openGraph: {
    url: "/",
    title: "China Car Export | Buy & Import Cars from China Worldwide | 86Connect",
    description:
      "Source premium new & used vehicles from China. BYD, Geely, Toyota, Changan — verified suppliers, worldwide shipping, full export documentation.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "China Car Export | Buy & Import Cars from China Worldwide | 86Connect",
    description:
      "Source premium new & used vehicles from China. Verified suppliers, worldwide shipping, full export documentation.",
  },
};

export const revalidate = 0;

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: f.answer,
    },
  })),
};

export default async function Home() {
  const [vehicles, brandRows] = await Promise.all([getVehicles(), getBrands()]);
  const brands = brandRows.map((b) => ({
    name: b.name,
    logo: resolveLogo(b.logo),
    category: b.category as BrandCategory,
  }));

  return (
    <>
      <JsonLd data={faqJsonLd} />
      <Hero />
      <FeaturedVehicles vehicles={vehicles} />
      <RecentlyViewed />
      <Gallery />
      <GlobalShipping />
      <HowItWorks />
      <About />
      <Brands vehicles={vehicles} brands={brands} />
      <WhyChooseUs />
      <Testimonials />
      <FAQ />
      <Contact />
    </>
  );
}
