import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AnycapMark } from "@/components/brand/AnycapMark";
import { AnycapWordmark } from "@/components/brand/AnycapWordmark";
import { UserProfileHeader } from "@/components/dashboard/UserProfileHeader";
import { SWRProvider } from "@/components/providers/SWRProvider";
import { readSessionFromStore } from "@/lib/auth/session";

export const runtime = "edge";

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

const navItems = [
  { href: "/dashboard", label: "Overview" },
  { href: "/billing", label: "Billing" },
  { href: "/usage", label: "Usage" },
  { href: "/logs", label: "Logs" },
] as const;

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="block rounded px-3 py-2 text-[11px] uppercase tracking-[2px] text-[#5a5e52] transition-colors hover:bg-[#eef1e3] hover:text-[#1c1f17]"
      style={mono}
    >
      {children}
    </Link>
  );
}

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
      <div className="min-h-screen bg-[#f4f5f0] text-[#1c1f17]">
        <header className="border-b border-[#d4dbb8] px-6 py-6 md:px-12 lg:px-20">
          <div className="mx-auto flex max-w-[1280px] items-center gap-3">
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

        <div className="px-6 py-8 md:px-12 lg:px-20">
          <div className="mx-auto flex max-w-[1280px] flex-col gap-6 md:flex-row md:gap-10">
            <aside className="h-fit border border-[#d4dbb8] bg-[#f9faf5] p-4 md:w-60 md:shrink-0 md:p-5">
              <p
                className="mb-3 text-[11px] uppercase tracking-[2px] text-[#5a5e52]"
                style={mono}
              >
                Dashboard
              </p>
              <nav className="space-y-1">
                {navItems.map((item) => (
                  <NavLink key={item.href} href={item.href}>
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            </aside>

            <main className="flex-1 border border-[#d4dbb8] bg-[#f9faf5] p-6 md:p-8">
              {children}
            </main>
          </div>
        </div>
      </div>
    </SWRProvider>
  );
}
