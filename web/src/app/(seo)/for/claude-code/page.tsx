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
const lastUpdatedLabel = "April 5, 2026";
const lastUpdatedIso = "2026-04-05";

export const metadata: Metadata = {
  title: "Claude Code tools and capabilities — Add image, video, and vision with AnyCap",
  description:
    "Tell Claude Code 'help me install anycap.ai' and it handles the rest — skill discovery, CLI install, authentication, and immediate access to image generation, video generation, image understanding, and video analysis, all from natural language.",
  alternates: { canonical: "/for/claude-code" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/for/claude-code",
    siteName: siteConfig.siteName,
    title: "Claude Code tools and capabilities — Add image, video, and vision with AnyCap",
    description:
      "Tell Claude Code to install AnyCap and it handles the rest — skill discovery, CLI setup, authentication, and capability calls, all from natural language.",
  },
};

const integrationGuideJsonLd = {
  ...createTechArticleJsonLd({
    headline: "Claude Code tools and capabilities — Add image, video, and vision with AnyCap",
    description:
      "Guide to adding image generation, video generation, image understanding, and video analysis to Claude Code through one capability runtime.",
    path: "/for/claude-code",
    about: ["Claude Code", "AnyCap CLI", "Agent skills", "Capability runtime"],
    keywords: [
      "claude code tools",
      "claude code capabilities",
      "add tools to claude code",
      "can claude code generate images",
      "claude code plugins",
    ],
    datePublished: "2026-04-03",
    dateModified: lastUpdatedIso,
  }),
};

const faqItems = [
  {
    question: "Can Claude Code generate images on its own?",
    answer:
      "No. Claude Code focuses on code reasoning, planning, and terminal execution. It has no built-in image generation runtime. AnyCap adds that capability through one skill install and one CLI, so Claude Code can produce visuals without leaving your terminal session or wiring a separate image provider.",
  },
  {
    question: "Why use AnyCap instead of wiring providers directly?",
    answer:
      "Wiring a separate image API, a video API, and a vision API means managing three sets of credentials, SDKs, and authentication flows. AnyCap consolidates those into one CLI and one login that Claude Code can invoke directly from your terminal. One skill install replaces multiple provider integrations.",
  },
  {
    question: "Does AnyCap replace Claude Code?",
    answer:
      "No. AnyCap is not an agent. It is a capability runtime that runs alongside Claude Code. You keep Claude Code for code, planning, and terminal execution, and add the image, video, and vision tools it does not ship with. AnyCap extends Claude Code — it never competes with it.",
  },
  {
    question: "What is the fastest path to add tools to Claude Code?",
    answer:
      "Just tell Claude Code 'help me install anycap.ai' in natural language. It discovers the skill, installs the CLI, authenticates, and is ready to generate images or video immediately. No commands to memorize. If you prefer manual control, you can also install the skill and CLI yourself in three steps.",
  },
  {
    question: "Does AnyCap work inside the Claude Code terminal?",
    answer:
      "Yes. The AnyCap CLI is a single binary with no external dependencies. It runs directly in Claude Code's terminal session, sends API requests to the AnyCap server, and returns file paths or URLs that Claude Code can use in subsequent steps, embed in code, or save to your project directory.",
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

const gapRows = buildAgentCapabilityGapRows("claude-code");

const installSteps = [
  {
    title: "Install the skill",
    subtitle: "Step 1",
    code: "npx -y skills add anycap-ai/anycap -a claude-code -y",
    note: "This teaches Claude Code how to discover and invoke the AnyCap capability runtime.",
  },
  {
    title: "Install the CLI",
    subtitle: "Step 2",
    code: "curl -fsSL https://anycap.ai/install.sh | sh",
    note: "The CLI is a single binary with no runtime dependencies — it runs directly in Claude Code's terminal session.",
  },
  {
    title: "Log in and verify",
    subtitle: "Step 3",
    code: "anycap login && anycap status",
    note: "After authentication, Claude Code can move across image, video, and vision capabilities without new credentials or dashboard detours.",
  },
];

const videoObjectJsonLd = {
  "@context": "https://schema.org",
  "@type": "VideoObject",
  name: "Install and use AnyCap with Claude Code",
  description:
    "Watch Claude Code install AnyCap from a natural-language prompt — skill discovery, CLI setup, authentication, and first image generation in one uninterrupted flow.",
  contentUrl: `${CDN_BASE}/for_claude_code2.mp4`,
  uploadDate: "2026-04-03",
  duration: "PT48S",
  thumbnailUrl: `${CDN_BASE}/for_claude_code_thumb.jpg`,
};

const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "Add image, video, and vision capabilities to Claude Code",
  description:
    "Tell Claude Code to install AnyCap using natural language. It discovers the skill, installs the CLI, and authenticates automatically. Manual steps are also available.",
  step: [
    {
      "@type": "HowToStep",
      name: "Tell Claude Code to install AnyCap",
      text: "Say something like 'help me install anycap.ai' in natural language. Claude Code discovers the AnyCap skill, installs the CLI, and authenticates — all automatically in one terminal session.",
    },
    {
      "@type": "HowToStep",
      name: "Describe what you need",
      text: "Once installed, describe any task in natural language, such as 'generate a product mockup image'. Claude Code calls the right AnyCap capability automatically.",
    },
    {
      "@type": "HowToStep",
      name: "(Optional) Install manually",
      text: "If you prefer manual control: run npx -y skills add anycap-ai/anycap -a claude-code -y to install the skill, curl -fsSL https://anycap.ai/install.sh | sh to install the CLI, then anycap login && anycap status to authenticate.",
    },
  ],
};

const capabilityCards = [
  {
    eyebrow: "Creative output",
    title: "Image Generation",
    href: "/capabilities/image-generation",
    summary: "Best next page when Claude Code needs visuals, mockups, launch assets, or other image output.",
    command: "anycap image generate",
  },
  {
    eyebrow: "Motion output",
    title: "Video Generation",
    href: "/capabilities/video-generation",
    summary: "Best next page when Claude Code needs demos, walkthroughs, or short-form video output.",
    command: "anycap video generate",
  },
  {
    eyebrow: "Vision",
    title: "Image Understanding",
    href: "/capabilities/image-understanding",
    summary: "Best next page when Claude Code needs to interpret screenshots, diagrams, OCR, or design feedback.",
    command: "anycap image read",
  },
  {
    eyebrow: "Analysis",
    title: "Video Analysis",
    href: "/capabilities/video-analysis",
    summary: "Best next page when Claude Code needs to inspect recordings and extract structured details.",
    command: "anycap video read",
  },
];

const siblingAgents = [
  { label: "Codex", href: "/for/codex" },
  { label: "Cursor", href: "/for/cursor" },
  { label: "Manus", href: "/for/manus" },
];

export default function ForClaudeCodePage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Equip Agents", href: "/for", unlinkable: true },
          { name: "Claude Code" },
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
              For Claude Code
            </p>
            <p className="text-[11px] text-[#5a5e52] tracking-[0.5px] mb-3" style={mono}>
              Last updated {lastUpdatedLabel}
            </p>
            <h1
              className="max-w-[960px] leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(32px, 5vw, 64px)", textWrap: "balance" } as React.CSSProperties}
            >
              Claude Code can code.
              <br />
              It still needs image, video, and vision capabilities.
            </h1>

            <div className="mt-8">
              <DemoVideo
                src={`${CDN_BASE}/for_claude_code2.mp4`}
                poster={`${CDN_BASE}/for_claude_code_thumb.jpg`}
                title="Install and use AnyCap with Claude Code"
                autoLoop
              />
            </div>
            <p className="mt-3 max-w-[780px] text-sm leading-6 text-[#5a5e52]">
              Watch Claude Code install AnyCap from a natural-language prompt — skill discovery, CLI
              setup, authentication, and first image generation in one uninterrupted flow.
            </p>

            <p className="mt-6 max-w-[780px] text-base leading-7 text-[#4d5145] md:text-lg">
              <a
                href="https://docs.anthropic.com/en/docs/claude-code/overview"
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-[#d4dbb8] underline-offset-2 transition-colors hover:text-[#6b7d3a] hover:decoration-[#6b7d3a]"
              >
                Claude Code
              </a>{" "}
              is excellent at planning, refactoring, and code execution. The gap appears when the
              workflow needs product visuals, walkthrough videos, screenshot understanding, or
              recording review — none of those are Claude Code tools today.
            </p>
            <p className="mt-4 max-w-[780px] text-base leading-7 text-[#4d5145] md:text-lg">
              Just tell Claude Code what you need — like{" "}
              <span className="text-[#6b7d3a]" style={mono}>help me install anycap.ai</span>.
              It discovers the skill, installs the CLI, authenticates, and calls the right
              capability — all inside your terminal session, without any manual commands from you.
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
                Just ask. Claude Code does the rest.
              </h2>
              <p className="mt-5 max-w-[760px] text-base leading-7 text-[#4d5145]">
                No commands to memorize, no manual setup. Tell Claude Code what you need in natural
                language and it discovers the AnyCap skill, installs the CLI, authenticates, and
                starts delivering results — all in the same terminal session.
              </p>
              <div className="mt-8 rounded-xl border border-[#d4dbb8] bg-[#fffffc]/70 p-6">
                <p className="mb-3 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                  What you say to Claude Code
                </p>
                <div className="bg-[#1c1f17] px-5 py-4 rounded-lg">
                  <p className="text-[15px] text-[#d4e0a4]" style={mono}>
                    Help me install anycap.ai
                  </p>
                </div>
                <p className="mt-4 text-sm leading-6 text-[#4d5145]">
                  Claude Code reads the prompt, discovers the AnyCap skill, installs the CLI,
                  authenticates, and is ready to call{" "}
                  <span className="text-[#6b7d3a]" style={mono}>anycap image generate</span>,{" "}
                  <span className="text-[#6b7d3a]" style={mono}>anycap video generate</span>, or
                  any other capability — automatically.
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

          {/* ── Why it fits Claude Code — architecture evidence ── */}
          <FadeIn>
            <section className="mt-16 md:mt-24">
              <p className="mb-4 text-[11px] tracking-[0.8px] text-[#6b7d3a]" style={mono}>
                Why it fits
              </p>
              <h2
                className="text-[#1c1f17] leading-[1.1] tracking-[-0.02em]"
                style={{ ...pixel, fontSize: "clamp(24px, 4vw, 44px)" }}
              >
                Built for the way Claude Code already works
              </h2>
              <p className="mt-5 max-w-[760px] text-base leading-7 text-[#4d5145]">
                AnyCap installs cleanly into Claude Code because it was designed for the same
                constraints: local terminal execution, filesystem access, and skill-based discovery.
              </p>
              <div className="mt-8 grid gap-6 lg:grid-cols-3">
                <div className="rounded-xl border border-[#d4dbb8] bg-[#fffffc]/70 p-6">
                  <h3 className="mb-3 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                    Local terminal execution
                  </h3>
                  <p className="text-sm leading-6 text-[#4d5145]">
                    Claude Code runs directly in your terminal alongside your codebase. The AnyCap
                    CLI is a dependency-free binary that installs and authenticates in the same
                    session, so capabilities are available without leaving the terminal.
                  </p>
                </div>
                <div className="rounded-xl border border-[#d4dbb8] bg-[#fffffc]/70 p-6">
                  <h3 className="mb-3 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                    Filesystem integration
                  </h3>
                  <p className="text-sm leading-6 text-[#4d5145]">
                    Claude Code has direct access to your project files. AnyCap returns file
                    paths and CDN URLs that Claude Code can save into project directories, embed
                    in markdown, or hand off to downstream tooling.
                  </p>
                </div>
                <div className="rounded-xl border border-[#d4dbb8] bg-[#fffffc]/70 p-6">
                  <h3 className="mb-3 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                    One credential, every capability
                  </h3>
                  <p className="text-sm leading-6 text-[#4d5145]">
                    Without a runtime layer, adding image generation, video generation, and
                    vision means three separate provider credentials. AnyCap consolidates them
                    into one login that covers the full stack.
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
                title="What you get after one conversation"
                description="Claude Code stays focused on code and terminal execution while AnyCap fills the generation, analysis, search, storage, and publishing gaps that sit outside its built-in surface area."
                columns={[
                  { label: "Claude Code alone" },
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
                  href="/guides/add-tools-to-claude-code"
                  className="inline-block rounded-lg bg-[#6b7d3a] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#f4f5f0] transition-colors hover:bg-[#1c1f17]"
                  style={mono}
                >
                  Add Tools to Claude Code
                </Link>
                <Link
                  href="/start"
                  className="inline-block rounded-lg border border-[#1c1f17] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
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
