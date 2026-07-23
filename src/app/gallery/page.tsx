import type { Metadata } from "next";
import { GalleryClient } from "./GalleryClient";

const SITE_URL = "https://cars.the86connect.com";

export const metadata: Metadata = {
  title: "Gallery — Photos & Videos of Chinese Cars for Export",
  description:
    "Browse photos and videos of premium Chinese vehicles exported worldwide by 86Connect. See BYD, Geely, Changan, Nio, Xpeng and more — at port, on the road, and delivered to customers globally.",
  alternates: { canonical: "/gallery" },
  openGraph: {
    url: "/gallery",
    title: "Gallery — Photos & Videos of Chinese Cars for Export",
    description: "Browse photos and videos of premium vehicles exported from China.",
    type: "website",
    images: [{ url: `${SITE_URL}/hero/hero-poster.jpg`, width: 1200, height: 630, alt: "86Connect Gallery" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Gallery — Photos & Videos of Chinese Cars for Export",
    description: "Browse photos and videos of premium vehicles exported from China.",
    images: [`${SITE_URL}/hero/hero-poster.jpg`],
  },
};

export const revalidate = 0;

export default function GalleryPage() {
  return <GalleryClient />;
}
