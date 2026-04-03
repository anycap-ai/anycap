import type { Metadata } from "next";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { FadeIn } from "@/components/ui/FadeIn";
import { DriveDemo } from "@/components/landing/DriveDemo";
import { createTechArticleJsonLd } from "@/lib/schema";
import { siteConfig } from "@/lib/site";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

export const metadata: Metadata = {
  title: "Drive for AI agents - Shared storage, file organization, and public URLs",
  description:
    "Give AI agents a shared drive through AnyCap. Store generated outputs, organize assets, and create public URLs through one interface instead of stitching storage into each workflow.",
  alternates: { canonical: "/capabilities/drive" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/capabilities/drive",
    siteName: siteConfig.siteName,
    title: "Drive for AI agents - Shared storage, file organization, and public URLs",
    description:
      "Add shared storage and file delivery to AI agent workflows with AnyCap Drive.",
  },
};

const usageExamples = [
  {
    title: "Upload an output file",
    code: "anycap drive upload launch.mp4",
  },
  {
    title: "Share a stored asset",
    code: "anycap drive share dn_xKmP123",
  },
  {
    title: "List files in drive",
    code: "anycap drive list",
  },
] as const;

const useCases = [
  "Keep generated images, videos, audio, and docs in one shared agent-accessible place.",
  "Create public URLs for outputs without bolting on a separate storage product per workflow.",
  "Organize reusable assets so different agents and sessions can work from the same file set.",
  "Make delivery part of the same runtime as generation, analysis, and retrieval.",
] as const;

const faqItems = [
  {
    question: "Why include drive as an agent capability?",
    answer:
      "Because generation is only half the workflow. Agents also need a place to store outputs, retrieve them later, and hand off links to users or downstream systems without rebuilding storage on every project.",
  },
  {
    question: "What does AnyCap Drive give teams?",
    answer:
      "It gives teams a shared storage layer for generated outputs and reference assets, plus public links when files need to leave the agent runtime and reach people or other systems.",
  },
  {
    question: "How is drive different from generation or search?",
    answer:
      "Generation creates assets, search finds information, and drive keeps artifacts available after the action completes. It is the storage and delivery layer that lets agent workflows persist useful outputs.",
  },
  {
    question: "When should teams use drive?",
    answer:
      "Use drive when an agent needs to save artifacts, organize inputs and outputs, or return stable file links instead of ephemeral local files.",
  },
] as const;

const capabilityGuideJsonLd = createTechArticleJsonLd({
  headline: "Drive for AI agents - Shared storage, file organization, and public URLs",
  description:
    "Capability guide for adding shared storage to AI agents through AnyCap Drive, including file organization and public delivery workflows.",
  path: "/capabilities/drive",
  about: ["Drive for AI agents", "Agent storage", "File sharing", "AnyCap Drive"],
  keywords: [
    "drive for ai agents",
    "agent storage",
    "file storage for ai agents",
    "public urls for agent outputs",
  ],
});

export default function DriveCapabilityPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Capabilities", href: "/capabilities" },
          { name: "Drive" },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(capabilityGuideJsonLd) }}
      />

      <article className="px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[1280px] py-12 md:py-20 lg:py-24">
          <FadeIn>
            <p className="mb-4 text-[11px] tracking-[0.8px] text-[#6b7d3a]" style={mono}>
              Capabilities
            </p>
            <h1
              className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(32px, 6vw, 72px)" }}
            >
              Drive
            </h1>
            <p className="mt-6 max-w-[780px] text-base leading-7 text-[#4d5145] md:text-lg">
              AnyCap Drive gives agents a shared place to store outputs, organize assets, and hand
              off public URLs. Instead of treating storage as a separate product that each workflow
              has to rewire, drive makes persistence part of the same capability layer as
              generation, analysis, and retrieval.
            </p>
          </FadeIn>

          <FadeIn className="mt-10">
            <DriveDemo />
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-6 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                CLI usage
              </h2>
              <div className="max-w-[860px] space-y-6">
                {usageExamples.map((example) => (
                  <div key={example.title}>
                    <p className="mb-3 text-[11px] tracking-[0.5px] text-[#5a5e52]" style={mono}>
                      {example.title}
                    </p>
                    <div className="bg-[#1c1f17] px-5 py-4">
                      <p className="break-all text-[13px] text-[#d4e0a4]" style={mono}>
                        {example.code}
                      </p>
                    </div>
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
              <h2 className="mb-6 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                When agents need drive
              </h2>
              <div className="grid max-w-[920px] gap-4 sm:grid-cols-2">
                {useCases.map((useCase) => (
                  <div key={useCase} className="border-l-[3px] border-[#6b7d3a] pl-5">
                    <p className="text-sm leading-6 text-[#4d5145]">{useCase}</p>
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
                Related pages
              </h2>
              <div className="grid max-w-[1100px] gap-4 sm:grid-cols-3">
                <Link
                  href="/capabilities/video-generation"
                  className="rounded-xl border border-[#d4dbb8] p-5 transition-colors hover:border-[#6b7d3a]"
                >
                  <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                    Related capability
                  </p>
                  <h3 className="mb-2 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                    Video Generation
                  </h3>
                  <p className="text-sm leading-6 text-[#4d5145]">
                    Generated videos become more useful when the workflow can persist and share them.
                  </p>
                </Link>
                <Link
                  href="/capabilities/image-generation"
                  className="rounded-xl border border-[#d4dbb8] p-5 transition-colors hover:border-[#6b7d3a]"
                >
                  <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                    Related capability
                  </p>
                  <h3 className="mb-2 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                    Image Generation
                  </h3>
                  <p className="text-sm leading-6 text-[#4d5145]">
                    Save generated visuals and reference images into a reusable asset library.
                  </p>
                </Link>
                <Link
                  href="/pricing"
                  className="rounded-xl border border-[#d4dbb8] p-5 transition-colors hover:border-[#6b7d3a]"
                >
                  <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                    Pricing
                  </p>
                  <h3 className="mb-2 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                    Pricing
                  </h3>
                  <p className="text-sm leading-6 text-[#4d5145]">
                    See how drive storage fits alongside the rest of the AnyCap product stack.
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
                FAQ
              </h2>
              <div className="max-w-[860px] space-y-6">
                {faqItems.map((item) => (
                  <div key={item.question} className="rounded-xl border border-[#d4dbb8] p-5">
                    <h3 className="mb-2 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                      {item.question}
                    </h3>
                    <p className="text-sm leading-6 text-[#4d5145]">{item.answer}</p>
                  </div>
                ))}
              </div>
            </section>
          </FadeIn>
        </div>
      </article>
    </>
  );
}
