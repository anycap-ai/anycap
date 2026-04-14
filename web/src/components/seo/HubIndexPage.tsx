import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { FadeIn } from "@/components/ui/FadeIn";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { ArticleByline } from "@/components/seo/ArticleByline";
import type { HubPageDefinition } from "@/lib/seo/hub-pages";
import { siteConfig } from "@/lib/site";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

export function buildHubPageMetadata(page: HubPageDefinition): Metadata {
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: page.path },
    openGraph: {
      type: "website",
      locale: siteConfig.locale,
      url: page.path,
      siteName: siteConfig.siteName,
      title: page.title,
      description: page.description,
    },
  };
}

export function HubIndexPage({
  page,
  breadcrumbItems,
  eyebrow,
}: {
  page: HubPageDefinition;
  breadcrumbItems?: readonly { name: string; href?: string }[];
  eyebrow?: string;
}) {
  const resolvedBreadcrumbItems =
    breadcrumbItems ?? [
      { name: "Home", href: "/" },
      { name: page.title, href: page.path },
    ];

  return (
    <>
      <BreadcrumbJsonLd items={resolvedBreadcrumbItems} />
      <article className="px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[1280px] py-12 md:py-20 lg:py-24">
          <FadeIn>
            <p className="mb-4 text-[11px] tracking-[0.8px] text-[#6b7d3a]" style={mono}>
              {eyebrow ?? page.eyebrow}
            </p>
            <ArticleByline className="mb-3" />
            <h1
              className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(32px, 6vw, 72px)" }}
            >
              {page.heroLines[0]}
              <br />
              {page.heroLines[1]}
            </h1>
            <p className="mt-6 max-w-[760px] text-base leading-7 text-[#4d5145] md:text-lg">
              {page.intro}
            </p>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-6 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {page.overviewTitle}
              </h2>
              <div className="max-w-[860px] space-y-4">
                {page.overviewParagraphs.map((paragraph) => (
                  <p key={paragraph} className="text-base leading-7 text-[#4d5145]">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {page.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-xl border border-[#d4dbb8] bg-[#fffffc]/70 p-6 transition-colors hover:border-[#6b7d3a]"
                  >
                    <h2 className="mb-3 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                      {item.title}
                    </h2>
                    <p className="text-sm leading-6 text-[#4d5145]">{item.description}</p>
                  </Link>
                ))}
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-6 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {page.usageTitle}
              </h2>
              <ul className="max-w-[860px] space-y-3">
                {page.usagePoints.map((point) => (
                  <li key={point} className="flex items-start gap-3 text-sm leading-6 text-[#4d5145]">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#6b7d3a]" />
                    {point}
                  </li>
                ))}
              </ul>
            </section>
          </FadeIn>
        </div>
      </article>
    </>
  );
}
