"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

type MobileNavLink = {
  href: string;
  label: string;
  description?: string;
  external?: boolean;
};

export type MobileNavEntry =
  | {
      kind: "link";
      href: string;
      label: string;
      external?: boolean;
    }
  | {
      kind: "section";
      label: string;
      href?: string;
      items: MobileNavLink[];
    };

type MobileNavMenuProps = {
  entries: MobileNavEntry[];
};

const itemClass =
  "block rounded-xl px-4 py-3 text-[15px] tracking-[0.3px] text-[#28301f] transition-colors duration-150 hover:bg-[#eef2e5]";

export function MobileNavMenu({ entries }: MobileNavMenuProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      entries
        .filter((entry): entry is Extract<MobileNavEntry, { kind: "section" }> => entry.kind === "section")
        .map((entry, index) => [entry.label, index === 0]),
    ),
  );

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function toggleSection(label: string) {
    setExpandedSections((current) => ({
      ...current,
      [label]: !current[label],
    }));
  }

  return (
    <div className="static lg:hidden">
      <button
        type="button"
        aria-label={open ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={open}
        className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[#d4dbb8] bg-[#fffffc] text-[#1c1f17] transition-all duration-200 ease-out hover:border-[#b8c09a] hover:bg-white active:scale-[0.97]"
        onClick={() => setOpen((current) => !current)}
      >
        {open ? <CloseIcon /> : <MenuIcon />}
      </button>

      {open ? (
        <div className="absolute left-0 right-0 top-full z-50 mt-3 origin-top rounded-[24px] border border-[#d4dbb8] bg-[#f8f9f3]/95 p-3 shadow-[0_20px_60px_rgba(28,31,23,0.14)] backdrop-blur-xl">
          <nav className="max-h-[min(72dvh,36rem)] overflow-y-auto">
            <div className="space-y-2">
              {entries.map((entry) =>
                entry.kind === "link" ? (
                  <MobileLink
                    key={entry.href}
                    href={entry.href}
                    label={entry.label}
                    external={entry.external}
                    onNavigate={() => setOpen(false)}
                  />
                ) : (
                  <div
                    key={entry.label}
                    className="rounded-2xl border border-[#e0e5d2] bg-[#fffffc]/90 p-2"
                  >
                    <div className="flex items-center gap-2">
                      {entry.href ? (
                        <Link
                          href={entry.href}
                          prefetch={false}
                          className="min-w-0 flex-1 rounded-xl px-3 py-3 text-[15px] text-[#1c1f17] transition-colors duration-150 hover:bg-[#eef2e5]"
                          style={mono}
                          onClick={() => setOpen(false)}
                        >
                          {entry.label}
                        </Link>
                      ) : (
                        <div
                          className="min-w-0 flex-1 px-3 py-3 text-[15px] text-[#1c1f17]"
                          style={mono}
                        >
                          {entry.label}
                        </div>
                      )}
                      <button
                        type="button"
                        aria-expanded={expandedSections[entry.label] ?? false}
                        aria-label={`Toggle ${entry.label} links`}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-[#4d5145] transition-colors duration-150 hover:bg-[#eef2e5] hover:text-[#1c1f17]"
                        onClick={() => toggleSection(entry.label)}
                      >
                        <Chevron open={expandedSections[entry.label] ?? false} />
                      </button>
                    </div>

                    {(expandedSections[entry.label] ?? false) ? (
                      <div className="mt-1 space-y-1 border-t border-[#e7eadf] pt-2">
                        {entry.items.map((item) => (
                          <MobileLink
                            key={item.href}
                            href={item.href}
                            label={item.label}
                            description={item.description}
                            external={item.external}
                            onNavigate={() => setOpen(false)}
                          />
                        ))}
                      </div>
                    ) : null}
                  </div>
                ),
              )}
            </div>

            <div className="mt-3 border-t border-[#e0e5d2] pt-3">
              <a
                href="https://github.com/anycap-ai/anycap"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-2xl border border-[#e0e5d2] bg-[#fffffc]/90 px-4 py-3 text-[15px] text-[#1c1f17] transition-colors duration-150 hover:bg-[#eef2e5]"
                style={mono}
                onClick={() => setOpen(false)}
              >
                <span>GitHub</span>
                <ExternalIcon />
              </a>
            </div>
          </nav>
        </div>
      ) : null}
    </div>
  );
}

function MobileLink({
  href,
  label,
  description,
  external,
  onNavigate,
}: MobileNavLink & { onNavigate: () => void }) {
  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={itemClass}
        style={mono}
        onClick={onNavigate}
      >
        <span className="block">{label}</span>
        {description ? (
          <span className="mt-1 block text-[12px] leading-5 text-[#6a715d]">{description}</span>
        ) : null}
      </a>
    );
  }

  return (
    <Link
      href={href}
      prefetch={false}
      className={itemClass}
      style={mono}
      onClick={onNavigate}
    >
      <span className="block">{label}</span>
      {description ? (
        <span className="mt-1 block text-[12px] leading-5 text-[#6a715d]">{description}</span>
      ) : null}
    </Link>
  );
}

function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M3.5 5.25H14.5M3.5 9H14.5M3.5 12.75H14.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M5 5L13 13M13 5L5 13"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 8 8"
      fill="none"
      aria-hidden="true"
      className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
    >
      <path
        d="M2 3L4 5L6 3"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path
        d="M3 9L9 3M4 3H9V8"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
