import { GeistPixelSquare } from "geist/font/pixel";
import { Space_Mono } from "next/font/google";
import { LazyGrainOverlay } from "@/components/ui/LazyGrainOverlay";

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
  display: "swap",
});

export function ForHumanShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${GeistPixelSquare.variable} ${spaceMono.variable} relative min-h-screen bg-[#f4f5f0] text-[#1c1f17] antialiased`}
      style={{ fontFamily: "sans-serif" }}
    >
      <LazyGrainOverlay />
      {children}
    </div>
  );
}
