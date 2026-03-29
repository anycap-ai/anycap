import { GeistPixelSquare } from "geist/font/pixel";
import { Inter } from "next/font/google";
import { LazyGrainOverlay } from "@/components/ui/LazyGrainOverlay";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export function ForHumanShell({ children }: { children: React.ReactNode }) {
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
