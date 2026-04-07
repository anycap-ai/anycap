import type { Metadata } from "next";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { FadeIn } from "@/components/ui/FadeIn";
import { LoginButton } from "@/components/auth/LoginButton";
import {
  pricingActionRows,
  pricingCapabilitySummary,
  pricingGenerationGroups,
  type GenerationModel,
} from "@/lib/capability-inventory";
import { adjacentWorkflowSummary, publicCapabilityLabel, siteConfig } from "@/lib/site";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

export const metadata: Metadata = {
  title: "AnyCap Pricing — Pay-as-you-go Agent Capabilities",
  description:
    "Get $5 free credit, then pay as you go with no subscription and no markup. Use one balance for image, video, and vision workflows in AnyCap.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/pricing",
    siteName: siteConfig.siteName,
    title: "AnyCap Pricing — Pay-as-you-go Agent Capabilities",
    description:
      "One balance for image, video, and vision workflows. $5 free credit, pay as you go, no subscription.",
  },
};

const pricingPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "AnyCap Pricing",
  description:
    "AnyCap pricing page. Pay-as-you-go credits for image, video, and vision workflows, with one balance across the broader runtime.",
  url: `${siteConfig.url}/pricing`,
  mainEntity: {
    "@type": "Product",
    name: "AnyCap Credits",
    description:
      "Pay-as-you-go credits for the image, video, and vision workflows coding agents miss most often, with one balance across the wider AnyCap runtime.",
    offers: [
      {
        "@type": "Offer",
        name: "Starter",
        price: "10.00",
        priceCurrency: "USD",
        description: "500 credits",
      },
      {
        "@type": "Offer",
        name: "Standard",
        price: "30.00",
        priceCurrency: "USD",
        description: "1,575 credits (includes 5% bonus)",
      },
      {
        "@type": "Offer",
        name: "Pro",
        price: "100.00",
        priceCurrency: "USD",
        description: "5,500 credits (includes 10% bonus)",
      },
    ],
  },
};

const creditPackages = [
  {
    name: "Starter",
    price: 10,
    credits: 500,
    bonus: null,
    bonusLabel: null,
    highlight: false,
  },
  {
    name: "Standard",
    price: 30,
    credits: 1575,
    bonus: 75,
    bonusLabel: "+5% bonus",
    highlight: true,
  },
  {
    name: "Pro",
    price: 100,
    credits: 5500,
    bonus: 500,
    bonusLabel: "+10% bonus",
    highlight: false,
  },
] as const;

const driveQuotas = [
  { label: "Files per account", value: "5,000" },
  { label: "Max file size", value: "1 GB" },
] as const;

const pageQuotas = [
  { label: "Sites per account", value: "100" },
  { label: "Versions per site", value: "500" },
] as const;

const lastUpdated = "2026-04-03";

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
      <BreadcrumbJsonLd items={[{ name: "Home", href: "/" }, { name: "Pricing" }]} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingPageJsonLd) }}
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
                the image, video, and vision workflows on the public site are billed at the same
                rate as the official model provider, with no subscription fee and no platform
                markup. The same balance can also be used across {adjacentWorkflowSummary}. Credit
                packages are one-time purchases, and larger packages include bonus credits.
              </p>
              <p className="mt-4 text-[11px] text-[#5a5e52]" style={mono}>
                Last updated {lastUpdated}
              </p>
            </div>
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
                  <div
                    key={pkg.name}
                    className={`relative rounded-xl border p-6 ${
                      pkg.highlight
                        ? "border-[#6b7d3a] bg-[#6b7d3a]/[0.04]"
                        : "border-[#d4dbb8]"
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
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm leading-6 text-[#5a5e52]">
                1 credit = $0.02. All packages are one-time purchases, not subscriptions.
              </p>
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
                <div className="border-l-[3px] border-[#6b7d3a] pl-5">
                  <p className="mb-1 text-sm font-bold text-[#1c1f17]" style={mono}>
                    Is there a free tier?
                  </p>
                  <p className="text-sm leading-6 text-[#4d5145]">
                    Every account starts with $5 free credit (250 credits) on signup. No payment
                    information required.
                  </p>
                </div>
                <div className="border-l-[3px] border-[#6b7d3a] pl-5">
                  <p className="mb-1 text-sm font-bold text-[#1c1f17]" style={mono}>
                    Do credits expire?
                  </p>
                  <p className="text-sm leading-6 text-[#4d5145]">
                    No. Purchased credits do not expire.
                  </p>
                </div>
                <div className="border-l-[3px] border-[#6b7d3a] pl-5">
                  <p className="mb-1 text-sm font-bold text-[#1c1f17]" style={mono}>
                    Is there a markup on model pricing?
                  </p>
                  <p className="text-sm leading-6 text-[#4d5145]">
                    No. We pass through the official provider rate for every model. You pay the same
                    price as going direct, consolidated into one account and one billing flow.
                  </p>
                </div>
                <div className="border-l-[3px] border-[#6b7d3a] pl-5">
                  <p className="mb-1 text-sm font-bold text-[#1c1f17]" style={mono}>
                    What capabilities are included?
                  </p>
                  <p className="text-sm leading-6 text-[#4d5145]">
                    {pricingCapabilitySummary.join(", ")}. Drive storage and Page hosting are
                    included at no additional credit cost.
                  </p>
                </div>
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
                  returnTo="/dashboard/billing"
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
