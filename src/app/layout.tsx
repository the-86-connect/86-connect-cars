import type { Metadata, Viewport } from "next";
import { Manrope, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { HashScrollHandler } from "@/components/layout/HashScrollHandler";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://86connect.com"),
  title: {
    default: "86Connect — Source Premium Cars From China to the World",
    template: "%s | 86Connect",
  },
  description:
    "Affordable prices. Verified suppliers. Worldwide shipping. Professional export service. Source premium vehicles from China with 86Connect.",
  keywords: [
    "China car export",
    "vehicle sourcing China",
    "buy cars from China",
    "auto export service",
    "BYD export",
    "Chinese vehicles",
    "86Connect",
  ],
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/favicon 86 Connect Official 1.png",
    apple: "/favicon 86 Connect Official 1.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "86Connect",
  },
  openGraph: {
    title: "86Connect — Source Premium Cars From China to the World",
    description:
      "Affordable prices. Verified suppliers. Worldwide shipping. Professional export service.",
    type: "website",
    locale: "en_US",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#e31e24",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${playfair.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('86connect-theme');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;if(s==='dark'||(!s&&d))document.documentElement.classList.add('dark');}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <Navbar />
        <HashScrollHandler />
        <main className="flex-1">{children}</main>
        <Footer />
        <MobileBottomNav />
      </body>
    </html>
  );
}
