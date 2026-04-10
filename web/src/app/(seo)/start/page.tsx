import type { Metadata } from "next";
import { DemoVideo } from "@/components/ui/DemoVideo";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { EarlyAccessBanner } from "@/components/landing/EarlyAccessBanner";
import { FadeIn } from "@/components/ui/FadeIn";
import { createTechArticleJsonLd } from "@/lib/schema";
import { siteConfig } from "@/lib/site";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;
const CDN_BASE = "https://cdn.anycap.ai/page_resource/start";
const START_VIDEO_SRC = `${CDN_BASE}/start-hero.mp4`;
const START_VIDEO_POSTER = `${CDN_BASE}/start-hero-poster.jpg`;
const START_VIDEO_THUMBNAIL_URL = START_VIDEO_POSTER;
const lastUpdatedLabel = "April 10, 2026";
const lastUpdatedIso = "2026-04-10";

export const metadata: Metadata = {
  title: "Get started with AnyCap — Don't switch agents, add capabilities immediately",
  description:
    "Start with AnyCap in minutes. Pick Claude Code, Cursor, or Codex, then just ask in natural language to install one skill and one CLI and add image, video, and vision capabilities without switching agents.",
  alternates: { canonical: "/start" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/start",
    siteName: siteConfig.siteName,
    title: "Get started with AnyCap — Don't switch agents, add capabilities immediately",
    description:
      "Pick your agent, ask in natural language, and add image, video, and vision capabilities through one CLI.",
  },
};

const getStartedJsonLd = createTechArticleJsonLd({
  headline: "Get started with AnyCap — Don't switch agents, add capabilities immediately",
  description:
    "Quick start page for installing AnyCap by asking your agent in natural language and choosing the right onboarding path for Claude Code, Cursor, or Codex.",
  path: "/start",
  about: ["AnyCap CLI", "AI agents", "Claude Code", "Cursor", "Codex"],
  keywords: ["get started with anycap", "install anycap", "add capabilities to claude code", "cursor tools", "codex tools"],
  dateModified: lastUpdatedIso,
});

const videoObjectJsonLd = {
  "@context": "https://schema.org",
  "@type": "VideoObject",
  name: "Get started with AnyCap",
  description:
    "A 25-second brand video for the start page, showing AnyCap's 'don't switch agents' positioning and the idea that you can get started by asking in natural language.",
  contentUrl: START_VIDEO_SRC,
  uploadDate: lastUpdatedIso,
  duration: "PT25S",
  thumbnailUrl: START_VIDEO_THUMBNAIL_URL,
} as const;

const agentOptions = [
  {
    name: "Claude Code",
    href: "/for/claude-code",
    command: "npx -y skills add anycap-ai/anycap -a claude-code -y",
    description:
      "Best first path if you want the strongest install intent page and the deepest capability onboarding.",
  },
  {
    name: "Cursor",
    href: "/for/cursor",
    command: "npx -y skills add anycap-ai/anycap -a cursor -y",
    description:
      "Use this if your agent workflows already live in Cursor and you want the same capability layer there.",
  },
  {
    name: "Codex",
    href: "/for/codex",
    command: "npx -y skills add anycap-ai/anycap -a codex -y",
    description:
      "Good fit when you want to add image, video, and vision capabilities to Codex without wiring provider SDKs.",
  },
];

const universalSteps = [
  {
    title: "Ask your agent to get you started",
    code: 'help me install AnyCap and generate a launch image',
    note: "Claude Code, Cursor, or Codex can take a plain-language request and turn it into the setup flow for you.",
  },
  {
    title: "Install the CLI",
    code: "curl -fsSL https://anycap.ai/install.sh | sh",
    note: "Or install via npm if you prefer a package manager path.",
  },
  {
    title: "Log in once",
    code: "anycap login",
    note: "Authentication happens once and carries across every capability, so you can keep asking in natural language after setup.",
  },
];

const gapEntrances = [
  {
    eyebrow: "Claude Code",
    title: "Add image generation to Claude Code",
    href: "/for/claude-code/image-generation",
    summary: "Best next page if the gap is visuals, mockups, or creative assets.",
  },
  {
    eyebrow: "Claude Code",
    title: "Add video generation to Claude Code",
    href: "/for/claude-code/video-generation",
    summary: "Best next page if the gap is demos, walkthroughs, or social clips.",
  },
  {
    eyebrow: "Problem intent",
    title: "What agents still can't do",
    href: "/learn/what-agents-cant-do",
    summary: "Use this when you want the deficiency narrative and the right landing page for each missing capability.",
  },
  {
    eyebrow: "Capability hub",
    title: "Browse any capability",
    href: "/capabilities",
    summary: "Use this when you already know you want image, video, or vision APIs for your agent.",
  },
];

export default function StartPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Home", href: "/" }, { name: "Get Started", href: "/start" }]} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(getStartedJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(videoObjectJsonLd) }}
      />

      <article className="px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[1280px] py-12 md:py-20 lg:py-24">
          <FadeIn>
            <p className="mb-4 text-[11px] tracking-[0.8px] text-[#6b7d3a]" style={mono}>
              Start
            </p>
            <h1
              className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(32px, 6vw, 72px)" }}
            >
              Don&apos;t switch agents.
              <br />
              Add capabilities immediately.
            </h1>
            <p className="mt-6 max-w-[760px] text-base leading-7 text-[#4d5145] md:text-lg">
              AnyCap is the fastest path from a capable coding agent to a capable multimodal
              agent. Pick the agent you already use, then tell it what you want in natural
              language. It can install one skill and one CLI for you, then add image generation,
              video generation, image understanding, and video analysis through the same command
              surface.
            </p>
            <p className="mt-4 text-[11px] text-[#5a5e52]" style={mono}>
              Last updated {lastUpdatedLabel}
            </p>
            <div className="mt-6 max-w-[760px] rounded-xl border border-[#d4dbb8] bg-[#fffffc]/70 p-5">
              <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                Natural language first
              </p>
              <p className="mt-2 text-base leading-7 text-[#1c1f17]">
                Just say what you want, like{" "}
                <span style={mono}>help me install AnyCap and generate a launch image</span>.
              </p>
              <p className="mt-2 text-sm leading-6 text-[#4d5145]">
                The smoother path is to ask in plain language and let the agent carry the setup,
                login, and capability call from there.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/for/claude-code"
                className="inline-block rounded-lg bg-[#6b7d3a] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#f4f5f0] transition-colors hover:bg-[#1c1f17]"
                style={mono}
              >
                Start with Claude Code
              </Link>
              <Link
                href="/guides/install-anycap"
                className="inline-block rounded-lg border border-[#1c1f17] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                style={mono}
              >
                Universal install guide
              </Link>
              <Link
                href="/learn/what-agents-cant-do"
                className="inline-block rounded-lg border border-[#1c1f17] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                style={mono}
              >
                See capability gaps
              </Link>
            </div>
            <div className="mt-10 max-w-[920px]">
              <p className="mb-4 text-[11px] tracking-[0.8px] text-[#6b7d3a]" style={mono}>
                Watch
              </p>
              <h2 className="mb-4 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                See the natural-language workflow in motion
              </h2>
              <DemoVideo
                src={START_VIDEO_SRC}
                poster={START_VIDEO_POSTER}
                title="Get started with AnyCap"
                description="A short brand video for the start page. It pairs the 'don't switch agents' message with the idea that you can start by describing what you need in natural language."
                autoLoop
              />
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
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                Pick your agent
              </h2>
              <div className="grid gap-4 lg:grid-cols-3">
                {agentOptions.map((option) => (
                  <Link
                    key={option.name}
                    href={option.href}
                    className="rounded-xl border border-[#d4dbb8] bg-[#fffffc]/70 p-6 transition-colors hover:border-[#6b7d3a]"
                  >
                    <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                      Agent path
                    </p>
                    <h3 className="mb-3 text-[16px] font-bold text-[#1c1f17]" style={mono}>
                      {option.name}
                    </h3>
                    <p className="text-sm leading-6 text-[#4d5145]">{option.description}</p>
                    <div className="mt-5 bg-[#1c1f17] px-4 py-3">
                      <p className="break-all text-[13px] text-[#d4e0a4]" style={mono}>
                        {option.command}
                      </p>
                    </div>
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
                Natural-language start path
              </h2>
              <div className="grid gap-6 lg:grid-cols-3">
                {universalSteps.map((step, index) => (
                  <div key={step.title} className="border-l-[3px] border-[#6b7d3a] pl-6">
                    <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                      Step {index + 1}
                    </p>
                    <h3 className="mb-3 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                      {step.title}
                    </h3>
                    <div className="bg-[#1c1f17] px-4 py-3">
                      <p className="break-all text-[13px] text-[#d4e0a4]" style={mono}>
                        {step.code}
                      </p>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-[#4d5145]">{step.note}</p>
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
                Start from the gap you need to close
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {gapEntrances.map((entry) => (
                  <Link
                    key={entry.href}
                    href={entry.href}
                    className="rounded-xl border border-[#d4dbb8] bg-[#fffffc]/70 p-6 transition-colors hover:border-[#6b7d3a]"
                  >
                    <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                      {entry.eyebrow}
                    </p>
                    <h3 className="mb-3 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                      {entry.title}
                    </h3>
                    <p className="text-sm leading-6 text-[#4d5145]">{entry.summary}</p>
                  </Link>
                ))}
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24 mb-8">
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/guides/install-anycap"
                  className="inline-block rounded-lg bg-[#6b7d3a] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#f4f5f0] transition-colors hover:bg-[#1c1f17]"
                  style={mono}
                >
                  Install AnyCap
                </Link>
                <Link
                  href="/capabilities"
                  className="inline-block rounded-lg border border-[#1c1f17] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                  style={mono}
                >
                  Any Capability
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
