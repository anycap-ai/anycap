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
  title: "What is an agent harness? The execution layer around AI agents",
  description:
    "An agent harness is the execution layer around an AI agent that provides tools, files, permissions, and runtime controls. Learn how it relates to the model and where AnyCap fits as a capability runtime.",
  alternates: { canonical: "/glossary/agent-harness" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/glossary/agent-harness",
    siteName: siteConfig.siteName,
    title: "What is an agent harness? The execution layer around AI agents",
    description:
      "Learn what an agent harness is and where AnyCap fits as a capability runtime inside the agent stack.",
  },
};

const definitionJsonLd = {
  "@context": "https://schema.org",
  "@type": "DefinedTerm",
  name: "Agent Harness",
  description:
    "The execution environment around an AI agent that provides tools, files, permissions, runtime state, and policy controls.",
  url: `${siteConfig.url}/glossary/agent-harness`,
};

export default function AgentHarnessGlossaryPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Home", href: "/" }, { name: "Glossary", href: "/glossary", unlinkable: true }, { name: "Agent Harness" }]} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(definitionJsonLd) }} />

      <article className="px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[1280px] py-12 md:py-20 lg:py-24">
          <FadeIn>
            <p className="text-[11px] text-[#6b7d3a] tracking-[0.8px] mb-4" style={mono}>Glossary</p>
            <h1
              className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(28px, 5vw, 60px)" }}
            >
              What is an
              <br />
              agent harness?
            </h1>
          </FadeIn>

          <FadeIn>
            <div className="mt-8 border-l-[3px] border-[#6b7d3a] pl-6 max-w-[720px]">
              <p className="text-base leading-7 text-[#4d5145] md:text-lg">
                An agent harness is the execution layer around the model. It provides the files,
                terminals, browser, tools, permissions, and runtime rules that turn a reasoning
                model into a working agent system.
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
                  The model decides what to do. The harness determines what it can actually do.
                  That includes which tools exist, which files are visible, what permissions are
                  granted, and which actions are allowed in the environment.
                </p>
                <p className="text-base leading-7 text-[#4d5145]">
                  AnyCap fits inside that harness as a capability runtime. It gives the harness a
                  clean way to expose multimodal actions to the agent through one interface.
                </p>
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24"><hr className="border-t border-[#d4dbb8]" /></div>

          <FadeIn>
            <section className="mt-16 md:mt-24 mb-8">
              <div className="flex flex-wrap gap-4">
                <Link href="/guides/what-is-agent-harness" className="inline-block px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#f4f5f0] bg-[#6b7d3a] hover:bg-[#1c1f17] transition-colors rounded-lg" style={mono}>Harness Guide</Link>
                <Link href="/glossary/agent-capability-runtime" className="inline-block px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] border border-[#1c1f17] hover:bg-[#1c1f17] hover:text-[#f4f5f0] transition-colors rounded-lg" style={mono}>Capability Runtime</Link>
                <Link href="/compare/anycap-vs-openai-agent-builder" className="inline-block px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] border border-[#1c1f17] hover:bg-[#1c1f17] hover:text-[#f4f5f0] transition-colors rounded-lg" style={mono}>Agent Builder Compare</Link>
              </div>
            </section>
          </FadeIn>
        </div>
      </article>
    </>
  );
}
