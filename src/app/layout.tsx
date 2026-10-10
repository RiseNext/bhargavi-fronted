import type { Metadata, Viewport } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FloatingActions } from "@/components/layout/FloatingActions";
import { Preloader } from "@/components/layout/Preloader";
import { site } from "@/lib/site";
import { getServices } from "@/lib/content";
import { openingHoursSpecification } from "@/lib/hours";
import { absoluteUrl, serialiseJsonLd } from "@/lib/schema";

/** Variable serif with optical sizing — the display voice. */
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["SOFT", "WONK"],
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.tagline} | ${site.name}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  openGraph: {
    type: "website",
    locale: site.locale,
    siteName: site.name,
    title: `${site.tagline} | ${site.name}`,
    description: site.description,
    images: [
      { url: site.ogImage, width: 1200, height: 630, alt: site.name },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.tagline} | ${site.name}`,
    description: site.description,
    images: [site.ogImage],
  },
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#3d2a1e",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const businessSchema = {
  "@context": "https://schema.org",
  "@type": "MedicalClinic",
  name: site.name,
  description: site.description,
  url: site.url,
  // The schema's address is the Chikkadpally clinic, so pair its number.
  telephone: site.branches[0].phone,
  email: site.email,
  priceRange: site.priceRange,
  image: absoluteUrl(site.url, site.founder.photo),
  address: {
    "@type": "PostalAddress",
    streetAddress: `${site.address.line1}, ${site.address.line2}`,
    addressLocality: site.address.city,
    addressRegion: site.address.state,
    postalCode: site.address.postalCode,
    addressCountry: site.address.country,
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: site.geo.lat,
    longitude: site.geo.lng,
  },
  // 🔴 Derived from the generated hours (D-028), not written out here. The
  // hand-written version did not move when the hours changed in the admin
  // panel, so the structured data could outlive the fact it described — and
  // wrong opening hours in search results is worse than none.
  openingHoursSpecification,
  sameAs: site.socials.map((s) => s.href),
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // 🔴 The ONE runtime read in the root layout: `Header`'s services dropdown.
  // Cached and tagged, so this is a single shared fetch, not one per page, and
  // the layout stays prerendered.
  const services = await getServices();

  return (
    <html lang="en-IN" className={`${fraunces.variable} ${jakarta.variable}`}>
      <body>
        <Preloader />
        <Header services={services} />
        <main id="main">{children}</main>
        <Footer />
        <FloatingActions />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serialiseJsonLd(businessSchema) }}
        />
      </body>
    </html>
  );
}
