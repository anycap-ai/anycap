import type { Metadata } from "next";
import { LocalizedLink as Link } from "@/components/LocalizedLink";
import { siteConfig } from "@/lib/site";
import { EarlyAccessBanner } from "@/components/EarlyAccessBanner";
import { FadeIn } from "@/components/FadeIn";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace" } as const;

export const metadata: Metadata = {
  title: "Nano Banana Pro for AI agents — Image editing through AnyCap",
  description:
    "Use Nano Banana Pro through AnyCap when AI agents need image editing, revision loops, and prompt-based updates to an existing visual. Learn how it fits agent workflows and when to choose it over a pure generation model.",
  alternates: { canonical: "/models/nano-banana-pro" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/models/nano-banana-pro",
    siteName: siteConfig.siteName,
    title: "Nano Banana Pro for AI agents — Image editing through AnyCap",
    description:
      "Use Nano Banana Pro through AnyCap when AI agents need image editing, revision loops, and prompt-based updates to an existing visual.",
  },
};

const fitItems = [
  "Revise an existing image with a text instruction",
  "Adjust lighting, composition, or background without rebuilding the asset",
  "Run fast agent iteration loops on visual drafts",
  "Start from an input image instead of a blank prompt",
];

export default function NanoBananaProPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Nano Banana Pro" },
        ]}
      />
      <article className="px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[1280px] py-12 md:py-20 lg:py-24">
          <FadeIn>
            <p className="text-[11px] text-[#6b7d3a] tracking-[3px] uppercase mb-4" style={mono}>
              Model
            </p>
            <h1
              className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(32px, 6vw, 72px)" }}
            >
              Nano Banana Pro
              <br />
              for AI agents
            </h1>
            <p className="mt-6 max-w-[740px] text-base leading-7 text-[#4d5145] md:text-lg">
              Nano Banana Pro is a better fit when an agent needs to edit an existing image
              instead of generating from scratch. Through AnyCap, the model becomes part of the
              same capability runtime and CLI used for other image and video tasks, so agents can
              move from generation to revision without changing tools.
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
              <h2 className="text-lg md:text-xl text-[#1c1f17] mb-6" style={{ ...pixel }}>
                Best-fit workflow
              </h2>
              <ul className="space-y-3 max-w-[760px]">
                {fitItems.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-[#4d5145] leading-6">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#6b7d3a] shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="text-lg md:text-xl text-[#1c1f17] mb-6" style={{ ...pixel }}>
                Example CLI call
              </h2>
              <div className="space-y-6 max-w-[820px]">
                <div>
                  <p className="text-[11px] text-[#5a5e52] tracking-[2px] uppercase mb-3" style={mono}>
                    Edit an existing image
                  </p>
                  <div className="bg-[#1c1f17] px-5 py-4">
                    <p className="text-[13px] text-[#d4e0a4]" style={mono}>
                      anycap image generate --model nano_banana_pro --prompt &quot;replace the background with a warm studio light&quot; --image ./input.png
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-[#4d5145] leading-6">
                    This is the kind of prompt an agent can issue after inspecting a draft,
                    receiving feedback, or updating a design asset inside a larger workflow.
                  </p>
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
                When not to choose it
              </h2>
              <div className="grid gap-6 sm:grid-cols-2 max-w-[960px]">
                <div className="border border-[#d4dbb8] p-5">
                  <p className="text-[11px] text-[#6b7d3a] tracking-[2px] uppercase mb-2" style={mono}>
                    Choose Nano Banana Pro
                  </p>
                  <p className="text-sm text-[#4d5145] leading-6">
                    When the agent already has an image and needs targeted changes, multiple
                    revisions, or prompt-based editing.
                  </p>
                </div>
                <div className="border border-[#d4dbb8] p-5">
                  <p className="text-[11px] text-[#5a5e52] tracking-[2px] uppercase mb-2" style={mono}>
                    Choose Seedream 5 instead
                  </p>
                  <p className="text-sm text-[#4d5145] leading-6">
                    When the workflow begins from a text prompt and the agent needs a polished
                    fresh image rather than an edit pass.
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
                  href="/capabilities/image-generation"
                  className="inline-block px-8 py-3 text-[11px] font-bold tracking-[3px] uppercase text-[#f4f5f0] bg-[#6b7d3a] hover:bg-[#1c1f17] transition-colors"
                  style={mono}
                >
                  Image Generation
                </Link>
                <Link
                  href="/models/seedream-5"
                  className="inline-block px-8 py-3 text-[11px] font-bold tracking-[3px] uppercase text-[#1c1f17] border border-[#1c1f17] hover:bg-[#1c1f17] hover:text-[#f4f5f0] transition-colors"
                  style={mono}
                >
                  Seedream 5
                </Link>
                <Link
                  href="/guides/context-engineering-for-agents"
                  className="inline-block px-8 py-3 text-[11px] font-bold tracking-[3px] uppercase text-[#1c1f17] border border-[#1c1f17] hover:bg-[#1c1f17] hover:text-[#f4f5f0] transition-colors"
                  style={mono}
                >
                  Context Guide
                </Link>
              </div>
            </section>
          </FadeIn>
        </div>
      </article>
    </>
  );
}
