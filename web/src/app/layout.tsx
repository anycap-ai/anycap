import type { Metadata } from "next";
import { GeistPixelSquare } from "geist/font/pixel";
import { Inter, Space_Mono } from "next/font/google";
import "@/styles/globals.css";
import { LazyGlobalTipToast } from "@/components/ui/LazyGlobalTipToast";
import { GrainOverlay } from "@/components/ui/GrainOverlay";
import {

  defaultLocale,
  getLocaleConfig,
  siteConfig,
} from "@/lib/site";
import { createRobotsMetadata, defaultSocialImage } from "@/lib/seo-metadata";

export const runtime = "edge";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const logoFont = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-logo",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.defaultTitle,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.defaultDescription,
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    siteName: siteConfig.siteName,
    title: siteConfig.defaultTitle,
    description: siteConfig.defaultDescription,
    images: [defaultSocialImage],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.defaultTitle,
    description: siteConfig.defaultDescription,
    images: [defaultSocialImage.url],
  },
  robots: createRobotsMetadata(),
  icons: {
    icon: "/anycap-mark.svg",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "AnyCap",
  url: siteConfig.url,
  logo: `${siteConfig.url}/anycap-mark.svg`,
  sameAs: [
    "https://github.com/anycap-ai/anycap",
  ],
  description: siteConfig.defaultDescription,
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteConfig.siteName,
  url: siteConfig.url,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const htmlLang = getLocaleConfig(defaultLocale).htmlLang;

  return (
    <html lang={htmlLang}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteJsonLd),
          }}
        />
      </head>
      <body
        className={`${GeistPixelSquare.variable} ${inter.variable} ${logoFont.variable} bg-[#f4f5f0] text-[#1c1f17] antialiased`}
        style={{ fontFamily: "sans-serif" }}
      >
        <LazyGlobalTipToast />
        {children}
        <GrainOverlay />
      </body>
    </html>
  );
}
