import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { FeaturedOnBadge } from "@/components/ui/FeaturedOnBadge";
import { FadeIn } from "@/components/ui/FadeIn";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { createLocalizedMetadataForPath } from "@/lib/localized-metadata";
import { getRequestLocale } from "@/lib/request-locale";
import { defaultLocale } from "@/lib/site";
import { ABOUT_PATH, getAboutMetadata, getAboutPageData } from "./content";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;
const featuredOnHref = "https://goodaitools.com/search?q=anycap";
const featuredOnBadgeSrc = "https://goodaitools.com/assets/images/badge.png";
const featuredOnBadgeAlt = "Featured on Good AI Tools";

export const metadata: Metadata = createLocalizedMetadataForPath(
  defaultLocale,
  ABOUT_PATH,
  getAboutMetadata(defaultLocale),
);

function ReferenceLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  if (href.startsWith("http")) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#1c1f17] underline decoration-[#6b7d3a] underline-offset-4"
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className="text-[#1c1f17] underline decoration-[#6b7d3a] underline-offset-4">
      {children}
    </Link>
  );
}

export default async function AboutPage() {
  const locale = await getRequestLocale();
  const content = getAboutPageData(locale);

  return (
    <>
      <BreadcrumbJsonLd items={content.breadcrumbItems} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(content.aboutPageJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(content.organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(content.faqJsonLd) }}
      />

      <article className="px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[1280px] py-12 md:py-20 lg:py-24">
          <FadeIn>
            <p className="mb-4 text-[11px] tracking-[0.8px] text-[#6b7d3a]" style={mono}>
              {content.eyebrow}
            </p>
            <h1
              className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(32px, 6vw, 72px)" }}
            >
              {content.heroTitle[0]}
              <br />
              {content.heroTitle[1]}
            </h1>
            <p className="mt-6 max-w-[780px] text-base leading-7 text-[#4d5145] md:text-lg">
              {content.heroIntro}
            </p>
            <p className="mt-4 text-[11px] text-[#5a5e52]" style={mono}>
              Last updated 2026-04-15
            </p>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.companyFactsTitle}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {content.companyFacts.map((fact) => (
                  <div key={fact.label} className="rounded-xl border border-[#d4dbb8] p-6">
                    <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                      {fact.label}
                    </p>
                    <p className="text-sm leading-6 text-[#4d5145]">{fact.value}</p>
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
                {content.teamTitle}
              </h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {content.teamCards.map((card) => (
                  <div key={card.title} className="rounded-xl border border-[#d4dbb8] p-6">
                    <h3 className="mb-3 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                      {card.title}
                    </h3>
                    <p className="text-sm leading-6 text-[#4d5145]">{card.body}</p>
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
                {content.timelineTitle}
              </h2>
              <div className="grid gap-4 lg:grid-cols-3">
                {content.timelineItems.map((item) => (
                  <div key={item.label} className="rounded-xl border border-[#d4dbb8] p-6">
                    <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                      {item.label}
                    </p>
                    <p className="text-sm leading-6 text-[#4d5145]">{item.detail}</p>
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
                {content.referencesTitle}
              </h2>
              <div className="grid gap-4 lg:grid-cols-2">
                {content.publicReferences.map((reference) => (
                  <div key={reference.label} className="rounded-xl border border-[#d4dbb8] p-6">
                    <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                      {reference.label}
                    </p>
                    <p className="text-sm leading-6 text-[#4d5145]">
                      <ReferenceLink href={reference.href}>{reference.label}</ReferenceLink>
                      {" — "}
                      {reference.detail}
                    </p>
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
                {content.whatIsTitle}
              </h2>
              <div className="max-w-[820px] space-y-5">
                <p className="text-base leading-7 text-[#4d5145]">{content.whatIsBody1}</p>
                <p className="text-base leading-7 text-[#4d5145]">{content.whatIsBody2}</p>
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.whyTitle}
              </h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {content.whyCards.map((card) => (
                  <div key={card.title} className="rounded-xl border border-[#d4dbb8] p-6">
                    <h3 className="mb-3 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                      {card.title}
                    </h3>
                    <p className="text-sm leading-6 text-[#4d5145]">{card.body}</p>
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
                {content.notTitle}
              </h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {content.notCards.map((card) => (
                  <div key={card.title} className="rounded-xl border border-[#d4dbb8] p-6">
                    <h3 className="mb-3 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                      {card.title}
                    </h3>
                    <p className="text-sm leading-6 text-[#4d5145]">{card.body}</p>
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
                {content.principlesTitle}
              </h2>
              <div className="max-w-[900px] space-y-4">
                {content.principles.map((principle) => (
                  <div key={principle} className="border-l-[3px] border-[#6b7d3a] pl-5">
                    <p className="text-sm leading-6 text-[#4d5145]">{principle}</p>
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
              <div className="max-w-[900px] space-y-4">
                {content.faqItems.map((item) => (
                  <div key={item.question} className="rounded-xl border border-[#d4dbb8] p-6">
                    <h3 className="mb-3 text-sm font-bold leading-6 text-[#1c1f17]" style={mono}>
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
                {content.contactTitle}
              </h2>
              <div className="grid gap-4 lg:grid-cols-3">
                {content.contactPaths.map((path) => (
                  <div key={path.label} className="rounded-xl border border-[#d4dbb8] p-6">
                    <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                      {path.label}
                    </p>
                    <p className="text-sm leading-6 text-[#4d5145]">
                      <ReferenceLink href={path.href}>{path.label}</ReferenceLink>
                      {" — "}
                      {path.detail}
                    </p>
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
                {content.trustTitle}
              </h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {content.trustSignals.map((signal) => (
                  <div key={signal.label} className="rounded-xl border border-[#d4dbb8] p-6">
                    <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                      {signal.label}
                    </p>
                    <p className="text-sm leading-6 text-[#4d5145]">{signal.detail}</p>
                  </div>
                ))}
              </div>
            </section>
          </FadeIn>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <FeaturedOnBadge
                href={featuredOnHref}
                badgeSrc={featuredOnBadgeSrc}
                badgeAlt={featuredOnBadgeAlt}
                description="A quiet placement for third-party badges without interrupting the page flow."
              />
            </section>
          </FadeIn>
        </div>
      </article>
    </>
  );
}
