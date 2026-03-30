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
  title: "AnyCap for Cursor — Add capabilities to Cursor agents",
  description:
    "Give Cursor agents image generation, video generation, image read, and video analysis capabilities through AnyCap. Install once with a skill file and access every capability through one CLI.",
  alternates: { canonical: "/for/cursor" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/for/cursor",
    siteName: siteConfig.siteName,
    title: "AnyCap for Cursor — Add capabilities to Cursor agents",
    description:
      "Give Cursor agents image generation, video generation, image read, and video analysis capabilities through AnyCap. Install once with a skill file and access every capability through one CLI.",
  },
};

const capabilities = [
  { name: "Image Generation", models: "Seedream 5, Nano Banana Pro, and more", status: "Available" },
  { name: "Video Generation", models: "Veo 3.1", status: "Available" },
  { name: "Image Read", models: "Vision models", status: "Available" },
  { name: "Video Analysis", models: "Vision models", status: "Available" },
];

export default function ForCursorPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: "Home", href: "/" },
        { name: "AnyCap for Cursor" },
      ]} />
      <article className="px-6 md:px-12 lg:px-20">
      <div className="mx-auto max-w-[1280px] py-12 md:py-20 lg:py-24">
        <FadeIn>
          <p className="text-[11px] text-[#6b7d3a] tracking-[0.8px] mb-4" style={mono}>
            For Cursor
          </p>
          <h1
            className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
            style={{ ...pixel, fontSize: "clamp(32px, 6vw, 72px)" }}
          >
            Give Cursor agents
            <br />
            real-world capabilities.
          </h1>
          <p className="mt-6 max-w-[700px] text-base leading-7 text-[#4d5145] md:text-lg">
            AnyCap lets Cursor agents install and use capabilities such as image generation
            with Seedream 5 and Nano Banana Pro, video generation with Veo 3.1, image
            understanding, and video analysis through one skill file and one CLI. Cursor
            agents can access every capability through the same interface — no separate API
            keys, no custom integrations, no dashboard switching.
          </p>
        </FadeIn>

        <FadeIn className="mt-8">
          <EarlyAccessBanner />
        </FadeIn>

        <div className="mt-16 md:mt-24"><hr className="border-t border-[#d4dbb8]" /></div>

        <FadeIn>
          <section className="mt-16 md:mt-24">
            <h2 className="text-lg md:text-xl text-[#1c1f17] mb-8" style={{ ...pixel }}>
              Install on Cursor
            </h2>
            <div className="space-y-6 max-w-[800px]">
              <div className="border-l-[3px] border-[#6b7d3a] pl-6">
                <p className="text-[11px] text-[#6b7d3a] tracking-[0.5px] mb-2" style={mono}>Step 1 — Install the skill</p>
                <div className="bg-[#1c1f17] px-5 py-4">
                  <p className="text-[13px] text-[#d4e0a4]" style={mono}>npx -y skills add anycap-ai/anycap -a cursor -y</p>
                </div>
              </div>
              <div className="border-l-[3px] border-[#6b7d3a] pl-6">
                <p className="text-[11px] text-[#6b7d3a] tracking-[0.5px] mb-2" style={mono}>Step 2 — Install the CLI</p>
                <div className="bg-[#1c1f17] px-5 py-4">
                  <p className="text-[13px] text-[#d4e0a4]" style={mono}>curl -fsSL https://anycap.ai/install.sh | sh</p>
                </div>
              </div>
              <div className="border-l-[3px] border-[#6b7d3a] pl-6">
                <p className="text-[11px] text-[#6b7d3a] tracking-[0.5px] mb-2" style={mono}>Step 3 — Log in and verify</p>
                <div className="bg-[#1c1f17] px-5 py-4">
                  <p className="text-[13px] text-[#d4e0a4] mb-2" style={mono}>anycap login</p>
                  <p className="text-[13px] text-[#d4e0a4]" style={mono}>anycap status</p>
                </div>
              </div>
            </div>
          </section>
        </FadeIn>

        <div className="mt-16 md:mt-24"><hr className="border-t border-[#d4dbb8]" /></div>

        <FadeIn>
          <section className="mt-16 md:mt-24">
            <h2 className="text-lg md:text-xl text-[#1c1f17] mb-8" style={{ ...pixel }}>
              Available Capabilities
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {capabilities.map((cap) => (
                <div key={cap.name} className="border border-[#d4dbb8] p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-[#6b7d3a]" />
                    <h3 className="text-[13px] font-bold text-[#1c1f17] tracking-[1px]" style={mono}>{cap.name}</h3>
                  </div>
                  <p className="text-sm text-[#4d5145] leading-6">{cap.models}</p>
                </div>
              ))}
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
              <Link href="/for/claude-code" className="inline-block px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] border border-[#1c1f17] hover:bg-[#1c1f17] hover:text-[#f4f5f0] transition-colors rounded-lg" style={mono}>For Claude Code</Link>
              <Link href="/for/codex" className="inline-block px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] border border-[#1c1f17] hover:bg-[#1c1f17] hover:text-[#f4f5f0] transition-colors rounded-lg" style={mono}>For Codex</Link>
            </div>
          </section>
        </FadeIn>
      </div>
    </article>
    </>
  );
}
