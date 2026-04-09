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
const subTitleClass =
  "text-[18px] leading-7 tracking-[-0.01em] text-[#1c1f17] md:text-[20px]";
const bodyClass = "text-base leading-7 text-[#4d5145]";
const listClass =
  "mt-4 list-disc space-y-3 pl-5 text-base leading-7 text-[#4d5145] marker:text-[#6b7d3a]";
const linkClass = "text-[#1c1f17] underline decoration-[#6b7d3a] underline-offset-4";

export const metadata: Metadata = {
  title: "AnyCap Terms of Service",
  description:
    "Read the baseline AnyCap terms covering product access, acceptable use, third-party providers, billing surfaces, and service changes.",
  alternates: { canonical: "/terms" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/terms",
    siteName: siteConfig.siteName,
    title: "AnyCap Terms of Service",
    description:
      "Read the baseline AnyCap terms covering access, acceptable use, third-party providers, and service changes.",
  },
};

const termsPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "AnyCap Terms of Service",
  description:
    "Terms of service for AnyCap, covering access, acceptable use, third-party providers, billing surfaces, and service changes.",
  url: `${siteConfig.url}/terms`,
  dateModified: "2026-04-09",
};

const keyTerms = [
  {
    title: "Authorized workflows only",
    body: "Use AnyCap only with prompts, files, URLs, and instructions you are authorized to process through the requested agent workflow.",
  },
  {
    title: "You own the decisions",
    body: "You remain responsible for submitted inputs, downstream use of outputs, and whether the workflow fits your policies, contracts, and compliance needs.",
  },
  {
    title: "Capabilities can evolve",
    body: "Models, routes, limits, interfaces, and provider availability may change as AnyCap and upstream systems evolve.",
  },
  {
    title: "We may protect the service",
    body: "AnyCap may meter, rate-limit, queue, reject, or suspend use when needed for abuse prevention, billing enforcement, legal compliance, platform stability, or security.",
  },
] as const;

const coreTerms = [
  {
    kicker: "Scope",
    title: "What these terms cover",
    bullets: [
      "AnyCap provides an AI agent capability runtime, related web surfaces, installation paths, billing surfaces, and support materials for agent-led workflows.",
      "Using any part of the service means you agree to these baseline public terms and to the pricing or product notices shown when a workflow, plan, or paid surface is used.",
      "If you have a separate signed agreement with AnyCap, that written agreement controls to the extent it conflicts with this public page.",
    ],
  },
  {
    kicker: "Access",
    title: "Accounts, credentials, and local environments",
    bullets: [
      "Keep accounts, API keys, agent credentials, and connected local environments secure and reasonably controlled.",
      "You are responsible for activity occurring through your account or credentials unless caused directly by AnyCap.",
      "Do not bypass quota controls, access restrictions, plan limits, billing logic, or security safeguards.",
    ],
  },
  {
    kicker: "Inputs",
    title: "Prompts, files, URLs, and authority to use them",
    bullets: [
      "You remain responsible for the prompts, files, URLs, instructions, and third-party data you submit through AnyCap.",
      "Only submit content you are authorized to process and that is lawful to send through the requested workflow.",
      "Before sending production data, confirm that using AnyCap fits your own internal policies, customer commitments, and regulatory obligations.",
    ],
  },
  {
    kicker: "Outputs",
    title: "Review, verification, and downstream use",
    bullets: [
      "Outputs may be incomplete, inaccurate, offensive, delayed, unavailable, or unsuitable for a given use without human review and validation.",
      "You are responsible for how outputs are used, stored, published, shared, or relied on in downstream systems.",
      "AnyCap does not guarantee that the same prompt, route, provider, or model choice will remain available or produce identical results over time.",
    ],
  },
  {
    kicker: "Providers",
    title: "Third-party routing and capability changes",
    bullets: [
      "AnyCap may rely on third-party model, hosting, storage, authentication, analytics, payment, or other infrastructure providers to fulfill requests.",
      "To run a workflow, relevant request data may be sent to those upstream providers when needed for processing, delivery, or service operations.",
      "Capabilities may be added, removed, revised, paused, or deprecated, including changes to models, routes, limits, UI surfaces, and availability.",
    ],
  },
  {
    kicker: "Billing",
    title: "Credits, pricing, and usage controls",
    bullets: [
      "Paid usage is governed by the pricing, credit-pack, and plan information shown at the time of purchase or access.",
      "Promotional credits, free usage, feature availability, and packaging may change over time and may be subject to plan-specific limits or eligibility rules.",
      "AnyCap may meter, throttle, queue, cap, or reject requests based on credits, plan level, provider constraints, operational load, or abuse and risk signals.",
    ],
  },
  {
    kicker: "Protection",
    title: "Acceptable use and enforcement",
    bullets: [
      "You may not use AnyCap to violate law, abuse third-party services, interfere with platform stability, probe for weaknesses without authorization, or support clearly harmful, deceptive, or unauthorized activity.",
      "AnyCap may investigate suspected misuse and may limit, suspend, or terminate access when reasonably necessary for service protection, abuse prevention, legal compliance, or security response.",
      "We may remove or decline workflows, accounts, or access paths that create disproportionate operational, legal, financial, or trust risk for the platform.",
    ],
  },
  {
    kicker: "Limits",
    title: "Disclaimers and liability boundaries",
    bullets: [
      "AnyCap is provided on an as-available and as-evolving basis, without a guarantee of uninterrupted operation, provider continuity, or fitness for a specific workflow.",
      "To the maximum extent permitted by law, AnyCap disclaims implied warranties and is not responsible for indirect, incidental, special, consequential, or exemplary damages arising from use of the service.",
      "Nothing on this page is legal advice, and teams with procurement, contractual, or regulated-use requirements should complete their own review before scaling production use.",
    ],
  },
] as const;

function PageSection({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-14 md:mt-16">
      {eyebrow ? (
        <p className="mb-4 text-[11px] tracking-[0.7px] text-[#6b7d3a]" style={mono}>
          {eyebrow}
        </p>
      ) : null}
      <h2 className={sectionTitleClass}>{title}</h2>
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}

export default function TermsPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Home", href: "/" }, { name: "Terms" }]} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(termsPageJsonLd) }}
      />

      <article className="px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[860px] py-12 md:py-20 lg:py-24">
          <FadeIn>
            <div className="max-w-[760px]">
              <p className="mb-4 text-[11px] tracking-[0.8px] text-[#6b7d3a]" style={mono}>
                Terms
              </p>
              <h1
                className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
                style={{ ...pixel, fontSize: "clamp(32px, 6vw, 72px)" }}
              >
                AnyCap Terms of Service
              </h1>
              <p className="mt-6 text-base leading-7 text-[#4d5145] md:text-lg">
                These baseline terms explain what AnyCap provides, what you remain responsible for
                in agent workflows, and when AnyCap may change, limit, or protect the service.
              </p>
              <p className="mt-4 text-[11px] text-[#5a5e52]" style={mono}>
                Last updated {lastUpdatedLabel}
              </p>
            </div>
          </FadeIn>

          <div className="mt-14 md:mt-16">
            <hr className="border-t border-[#dce0d2]" />
          </div>

          <FadeIn>
            <PageSection eyebrow="At a glance" title="The practical baseline">
              <p className={bodyClass}>
                This page is meant to set a clear public baseline for how AnyCap should be used. It
                protects the platform, keeps expectations realistic, and helps teams understand the
                service before relying on it in production.
              </p>
              <div className="space-y-6">
                {keyTerms.map((item) => (
                  <div key={item.title}>
                    <h3 className={subTitleClass}>{item.title}</h3>
                    <p className={`${bodyClass} mt-2`}>{item.body}</p>
                  </div>
                ))}
              </div>
            </PageSection>
          </FadeIn>

          <FadeIn>
            <PageSection eyebrow="Core terms" title="The operating rules around AnyCap">
              <div className="space-y-10">
                {coreTerms.map((section) => (
                  <section key={section.title}>
                    <p className="text-[11px] tracking-[0.7px] text-[#6b7d3a]" style={mono}>
                      {section.kicker}
                    </p>
                    <h3 className={`${subTitleClass} mt-2`}>{section.title}</h3>
                    <ul className={listClass}>
                      {section.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            </PageSection>
          </FadeIn>

          <FadeIn>
            <PageSection eyebrow="Before production use" title="Make sure the workflow fits your team">
              <p className={bodyClass}>
                AnyCap is built for agent workflows, not as a guarantee that every model, provider,
                or route will remain fixed forever. Teams using the platform in production should
                review their data handling assumptions, output review standards, billing
                expectations, and any procurement or compliance requirements before they scale
                usage.
              </p>
              <p className={bodyClass}>
                Read this page together with the{" "}
                <Link href="/privacy" className={linkClass}>
                  privacy policy
                </Link>
                ,{" "}
                <Link href="/pricing" className={linkClass}>
                  pricing
                </Link>
                , and{" "}
                <Link href="/about" className={linkClass}>
                  about
                </Link>{" "}
                pages so the legal baseline matches the product and operating context.
              </p>
              <p className={bodyClass}>
                If your team needs clarification before broader rollout, email{" "}
                <a
                  href="mailto:admin@anycap.ai?subject=AnyCap%20terms%20question"
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
            </PageSection>
          </FadeIn>
        </div>
      </article>
    </>
  );
}
