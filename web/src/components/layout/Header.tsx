import Link from "next/link";
import { AnycapLogo } from "@/components/brand/AnycapLogo";
import { MobileNavMenu, type MobileNavEntry } from "@/components/layout/MobileNavMenu";
import { NavDropdown, type DropdownItem } from "@/components/layout/NavDropdown";
import { GitHubStarButton } from "@/components/ui/GitHubStarButton";
import { getRequestLocale } from "@/lib/request-locale";
import { localizePublicPath } from "@/lib/site";

const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

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
  topOffset?: string;
};

export async function Header({ logoHref = "/", links, authSlot, topOffset = "0px" }: HeaderProps) {
  const locale = await getRequestLocale();
  const localizedLogoHref = localizePublicPath(locale, logoHref);
  const mobileEntries: MobileNavEntry[] = links.map((entry) => {
    if (isDropdown(entry)) {
      return {
        kind: "section",
        label: entry.label,
        href: entry.href ? localizePublicPath(locale, entry.href) : undefined,
        items: entry.items.map((item) => ({
          label: item.label,
          href: localizePublicPath(locale, item.href),
          description: item.description,
        })),
      };
    }

    const external = entry.external ?? isExternalHref(entry.href);

    return {
      kind: "link",
      label: entry.label,
      href: external ? entry.href : localizePublicPath(locale, entry.href),
      external,
    };
  });

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
    <header
      className="fixed left-0 right-0 z-40 bg-[#f4f5f0]/80 px-5 py-4 backdrop-blur-sm md:px-16 md:py-6 lg:px-24"
      style={{ top: topOffset }}
    >
      <div className="relative flex items-center gap-3">
        <Link href={localizedLogoHref} className="shrink-0">
          <span className="block md:hidden"><AnycapLogo size={32} /></span>
          <span className="hidden md:block"><AnycapLogo size={42} /></span>
        </Link>
        <div className="ml-auto flex min-w-0 items-center gap-1 sm:gap-2">
          <nav className="flex min-w-0 items-center gap-1 sm:gap-2">
            {links.map(renderEntry)}
          </nav>
          <div className="flex shrink-0 items-center gap-2">
            <GitHubStarButton />
            {authSlot}
            <MobileNavMenu entries={mobileEntries} />
          </div>
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
    {
      href: "/capabilities/image-generation",
      label: "Image Generation",
      section: "Generate",
      description: "Create and edit images from prompts or references.",
    },
    {
      href: "/capabilities/video-generation",
      label: "Video Generation",
      section: "Generate",
      description: "Create motion outputs from text and image inputs.",
    },
    {
      href: "/capabilities/music-generation",
      label: "Music Generation",
      section: "Generate",
      description: "Produce music tracks through one runtime.",
    },
    {
      href: "/capabilities/image-understanding",
      label: "Image Understanding",
      section: "Understand",
      description: "Read screenshots, diagrams, and visual references.",
    },
    {
      href: "/capabilities/video-analysis",
      label: "Video Analysis",
      section: "Understand",
      description: "Inspect recordings and extract structured details.",
    },
    {
      href: "/capabilities/audio-understanding",
      label: "Audio Understanding",
      section: "Understand",
      description: "Transcribe and analyze voice and audio files.",
    },
    {
      href: "/capabilities/web-search",
      label: "Web Search",
      section: "Retrieve",
      description: "Search the web from the same agent workflow.",
    },
    {
      href: "/capabilities/grounded-web-search",
      label: "Grounded Web Search",
      section: "Retrieve",
      description: "Return synthesized answers with live citations.",
    },
    {
      href: "/capabilities/web-crawl",
      label: "Web Crawl",
      section: "Retrieve",
      description: "Fetch pages and convert them into clean content.",
    },
    {
      href: "/capabilities/drive",
      label: "Drive",
      section: "Store",
      description: "Store outputs, organize assets, and create public URLs.",
    },
  ],
};

const equipAgentsDropdown: NavDropdownDef = {
  kind: "dropdown",
  label: "Equip Agents",
  href: "/for",
  items: [
    { href: "/for/claude-code", label: "Claude Code" },
    { href: "/for/cursor", label: "Cursor" },
    { href: "/for/codex", label: "Codex" },
    { href: "/for/manus", label: "Manus" },
  ],
  hideBelow: "md",
};

const learnDropdown: NavDropdownDef = {
  kind: "dropdown",
  label: "Learn",
  href: "/learn",
  items: [
    {
      href: "/cli",
      label: "CLI",
      section: "Product",
      description: "See the command surface agents use to call capabilities through one runtime.",
    },
    {
      href: "/skills",
      label: "Skills",
      section: "Product",
      description: "Learn how agent skills expose capabilities inside developer tools.",
    },
    {
      href: "/guides/install-anycap",
      label: "Install AnyCap",
      section: "Guides",
      description: "Set up the CLI, auth once, and verify the capability runtime is ready.",
    },
    {
      href: "/guides/context-engineering-for-agents",
      label: "Context Engineering",
      section: "Guides",
      description: "Understand how prompts, files, and workspace state shape agent behavior.",
    },
    {
      href: "/compare",
      label: "Compare AnyCap",
      section: "Evaluate",
      description: "Browse comparison pages for adjacent agent tooling approaches and tradeoffs.",
    },
    {
      href: "/learn/what-agents-cant-do",
      label: "What Agents Can't Do",
      section: "Evaluate",
      description: "Read a practical explainer on where agents still struggle in production workflows.",
    },
    {
      href: "/learn/smart-goal-generator",
      label: "SMART Goal Generator",
      section: "Use Cases",
      description:
        "Turn rough goals into research-backed SMART goals with Codex, Cursor, or Claude Code.",
    },
  ],
  hideBelow: "md",
};

export const seoNavLinks: NavEntry[] = [
  capabilitiesDropdown,
  equipAgentsDropdown,
  learnDropdown,
  { href: "/pricing", label: "Pricing", hideBelow: "lg" },
  { href: "/about", label: "About", hideBelow: "lg" },
];

export const humanNavLinks: NavEntry[] = [
  capabilitiesDropdown,
  equipAgentsDropdown,
  learnDropdown,
  { href: "/pricing", label: "Pricing", hideBelow: "lg" },
  { href: "/about", label: "About", hideBelow: "lg" },
];
