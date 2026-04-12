import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { FadeIn } from "@/components/ui/FadeIn";
import { EarlyAccessBanner } from "@/components/landing/EarlyAccessBanner";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { ArticleByline } from "@/components/seo/ArticleByline";
import { getSeoPageChrome } from "@/lib/seo-ia";
import { createLocalizedMetadataForPath } from "@/lib/localized-metadata";
import { getRequestLocale } from "@/lib/request-locale";
import { defaultLocale } from "@/lib/site";
import { CLI_PATH, getCliMetadata, getCliPageData } from "./content";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

export const metadata = createLocalizedMetadataForPath(
  defaultLocale,
  CLI_PATH,
  getCliMetadata(defaultLocale),
);

const pageChrome = getSeoPageChrome("/cli");

export default async function CliPage() {
  const locale = await getRequestLocale();
  const content = getCliPageData(locale);

  return (
    <>
      <BreadcrumbJsonLd items={pageChrome?.breadcrumbItems} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(content.softwareApplicationJsonLd) }}
      />

      <article className="px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[1280px] py-12 md:py-20 lg:py-24">
          <FadeIn>
            <p className="mb-4 text-[11px] tracking-[0.8px] text-[#6b7d3a]" style={mono}>
              {content.eyebrow}
            </p>
            <ArticleByline className="mb-3" author={pageChrome?.authorLabel} />
            <h1
              className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(32px, 6vw, 72px)" }}
            >
              {content.heroTitle[0]}
              <br />
              {content.heroTitle[1]}
            </h1>
            <p className="mt-6 max-w-[760px] text-base leading-7 text-[#4d5145] md:text-lg">
              {content.heroIntro}
            </p>
            <p className="mt-4 text-sm leading-6 text-[#6b7d3a]" style={mono}>
              {content.heroTagline}
            </p>
          </FadeIn>

          <FadeIn className="mt-8">
            <EarlyAccessBanner />
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-6 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.installTitle}
              </h2>
              <p className="mb-4 max-w-[800px] text-sm leading-6 text-[#4d5145]">
                {content.installIntro}
              </p>
              <div className="max-w-[800px] bg-[#1c1f17] px-6 py-5 md:px-8 md:py-6">
                <p className="mb-2 text-[13px] text-[#6b7d3a]" style={mono}>
                  # macOS / Linux / Windows (Git Bash)
                </p>
                <p className="text-[13px] text-[#d4e0a4]" style={mono}>
                  curl -fsSL https://anycap.ai/install.sh | sh
                </p>
                <div className="my-4 border-t border-[#333]" />
                <p className="mb-2 text-[13px] text-[#6b7d3a]" style={mono}>
                  # npm (all platforms)
                </p>
                <p className="text-[13px] text-[#d4e0a4]" style={mono}>
                  npm install -g @anycap/cli
                </p>
                <div className="my-4 border-t border-[#333]" />
                <p className="mb-2 text-[13px] text-[#6b7d3a]" style={mono}>
                  # Verify
                </p>
                <p className="text-[13px] text-[#d4e0a4]" style={mono}>
                  anycap status
                </p>
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.commandsTitle}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {content.capabilities.map((capability) => (
                  <Link
                    key={capability.name}
                    href={capability.href}
                    className="group border border-[#d4dbb8] p-5 transition-colors hover:border-[#6b7d3a]"
                  >
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="inline-block h-2 w-2 rounded-full bg-[#6b7d3a]" />
                      <h3 className="text-[13px] font-bold tracking-[1px] text-[#1c1f17]" style={mono}>
                        {capability.name}
                      </h3>
                      <span className="text-[11px] tracking-[1px] text-[#6b7d3a]" style={mono}>
                        {capability.status}
                      </span>
                    </div>
                    <p className="mb-3 text-sm leading-6 text-[#4d5145]">{capability.description}</p>
                    <code className="text-[12px] text-[#6b7d3a]" style={mono}>
                      {capability.command}
                    </code>
                  </Link>
                ))}
              </div>
              <div className="mt-6">
                <Link
                  href="/capabilities"
                  className="text-[11px] tracking-[0.5px] text-[#6b7d3a] transition-colors hover:text-[#1c1f17]"
                  style={mono}
                >
                  {content.capabilitiesCta}
                </Link>
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-6 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.reasonsTitle}
              </h2>
              <div className="grid gap-4 lg:grid-cols-3">
                {content.reasons.map((reason) => (
                  <div key={reason.title} className="rounded-xl border border-[#d4dbb8] bg-[#fffffc]/70 p-6">
                    <h3 className="mb-3 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                      {reason.title}
                    </h3>
                    <p className="text-sm leading-6 text-[#4d5145]">{reason.description}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <p className="mb-3 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                  {content.ecosystemsLabel}
                </p>
                <div className="flex flex-wrap gap-3">
                  {content.ecosystems.map((ecosystem) =>
                    ecosystem.href ? (
                      <Link
                        key={ecosystem.name}
                        href={ecosystem.href}
                        className="border border-[#d4dbb8] px-4 py-2 text-[12px] tracking-[1px] text-[#1c1f17] transition-colors hover:border-[#6b7d3a] hover:text-[#6b7d3a]"
                        style={mono}
                      >
                        {ecosystem.name}
                      </Link>
                    ) : (
                      <span
                        key={ecosystem.name}
                        className="border border-[#d4dbb8] px-4 py-2 text-[12px] tracking-[1px] text-[#5a5e52]"
                        style={mono}
                      >
                        {ecosystem.name}
                      </span>
                    ),
                  )}
                </div>
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.stackTitle}
              </h2>
              <div className="grid gap-4 lg:grid-cols-3">
                {content.nextPages.map((page) => (
                  <Link
                    key={page.href}
                    href={page.href}
                    className="rounded-xl border border-[#d4dbb8] bg-[#fffffc]/70 p-6 transition-colors hover:border-[#6b7d3a]"
                  >
                    <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                      {page.eyebrow}
                    </p>
                    <h3 className="mb-3 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                      {page.title}
                    </h3>
                    <p className="text-sm leading-6 text-[#4d5145]">{page.summary}</p>
                  </Link>
                ))}
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24 mb-8">
              <div className="flex flex-wrap gap-4">
                {content.ctas.map((cta, index) =>
                  cta.external ? (
                    <a
                      key={cta.label}
                      href={cta.external}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={
                        index === 0
                          ? "inline-block rounded-lg bg-[#6b7d3a] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#f4f5f0] transition-colors hover:bg-[#1c1f17]"
                          : "inline-block rounded-lg border border-[#1c1f17] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                      }
                      style={mono}
                    >
                      {cta.label}
                    </a>
                  ) : (
                    <Link
                      key={cta.label}
                      href={cta.href!}
                      className={
                        index === 0
                          ? "inline-block rounded-lg bg-[#6b7d3a] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#f4f5f0] transition-colors hover:bg-[#1c1f17]"
                          : "inline-block rounded-lg border border-[#1c1f17] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                      }
                      style={mono}
                    >
                      {cta.label}
                    </Link>
                  ),
                )}
              </div>
            </section>
          </FadeIn>
        </div>
      </article>
    </>
  );
}
