import Link from "next/link";
import { AnycapLogo } from "@/components/brand/AnycapLogo";
import { MobileNavMenu, type MobileNavEntry } from "@/components/layout/MobileNavMenu";
import { NavDropdown } from "@/components/layout/NavDropdown";
import { CommunityActions } from "@/components/ui/CommunityActions";
import { getRequestLocale } from "@/lib/request-locale";
import {
  humanNavLinks,
  seoNavLinks,
  type NavDropdownDef,
  type NavEntry,
  type NavItem,
} from "@/lib/seo-navigation";
import { localizePublicPath } from "@/lib/site";

const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

const baseLinkClass =
  "px-3 py-2 text-[15px] tracking-[0.3px] rounded-lg transition-all duration-200 ease-out";

const defaultLinkClass = `${baseLinkClass} text-[#3f4437] hover:text-[#1c1f17] hover:bg-[#6b7d3a]/[0.08] active:scale-[0.97]`;

const hideBelowInlineClass: Record<string, string> = {
  sm: "hidden sm:inline-block",
  md: "hidden md:inline-block",
  lg: "hidden lg:inline-block",
  xl: "hidden xl:inline-block",
};
const primaryLinkClass =
  `${baseLinkClass} px-5 text-[#f4f5f0] bg-[#6b7d3a] border border-[#6b7d3a] hover:bg-[#1c1f17] hover:border-[#1c1f17] active:scale-[0.97]`;

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
          align={entry.align}
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
    <>
      <header
        className="fixed left-0 right-0 z-40 bg-[#f4f5f0]/80 px-4 py-3 backdrop-blur-sm sm:px-5 sm:py-4 md:px-16 md:py-6 lg:px-24"
        style={{ top: topOffset }}
      >
        <div className="relative flex items-center gap-2 sm:gap-3">
          <Link href={localizedLogoHref} className="shrink-0">
            <span className="block md:hidden"><AnycapLogo size={36} /></span>
            <span className="hidden md:block"><AnycapLogo size={42} /></span>
          </Link>
          <div className="ml-auto flex min-w-0 items-center gap-1 sm:gap-2">
            <nav className="hidden min-w-0 items-center gap-0.5 sm:gap-2 xl:absolute xl:left-1/2 xl:flex xl:-translate-x-1/2">
              {links.map(renderEntry)}
            </nav>
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 xl:hidden">
              {authSlot}
              <MobileNavMenu entries={mobileEntries} />
            </div>
          </div>
        </div>
      </header>

      <div
        className="fixed right-4 z-[60] hidden h-[90px] items-center gap-2 sm:right-5 md:right-16 lg:right-24 xl:flex"
        style={{ top: topOffset }}
      >
        <CommunityActions variant="desktop" />
        {authSlot}
      </div>
    </>
  );
}

export { humanNavLinks, seoNavLinks };
export type { NavDropdownDef, NavEntry, NavItem };
