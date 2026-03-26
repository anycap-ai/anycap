import type { Metadata } from "next";
import { GeistPixelSquare } from "geist/font/pixel";
import { Space_Mono } from "next/font/google";
import { GrainOverlay } from "@/components/ui/GrainOverlay";

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
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
      className={`${GeistPixelSquare.variable} ${spaceMono.variable} relative min-h-screen bg-[#f4f5f0] text-[#1c1f17] antialiased`}
      style={{ fontFamily: "sans-serif" }}
    >
      <GrainOverlay />
      {children}
    </div>
  );
}
