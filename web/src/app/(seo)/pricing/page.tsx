import type { Metadata } from "next";
import { LoginButton } from "@/components/auth/LoginButton";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { EmailActionButton } from "@/components/ui/EmailActionButton";
import { FadeIn } from "@/components/ui/FadeIn";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import {
  pricingActionRows,
  pricingGenerationGroups,
  type GenerationModel,
} from "@/lib/capability-inventory";
import { createLocalizedMetadataForPath } from "@/lib/localized-metadata";
import { getRequestLocale } from "@/lib/request-locale";
import { defaultLocale, type SiteLocale } from "@/lib/site";
import { getPricingMetadata, getPricingPageData, PRICING_PATH } from "./content";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;
const defaultBillingHref = "/dashboard/billing?buy=1";
const pricingGenerationModeLabels = {
  en: {
    "text-to-image": "text-to-image",
    "image-to-image": "image-to-image",
    "text-to-video": "text-to-video",
    "image-to-video": "image-to-video",
    "text-to-music": "text-to-music",
  },
  "pt-br": {
    "text-to-image": "texto-para-imagem",
    "image-to-image": "imagem-para-imagem",
    "text-to-video": "texto-para-vídeo",
    "image-to-video": "imagem-para-vídeo",
    "text-to-music": "texto-para-música",
  },
  id: {
    "text-to-image": "teks-ke-gambar",
    "image-to-image": "gambar-ke-gambar",
    "text-to-video": "teks-ke-video",
    "image-to-video": "gambar-ke-video",
    "text-to-music": "teks-ke-musik",
  },
} as const;

const pricingGenerationGroupLabels = {
  en: [
    {
      title: "Image generation",
      description: "Charged per call. Supports text-to-image and image-to-image modes.",
      unitLabel: "/call",
      headers: ["Model", "Modes", "Credits / call"] as [string, string, string],
    },
    {
      title: "Video generation",
      description:
        "Charged per second of generated output. Supports text-to-video and image-to-video modes.",
      unitLabel: "/sec",
      headers: ["Model", "Modes", "Credits / sec"] as [string, string, string],
    },
    {
      title: "Music generation",
      description: "Charged per second of generated audio.",
      unitLabel: "/sec",
      headers: ["Model", "Modes", "Credits / sec"] as [string, string, string],
    },
  ],
  "pt-br": [
    {
      title: "Geração de imagens",
      description: "Cobrado por chamada. Suporta modos texto-para-imagem e imagem-para-imagem.",
      unitLabel: "/chamada",
      headers: ["Modelo", "Modos", "Créditos / chamada"] as [string, string, string],
    },
    {
      title: "Geração de vídeo",
      description:
        "Cobrado por segundo de saída gerada. Suporta modos texto-para-vídeo e imagem-para-vídeo.",
      unitLabel: "/seg",
      headers: ["Modelo", "Modos", "Créditos / seg"] as [string, string, string],
    },
    {
      title: "Geração de música",
      description: "Cobrado por segundo de áudio gerado.",
      unitLabel: "/seg",
      headers: ["Modelo", "Modos", "Créditos / seg"] as [string, string, string],
    },
  ],
  id: [
    {
      title: "Pembuatan gambar",
      description: "Dikenakan per panggilan. Mendukung mode teks-ke-gambar dan gambar-ke-gambar.",
      unitLabel: "/panggilan",
      headers: ["Model", "Mode", "Kredit / panggilan"] as [string, string, string],
    },
    {
      title: "Pembuatan video",
      description:
        "Dikenakan per detik output yang dihasilkan. Mendukung mode teks-ke-video dan gambar-ke-video.",
      unitLabel: "/detik",
      headers: ["Model", "Mode", "Kredit / detik"] as [string, string, string],
    },
    {
      title: "Pembuatan musik",
      description: "Dikenakan per detik audio yang dihasilkan.",
      unitLabel: "/detik",
      headers: ["Model", "Mode", "Kredit / detik"] as [string, string, string],
    },
  ],
} as const;

const pricingActionRowsByLocale = {
  en: pricingActionRows,
  "pt-br": [
    { action: "Leitura de imagem", unit: "por requisição", credits: 5 },
    { action: "Leitura de vídeo", unit: "por requisição", credits: 10 },
    { action: "Leitura de áudio", unit: "por requisição", credits: 10 },
    { action: "Busca na web", unit: "por requisição", credits: 1 },
    { action: "Busca na web (fundamentada por IA)", unit: "por requisição", credits: 5 },
    { action: "Crawl de web", unit: "por requisição", credits: 1 },
  ] as const,
  id: [
    { action: "Pembacaan gambar", unit: "per permintaan", credits: 5 },
    { action: "Pembacaan video", unit: "per permintaan", credits: 10 },
    { action: "Pembacaan audio", unit: "per permintaan", credits: 10 },
    { action: "Pencarian web", unit: "per permintaan", credits: 1 },
    { action: "Pencarian web (di-grounding AI)", unit: "per permintaan", credits: 5 },
    { action: "Crawl web", unit: "per permintaan", credits: 1 },
  ] as const,
} as const;

function translateGenerationMode(locale: SiteLocale, mode: string) {
  const resolvedLocale = locale === "pt-br" || locale === "id" ? locale : "en";
  const label =
    pricingGenerationModeLabels[resolvedLocale][mode as keyof (typeof pricingGenerationModeLabels)["en"]];
  return label ?? mode;
}

function getLocalizedPricingGenerationGroups(locale: SiteLocale): readonly {
  title: string;
  description: string;
  unitLabel: string;
  headers: [string, string, string];
  models: GenerationModel[];
}[] {
  const resolvedLocale = locale === "pt-br" || locale === "id" ? locale : "en";
  const labels = pricingGenerationGroupLabels[resolvedLocale];

  return pricingGenerationGroups.map((group, index) => ({
    title: labels[index].title,
    description: labels[index].description,
    unitLabel: labels[index].unitLabel,
    headers: labels[index].headers,
    models: group.models.map((model) => ({
      ...model,
      modes: model.modes.map((mode) => translateGenerationMode(locale, mode)),
    })),
  }));
}

function getLocalizedPricingActionRows(locale: SiteLocale) {
  return pricingActionRowsByLocale[locale === "pt-br" || locale === "id" ? locale : "en"];
}

type PricingPackHrefData = {
  packQuery: string;
  credits: number;
  price: number;
};

export const metadata: Metadata = createLocalizedMetadataForPath(
  defaultLocale,
  PRICING_PATH,
  getPricingMetadata(defaultLocale),
);

function buildCreditPackHref(pack: PricingPackHrefData) {
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

export default async function PricingPage() {
  const locale = await getRequestLocale();
  const content = getPricingPageData(locale);
  const creditsUnitLabel = locale === "pt-br" ? "créditos" : locale === "id" ? "kredit" : "credits";

  return (
    <>
      <BreadcrumbJsonLd items={content.breadcrumbItems} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(content.pricingPageJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(content.faqJsonLd) }}
      />

      <article className="px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[1280px] py-12 md:py-20 lg:py-24">

          {/* ── Hero ──────────────────────────────────────────────── */}
          <FadeIn>
            <p className="mb-4 text-[11px] tracking-[0.8px] text-[#6b7d3a]" style={mono}>
              {content.hero.eyebrow}
            </p>
            <h1
              className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(32px, 6vw, 72px)" }}
            >
              {content.hero.titleLine1}
              <br />
              {content.hero.titleLine2}
            </h1>
            <p className="mt-6 max-w-[780px] text-base leading-7 text-[#4d5145] md:text-lg">
              {content.hero.intro}
            </p>
            <div className="mt-8 max-w-[860px] rounded-2xl border border-[#d4dbb8] bg-[#fbfcf8] p-6 md:p-7">
              <p className="text-[11px] tracking-[0.7px] text-[#6b7d3a]" style={mono}>
                {content.hero.factsLabel}
              </p>
              <p className="mt-3 text-sm leading-6 text-[#4d5145] md:text-[15px]">
                {content.hero.factsText}
              </p>
              <p className="mt-4 text-[11px] text-[#5a5e52]" style={mono}>
                {content.hero.lastUpdatedLabel}
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
                {content.sectionTitles.pricingPrinciples}
              </h2>
              <p className="mb-8 max-w-[760px] text-sm leading-6 text-[#4d5145]">
                {content.pricingPrinciplesIntro}
              </p>
              <div className="grid gap-4 md:grid-cols-3">
                {content.pricingPrinciples.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-[#d4dbb8] bg-[#fbfcf8] p-6"
                  >
                    <p className="text-[11px] tracking-[0.7px] text-[#6b7d3a]" style={mono}>
                      {locale === "id" ? "Prinsip harga" : locale === "pt-br" ? "Princípio de preço" : "Pricing principle"}
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
                {content.sectionTitles.creditPackages}
              </h2>
              <p className="mb-8 max-w-[700px] text-sm leading-6 text-[#4d5145]">
                {content.creditPackagesIntro}
              </p>
              <div className="grid gap-4 sm:grid-cols-3">
                {content.creditPackages.map((pkg) => (
                  <LoginButton
                    key={pkg.name}
                    returnTo={buildCreditPackHref(pkg)}
                    id={`pack-${pkg.packQuery}`}
                    aria-label={
                      locale === "id"
                        ? `Beli paket kredit ${pkg.name}`
                        : locale === "pt-br"
                          ? `Comprar o pacote de créditos ${pkg.name}`
                          : `Buy the ${pkg.name} credit pack`
                    }
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
                        {content.packageStatusLabels.popular}
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
                      {pkg.credits.toLocaleString()} {creditsUnitLabel}
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
                      <span>
                        {pkg.highlight
                          ? content.packageStatusLabels.recommendedPack
                          : content.packageStatusLabels.continueToCheckout}
                      </span>
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
                      {content.enterprisePackage.name}
                    </p>
                    <h3
                      className="mt-2 leading-[1.08] tracking-[-0.02em] text-[#1c1f17]"
                      style={{ ...pixel, fontSize: "clamp(24px, 3.2vw, 34px)" }}
                    >
                      {content.enterprisePackage.headline}
                    </h3>
                    <p className="mt-3 max-w-[680px] text-sm leading-6 text-[#4d5145] md:text-[15px]">
                      {content.enterprisePackage.description}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {content.enterprisePackage.highlights.map((item) => (
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
                      subject={content.enterprisePackage.ctaSubject}
                      className="inline-flex cursor-pointer items-center rounded-lg border-0 bg-[#1c1f17] px-5 py-3 text-[11px] tracking-[0.8px] text-[#f4f5f0] transition-colors hover:bg-[#6b7d3a]"
                      style={mono}
                    >
                      {content.enterprisePackage.ctaLabel}
                    </EmailActionButton>
                  </div>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-[#5a5e52]">
                {content.enterpriseFootnote}
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
                {content.sectionTitles.estimateTopUp}
              </h2>
              <p className="mb-8 max-w-[760px] text-sm leading-6 text-[#4d5145]">
                {content.estimateTopUp.intro}
              </p>
              <div className="grid gap-4 md:grid-cols-3">
                {content.estimateTopUp.checklist.map((item) => (
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
                {content.sectionTitles.generationModels}
              </h2>
              <p className="mb-10 max-w-[700px] text-sm leading-6 text-[#4d5145]">
                {content.generationModels.intro}
              </p>

              {getLocalizedPricingGenerationGroups(locale).map((group, index) => (
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
                {content.generationModels.creditsNotice}
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
                {content.sectionTitles.actions}
              </h2>
              <p className="mb-3 max-w-[700px] text-sm leading-6 text-[#4d5145]">
                {content.actions.intro}
              </p>
              <p className="mb-8 max-w-[700px] text-[11px] leading-5 text-[#5a5e52]" style={mono}>
                {content.actions.includedCapabilitiesLabel}: {content.actions.includedCapabilitiesSummary}
              </p>
              <div className="overflow-x-auto rounded-xl border border-[#d4dbb8] bg-[#f9faf5]/80">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[#d4dbb8]">
                      {content.actions.tableHeaders.map((header) => (
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
                    {getLocalizedPricingActionRows(locale).map((row) => (
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
                {content.sectionTitles.drivePage}
              </h2>
              <p className="mb-8 max-w-[700px] text-sm leading-6 text-[#4d5145]">
                {content.drivePage.intro}
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-[#d4dbb8] p-6">
                  <p className="mb-4 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                    {content.drivePage.driveLabel}
                  </p>
                  <p className="mb-4 text-sm leading-6 text-[#4d5145]">
                    {content.drivePage.driveDescription}
                  </p>
                  <div className="space-y-2.5">
                    {content.drivePage.driveQuotas.map((q) => (
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
                    {content.drivePage.pageLabel}
                  </p>
                  <p className="mb-4 text-sm leading-6 text-[#4d5145]">
                    {content.drivePage.pageDescription}
                  </p>
                  <div className="space-y-2.5">
                    {content.drivePage.pageQuotas.map((q) => (
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
                {content.drivePage.limitNotice}
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
                {content.sectionTitles.faq}
              </h2>
              <div className="max-w-[820px] space-y-6">
                {content.faqItems.map((item) => (
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
                  {content.cta.buyCredits}
                </LoginButton>
                <Link
                  href="/capabilities"
                  className="inline-block rounded-lg border border-[#1c1f17] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                  style={mono}
                >
                  {content.cta.viewCapabilities}
                </Link>
              </div>
            </section>
          </FadeIn>
        </div>
      </article>
    </>
  );
}
