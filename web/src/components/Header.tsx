import Link from "next/link";
import { AnycapLogo } from "@/components/brand/AnycapLogo";
import { NavDropdown, type DropdownItem } from "@/components/NavDropdown";
import { getRequestLocale } from "@/lib/request-locale";
import { localizePublicPath } from "@/lib/site";

const mono = { fontFamily: "var(--font-mono), monospace" } as const;

const linkClass =
  "px-2.5 py-1.5 text-sm text-[#3f4437] hover:text-[#1c1f17] hover:bg-[#6b7d3a]/[0.08] active:scale-[0.97] tracking-[0.3px] rounded transition-all duration-200 ease-out";

export type NavItem = {
  href: string;
  label: string;
  hideBelow?: "sm" | "md";
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
    <header className="fixed top-0 left-0 right-0 z-40 px-8 pt-6 md:px-16 md:pt-10 lg:px-24 bg-[#f4f5f0]/80 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <Link href={localizedLogoHref}>
          <AnycapLogo size={36} />
        </Link>
        <nav className="ml-auto flex items-center gap-1">
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
            return (
              <Link
                key={href}
                href={localize(href)}
                prefetch={false}
                className={`${hideBelow ? `hidden ${hideBelow}:inline-block` : ""} ${linkClass}`}
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
  items: [
    { href: "/capabilities/image-generation", label: "Image Generation" },
    { href: "/capabilities/video-generation", label: "Video Generation" },
    { href: "/capabilities/image-understanding", label: "Image Understanding" },
    { href: "/capabilities/video-analysis", label: "Video Analysis" },
  ],
};

const integrationsDropdown: NavDropdownDef = {
  kind: "dropdown",
  label: "Integrations",
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
    { href: "/models", label: "Models" },
    { href: "/guides/install-anycap", label: "Install AnyCap" },
    { href: "/guides/context-engineering-for-agents", label: "Context Engineering" },
    { href: "/guides/workspace-context-engineering", label: "Workspace Context" },
    { href: "/guides/agent-skills-for-developer-tools", label: "Agent Skills" },
    { href: "/guides/what-is-agent-harness", label: "Agent Harness" },
    { href: "/guides/add-tools-to-claude-code", label: "Add Tools to Claude Code" },
    { href: "/compare/anycap-vs-openai-agent-builder", label: "AnyCap vs Agent Builder" },
    { href: "/compare/anycap-vs-composio", label: "AnyCap vs Composio" },
    { href: "/glossary/agent-capability-runtime", label: "What is ACR?" },
  ],
  hideBelow: "md",
};

export const seoNavLinks: NavEntry[] = [
  capabilitiesDropdown,
  integrationsDropdown,
  resourcesDropdown,
  { href: "/for-human", label: "About", hideBelow: "sm" },
  { href: "/", label: "I'm Agent ->" },
];

export const humanNavLinks: NavEntry[] = [
  capabilitiesDropdown,
  integrationsDropdown,
  resourcesDropdown,
  { href: "/for-human", label: "About", hideBelow: "sm" },
];
