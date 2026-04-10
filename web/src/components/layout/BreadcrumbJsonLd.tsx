import Link from "next/link";
import { getSeoBreadcrumbItems } from "@/lib/seo-ia";
import { siteConfig } from "@/lib/site";
import { getRequestLocale, getRequestPathname } from "@/lib/request-locale";
import { localizePublicPath, stripLocalePrefix } from "@/lib/site";

const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

function Chevron() {
  return (
    <svg
      aria-hidden
      className="h-3 w-3 text-[#8fa34e]"
      viewBox="0 0 12 12"
      fill="none"
    >
      <path
        d="M4.5 2.5L8 6l-3.5 3.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HomeGlyph() {
  return (
    <svg
      aria-hidden
      className="h-3.5 w-3.5 text-[#5a5e52]"
      viewBox="0 0 16 16"
      fill="none"
    >
      <path
        d="M2.75 6.75L8 2.75l5.25 4v6.5h-3.5V9.5h-3.5v3.75h-3.5v-6.5z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export interface BreadcrumbItem {
  name: string;
  /** URL path used for JSON-LD `item` and intermediate visual links. */
  href?: string;
  /**
   * Retained for backwards compatibility. Non-last breadcrumb items with
   * `href` are always rendered as links so the visible trail matches the
   * structured breadcrumb trail Google reads.
   */
  unlinkable?: boolean;
}

export async function BreadcrumbJsonLd({ items = [] }: { items?: readonly BreadcrumbItem[] }) {
  const locale = await getRequestLocale();
  const requestPathname = await getRequestPathname();
  const publicPath = stripLocalePrefix(requestPathname).pathname;
  const resolvedItems = items.length > 0 ? items : (getSeoBreadcrumbItems(publicPath) ?? []);

  const localizedItems = resolvedItems.map((item, index) => {
    const isLast = index === resolvedItems.length - 1;
    const resolvedHref =
      item.href ? localizePublicPath(locale, item.href) : isLast ? requestPathname : undefined;

    return {
      ...item,
      href: resolvedHref,
    };
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: localizedItems.map((item, i) => {
      return {
        "@type": "ListItem",
        position: i + 1,
        name: item.name,
        ...(item.href ? { item: `${siteConfig.url}${item.href}` } : {}),
      };
    }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav
        aria-label="Breadcrumb"
        className="px-6 pt-7 md:px-12 md:pt-10 lg:px-20"
      >
        <div className="mx-auto max-w-[1280px]">
          <ol className="inline-flex max-w-full flex-wrap items-center gap-2 rounded-full border border-[#d8dcd0] bg-[#fbfcf8]/85 px-3 py-2 shadow-[0_1px_0_rgba(28,31,23,0.04)] backdrop-blur-sm">
            {localizedItems.map((item, i) => {
              const isLast = i === localizedItems.length - 1;
              const showLink = Boolean(item.href && !isLast);
              return (
                <li key={i} className="flex items-center gap-2">
                  {i > 0 ? <Chevron /> : null}
                  {showLink ? (
                    <Link
                      href={item.href!}
                      className="inline-flex items-center gap-1.5 rounded-full px-1.5 py-0.5 text-[11px] tracking-[0.45px] text-[#5a5e52] hover:bg-[#eef2e5] hover:text-[#1c1f17] transition-colors"
                      style={mono}
                    >
                      {i === 0 ? <HomeGlyph /> : null}
                      {item.name}
                    </Link>
                  ) : (
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#eef2e5] px-1.5 py-0.5 text-[11px] tracking-[0.45px] text-[#1c1f17]"
                      style={mono}
                      aria-current={isLast ? "page" : undefined}
                    >
                      {i === 0 ? <HomeGlyph /> : null}
                      {item.name}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </nav>
    </>
  );
}
