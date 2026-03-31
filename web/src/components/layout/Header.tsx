import Link from "next/link";
import { AnycapLogo } from "@/components/brand/AnycapLogo";
import { NavDropdown, type DropdownItem } from "@/components/layout/NavDropdown";
import { getRequestLocale } from "@/lib/request-locale";
import { localizePublicPath } from "@/lib/site";

const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

const baseLinkClass =
  "px-3 py-2 text-[15px] tracking-[0.3px] rounded-lg transition-all duration-200 ease-out";

const defaultLinkClass = `${baseLinkClass} text-[#3f4437] hover:text-[#1c1f17] hover:bg-[#6b7d3a]/[0.08] active:scale-[0.97]`;
const primaryLinkClass =
  `${baseLinkClass} px-5 text-[#f4f5f0] bg-[#6b7d3a] border border-[#6b7d3a] hover:bg-[#1c1f17] hover:border-[#1c1f17] active:scale-[0.97]`;

export type NavItem = {
  href: string;
  label: string;
  hideBelow?: "sm" | "md";
  variant?: "default" | "primary";
};

export type NavDropdownDef = {
  kind: "dropdown";
  label: string;
  href?: string;
  items: DropdownItem[];
  hideBelow?: "sm" | "md";
};

export type NavEntry = NavItem | NavDropdownDef;

function isDropdown(entry: NavEntry): entry is NavDropdownDef {
  return "kind" in entry && entry.kind === "dropdown";
}

type HeaderProps = {
  logoHref?: string;
  links: NavEntry[];
  authSlot?: React.ReactNode;
};

export async function Header({ logoHref = "/for-human", links, authSlot }: HeaderProps) {
  const locale = await getRequestLocale();
  const localizedLogoHref = localizePublicPath(locale, logoHref);

  function localize(href: string) {
    return localizePublicPath(locale, href);
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-5 py-4 md:px-16 md:py-6 lg:px-24 bg-[#f4f5f0]/80 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <Link href={localizedLogoHref} className="shrink-0">
          <span className="block md:hidden"><AnycapLogo size={32} /></span>
          <span className="hidden md:block"><AnycapLogo size={42} /></span>
        </Link>
        <nav className="ml-auto flex items-center gap-0.5 sm:gap-1">
          {links.map((entry) => {
            if (isDropdown(entry)) {
              const localizedItems = entry.items.map((item) => ({
                ...item,
                href: localize(item.href),
              }));
              return (
                <NavDropdown
                  key={entry.label}
                  label={entry.label}
                  href={entry.href ? localize(entry.href) : undefined}
                  items={localizedItems}
                  hideBelow={entry.hideBelow}
                />
              );
            }

            const { href, label, hideBelow } = entry;
            const linkVariantClass = entry.variant === "primary" ? primaryLinkClass : defaultLinkClass;
            return (
              <Link
                key={href}
                href={localize(href)}
                prefetch={false}
                className={`${hideBelow ? `hidden ${hideBelow}:inline-block` : ""} ${linkVariantClass}`}
                style={mono}
              >
                {label}
              </Link>
            );
          })}
          {authSlot}
        </nav>
      </div>
    </header>
  );
}

/* ── Navigation definitions ─────────────────────────────────────── */

const capabilitiesDropdown: NavDropdownDef = {
  kind: "dropdown",
  label: "Capabilities",
  href: "/capabilities",
  hideBelow: "sm",
  items: [
    { href: "/capabilities/image-generation", label: "Image Generation" },
    { href: "/capabilities/video-generation", label: "Video Generation" },
    { href: "/capabilities/image-understanding", label: "Image Understanding" },
    { href: "/capabilities/video-analysis", label: "Video Analysis" },
  ],
};

const equipYourAgentsDropdown: NavDropdownDef = {
  kind: "dropdown",
  label: "Equip Your Agents",
  href: "/start",
  items: [
    { href: "/for/claude-code", label: "Claude Code" },
    { href: "/for/cursor", label: "Cursor" },
    { href: "/for/manus", label: "Manus" },
    { href: "/for/codex", label: "Codex" },
  ],
  hideBelow: "md",
};

const learnDropdown: NavDropdownDef = {
  kind: "dropdown",
  label: "Learn",
  href: "/learn/what-agents-cant-do",
  items: [
    { href: "/learn/what-agents-cant-do", label: "What Agents Can't Do" },
    { href: "/cli", label: "Why One CLI Matters" },
    { href: "/skills", label: "How Skills Fit" },
    { href: "/guides/context-engineering-for-agents", label: "Context Engineering" },
    { href: "/compare/anycap-vs-composio", label: "AnyCap vs Composio" },
  ],
  hideBelow: "md",
};

const forYourAgentDropdown: NavDropdownDef = {
  kind: "dropdown",
  label: "For Your Agent",
  href: "/start",
  items: [
    { href: "/for/claude-code", label: "Claude Code" },
    { href: "/for/cursor", label: "Cursor" },
    { href: "/for/codex", label: "Codex" },
  ],
  hideBelow: "md",
};

const resourcesDropdown: NavDropdownDef = {
  kind: "dropdown",
  label: "Resources",
  items: [
    { href: "/cli", label: "CLI" },
    { href: "/skills", label: "Skills" },
    { href: "/models", label: "Models" },
    { href: "/learn/what-agents-cant-do", label: "What Agents Can't Do" },
    { href: "/guides/context-engineering-for-agents", label: "Context Engineering" },
    { href: "/compare/anycap-vs-composio", label: "AnyCap vs Composio" },
  ],
  hideBelow: "md",
};

export const seoNavLinks: NavEntry[] = [
  capabilitiesDropdown,
  forYourAgentDropdown,
  resourcesDropdown,
  { href: "/about", label: "About", hideBelow: "sm" },
];

export const humanNavLinks: NavEntry[] = [
  capabilitiesDropdown,
  equipYourAgentsDropdown,
  learnDropdown,
  { href: "/about", label: "About", hideBelow: "sm" },
];
