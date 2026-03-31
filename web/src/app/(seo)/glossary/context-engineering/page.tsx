import type { Metadata } from "next";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { siteConfig } from "@/lib/site";
import { EarlyAccessBanner } from "@/components/landing/EarlyAccessBanner";
import { FadeIn } from "@/components/ui/FadeIn";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

export const metadata: Metadata = {
  title: "What is context engineering?",
  description:
    "Context engineering is the practice of shaping what an AI agent sees, remembers, and can do during execution. Learn how it affects capability calls, workspace behavior, and multimodal workflows.",
  alternates: { canonical: "/glossary/context-engineering" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/glossary/context-engineering",
    siteName: siteConfig.siteName,
    title: "What is context engineering?",
    description:
      "Learn what context engineering means for AI agents and how it affects capability calls, workspace behavior, and multimodal workflows.",
  },
};

const definitionJsonLd = {
  "@context": "https://schema.org",
  "@type": "DefinedTerm",
  name: "Context Engineering",
  description:
    "The practice of shaping the information, tools, constraints, and runtime state an AI agent uses during execution so it can make better decisions.",
  url: `${siteConfig.url}/glossary/context-engineering`,
};

export default function ContextEngineeringGlossaryPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Home", href: "/" }, { name: "Context Engineering" }]} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(definitionJsonLd) }} />

      <article className="px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[1280px] py-12 md:py-20 lg:py-24">
          <FadeIn>
            <p className="text-[11px] text-[#6b7d3a] tracking-[0.8px] mb-4" style={mono}>Glossary</p>
            <h1
              className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(28px, 5vw, 60px)" }}
            >
              What is
              <br />
              context engineering?
            </h1>
          </FadeIn>

          <FadeIn>
            <div className="mt-8 border-l-[3px] border-[#6b7d3a] pl-6 max-w-[720px]">
              <p className="text-base leading-7 text-[#4d5145] md:text-lg">
                Context engineering is the practice of shaping the information and action space
                an AI agent uses during execution. It includes prompts, workspace files, tool
                definitions, runtime state, permissions, and prior steps. Good context
                engineering helps the agent decide when to keep reasoning in text and when to
                call a capability.
              </p>
            </div>
          </FadeIn>

          <FadeIn className="mt-8">
            <EarlyAccessBanner />
          </FadeIn>

          <div className="mt-16 md:mt-24"><hr className="border-t border-[#d4dbb8]" /></div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="text-lg md:text-xl text-[#1c1f17] mb-6" style={{ ...pixel }}>
                Why it matters
              </h2>
              <div className="space-y-6 max-w-[760px]">
                <p className="text-base leading-7 text-[#4d5145]">
                  A capable agent needs more than a strong model. It also needs the right
                  context to know what tools exist, what files matter, and what actions are
                  allowed. Without that, it may miss the right tool call or act at the wrong time.
                </p>
                <p className="text-base leading-7 text-[#4d5145]">
                  For AnyCap, context engineering matters because it determines when an agent
                  should invoke image generation, video generation, image read, or video
                  analysis through the capability runtime.
                </p>
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24"><hr className="border-t border-[#d4dbb8]" /></div>

          <FadeIn>
            <section className="mt-16 md:mt-24 mb-8">
              <div className="flex flex-wrap gap-4">
                <Link href="/guides/context-engineering-for-agents" className="inline-block px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#f4f5f0] bg-[#6b7d3a] hover:bg-[#1c1f17] transition-colors rounded-lg" style={mono}>Context Guide</Link>
                <Link href="/guides/workspace-context-engineering" className="inline-block px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] border border-[#1c1f17] hover:bg-[#1c1f17] hover:text-[#f4f5f0] transition-colors rounded-lg" style={mono}>Workspace Context</Link>
                <Link href="/glossary/agent-capability-runtime" className="inline-block px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] border border-[#1c1f17] hover:bg-[#1c1f17] hover:text-[#f4f5f0] transition-colors rounded-lg" style={mono}>Capability Runtime</Link>
              </div>
            </section>
          </FadeIn>
        </div>
      </article>
    </>
  );
}
