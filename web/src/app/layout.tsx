import { Suspense } from "react";
import type { Metadata } from "next";
import { GeistPixelSquare } from "geist/font/pixel";
import { Space_Mono } from "next/font/google";
import "@/styles/globals.css";
import { siteConfig } from "@/lib/site";
import { GlobalTipToast } from "@/components/ui/GlobalTipToast";
import { GrainOverlay } from "@/components/ui/GrainOverlay";

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.defaultTitle,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.defaultDescription,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/",
    siteName: siteConfig.siteName,
    title: siteConfig.defaultTitle,
    description: siteConfig.defaultDescription,
  },
  twitter: {
    card: "summary",
    title: siteConfig.defaultTitle,
    description: siteConfig.defaultDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/anycap-mark.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${GeistPixelSquare.variable} ${spaceMono.variable} bg-[#f4f5f0] text-[#1c1f17] antialiased`}
        style={{ fontFamily: "sans-serif" }}
      >
        <Suspense fallback={null}>
          <GlobalTipToast />
        </Suspense>
        {children}
        <GrainOverlay />
      </body>
    </html>
  );
}
