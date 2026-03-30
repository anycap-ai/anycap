import type { Metadata } from "next";
import { LocalizedLink as Link } from "@/components/LocalizedLink";
import { siteConfig } from "@/lib/site";
import { EarlyAccessBanner } from "@/components/EarlyAccessBanner";
import { FadeIn } from "@/components/FadeIn";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

export const metadata: Metadata = {
  title: "AnyCap for Codex — Add multimodal capabilities to Codex agents",
  description:
    "Give Codex agents image generation, video generation, image read, and video analysis through AnyCap. Install one skill, use one CLI, and route every capability through a consistent agent-native interface.",
  alternates: { canonical: "/for/codex" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/for/codex",
    siteName: siteConfig.siteName,
    title: "AnyCap for Codex — Add multimodal capabilities to Codex agents",
    description:
      "Give Codex agents image generation, video generation, image read, and video analysis through AnyCap.",
  },
};

const capabilities = [
  {
    name: "Image Generation",
    command: "anycap image generate",
    description: "Create and edit images with Seedream 5 and Nano Banana Pro.",
    href: "/capabilities/image-generation",
  },
  {
    name: "Video Generation",
    command: "anycap video generate",
    description: "Generate videos through Veo 3.1 from inside Codex workflows.",
    href: "/capabilities/video-generation",
  },
  {
    name: "Image Read",
    command: "anycap image read",
    description: "Analyze screenshots, product mockups, and design references.",
    href: "/capabilities/image-read",
  },
  {
    name: "Video Analysis",
    command: "anycap video read",
    description: "Inspect recordings and extract structured detail from videos.",
    href: "/capabilities/video-analysis",
  },
];

export default function ForCodexPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "AnyCap for Codex" },
        ]}
      />
      <article className="px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[1280px] py-12 md:py-20 lg:py-24">
          <FadeIn>
            <p className="text-[11px] text-[#6b7d3a] tracking-[0.8px] mb-4" style={mono}>
              For Codex
            </p>
            <h1
              className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(32px, 6vw, 72px)" }}
            >
              Give Codex agents
              <br />
              real-world capabilities.
            </h1>
            <p className="mt-6 max-w-[720px] text-base leading-7 text-[#4d5145] md:text-lg">
              AnyCap gives Codex one install path and one CLI for multimodal capabilities.
              Instead of wiring separate provider SDKs for image generation, video generation,
              image read, and video analysis, teams can let Codex call one consistent
              capability runtime built for agent workflows.
            </p>
          </FadeIn>

          <FadeIn className="mt-8">
            <EarlyAccessBanner />
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="text-lg md:text-xl text-[#1c1f17] mb-8" style={{ ...pixel }}>
                Install on Codex
              </h2>
              <div className="space-y-6 max-w-[800px]">
                <div className="border-l-[3px] border-[#6b7d3a] pl-6">
                  <p className="text-[11px] text-[#6b7d3a] tracking-[0.5px] mb-2" style={mono}>
                    Step 1 — Install the skill
                  </p>
                  <div className="bg-[#1c1f17] px-5 py-4">
                    <p className="text-[13px] text-[#d4e0a4]" style={mono}>
                      npx -y skills add anycap-ai/anycap -a codex -y
                    </p>
                  </div>
                </div>
                <div className="border-l-[3px] border-[#6b7d3a] pl-6">
                  <p className="text-[11px] text-[#6b7d3a] tracking-[0.5px] mb-2" style={mono}>
                    Step 2 — Install the CLI
                  </p>
                  <div className="bg-[#1c1f17] px-5 py-4">
                    <p className="text-[13px] text-[#d4e0a4]" style={mono}>
                      curl -fsSL https://anycap.ai/install.sh | sh
                    </p>
                  </div>
                </div>
                <div className="border-l-[3px] border-[#6b7d3a] pl-6">
                  <p className="text-[11px] text-[#6b7d3a] tracking-[0.5px] mb-2" style={mono}>
                    Step 3 — Log in and verify
                  </p>
                  <div className="bg-[#1c1f17] px-5 py-4">
                    <p className="text-[13px] text-[#d4e0a4] mb-2" style={mono}>
                      anycap login
                    </p>
                    <p className="text-[13px] text-[#d4e0a4]" style={mono}>
                      anycap status
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="text-lg md:text-xl text-[#1c1f17] mb-8" style={{ ...pixel }}>
                Available Capabilities
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {capabilities.map((cap) => (
                  <Link
                    key={cap.name}
                    href={cap.href}
                    className="border border-[#d4dbb8] p-5 hover:border-[#6b7d3a] transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-2 h-2 rounded-full bg-[#6b7d3a]" />
                      <h3 className="text-[13px] font-bold text-[#1c1f17] tracking-[1px]" style={mono}>
                        {cap.name}
                      </h3>
                    </div>
                    <p className="text-sm text-[#4d5145] leading-6 mb-3">{cap.description}</p>
                    <code className="text-[12px] text-[#6b7d3a]" style={mono}>
                      {cap.command}
                    </code>
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
              <h2 className="text-lg md:text-xl text-[#1c1f17] mb-6" style={{ ...pixel }}>
                Why AnyCap fits Codex
              </h2>
              <div className="grid gap-6 sm:grid-cols-2 max-w-[960px]">
                <div className="border-l-[3px] border-[#6b7d3a] pl-5">
                  <p className="text-sm font-medium text-[#1c1f17] mb-1">One runtime, multiple models</p>
                  <p className="text-sm text-[#4d5145] leading-6">
                    Codex can move from image generation to video analysis without swapping SDKs,
                    auth flows, or command formats.
                  </p>
                </div>
                <div className="border-l-[3px] border-[#6b7d3a] pl-5">
                  <p className="text-sm font-medium text-[#1c1f17] mb-1">Built for agent workflows</p>
                  <p className="text-sm text-[#4d5145] leading-6">
                    AnyCap is positioned as a capability runtime, not a generic dashboard, so it
                    fits the way coding agents actually work.
                  </p>
                </div>
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
                  href="/cli"
                  className="inline-block px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#f4f5f0] bg-[#6b7d3a] hover:bg-[#1c1f17] transition-colors rounded-lg"
                  style={mono}
                >
                  CLI Overview
                </Link>
                <Link
                  href="/guides/install-anycap"
                  className="inline-block px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] border border-[#1c1f17] hover:bg-[#1c1f17] hover:text-[#f4f5f0] transition-colors rounded-lg"
                  style={mono}
                >
                  Install Guide
                </Link>
                <Link
                  href="/guides/agent-skills-for-developer-tools"
                  className="inline-block px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] border border-[#1c1f17] hover:bg-[#1c1f17] hover:text-[#f4f5f0] transition-colors rounded-lg"
                  style={mono}
                >
                  Agent Skills Guide
                </Link>
              </div>
            </section>
          </FadeIn>
        </div>
      </article>
    </>
  );
}
