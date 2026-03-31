"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnycapLogo } from "@/components/brand/AnycapLogo";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { useUser } from "@/lib/api/hooks";


type NavItem = { label: string; href: string; disabled?: boolean };

const navSections: NavItem[][] = [
  [
    { label: "Overview", href: "/dashboard" },
    { label: "Logs", href: "/dashboard/logs" },
    { label: "Billing", href: "/dashboard/billing" },
  ],
  [
    { label: "Drive", href: "/dashboard/drive" },
    { label: "Pages", href: "/dashboard/pages" },
  ],
];

const allItems = navSections.flat();

function UserAvatar({
  user,
  size = 32,
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
        className="object-cover shrink-0 rounded-full"
        style={{ width: size, height: size }}
        onError={() => setImgError(true)}
      />
    );
  }
  return (
    <div
      className="bg-[#6b7d3a] flex items-center justify-center shrink-0 rounded-full"
      style={{ width: size, height: size }}
    >
      <span className="text-[12px] font-semibold text-[#f4f5f0] leading-none">
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
    <div className="min-h-screen bg-[#f2f3ef]" style={{ fontFamily: "var(--font-mono), system-ui, sans-serif" }}>
      {/* ── Mobile header ── */}
      <header className="lg:hidden px-6 py-4 border-b border-[#dce0d2] bg-[#f2f3ef] flex items-center">
        <Link href="/for-human">
          <AnycapLogo size={24} />
        </Link>
        <div className="ml-auto">
          <UserAvatar user={user} size={32} />
        </div>
      </header>

      {/* ── Mobile nav ── */}
      <nav className="lg:hidden px-6 py-4 border-b border-[#dce0d2] bg-[#f2f3ef] overflow-x-auto">
        <div className="flex gap-5">
          {allItems.map((item) =>
            item.disabled ? (
              <span
                key={item.href}
                className="text-[13px] text-[#b0b4a8] whitespace-nowrap cursor-not-allowed"
              >
                {item.label}
              </span>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className={`text-[13px] whitespace-nowrap transition-colors ${isActive(item.href)
                    ? "text-[#1c1f17] font-medium"
                    : "text-[#6b7068] hover:text-[#3a3e32]"
                  }`}
              >
                {item.label}
              </Link>
            ),
          )}
        </div>
      </nav>

      <div className="flex">
        {/* ── Desktop sidebar ── */}
        <aside className="hidden lg:flex flex-col w-[280px] shrink-0 border-r border-[#dce0d2] bg-[#f2f3ef] sticky top-0 h-screen">
          {/* Logo */}
          <div className="px-7 py-8">
            <Link href="/for-human">
              <AnycapLogo size={28} />
            </Link>
          </div>

          {/* Nav sections */}
          <nav className="flex-1 px-4 mt-1">
            {navSections.map((section, si) => (
              <div key={si}>
                {si > 0 && (
                  <hr className="my-4 border-[#dce0d2] mx-3" />
                )}
                {section.map((item) =>
                  item.disabled ? (
                    <span
                      key={item.href}
                      className="flex items-center justify-between px-4 py-3 text-[15px] text-[#b0b4a8] cursor-not-allowed rounded-[10px] mb-0.5"
                    >
                      {item.label}
                      <span className="text-[11px]">
                        coming soon
                      </span>
                    </span>
                  ) : (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`relative block px-4 py-3 rounded-[10px] text-[15px] transition-all duration-150 mb-0.5 ${isActive(item.href)
                          ? "text-[#1c1f17] font-medium bg-[rgba(107,125,58,0.10)]"
                          : "text-[#6b7068] hover:text-[#3a3e32] hover:bg-[rgba(107,125,58,0.07)]"
                        }`}
                    >
                      {isActive(item.href) && (
                        <span className="absolute left-0 top-2.5 bottom-2.5 w-[3px] bg-[#6b7d3a] rounded-r-sm" />
                      )}
                      {item.label}
                    </Link>
                  ),
                )}
              </div>
            ))}
          </nav>

          {/* User area with hover dropdown */}
          <div className="px-7 py-6 border-t border-[#dce0d2]">
            <div className="relative group/user">
              <div className="flex items-center gap-3 cursor-pointer rounded-[10px] px-2 py-2 -mx-2 transition-colors duration-150 group-hover/user:bg-[rgba(107,125,58,0.07)]">
                <UserAvatar user={user} size={36} />
                <span className="text-[15px] text-[#4d5145] font-medium truncate">
                  {displayName}
                </span>
              </div>

              {/* Dropdown */}
              <div className="absolute left-full bottom-0 ml-2 z-30 opacity-0 scale-95 pointer-events-none group-hover/user:opacity-100 group-hover/user:scale-100 group-hover/user:pointer-events-auto transition-all duration-150 origin-bottom-left">
                <div
                  className="bg-white border border-[#d8dcd0] rounded-xl py-1.5 min-w-[160px]"
                  style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.08)" }}
                >
                  <span className="flex items-center justify-between px-4 py-2.5 text-[14px] text-[#b0b4a8] cursor-not-allowed">
                    API keys
                    <span className="text-[11px] text-[#b0b4a8]">coming soon</span>
                  </span>
                  <span className="flex items-center justify-between px-4 py-2.5 text-[14px] text-[#b0b4a8] cursor-not-allowed">
                    Settings
                    <span className="text-[11px] text-[#b0b4a8]">coming soon</span>
                  </span>
                  <hr className="my-1.5 border-[#eceee7] mx-3" />
                  <LogoutButton className="w-full text-left px-4 py-2.5 text-[14px] text-[#6b7068] hover:text-[#1c1f17] hover:bg-[#f0f2eb] transition-colors duration-150 rounded-lg mx-auto block">
                    Log out
                  </LogoutButton>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="flex-1 min-w-0 px-10 md:px-16 py-14">
          <div className="max-w-[1200px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
