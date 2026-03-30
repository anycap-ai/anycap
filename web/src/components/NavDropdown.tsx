"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

const triggerClass =
  "px-3 py-2 text-[15px] text-[#3f4437] hover:text-[#1c1f17] hover:bg-[#6b7d3a]/[0.08] active:scale-[0.97] tracking-[0.3px] rounded-lg transition-all duration-200 ease-out cursor-pointer select-none inline-flex items-center gap-1";

const dropdownLinkClass =
  "block px-4 py-2.5 text-[15px] text-[#3f4437] hover:text-[#1c1f17] hover:bg-[#6b7d3a]/[0.08] tracking-[0.3px] rounded-lg transition-all duration-200 ease-out whitespace-nowrap";

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
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const outerClass = hideBelow ? `hidden ${hideBelow}:block` : "";

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current) {
        return;
      }

      if (event.target instanceof Node && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  function toggleOpen() {
    setOpen((previousOpen) => !previousOpen);
  }

  return (
    <div
      ref={containerRef}
      className={`group/dropdown relative ${outerClass}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {href ? (
        <div className="inline-flex items-center">
          <Link
            href={href}
            prefetch={false}
            className={`${triggerClass} rounded-r-none pr-2`}
            style={mono}
            onClick={() => setOpen(false)}
          >
            {label}
          </Link>
          <button
            type="button"
            aria-label={`Open ${label} menu`}
            aria-expanded={open}
            className={`${triggerClass} rounded-l-none px-2`}
            style={mono}
            onClick={toggleOpen}
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
          onClick={toggleOpen}
        >
          {label}
          <Chevron open={open} />
        </button>
      )}

      <div
        className={`absolute right-0 top-full z-30 pt-2 transition-all duration-200 ease-out ${
          open ? "visible opacity-100" : "invisible opacity-0 pointer-events-none"
        }`}
      >
        <div className="min-w-[200px] rounded border border-[#d4dbb8] bg-[#f4f5f0] py-1.5 shadow-[0_14px_40px_rgba(28,31,23,0.08)]">
          {items.map(({ href: itemHref, label: itemLabel }) => (
            <Link
              key={itemHref}
              href={itemHref}
              prefetch={false}
              className={dropdownLinkClass}
              style={mono}
              onClick={() => setOpen(false)}
            >
              {itemLabel}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 8 8"
      fill="none"
      className={`opacity-40 transition-all ${open ? "rotate-180 opacity-70" : "group-hover/dropdown:opacity-70"}`}
    >
      <path d="M2 3L4 5L6 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
