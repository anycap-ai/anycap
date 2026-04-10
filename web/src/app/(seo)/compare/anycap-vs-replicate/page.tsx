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
const lastUpdatedLabel = "April 8, 2026";
const lastUpdatedIso = "2026-04-08";

export const metadata: Metadata = {
  title: "AnyCap vs Replicate — agent capability runtime vs model API platform",
  description:
    "Compare AnyCap and Replicate. Replicate is a model inference and deployment platform built around predictions, webhooks, and app backends. AnyCap is a cross-agent capability runtime for Codex, Cursor, Claude Code, and similar agent workflows.",
  alternates: { canonical: "/compare/anycap-vs-replicate" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/compare/anycap-vs-replicate",
    siteName: siteConfig.siteName,
    title: "AnyCap vs Replicate — agent capability runtime vs model API platform",
    description:
      "See when Replicate is the right model API layer and when AnyCap is the cleaner capability layer around existing agents.",
  },
};

const comparisons = [
  {
    dimension: "Primary job",
    anycap:
      "Agent-native capability runtime that existing agents call during execution.",
    replicate:
      "Model API and deployment platform for running community models, official models, and dedicated deployments through predictions.",
  },
  {
    dimension: "Integration target",
    anycap:
      "Claude Code, Cursor, Codex, OpenClaw, Manus, and similar agent shells that need one shared capability layer.",
    replicate:
      "Your own backend, product workflow, or script that directly calls an inference API and manages the request lifecycle itself.",
  },
  {
    dimension: "Execution model",
    anycap:
      "One CLI, one auth flow, and one command surface across image, video, music, understanding, search, storage, and publishing.",
    replicate:
      "Predictions API with sync and async modes, status polling, prediction IDs, and webhook-driven completion for longer jobs.",
  },
  {
    dimension: "Model surface",
    anycap:
      "Curated capability layer that keeps the agent interface consistent across supported capabilities.",
    replicate:
      "Broad inference platform where teams choose specific models, versions, or private deployments and wire those APIs into their own stack.",
  },
  {
    dimension: "Artifact handling",
    anycap:
      "Drive and Page keep outputs shareable from the same product surface, so generation can flow into storage and publishing without another service.",
    replicate:
      "Prediction objects and web URLs are available, but durable asset storage, sharing, and publishing are decisions your product stack still owns.",
  },
  {
    dimension: "Best fit",
    anycap:
      "Best when the agent shell is already chosen and the missing layer is capability access plus delivery workflows.",
    replicate:
      "Best when the team is building a custom application backend around model inference, deployments, and webhook orchestration.",
  },
] as const;

const useCases = [
  {
    eyebrow: "Choose AnyCap if",
    title: "The agent is already chosen and needs more capability.",
    body:
      "You want Codex, Cursor, Claude Code, or another agent to gain image, video, search, storage, and publishing through one shared runtime instead of one new provider integration per task.",
  },
  {
    eyebrow: "Choose Replicate if",
    title: "Your backend needs direct model API control.",
    body:
      "Replicate is the stronger fit when your team wants to own the prediction lifecycle directly, choose exact models or deployments, and wire inference into your own app or service backend.",
  },
  {
    eyebrow: "Choose AnyCap if",
    title: "Artifact delivery matters as much as inference.",
    body:
      "AnyCap is stronger when the workflow includes generation plus file sharing, static publishing, or a handoff into another agent task, not just one inference call.",
  },
  {
    eyebrow: "Choose Replicate if",
    title: "Your application logic already handles jobs and webhooks.",
    body:
      "Replicate is a natural fit when your stack already has queues, storage, and product-specific orchestration and you mainly need model execution endpoints.",
  },
] as const;

const anycapStrengths = [
  "One auth flow and one CLI can travel across several agent products instead of binding the team to one application backend.",
  "The runtime covers more than media generation: it also includes media understanding, grounded web retrieval, Drive storage, and static page publishing.",
  "This makes AnyCap better when the real gap is end-to-end agent execution, not just picking an inference endpoint.",
] as const;

const replicateStrengths = [
  "Replicate's docs explicitly support both synchronous and asynchronous prediction flows, which is useful when the product team needs request-level control.",
  "The public docs distinguish community models, official models, and dedicated deployments, which is a strong fit for teams building product infrastructure around model choice.",
  "Webhook support makes Replicate a clean backend building block for applications that already have their own job system and asset pipeline.",
] as const;

const faqItems = [
  {
    question: "Is Replicate a direct replacement for AnyCap?",
    answer:
      "No. Replicate is a model API platform. AnyCap is a capability runtime for existing agents. Teams compare them when they are deciding whether the missing layer is app-level inference infrastructure or agent-level capability access.",
  },
  {
    question: "What is the biggest workflow difference between AnyCap and Replicate?",
    answer:
      "Replicate expects your application or script to own the prediction lifecycle. AnyCap expects the agent workflow to stay in one CLI-first runtime that already includes capability access plus artifact delivery paths.",
  },
  {
    question: "Does Replicate support async jobs and webhooks?",
    answer:
      "Yes. Replicate's public docs describe synchronous and asynchronous prediction modes, prediction IDs, and webhook notifications for completed outputs. That is one of its clearest strengths as a backend inference layer.",
  },
  {
    question: "When is AnyCap the cleaner choice?",
    answer:
      "When the team already has agents in Codex, Cursor, Claude Code, or similar environments and wants those agents to gain a broader capability surface quickly without building a separate inference and artifact pipeline.",
  },
  {
    question: "What is the simplest rule of thumb?",
    answer:
      "If your product backend needs model APIs, choose Replicate. If your agents need a shared runtime so they can actually finish multimodal work, choose AnyCap.",
  },
] as const;

const sourceLinks = [
  {
    label: "Replicate create a prediction",
    href: "https://replicate.com/docs/topics/predictions/create-a-prediction",
    note: "Prediction endpoints, sync vs async modes, prediction IDs, and web URLs.",
  },
  {
    label: "Replicate receive webhooks",
    href: "https://replicate.com/docs/topics/webhooks/receive-webhook/",
    note: "Webhook behavior for completed predictions and output events.",
  },
  {
    label: "Replicate custom deployments",
    href: "https://replicate.com/docs/guides/deploy-a-custom-model",
    note: "Dedicated deployment path when teams want production-grade model control.",
  },
  {
    label: "AnyCap CLI overview",
    href: "/cli",
    note: "One CLI and one auth flow across multiple agent environments.",
  },
  {
    label: "AnyCap Drive",
    href: "/capabilities/drive",
    note: "Storage and share-link workflows for artifacts that need to survive beyond one run.",
  },
  {
    label: "Install AnyCap",
    href: "/guides/install-anycap",
    note: "Published setup path for Codex, Cursor, Claude Code, and adjacent agent products.",
  },
] as const;

const nextMoveCards = [
  {
    title: "AnyCap vs fal.ai",
    href: "/compare/anycap-vs-fal-ai",
    body: "Compare AnyCap to a queue-first generative media API platform instead of a broader model marketplace.",
  },
  {
    title: "Image Generation",
    href: "/capabilities/image-generation",
    body: "See the public image surface that an agent gets through the AnyCap runtime.",
  },
  {
    title: "Drive",
    href: "/capabilities/drive",
    body: "Go deeper on the artifact storage and sharing layer that Replicate does not try to own.",
  },
  {
    title: "Install AnyCap",
    href: "/guides/install-anycap",
    body: "Best next page if you want to validate the runtime directly instead of reading more comparisons.",
  },
] as const;

const articleJsonLd = createTechArticleJsonLd({
  headline: "AnyCap vs Replicate — agent capability runtime vs model API platform",
  description:
    "Comparison guide for teams deciding whether they need Replicate's model inference platform or AnyCap's cross-agent capability runtime.",
  path: "/compare/anycap-vs-replicate",
  about: [
    "AnyCap",
    "Replicate",
    "Agent capability runtime",
    "Model inference API",
    "Webhook workflows",
  ],
  keywords: [
    "anycap vs replicate",
    "replicate alternative for agents",
    "replicate vs anycap",
    "model api vs capability runtime",
    "replicate for coding agents",
  ],
  datePublished: lastUpdatedIso,
  dateModified: lastUpdatedIso,
});

const faqJsonLd = createFaqPageJsonLd(faqItems);

function SourceLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  if (href.startsWith("http")) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#1c1f17] underline decoration-[#6b7d3a] underline-offset-4"
      >
        {label}
      </a>
    );
  }

  return (
    <Link href={href} className="text-[#1c1f17] underline decoration-[#6b7d3a] underline-offset-4">
      {label}
    </Link>
  );
}

export default function AnycapVsReplicatePage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Compare", href: "/compare", unlinkable: true },
          { name: "AnyCap vs Replicate" },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <article className="px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[1280px] py-12 md:py-20 lg:py-24">
          <FadeIn>
            <p className="mb-4 text-[11px] tracking-[0.8px] text-[#6b7d3a]" style={mono}>
              Compare
            </p>
            <p className="mb-3 text-[11px] tracking-[0.5px] text-[#5a5e52]" style={mono}>
              Last updated {lastUpdatedLabel}
            </p>
            <h1
              className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(28px, 5vw, 60px)" }}
            >
              AnyCap vs
              <br />
              Replicate
            </h1>
            <p className="mt-6 max-w-[860px] text-base leading-7 text-[#4d5145] md:text-lg">
              AnyCap vs Replicate is a stack-layer decision, not a same-category fight. Replicate
              is a strong fit when your application backend needs direct control over model
              inference, prediction lifecycles, deployments, and webhooks. AnyCap is the stronger
              fit when your agents already exist and the missing layer is capability access across
              image, video, search, storage, and publishing.
            </p>
            <div className="mt-8 max-w-[920px] rounded-2xl border border-[#d4dbb8] bg-[#fbfcf8] p-6 md:p-7">
              <p className="text-[11px] tracking-[0.7px] text-[#6b7d3a]" style={mono}>
                Answer-first summary
              </p>
              <p className="mt-3 text-sm leading-6 text-[#4d5145] md:text-[15px]">
                Choose Replicate when the product needs model APIs, prediction objects, sync or
                async execution, and webhook-driven backend workflows. Choose AnyCap when the agent
                is already chosen and you want one runtime that equips it with multimodal
                capabilities plus artifact delivery instead of another provider integration project.
              </p>
            </div>
          </FadeIn>

          <FadeIn className="mt-8">
            <EarlyAccessBanner />
          </FadeIn>

          <FadeIn className="mt-10">
            <section>
              <h2 className="mb-6 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                Comparison table
              </h2>
              <div className="overflow-hidden rounded-2xl border border-[#d4dbb8] bg-[#fbfcf8]">
                <div className="grid grid-cols-1 border-b border-[#d4dbb8] bg-[#f6f8ef] px-5 py-4 md:grid-cols-[1.1fr_1fr_1fr] md:px-7">
                  <p className="text-[11px] tracking-[0.7px] text-[#6b7d3a]" style={mono}>
                    Decision lens
                  </p>
                  <p className="mt-2 text-[11px] tracking-[0.7px] text-[#1c1f17] md:mt-0" style={mono}>
                    AnyCap
                  </p>
                  <p className="mt-2 text-[11px] tracking-[0.7px] text-[#1c1f17] md:mt-0" style={mono}>
                    Replicate
                  </p>
                </div>
                {comparisons.map((row) => (
                  <div
                    key={row.dimension}
                    className="grid grid-cols-1 gap-4 border-b border-[#d4dbb8] px-5 py-5 last:border-b-0 md:grid-cols-[1.1fr_1fr_1fr] md:gap-6 md:px-7"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[#1c1f17]">{row.dimension}</p>
                    </div>
                    <p className="text-sm leading-6 text-[#4d5145]">{row.anycap}</p>
                    <p className="text-sm leading-6 text-[#4d5145]">{row.replicate}</p>
                  </div>
                ))}
              </div>
            </section>
          </FadeIn>

          <FadeIn className="mt-16 md:mt-20">
            <section>
              <h2 className="mb-6 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                Which path fits your team
              </h2>
              <div className="grid gap-4 lg:grid-cols-2">
                {useCases.map((card) => (
                  <div key={card.title} className="rounded-2xl border border-[#d4dbb8] bg-[#fffffc]/70 p-6">
                    <p className="mb-3 text-[11px] tracking-[0.7px] text-[#6b7d3a]" style={mono}>
                      {card.eyebrow}
                    </p>
                    <h3 className="mb-3 text-[16px] font-bold text-[#1c1f17]" style={mono}>
                      {card.title}
                    </h3>
                    <p className="text-sm leading-6 text-[#4d5145]">{card.body}</p>
                  </div>
                ))}
              </div>
            </section>
          </FadeIn>

          <FadeIn className="mt-16 md:mt-20">
            <section>
              <h2 className="mb-4 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                Practical benchmark: zero to first image
              </h2>
              <p className="max-w-[700px] text-sm leading-6 text-[#4d5145] mb-6">
                The table below compares what it takes to go from zero setup to generating
                the first image in a Claude Code / Cursor / Codex agent workflow.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[#d4dbb8]">
                      <th className="pb-3 pr-6 text-[11px] text-[#5a5e52] tracking-[0.5px] w-[200px]" style={mono}>Metric</th>
                      <th className="pb-3 pr-6 text-[11px] text-[#6b7d3a] tracking-[0.5px]" style={mono}>AnyCap</th>
                      <th className="pb-3 text-[11px] text-[#5a5e52] tracking-[0.5px]" style={mono}>Replicate</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-[#d4dbb8]/50">
                      <td className="py-4 pr-6 text-sm font-medium text-[#1c1f17] align-top">Commands to first image</td>
                      <td className="py-4 pr-6 text-sm text-[#4d5145] leading-6 align-top">3 (install + login + generate)</td>
                      <td className="py-4 text-sm text-[#4d5145] leading-6 align-top">pip install + API key setup + Python script + model version lookup</td>
                    </tr>
                    <tr className="border-b border-[#d4dbb8]/50">
                      <td className="py-4 pr-6 text-sm font-medium text-[#1c1f17] align-top">Auth flows required</td>
                      <td className="py-4 pr-6 text-sm text-[#4d5145] leading-6 align-top">1 (anycap login)</td>
                      <td className="py-4 text-sm text-[#4d5145] leading-6 align-top">1 API token, but model versioning and input schema differ per model</td>
                    </tr>
                    <tr className="border-b border-[#d4dbb8]/50">
                      <td className="py-4 pr-6 text-sm font-medium text-[#1c1f17] align-top">Agent integration required</td>
                      <td className="py-4 pr-6 text-sm text-[#4d5145] leading-6 align-top">Skill file auto-discovery</td>
                      <td className="py-4 text-sm text-[#4d5145] leading-6 align-top">Custom Python script or API wrapper</td>
                    </tr>
                    <tr className="border-b border-[#d4dbb8]/50">
                      <td className="py-4 pr-6 text-sm font-medium text-[#1c1f17] align-top">Adding video after image</td>
                      <td className="py-4 pr-6 text-sm text-[#4d5145] leading-6 align-top">Same CLI, same auth: anycap video generate</td>
                      <td className="py-4 text-sm text-[#4d5145] leading-6 align-top">Find a video model, learn its input schema, add new prediction code</td>
                    </tr>
                    <tr className="border-b border-[#d4dbb8]/50">
                      <td className="py-4 pr-6 text-sm font-medium text-[#1c1f17] align-top">Free credit to start</td>
                      <td className="py-4 pr-6 text-sm text-[#4d5145] leading-6 align-top">$5 free credit, no card required</td>
                      <td className="py-4 text-sm text-[#4d5145] leading-6 align-top">Pay-per-prediction, pricing varies by model and hardware tier</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </FadeIn>

          <FadeIn className="mt-16 md:mt-20">
            <section className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-[#d4dbb8] bg-[#fbfcf8] p-6">
                <p className="mb-3 text-[11px] tracking-[0.7px] text-[#6b7d3a]" style={mono}>
                  Why teams choose AnyCap
                </p>
                <div className="space-y-3">
                  {anycapStrengths.map((item) => (
                    <div key={item} className="border-l-[3px] border-[#6b7d3a] pl-4">
                      <p className="text-sm leading-6 text-[#4d5145]">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-[#d4dbb8] bg-[#fbfcf8] p-6">
                <p className="mb-3 text-[11px] tracking-[0.7px] text-[#6b7d3a]" style={mono}>
                  Why teams choose Replicate
                </p>
                <div className="space-y-3">
                  {replicateStrengths.map((item) => (
                    <div key={item} className="border-l-[3px] border-[#1c1f17] pl-4">
                      <p className="text-sm leading-6 text-[#4d5145]">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </FadeIn>

          <FadeIn className="mt-16 md:mt-20">
            <section>
              <h2 className="mb-6 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                Source-backed references
              </h2>
              <div className="grid gap-4 lg:grid-cols-2">
                {sourceLinks.map((source) => (
                  <div key={source.label} className="rounded-2xl border border-[#d4dbb8] p-6">
                    <p className="mb-2 text-[11px] tracking-[0.7px] text-[#6b7d3a]" style={mono}>
                      {source.label}
                    </p>
                    <p className="text-sm leading-6 text-[#4d5145]">
                      <SourceLink href={source.href} label={source.label} />
                      {" — "}
                      {source.note}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </FadeIn>

          <FadeIn className="mt-16 md:mt-20">
            <section>
              <h2 className="mb-6 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                Frequently asked questions
              </h2>
              <div className="space-y-4">
                {faqItems.map((item) => (
                  <div key={item.question} className="rounded-2xl border border-[#d4dbb8] p-6">
                    <h3 className="mb-3 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                      {item.question}
                    </h3>
                    <p className="text-sm leading-6 text-[#4d5145]">{item.answer}</p>
                  </div>
                ))}
              </div>
            </section>
          </FadeIn>

          <FadeIn className="mt-16 md:mt-20">
            <section className="mb-8">
              <h2 className="mb-6 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                Next steps
              </h2>
              <div className="grid gap-4 lg:grid-cols-2">
                {nextMoveCards.map((card) => (
                  <Link
                    key={card.href}
                    href={card.href}
                    className="rounded-2xl border border-[#d4dbb8] bg-[#fffffc]/70 p-6 transition-colors hover:border-[#6b7d3a]"
                  >
                    <h3 className="mb-3 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                      {card.title}
                    </h3>
                    <p className="text-sm leading-6 text-[#4d5145]">{card.body}</p>
                  </Link>
                ))}
              </div>
            </section>
          </FadeIn>
        </div>
      </article>
    </>
  );
}
