import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { ArticleByline } from "@/components/seo/ArticleByline";
import { FadeIn } from "@/components/ui/FadeIn";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { EarlyAccessBanner } from "@/components/landing/EarlyAccessBanner";
import { getSeoPageChrome } from "@/lib/seo/ia";
import { createLocalizedMetadataForPath } from "@/lib/localized-metadata";
import { getRequestLocale } from "@/lib/request-locale";
import { hasJsonLdContent } from "@/lib/schema";
import { defaultLocale } from "@/lib/site";
import {
  getInstallAnycapMetadata,
  getInstallAnycapPageData,
  INSTALL_ANYCAP_PATH,
} from "./content";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

export const metadata = createLocalizedMetadataForPath(
  defaultLocale,
  INSTALL_ANYCAP_PATH,
  getInstallAnycapMetadata(defaultLocale),
);

const pageChrome = getSeoPageChrome(INSTALL_ANYCAP_PATH);

export default async function InstallAnycapPage() {
  const locale = await getRequestLocale();
  const content = getInstallAnycapPageData(locale);

  return (
    <>
      <BreadcrumbJsonLd items={pageChrome?.breadcrumbItems} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(content.guideJsonLd) }}
      />
      {hasJsonLdContent(content.faqJsonLd) ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(content.faqJsonLd) }}
        />
      ) : null}

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
            <p className="mt-6 max-w-[820px] text-base leading-7 text-[#4d5145] md:text-lg">
              {content.heroIntro}
            </p>
            <p className="mt-4 text-sm text-[#6b7d3a]" style={mono}>
              {content.lastUpdatedLabel}
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
                {content.neededTitle}
              </h2>
              <ul className="max-w-[820px] space-y-3">
                {content.neededItems.map((item) => (
                  <li key={item} className="border-l-[3px] border-[#6b7d3a] pl-5 text-sm leading-6 text-[#4d5145]">
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.stepsTitle}
              </h2>
              <div className="max-w-[860px] space-y-6">
                {content.steps.map((step, index) => (
                  <div key={step.title} className="rounded-xl border border-[#d4dbb8] bg-[#fffffc]/70 p-6">
                    <p className="mb-3 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                      Step {index + 1}
                    </p>
                    <h3 className="mb-3 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                      {step.title}
                    </h3>
                    <pre className="overflow-x-auto rounded-lg bg-[#1c1f17] p-4 text-sm text-[#f9faf5]">
                      <code>{step.code}</code>
                    </pre>
                    <p className="mt-3 text-sm leading-6 text-[#4d5145]">{step.note}</p>
                  </div>
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
                {content.verifyTitle}
              </h2>
              <p className="max-w-[820px] text-base leading-7 text-[#4d5145]">{content.verifyIntro}</p>
              <div className="mt-6 max-w-[860px] space-y-3">
                {content.verifyCommands.map((command) => (
                  <pre
                    key={command}
                    className="overflow-x-auto rounded-lg border border-[#d4dbb8] bg-[#f9faf5]/80 p-4 text-sm text-[#1c1f17]"
                  >
                    <code>{command}</code>
                  </pre>
                ))}
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.agentsTitle}
              </h2>
              <div className="grid gap-4 lg:grid-cols-3">
                {content.agents.map((agent) => (
                  <div key={agent.name} className="rounded-xl border border-[#d4dbb8] p-5">
                    <Link href={agent.href} className="mb-2 block text-[15px] font-bold text-[#1c1f17]" style={mono}>
                      {agent.name}
                    </Link>
                    <pre className="mb-3 overflow-x-auto rounded-lg bg-[#1c1f17] p-3 text-xs text-[#f9faf5]">
                      <code>{agent.command}</code>
                    </pre>
                    <p className="text-sm leading-6 text-[#4d5145]">{agent.body}</p>
                  </div>
                ))}
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.faqTitle}
              </h2>
              <div className="max-w-[820px] space-y-4">
                {content.faqItems.map((item) => (
                  <div key={item.question} className="rounded-xl border border-[#d4dbb8] p-5">
                    <h3 className="mb-2 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                      {item.question}
                    </h3>
                    <p className="text-sm leading-6 text-[#4d5145]">{item.answer}</p>
                  </div>
                ))}
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.nextTitle}
              </h2>
              <div className="grid gap-4 lg:grid-cols-3">
                {content.nextPages.map((page) => (
                  <Link
                    key={page.href}
                    href={page.href}
                    className="rounded-xl border border-[#d4dbb8] p-5 transition-colors hover:border-[#6b7d3a]"
                  >
                    <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                      {page.eyebrow}
                    </p>
                    <h3 className="mb-2 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                      {page.title}
                    </h3>
                    <p className="text-sm leading-6 text-[#4d5145]">{page.body}</p>
                  </Link>
                ))}
              </div>
            </section>
          </FadeIn>

          <FadeIn className="mt-12 flex flex-wrap gap-3">
            {content.ctas.map((cta) => (
              <Link
                key={cta.href}
                href={cta.href}
                className={
                  cta.primary
                    ? "rounded-full bg-[#1c1f17] px-5 py-2.5 text-sm text-[#f9faf5]"
                    : "rounded-full border border-[#d4dbb8] px-5 py-2.5 text-sm text-[#1c1f17]"
                }
              >
                {cta.label}
              </Link>
            ))}
          </FadeIn>
        </div>
      </article>
    </>
  );
}
