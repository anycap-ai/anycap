"use client";

import Link from "next/link";
import { HoverDropdown, dropdownItemClass } from "@/components/ui/HoverDropdown";

const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

const triggerClass =
  "px-3 py-2 text-[15px] text-[#3f4437] hover:text-[#1c1f17] hover:bg-[#6b7d3a]/[0.08] active:scale-[0.97] tracking-[0.3px] rounded-lg transition-all duration-200 ease-out cursor-pointer select-none inline-flex items-center gap-0.5";

export type DropdownItem = {
  href: string;
  label: string;
};

type NavDropdownProps = {
  label: string;
  href?: string;
  items: DropdownItem[];
  hideBelow?: "sm" | "md" | "lg";
};

export function NavDropdown({ label, href, items, hideBelow }: NavDropdownProps) {
  const outerClass = hideBelow ? `hidden ${hideBelow}:block` : "";

  return (
    <HoverDropdown
      className={outerClass}
      trigger={(open, close, toggle) =>
        href ? (
          <div className="inline-flex items-center rounded-lg hover:bg-[#6b7d3a]/[0.08] transition-all duration-200 ease-out">
            <Link
              href={href}
              prefetch={false}
              className="pl-3 py-2 pr-0.5 text-[15px] text-[#3f4437] hover:text-[#1c1f17] active:scale-[0.97] tracking-[0.3px] transition-all duration-200 ease-out cursor-pointer select-none inline-flex items-center"
              style={mono}
              onClick={close}
            >
              {label}
            </Link>
            <button
              type="button"
              aria-label={`Open ${label} menu`}
              aria-expanded={open}
              className="pr-2.5 py-2 pl-0.5 text-[#3f4437] hover:text-[#1c1f17] active:scale-[0.97] transition-all duration-200 ease-out cursor-pointer select-none inline-flex items-center"
              style={mono}
              onClick={toggle}
            >
              <Chevron open={open} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            aria-expanded={open}
            className={triggerClass}
            style={mono}
            onClick={toggle}
          >
            {label}
            <Chevron open={open} />
          </button>
        )
      }
    >
      {items.map(({ href: itemHref, label: itemLabel }) => (
        <Link
          key={itemHref}
          href={itemHref}
          prefetch={false}
          className={dropdownItemClass}
          style={mono}
        >
          {itemLabel}
        </Link>
      ))}
    </HoverDropdown>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 8 8"
      fill="none"
      className={`opacity-40 transition-all ${open ? "rotate-180 opacity-70" : ""}`}
    >
      <path d="M2 3L4 5L6 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
