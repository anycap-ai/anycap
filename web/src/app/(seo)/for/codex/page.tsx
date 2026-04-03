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

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

export const metadata: Metadata = {
  title: "Codex tools and capabilities — Add image, video, and vision with AnyCap",
  description:
    "Install one skill and tell Codex what you need. It installs the AnyCap CLI, authenticates, and delivers image generation, video generation, image understanding, and video analysis — all from natural language.",
  alternates: { canonical: "/for/codex" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/for/codex",
    siteName: siteConfig.siteName,
    title: "Codex tools and capabilities — Add image, video, and vision with AnyCap",
    description:
      "Install one skill and Codex handles the rest — CLI install, authentication, and capability calls, all from natural language.",
  },
};

const integrationGuideJsonLd = {
  ...createTechArticleJsonLd({
    headline: "Codex tools and capabilities — Add image, video, and vision with AnyCap",
    description:
      "Guide to adding image generation, video generation, image understanding, and video analysis to OpenAI Codex through one capability runtime.",
    path: "/for/codex",
    about: ["Codex", "AnyCap CLI", "Agent skills", "Capability runtime"],
    keywords: [
      "codex tools",
      "add tools to codex",
      "codex capabilities",
      "codex image generation",
      "codex cli tools",
    ],
  }),
  datePublished: "2026-04-03",
  dateModified: "2026-04-03",
};

const faqItems = [
  {
    question: "Can Codex generate images on its own?",
    answer:
      "No. Codex focuses on code reasoning and terminal execution inside a sandboxed VM. It has no built-in image generation runtime. AnyCap adds that capability through one skill install and one CLI, so Codex can produce visuals without leaving its terminal-first workflow.",
  },
  {
    question: "Why use AnyCap instead of wiring providers directly?",
    answer:
      "Codex tasks run in isolated, ephemeral cloud sandboxes. Wiring a separate image API, a video API, and a vision API into every task means repeated credential setup and SDK installation. AnyCap consolidates those into one CLI and one login that persists across Codex sessions.",
  },
  {
    question: "Does AnyCap replace Codex?",
    answer:
      "No. AnyCap is not an agent. It is a capability runtime that runs alongside Codex. You keep Codex for code, planning, and terminal execution, and add the image, video, and vision tools it does not ship with.",
  },
  {
    question: "What is the fastest path to add tools to Codex?",
    answer:
      "Add the AnyCap skill once, then describe what you need in natural language. Codex reads the skill, installs the CLI, authenticates, and calls the right capability automatically. If you prefer manual control, you can also install the CLI and log in yourself in three steps.",
  },
  {
    question: "Does AnyCap work inside the Codex sandbox?",
    answer:
      "Yes. The AnyCap CLI is a single binary with no external dependencies. It runs inside the Codex sandbox, sends API requests to the AnyCap server, and returns file paths or URLs that Codex can use in subsequent terminal steps.",
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

const gapRows = buildAgentCapabilityGapRows("codex");

const installSteps = [
  {
    title: "Install the skill",
    subtitle: "Step 1",
    code: "npx -y skills add anycap-ai/anycap -a codex -y",
    note: "This teaches Codex how to discover and call the AnyCap runtime without changing the way you already work.",
  },
  {
    title: "Install the CLI",
    subtitle: "Step 2",
    code: "curl -fsSL https://anycap.ai/install.sh | sh",
    note: "The CLI is a single binary with no runtime dependencies — it runs inside the Codex sandbox as a standard terminal tool.",
  },
  {
    title: "Log in and verify",
    subtitle: "Step 3",
    code: "anycap login && anycap status",
    note: "After authentication, Codex can move across image, video, and vision capabilities without new credentials or dashboard detours.",
  },
];

const videoObjectJsonLd = {
  "@context": "https://schema.org",
  "@type": "VideoObject",
  name: "Install and use AnyCap with Codex",
  description:
    "Watch Codex install AnyCap from a natural-language prompt — skill discovery, CLI setup, authentication, and first image generation in one uninterrupted flow.",
  contentUrl: `${CDN_BASE}/for_codex.mp4`,
  uploadDate: "2026-04-03",
  duration: "PT48S",
  thumbnailUrl: `${CDN_BASE}/for_codex_thumb.jpg`,
};

const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "Add image, video, and vision capabilities to Codex",
  description:
    "Install the AnyCap skill so Codex can set up the CLI and authenticate automatically through natural language. Manual steps are also available.",
  step: [
    {
      "@type": "HowToStep",
      name: "Install the AnyCap skill",
      text: "Run npx -y skills add anycap-ai/anycap -a codex -y. This is the only manual step — after this, Codex can install the CLI and authenticate on its own when you describe a task.",
    },
    {
      "@type": "HowToStep",
      name: "Tell Codex what you need",
      text: "Describe the task in natural language, such as 'help me install AnyCap and generate a product mockup image' or 'generate a product mockup image'. Codex reads the skill, installs the CLI, authenticates, and calls the right AnyCap capability automatically.",
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
    summary: "Best next page when Codex needs visuals, mockups, launch assets, or other image output.",
    command: "anycap image generate",
  },
  {
    eyebrow: "Motion output",
    title: "Video Generation",
    href: "/capabilities/video-generation",
    summary: "Best next page when Codex needs demos, walkthroughs, or short-form video output.",
    command: "anycap video generate",
  },
  {
    eyebrow: "Vision",
    title: "Image Understanding",
    href: "/capabilities/image-understanding",
    summary: "Best next page when Codex needs to interpret screenshots, diagrams, OCR, or design feedback.",
    command: "anycap image read",
  },
  {
    eyebrow: "Analysis",
    title: "Video Analysis",
    href: "/capabilities/video-analysis",
    summary: "Best next page when Codex needs to inspect recordings and extract structured details.",
    command: "anycap video read",
  },
];

const siblingAgents = [
  { label: "Claude Code", href: "/for/claude-code" },
  { label: "Cursor", href: "/for/cursor" },
  { label: "Manus", href: "/for/manus" },
];

export default function ForCodexPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Equip Agents", href: "/for", unlinkable: true },
          { name: "Codex" },
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
          {/* ── Hero ── */}
          <FadeIn>
            <p className="mb-4 text-[11px] tracking-[0.8px] text-[#6b7d3a]" style={mono}>
              For Codex
            </p>
            <h1
              className="max-w-[960px] leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(32px, 5vw, 64px)", textWrap: "balance" } as React.CSSProperties}
            >
              Codex is strong at code and terminal work.
              <br />
              It still needs image, video, and vision tools.
            </h1>

            <div className="mt-8">
              <DemoVideo
                src={`${CDN_BASE}/for_codex.mp4`}
                title="Install and use AnyCap with Codex"
                autoLoop
              />
            </div>
            <p className="mt-3 max-w-[780px] text-sm leading-6 text-[#5a5e52]">
              Watch Codex install AnyCap from a natural-language prompt — skill discovery, CLI
              setup, authentication, and first image generation in one uninterrupted flow.
            </p>

            <p className="mt-6 max-w-[780px] text-base leading-7 text-[#4d5145] md:text-lg">
              <a
                href="https://openai.com/index/codex/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-[#d4dbb8] underline-offset-2 transition-colors hover:text-[#6b7d3a] hover:decoration-[#6b7d3a]"
              >
                Codex
              </a>{" "}
              is excellent at code, reasoning, and terminal execution. The gap appears when the
              workflow needs product visuals, walkthrough videos, screenshot understanding, or
              recording review — none of those are Codex tools today.
            </p>
            <p className="mt-4 max-w-[780px] text-base leading-7 text-[#4d5145] md:text-lg">
              After adding the AnyCap skill, just tell Codex what you need in plain language. It
              reads the skill, installs the CLI, authenticates, and calls the right capability — all
              inside its own terminal session, without any manual setup from you.
            </p>
            <p className="mt-4 text-sm leading-6 text-[#6b7d3a]" style={mono}>
              One skill. Natural-language install. Immediate capabilities.
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
                href="/capabilities/video-analysis"
                className="inline-block rounded-lg border border-[#1c1f17] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                style={mono}
              >
                Video Analysis
              </Link>
            </div>
          </FadeIn>

          <FadeIn className="mt-8">
            <EarlyAccessBanner />
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          {/* ── Install — natural language first, manual steps as alternative ── */}
          <FadeIn>
            <section className="mt-16 md:mt-24">
              <p className="mb-4 text-[11px] tracking-[0.8px] text-[#6b7d3a]" style={mono}>
                Get started
              </p>
              <h2
                className="text-[#1c1f17] leading-[1.1] tracking-[-0.02em]"
                style={{ ...pixel, fontSize: "clamp(24px, 4vw, 44px)" }}
              >
                Add the skill once.
                <br />
                Then just ask Codex in natural language.
              </h2>
              <p className="mt-5 max-w-[760px] text-base leading-7 text-[#4d5145]">
                The only bootstrap step is adding the AnyCap skill. After that, you can just tell
                Codex what to do in plain language. Codex reads the skill, installs the CLI,
                authenticates, and starts delivering results in the same terminal session without
                extra setup from you.
              </p>
              <div className="mt-8 rounded-xl border border-[#d4dbb8] bg-[#fffffc]/70 p-6">
                <p className="mb-3 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                  Run once
                </p>
                <div className="bg-[#1c1f17] px-5 py-4 rounded-lg">
                  <p className="text-[13px] text-[#d4e0a4]" style={mono}>
                    npx -y skills add anycap-ai/anycap -a codex -y
                  </p>
                </div>
                <p className="mt-4 text-sm leading-6 text-[#4d5145]">
                  After that, you can just talk to Codex in natural language. Ask it to help you
                  install AnyCap and generate a product mockup image, or simply ask for a product
                  mockup image, and it will install the AnyCap CLI, log in, and call{" "}
                  <span className="text-[#6b7d3a]" style={mono}>anycap image generate</span>{" "}
                  automatically.
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

          {/* ── Why it fits Codex — architecture evidence ── */}
          <FadeIn>
            <section className="mt-16 md:mt-24">
              <p className="mb-4 text-[11px] tracking-[0.8px] text-[#6b7d3a]" style={mono}>
                Why it fits
              </p>
              <h2
                className="text-[#1c1f17] leading-[1.1] tracking-[-0.02em]"
                style={{ ...pixel, fontSize: "clamp(24px, 4vw, 44px)" }}
              >
                Built for the way Codex already works
              </h2>
              <p className="mt-5 max-w-[760px] text-base leading-7 text-[#4d5145]">
                AnyCap installs cleanly into Codex because it was designed for the same constraints:
                sandboxed VMs, terminal-only output, and ephemeral task environments.
              </p>
              <div className="mt-8 grid gap-6 lg:grid-cols-3">
                <div className="rounded-xl border border-[#d4dbb8] bg-[#fffffc]/70 p-6">
                  <h3 className="mb-3 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                    Sandboxed execution
                  </h3>
                  <p className="text-sm leading-6 text-[#4d5145]">
                    Codex runs each task in an isolated cloud VM. The AnyCap CLI is a
                    dependency-free binary that installs and authenticates inside that sandbox,
                    so no host-level setup leaks between tasks.
                  </p>
                </div>
                <div className="rounded-xl border border-[#d4dbb8] bg-[#fffffc]/70 p-6">
                  <h3 className="mb-3 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                    Terminal-native output
                  </h3>
                  <p className="text-sm leading-6 text-[#4d5145]">
                    Codex has no GUI — every result is text in a terminal. AnyCap returns file
                    paths and CDN URLs that Codex can pass to subsequent steps, embed in
                    markdown, or hand off to downstream tooling.
                  </p>
                </div>
                <div className="rounded-xl border border-[#d4dbb8] bg-[#fffffc]/70 p-6">
                  <h3 className="mb-3 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                    One credential, every capability
                  </h3>
                  <p className="text-sm leading-6 text-[#4d5145]">
                    Without a runtime layer, adding image generation, video generation, and
                    vision means three separate provider credentials per sandbox. AnyCap
                    consolidates them into one login that covers the full stack.
                  </p>
                </div>
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          {/* ── Gap table ── */}
          <FadeIn>
            <div className="mt-16 md:mt-24">
              <CapabilityGapTable
                eyebrow="Capability gap"
                title="What you get after those three commands"
                description="Codex stays focused on code and terminal execution while AnyCap fills the generation, analysis, search, storage, and publishing gaps that sit outside its sandboxed surface area."
                columns={[
                  { label: "Codex alone" },
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

          {/* ── Capability cards ── */}
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

          {/* ── FAQ ── */}
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

          {/* ── Sibling agents + CTAs ── */}
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
