import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";

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
  return children;
}
