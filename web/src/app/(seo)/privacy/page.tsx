import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { EmailActionButton } from "@/components/ui/EmailActionButton";
import { FadeIn } from "@/components/ui/FadeIn";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { createLocalizedMetadataForPath } from "@/lib/localized-metadata";
import { getRequestLocale } from "@/lib/request-locale";
import { defaultLocale } from "@/lib/site";
import { getPrivacyMetadata, getPrivacyPageData, PRIVACY_PATH } from "./content";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;
const sectionTitleClass =
  "text-[22px] leading-8 tracking-[-0.01em] text-[#1c1f17] md:text-[26px]";
const bodyClass = "text-base leading-7 text-[#4d5145]";
const listClass =
  "mt-5 list-disc space-y-3 pl-5 text-base leading-7 text-[#4d5145] marker:text-[#6b7d3a]";
const linkClass = "text-[#1c1f17] underline decoration-[#6b7d3a] underline-offset-4";
const buttonLinkClass = `${linkClass} cursor-pointer border-0 bg-transparent p-0`;

export const metadata: Metadata = createLocalizedMetadataForPath(
  defaultLocale,
  PRIVACY_PATH,
  getPrivacyMetadata(defaultLocale),
);

function PageSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-14 md:mt-16">
      <h2 className={sectionTitleClass}>{title}</h2>
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

export default async function PrivacyPage() {
  const locale = await getRequestLocale();
  const content = getPrivacyPageData(locale);

  return (
    <>
      <BreadcrumbJsonLd items={content.breadcrumbItems} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(content.privacyPageJsonLd) }}
      />

      <article className="px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[820px] py-12 md:py-20 lg:py-24">
          <FadeIn>
            <p className="mb-4 text-[11px] tracking-[0.8px] text-[#6b7d3a]" style={mono}>
              {content.eyebrow}
            </p>
            <h1
              className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(32px, 6vw, 72px)" }}
            >
              {content.heroTitle}
            </h1>
            <p className="mt-6 max-w-[760px] text-base leading-7 text-[#4d5145] md:text-lg">
              {content.heroIntro}
            </p>
            <p className="mt-4 text-[11px] text-[#5a5e52]" style={mono}>
              {content.lastUpdatedLabel}
            </p>
          </FadeIn>

          <div className="mt-14 md:mt-16">
            <hr className="border-t border-[#dce0d2]" />
          </div>

          <FadeIn>
            <PageSection title={content.sections.infoTitle}>
              <p className={bodyClass}>{content.sections.infoIntro}</p>
              <ul className={listClass}>
                {content.sections.infoCategories.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </PageSection>
          </FadeIn>

          <FadeIn>
            <PageSection title={content.sections.useTitle}>
              <ul className={listClass}>
                {content.sections.useCases.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </PageSection>
          </FadeIn>

          <FadeIn>
            <PageSection title={content.sections.sharingTitle}>
              <ul className={listClass}>
                {content.sections.sharingCategories.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className={bodyClass}>{content.sections.retentionText}</p>
              <p className={bodyClass}>{content.sections.securityText}</p>
            </PageSection>
          </FadeIn>

          <FadeIn>
            <PageSection title={content.sections.requestTitle}>
              <p className={bodyClass}>
                {content.sections.requestText1}{" "}
                <EmailActionButton subject="AnyCap privacy request" className={buttonLinkClass}>
                  the AnyCap team
                </EmailActionButton>{" "}
                or use the{" "}
                <Link href="/contact" className={linkClass}>
                  contact page
                </Link>
                .
              </p>
              <p className={bodyClass}>
                {content.sections.requestText2}{" "}
                <Link href="/terms" className={linkClass}>
                  Terms of Service
                </Link>
                , the{" "}
                <Link href="/pricing" className={linkClass}>
                  pricing
                </Link>{" "}
                page, and the{" "}
                <Link href="/about" className={linkClass}>
                  about
                </Link>{" "}
                page.
              </p>
            </PageSection>
          </FadeIn>
        </div>
      </article>
    </>
  );
}
