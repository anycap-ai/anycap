import type { Metadata } from "next";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { LoginButton } from "@/components/auth/LoginButton";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { EmailActionButton } from "@/components/ui/EmailActionButton";
import { FadeIn } from "@/components/ui/FadeIn";
import {
  pricingActionRows,
  pricingCapabilitySummary,
  pricingGenerationGroups,
  type GenerationModel,
} from "@/lib/capability-inventory";
import { createFaqPageJsonLd } from "@/lib/schema";
import { adjacentWorkflowSummary, getLocalizedRouteUrl, publicCapabilityLabel, siteConfig } from "@/lib/site";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;
const defaultBillingHref = "/dashboard/billing?buy=1";

export const metadata: Metadata = {
  title: "AnyCap Pricing — Pay-as-you-go Agent Capabilities",
  description:
    "Get $5 free credit, then pay as you go with no subscription and no markup. Use one balance across image, video, audio, web, storage, and publishing workflows in AnyCap.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/pricing",
    siteName: siteConfig.siteName,
    title: "AnyCap Pricing — Pay-as-you-go Agent Capabilities",
    description:
      "One balance across image, video, audio, web, storage, and publishing workflows. $5 free credit, pay as you go, no subscription.",
  },
};

const creditPackages = [
  {
    name: "Starter",
    packQuery: "starter",
    price: 10,
    credits: 500,
    bonus: null,
    bonusLabel: null,
    highlight: false,
    bestFor: "Best for first live workflow tests",
    description:
      "A low-risk starting point for solo builders validating prompts, tool calls, and a first production-near agent path.",
  },
  {
    name: "Standard",
    packQuery: "standard",
    price: 30,
    credits: 1575,
    bonus: 75,
    bonusLabel: "+5% bonus",
    highlight: true,
    bestFor: "Best for recurring weekly usage",
    description:
      "A balanced default when you expect repeated image, video, audio, or web runs and want fewer top-ups while iterating.",
  },
  {
    name: "Pro",
    packQuery: "pro",
    price: 100,
    credits: 5500,
    bonus: 500,
    bonusLabel: "+10% bonus",
    highlight: false,
    bestFor: "Best for heavier team or production workloads",
    description:
      "More headroom for shared agent sessions, larger media batches, and longer-running workflows where throughput matters.",
  },
] as const;

const pricingPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "AnyCap Pricing",
  description:
    "AnyCap pricing page. Pay-as-you-go credits across image, video, audio, web, storage, and publishing workflows.",
  url: getLocalizedRouteUrl(siteConfig.defaultLocale, "/pricing"),
  dateModified: "2026-04-08",
  mainEntity: {
    "@type": "Product",
    name: "AnyCap Credits",
    url: getLocalizedRouteUrl(siteConfig.defaultLocale, "/pricing"),
    description:
      "Pay-as-you-go credits for the AI agent capabilities coding agents miss most often, with one balance across the wider AnyCap runtime.",
    offers: creditPackages.map((pkg) => ({
      "@type": "Offer",
      name: `${pkg.name} credit pack`,
      url: `${getLocalizedRouteUrl(siteConfig.defaultLocale, "/pricing")}#pack-${pkg.packQuery}`,
      price: pkg.price.toFixed(2),
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      description: pkg.bonusLabel
        ? `${pkg.credits.toLocaleString()} credits (${pkg.bonusLabel})`
        : `${pkg.credits.toLocaleString()} credits`,
    })),
  },
};

const pricingPrinciples = [
  {
    title: "Start free, then buy only when the workflow proves out",
    description:
      "Every new account starts with $5 free credit, so teams can test real image, video, audio, and web workflows before committing to a larger prepaid pack.",
  },
  {
    title: "Keep one balance across the workflows agents actually need",
    description:
      "The same AnyCap balance can be spent across generation, analysis, search, storage, and publishing workflows instead of splitting spend across multiple provider dashboards.",
  },
  {
    title: "Pay official provider rates through one consolidated billing flow",
    description:
      "AnyCap passes through the official model rate with no markup, then adds one purchase flow, one balance, and one transaction history for the whole runtime.",
  },
] as const;

const purchaseChecklist = [
  {
    title: "1. Start from the workflow, not the model list",
    description:
      "Estimate the path your agent will actually run: generation, analysis, search, storage, or a mix of several steps in one job.",
  },
  {
    title: "2. Price the most expensive step first",
    description:
      "Use the tables below to estimate the generation output or action type that will consume the largest share of credits, then treat the rest as margin.",
  },
  {
    title: "3. Leave room for retries and iteration",
    description:
      "If the workflow will need prompt tuning, QA passes, or teammate handoffs, choose the pack that gives enough headroom to keep moving without topping up every day.",
  },
] as const;

const enterprisePackage = {
  name: "Enterprise",
  headline: "Custom volume for teams and larger workflows",
  description:
    "For teams that need larger purchases, consolidated billing, procurement support, or invoiced billing.",
  highlights: ["Custom credit volume", "Volume pricing", "Invoiced billing"],
  ctaLabel: "Contact us",
  ctaSubject: "AnyCap Enterprise pricing",
} as const;

const driveQuotas = [
  { label: "Files per account", value: "5,000" },
  { label: "Max file size", value: "1 GB" },
] as const;

const pageQuotas = [
  { label: "Sites per account", value: "100" },
  { label: "Versions per site", value: "500" },
] as const;

const faqItems = [
  {
    question: "Is there a free tier?",
    answer:
      "Every account starts with $5 free credit, which is 250 credits at the current base conversion, and no payment information is required to begin testing workflows.",
  },
  {
    question: "Do credits expire?",
    answer: "No. Purchased credits do not expire.",
  },
  {
    question: "Is there a markup on model pricing?",
    answer:
      "No. AnyCap passes through the official provider rate for every model and capability, then consolidates usage into one balance and one billing flow.",
  },
  {
    question: "Can I use the same balance across generation and actions?",
    answer:
      "Yes. The same AnyCap balance can be used across generation models, analysis tools, web actions, Drive storage, and Page publishing workflows.",
  },
  {
    question: "How should I choose my first credit pack?",
    answer:
      "Starter is a good fit for first live tests, Standard is the default for recurring weekly usage, and Pro is the better fit when a team expects heavier or more continuous production workloads.",
  },
  {
    question: "What capabilities are included?",
    answer: `${pricingCapabilitySummary.join(", ")}. Drive storage and Page hosting are included at no additional credit cost.`,
  },
] as const;

const faqJsonLd = createFaqPageJsonLd(faqItems);
const lastUpdatedLabel = "April 8, 2026";

function buildCreditPackHref(pack: (typeof creditPackages)[number]) {
  const params = new URLSearchParams({
    buy: "1",
    pack: pack.packQuery,
    credits: String(pack.credits),
    price: String(pack.price),
  });
  return `/dashboard/billing?${params.toString()}`;
}

function ModelTable({
  models,
  unitLabel,
  headers,
}: {
  models: GenerationModel[];
  unitLabel: string;
  headers: [string, string, string];
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[#d4dbb8] bg-[#f9faf5]/80">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-[#d4dbb8]">
            {headers.map((h) => (
              <th
                key={h}
                className="bg-[#f4f5f0] px-5 py-4 text-[11px] tracking-[0.5px] text-[#5a5e52]"
                style={mono}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {models.map((row, idx) => (
            <tr
              key={row.model}
              className={`border-b border-[#d4dbb8]/60 last:border-b-0 ${
                idx % 2 === 0 ? "bg-[#fffffc]/70" : "bg-[#f9faf5]/50"
              }`}
            >
              <td className="px-5 py-4 text-sm font-medium text-[#1c1f17]">{row.model}</td>
              <td className="px-5 py-4">
                <div className="flex flex-wrap gap-1.5">
                  {row.modes.map((mode) => (
                    <span
                      key={mode}
                      className="inline-block rounded-md bg-[#f4f5f0] px-2 py-0.5 text-[12px] text-[#4d5145]"
                      style={mono}
                    >
                      {mode}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-5 py-4 text-sm text-[#1c1f17]" style={mono}>
                {row.credits}
                <span className="ml-1 text-[11px] text-[#8a8e82]">{unitLabel}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function PricingPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Home", href: "/" }, { name: "Pricing", href: "/pricing" }]} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingPageJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <article className="px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[1280px] py-12 md:py-20 lg:py-24">

          {/* ── Hero ──────────────────────────────────────────────── */}
          <FadeIn>
            <p className="mb-4 text-[11px] tracking-[0.8px] text-[#6b7d3a]" style={mono}>
              Pricing
            </p>
            <h1
              className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(32px, 6vw, 72px)" }}
            >
              Simple, transparent
              <br />
              pricing.
            </h1>
            <p className="mt-6 max-w-[780px] text-base leading-7 text-[#4d5145] md:text-lg">
              Start with the {publicCapabilityLabel} coding agents miss most often. AnyCap gives
              you one prepaid balance for those workflows, then lets that same balance extend
              across the broader runtime as your stack grows. No markup over official rates. No
              subscription. Every new account starts with $5 free credit.
            </p>
            <div className="mt-8 max-w-[860px] rounded-2xl border border-[#d4dbb8] bg-[#fbfcf8] p-6 md:p-7">
              <p className="text-[11px] tracking-[0.7px] text-[#6b7d3a]" style={mono}>
                Pricing facts
              </p>
              <p className="mt-3 text-sm leading-6 text-[#4d5145] md:text-[15px]">
                AnyCap uses prepaid credits. New accounts receive $5 in free credit. After that,
                the public AnyCap capability inventory is billed at the same rate as the official
                model provider, with no subscription fee and no platform markup. The same balance
                can also be used across {adjacentWorkflowSummary}. Credit packages are one-time
                purchases, and larger packages include bonus credits.
              </p>
              <p className="mt-4 text-[11px] text-[#5a5e52]" style={mono}>
                Last updated {lastUpdatedLabel}
              </p>
            </div>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          {/* ── Pricing principles ─────────────────────────────────── */}
          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-3 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                How AnyCap pricing works
              </h2>
              <p className="mb-8 max-w-[760px] text-sm leading-6 text-[#4d5145]">
                The pricing model is intentionally simple: start free, buy one-time credit packs
                when you need more balance, and keep that same balance available across the
                workflows your agents already run.
              </p>
              <div className="grid gap-4 md:grid-cols-3">
                {pricingPrinciples.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-[#d4dbb8] bg-[#fbfcf8] p-6"
                  >
                    <p className="text-[11px] tracking-[0.7px] text-[#6b7d3a]" style={mono}>
                      Pricing principle
                    </p>
                    <h3 className="mt-3 text-base text-[#1c1f17]" style={pixel}>
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-[#4d5145]">{item.description}</p>
                  </div>
                ))}
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          {/* ── Credit packages ───────────────────────────────────── */}
          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-3 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                Credit packages
              </h2>
              <p className="mb-8 max-w-[700px] text-sm leading-6 text-[#4d5145]">
                Purchase credits to use across all capabilities. Larger packages include bonus
                credits.
              </p>
              <div className="grid gap-4 sm:grid-cols-3">
                {creditPackages.map((pkg) => (
                  <LoginButton
                    key={pkg.name}
                    returnTo={buildCreditPackHref(pkg)}
                    id={`pack-${pkg.packQuery}`}
                    aria-label={`Buy the ${pkg.name} credit pack`}
                    className={`group relative flex h-full flex-col rounded-xl border p-6 transition-all hover:-translate-y-0.5 hover:border-[#6b7d3a] hover:shadow-[0_10px_24px_rgba(28,31,23,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6b7d3a] focus-visible:ring-offset-2 ${
                      pkg.highlight
                        ? "border-[#6b7d3a] bg-[#6b7d3a]/[0.04]"
                        : "border-[#d4dbb8] bg-[#fffffc]"
                    }`}
                  >
                    {pkg.highlight && (
                      <span
                        className="absolute -top-3 left-5 rounded-full bg-[#6b7d3a] px-3 py-0.5 text-[10px] tracking-[0.5px] text-[#f4f5f0]"
                        style={mono}
                      >
                        Popular
                      </span>
                    )}
                    <p className="mb-1 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                      {pkg.name}
                    </p>
                    <p
                      className="text-[#1c1f17]"
                      style={{ ...pixel, fontSize: "clamp(28px, 4vw, 40px)" }}
                    >
                      ${pkg.price}
                    </p>
                    <p className="mt-3 text-sm text-[#4d5145]" style={mono}>
                      {pkg.credits.toLocaleString()} credits
                    </p>
                    {pkg.bonusLabel && (
                      <p className="mt-1 text-xs text-[#6b7d3a]" style={mono}>
                        {pkg.bonusLabel}
                      </p>
                    )}
                    <p className="mt-4 text-sm text-[#1c1f17]" style={mono}>
                      {pkg.bestFor}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[#4d5145]">{pkg.description}</p>
                    <div
                      className="mt-6 flex items-center justify-between text-[11px] tracking-[0.7px] text-[#5a5e52]"
                      style={mono}
                    >
                      <span>{pkg.highlight ? "Recommended pack" : "Continue to checkout"}</span>
                      <span className="transition-transform group-hover:translate-x-0.5">
                        &rarr;
                      </span>
                    </div>
                  </LoginButton>
                ))}
              </div>
              <div
                id="enterprise"
                className="mt-4 rounded-2xl border border-[#bcc99a] bg-[linear-gradient(135deg,rgba(107,125,58,0.10),rgba(255,255,252,0.96))] p-6 shadow-[0_1px_2px_rgba(28,31,23,0.04)] md:p-7"
              >
                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                  <div className="max-w-[760px]">
                    <p className="text-[11px] tracking-[0.7px] text-[#6b7d3a]" style={mono}>
                      {enterprisePackage.name}
                    </p>
                    <h3
                      className="mt-2 leading-[1.08] tracking-[-0.02em] text-[#1c1f17]"
                      style={{ ...pixel, fontSize: "clamp(24px, 3.2vw, 34px)" }}
                    >
                      {enterprisePackage.headline}
                    </h3>
                    <p className="mt-3 max-w-[680px] text-sm leading-6 text-[#4d5145] md:text-[15px]">
                      {enterprisePackage.description}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {enterprisePackage.highlights.map((item) => (
                        <span
                          key={item}
                          className="inline-flex rounded-full border border-[#ccd7ae] bg-[#f7f9f1] px-3 py-1 text-[11px] text-[#55672c]"
                          style={mono}
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <EmailActionButton
                      subject={enterprisePackage.ctaSubject}
                      className="inline-flex cursor-pointer items-center rounded-lg border-0 bg-[#1c1f17] px-5 py-3 text-[11px] tracking-[0.8px] text-[#f4f5f0] transition-colors hover:bg-[#6b7d3a]"
                      style={mono}
                    >
                      {enterprisePackage.ctaLabel}
                    </EmailActionButton>
                  </div>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-[#5a5e52]">
                1 credit = $0.02. All packages are one-time purchases, not subscriptions. Need a
                larger volume or invoiced billing? Contact us for enterprise pricing.
              </p>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          {/* ── Purchase checklist ────────────────────────────────── */}
          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-3 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                How to estimate your first top-up
              </h2>
              <p className="mb-8 max-w-[760px] text-sm leading-6 text-[#4d5145]">
                Most teams do not need a perfect forecast before buying credits. A better approach
                is to map the workflow, price the expensive step, then pick the pack that leaves
                room for iteration.
              </p>
              <div className="grid gap-4 md:grid-cols-3">
                {purchaseChecklist.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-[#d4dbb8] bg-[#fffffc] p-6"
                  >
                    <h3 className="text-base text-[#1c1f17]" style={pixel}>
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-[#4d5145]">{item.description}</p>
                  </div>
                ))}
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          {/* ── Generation models pricing ─────────────────────────── */}
          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-3 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                Generation models
              </h2>
              <p className="mb-10 max-w-[700px] text-sm leading-6 text-[#4d5145]">
                Credit rates for each generation model. We pass through the official provider rate
                with no markup.
              </p>

              {pricingGenerationGroups.map((group, index) => (
                <div
                  key={group.title}
                  className={index === pricingGenerationGroups.length - 1 ? "" : "mb-12"}
                >
                  <h3 className="mb-2 text-base text-[#1c1f17]" style={pixel}>
                    {group.title}
                  </h3>
                  <p className="mb-5 text-sm leading-6 text-[#4d5145]">{group.description}</p>
                  <ModelTable
                    models={group.models}
                    unitLabel={group.unitLabel}
                    headers={group.headers}
                  />
                </div>
              ))}

              <p className="mt-6 text-sm leading-6 text-[#5a5e52]">
                Credits shown are approximate. Actual cost may vary based on resolution, duration,
                or quality settings.
              </p>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          {/* ── Actions pricing ────────────────────────────────────── */}
          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-3 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                Actions
              </h2>
              <p className="mb-8 max-w-[700px] text-sm leading-6 text-[#4d5145]">
                Analyze images, videos, and audio, search the web, crawl pages, and run AI-grounded web search — all at a flat per-request rate.
              </p>
              <div className="overflow-x-auto rounded-xl border border-[#d4dbb8] bg-[#f9faf5]/80">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[#d4dbb8]">
                      {["Action", "Unit", "Credits"].map((header) => (
                        <th
                          key={header}
                          className="bg-[#f4f5f0] px-5 py-4 text-[11px] tracking-[0.5px] text-[#5a5e52]"
                          style={mono}
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pricingActionRows.map((row) => (
                      <tr
                        key={row.action}
                        className="border-b border-[#d4dbb8]/60 last:border-b-0 bg-[#fffffc]/70"
                      >
                        <td className="px-5 py-4 text-sm font-medium text-[#1c1f17]">
                          {row.action}
                        </td>
                        <td className="px-5 py-4 text-sm text-[#4d5145]" style={mono}>
                          {row.unit}
                        </td>
                        <td className="px-5 py-4 text-sm text-[#1c1f17]" style={mono}>
                          {row.credits}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          {/* ── Drive & Page limits ────────────────────────────────── */}
          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-3 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                Drive & Page
              </h2>
              <p className="mb-8 max-w-[700px] text-sm leading-6 text-[#4d5145]">
                Cloud storage and static site hosting included with every account at no additional
                credit cost. Storage quotas are enforced per account.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-[#d4dbb8] p-6">
                  <p className="mb-4 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                    Drive
                  </p>
                  <p className="mb-4 text-sm leading-6 text-[#4d5145]">
                    Cloud file storage with public URLs and sharing.
                  </p>
                  <div className="space-y-2.5">
                    {driveQuotas.map((q) => (
                      <div key={q.label} className="flex items-baseline justify-between gap-3">
                        <span className="text-sm text-[#4d5145]">{q.label}</span>
                        <span className="text-sm font-medium text-[#1c1f17]" style={mono}>
                          {q.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl border border-[#d4dbb8] p-6">
                  <p className="mb-4 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                    Page
                  </p>
                  <p className="mb-4 text-sm leading-6 text-[#4d5145]">
                    Static site deployment and web publishing.
                  </p>
                  <div className="space-y-2.5">
                    {pageQuotas.map((q) => (
                      <div key={q.label} className="flex items-baseline justify-between gap-3">
                        <span className="text-sm text-[#4d5145]">{q.label}</span>
                        <span className="text-sm font-medium text-[#1c1f17]" style={mono}>
                          {q.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-[#5a5e52]">
                Current limits reflect early-access preview defaults and may change.
              </p>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          {/* ── FAQ ────────────────────────────────────────────────── */}
          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                Common questions
              </h2>
              <div className="max-w-[820px] space-y-6">
                {faqItems.map((item) => (
                  <div key={item.question} className="border-l-[3px] border-[#6b7d3a] pl-5">
                    <p className="mb-1 text-sm font-bold text-[#1c1f17]" style={mono}>
                      {item.question}
                    </p>
                    <p className="text-sm leading-6 text-[#4d5145]">{item.answer}</p>
                  </div>
                ))}
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          {/* ── CTA ────────────────────────────────────────────────── */}
          <FadeIn>
            <section className="mt-16 md:mt-24 mb-8">
              <div className="flex flex-wrap gap-4">
                <LoginButton
                  returnTo={defaultBillingHref}
                  className="inline-block rounded-lg bg-[#6b7d3a] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#f4f5f0] transition-colors hover:bg-[#1c1f17] cursor-pointer"
                  style={mono}
                >
                  Buy credits
                </LoginButton>
                <Link
                  href="/capabilities"
                  className="inline-block rounded-lg border border-[#1c1f17] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                  style={mono}
                >
                  View capabilities
                </Link>
              </div>
            </section>
          </FadeIn>
        </div>
      </article>
    </>
  );
}
