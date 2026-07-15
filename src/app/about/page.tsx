import type { Metadata } from "next";
import { About } from "@/components/sections/About";

export const metadata: Metadata = {
  title: "About Us — China's Premier Vehicle Export Partner | 86Connect",
  description:
    "Learn about 86Connect — your trusted partner in Chinese vehicle export. We bridge the gap between China's automotive market and global buyers with deep supplier relationships, rigorous quality control, and seamless logistics.",
  openGraph: {
    title: "About Us — China's Premier Vehicle Export Partner | 86Connect",
    description:
      "Your trusted partner in Chinese vehicle export with 2000+ cars exported to 40+ countries.",
  },
};

export default function AboutPage() {
  return <About />;
}
