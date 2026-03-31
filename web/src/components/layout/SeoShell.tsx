import { Suspense } from "react";
import { GeistPixelSquare } from "geist/font/pixel";
import { Inter } from "next/font/google";
import { Footer } from "@/components/layout/Footer";
import { Header, humanNavLinks } from "@/components/layout/Header";
import { AuthNav } from "@/components/layout/AuthNav";
import { LazyGrainOverlay } from "@/components/ui/LazyGrainOverlay";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export function SeoShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${GeistPixelSquare.variable} ${inter.variable} relative min-h-screen bg-[#f4f5f0] text-[#1c1f17] antialiased`}
      style={{ fontFamily: "sans-serif" }}
    >
      <LazyGrainOverlay />

      <Header
        links={humanNavLinks}
        authSlot={
          <Suspense fallback={null}>
            <AuthNav variant="human" />
          </Suspense>
        }
      />

      <main>{children}</main>

      <Footer />
    </div>
  );
}
