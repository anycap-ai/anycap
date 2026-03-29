import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/site";
import { FadeIn } from "@/components/FadeIn";
import { EarlyAccessBanner } from "@/components/EarlyAccessBanner";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace" } as const;

export const metadata: Metadata = {
  title: "Image Understanding — Analyze images through AI agents",
  description:
    "Give AI agents the ability to analyze and describe images using AnyCap. Extract visual information, identify objects, read text, and understand context from any image through one CLI command.",
  alternates: { canonical: "/capabilities/image-understanding" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/capabilities/image-understanding",
    siteName: siteConfig.siteName,
    title: "Image Understanding — Analyze images through AI agents",
    description:
      "Give AI agents the ability to analyze and describe images using AnyCap. Extract visual information, identify objects, read text, and understand context from any image through one CLI command.",
  },
};

export default function ImageUnderstandingPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: "Home", href: "/" },
        { name: "Capabilities", href: "/capabilities" },
        { name: "Image Understanding" },
      ]} />
      <article className="px-6 md:px-12 lg:px-20">
      <div className="mx-auto max-w-[1280px] py-12 md:py-20 lg:py-24">
        <FadeIn>
          <p className="text-[11px] text-[#6b7d3a] tracking-[0.8px] mb-4" style={mono}>
            Capability
          </p>
          <h1
            className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
            style={{ ...pixel, fontSize: "clamp(32px, 6vw, 72px)" }}
          >
            Image Understanding
          </h1>
          <p className="mt-6 max-w-[700px] text-base leading-7 text-[#4d5145] md:text-lg">
            AnyCap image understanding lets AI agents analyze images using vision models through
            one CLI command. Agents can describe image contents, identify objects, read embedded
            text, assess visual layouts, and extract structured information from screenshots,
            photos, diagrams, or any other image. The capability works across Claude Code, Cursor,
            Codex, and other agent products without requiring separate vision API integrations.
          </p>
        </FadeIn>
        <FadeIn className="mt-8">
          <EarlyAccessBanner />
        </FadeIn>

        <div className="mt-16 md:mt-24"><hr className="border-t border-[#d4dbb8]" /></div>

        <FadeIn>
          <section className="mt-16 md:mt-24">
            <h2 className="text-lg md:text-xl text-[#1c1f17] mb-6" style={{ ...pixel }}>
              CLI Usage
            </h2>
            <div className="space-y-6 max-w-[800px]">
              <div>
                <p className="text-[11px] text-[#5a5e52] tracking-[0.5px] mb-3" style={mono}>Analyze a remote image</p>
                <div className="bg-[#1c1f17] px-5 py-4">
                  <p className="text-[13px] text-[#d4e0a4]" style={mono}>
                    anycap image understand --url https://example.com/screenshot.png
                  </p>
                </div>
              </div>
              <div>
                <p className="text-[11px] text-[#5a5e52] tracking-[0.5px] mb-3" style={mono}>Analyze a local image</p>
                <div className="bg-[#1c1f17] px-5 py-4">
                  <p className="text-[13px] text-[#d4e0a4]" style={mono}>
                    anycap image understand --file ./diagram.png
                  </p>
                </div>
              </div>
              <div>
                <p className="text-[11px] text-[#5a5e52] tracking-[0.5px] mb-3" style={mono}>With a specific question</p>
                <div className="bg-[#1c1f17] px-5 py-4">
                  <p className="text-[13px] text-[#d4e0a4]" style={mono}>
                    anycap image understand --url https://example.com/chart.png --prompt &quot;What are the key trends shown?&quot;
                  </p>
                </div>
              </div>
            </div>
          </section>
        </FadeIn>

        <div className="mt-16 md:mt-24"><hr className="border-t border-[#d4dbb8]" /></div>

        <FadeIn>
          <section className="mt-16 md:mt-24">
            <h2 className="text-lg md:text-xl text-[#1c1f17] mb-6" style={{ ...pixel }}>
              When Agents Need Image Understanding
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 max-w-[900px]">
              <div className="border-l-[3px] border-[#6b7d3a] pl-5">
                <p className="text-sm font-medium text-[#1c1f17] mb-1">Screenshot analysis</p>
                <p className="text-sm text-[#4d5145] leading-6">Understand UI layouts, identify bugs, or extract text from application screenshots.</p>
              </div>
              <div className="border-l-[3px] border-[#6b7d3a] pl-5">
                <p className="text-sm font-medium text-[#1c1f17] mb-1">Diagram parsing</p>
                <p className="text-sm text-[#4d5145] leading-6">Read architecture diagrams, flowcharts, and technical drawings to inform code decisions.</p>
              </div>
              <div className="border-l-[3px] border-[#6b7d3a] pl-5">
                <p className="text-sm font-medium text-[#1c1f17] mb-1">Content moderation</p>
                <p className="text-sm text-[#4d5145] leading-6">Assess image content as part of automated review workflows.</p>
              </div>
              <div className="border-l-[3px] border-[#6b7d3a] pl-5">
                <p className="text-sm font-medium text-[#1c1f17] mb-1">Data extraction</p>
                <p className="text-sm text-[#4d5145] leading-6">Extract structured data from charts, tables, and infographics embedded in images.</p>
              </div>
            </div>
          </section>
        </FadeIn>

        <div className="mt-16 md:mt-24"><hr className="border-t border-[#d4dbb8]" /></div>

        <FadeIn>
          <section className="mt-16 md:mt-24 mb-8">
            <div className="flex flex-wrap gap-4">
              <a
                href="https://github.com/anycap-ai/anycap"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#f4f5f0] bg-[#6b7d3a] hover:bg-[#1c1f17] transition-colors rounded-lg"
                style={mono}
              >
                Request Early Access
              </a>
              <Link href="/capabilities" className="inline-block px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] border border-[#1c1f17] hover:bg-[#1c1f17] hover:text-[#f4f5f0] transition-colors rounded-lg" style={mono}>All Capabilities</Link>
            </div>
          </section>
        </FadeIn>
      </div>
    </article>
    </>
  );
}
