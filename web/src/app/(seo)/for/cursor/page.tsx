import type { Metadata } from "next";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { CapabilityGapTable } from "@/components/landing/CapabilityGapTable";
import { EarlyAccessBanner } from "@/components/landing/EarlyAccessBanner";
import { DemoVideo } from "@/components/ui/DemoVideo";
import { FadeIn } from "@/components/ui/FadeIn";
import { buildAgentCapabilityGapRows } from "@/lib/capability-inventory";
import { createTechArticleJsonLd } from "@/lib/schema";
import { siteConfig } from "@/lib/site";

const CDN_BASE = "https://cdn.anycap.ai/page_resource/for_agent";
const FALLBACK_THUMBNAIL_URL = `${siteConfig.url}/opengraph-image`;

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;
const lastUpdatedLabel = "April 5, 2026";
const lastUpdatedIso = "2026-04-05";

export const metadata: Metadata = {
  title: "Cursor tools and capabilities — Add image, video, and vision with AnyCap",
  description:
    "Tell Cursor 'help me install anycap.ai' and it handles the rest — skill discovery, CLI install, authentication, and immediate access to image generation, video generation, image understanding, and video analysis from natural language.",
  alternates: { canonical: "/for/cursor" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/for/cursor",
    siteName: siteConfig.siteName,
    title: "Cursor tools and capabilities — Add image, video, and vision with AnyCap",
    description:
      "Tell Cursor to install AnyCap and it handles the rest — skill discovery, CLI setup, authentication, and capability calls from the same editor and terminal workflow.",
  },
};

const integrationGuideJsonLd = {
  ...createTechArticleJsonLd({
    headline: "Cursor tools and capabilities — Add image, video, and vision with AnyCap",
    description:
      "Guide to adding image generation, video generation, image understanding, and video analysis to Cursor through one capability runtime.",
    path: "/for/cursor",
    about: ["Cursor", "AnyCap CLI", "Agent skills", "Capability runtime"],
    keywords: [
      "cursor tools",
      "add tools to cursor",
      "cursor capabilities",
      "can cursor generate images",
      "cursor image generation",
      "cursor seedream 5 vs nano banana 2",
      "cursor veo 3.1 vs kling 3.0",
    ],
    datePublished: "2026-04-03",
    dateModified: lastUpdatedIso,
  }),
};

const faqItems = [
  {
    question: "Can Cursor generate images on its own?",
    answer:
      "No. Cursor is excellent at coding, refactoring, and workspace-aware edits, but it does not ship with a built-in image generation runtime. AnyCap adds that capability through one skill install and one CLI, so Cursor can produce visuals without leaving the editor and terminal workflow you already use.",
  },
  {
    question: "Why use AnyCap instead of wiring providers directly?",
    answer:
      "Wiring a separate image API, a video API, and a vision API into Cursor means managing multiple SDKs, credentials, and prompts across the same project. AnyCap consolidates those into one CLI and one login, so Cursor gets one capability layer instead of several disconnected provider setups.",
  },
  {
    question: "Does AnyCap replace Cursor?",
    answer:
      "No. AnyCap is not an IDE or coding agent. It is a capability runtime that runs alongside Cursor. You keep Cursor for code, planning, and editing, and add the image, video, and vision tools it does not ship with.",
  },
  {
    question: "What is the fastest path to add tools to Cursor?",
    answer:
      "Just tell Cursor what you need in natural language, such as 'help me install anycap.ai'. It can discover the skill, install the CLI, authenticate, and call the right capability automatically. If you prefer manual control, you can still use the three-step install path below.",
  },
  {
    question: "Does AnyCap work inside the Cursor workflow?",
    answer:
      "Yes. The AnyCap CLI is a single binary with no external dependencies. It runs in Cursor's integrated terminal, sends API requests to the AnyCap server, and returns file paths or URLs that Cursor can use in follow-up steps, save into your project, or pass to downstream tooling.",
  },
  {
    question: "Which image model fits Cursor best: Seedream 5, Nano Banana 2, or Nano Banana Pro?",
    answer:
      "For Cursor workflows, Seedream 5 is the stronger first-pass image model, Nano Banana 2 is the faster option for high-volume iteration, and Nano Banana Pro is the better fit when the workflow starts from an existing image and needs targeted revisions.",
  },
  {
    question: "Which video model fits Cursor best: Veo 3.1, Kling 3.0, or Seedance 1.5 Pro?",
    answer:
      "For Cursor, Veo 3.1 is the premium default, Kling 3.0 is a good fit for more cinematic motion, and Seedance 1.5 Pro is a dependable choice for steady image-to-video and production-friendly workflows.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

const gapRows = buildAgentCapabilityGapRows("cursor");

const installSteps = [
  {
    title: "Install the skill",
    subtitle: "Step 1",
    code: "npx -y skills add anycap-ai/anycap -a cursor -y",
    note: "This teaches Cursor how to discover and call the AnyCap runtime without changing the way you already work.",
  },
  {
    title: "Install the CLI",
    subtitle: "Step 2",
    code: "curl -fsSL https://anycap.ai/install.sh | sh",
    note: "The CLI is a single binary with no runtime dependencies, so it runs cleanly inside Cursor's integrated terminal.",
  },
  {
    title: "Log in and verify",
    subtitle: "Step 3",
    code: "anycap login && anycap status",
    note: "After authentication, Cursor can move across image, video, and vision capabilities without new credentials or dashboard detours.",
  },
];

const videoObjectJsonLd = {
  "@context": "https://schema.org",
  "@type": "VideoObject",
  name: "Install and use AnyCap with Cursor",
  description:
    "Watch Cursor install AnyCap from a natural-language prompt — skill discovery, CLI setup, authentication, and first image generation in one uninterrupted flow.",
  contentUrl: `${CDN_BASE}/for_cursor.mp4`,
  uploadDate: "2026-04-03",
  duration: "PT48S",
  thumbnailUrl: FALLBACK_THUMBNAIL_URL,
};

const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "Add image, video, and vision capabilities to Cursor",
  description:
    "Tell Cursor to install AnyCap through natural language. Manual steps are also available if you prefer direct command control.",
  step: [
    {
      "@type": "HowToStep",
      name: "Ask Cursor to install AnyCap",
      text: "Tell Cursor 'help me install anycap.ai'. Cursor can discover the skill, install the CLI, authenticate, and set up the capability runtime from natural language.",
    },
    {
      "@type": "HowToStep",
      name: "Tell Cursor what you need",
      text: "Describe the task in natural language, such as 'generate a product mockup image'. Cursor calls the right AnyCap capability automatically from the same workspace flow.",
    },
    {
      "@type": "HowToStep",
      name: "(Optional) Install manually",
      text: "If you prefer manual control: run curl -fsSL https://anycap.ai/install.sh | sh to install the CLI, then run anycap login && anycap status to authenticate.",
    },
  ],
};

const capabilityCards = [
  {
    eyebrow: "Creative output",
    title: "Image Generation",
    href: "/capabilities/image-generation",
    summary: "Best next page when Cursor needs visuals, mockups, launch assets, or other image output.",
    command: "anycap image generate",
  },
  {
    eyebrow: "Motion output",
    title: "Video Generation",
    href: "/capabilities/video-generation",
    summary: "Best next page when Cursor needs demos, walkthroughs, or short-form video output.",
    command: "anycap video generate",
  },
  {
    eyebrow: "Vision",
    title: "Image Understanding",
    href: "/capabilities/image-understanding",
    summary: "Best next page when Cursor needs to interpret screenshots, diagrams, OCR, or design feedback.",
    command: "anycap image read",
  },
  {
    eyebrow: "Analysis",
    title: "Video Analysis",
    href: "/capabilities/video-analysis",
    summary: "Best next page when Cursor needs to inspect recordings and extract structured details.",
    command: "anycap video read",
  },
];

const modelCards = [
  {
    eyebrow: "Image model",
    title: "Seedream 5",
    href: "/models/seedream-5",
    summary: "Best first-pass image model for polished Cursor mockups, launch visuals, and cleaner visual concepts.",
    comparison: "Compare with Nano Banana 2 when the question is speed vs polish.",
  },
  {
    eyebrow: "Image model",
    title: "Nano Banana 2",
    href: "/models/nano-banana-2",
    summary: "Best for fast iteration when Cursor needs many visual variants or repeated content generation.",
    comparison: "Compare with Seedream 5 and Nano Banana Pro for workflow fit.",
  },
  {
    eyebrow: "Video model",
    title: "Veo 3.1",
    href: "/models/veo-3-1",
    summary: "Best premium video model for Cursor when the task needs high-end cinematic output.",
    comparison: "Compare with Kling 3.0 and Seedance 1.5 Pro for motion style and workflow tradeoffs.",
  },
];

const siblingAgents = [
  { label: "Claude Code", href: "/for/claude-code" },
  { label: "Codex", href: "/for/codex" },
  { label: "Manus", href: "/for/manus" },
];

export default function ForCursorPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Equip Agents", href: "/for", unlinkable: true },
          { name: "Cursor" },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(integrationGuideJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(videoObjectJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
      />

      <article className="px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[1280px] py-12 md:py-20 lg:py-24">
          <FadeIn>
            <p className="mb-4 text-[11px] tracking-[0.8px] text-[#6b7d3a]" style={mono}>
              For Cursor
            </p>
            <p className="text-[11px] text-[#5a5e52] tracking-[0.5px] mb-3" style={mono}>
              Last updated {lastUpdatedLabel}
            </p>
            <h1
              className="max-w-[960px] leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(32px, 5vw, 64px)", textWrap: "balance" } as React.CSSProperties}
            >
              Cursor is strong at code and workspace edits.
              <br />
              It still needs image, video, and vision capabilities.
            </h1>

            <div className="mt-8">
              <DemoVideo
                src={`${CDN_BASE}/for_cursor.mp4`}
                poster={FALLBACK_THUMBNAIL_URL}
                title="Install and use AnyCap with Cursor"
                autoLoop
              />
            </div>
            <p className="mt-3 max-w-[780px] text-sm leading-6 text-[#5a5e52]">
              Watch Cursor install AnyCap from a natural-language prompt — skill discovery, CLI
              setup, authentication, and first image generation in one uninterrupted flow.
            </p>

            <p className="mt-6 max-w-[780px] text-base leading-7 text-[#4d5145] md:text-lg">
              <a
                href="https://cursor.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-[#d4dbb8] underline-offset-2 transition-colors hover:text-[#6b7d3a] hover:decoration-[#6b7d3a]"
              >
                Cursor
              </a>{" "}
              is excellent at code generation, refactors, and workspace-aware edits. The gap
              appears when the workflow needs product visuals, walkthrough videos, screenshot
              understanding, or recording review — none of those are Cursor tools today.
            </p>
            <p className="mt-4 max-w-[780px] text-base leading-7 text-[#4d5145] md:text-lg">
              Just tell Cursor what you need — like{" "}
              <span className="text-[#6b7d3a]" style={mono}>&quot;help me install anycap.ai&quot;</span>.
              It discovers the skill, installs the CLI, authenticates, and calls the right
              capability — all inside the same editor and terminal flow, without forcing you into
              separate provider setups.
            </p>
            <p className="mt-4 text-sm leading-6 text-[#6b7d3a]" style={mono}>
              Natural language. Zero manual steps. Immediate capabilities.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link
                href="/start"
                className="inline-block rounded-lg bg-[#6b7d3a] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#f4f5f0] transition-colors hover:bg-[#1c1f17]"
                style={mono}
              >
                Get Started
              </Link>
              <Link
                href="/capabilities/image-generation"
                className="inline-block rounded-lg border border-[#1c1f17] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                style={mono}
              >
                Image Generation
              </Link>
              <Link
                href="/capabilities/video-generation"
                className="inline-block rounded-lg border border-[#1c1f17] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                style={mono}
              >
                Video Generation
              </Link>
            </div>
          </FadeIn>

          <FadeIn className="mt-8">
            <EarlyAccessBanner />
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <p className="mb-4 text-[11px] tracking-[0.8px] text-[#6b7d3a]" style={mono}>
                Get started
              </p>
              <h2
                className="text-[#1c1f17] leading-[1.1] tracking-[-0.02em]"
                style={{ ...pixel, fontSize: "clamp(24px, 4vw, 44px)" }}
              >
                Tell Cursor &quot;help me install anycap.ai&quot;. Done.
              </h2>
              <p className="mt-5 max-w-[760px] text-base leading-7 text-[#4d5145]">
                Cursor can discover the AnyCap skill, install the CLI, authenticate, and invoke
                capabilities on its own. Just describe the task in natural language — Cursor runs
                the setup and starts delivering results in the same workspace flow. No multi-provider
                wiring required.
              </p>
              <div className="mt-8 rounded-xl border border-[#d4dbb8] bg-[#fffffc]/70 p-6">
                <p className="mb-3 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                  What to type in Cursor
                </p>
                <div className="rounded-lg bg-[#1c1f17] px-5 py-4">
                  <p className="text-[13px] text-[#d4e0a4]" style={mono}>
                    help me install anycap.ai
                  </p>
                </div>
                <p className="mt-4 text-sm leading-6 text-[#4d5145]">
                  After setup, tell Cursor something like{" "}
                  <span className="text-[#6b7d3a]" style={mono}>&quot;generate a product mockup image&quot;</span>{" "}
                  — it will call{" "}
                  <span className="text-[#6b7d3a]" style={mono}>anycap image generate</span>{" "}
                  automatically. If you want direct command control instead, open the manual
                  install steps below.
                </p>
              </div>

              <details className="mt-8 group">
                <summary
                  className="cursor-pointer text-[13px] text-[#5a5e52] transition-colors hover:text-[#6b7d3a]"
                  style={mono}
                >
                  Prefer to install manually? Here are the three steps.
                </summary>
                <div className="mt-6 grid gap-6 lg:grid-cols-3">
                  {installSteps.map((step) => (
                    <div key={step.title} className="border-l-[3px] border-[#6b7d3a] pl-6">
                      <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                        {step.subtitle}
                      </p>
                      <h3 className="mb-3 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                        {step.title}
                      </h3>
                      <div className="bg-[#1c1f17] px-5 py-4">
                        <p className="break-all text-[13px] text-[#d4e0a4]" style={mono}>
                          {step.code}
                        </p>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-[#4d5145]">{step.note}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-6 text-sm leading-6 text-[#5a5e52]">
                  For a full walkthrough, see the{" "}
                  <Link
                    href="/guides/install-anycap"
                    className="underline decoration-[#d4dbb8] underline-offset-2 transition-colors hover:text-[#6b7d3a] hover:decoration-[#6b7d3a]"
                  >
                    install guide
                  </Link>
                  .
                </p>
              </details>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <p className="mb-4 text-[11px] tracking-[0.8px] text-[#6b7d3a]" style={mono}>
                Why it fits
              </p>
              <h2
                className="text-[#1c1f17] leading-[1.1] tracking-[-0.02em]"
                style={{ ...pixel, fontSize: "clamp(24px, 4vw, 44px)" }}
              >
                Built for the way Cursor already works
              </h2>
              <p className="mt-5 max-w-[760px] text-base leading-7 text-[#4d5145]">
                AnyCap installs cleanly into Cursor because it was designed for the same
                constraints: editor-driven workflows, integrated terminal execution, and
                project-based context.
              </p>
              <div className="mt-8 grid gap-6 lg:grid-cols-3">
                <div className="rounded-xl border border-[#d4dbb8] bg-[#fffffc]/70 p-6">
                  <h3 className="mb-3 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                    Integrated terminal execution
                  </h3>
                  <p className="text-sm leading-6 text-[#4d5145]">
                    Cursor already works through code plus terminal. The AnyCap CLI is a
                    dependency-free binary that installs and authenticates in that same terminal
                    session, so capabilities are available without leaving the editor flow.
                  </p>
                </div>
                <div className="rounded-xl border border-[#d4dbb8] bg-[#fffffc]/70 p-6">
                  <h3 className="mb-3 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                    Workspace-aware outputs
                  </h3>
                  <p className="text-sm leading-6 text-[#4d5145]">
                    Cursor has direct access to your repo and surrounding files. AnyCap returns
                    file paths and CDN URLs that Cursor can save into project directories, thread
                    into docs, or pass to downstream scripts and build steps.
                  </p>
                </div>
                <div className="rounded-xl border border-[#d4dbb8] bg-[#fffffc]/70 p-6">
                  <h3 className="mb-3 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                    One credential, every capability
                  </h3>
                  <p className="text-sm leading-6 text-[#4d5145]">
                    Without a runtime layer, adding image generation, video generation, and vision
                    means separate provider credentials inside the same project workflow. AnyCap
                    consolidates them into one login that covers the full stack.
                  </p>
                </div>
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <div className="mt-16 md:mt-24">
              <CapabilityGapTable
                eyebrow="Capability gap"
                title="What you get after one skill install"
                description="Cursor stays focused on code and workspace edits while AnyCap fills the generation, analysis, search, storage, and publishing gaps that sit outside its built-in surface area."
                columns={[
                  { label: "Cursor alone" },
                  { label: "Add with AnyCap", accent: true },
                  { label: "Best next step" },
                ]}
                rows={gapRows}
              />
            </div>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                Start with the first missing capability
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {capabilityCards.map((card) => (
                  <Link
                    key={card.href}
                    href={card.href}
                    className="rounded-xl border border-[#d4dbb8] bg-[#fffffc]/70 p-6 transition-colors hover:border-[#6b7d3a]"
                  >
                    <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                      {card.eyebrow}
                    </p>
                    <h3 className="mb-3 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                      {card.title}
                    </h3>
                    <p className="text-sm leading-6 text-[#4d5145]">{card.summary}</p>
                    <p className="mt-4 text-[12px] text-[#6b7d3a]" style={mono}>
                      {card.command}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-4 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                Then pick the model, not just the capability
              </h2>
              <p className="max-w-[820px] text-sm leading-6 text-[#4d5145]">
                Cursor users often search for model comparisons, not just capabilities. The
                image choice is usually <Link href="/models/seedream-5" className="underline decoration-[#d4dbb8] underline-offset-2 hover:text-[#6b7d3a] hover:decoration-[#6b7d3a]">Seedream 5</Link>{" "}
                vs{" "}
                <Link href="/models/nano-banana-2" className="underline decoration-[#d4dbb8] underline-offset-2 hover:text-[#6b7d3a] hover:decoration-[#6b7d3a]">Nano Banana 2</Link>,
                while video choice is often{" "}
                <Link href="/models/veo-3-1" className="underline decoration-[#d4dbb8] underline-offset-2 hover:text-[#6b7d3a] hover:decoration-[#6b7d3a]">Veo 3.1</Link>{" "}
                vs{" "}
                <Link href="/models/kling-3-0" className="underline decoration-[#d4dbb8] underline-offset-2 hover:text-[#6b7d3a] hover:decoration-[#6b7d3a]">Kling 3.0</Link>.
                These guides help Cursor pick the right model before it calls the CLI.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {modelCards.map((card) => (
                  <Link
                    key={card.href}
                    href={card.href}
                    className="rounded-xl border border-[#d4dbb8] bg-[#fffffc]/70 p-6 transition-colors hover:border-[#6b7d3a]"
                  >
                    <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                      {card.eyebrow}
                    </p>
                    <h3 className="mb-3 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                      {card.title}
                    </h3>
                    <p className="text-sm leading-6 text-[#4d5145]">{card.summary}</p>
                    <p className="mt-4 text-[12px] leading-5 text-[#6b7d3a]" style={mono}>
                      {card.comparison}
                    </p>
                  </Link>
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
                  <div key={item.question} className="rounded-xl border border-[#d4dbb8] p-5">
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
              <p className="mb-4 text-[11px] tracking-[0.8px] text-[#6b7d3a]" style={mono}>
                Also available for
              </p>
              <div className="mb-8 flex flex-wrap gap-3">
                {siblingAgents.map((agent) => (
                  <Link
                    key={agent.href}
                    href={agent.href}
                    className="rounded-lg border border-[#d4dbb8] px-5 py-2 text-[12px] text-[#1c1f17] transition-colors hover:border-[#6b7d3a] hover:text-[#6b7d3a]"
                    style={mono}
                  >
                    {agent.label}
                  </Link>
                ))}
              </div>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/start"
                  className="inline-block rounded-lg bg-[#6b7d3a] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#f4f5f0] transition-colors hover:bg-[#1c1f17]"
                  style={mono}
                >
                  Get Started
                </Link>
                <Link
                  href="/cli"
                  className="inline-block rounded-lg border border-[#1c1f17] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                  style={mono}
                >
                  Why One CLI Matters
                </Link>
                <Link
                  href="/skills"
                  className="inline-block rounded-lg border border-[#1c1f17] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                  style={mono}
                >
                  How Skills Fit
                </Link>
              </div>
              <p className="mt-6 text-[11px] text-[#5a5e52]" style={mono}>
                Last updated Apr 2026
              </p>
            </section>
          </FadeIn>
        </div>
      </article>
    </>
  );
}
