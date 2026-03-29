import type { Metadata } from "next";
import { GeistPixelSquare } from "geist/font/pixel";
import { Inter } from "next/font/google";
import { LazyGrainOverlay } from "@/components/ui/LazyGrainOverlay";

export const runtime = "edge";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function DeviceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${GeistPixelSquare.variable} ${inter.variable} relative min-h-screen bg-[#f4f5f0] text-[#1c1f17] antialiased`}
      style={{ fontFamily: "sans-serif" }}
    >
      <LazyGrainOverlay />
      {children}
    </div>
  );
}
