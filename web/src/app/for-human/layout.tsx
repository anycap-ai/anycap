import { GeistPixelSquare } from "geist/font/pixel";
import { Space_Mono } from "next/font/google";
import { GrainOverlay } from "@/components/ui/GrainOverlay";
import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: siteConfig.humanTitle,
  description: siteConfig.humanDescription,
  alternates: {
    canonical: "/for-human",
  },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/for-human",
    siteName: siteConfig.siteName,
    title: `${siteConfig.humanTitle} | ${siteConfig.name}`,
    description: siteConfig.humanDescription,
  },
  twitter: {
    card: "summary",
    title: `${siteConfig.humanTitle} | ${siteConfig.name}`,
    description: siteConfig.humanDescription,
  },
};

export default function ForHumanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${GeistPixelSquare.variable} ${spaceMono.variable} relative min-h-screen bg-[#f4f5f0] text-[#1c1f17] antialiased`}
      style={{ fontFamily: "sans-serif" }}
    >
      <GrainOverlay />
      {children}
    </div>
  );
}
