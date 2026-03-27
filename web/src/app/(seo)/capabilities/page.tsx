import type { Metadata } from "next";
import { LocalizedLink as Link } from "@/components/LocalizedLink";
import { siteConfig } from "@/lib/site";
import { FadeIn } from "@/components/FadeIn";
import { EarlyAccessBanner } from "@/components/EarlyAccessBanner";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace" } as const;

export const metadata: Metadata = {
  title: "Capabilities — Agent capabilities through one interface",
  description:
    "AnyCap gives AI agents installable capabilities including image generation, video generation, image understanding, and video analysis. One CLI, one auth, every capability.",
  alternates: { canonical: "/capabilities" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/capabilities",
    siteName: siteConfig.siteName,
    title: "Capabilities — Agent capabilities through one interface",
    description:
      "AnyCap gives AI agents installable capabilities including image generation, video generation, image understanding, and video analysis. One CLI, one auth, every capability.",
  },
};

interface Capability {
  name: string;
  category: string;
  status: "early_access" | "coming_soon";
  description: string;
  models?: string;
  href: string | null;
}

const capabilities: Capability[] = [
  {
    name: "Image Generation",
    category: "Image",
    status: "early_access",
    description: "Generate and edit images through multiple models including Seedream 5, Seedream 4.5, Nano Banana Pro, and Nano Banana 2.",
    models: "Seedream 5, Seedream 4.5, Nano Banana Pro, Nano Banana 2",
    href: "/capabilities/image-generation",
  },
  {
    name: "Video Generation",
    category: "Video",
    status: "early_access",
    description: "Generate videos from text prompts through Veo 3.1.",
    models: "Veo 3.1",
    href: "/capabilities/video-generation",
  },
  {
    name: "Image Understanding",
    category: "Image",
    status: "early_access",
    description: "Analyze and describe images using vision models.",
    href: "/capabilities/image-understanding",
  },
  {
    name: "Video Analysis",
    category: "Video",
    status: "early_access",
    description: "Analyze video content and extract information.",
    href: "/capabilities/video-analysis",
  },
  {
    name: "Music",
    category: "Audio",
    status: "coming_soon",
    description: "Generate music and audio compositions.",
    href: null,
  },
  {
    name: "Speech",
    category: "Audio",
    status: "coming_soon",
    description: "Text-to-speech and voice generation.",
    href: null,
  },
  {
    name: "Search",
    category: "Web",
    status: "coming_soon",
    description: "Web search capabilities for agents.",
    href: null,
  },
  {
    name: "Crawl",
    category: "Web",
    status: "coming_soon",
    description: "Web crawling and content extraction.",
    href: null,
  },
];

const itemListJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "AnyCap Capabilities",
  description: "Agent capabilities in early access through the AnyCap CLI and capability runtime.",
  numberOfItems: capabilities.filter((c) => c.status === "early_access").length,
  itemListElement: capabilities
    .filter((c) => c.status === "early_access")
    .map((cap, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: cap.name,
      description: cap.description,
      ...(cap.href ? { url: `${siteConfig.url}${cap.href}` } : {}),
    })),
};

export default function CapabilitiesPage() {
  const earlyAccess = capabilities.filter((c) => c.status === "early_access");
  const comingSoon = capabilities.filter((c) => c.status === "coming_soon");

  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: "Home", href: "/" },
        { name: "Capabilities" },
      ]} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />

      <article className="px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[1280px] py-12 md:py-20 lg:py-24">
          {/* Hero */}
          <FadeIn>
            <h1
              className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(32px, 6vw, 72px)" }}
            >
              Capabilities
            </h1>
            <p className="mt-6 max-w-[700px] text-base leading-7 text-[#4d5145] md:text-lg">
              AnyCap sits between an agent and the capabilities it needs. Instead of wiring
              separate tools, auth flows, and interfaces for each capability, teams can use
              AnyCap as a consistent layer for installing, accessing, and managing agent-facing
              capabilities. One interface for image generation, video generation, image
              understanding, video analysis, and more — across Claude Code, Cursor, Codex,
              and other agent products.
            </p>
          </FadeIn>
          <FadeIn className="mt-8">
            <EarlyAccessBanner />
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          {/* Early Access */}
          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2
                className="text-lg md:text-xl text-[#1c1f17] mb-8"
                style={{ ...pixel }}
              >
                Early Access
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {earlyAccess.map((cap) => {
                  const inner = (
                    <div className="border border-[#d4dbb8] p-6 h-full hover:border-[#6b7d3a] transition-colors">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-2 h-2 rounded-full bg-[#6b7d3a]" />
                        <span
                          className="text-[10px] text-[#5a5e52] tracking-[2px] uppercase"
                          style={mono}
                        >
                          {cap.category}
                        </span>
                      </div>
                      <h3
                        className="text-[15px] font-bold text-[#1c1f17] mb-2"
                        style={mono}
                      >
                        {cap.name}
                      </h3>
                      <p className="text-sm text-[#4d5145] leading-6 mb-3">
                        {cap.description}
                      </p>
                      {cap.models && (
                        <p className="text-[12px] text-[#4d5145]" style={mono}>
                          {cap.models}
                        </p>
                      )}
                    </div>
                  );

                  return cap.href ? (
                    <Link key={cap.name} href={cap.href} className="group">
                      {inner}
                    </Link>
                  ) : (
                    <div key={cap.name}>{inner}</div>
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
              <h2
                className="text-lg md:text-xl text-[#1c1f17] mb-8"
                style={{ ...pixel }}
              >
                Models Behind the Capabilities
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 max-w-[980px]">
                <Link
                  href="/models"
                  className="border border-[#d4dbb8] p-6 hover:border-[#6b7d3a] transition-colors"
                >
                  <p className="text-[11px] text-[#6b7d3a] tracking-[2px] uppercase mb-2" style={mono}>
                    Hub
                  </p>
                  <h3 className="text-[15px] font-bold text-[#1c1f17] mb-2" style={mono}>
                    Model Guide
                  </h3>
                  <p className="text-sm text-[#4d5145] leading-6">
                    Browse the current multimodal models available through AnyCap and pick the
                    right model for each agent workflow.
                  </p>
                </Link>
                <Link
                  href="/guides/context-engineering-for-agents"
                  className="border border-[#d4dbb8] p-6 hover:border-[#6b7d3a] transition-colors"
                >
                  <p className="text-[11px] text-[#6b7d3a] tracking-[2px] uppercase mb-2" style={mono}>
                    Guide
                  </p>
                  <h3 className="text-[15px] font-bold text-[#1c1f17] mb-2" style={mono}>
                    Context Engineering for Agents
                  </h3>
                  <p className="text-sm text-[#4d5145] leading-6">
                    Understand how agents decide when to call image, video, and analysis capabilities.
                  </p>
                </Link>
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          {/* Coming Soon */}
          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2
                className="text-lg md:text-xl text-[#1c1f17] mb-8"
                style={{ ...pixel }}
              >
                Coming Soon
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {comingSoon.map((cap) => (
                  <div
                    key={cap.name}
                    className="border border-[#d4dbb8]/60 p-5 opacity-70"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-2 h-2 rounded-full bg-[#d4dbb8]" />
                      <span
                        className="text-[10px] text-[#5a5e52] tracking-[2px] uppercase"
                        style={mono}
                      >
                        {cap.category}
                      </span>
                    </div>
                    <h3
                      className="text-[14px] font-bold text-[#5a5e52] mb-2"
                      style={mono}
                    >
                      {cap.name}
                    </h3>
                    <p className="text-sm text-[#5a5e52] leading-6">
                      {cap.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          {/* CTA */}
          <FadeIn>
            <section className="mt-16 md:mt-24 mb-8">
              <h2
                className="text-lg md:text-xl text-[#1c1f17] mb-6"
                style={{ ...pixel }}
              >
                Get Started
              </h2>
              <div className="flex flex-wrap gap-4">
                <a
                  href="https://github.com/anycap-ai/anycap"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-8 py-3 text-[11px] font-bold tracking-[3px] uppercase text-[#f4f5f0] bg-[#6b7d3a] hover:bg-[#1c1f17] transition-colors"
                  style={mono}
                >
                  Request Early Access
                </a>
                <Link
                  href="/for/claude-code"
                  className="inline-block px-8 py-3 text-[11px] font-bold tracking-[3px] uppercase text-[#1c1f17] border border-[#1c1f17] hover:bg-[#1c1f17] hover:text-[#f4f5f0] transition-colors"
                  style={mono}
                >
                  For Claude Code
                </Link>
                <Link
                  href="/cli"
                  className="inline-block px-8 py-3 text-[11px] font-bold tracking-[3px] uppercase text-[#1c1f17] border border-[#1c1f17] hover:bg-[#1c1f17] hover:text-[#f4f5f0] transition-colors"
                  style={mono}
                >
                  CLI Overview
                </Link>
              </div>
            </section>
          </FadeIn>
        </div>
      </article>
    </>
  );
}
