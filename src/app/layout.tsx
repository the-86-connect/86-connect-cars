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

const SITE_URL = "https://cars.the86connect.com";
const OG_IMAGE = `${SITE_URL}/hero/hero-poster.jpg`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "China Car Export | Buy & Import Cars from China Worldwide | 86Connect",
    template: "%s | 86Connect",
  },
  description:
    "86Connect — your trusted China car export partner. Source premium new & used vehicles directly from China. BYD, Geely, Toyota, Changan and more. Verified suppliers, worldwide shipping, full export documentation. Get a quote in 24 hours.",
  keywords: [
    "China car export",
    "import cars from China",
    "Chinese cars for export",
    "buy cars from China",
    "China vehicle exporter",
    "Chinese EV export",
    "BYD export",
    "Geely export",
    "China car wholesale",
    "new cars from China",
    "used cars China export",
    "China car shipping worldwide",
    "China auto export service",
    "Chinese electric vehicles export",
    "China car supplier",
    "bulk car purchase China",
    "FOB China cars",
    "vehicle export documentation China",
    "LHD cars from China",
    "RHD cars for export",
    "86Connect",
  ],
  category: "Automotive",
  classification: "Car Export",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/favicon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "86Connect",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "86Connect",
    url: SITE_URL,
    title: "China Car Export | Buy & Import Cars from China Worldwide | 86Connect",
    description:
      "Source premium new & used vehicles from China. Verified suppliers, worldwide shipping, full export documentation. BYD, Geely, Toyota and more.",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "86Connect — China Car Export",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "China Car Export | Buy & Import Cars from China Worldwide | 86Connect",
    description:
      "Source premium new & used vehicles from China. Verified suppliers, worldwide shipping, full export documentation.",
    images: [OG_IMAGE],
  },
  alternates: {
    canonical: "/",
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

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "86Connect",
  legalName: "Beijing BridgePath International Consulting Co., Ltd",
  url: SITE_URL,
  logo: `${SITE_URL}/logo-86connect.png`,
  description:
    "Professional China car export service connecting global buyers with verified Chinese vehicle suppliers. Worldwide shipping, full export documentation.",
  email: "b*************************",
  telephone: "+86-176-1153-3296",
  address: {
    "@type": "PostalAddress",
    addressCountry: "CN",
    addressLocality: "Beijing",
  },
  sameAs: ["https://the86connect.com"],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "sales",
    email: "b*************************",
    telephone: "+86-176-1153-3296",
    availableLanguage: ["English", "Chinese"],
  },
};

const webSiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "86Connect",
  url: SITE_URL,
  description: "China Car Export — Source premium vehicles from China to the world.",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/inventory?brand={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }}
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
