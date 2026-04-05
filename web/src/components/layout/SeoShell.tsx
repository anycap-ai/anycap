import { GeistPixelSquare } from "geist/font/pixel";
import { Inter } from "next/font/google";
import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { Header, humanNavLinks } from "@/components/layout/Header";
import { LazyGrainOverlay } from "@/components/ui/LazyGrainOverlay";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

export async function SeoShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${GeistPixelSquare.variable} ${inter.variable} relative min-h-screen bg-[#f4f5f0] text-[#1c1f17] antialiased`}
      style={{ fontFamily: "sans-serif" }}
    >
      <LazyGrainOverlay />

      <Header
        links={humanNavLinks}
        authSlot={
          <>
            <Link
              href="/auth/login"
              prefetch={false}
              className="px-5 py-2 text-[15px] text-[#f4f5f0] bg-[#1c1f17] border border-[#1c1f17] hover:bg-[#3a3e32] hover:border-[#3a3e32] active:scale-[0.97] tracking-[0.3px] rounded-lg transition-all duration-200 ease-out"
              style={mono}
            >
              Login
            </Link>
            <Link
              href="/"
              prefetch={false}
              className="hidden lg:inline-block px-5 py-2 text-[15px] text-[#3f4437] bg-[#fffffc] border border-[#d4dbb8] hover:bg-white hover:border-[#b8c09a] active:scale-[0.97] tracking-[0.3px] rounded-lg transition-all duration-200 ease-out"
              style={mono}
            >
              I&apos;m Agent
            </Link>
          </>
        }
      />

      <main>{children}</main>

      <Footer />
    </div>
  );
}
