import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { EarlyAccessBanner } from "@/components/landing/EarlyAccessBanner";
import { FadeIn } from "@/components/ui/FadeIn";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { createFaqPageJsonLd, createTechArticleJsonLd } from "@/lib/schema";
import { siteConfig } from "@/lib/site";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;
const lastUpdatedLabel = "April 10, 2026";
const lastUpdatedIso = "2026-04-10";

export const metadata: Metadata = {
  title: "Top fal.ai Alternatives for AI Agents (2026) — Image, Video, and Vision",
  description:
    "Compare the best fal.ai alternatives for AI agent workflows. See how AnyCap, Replicate, Hugging Face, and others handle image generation, video generation, and vision for Claude Code, Cursor, and Codex.",
  alternates: { canonical: "/compare/fal-ai-alternatives-for-agents" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/compare/fal-ai-alternatives-for-agents",
    siteName: siteConfig.siteName,
    title: "Top fal.ai Alternatives for AI Agents (2026)",
    description:
      "Compare fal.ai alternatives for agent-native image, video, and vision workflows. Evaluate install experience, auth model, and agent compatibility.",
  },
};

const articleJsonLd = createTechArticleJsonLd({
  headline: "Top fal.ai Alternatives for AI Agents (2026) — Image, Video, and Vision",
  description:
    "A comparison of fal.ai alternatives for teams building AI agent workflows that need image generation, video generation, and vision capabilities.",
  path: "/compare/fal-ai-alternatives-for-agents",
  about: ["fal.ai", "AnyCap", "AI agents", "Image generation API", "Serverless inference"],
  keywords: [
    "fal ai alternative",
    "fal.ai alternative",
    "fal ai alternative for agents",
    "best fal ai alternative 2026",
  ],
  datePublished: lastUpdatedIso,
  dateModified: lastUpdatedIso,
});

const alternatives = [
  {
    name: "AnyCap",
    category: "Agent capability runtime",
    focus: "Built for AI agents. One CLI, one auth, every capability.",
    strengths: [
      "Single install path for image, video, vision, search, storage, and publishing",
      "Works across Claude Code, Cursor, Codex via skill files",
      "One login covers the full capability stack",
      "CLI-first interface designed for terminal-native agent workflows",
    ],
    considerations: [
      "Curated model selection rather than open model library",
      "Agent-native design — not built for custom backend inference pipelines",
    ],
    bestFor: "Teams using coding agents that need multimodal capabilities without per-provider integration",
    href: "/start",
    cta: "Get started with AnyCap",
  },
  {
    name: "Replicate",
    category: "Model API and deployment platform",
    focus: "Run community and official models through predictions and webhooks.",
    strengths: [
      "Thousands of community and official models",
      "Dedicated deployments for production workloads",
      "Strong model discovery and community ecosystem",
    ],
    considerations: [
      "Each model has its own versioning and input schema",
      "No agent-native interface or skill-based install",
      "Cold starts on community models can be slow",
    ],
    bestFor: "Developers building custom backends that need access to a broad model library",
    href: "/compare/anycap-vs-replicate",
    cta: "See AnyCap vs Replicate",
  },
  {
    name: "Hugging Face Inference API",
    category: "Model hub + inference endpoints",
    focus: "Access to the largest open-model ecosystem with managed inference.",
    strengths: [
      "Largest open-model library available",
      "Free tier for experimentation",
      "Dedicated inference endpoints for production",
    ],
    considerations: [
      "Cold starts on free tier can be significant",
      "Quality varies across community models",
      "Requires per-model integration work",
    ],
    bestFor: "Researchers and teams that want the broadest possible model selection",
  },
  {
    name: "WaveSpeed AI",
    category: "Fast inference API",
    focus: "Optimized inference speeds with exclusive model access.",
    strengths: [
      "Claims fastest inference times in certain benchmarks",
      "Exclusive access to some optimized model variants",
      "Simple REST API",
    ],
    considerations: [
      "Narrower model selection than Replicate or Hugging Face",
      "No agent-native integration path",
      "Newer platform with less community validation",
    ],
    bestFor: "Teams that prioritize inference speed above all other factors",
  },
  {
    name: "Leonardo.Ai API",
    category: "Visual-first media generation API",
    focus: "Image and video generation API with creative tooling focus.",
    strengths: [
      "Strong creative and design-oriented models",
      "Both image and video generation through one API",
      "Good documentation for developers",
    ],
    considerations: [
      "Focused on visual media — no vision, search, or storage capabilities",
      "Requires API key management and custom integration",
      "No agent-native interface",
    ],
    bestFor: "Creative teams and products that need high-quality visual media generation APIs",
  },
] as const;

const comparisonDimensions = [
  {
    dimension: "Agent compatibility",
    falai: "Python SDK and REST API; requires custom integration per agent",
    anycap: "Works across Claude Code, Cursor, Codex via skill files and one CLI",
  },
  {
    dimension: "Install experience",
    falai: "pip install fal-client + API key setup",
    anycap: "One skill file + one CLI binary + one login",
  },
  {
    dimension: "Primary strength",
    falai: "Very fast cold starts and serverless GPU inference",
    anycap: "Agent-native interface with one auth across all capabilities",
  },
  {
    dimension: "Capability scope",
    falai: "Image generation, video generation, audio (model-dependent)",
    anycap: "Image, video, music, vision, search, crawl, storage, page publishing",
  },
  {
    dimension: "Pricing model",
    falai: "Per-second GPU billing, varies by model and hardware",
    anycap: "Pay-as-you-go with $5 free credit, no monthly fee",
  },
] as const;

const faqItems = [
  {
    question: "Is AnyCap a direct replacement for fal.ai?",
    answer:
      "They serve different use cases. fal.ai is a serverless inference platform for developers calling model APIs from custom code. AnyCap is a capability runtime for AI agents. If you need fast GPU inference for custom pipelines, fal.ai is strong. If you need agents like Claude Code or Cursor to generate images and videos through one interface, AnyCap is the better fit.",
  },
  {
    question: "Which is faster for image generation?",
    answer:
      "fal.ai is specifically optimized for inference speed and claims very fast cold-start times. AnyCap optimizes for the agent workflow experience — install once, auth once, use any capability. For agent-native workflows, the total time from zero to first image includes setup, not just inference.",
  },
  {
    question: "Can I switch from fal.ai to AnyCap without changing my agent?",
    answer:
      "Yes. AnyCap installs as a skill file and CLI binary that works alongside your existing agent. You do not need to modify the agent itself — just install the skill and CLI, authenticate, and the agent can invoke capabilities through the new interface.",
  },
] as const;

const faqJsonLd = createFaqPageJsonLd(faqItems);

export default function FalAiAlternativesPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: "Home", href: "/" },
        { name: "Compare", href: "/compare", unlinkable: true },
        { name: "fal.ai Alternatives for Agents" },
      ]} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <article className="px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[1280px] py-12 md:py-20 lg:py-24">
          <FadeIn>
            <p className="text-[11px] text-[#6b7d3a] tracking-[0.8px] mb-4" style={mono}>Compare</p>
            <p className="mb-3 text-[11px] tracking-[0.5px] text-[#5a5e52]" style={mono}>
              Last updated {lastUpdatedLabel}
            </p>
            <h1
              className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17] max-w-[960px]"
              style={{ ...pixel, fontSize: "clamp(28px, 5vw, 60px)" }}
            >
              Top fal.ai alternatives
              <br />
              for AI agent workflows
            </h1>
            <p className="mt-6 max-w-[700px] text-base leading-7 text-[#4d5145] md:text-lg">
              fal.ai is a fast serverless inference platform for generative media models. But
              if your workflow runs inside an AI agent like Claude Code, Cursor, or Codex,
              you may need a different kind of tool — one that installs into the agent,
              authenticates once, and provides capabilities through the same interface the
              agent already uses.
            </p>
          </FadeIn>

          <FadeIn className="mt-8">
            <EarlyAccessBanner />
          </FadeIn>

          <div className="mt-16 md:mt-24"><hr className="border-t border-[#d4dbb8]" /></div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="text-lg md:text-xl text-[#1c1f17] mb-4" style={pixel}>
                fal.ai vs AnyCap at a glance
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[#d4dbb8]">
                      <th className="pb-3 pr-6 text-[11px] text-[#5a5e52] tracking-[0.5px] w-[180px]" style={mono}>Dimension</th>
                      <th className="pb-3 pr-6 text-[11px] text-[#5a5e52] tracking-[0.5px]" style={mono}>fal.ai</th>
                      <th className="pb-3 text-[11px] text-[#6b7d3a] tracking-[0.5px]" style={mono}>AnyCap</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonDimensions.map((row) => (
                      <tr key={row.dimension} className="border-b border-[#d4dbb8]/50">
                        <td className="py-4 pr-6 text-sm font-medium text-[#1c1f17] align-top">{row.dimension}</td>
                        <td className="py-4 pr-6 text-sm text-[#4d5145] leading-6 align-top">{row.falai}</td>
                        <td className="py-4 text-sm text-[#4d5145] leading-6 align-top">{row.anycap}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24"><hr className="border-t border-[#d4dbb8]" /></div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="text-lg md:text-xl text-[#1c1f17] mb-8" style={pixel}>
                Alternatives compared
              </h2>
              <div className="space-y-6">
                {alternatives.map((alt) => (
                  <div
                    key={alt.name}
                    className={`rounded-xl border p-6 ${alt.name === "AnyCap" ? "border-[#6b7d3a] bg-[#f7f8ef]/80" : "border-[#d4dbb8] bg-[#fffffc]/70"}`}
                  >
                    <h3
                      className={`text-[18px] font-bold ${alt.name === "AnyCap" ? "text-[#6b7d3a]" : "text-[#1c1f17]"}`}
                      style={mono}
                    >
                      {alt.name}
                    </h3>
                    <p className="text-[11px] text-[#5a5e52] tracking-[0.5px] mt-1" style={mono}>{alt.category}</p>
                    <p className="mt-3 text-sm leading-6 text-[#4d5145]">{alt.focus}</p>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-[11px] text-[#6b7d3a] tracking-[0.5px] mb-2" style={mono}>Strengths</p>
                        <ul className="space-y-2">
                          {alt.strengths.map((s) => (
                            <li key={s} className="flex items-start gap-2 text-sm text-[#4d5145] leading-6">
                              <span className="mt-[8px] h-1.5 w-1.5 rounded-full bg-[#6b7d3a] shrink-0" />
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-[11px] text-[#5a5e52] tracking-[0.5px] mb-2" style={mono}>Considerations</p>
                        <ul className="space-y-2">
                          {alt.considerations.map((c) => (
                            <li key={c} className="flex items-start gap-2 text-sm text-[#4d5145] leading-6">
                              <span className="mt-[8px] h-1.5 w-1.5 rounded-full bg-[#d4dbb8] shrink-0" />
                              {c}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <p className="mt-4 text-sm leading-6 text-[#5a5e52]">
                      <span style={mono} className="text-[11px] text-[#5a5e52] tracking-[0.5px]">Best for: </span>
                      {alt.bestFor}
                    </p>
                    {"href" in alt && (
                      <div className="mt-4">
                        <Link href={alt.href} className="inline-block rounded-lg border border-[#d4dbb8] px-5 py-2 text-[12px] text-[#1c1f17] transition-colors hover:border-[#6b7d3a] hover:text-[#6b7d3a]" style={mono}>
                          {alt.cta}
                        </Link>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24"><hr className="border-t border-[#d4dbb8]" /></div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="text-lg md:text-xl text-[#1c1f17] mb-8" style={pixel}>FAQ</h2>
              <div className="max-w-[860px] space-y-4">
                {faqItems.map((item) => (
                  <div key={item.question} className="rounded-xl border border-[#d4dbb8] bg-[#fffffc]/70 p-5">
                    <h3 className="mb-2 text-[14px] font-bold text-[#1c1f17]" style={mono}>{item.question}</h3>
                    <p className="text-sm leading-6 text-[#4d5145]">{item.answer}</p>
                  </div>
                ))}
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24"><hr className="border-t border-[#d4dbb8]" /></div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="text-lg md:text-xl text-[#1c1f17] mb-8" style={pixel}>Related comparisons</h2>
              <div className="grid gap-4 sm:grid-cols-2 max-w-[960px]">
                <Link href="/compare/anycap-vs-fal-ai" className="border border-[#d4dbb8] p-5 hover:border-[#6b7d3a] transition-colors rounded-xl">
                  <p className="text-[11px] text-[#6b7d3a] tracking-[0.5px] mb-2" style={mono}>Compare</p>
                  <h3 className="text-[15px] font-bold text-[#1c1f17] mb-2" style={mono}>AnyCap vs fal.ai</h3>
                  <p className="text-sm text-[#4d5145] leading-6">Deep 1:1 comparison of AnyCap and fal.ai.</p>
                </Link>
                <Link href="/compare/anycap-vs-replicate" className="border border-[#d4dbb8] p-5 hover:border-[#6b7d3a] transition-colors rounded-xl">
                  <p className="text-[11px] text-[#6b7d3a] tracking-[0.5px] mb-2" style={mono}>Compare</p>
                  <h3 className="text-[15px] font-bold text-[#1c1f17] mb-2" style={mono}>AnyCap vs Replicate</h3>
                  <p className="text-sm text-[#4d5145] leading-6">Compare an agent capability runtime with a model API platform.</p>
                </Link>
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24"><hr className="border-t border-[#d4dbb8]" /></div>

          <FadeIn>
            <section className="mt-16 md:mt-24 mb-8">
              <div className="flex flex-wrap gap-4">
                <Link href="/start" className="inline-block px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#f4f5f0] bg-[#6b7d3a] hover:bg-[#1c1f17] transition-colors rounded-lg" style={mono}>Get Started</Link>
                <Link href="/capabilities" className="inline-block px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] border border-[#1c1f17] hover:bg-[#1c1f17] hover:text-[#f4f5f0] transition-colors rounded-lg" style={mono}>See Capabilities</Link>
              </div>
            </section>
          </FadeIn>
        </div>
      </article>
    </>
  );
}
