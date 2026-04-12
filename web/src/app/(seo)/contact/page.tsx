import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { EmailActionButton } from "@/components/ui/EmailActionButton";
import { FadeIn } from "@/components/ui/FadeIn";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { createLocalizedMetadataForPath } from "@/lib/localized-metadata";
import { getRequestLocale } from "@/lib/request-locale";
import { defaultLocale } from "@/lib/site";
import { CONTACT_PATH, getContactMetadata, getContactPageData } from "./content";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;
const bodyClass = "text-base leading-7 text-[#4d5145]";
const listClass =
  "mt-5 list-disc space-y-3 pl-5 text-base leading-7 text-[#4d5145] marker:text-[#6b7d3a]";
const linkClass = "text-[#1c1f17] underline decoration-[#6b7d3a] underline-offset-4";
const buttonLinkClass = `${linkClass} cursor-pointer border-0 bg-transparent p-0`;

export const metadata: Metadata = createLocalizedMetadataForPath(
  defaultLocale,
  CONTACT_PATH,
  getContactMetadata(defaultLocale),
);

function ContactLink({
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
        className={linkClass}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={linkClass}>
      {children}
    </Link>
  );
}

function PageSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-14 md:mt-16">
      <h2 className="text-[22px] leading-8 tracking-[-0.01em] text-[#1c1f17] md:text-[26px]">
        {title}
      </h2>
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}

export default async function ContactPage() {
  const locale = await getRequestLocale();
  const content = getContactPageData(locale);

  return (
    <>
      <BreadcrumbJsonLd items={content.breadcrumbItems} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(content.contactPageJsonLd) }}
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
            <PageSection title={content.routesTitle}>
              <div className="space-y-6">
                {content.contactRoutes.map((route) => (
                  <div key={route.title}>
                    <h3 className="text-[18px] leading-7 tracking-[-0.01em] text-[#1c1f17] md:text-[20px]">
                      {route.title}
                    </h3>
                    <p className={`${bodyClass} mt-2`}>
                      {route.detail}{" "}
                      {route.ctaKind === "email" ? (
                        <EmailActionButton
                          subject={route.ctaSubject}
                          className={buttonLinkClass}
                          aria-label="Email the AnyCap team"
                        >
                          {route.ctaLabel}
                        </EmailActionButton>
                      ) : (
                        <ContactLink href={route.ctaHref}>{route.ctaLabel}</ContactLink>
                      )}
                      .
                    </p>
                  </div>
                ))}
              </div>
            </PageSection>
          </FadeIn>

          <FadeIn>
            <PageSection title={content.checklistTitle}>
              <ul className={listClass}>
                {content.supportChecklist.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </PageSection>
          </FadeIn>

          <FadeIn>
            <PageSection title={content.directTitle}>
              <p className={bodyClass}>
                {content.directBody1}{" "}
                <EmailActionButton
                  subject="AnyCap support request"
                  className={buttonLinkClass}
                  aria-label="Email the AnyCap team"
                >
                  the AnyCap team
                </EmailActionButton>
                .
              </p>
              <p className={bodyClass}>
                {content.directBody2}{" "}
                <ContactLink href="/cli">CLI surface</ContactLink> or route details through the
                public{" "}
                <ContactLink href="https://github.com/anycap-ai/anycap/issues">
                  GitHub issue tracker
                </ContactLink>
                .
              </p>
              <p className={bodyClass}>
                {content.directBody3} <ContactLink href="/guides/install-anycap">install guide</ContactLink>.{" "}
                For product and plan context, review the <ContactLink href="/pricing">pricing page</ContactLink>.
              </p>
            </PageSection>
          </FadeIn>
        </div>
      </article>
    </>
  );
}
