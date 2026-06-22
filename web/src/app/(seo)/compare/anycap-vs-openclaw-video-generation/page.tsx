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
const lastUpdatedLabel = "April 7, 2026";
const lastUpdatedIso = "2026-04-07";
const heroImagePath = `${CDN_BASE}/anycap-vs-openclaw-video-generation-hero.png`;

export const metadata: Metadata = {
  title: "AnyCap vs OpenClaw video generation — one key vs provider-key setup",
  description:
    "Compare AnyCap and OpenClaw for agent video generation. AnyCap gives teams one key across video models, a clearer hosted artifact workflow, pay-as-you-go pricing, and coverage beyond OpenClaw. OpenClaw gives a broader bring-your-own-provider video tool with more public mode breadth.",
  alternates: { canonical: "/compare/anycap-vs-openclaw-video-generation" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/compare/anycap-vs-openclaw-video-generation",
    siteName: siteConfig.siteName,
    title: "AnyCap vs OpenClaw video generation — one key vs provider-key setup",
    description:
      "Compare AnyCap and OpenClaw for agent video generation, setup overhead, mode coverage, sharing workflows, and cross-agent compatibility.",
  },
};

const comparisons = [
  {
    dimension: "How video generation gets enabled",
    anycap:
      "Create one AnyCap account, log in once, and use public video generation models through the hosted runtime.",
    openclaw:
      "The video_generate tool only appears after at least one video-generation provider is available. Public docs tell teams to set a provider API key or configure a default video model.",
  },
  {
    dimension: "Credential model",
    anycap:
      "One key and one balance across supported video models, so the team can start without separately funding multiple provider accounts.",
    openclaw:
      "Bring your own provider API keys for the video backends you want to use, and manage those provider accounts directly.",
  },
  {
    dimension: "Public video surface today",
    anycap:
      "Public pages center Veo 3.1, Kling 3.0, and Seedance 1.5 Pro through one CLI and one auth flow.",
    openclaw:
      "Public docs list 12 provider backends, each with different model options, limits, and capability notes.",
  },
  {
    dimension: "Public mode coverage",
    anycap:
      "Public positioning today emphasizes text-to-video and image-to-video workflows through one capability runtime.",
    openclaw:
      "Public docs explicitly support generate, imageToVideo, and videoToVideo, depending on the active provider and model.",
  },
  {
    dimension: "Where it works",
    anycap:
      "Works with OpenClaw and also with Claude Code, Cursor, Codex, Manus, and other agent setups that can call the CLI.",
    openclaw:
      "Native fit for OpenClaw itself, with strong runtime integration and a session model that routes work inside that environment.",
  },
  {
    dimension: "Hosted artifact workflow",
    anycap:
      "Hosted dashboard plus Drive and Pages, so generated artifacts can move into share links and publishing workflows from the same account.",
    openclaw:
      "Public docs focus on provider-backed generation, task lifecycle, and model routing rather than a hosted artifact-sharing surface.",
  },
  {
    dimension: "Billing model",
    anycap: "Pay-as-you-go with one prepaid balance and no subscription.",
    openclaw:
      "Public video-generation docs focus on provider setup rather than a hosted shared prepaid credit model.",
  },
  {
    dimension: "Best operator model",
    anycap:
      "Best when teams want managed capability access, less setup overhead, and one video layer they can reuse across multiple agent products.",
    openclaw:
      "Best when teams already want direct control over provider selection, mode breadth, and runtime behavior inside OpenClaw.",
  },
] as const;

const faqItems = [
  {
    question: "Is AnyCap a replacement for OpenClaw?",
    answer:
      "Not necessarily. OpenClaw is an agent runtime with its own tools and orchestration model. AnyCap is the capability layer you can plug into OpenClaw or use from other agent products when you want one hosted video surface instead of managing provider keys directly.",
  },
  {
    question: "What is the biggest setup difference between AnyCap and OpenClaw video generation?",
    answer:
      "OpenClaw's public docs say the video_generate tool appears only after at least one provider is available. AnyCap is positioned around one account, one key, and one balance across supported capabilities, which reduces setup overhead when the goal is to start generating videos quickly.",
  },
  {
    question: "Does OpenClaw support more public video modes than AnyCap?",
    answer:
      "Yes, based on the current public docs. OpenClaw explicitly documents generate, imageToVideo, and videoToVideo. AnyCap's current public video pages emphasize text-to-video and image-to-video workflows. That is why this page positions AnyCap around workflow simplicity and portability, not around winning every mode comparison.",
  },
  {
    question: "Why can AnyCap still be the better fit for some teams?",
    answer:
      "Because many teams value operating simplicity more than raw provider breadth. If the goal is one key, one balance, cross-agent reuse, and a clearer handoff from generation to sharing, AnyCap can be the cleaner video workflow even when OpenClaw exposes more provider-side options.",
  },
  {
    question: "Why mention Drive and Pages on a video generation comparison page?",
    answer:
      "Because video generation is rarely the final step. Teams usually need to hand the artifact to someone else, publish it, or keep it inside a hosted dashboard. AnyCap's advantage is strongest when the workflow includes generation plus sharing, not generation in isolation.",
  },
] as const;

const articleJsonLd = createTechArticleJsonLd({
  headline: "AnyCap vs OpenClaw video generation — one key vs provider-key setup",
  description:
    "Comparison guide for teams deciding whether to use AnyCap or OpenClaw for agent video generation workflows.",
  path: "/compare/anycap-vs-openclaw-video-generation",
  about: ["AnyCap", "OpenClaw", "Video generation", "AI agent tools"],
  keywords: [
    "anycap vs openclaw",
    "openclaw video generation",
    "openclaw alternative",
    "video generation for agents",
    "one api key for ai video models",
  ],
  datePublished: "2026-04-07",
  dateModified: lastUpdatedIso,
});

const sourceLinks = [
  {
    label: "OpenClaw video generation docs",
    href: "https://docs.openclaw.ai/tools/video-generation",
    note: "Provider activation, runtime modes, declared capability matrix, task lifecycle, and provider notes.",
  },
  {
    label: "AnyCap video generation",
    href: "/capabilities/video-generation",
    note: "Public video models, workflow positioning, and CLI examples.",
  },
  {
    label: "AnyCap pricing",
    href: "/pricing",
    note: "Pay-as-you-go pricing and credit packs.",
  },
  {
    label: "Install AnyCap",
    href: "/start",
    note: "One CLI and one auth flow across multiple agent products.",
  },
  {
    label: "AnyCap Drive",
    href: "/capabilities/drive",
    note: "Drive as the storage and sharing layer for generated artifacts.",
  },
] as const;

const platformBadges = [
  { label: "Cursor", accent: "#5b8cff" },
  { label: "Codex", accent: "#111827" },
  { label: "Claude Code", accent: "#d97706" },
  { label: "OpenClaw", accent: "#7c3aed" },
] as const;

const anycapAdvantagePoints = [
  "One hosted account and one balance instead of separate provider onboarding before the first video test.",
  "One capability layer the team can reuse across OpenClaw, Cursor, Codex, Claude Code, and similar agent surfaces.",
  "A clearer handoff from generation to sharing because Drive and Pages live in the same product surface.",
];

const openclawStrengths = [
  "Public docs show a broader declared video surface, including generate, imageToVideo, and videoToVideo.",
  "The published provider matrix covers 12 backends, which is useful for teams that already manage the provider layer themselves.",
  "The async task lifecycle is explicit in the docs, which helps teams reason about queueing, status, and completion behavior inside OpenClaw.",
];

export default function AnycapVsOpenClawVideoGenerationPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Compare", href: "/compare", unlinkable: true },
          { name: "AnyCap vs OpenClaw Video Generation" },
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
              OpenClaw Video Generation
            </h1>
            <p className="mt-6 max-w-[840px] text-base leading-7 text-[#4d5145] md:text-lg">
              If the goal is to get video generation working inside agents with the least setup
              friction, the practical difference is simple. OpenClaw gives you a flexible
              provider-routed video tool, but its public docs still start from bring-your-own
              provider access. AnyCap gives you one hosted account, one key, one balance, and one
              capability layer that also works beyond OpenClaw. That makes it the stronger fit when
              you want to start faster, avoid provider-account sprawl, and keep the workflow closer
              to generation plus sharing instead of generation alone.
            </p>
            <div className="mt-8 max-w-[920px] rounded-2xl border border-[#d4dbb8] bg-[#fbfcf8] p-6 md:p-7">
              <p className="text-[11px] tracking-[0.7px] text-[#6b7d3a]" style={mono}>
                Answer-first summary
              </p>
              <p className="mt-3 text-sm leading-6 text-[#4d5145] md:text-[15px]">
                Choose AnyCap when you want one key for multiple video models, support across
                OpenClaw plus other agents, a simpler hosted artifact workflow, and one prepaid
                balance. Choose OpenClaw when you prefer a native OpenClaw runtime, want to
                manage the provider layer directly, and need the broader public mode surface that
                includes videoToVideo.
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
                          MULTI-PLATFORM VIDEO RUNTIME
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
                            keeps video generation simpler beyond one agent shell.
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

                <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#f7f8f2]">
                  <Image
                    src={heroImagePath}
                    alt="Editorial comparison illustration showing a cluttered provider-key video workflow on the left and a smoother AnyCap-style hosted video workflow on the right."
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(244,245,240,0.02),rgba(244,245,240,0.14))]" />
                </div>

                <div className="border-t border-[#d4dbb8] bg-[#f9faf5] px-5 py-4 md:px-7">
                  <div className="flex flex-wrap items-center gap-3 text-[12px] text-[#4d5145]" style={mono}>
                    <span className="text-[#6b7d3a]">one key</span>
                    <span className="text-[#b3b8a7]">/</span>
                    <span>video generation</span>
                    <span className="text-[#b3b8a7]">/</span>
                    <span>share artifacts</span>
                    <span className="text-[#b3b8a7]">/</span>
                    <span>cross-agent reuse</span>
                    <span className="text-[#b3b8a7]">/</span>
                    <span>less provider overhead</span>
                  </div>
                </div>
              </div>
              <p className="mt-4 max-w-[900px] text-sm leading-6 text-[#4d5145]">
                This hero visual was generated with AnyCap to compress the workflow contrast into
                one glance. The left side emphasizes the provider-key overhead story, while the
                right side frames AnyCap around cleaner video workflow orchestration and delivery.
              </p>
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
                      <th
                        className="px-5 py-3 pr-6 text-[11px] tracking-[0.5px] text-[#5a5e52]"
                        style={mono}
                      >
                        Dimension
                      </th>
                      <th
                        className="px-5 py-3 pr-6 text-[11px] tracking-[0.5px] text-[#6b7d3a]"
                        style={mono}
                      >
                        AnyCap
                      </th>
                      <th
                        className="px-5 py-3 text-[11px] tracking-[0.5px] text-[#5a5e52]"
                        style={mono}
                      >
                        OpenClaw
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisons.map((row) => (
                      <tr key={row.dimension} className="border-b border-[#d4dbb8]/50 last:border-b-0">
                        <td className="px-5 py-4 pr-6 align-top text-sm font-medium text-[#1c1f17]">
                          {row.dimension}
                        </td>
                        <td className="px-5 py-4 pr-6 align-top text-sm leading-6 text-[#4d5145]">
                          {row.anycap}
                        </td>
                        <td className="px-5 py-4 align-top text-sm leading-6 text-[#4d5145]">
                          {row.openclaw}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-4 max-w-[920px] text-[12px] leading-5 text-[#7a7e71]" style={mono}>
                Comparison reviewed against public docs on April 7, 2026. OpenClaw video claims on
                this page are based on the official public docs linked below.
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
                  Where AnyCap pulls ahead
                </h2>
                <ul className="space-y-3">
                  {anycapAdvantagePoints.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm leading-6 text-[#4d5145]">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#6b7d3a]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-[#d4dbb8] p-6">
                <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                  Fair reading
                </p>
                <h2 className="mb-4 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                  Where OpenClaw is stronger
                </h2>
                <ul className="space-y-3">
                  {openclawStrengths.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm leading-6 text-[#4d5145]">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#6b7d3a]" />
                      {item}
                    </li>
                  ))}
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
              <div className="grid max-w-[1000px] gap-4 sm:grid-cols-2">
                <div className="border border-[#d4dbb8] p-5">
                  <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                    Choose AnyCap if
                  </p>
                  <p className="text-sm leading-6 text-[#4d5145]">
                    You want one credential across video models, you also use agents besides
                    OpenClaw, you care about a hosted artifact workflow, and you want generated
                    videos to move naturally into share links or publishing flows without adding a
                    second storage product.
                  </p>
                </div>
                <div className="border border-[#d4dbb8] p-5">
                  <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                    Choose OpenClaw if
                  </p>
                  <p className="text-sm leading-6 text-[#4d5145]">
                    You are already standardized on OpenClaw, prefer bringing your own provider
                    accounts, and want the broader published video mode surface and provider matrix
                    inside the OpenClaw runtime itself.
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
              <div className="max-w-[920px] space-y-5">
                <p className="text-base leading-7 text-[#4d5145]">
                  This page is intentionally scoped to video-generation workflow fit, not to every
                  OpenClaw feature. The OpenClaw side of the comparison was reviewed against the
                  public video-generation documentation available on April 7, 2026, especially the
                  sections covering provider activation, runtime modes, the declared capability
                  matrix, task lifecycle, and provider notes.
                </p>
                <p className="text-base leading-7 text-[#4d5145]">
                  The AnyCap side of the comparison is based on currently published product pages
                  for video generation, pricing, installation, and Drive. Claims on this page stay
                  inside what a reader can verify from public sources: one login and one key
                  positioning, pay-as-you-go pricing, a simpler hosted artifact workflow, and
                  broader cross-agent portability.
                </p>
                <div className="rounded-xl border border-[#d4dbb8] bg-[#f9faf5] p-5">
                  <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                    Methodology note
                  </p>
                  <p className="text-sm leading-6 text-[#4d5145]">
                    If OpenClaw changes its hosted product surface, credit model, or public video
                    capability matrix later, this page should be updated. The comparison is
                    strongest when it stays tied to publicly verifiable workflow differences instead
                    of broad category claims.
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
              <div className="grid max-w-[980px] gap-4 sm:grid-cols-2">
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
              <div className="max-w-[860px] space-y-6">
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
            <section className="mt-16 mb-8 md:mt-24">
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                Related pages
              </h2>
              <div className="grid max-w-[1120px] gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Link
                  href="/capabilities/video-generation"
                  className="border border-[#d4dbb8] p-5 transition-colors hover:border-[#6b7d3a]"
                >
                  <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                    Capability
                  </p>
                  <h3 className="mb-2 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                    AnyCap Video Generation
                  </h3>
                  <p className="text-sm leading-6 text-[#4d5145]">
                    See the hosted video-generation surface, public models, and CLI positioning.
                  </p>
                </Link>
                <Link
                  href="/start"
                  className="border border-[#d4dbb8] p-5 transition-colors hover:border-[#6b7d3a]"
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
                <Link
                  href="/capabilities/drive"
                  className="border border-[#d4dbb8] p-5 transition-colors hover:border-[#6b7d3a]"
                >
                  <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                    Artifact workflow
                  </p>
                  <h3 className="mb-2 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                    AnyCap Drive
                  </h3>
                  <p className="text-sm leading-6 text-[#4d5145]">
                    Store generated videos and turn them into share links from the same account.
                  </p>
                </Link>
                <Link
                  href="/for/claude-code/video-generation"
                  className="border border-[#d4dbb8] p-5 transition-colors hover:border-[#6b7d3a]"
                >
                  <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                    Agent page
                  </p>
                  <h3 className="mb-2 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                    Video Generation for Claude Code
                  </h3>
                  <p className="text-sm leading-6 text-[#4d5145]">
                    See how the same video runtime carries into another agent environment.
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
