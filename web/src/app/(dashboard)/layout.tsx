import type { Metadata } from "next";
import Link from "next/link";

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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar — placeholder */}
      <aside className="w-56 border-r border-[#222] p-4">
        <div className="text-lg font-bold mb-6">AnyCap</div>
        <nav className="space-y-2 text-sm">
          <NavLink href="/dashboard">Overview</NavLink>
          <NavLink href="/billing">Billing</NavLink>
          <NavLink href="/usage">Usage</NavLink>
          <NavLink href="/logs">Logs</NavLink>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8">{children}</main>
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
      className="block px-3 py-2 rounded hover:bg-[#1a1a1a] text-[#a0a0a0] hover:text-white transition-colors"
    >
      {children}
    </Link>
  );
}
