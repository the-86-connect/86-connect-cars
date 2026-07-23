import type { Metadata } from "next";
import { About } from "@/components/sections/About";

export const metadata: Metadata = {
  title: "About Us — China Car Export Experts",
  description:
    "Learn about 86Connect — your trusted partner for Chinese vehicle export. We connect global buyers with verified Chinese car suppliers, handling sourcing, inspection, export documentation, and worldwide shipping. 2000+ cars exported to 40+ countries.",
  alternates: { canonical: "/about" },
  openGraph: {
    url: "/about",
    title: "About Us — China Car Export Experts",
    description: "Your trusted partner in Chinese vehicle export with 2000+ cars exported to 40+ countries.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Us — China Car Export Experts",
    description: "Your trusted partner in Chinese vehicle export. Verified suppliers, worldwide shipping.",
  },
};

export default function AboutPage() {
  return <About />;
}
