import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { FadeIn } from "@/components/ui/FadeIn";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { siteConfig } from "@/lib/site";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;
const lastUpdatedLabel = "April 9, 2026";
const sectionTitleClass =
  "text-[22px] leading-8 tracking-[-0.01em] text-[#1c1f17] md:text-[26px]";
const bodyClass = "text-base leading-7 text-[#4d5145]";
const listClass =
  "mt-5 list-disc space-y-3 pl-5 text-base leading-7 text-[#4d5145] marker:text-[#6b7d3a]";
const linkClass = "text-[#1c1f17] underline decoration-[#6b7d3a] underline-offset-4";

export const metadata: Metadata = {
  title: "AnyCap Privacy Policy",
  description:
    "Read how AnyCap handles account data, usage logs, submitted content, analytics, third-party providers, and privacy requests.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/privacy",
    siteName: siteConfig.siteName,
    title: "AnyCap Privacy Policy",
    description:
      "Read how AnyCap handles account data, billing and usage records, submitted content, analytics, and privacy requests.",
  },
};

const privacyPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "AnyCap Privacy Policy",
  description:
    "Privacy policy for AnyCap, including account data, submitted content, analytics, third-party providers, and contact details.",
  url: `${siteConfig.url}/privacy`,
  dateModified: "2026-04-09",
};

const infoCategories = [
  "Account and authentication details, such as identifiers needed to sign in and manage access.",
  "Billing, credit, and usage records needed to operate pay-as-you-go workflows and transaction history.",
  "Prompts, files, URLs, outputs, and workflow data you submit when you use generation, retrieval, storage, or publishing features.",
  "Device, browser, and request metadata used for security, abuse prevention, reliability, and troubleshooting.",
  "Communications you send to AnyCap, including support requests, issue reports, and feedback.",
] as const;

const useCases = [
  "Authenticate users and operate the product surfaces you ask us to run.",
  "Route requests to AnyCap systems and relevant third-party model or infrastructure providers.",
  "Measure usage, credits, billing events, and operational health.",
  "Investigate outages, abuse, fraud, bugs, and security incidents.",
  "Improve product quality, support, and documentation.",
  "Meet legal obligations and enforce platform rules.",
] as const;

const sharingCategories = [
  "Infrastructure, authentication, hosting, analytics, and payment providers that help run the service.",
  "Model or capability providers when a workflow requires AnyCap to send prompts, files, or related request data upstream to fulfill your request.",
  "Advisers, affiliates, or authorities when required for compliance, legal process, or security response.",
] as const;

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

export default function PrivacyPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Home", href: "/" }, { name: "Privacy" }]} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(privacyPageJsonLd) }}
      />

      <article className="px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[820px] py-12 md:py-20 lg:py-24">
          <FadeIn>
            <p className="mb-4 text-[11px] tracking-[0.8px] text-[#6b7d3a]" style={mono}>
              Privacy
            </p>
            <h1
              className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(32px, 6vw, 72px)" }}
            >
              AnyCap Privacy Policy
            </h1>
            <p className="mt-6 max-w-[760px] text-base leading-7 text-[#4d5145] md:text-lg">
              This policy explains what data AnyCap handles, why it is used, when it may be shared
              with service providers, and how to reach the team about privacy questions.
            </p>
            <p className="mt-4 text-[11px] text-[#5a5e52]" style={mono}>
              Last updated {lastUpdatedLabel}
            </p>
          </FadeIn>

          <div className="mt-14 md:mt-16">
            <hr className="border-t border-[#dce0d2]" />
          </div>

          <FadeIn>
            <PageSection title="Information AnyCap may collect">
              <p className={bodyClass}>
                Depending on the workflow and product surface you use, AnyCap may handle the
                following categories of information:
              </p>
              <ul className={listClass}>
                {infoCategories.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </PageSection>
          </FadeIn>

          <FadeIn>
            <PageSection title="How the information is used">
              <ul className={listClass}>
                {useCases.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </PageSection>
          </FadeIn>

          <FadeIn>
            <PageSection title="Sharing, retention, and security">
              <ul className={listClass}>
                {sharingCategories.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className={bodyClass}>
                AnyCap keeps data only as long as reasonably necessary for product operation,
                security, support, billing, compliance, and legitimate business record-keeping.
                Retention can vary by data type, environment, and legal obligation.
              </p>
              <p className={bodyClass}>
                We use administrative, technical, and organizational measures intended to reduce
                unauthorized access, misuse, or disclosure. No system can guarantee perfect
                security, so avoid submitting information that you would not want processed by the
                requested workflow.
              </p>
            </PageSection>
          </FadeIn>

          <FadeIn>
            <PageSection title="Privacy questions and requests">
              <p className={bodyClass}>
                If you need to ask about account data, submitted content, deletion requests, or
                another privacy matter, email{" "}
                <a
                  href="mailto:admin@anycap.ai?subject=AnyCap%20privacy%20request"
                  className={linkClass}
                >
                  admin@anycap.ai
                </a>{" "}
                or use the{" "}
                <Link href="/contact" className={linkClass}>
                  contact page
                </Link>
                .
              </p>
              <p className={bodyClass}>
                This policy should be read together with the{" "}
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
