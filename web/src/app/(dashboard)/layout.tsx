import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AnycapMark } from "@/components/brand/AnycapMark";
import { AnycapWordmark } from "@/components/brand/AnycapWordmark";
import { readSessionFromStore } from "@/lib/auth/session";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

const mono = { fontFamily: "var(--font-mono), monospace" } as const;

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = readSessionFromStore(await cookies());
  if (!session?.apiKey) {
    redirect("/auth/login?return_to=/dashboard");
  }

  // TODO: replace with real avatar URL from user profile API when available
  const displayName = session.user?.name || session.user?.email || session.user?.id || "User";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#f4f5f0] text-[#1c1f17]">
      <header className="px-6 md:px-12 lg:px-20 py-6 border-b border-[#d4dbb8]">
        <div className="mx-auto max-w-[1280px] flex items-center gap-3">
          <Link href="/for-human" className="flex items-center gap-3">
            <AnycapMark size={28} className="shrink-0" />
            <AnycapWordmark
              className="text-xl font-bold leading-none"
              style={{ ...mono, letterSpacing: "-0.5px" }}
            />
          </Link>

          {/* User avatar + name, logout on hover */}
          <div className="ml-auto relative group">
            <div className="flex items-center gap-3 cursor-default">
              <span
                className="text-[11px] text-[#7a7e71] tracking-[1.5px] uppercase"
                style={mono}
              >
                {displayName}
              </span>
              {/* TODO: replace with <img> when avatar URL is available */}
              <div
                className="w-8 h-8 bg-[#6b7d3a] flex items-center justify-center shrink-0"
                style={mono}
              >
                <span className="text-[13px] font-bold text-[#f4f5f0] leading-none">
                  {initial}
                </span>
              </div>
            </div>

            {/* Hover dropdown */}
            <div className="absolute right-0 top-full pt-1 hidden group-hover:block z-30">
              <Link
                href="/auth/logout"
                className="block px-5 py-2.5 text-[11px] uppercase tracking-[2px] text-[#4d5145] hover:text-[#6b7d3a] bg-[#f9faf5] border border-[#d4dbb8] transition-colors whitespace-nowrap"
                style={mono}
              >
                Logout
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="px-6 md:px-12 lg:px-20 py-8">
        <div className="mx-auto max-w-[1280px]">
          {children}
        </div>
      </main>
    </div>
  );
}
