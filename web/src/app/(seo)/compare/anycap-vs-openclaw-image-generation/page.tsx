import type { Metadata } from "next";
import Image from "next/image";
import { AnycapMark } from "@/components/brand/AnycapMark";
import { AnycapWordmark } from "@/components/brand/AnycapWordmark";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { EarlyAccessBanner } from "@/components/landing/EarlyAccessBanner";
import { FadeIn } from "@/components/ui/FadeIn";
import { createTechArticleJsonLd } from "@/lib/schema";
import { siteConfig } from "@/lib/site";

export const runtime = "edge";

const CDN_BASE = "https://cdn.anycap.ai/page_resource/compare";
const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;
const lastUpdatedLabel = "April 6, 2026";
const lastUpdatedIso = "2026-04-06";

export const metadata: Metadata = {
  title: "AnyCap vs OpenClaw image generation — one key vs provider-key setup",
  description:
    "Compare AnyCap and OpenClaw for agent image generation. AnyCap gives teams one key across image models, a clearer hosted dashboard, $5 free credit, Drive and Page sharing, and support beyond OpenClaw.",
  alternates: { canonical: "/compare/anycap-vs-openclaw-image-generation" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/compare/anycap-vs-openclaw-image-generation",
    siteName: siteConfig.siteName,
    title: "AnyCap vs OpenClaw image generation — one key vs provider-key setup",
    description:
      "Compare AnyCap and OpenClaw for agent image generation, setup overhead, sharing workflows, and cross-agent compatibility.",
  },
};

const comparisons = [
  {
    dimension: "How image generation gets enabled",
    anycap:
      "Create one AnyCap account, log in once, and use image generation immediately through the hosted runtime.",
    openclaw:
      "The image tool appears only after at least one provider is configured, such as OpenAI, Google, fal, MiniMax, ComfyUI, or Vydra.",
  },
  {
    dimension: "Credential model",
    anycap:
      "One key and one balance across supported image models, so the team does not need to register and top up multiple providers.",
    openclaw:
      "Bring your own provider API keys or OAuth path for each image provider you want to use.",
  },
  {
    dimension: "Where it works",
    anycap:
      "Works with OpenClaw and also with Claude Code, Cursor, Codex, OpenCode, Manus, and other agent setups that can call the CLI.",
    openclaw:
      "Native fit for OpenClaw itself, with strong local-first and multi-agent workflows inside that environment.",
  },
  {
    dimension: "Hosted product surface",
    anycap:
      "Hosted dashboard for credits, Drive files, Pages, and share links, so teams can see outputs and manage artifacts in one place.",
    openclaw:
      "Primary surface is the agent runtime and local configuration. Image generation is documented as a tool backed by external providers.",
  },
  {
    dimension: "Free start",
    anycap: "$5 free credit on signup, then pay-as-you-go with no subscription.",
    openclaw:
      "Public image-generation docs focus on provider configuration rather than a hosted credit balance or free starter credit.",
  },
  {
    dimension: "Sharing outputs",
    anycap:
      "Drive can create share links for generated files, and Pages can publish versions to public URLs from the same account.",
    openclaw:
      "Artifacts depend on the active provider and local workflow. Public docs for image generation focus on generation and editing, not hosted sharing.",
  },
];

const faqItems = [
  {
    question: "Is AnyCap a replacement for OpenClaw?",
    answer:
      "Not necessarily. OpenClaw is an agent product with its own runtime, tools, and multi-agent features. AnyCap is the capability layer you can plug into OpenClaw or use from other agent products when you want one hosted image and media surface instead of managing provider keys directly.",
  },
  {
    question: "What is the biggest setup difference between AnyCap and OpenClaw image generation?",
    answer:
      "OpenClaw's public docs say image generation requires at least one configured provider before the tool appears. AnyCap is positioned around one account, one login, and one balance across supported capabilities, which reduces setup overhead when the goal is to start generating quickly.",
  },
  {
    question: "Why mention other agents on a page about OpenClaw image generation?",
    answer:
      "Because many teams do not standardize on one agent surface. If you move between OpenClaw, Claude Code, Cursor, or Codex, a shared capability runtime becomes more valuable than wiring each environment to separate provider accounts.",
  },
  {
    question: "What can AnyCap share that OpenClaw's image docs do not emphasize?",
    answer:
      "AnyCap adds Drive and Page workflows around the generated artifact. That means a team can store files, create share links, and publish page versions from the same account instead of treating generation as the final step.",
  },
];

const articleJsonLd = createTechArticleJsonLd({
  headline: "AnyCap vs OpenClaw image generation — one key vs provider-key setup",
  description:
    "Comparison guide for teams deciding whether to use AnyCap or OpenClaw for agent image generation workflows.",
  path: "/compare/anycap-vs-openclaw-image-generation",
  about: ["AnyCap", "OpenClaw", "Image generation", "AI agent tools"],
  keywords: [
    "anycap vs openclaw",
    "openclaw image generation",
    "openclaw alternative",
    "image generation for agents",
    "one api key for ai models",
  ],
  datePublished: "2026-04-06",
  dateModified: lastUpdatedIso,
});

const sourceLinks = [
  {
    label: "OpenClaw image generation docs",
    href: "https://docs.openclaw.ai/tools/image-generation",
    note: "Provider setup, supported providers, fallback behavior, and edit support.",
  },
  {
    label: "AnyCap pricing",
    href: "/pricing",
    note: "$5 free credit and pay-as-you-go pricing.",
  },
  {
    label: "Install AnyCap",
    href: "/start",
    note: "One CLI and one auth flow across multiple agent products.",
  },
  {
    label: "AnyCap image generation",
    href: "/capabilities/image-generation",
    note: "Hosted image generation models exposed through one CLI.",
  },
  {
    label: "AnyCap Drive",
    href: "/capabilities/drive",
    note: "Drive as the storage and sharing layer for artifacts.",
  },
];

const platformBadges = [
  { label: "Cursor", accent: "#5b8cff" },
  { label: "Codex", accent: "#111827" },
  { label: "Claude Code", accent: "#d97706" },
] as const;

export default function AnycapVsOpenClawImageGenerationPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Compare", href: "/compare", unlinkable: true },
          { name: "AnyCap vs OpenClaw Image Generation" },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />


      <article className="px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[1280px] py-12 md:py-20 lg:py-24">
          <FadeIn>
            <p className="mb-4 text-[11px] tracking-[0.8px] text-[#6b7d3a]" style={mono}>
              Compare
            </p>
            <p className="mb-3 text-[11px] tracking-[0.5px] text-[#5a5e52]" style={mono}>
              Last updated {lastUpdatedLabel}
            </p>
            <h1
              className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(28px, 5vw, 60px)" }}
            >
              AnyCap vs
              <br />
              OpenClaw Image Generation
            </h1>
            <p className="mt-6 max-w-[820px] text-base leading-7 text-[#4d5145] md:text-lg">
              If the goal is to get image generation working inside agents with the least setup
              friction, the practical difference is simple. OpenClaw gives you a flexible tool
              that routes across configured providers, but you still need to bring those provider
              keys yourself. AnyCap gives you one hosted account, one key, one balance, and one
              runtime that also works outside OpenClaw. That makes it the better fit when you want
              to start quickly, reuse the same capability layer across agent products, and keep the
              generated artifact inside a clearer hosted dashboard with sharing built in.
            </p>
            <div className="mt-8 max-w-[900px] rounded-2xl border border-[#d4dbb8] bg-[#fbfcf8] p-6 md:p-7">
              <p className="text-[11px] tracking-[0.7px] text-[#6b7d3a]" style={mono}>
                Answer-first summary
              </p>
              <p className="mt-3 text-sm leading-6 text-[#4d5145] md:text-[15px]">
                Choose AnyCap when you want one key for multiple image models, support across
                OpenClaw plus other agents, a simpler dashboard for outputs, $5 free credit on
                signup, and built-in Drive or Page sharing for generated artifacts. Choose
                OpenClaw when you prefer a local-first agent environment and want to manage the
                provider layer yourself.
              </p>
            </div>
          </FadeIn>

          <FadeIn className="mt-8">
            <EarlyAccessBanner />
          </FadeIn>

          <FadeIn className="mt-10">
            <section className="max-w-[1120px]">
              <div className="overflow-hidden rounded-[28px] border border-[#d4dbb8] bg-[#fbfcf8] shadow-[0_16px_40px_rgba(28,31,23,0.08)]">
                <div className="border-b border-[#d4dbb8] bg-[linear-gradient(180deg,rgba(250,251,246,0.98),rgba(244,245,240,0.96))] px-5 py-5 md:px-7">
                  <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#cfd8ae] bg-white shadow-[0_8px_24px_rgba(107,125,58,0.12)]">
                        <AnycapMark size={34} />
                      </div>
                      <div>
                        <div
                          className="mb-1 inline-flex items-center gap-2 rounded-full border border-[#d4dbb8] bg-white px-3 py-1 text-[10px] tracking-[0.7px] text-[#6b7d3a]"
                          style={mono}
                        >
                          MULTI-PLATFORM IMAGE RUNTIME
                        </div>
                        <div className="flex items-center gap-2">
                          <AnycapWordmark
                            style={{
                              fontFamily: "var(--font-logo), monospace",
                              fontSize: 28,
                              fontWeight: 700,
                              lineHeight: 1,
                              letterSpacing: "-0.5px",
                            }}
                          />
                          <span className="text-sm text-[#4d5145]">
                            powers smoother image generation beyond one agent shell.
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {platformBadges.map((platform) => (
                        <div
                          key={platform.label}
                          className="inline-flex items-center gap-2 rounded-full border border-[#d4dbb8] bg-white px-3 py-2 text-[12px] text-[#1c1f17] shadow-[0_6px_16px_rgba(28,31,23,0.06)]"
                          style={mono}
                        >
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: platform.accent }}
                          />
                          <span>{platform.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="relative aspect-[16/9] w-full overflow-hidden">
                  <Image
                    src={`${CDN_BASE}/anycap-vs-lobster.png`}
                    alt="Before-and-after comparison showing OpenClaw as a chaotic lobster-like setup with cables, API keys, and billing cards on the left, and a smoother one-key AnyCap-style image workflow on the right."
                    fill
                    className="object-cover object-top"
                    unoptimized
                    priority
                  />
                </div>
                <div className="border-t border-[#d4dbb8] bg-[#f9faf5] px-5 py-4 md:px-7">
                  <div className="flex flex-wrap items-center gap-3 text-[12px] text-[#4d5145]" style={mono}>
                    <span className="text-[#6b7d3a]">One key</span>
                    <span className="text-[#b3b8a7]">/</span>
                    <span>image generation</span>
                    <span className="text-[#b3b8a7]">/</span>
                    <span>share to Drive</span>
                    <span className="text-[#b3b8a7]">/</span>
                    <span>publish with Pages</span>
                    <span className="text-[#b3b8a7]">/</span>
                    <span>works across agent platforms</span>
                  </div>
                </div>
              </div>
              <p className="mt-4 max-w-[860px] text-sm leading-6 text-[#4d5145]">
                This comparison visual was generated with AnyCap to show the core positioning:
                more setup friction and scattered provider keys on the lobster side, versus one
                credential, smoother image generation, and broader agent-platform fit on the
                AnyCap side.
              </p>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-6 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                How to read this comparison visual
              </h2>
              <p className="max-w-[860px] text-base leading-7 text-[#4d5145]">
                The image is there to compress the product difference into one glance. The left
                side represents the extra operational work that appears when image generation only
                becomes available after separate provider setup. The right side represents the
                model AnyCap is selling: one credential, one hosted runtime, and one artifact flow
                that can move from generation to sharing without switching products.
              </p>
              <div className="mt-8 grid gap-4 md:grid-cols-3 max-w-[1080px]">
                <div className="rounded-xl border border-[#d4dbb8] p-5">
                  <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                    Left side
                  </p>
                  <h3 className="mb-2 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                    Provider friction
                  </h3>
                  <p className="text-sm leading-6 text-[#4d5145]">
                    The cables, API key tags, and payment cards stand for the setup burden teams
                    hit when they need separate provider accounts, separate balances, and separate
                    configuration before image generation is usable.
                  </p>
                </div>
                <div className="rounded-xl border border-[#d4dbb8] p-5">
                  <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                    Right side
                  </p>
                  <h3 className="mb-2 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                    One-key runtime
                  </h3>
                  <p className="text-sm leading-6 text-[#4d5145]">
                    The clean flow represents AnyCap&apos;s core promise: one key, one hosted
                    runtime, and one capability surface for image generation instead of a stack of
                    provider-specific image setups.
                  </p>
                </div>
                <div className="rounded-xl border border-[#d4dbb8] p-5">
                  <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                    Platform row
                  </p>
                  <h3 className="mb-2 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                    Cross-agent fit
                  </h3>
                  <p className="text-sm leading-6 text-[#4d5145]">
                    The Cursor, Codex, and Claude Code badges clarify that this page is not only
                    about running inside OpenClaw. It is about whether the same image runtime can
                    travel with the team across multiple agent environments.
                  </p>
                </div>
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                Side-by-side comparison
              </h2>
              <div className="overflow-x-auto rounded-xl border border-[#d4dbb8]">
                <table className="w-full text-left">
                  <thead className="bg-[#f9faf5]">
                    <tr className="border-b border-[#d4dbb8]">
                      <th className="px-5 py-3 pr-6 text-[11px] tracking-[0.5px] text-[#5a5e52]" style={mono}>
                        Dimension
                      </th>
                      <th className="px-5 py-3 pr-6 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                        AnyCap
                      </th>
                      <th className="px-5 py-3 text-[11px] tracking-[0.5px] text-[#5a5e52]" style={mono}>
                        OpenClaw
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisons.map((row) => (
                      <tr key={row.dimension} className="border-b border-[#d4dbb8]/50 last:border-b-0">
                        <td className="px-5 py-4 pr-6 text-sm font-medium text-[#1c1f17] align-top">
                          {row.dimension}
                        </td>
                        <td className="px-5 py-4 pr-6 text-sm leading-6 text-[#4d5145] align-top">
                          {row.anycap}
                        </td>
                        <td className="px-5 py-4 text-sm leading-6 text-[#4d5145] align-top">
                          {row.openclaw}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-4 max-w-[900px] text-[12px] leading-5 text-[#7a7e71]" style={mono}>
                Comparison reviewed against public docs on April 6, 2026. OpenClaw image-tool
                claims on this page are based on the public docs linked below.
              </p>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 grid gap-6 md:mt-24 md:grid-cols-2">
              <div className="rounded-xl border border-[#d4dbb8] p-6">
                <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                  Why teams switch
                </p>
                <h2 className="mb-4 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                  What AnyCap removes
                </h2>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-sm leading-6 text-[#4d5145]">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#6b7d3a]" />
                    Separate signups, balances, and top-ups for each image provider.
                  </li>
                  <li className="flex items-start gap-3 text-sm leading-6 text-[#4d5145]">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#6b7d3a]" />
                    The need to rebuild the same image capability setup in every agent product.
                  </li>
                  <li className="flex items-start gap-3 text-sm leading-6 text-[#4d5145]">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#6b7d3a]" />
                    The handoff gap between generation and sharing, because Drive and Pages live in
                    the same product surface.
                  </li>
                </ul>
              </div>

              <div className="rounded-xl border border-[#d4dbb8] p-6">
                <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                  Fair reading
                </p>
                <h2 className="mb-4 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                  Where OpenClaw is strong
                </h2>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-sm leading-6 text-[#4d5145]">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#6b7d3a]" />
                    Public docs show a broad provider list for image generation, including OpenAI,
                    Google, fal, MiniMax, ComfyUI, and Vydra.
                  </li>
                  <li className="flex items-start gap-3 text-sm leading-6 text-[#4d5145]">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#6b7d3a]" />
                    The tool can fail over across configured providers, which is useful for teams
                    that already manage the provider layer.
                  </li>
                  <li className="flex items-start gap-3 text-sm leading-6 text-[#4d5145]">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#6b7d3a]" />
                    OpenClaw also has broader agent-runtime features beyond image generation, so
                    this comparison is intentionally focused on the image workflow itself.
                  </li>
                </ul>
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-6 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                Best fit by use case
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 max-w-[1000px]">
                <div className="border border-[#d4dbb8] p-5">
                  <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                    Choose AnyCap if
                  </p>
                  <p className="text-sm leading-6 text-[#4d5145]">
                    You want one credential across image models, you also use agents besides
                    OpenClaw, you care about a hosted dashboard, and you want generated files or
                    pages to be shareable without adding a second storage or publishing tool.
                  </p>
                </div>
                <div className="border border-[#d4dbb8] p-5">
                  <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                    Choose OpenClaw if
                  </p>
                  <p className="text-sm leading-6 text-[#4d5145]">
                    You are already standardized on OpenClaw, prefer bringing your own provider
                    accounts, and want to control provider choice and fallback behavior directly in
                    the OpenClaw runtime.
                  </p>
                </div>
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-6 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                How this comparison was reviewed
              </h2>
              <div className="max-w-[900px] space-y-5">
                <p className="text-base leading-7 text-[#4d5145]">
                  This page is intentionally scoped to image-generation workflow fit, not to every
                  OpenClaw feature. The OpenClaw side of the comparison was reviewed against the
                  public image-generation documentation available on April 6, 2026, especially the
                  sections covering provider activation, supported providers, parameter handling,
                  and provider fallback order.
                </p>
                <p className="text-base leading-7 text-[#4d5145]">
                  The AnyCap side of the comparison is based on currently published product pages
                  for pricing, installation, image generation, and Drive. Claims on this page are
                  meant to stay inside what a reader can verify from public sources: one login and
                  one key positioning, $5 free credit, hosted dashboard flows, and Drive or Page
                  sharing for artifacts.
                </p>
                <div className="rounded-xl border border-[#d4dbb8] bg-[#f9faf5] p-5">
                  <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                    Methodology note
                  </p>
                  <p className="text-sm leading-6 text-[#4d5145]">
                    If OpenClaw changes its hosted product surface, credit model, or artifact
                    sharing flow later, this page should be updated. The comparison is strongest
                    when it stays tied to publicly verifiable workflow differences instead of broad
                    category claims.
                  </p>
                </div>
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                Source notes
              </h2>
              <div className="grid gap-4 max-w-[980px] sm:grid-cols-2">
                {sourceLinks.map((source) => (
                  <div key={source.label} className="border border-[#d4dbb8] p-5">
                    <a
                      href={source.href}
                      target={source.href.startsWith("http") ? "_blank" : undefined}
                      rel={source.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="text-[14px] font-bold text-[#1c1f17] hover:text-[#6b7d3a]"
                      style={mono}
                    >
                      {source.label}
                    </a>
                    <p className="mt-2 text-sm leading-6 text-[#4d5145]">{source.note}</p>
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
                FAQ
              </h2>
              <div className="space-y-6 max-w-[860px]">
                {faqItems.map((item) => (
                  <div key={item.question} className="border border-[#d4dbb8] p-5">
                    <h3 className="mb-2 text-[14px] font-bold text-[#1c1f17]" style={mono}>
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
            <section className="mt-16 md:mt-24 mb-8">
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                Related pages
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 max-w-[960px]">
                <Link
                  href="/capabilities/image-generation"
                  className="border border-[#d4dbb8] p-5 hover:border-[#6b7d3a] transition-colors"
                >
                  <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                    Capability
                  </p>
                  <h3 className="mb-2 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                    AnyCap Image Generation
                  </h3>
                  <p className="text-sm leading-6 text-[#4d5145]">
                    See the hosted image-generation surface, model positioning, and CLI examples.
                  </p>
                </Link>
                <Link
                  href="/start"
                  className="border border-[#d4dbb8] p-5 hover:border-[#6b7d3a] transition-colors"
                >
                  <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                    Guide
                  </p>
                  <h3 className="mb-2 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                    Install AnyCap
                  </h3>
                  <p className="text-sm leading-6 text-[#4d5145]">
                    Install the CLI once and reuse the same capability layer across agents.
                  </p>
                </Link>
              </div>
            </section>
          </FadeIn>
        </div>
      </article>
    </>
  );
}
