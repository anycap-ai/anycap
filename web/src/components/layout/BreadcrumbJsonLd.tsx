import Link from "next/link";
import { siteConfig } from "@/lib/site";
import { getRequestLocale } from "@/lib/request-locale";
import { localizePublicPath } from "@/lib/site";

const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

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

export async function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  const locale = await getRequestLocale();
  const localizedItems = items.map((item) => ({
    ...item,
    href: item.href ? localizePublicPath(locale, item.href) : undefined,
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: localizedItems.map((item, i) => {
      const isLast = i === localizedItems.length - 1;
      return {
        "@type": "ListItem",
        position: i + 1,
        name: item.name,
        ...(item.href && !isLast ? { item: `${siteConfig.url}${item.href}` } : {}),
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
        className="px-6 pt-8 md:px-12 md:pt-12 lg:px-20"
      >
        <ol className="mx-auto max-w-[1280px] flex flex-wrap items-center gap-2">
          {localizedItems.map((item, i) => {
            const isLast = i === items.length - 1;
            const showLink = Boolean(item.href && !isLast);
            return (
              <li key={i} className="flex items-center gap-2">
                {i > 0 && (
                  <span
                    className="text-[11px] text-[#8fa34e] select-none"
                    style={mono}
                    aria-hidden
                  >
                    ›
                  </span>
                )}
                {showLink ? (
                  <Link
                    href={item.href!}
                    className="text-[11px] tracking-[0.5px] text-[#5a5e52] hover:text-[#1c1f17] transition-colors"
                    style={mono}
                  >
                    {item.name}
                  </Link>
                ) : (
                  <span
                    className="text-[11px] tracking-[0.5px] text-[#3a3e32]"
                    style={mono}
                    aria-current={isLast ? "page" : undefined}
                  >
                    {item.name}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
