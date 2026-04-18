import type { Metadata } from "next";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { createLocalizedMetadataForPath } from "@/lib/localized-metadata";
import { defaultLocale } from "@/lib/site";
import { getRequestLocale } from "@/lib/request-locale";
import { EarlyAccessBanner } from "@/components/landing/EarlyAccessBanner";
import { FadeIn } from "@/components/ui/FadeIn";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { getMcpGlossaryMetadata, getMcpGlossaryPageData } from "../content";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

export const metadata: Metadata = createLocalizedMetadataForPath(
  defaultLocale,
  "/glossary/model-context-protocol",
  getMcpGlossaryMetadata(defaultLocale),
);

export default async function McpGlossaryPage() {
  const locale = await getRequestLocale();
  const content = getMcpGlossaryPageData(locale);

  return (
    <>
      <BreadcrumbJsonLd items={content.breadcrumbItems} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(content.definitionJsonLd) }}
      />

      <article className="px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[1280px] py-12 md:py-20 lg:py-24">
          <FadeIn>
            <p className="mb-4 text-[11px] tracking-[0.8px] text-[#6b7d3a]" style={mono}>
              {content.eyebrow}
            </p>
            <h1
              className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(28px, 5vw, 60px)" }}
            >
              {content.heroTitle[0]}
              <br />
              {content.heroTitle[1]}
            </h1>
          </FadeIn>

          <FadeIn>
            <div className="mt-8 border-l-[3px] border-[#6b7d3a] pl-6 max-w-[720px]">
              <p className="text-base leading-7 text-[#4d5145] md:text-lg">
                {content.intro}
              </p>
            </div>
          </FadeIn>

          <FadeIn className="mt-8">
            <EarlyAccessBanner />
          </FadeIn>

          <div className="mt-16 md:mt-24"><hr className="border-t border-[#d4dbb8]" /></div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="text-lg md:text-xl text-[#1c1f17] mb-6" style={{ ...pixel }}>
                {content.whyTitle}
              </h2>
              <div className="space-y-6 max-w-[760px]">
                <p className="text-base leading-7 text-[#4d5145]">
                  {content.whyBody[0]}
                </p>
                <p className="text-base leading-7 text-[#4d5145]">
                  {content.whyBody[1]}
                </p>
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24"><hr className="border-t border-[#d4dbb8]" /></div>

          <FadeIn>
            <section className="mt-16 md:mt-24 mb-8">
              <div className="flex flex-wrap gap-4">
                {content.relatedLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={
                      link.variant === "primary"
                        ? "inline-block rounded-lg bg-[#6b7d3a] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#f4f5f0] transition-colors hover:bg-[#1c1f17]"
                        : "inline-block rounded-lg border border-[#1c1f17] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                    }
                    style={mono}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </section>
          </FadeIn>
        </div>
      </article>
    </>
  );
}
