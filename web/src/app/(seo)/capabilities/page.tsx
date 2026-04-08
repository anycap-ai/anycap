import type { Metadata } from "next";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import {
  CapabilityGapTable,
  type CapabilityGapRow,
} from "@/components/landing/CapabilityGapTable";
import { FadeIn } from "@/components/ui/FadeIn";
import { createTechArticleJsonLd } from "@/lib/schema";
import {
  adjacentWorkflowSummary,
  publicCapabilitySummary,
  siteConfig,
} from "@/lib/site";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

export const metadata: Metadata = {
  title: "AI Agent Capabilities — Image, video, audio, web, storage, and publishing",
  description:
    "Browse the AI agent capability runtime that adds image, video, audio, web, storage, and publishing workflows through one install path, one auth flow, and one CLI.",
  alternates: { canonical: "/capabilities" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/capabilities",
    siteName: siteConfig.siteName,
    title: "AI Agent Capabilities — Image, video, audio, web, storage, and publishing",
    description:
      "Start with the live capability inventory for coding agents, then expand into storage and publishing workflows through the same runtime.",
  },
};

interface Capability {
  name: string;
  category: string;
  status: "available" | "coming_soon";
  description: string;
  models?: string;
  href: string | null;
}

const capabilities: Capability[] = [
  {
    name: "Image Generation",
    category: "Image",
    status: "available",
    description:
      "Generate and edit images through Seedream 5, Seedream 4.5, Nano Banana Pro, and Nano Banana 2.",
    models: "Seedream 5, Seedream 4.5, Nano Banana Pro, Nano Banana 2",
    href: "/capabilities/image-generation",
  },
  {
    name: "Video Generation",
    category: "Video",
    status: "available",
    description: "Generate videos from text prompts and images through Veo 3.1, Seedance 1.5 Pro, and Kling 3.0.",
    models: "Veo 3.1, Seedance 1.5 Pro, Kling 3.0",
    href: "/capabilities/video-generation",
  },
  {
    name: "Music Generation",
    category: "Audio",
    status: "available",
    description: "Generate music tracks and instrumental audio through one music runtime.",
    models: "ElevenLabs Music",
    href: "/capabilities/music-generation",
  },
  {
    name: "Image Understanding",
    category: "Vision",
    status: "available",
    description: "Analyze screenshots, diagrams, photos, and charts through one vision runtime.",
    models: "Vision models",
    href: "/capabilities/image-understanding",
  },
  {
    name: "Video Analysis",
    category: "Video",
    status: "available",
    description: "Inspect recordings and extract structured information from video content.",
    models: "Vision models",
    href: "/capabilities/video-analysis",
  },
  {
    name: "Audio Understanding",
    category: "Audio",
    status: "available",
    description: "Transcribe and analyze meetings, podcasts, and voice clips through one runtime.",
    models: "Audio models",
    href: "/capabilities/audio-understanding",
  },
  {
    name: "Web Search",
    category: "Web",
    status: "available",
    description: "Search the web for structured results with optional full-page content.",
    href: "/capabilities/web-search",
  },
  {
    name: "Grounded Web Search",
    category: "Web",
    status: "available",
    description: "Get synthesized answers with citations grounded in live web search.",
    href: "/capabilities/grounded-web-search",
  },
  {
    name: "Web Crawl",
    category: "Web",
    status: "available",
    description: "Convert web pages into clean Markdown for downstream agent workflows.",
    href: "/capabilities/web-crawl",
  },
  {
    name: "Drive",
    category: "Storage",
    status: "available",
    description: "Store outputs, organize assets, and share public URLs through AnyCap Drive.",
    href: "/capabilities/drive",
  },
  {
    name: "Speech",
    category: "Audio",
    status: "coming_soon",
    description: "Text-to-speech and voice generation.",
    href: null,
  },
];

const hubArticleJsonLd = createTechArticleJsonLd({
  headline: "AI Agent Capabilities — Image, video, audio, web, storage, and publishing",
  description:
    "Hub page for the live AnyCap capability inventory across media, web retrieval, storage, and publishing workflows.",
  path: "/capabilities",
  about: ["AI agent capabilities", "Media generation", "Web retrieval", "Drive storage"],
  keywords: [
    "ai agent capabilities",
    "image generation for ai agents",
    "video generation for ai agents",
    "audio understanding for ai agents",
    "web search api for ai agents",
    "web crawl for ai agents",
    "drive for ai agents",
    "page publishing for ai agents",
  ],
});

const itemListJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "AnyCap Capabilities",
  description:
    "Capability hub for the live AnyCap inventory across media, web retrieval, storage, and publishing workflows.",
  numberOfItems: capabilities.filter((capability) => capability.status === "available").length,
  itemListElement: capabilities
    .filter((capability) => capability.status === "available")
    .map((capability, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: capability.name,
      description: capability.description,
      ...(capability.href ? { url: `${siteConfig.url}${capability.href}` } : {}),
    })),
};

const gapRows: CapabilityGapRow[] = [
  {
    capability: "Code generation",
    cells: [
      "Built in",
      "Built in",
      "Built in",
      { label: "Built in", tone: "accent" },
    ],
  },
  {
    capability: "Image generation",
    cells: [
      { label: "Not built in", tone: "muted" },
      { label: "Not built in", tone: "muted" },
      { label: "Not built in", tone: "muted" },
      { label: "Available", tone: "accent" },
    ],
  },
  {
    capability: "Video generation",
    cells: [
      { label: "Not built in", tone: "muted" },
      { label: "Not built in", tone: "muted" },
      { label: "Not built in", tone: "muted" },
      { label: "Available", tone: "accent" },
    ],
  },
  {
    capability: "Music generation",
    cells: [
      { label: "Not built in", tone: "muted" },
      { label: "Not built in", tone: "muted" },
      { label: "Not built in", tone: "muted" },
      { label: "Available", tone: "accent" },
    ],
  },
  {
    capability: "Image understanding",
    cells: [
      { label: "No unified runtime", tone: "muted" },
      { label: "No unified runtime", tone: "muted" },
      { label: "No unified runtime", tone: "muted" },
      { label: "Available", tone: "accent" },
    ],
  },
  {
    capability: "Video analysis",
    cells: [
      { label: "No unified runtime", tone: "muted" },
      { label: "No unified runtime", tone: "muted" },
      { label: "No unified runtime", tone: "muted" },
      { label: "Available", tone: "accent" },
    ],
  },
  {
    capability: "Audio understanding",
    cells: [
      { label: "No unified audio runtime", tone: "muted" },
      { label: "No unified audio runtime", tone: "muted" },
      { label: "No unified audio runtime", tone: "muted" },
      { label: "Available", tone: "accent" },
    ],
  },
  {
    capability: "Web search",
    cells: [
      { label: "External tooling", tone: "muted" },
      { label: "External tooling", tone: "muted" },
      { label: "External tooling", tone: "muted" },
      { label: "Available", tone: "accent" },
    ],
  },
  {
    capability: "Grounded web search",
    cells: [
      { label: "No grounded flow", tone: "muted" },
      { label: "No grounded flow", tone: "muted" },
      { label: "No grounded flow", tone: "muted" },
      { label: "Available", tone: "accent" },
    ],
  },
  {
    capability: "Web crawl",
    cells: [
      { label: "No reusable crawl runtime", tone: "muted" },
      { label: "No reusable crawl runtime", tone: "muted" },
      { label: "No reusable crawl runtime", tone: "muted" },
      { label: "Available", tone: "accent" },
    ],
  },
  {
    capability: "Drive storage",
    cells: [
      { label: "No shared asset layer", tone: "muted" },
      { label: "No shared asset layer", tone: "muted" },
      { label: "No shared asset layer", tone: "muted" },
      { label: "Available", tone: "accent" },
    ],
  },
  {
    capability: "Speech",
    cells: [
      { label: "Not built in", tone: "muted" },
      { label: "Not built in", tone: "muted" },
      { label: "Not built in", tone: "muted" },
      { label: "Coming soon", tone: "accent" },
    ],
  },
];

const relatedCards = [
  {
    eyebrow: "Deficiency hub",
    title: "What agents can't do",
    href: "/learn/what-agents-cant-do",
    summary: "Start here if you are diagnosing the missing capability before choosing a specific page.",
  },
  {
    eyebrow: "Agent path",
    title: "For Claude Code",
    href: "/for/claude-code",
    summary: "Start here if Claude Code is your primary agent and you want the ecosystem-specific install path.",
  },
  {
    eyebrow: "Install path",
    title: "Get Started",
    href: "/start",
    summary: "Start here if you want the shortest path from zero setup to first capability call.",
  },
];

export default function CapabilitiesPage() {
  const availableCapabilities = capabilities.filter((capability) => capability.status === "available");
  const comingSoon = capabilities.filter((capability) => capability.status === "coming_soon");

  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Home", href: "/" }, { name: "Capabilities" }]} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(hubArticleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />

      <article className="px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[1280px] py-12 md:py-20 lg:py-24">
          <FadeIn>
            <p className="mb-4 text-[11px] tracking-[0.8px] text-[#6b7d3a]" style={mono}>
              AI agent capabilities
            </p>
            <h1
              className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(32px, 6vw, 72px)" }}
            >
              Keep the agent you use.
              <br />
              Add the capabilities it lacks.
            </h1>
            <p className="mt-6 max-w-[780px] text-base leading-7 text-[#4d5145] md:text-lg">
              AnyCap is an AI agent capability runtime for coding agents. Start with
              {` ${publicCapabilitySummary}`} through one CLI, one auth flow, and one install
              path across Claude Code, Cursor, Codex, and the rest of your agent stack. The same
              runtime also extends into {adjacentWorkflowSummary} as your workflows grow.
            </p>
          </FadeIn>

          <FadeIn>
            <div className="mt-16 md:mt-24">
              <CapabilityGapTable
                eyebrow="Comparison"
                title="What the common coding agents still miss"
                description="This table shows the capability gap across the current agent ecosystem and the layer AnyCap adds on top."
                columns={[
                  { label: "Claude Code" },
                  { label: "Cursor" },
                  { label: "Codex" },
                  { label: "Add with AnyCap", accent: true },
                ]}
                rows={gapRows}
                footnote="This is the fastest way to show the narrative: keep the agent, add the missing capability layer."
              />
            </div>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                Browse the live capability inventory
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {availableCapabilities.map((capability) => {
                  const inner = (
                    <div className="h-full rounded-xl border border-[#d4dbb8] bg-[#fffffc]/70 p-6 transition-colors hover:border-[#6b7d3a]">
                      <div className="mb-3 flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-[#6b7d3a]" />
                        <span className="text-[10px] tracking-[0.5px] text-[#5a5e52]" style={mono}>
                          {capability.category}
                        </span>
                      </div>
                      <h3 className="mb-2 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                        {capability.name}
                      </h3>
                      <p className="mb-3 text-sm leading-6 text-[#4d5145]">{capability.description}</p>
                      {capability.models ? (
                        <p className="text-[12px] text-[#4d5145]" style={mono}>
                          {capability.models}
                        </p>
                      ) : null}
                    </div>
                  );

                  return capability.href ? (
                    <Link key={capability.name} href={capability.href} className="group">
                      {inner}
                    </Link>
                  ) : (
                    <div key={capability.name}>{inner}</div>
                  );
                })}
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                Models behind the capabilities
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 max-w-[980px]">
                <Link
                  href="/models"
                  className="rounded-xl border border-[#d4dbb8] p-6 transition-colors hover:border-[#6b7d3a]"
                >
                  <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                    Hub
                  </p>
                  <h3 className="mb-2 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                    Model Guide
                  </h3>
                  <p className="text-sm leading-6 text-[#4d5145]">
                    Browse the multimodal models available through AnyCap and map them to the right
                    agent workflow.
                  </p>
                </Link>
                <Link
                  href="/guides/context-engineering-for-agents"
                  className="rounded-xl border border-[#d4dbb8] p-6 transition-colors hover:border-[#6b7d3a]"
                >
                  <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                    Guide
                  </p>
                  <h3 className="mb-2 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                    Context Engineering for Agents
                  </h3>
                  <p className="text-sm leading-6 text-[#4d5145]">
                    Understand how agents decide when image, video, and analysis capabilities belong
                    in the workflow.
                  </p>
                </Link>
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                Related entry pages
              </h2>
              <div className="grid gap-4 sm:grid-cols-3 max-w-[1120px]">
                {relatedCards.map((card) => (
                  <Link
                    key={card.href}
                    href={card.href}
                    className="rounded-xl border border-[#d4dbb8] p-6 transition-colors hover:border-[#6b7d3a]"
                  >
                    <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                      {card.eyebrow}
                    </p>
                    <h3 className="mb-2 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                      {card.title}
                    </h3>
                    <p className="text-sm leading-6 text-[#4d5145]">{card.summary}</p>
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
                Coming soon
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {comingSoon.map((capability) => (
                  <div
                    key={capability.name}
                    className="rounded-xl border border-[#d4dbb8]/60 p-5 opacity-70"
                  >
                    <div className="mb-3 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#d4dbb8]" />
                      <span className="text-[10px] tracking-[0.5px] text-[#5a5e52]" style={mono}>
                        {capability.category}
                      </span>
                    </div>
                    <h3 className="mb-2 text-[14px] font-bold text-[#5a5e52]" style={mono}>
                      {capability.name}
                    </h3>
                    <p className="text-sm leading-6 text-[#5a5e52]">{capability.description}</p>
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
              <h2 className="mb-6 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                Get Started
              </h2>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/start"
                  className="inline-block rounded-lg bg-[#6b7d3a] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#f4f5f0] transition-colors hover:bg-[#1c1f17]"
                  style={mono}
                >
                  Get Started
                </Link>
                <Link
                  href="/learn/what-agents-cant-do"
                  className="inline-block rounded-lg border border-[#1c1f17] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                  style={mono}
                >
                  What agents can&apos;t do
                </Link>
                <Link
                  href="/for/claude-code"
                  className="inline-block rounded-lg border border-[#1c1f17] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                  style={mono}
                >
                  For Claude Code
                </Link>
              </div>
            </section>
          </FadeIn>
        </div>
      </article>
    </>
  );
}
