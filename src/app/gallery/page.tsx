import type { Metadata } from "next";
import { GalleryClient } from "./GalleryClient";

export const metadata: Metadata = {
  title: "Gallery — Photos & Videos of Our Vehicles",
  description:
    "Browse photos and videos of premium vehicles exported from China by 86Connect. See our cars in action, on the road, and at ports worldwide.",
  openGraph: {
    title: "Gallery — Photos & Videos | 86Connect",
    description:
      "Browse photos and videos of premium vehicles exported from China.",
  },
};

export const revalidate = 0;

export default function GalleryPage() {
  return <GalleryClient />;
}