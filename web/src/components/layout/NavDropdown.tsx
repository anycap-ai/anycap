"use client";

import Link from "next/link";
import { HoverDropdown, dropdownItemClass } from "@/components/ui/HoverDropdown";
import { NavIcon, type NavIconKey } from "@/components/layout/NavIcon";

const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

const triggerClass =
  "px-3 py-2 text-[15px] text-[#3f4437] hover:text-[#1c1f17] hover:bg-[#6b7d3a]/[0.08] active:scale-[0.97] tracking-[0.3px] rounded-lg transition-all duration-200 ease-out cursor-pointer select-none inline-flex items-center gap-0.5";

export type DropdownItem = {
  href: string;
  label: string;
  icon?: NavIconKey;
  section?: string;
  description?: string;
};

type NavDropdownProps = {
  label: string;
  href?: string;
  items: DropdownItem[];
  icon?: NavIconKey;
  hideBelow?: "sm" | "md" | "lg" | "xl";
  align?: "left" | "right";
};

const hideBelowBlockClass: Record<string, string> = {
  sm: "hidden sm:block",
  md: "hidden md:block",
  lg: "hidden lg:block",
  xl: "hidden xl:block",
};

export function NavDropdown({ label, href, items, icon, hideBelow, align = "right" }: NavDropdownProps) {
  const outerClass = hideBelow ? hideBelowBlockClass[hideBelow] ?? "" : "";
  const hasRichItems = items.some((item) => item.description || item.section);
  const groupedItems = items.reduce<Record<string, DropdownItem[]>>((acc, item) => {
    const key = item.section ?? "More";
    acc[key] ??= [];
    acc[key].push(item);
    return acc;
  }, {});
  const groupEntries = Object.entries(groupedItems);

  return (
    <HoverDropdown
      align={align}
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
              {icon ? <NavIcon icon={icon} className="mr-2 h-6 w-6 rounded-md [&_svg]:h-3.5 [&_svg]:w-3.5" /> : null}
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
            {icon ? <NavIcon icon={icon} className="h-6 w-6 rounded-md [&_svg]:h-3.5 [&_svg]:w-3.5" /> : null}
            {label}
            <Chevron open={open} />
          </button>
        )
      }
    >
      {(close) =>
        hasRichItems ? (
          <div className="w-[min(92vw,40rem)] p-3 lg:w-[min(94vw,46rem)]">
            <div className="max-h-[min(70dvh,40rem)] overflow-y-auto pr-1">
              <div className="grid gap-3 lg:grid-cols-2">
                {groupEntries.map(([section, sectionItems]) => (
                  <div
                    key={section}
                    className="rounded-xl border border-[#e7eadf] bg-[#fbfcf8]/90 p-2.5"
                  >
                    <p
                      className="px-2 py-1 text-[10px] uppercase tracking-[0.9px] text-[#7d846f]"
                      style={mono}
                    >
                      {section}
                    </p>
                    <div className="mt-1 space-y-1">
                      {sectionItems.map(({ href: itemHref, label: itemLabel, icon: itemIcon, description }) => (
                        <Link
                          key={itemHref}
                          href={itemHref}
                          prefetch={false}
                          className="flex gap-3 rounded-lg px-3 py-3 transition-colors duration-150 hover:bg-[#eef2e5]"
                          onClick={close}
                        >
                          {itemIcon ? <NavIcon icon={itemIcon} /> : null}
                          <span className="min-w-0">
                            <span className="block text-[14px] text-[#28301f]" style={mono}>
                              {itemLabel}
                            </span>
                            {description ? (
                              <span className="mt-1 block text-[12px] leading-5 text-[#6a715d]">
                                {description}
                              </span>
                            ) : null}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          items.map(({ href: itemHref, label: itemLabel, icon: itemIcon }) => (
            <Link
              key={itemHref}
              href={itemHref}
              prefetch={false}
              className={`${dropdownItemClass} flex items-center gap-3`}
              style={mono}
              onClick={close}
            >
              {itemIcon ? <NavIcon icon={itemIcon} /> : null}
              {itemLabel}
            </Link>
          ))
        )
      }
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
