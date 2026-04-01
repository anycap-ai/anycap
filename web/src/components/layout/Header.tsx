import Link from "next/link";
import { AnycapLogo } from "@/components/brand/AnycapLogo";
import { NavDropdown, type DropdownItem } from "@/components/layout/NavDropdown";
import { getRequestLocale } from "@/lib/request-locale";
import { localizePublicPath } from "@/lib/site";

const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;
const githubHref = "https://github.com/anycap-ai/anycap";

const baseLinkClass =
  "px-3 py-2 text-[15px] tracking-[0.3px] rounded-lg transition-all duration-200 ease-out";

const defaultLinkClass = `${baseLinkClass} text-[#3f4437] hover:text-[#1c1f17] hover:bg-[#6b7d3a]/[0.08] active:scale-[0.97]`;

const hideBelowInlineClass: Record<string, string> = {
  sm: "hidden sm:inline-block",
  md: "hidden md:inline-block",
  lg: "hidden lg:inline-block",
};
const primaryLinkClass =
  `${baseLinkClass} px-5 text-[#f4f5f0] bg-[#6b7d3a] border border-[#6b7d3a] hover:bg-[#1c1f17] hover:border-[#1c1f17] active:scale-[0.97]`;

export type NavItem = {
  href: string;
  label: string;
  hideBelow?: "sm" | "md" | "lg";
  variant?: "default" | "primary";
  external?: boolean;
};

export type NavDropdownDef = {
  kind: "dropdown";
  label: string;
  href?: string;
  items: DropdownItem[];
  hideBelow?: "sm" | "md" | "lg";
};

export type NavEntry = NavItem | NavDropdownDef;

function isDropdown(entry: NavEntry): entry is NavDropdownDef {
  return "kind" in entry && entry.kind === "dropdown";
}

function isExternalHref(href: string) {
  return /^https?:\/\//.test(href);
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

  function renderEntry(entry: NavEntry) {
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
    const external = entry.external ?? isExternalHref(href);
    const linkVariantClass = entry.variant === "primary" ? primaryLinkClass : defaultLinkClass;
    const responsiveClass = hideBelow ? hideBelowInlineClass[hideBelow] ?? "" : "";

    if (external) {
      return (
        <a
          key={href}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={`${responsiveClass} ${linkVariantClass}`}
          style={mono}
        >
          {label}
        </a>
      );
    }

    return (
      <Link
        key={href}
        href={localize(href)}
        prefetch={false}
        className={`${responsiveClass} ${linkVariantClass}`}
        style={mono}
      >
        {label}
      </Link>
    );
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-5 py-4 md:px-16 md:py-6 lg:px-24 bg-[#f4f5f0]/80 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <Link href={localizedLogoHref} className="shrink-0">
          <span className="block md:hidden"><AnycapLogo size={32} /></span>
          <span className="hidden md:block"><AnycapLogo size={42} /></span>
        </Link>
        <div className="ml-auto flex min-w-0 items-center gap-1 sm:gap-2">
          <nav className="flex min-w-0 items-center gap-1 sm:gap-2">
            {links.map(renderEntry)}
          </nav>
          <div className="flex shrink-0 items-center gap-2">{authSlot}</div>
        </div>
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

const equipAgentsDropdown: NavDropdownDef = {
  kind: "dropdown",
  label: "Equip Agents",
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
  items: [
    { href: "/cli", label: "CLI" },
    { href: "/skills", label: "Skills" },
    { href: "/guides/install-anycap", label: "Install AnyCap" },
    { href: "/guides/context-engineering-for-agents", label: "Context Engineering" },
    { href: "/learn/what-agents-cant-do", label: "What Agents Can't Do" },
  ],
  hideBelow: "md",
};

const githubNavLink: NavItem = {
  href: githubHref,
  label: "GitHub",
  hideBelow: "md",
  external: true,
};

export const seoNavLinks: NavEntry[] = [
  capabilitiesDropdown,
  equipAgentsDropdown,
  learnDropdown,
  { href: "/about", label: "About", hideBelow: "lg" },
  githubNavLink,
];

export const humanNavLinks: NavEntry[] = [
  capabilitiesDropdown,
  equipAgentsDropdown,
  learnDropdown,
  { href: "/about", label: "About", hideBelow: "lg" },
  githubNavLink,
];
