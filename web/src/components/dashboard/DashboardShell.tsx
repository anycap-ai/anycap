"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnycapMark } from "@/components/brand/AnycapMark";
import { AnycapWordmark } from "@/components/brand/AnycapWordmark";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { useUser } from "@/lib/api/hooks";

const mono = { fontFamily: "var(--font-mono), monospace" } as const;

type NavItem = { label: string; href: string; disabled?: boolean };

const navSections: NavItem[][] = [
  [
    { label: "Overview", href: "/dashboard" },
    { label: "Logs", href: "/dashboard/logs" },
    { label: "Billing", href: "/dashboard/billing" },
  ],
  [
    { label: "Usage", href: "/dashboard/usage", disabled: true },
    { label: "Playground", href: "/dashboard/playground", disabled: true },
  ],
  [
    { label: "API Keys", href: "/dashboard/api-keys", disabled: true },
    { label: "Settings", href: "/dashboard/settings", disabled: true },
  ],
];

const allItems = navSections.flat();

function UserAvatar({
  user,
  size = 28,
}: {
  user?: { name?: string; email?: string; id?: string; avatar_url?: string };
  size?: number;
}) {
  const displayName = user?.name || user?.email || user?.id || "";
  const initial = displayName ? displayName.charAt(0).toUpperCase() : "";
  const [imgError, setImgError] = useState(false);

  if (user?.avatar_url && !imgError) {
    return (
      <img
        src={user.avatar_url}
        alt={displayName}
        width={size}
        height={size}
        className="object-cover shrink-0"
        style={{ width: size, height: size }}
        onError={() => setImgError(true)}
      />
    );
  }
  return (
    <div
      className="bg-[#6b7d3a] flex items-center justify-center shrink-0"
      style={{ width: size, height: size, ...mono }}
    >
      <span className="text-[11px] font-bold text-[#f4f5f0] leading-none">
        {initial}
      </span>
    </div>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: user } = useUser();

  const displayName = user?.name || user?.email || user?.id || "";

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  return (
    <div className="min-h-screen bg-[#f4f5f0]">
      {/* ── Mobile header ── */}
      <header className="lg:hidden px-6 py-4 border-b border-[#d4dbb8] bg-[#f9faf5] flex items-center">
        <Link href="/for-human" className="flex items-center gap-2">
          <AnycapMark size={22} className="shrink-0" />
          <AnycapWordmark
            className="text-lg font-bold leading-none"
            style={{ ...mono, letterSpacing: "-0.5px" }}
          />
        </Link>
        <div className="ml-auto">
          <UserAvatar user={user} size={28} />
        </div>
      </header>

      {/* ── Mobile nav ── */}
      <nav className="lg:hidden px-6 py-3 border-b border-[#d4dbb8] bg-[#f9faf5] overflow-x-auto">
        <div className="flex gap-5">
          {allItems.map((item) =>
            item.disabled ? (
              <span
                key={item.href}
                className="text-[11px] uppercase tracking-[2px] text-[#9a9e90] opacity-40 whitespace-nowrap cursor-not-allowed"
                style={mono}
              >
                {item.label}
              </span>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className={`text-[11px] uppercase tracking-[2px] whitespace-nowrap transition-colors ${
                  isActive(item.href)
                    ? "text-[#6b7d3a]"
                    : "text-[#9a9e90] hover:text-[#6b7d3a]"
                }`}
                style={mono}
              >
                {item.label}
              </Link>
            ),
          )}
        </div>
      </nav>

      <div className="flex">
        {/* ── Desktop sidebar ── */}
        <aside className="hidden lg:flex flex-col w-60 shrink-0 border-r border-[#d4dbb8] bg-[#f9faf5] sticky top-0 h-screen">
          {/* Logo */}
          <div className="px-6 py-6">
            <Link href="/for-human" className="flex items-center gap-2.5">
              <AnycapMark size={24} className="shrink-0" />
              <AnycapWordmark
                className="text-lg font-bold leading-none"
                style={{ ...mono, letterSpacing: "-0.5px" }}
              />
            </Link>
          </div>

          {/* Nav sections */}
          <nav className="flex-1 px-3 mt-2 space-y-1">
            {navSections.map((section, si) => (
              <div key={si}>
                {si > 0 && (
                  <hr className="my-3 border-[#d4dbb8] mx-3" />
                )}
                {section.map((item) =>
                  item.disabled ? (
                    <span
                      key={item.href}
                      className="flex items-center justify-between px-3 py-2 text-[11px] uppercase tracking-[2px] text-[#9a9e90] opacity-40 cursor-not-allowed border-l-[3px] border-transparent"
                      style={mono}
                    >
                      {item.label}
                      <span className="text-[9px] tracking-[1px] normal-case">
                        soon
                      </span>
                    </span>
                  ) : (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`block px-3 py-2 text-[11px] uppercase tracking-[2px] transition-colors border-l-[3px] ${
                        isActive(item.href)
                          ? "text-[#6b7d3a] border-[#6b7d3a]"
                          : "text-[#9a9e90] hover:text-[#6b7d3a] border-transparent"
                      }`}
                      style={mono}
                    >
                      {item.label}
                    </Link>
                  ),
                )}
              </div>
            ))}
          </nav>

          {/* User + logout */}
          <div className="px-6 py-5 border-t border-[#d4dbb8]">
            <div className="flex items-center gap-2.5 mb-3">
              <UserAvatar user={user} size={28} />
              <span
                className="text-[11px] text-[#7a7e71] tracking-[1.5px] uppercase truncate"
                style={mono}
              >
                {displayName}
              </span>
            </div>
            <LogoutButton
              className="text-[11px] uppercase tracking-[2px] text-[#9a9e90] hover:text-[#6b7d3a] transition-colors cursor-pointer"
              style={mono}
            />
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="flex-1 min-w-0 px-6 md:px-10 py-8">
          <div className="max-w-[1080px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
