"use client";

import Link from "next/link";

const mono = { fontFamily: "var(--font-mono), monospace" } as const;

const triggerClass =
  "px-2.5 py-1.5 text-sm text-[#3f4437] hover:text-[#1c1f17] hover:bg-[#6b7d3a]/[0.08] active:scale-[0.97] tracking-[0.3px] rounded-lg transition-all duration-200 ease-out cursor-pointer select-none inline-flex items-center gap-1";

const dropdownLinkClass =
  "block px-4 py-2 text-sm text-[#3f4437] hover:text-[#1c1f17] hover:bg-[#6b7d3a]/[0.08] tracking-[0.3px] rounded-lg transition-all duration-200 ease-out whitespace-nowrap";

export type DropdownItem = {
  href: string;
  label: string;
};

type NavDropdownProps = {
  label: string;
  href?: string;
  items: DropdownItem[];
  hideBelow?: "sm" | "md";
};

export function NavDropdown({ label, href, items, hideBelow }: NavDropdownProps) {
  const outerClass = hideBelow ? `hidden ${hideBelow}:block` : "";

  return (
    <div className={`group/dropdown relative ${outerClass}`}>
      {href ? (
        <Link href={href} prefetch={false} className={triggerClass} style={mono}>
          {label}
          <Chevron />
        </Link>
      ) : (
        <span className={triggerClass} style={mono}>
          {label}
          <Chevron />
        </span>
      )}

      <div className="invisible opacity-0 group-hover/dropdown:visible group-hover/dropdown:opacity-100 absolute right-0 top-full pt-2 transition-all duration-200 ease-out z-30">
        <div className="min-w-[200px] rounded border border-[#d4dbb8] bg-[#f4f5f0] py-1.5 shadow-[0_14px_40px_rgba(28,31,23,0.08)]">
          {items.map(({ href: itemHref, label: itemLabel }) => (
            <Link
              key={itemHref}
              href={itemHref}
              prefetch={false}
              className={dropdownLinkClass}
              style={mono}
            >
              {itemLabel}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function Chevron() {
  return (
    <svg
      width="8"
      height="8"
      viewBox="0 0 8 8"
      fill="none"
      className="opacity-40 group-hover/dropdown:opacity-70 transition-opacity"
    >
      <path d="M2 3L4 5L6 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
