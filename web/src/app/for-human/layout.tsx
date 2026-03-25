import { GeistPixelSquare } from "geist/font/pixel";
import { Space_Mono } from "next/font/google";
import { GrainOverlay } from "@/components/ui/GrainOverlay";
import type { Metadata } from "next";

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AnyCap — Your Agent Can Do Anything",
  description:
    "Your Agent can do anything. It just needs AnyCap. One entry point to every AI capability. Zero friction.",
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
