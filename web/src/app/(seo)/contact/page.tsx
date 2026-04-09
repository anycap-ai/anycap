import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { FadeIn } from "@/components/ui/FadeIn";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { siteConfig } from "@/lib/site";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;
const lastUpdatedLabel = "April 9, 2026";
const contactEmail = "admin@anycap.ai";
const contactHref = `mailto:${contactEmail}`;
const sectionTitleClass =
  "text-[22px] leading-8 tracking-[-0.01em] text-[#1c1f17] md:text-[26px]";
const subTitleClass =
  "text-[18px] leading-7 tracking-[-0.01em] text-[#1c1f17] md:text-[20px]";
const bodyClass = "text-base leading-7 text-[#4d5145]";
const listClass =
  "mt-5 list-disc space-y-3 pl-5 text-base leading-7 text-[#4d5145] marker:text-[#6b7d3a]";
const linkClass = "text-[#1c1f17] underline decoration-[#6b7d3a] underline-offset-4";

export const metadata: Metadata = {
  title: "Contact AnyCap - Support, pricing, and issue reporting",
  description:
    "Contact AnyCap for install help, pricing questions, bug reports, security or privacy questions, and product feedback.",
  alternates: { canonical: "/contact" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/contact",
    siteName: siteConfig.siteName,
    title: "Contact AnyCap - Support, pricing, and issue reporting",
    description:
      "Find the best path for AnyCap support, pricing questions, bug reports, and security or privacy requests.",
  },
};

const contactPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: "Contact AnyCap",
  description:
    "Contact AnyCap for support, pricing, product questions, security reporting, and privacy requests.",
  url: `${siteConfig.url}/contact`,
  mainEntity: {
    "@type": "Organization",
    name: siteConfig.siteName,
    url: siteConfig.url,
    email: contactEmail,
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: contactEmail,
        url: `${siteConfig.url}/contact`,
      },
    ],
  },
};

const contactRoutes = [
  {
    title: "Product support and install help",
    detail:
      "If you are trying to get your first workflow running, start with the install guide and include the agent, capability, and exact step that failed.",
    ctaLabel: "Open install guide",
    ctaHref: "/guides/install-anycap",
  },
  {
    title: "Bug reports and regressions",
    detail:
      "For reproducible bugs, GitHub issues are the best path because they keep stack traces, environment details, and screenshots in one public thread.",
    ctaLabel: "Open GitHub issues",
    ctaHref: "https://github.com/anycap-ai/anycap/issues",
  },
  {
    title: "Pricing and enterprise questions",
    detail:
      "If you need larger credit volume, invoiced billing, or product fit clarification, contact the team directly by email.",
    ctaLabel: `Email ${contactEmail}`,
    ctaHref: contactHref,
  },
] as const;

const supportChecklist = [
  "Which agent you are using, such as Claude Code, Cursor, Codex, or Manus",
  "Which capability or page you were trying to use",
  "The expected output and the actual result",
  "Any relevant error message, request ID, or screenshot",
  "Whether the problem is blocking production, evaluation, or a one-off test",
] as const;

function ContactLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  if (href.startsWith("http") || href.startsWith("mailto:")) {
    return (
      <a
        href={href}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
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
      <h2 className={sectionTitleClass}>{title}</h2>
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}

export default function ContactPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Home", href: "/" }, { name: "Contact" }]} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactPageJsonLd) }}
      />

      <article className="px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[820px] py-12 md:py-20 lg:py-24">
          <FadeIn>
            <p className="mb-4 text-[11px] tracking-[0.8px] text-[#6b7d3a]" style={mono}>
              Contact
            </p>
            <h1
              className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(32px, 6vw, 72px)" }}
            >
              Get in touch with the AnyCap team.
            </h1>
            <p className="mt-6 max-w-[760px] text-base leading-7 text-[#4d5145] md:text-lg">
              Use this page when you need install help, pricing clarification, product fit
              questions, bug reporting paths, or a clear route for security and privacy requests.
            </p>
            <p className="mt-4 text-[11px] text-[#5a5e52]" style={mono}>
              Last updated {lastUpdatedLabel}
            </p>
          </FadeIn>

          <div className="mt-14 md:mt-16">
            <hr className="border-t border-[#dce0d2]" />
          </div>

          <FadeIn>
            <PageSection title="Best route by question">
              <div className="space-y-6">
                {contactRoutes.map((route) => (
                  <div key={route.title}>
                    <h3 className={subTitleClass}>{route.title}</h3>
                    <p className={`${bodyClass} mt-2`}>
                      {route.detail}{" "}
                      <ContactLink href={route.ctaHref}>{route.ctaLabel}</ContactLink>.
                    </p>
                  </div>
                ))}
              </div>
            </PageSection>
          </FadeIn>

          <FadeIn>
            <PageSection title="Include this when you reach out">
              <ul className={listClass}>
                {supportChecklist.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </PageSection>
          </FadeIn>

          <FadeIn>
            <PageSection title="Direct contact">
              <p className={bodyClass}>
                Email{" "}
                <ContactLink href={contactHref}>{contactEmail}</ContactLink> for pricing
                conversations, privacy requests, or any issue that should not live in a public
                GitHub thread.
              </p>
              <p className={bodyClass}>
                If the issue comes from a live workflow, you can also use the{" "}
                <ContactLink href="/cli">CLI surface</ContactLink> or route details through the
                public <ContactLink href="https://github.com/anycap-ai/anycap/issues">GitHub issue tracker</ContactLink>.
              </p>
              <p className={bodyClass}>
                For install help, start with the{" "}
                <ContactLink href="/guides/install-anycap">install guide</ContactLink>. For product
                and plan context, review the{" "}
                <ContactLink href="/pricing">pricing page</ContactLink>.
              </p>
            </PageSection>
          </FadeIn>
        </div>
      </article>
    </>
  );
}
