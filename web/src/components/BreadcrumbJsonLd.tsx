import Link from "next/link";
import { siteConfig } from "@/lib/site";
import { getRequestLocale } from "@/lib/request-locale";
import { localizePublicPath } from "@/lib/site";

const mono = { fontFamily: "var(--font-mono), monospace" } as const;

export interface BreadcrumbItem {
  name: string;
  href?: string;
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
    itemListElement: localizedItems.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      ...(item.href ? { item: `${siteConfig.url}${item.href}` } : {}),
    })),
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
                {item.href && !isLast ? (
                  <Link
                    href={item.href}
                    className="text-[11px] tracking-[2px] uppercase text-[#5a5e52] hover:text-[#1c1f17] transition-colors"
                    style={mono}
                  >
                    {item.name}
                  </Link>
                ) : (
                  <span
                    className="text-[11px] tracking-[2px] uppercase text-[#3a3e32]"
                    style={mono}
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
