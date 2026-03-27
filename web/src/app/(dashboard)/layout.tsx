import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AnycapMark } from "@/components/brand/AnycapMark";
import { AnycapWordmark } from "@/components/brand/AnycapWordmark";
import { UserProfileHeader } from "@/components/dashboard/UserProfileHeader";
import { SWRProvider } from "@/components/providers/SWRProvider";
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

  return (
    <SWRProvider>
      <div className="min-h-screen">
        <header className="px-6 md:px-12 lg:px-20 py-6 border-b border-[#d4dbb8]">
          <div className="mx-auto max-w-[1280px] flex items-center gap-3">
            <Link href="/for-human" className="flex items-center gap-3">
              <AnycapMark size={28} className="shrink-0" />
              <AnycapWordmark
                className="text-xl font-bold leading-none"
                style={{ ...mono, letterSpacing: "-0.5px" }}
              />
            </Link>

            <UserProfileHeader />
          </div>
        </header>

        <main className="px-6 md:px-12 lg:px-20 py-8">
          <div className="mx-auto max-w-[1280px]">
            {children}
          </div>
        </main>
      </div>
    </SWRProvider>
  );
}
