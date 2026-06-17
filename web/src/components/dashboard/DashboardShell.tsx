"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnycapLogo } from "@/components/brand/AnycapLogo";
import { CommunityActions } from "@/components/ui/CommunityActions";
import { UserAvatarMenu, UserAvatar } from "@/components/ui/UserAvatarMenu";
import { useUser } from "@/lib/api/hooks";


type NavItem = { label: string; href: string; disabled?: boolean };

const navSections: NavItem[][] = [
  [
    { label: "Get started", href: "/dashboard/get-started" },
    { label: "Overview", href: "/dashboard" },
    { label: "Logs", href: "/dashboard/logs" },
    { label: "Billing", href: "/dashboard/billing" },
  ],
  [
    { label: "Drive", href: "/dashboard/drive" },
    { label: "Pages", href: "/dashboard/pages" },
  ],
  [
    { label: "API keys", href: "/dashboard/api-keys" },
  ],
];

const allItems = navSections.flat();

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: user } = useUser();

  const displayName = user?.name || user?.email || user?.id || "";

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  return (
    <div className="dashboard-shell min-h-screen bg-[#f2f3ef]" style={{ fontFamily: "var(--font-mono), system-ui, sans-serif" }}>
      {/* ── Mobile header ── */}
      <header className="relative flex items-center border-b border-[#dce0d2] bg-[#f2f3ef] px-5 py-4 sm:px-6 lg:hidden">
        <Link href="/">
          <AnycapLogo size={32} />
        </Link>
        <div className="ml-auto">
          <UserAvatarMenu
            trigger={
              <button className="p-0.5 rounded-full hover:ring-2 hover:ring-[#6b7d3a]/30 transition-all duration-200 ease-out cursor-pointer">
                <UserAvatar picture={user?.avatar_url} name={displayName} size={32} />
              </button>
            }
          />
        </div>
      </header>

      {/* ── Mobile nav ── */}
      <nav className="relative overflow-x-auto border-b border-[#dce0d2] bg-[#f2f3ef] px-5 py-3 sm:px-6 lg:hidden">
        <div className="flex min-w-max gap-2">
          <CommunityActions variant="mobilePills" />
          {allItems.map((item) =>
            item.disabled ? (
              <span
                key={item.href}
                className="inline-flex cursor-not-allowed items-center rounded-full border border-[#d8dcd0] bg-[#fafbf8] px-3 py-2 text-[13px] text-[#b0b4a8] whitespace-nowrap"
              >
                {item.label}
              </span>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center rounded-full border px-3 py-2 text-[13px] whitespace-nowrap transition-all ${
                  isActive(item.href)
                    ? "border-[#6b7d3a] bg-[rgba(107,125,58,0.09)] text-[#1c1f17] font-medium"
                    : item.href === "/dashboard/get-started"
                      ? "border-[rgba(107,125,58,0.14)] bg-[rgba(107,125,58,0.05)] text-[#6b7d3a] font-medium"
                      : "border-[#d8dcd0] bg-[#fafbf8] text-[#6b7068] hover:border-[#c9ceb9] hover:text-[#3a3e32]"
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
            <Link href="/">
              <AnycapLogo size={36} />
            </Link>
          </div>

          {/* Nav sections */}
          <nav className="flex-1 px-4">
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
                          : item.href === "/dashboard/get-started"
                            ? "text-[#6b7d3a] font-medium hover:bg-[rgba(107,125,58,0.07)]"
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
            <UserAvatarMenu
              positionClass="absolute left-full bottom-0 ml-2 z-30 origin-bottom-left"
              trigger={
                <div className="flex items-center gap-3 cursor-pointer rounded-[10px] px-2 py-2 -mx-2 transition-all duration-150 hover:bg-[rgba(107,125,58,0.07)] active:translate-y-px active:scale-[0.985]">
                  <UserAvatar picture={user?.avatar_url} name={displayName} size={36} />
                  <span className="text-[15px] text-[#4d5145] font-medium truncate">
                    {displayName}
                  </span>
                </div>
              }
            />
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="relative flex-1 min-w-0 px-5 py-10 sm:px-8 sm:py-12 md:px-16 md:py-14 xl:pt-24">
          <CommunityActions
            variant="desktop"
            className="absolute right-16 top-6 z-[60]"
          />
          <div className="max-w-[1200px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
