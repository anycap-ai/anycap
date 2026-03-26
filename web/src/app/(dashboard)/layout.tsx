import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AnycapMark } from "@/components/brand/AnycapMark";
import { AnycapWordmark } from "@/components/brand/AnycapWordmark";
import { readSessionCookie } from "@/lib/auth/session";

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

const navItems = [
  { href: "/dashboard", label: "Overview" },
  { href: "/billing", label: "Billing" },
  { href: "/usage", label: "Usage" },
  { href: "/logs", label: "Logs" },
] as const;

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await readSessionCookie(await cookies());
  if (!session?.apiKey) {
    redirect("/auth/login?return_to=/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#f4f5f0] text-[#1c1f17]">
      <header className="px-6 md:px-12 lg:px-20 py-6 border-b border-[#d4dbb8]">
        <div className="mx-auto max-w-[1280px] flex items-center gap-3">
          <AnycapMark size={28} className="shrink-0" />
          <AnycapWordmark className="text-xl font-bold leading-none" />
          <div className="ml-auto flex items-center gap-4">
            <span className="text-[11px] text-[#7a7e71] tracking-[1.5px] uppercase">
              {session.user?.email || session.user?.id}
            </span>
            <Link
              href="/auth/logout"
              className="text-[11px] text-[#9a9e90] hover:text-[#6b7d3a] tracking-[2px] uppercase transition-colors"
            >
              Logout
            </Link>
          </div>
        </div>
      </header>

      <div className="px-6 md:px-12 lg:px-20 py-8">
        <div className="mx-auto max-w-[1280px] flex flex-col md:flex-row gap-6 md:gap-10">
          <aside className="md:w-60 md:shrink-0 border border-[#d4dbb8] bg-[#f9faf5] p-4 md:p-5 h-fit">
            <p className="text-[11px] uppercase tracking-[2px] text-[#707468] mb-3">Dashboard</p>
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
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="block px-3 py-2 text-sm text-[#4d5145] hover:text-[#1c1f17] hover:bg-[#eef2df] transition-colors"
    >
      {children}
    </Link>
  );
}
