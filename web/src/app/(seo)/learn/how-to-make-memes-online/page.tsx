import Image from "next/image";
import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { EarlyAccessBanner } from "@/components/landing/EarlyAccessBanner";
import { FadeIn } from "@/components/ui/FadeIn";
import { CommandCodeCard } from "@/components/ui/CommandCodeCard";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { createFaqPageJsonLd, createTechArticleJsonLd } from "@/lib/schema";
import { siteConfig } from "@/lib/site";

export const runtime = "edge";

const CDN_BASE = "https://cdn.anycap.ai/page_resource/learning";
const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;
const lastUpdatedLabel = "April 8, 2026";
const lastUpdatedIso = "2026-04-08";

export const metadata: Metadata = {
  title: "How to make memes online with an AI agent",
  description:
    "Use AnyCap with Codex, Cursor, or Claude Code to generate meme-style images, add exact caption text, and share the final asset without stitching together separate tools.",
  alternates: { canonical: "/learn/how-to-make-memes-online" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/learn/how-to-make-memes-online",
    siteName: siteConfig.siteName,
    title: "How to make memes online with an AI agent",
    description:
      "A workflow guide for generating meme-style visuals with AnyCap, keeping exact caption text deterministic, and delivering the final asset through one agent workflow.",
  },
};

const articleJsonLd = createTechArticleJsonLd({
  headline: "How to make memes online with an AI agent",
  description:
    "A workflow-led guide for using an AI agent plus AnyCap to generate meme-style images, place exact caption text, and share the final output.",
  path: "/learn/how-to-make-memes-online",
  about: [
    "Memes",
    "AI agents",
    "Image generation",
    "Captioned images",
    "Codex",
    "Cursor",
    "Claude Code",
  ],
  keywords: [
    "how to make memes online",
    "meme maker online",
    "ai meme generator",
    "funny meme drawings",
    "how to add text to an image",
    "captioned image workflow",
  ],
  datePublished: lastUpdatedIso,
  dateModified: lastUpdatedIso,
});

const faqItems = [
  {
    question: "Is this a normal meme template library?",
    answer:
      "No. This page is about a repeatable agent workflow. The agent uses AnyCap to generate or edit the base visual, then applies exact caption text locally so the final meme is readable and reproducible.",
  },
  {
    question: "Can AnyCap generate the exact meme text inside the image?",
    answer:
      "You should not depend on that. Image models are good at style, framing, and variation, but exact caption text is more reliable when it is overlaid deterministically after the image is generated.",
  },
  {
    question: "Which AnyCap image model should I use first?",
    answer:
      "Use Nano Banana 2 first when the target is funny meme drawings or fast visual iteration, Seedream 5 when you want a stronger first-pass polished image, and Nano Banana Pro when you are editing an existing screenshot or reaction image.",
  },
  {
    question: "Does this workflow fit only joke memes?",
    answer:
      "No. The same workflow also fits captioned photos, launch jokes, blog lead images, lightweight social graphics, and internal team visuals that still need exact copy.",
  },
];

const faqJsonLd = createFaqPageJsonLd(faqItems);

const quickTakeaways = [
  "The strongest workflow is not 'ask the model to render the final meme text.' It is 'generate or edit the base visual, then place the exact caption deterministically.'",
  "That split makes the image stronger than a shallow template tool while keeping the final copy readable, repeatable, and shareable.",
  "The same workflow fits joke memes, captioned social graphics, blog lead images, and lightweight internal team visuals.",
] as const;

const validationCards = [
  {
    title: "Capability surface confirmed",
    body: "During page production on April 8, 2026, a live AnyCap status check confirmed image generation, image editing, image reading, Drive, Page, and video generation were available in the current environment.",
  },
  {
    title: "First-pass image tested",
    body: "The featured workflow image on this page was generated in the live workflow with Nano Banana 2, not mocked in a design tool after the fact.",
  },
  {
    title: "Image QA tested",
    body: "Image reading was used to check whether the hero visual contained garbled letters and whether the composition actually supported the article claim.",
  },
  {
    title: "Core workflow decision",
    body: "The page recommendation comes from direct workflow testing: keep the model focused on the visual layer and keep the final caption exact through deterministic overlay.",
  },
] as const;

const workflowSteps = [
  {
    title: "Write the joke, reaction, or hook first",
    body: "Start with the exact line you want the image to carry. In this workflow, the caption is treated as product copy, not a fuzzy prompt detail.",
  },
  {
    title: "Generate the base visual with AnyCap",
    body: "Ask the agent to create or edit an image that leaves clean caption-safe space at the top, bottom, or side instead of asking the model to render the final text itself.",
  },
  {
    title: "Overlay exact text locally",
    body: "Render the caption deterministically so line breaks, emphasis, and wording are exact on every run.",
  },
  {
    title: "QA readability with the agent",
    body: "Use image reading to verify that the text is actually legible at thumbnail size and that the composition still lands as a meme instead of a cluttered graphic.",
  },
  {
    title: "Share or publish the result",
    body: "Keep the file local for immediate review, upload it to Drive for a share link, or publish a mini gallery through Page when the output belongs in a workflow handoff.",
  },
] as const;

const modelCards = [
  {
    title: "Seedream 5",
    label: "Best first-pass image",
    body: "Use this when the meme starts from an idea and you want the first generated image to feel closer to final.",
    href: "/models/seedream-5",
  },
  {
    title: "Nano Banana Pro",
    label: "Best for remixing a source image",
    body: "Use this when you already have a screenshot, selfie, or reaction image and want the agent to clean it up or exaggerate the mood.",
    href: "/models/nano-banana-pro",
  },
  {
    title: "Nano Banana 2",
    label: "Best for funny meme drawings and fast variants",
    body: "Use this when you want many directions quickly, especially when the joke lives in a doodle-like drawing style instead of a polished commercial visual.",
    href: "/models/nano-banana-2",
  },
] as const;

const principles = [
  "Treat the caption as exact copy. Do not leave final wording up to the image model.",
  "Prompt for negative space explicitly so the overlay has room to breathe.",
  "Judge the result at thumbnail size. A meme that only works at full size is usually too busy.",
  "Use the same workflow for joke memes, captioned social posts, and lightweight editorial graphics.",
] as const;

const comparisonRows = [
  {
    lens: "Base visual quality",
    generic: "Fast templates or low-control generators often constrain the look.",
    agent: "AnyCap lets the agent choose an image model based on first-pass quality, editability, or speed.",
  },
  {
    lens: "Exact caption control",
    generic: "Many generators try to render the text directly, which is where captions start to drift or break.",
    agent: "The agent keeps the caption deterministic after generation, so the final copy stays exact.",
  },
  {
    lens: "Reusability",
    generic: "The workflow usually ends when one image is exported.",
    agent: "The same pattern can be reused for social posts, launch jokes, blog visuals, and internal team graphics.",
  },
  {
    lens: "Delivery",
    generic: "Most meme tools stop at download.",
    agent: "The agent can keep the asset local, upload it through Drive, or package it into a Page handoff.",
  },
] as const;

const outputCards = [
  {
    title: "Funny meme drawings",
    body: "Generate rough, expressive doodle-style scenes where the humor already lands before you add any caption text.",
  },
  {
    title: "Captioned social post",
    body: "Create a square or vertical visual for social distribution without switching between a separate generator and a separate caption tool.",
  },
  {
    title: "Blog lead image with attitude",
    body: "Use meme language and agent workflows to create a more distinctive header image than a generic stock visual.",
  },
  {
    title: "Internal team joke with clean delivery",
    body: "Keep the output reproducible when a team wants a visual joke that still looks intentional and shareable.",
  },
] as const;

const codeExamples = [
  {
    title: "Generate a funny meme drawing",
    code: `anycap image generate \\
  --model nano-banana-2 \\
  --prompt "funny meme drawing, crude but charming internet doodle style, exhausted office goblin melting into an office chair while holding a tiny coffee cup, absurd tiny-problem energy, wildly exaggerated defeated expression, messy desk chaos without readable screens, thick sketch lines, off-white paper texture, muted green accents, obvious blank space for optional caption, no words, no letters, no watermark" \\
  --param aspect_ratio=4:3 \\
  --param resolution=2k \\
  -o funny-meme-drawing.png`,
  },
  {
    title: "Remix an existing reaction image",
    code: `anycap image generate \\
  --model nano-banana-pro \\
  --mode image-to-image \\
  --prompt "preserve the subject, sharpen the framing, simplify the background, keep clear caption-safe space at the top and bottom" \\
  --param images=./reaction-source.png \\
  --param aspect_ratio=1:1 \\
  --param resolution=2k \\
  -o meme-remix-base.png`,
  },
  {
    title: "QA the final meme",
    code: `anycap actions image-read \\
  --file ./final-meme.png \\
  --instruction "Read the visible caption text exactly and say whether it is easy to read at small size."`,
  },
];

const nextMoveCards = [
  {
    title: "Image Generation",
    href: "/capabilities/image-generation",
    body: "See the exact AnyCap surface that handles first-pass images and image editing loops.",
  },
  {
    title: "Skills",
    href: "/skills",
    body: "Understand how a skill teaches Codex, Cursor, or Claude Code to run this workflow consistently.",
  },
  {
    title: "Install AnyCap",
    href: "/guides/install-anycap",
    body: "Go here when you want the shortest path from article to working CLI.",
  },
  {
    title: "Funny Meme Drawings",
    href: "/learn/funny-meme-drawings",
    body: "Go deeper on the strongest style family if you want the preset, prompt, and SEO cluster logic in one page.",
  },
  {
    title: "Bad Drawing Memes",
    href: "/learn/how-to-make-bad-drawing-memes",
    body: "Use this supporting page when the joke works because the art looks intentionally awkward instead of polished.",
  },
];

function BulletList({ items }: { items: readonly string[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-sm leading-6 text-[#4d5145] md:text-[15px]">
          <span className="mt-[8px] h-1.5 w-1.5 rounded-full bg-[#6b7d3a]" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function HowToMakeMemesOnlinePage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Learn", href: "/learn", unlinkable: true },
          { name: "How to make memes online" },
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
              Learn
            </p>
            <p className="mb-3 text-[11px] tracking-[0.5px] text-[#5a5e52]" style={mono}>
              Last updated {lastUpdatedLabel}
            </p>
            <h1
              className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(32px, 6vw, 72px)" }}
            >
              How to make memes online
              <br />
              without breaking the workflow
            </h1>
            <p className="mt-6 max-w-[800px] text-base leading-7 text-[#4d5145] md:text-lg">
              If you are asking how to make memes online, the more useful question is not whether
              you can find another meme website. It is whether your agent can generate the base
              visual, keep the caption exact, and hand off a shareable asset without making you
              bounce between disconnected tools. That is the role{" "}
              <Link
                href="/capabilities/image-generation"
                className="underline decoration-[#d4dbb8] underline-offset-2 transition-colors hover:text-[#6b7d3a] hover:decoration-[#6b7d3a]"
              >
                AnyCap image generation
              </Link>{" "}
              can cover around Codex, Cursor, and Claude Code.
            </p>
            <div className="mt-8 max-w-[860px] rounded-xl border border-[#d4dbb8] bg-[#f9faf5]/80 p-6">
              <p className="mb-3 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                Answer-first summary
              </p>
              <p className="text-sm leading-6 text-[#4d5145]">
                The cleanest way to make memes online with an AI agent is to let AnyCap handle the
                image generation or image editing layer, then place the final caption text
                deterministically. That gives you stronger visuals than a generic template tool
                while keeping the copy exact and the output reproducible. For `funny meme
                drawings`, this is even more useful because the drawing itself can carry the joke
                before you add any final caption.
              </p>
            </div>
          </FadeIn>

          <FadeIn className="mt-8">
            <EarlyAccessBanner />
          </FadeIn>

          <FadeIn className="mt-10">
            <div className="overflow-hidden rounded-xl border border-[#d8dcd0] bg-[#fbfcf8]">
              <Image
                src={`${CDN_BASE}/learn-how-to-make-memes-online-hero.webp`}
                alt="A stressed doodle-style office worker gripping a mug in front of a warning-filled laptop, with a clean blank banner area left for an exact caption."
                width={2400}
                height={1792}
                unoptimized
                className="h-auto w-full"
                priority
              />
            </div>
            <p className="mt-4 max-w-[760px] text-sm leading-6 text-[#4d5145]">
              This workflow image was chosen because it leaves a clean caption band at the top. It
              shows the page&apos;s real recommendation in one frame: let the model handle the visual,
              then place the final meme text deterministically where the layout already supports it.
            </p>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24 max-w-[920px]">
              <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                Quick answer
              </p>
              <h2 className="mt-3 text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                The practical answer is a two-layer workflow
              </h2>
              <p className="mt-6 text-base leading-7 text-[#4d5145]">
                To make memes online in a way that still fits an agent workflow, split the job into
                two layers. Let the model generate or edit the visual layer, and let the agent keep
                the caption layer exact. That is the point where a workflow becomes more reliable
                than a shallow meme maker.
              </p>
              <div className="mt-8 rounded-[24px] border border-[#d4dbb8] bg-[#f7f8ef]/70 p-6">
                <BulletList items={quickTakeaways} />
              </div>
              <p className="mt-6 text-base leading-7 text-[#4d5145]">
                One of the highest-fit versions of this workflow is{" "}
                <strong>funny meme drawings</strong>. Compared with photoreal meme requests, rough
                internet-humor drawings give the model more room to be expressive, and they still
                work even when the final caption is added later.
              </p>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                Workflow
              </p>
              <h2 className="mt-3 text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                Five steps from joke to finished asset
              </h2>
              <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                {workflowSteps.map((step, index) => (
                  <div
                    key={step.title}
                    className="rounded-[24px] border border-[#d4dbb8] bg-[#fffffc]/70 p-5"
                  >
                    <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                      Step {index + 1}
                    </p>
                    <h3 className="text-[16px] leading-6 text-[#1c1f17]" style={mono}>
                      {step.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-[#4d5145]">{step.body}</p>
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
              <div className="grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.25fr)]">
                <div>
                  <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                    Core rules
                  </p>
                  <h2
                    className="mt-3 text-[24px] leading-8 text-[#1c1f17] md:text-[30px]"
                    style={pixel}
                  >
                    The caption is exact copy.
                    <br />
                    The model handles the visual.
                  </h2>
                </div>
                <div className="rounded-[24px] border border-[#d4dbb8] bg-[#f7f8ef]/70 p-6">
                  <BulletList items={principles} />
                </div>
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                First-hand validation
              </p>
              <h2 className="mt-3 text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                What we verified on the live AnyCap workflow
              </h2>
              <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {validationCards.map((card) => (
                  <div
                    key={card.title}
                    className="rounded-[24px] border border-[#d4dbb8] bg-[#fffffc]/70 p-5"
                  >
                    <h3 className="text-[16px] leading-6 text-[#1c1f17]" style={mono}>
                      {card.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-[#4d5145]">{card.body}</p>
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
              <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                Model choice
              </p>
              <h2 className="mt-3 text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                Choose the image model by workflow, not by hype
              </h2>
              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {modelCards.map((card) => (
                  <Link
                    key={card.href}
                    href={card.href}
                    className="rounded-[24px] border border-[#d4dbb8] bg-[#fffffc]/70 p-6 transition-colors hover:border-[#6b7d3a]"
                  >
                    <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                      {card.label}
                    </p>
                    <h3 className="mt-3 text-[20px] leading-7 text-[#1c1f17]" style={pixel}>
                      {card.title}
                    </h3>
                    <p className="mt-4 text-sm leading-6 text-[#4d5145]">{card.body}</p>
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
              <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                Comparison
              </p>
              <h2 className="mt-3 text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                Generic meme maker vs agent plus AnyCap
              </h2>
              <div className="mt-8 overflow-x-auto rounded-xl border border-[#d4dbb8]">
                <table className="w-full text-left">
                  <thead className="bg-[#f9faf5]">
                    <tr className="border-b border-[#d4dbb8]">
                      <th className="px-5 py-3 text-[11px] tracking-[0.5px] text-[#5a5e52]" style={mono}>
                        Lens
                      </th>
                      <th className="px-5 py-3 text-[11px] tracking-[0.5px] text-[#5a5e52]" style={mono}>
                        Generic meme maker
                      </th>
                      <th className="px-5 py-3 text-[11px] tracking-[0.5px] text-[#5a5e52]" style={mono}>
                        Agent plus AnyCap
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonRows.map((row) => (
                      <tr key={row.lens} className="border-b border-[#d4dbb8]/70 align-top last:border-b-0">
                        <td className="px-5 py-4 text-sm text-[#1c1f17]" style={mono}>
                          {row.lens}
                        </td>
                        <td className="px-5 py-4 text-sm leading-6 text-[#4d5145]">{row.generic}</td>
                        <td className="px-5 py-4 text-sm leading-6 text-[#4d5145]">{row.agent}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                    Command examples
                  </p>
                  <h2
                    className="mt-3 text-[24px] leading-8 text-[#1c1f17] md:text-[30px]"
                    style={pixel}
                  >
                    The agent workflow in commands
                  </h2>
                </div>
                <Link
                  href="/capabilities/image-generation"
                  className="text-sm text-[#6b7d3a] underline decoration-[#a7b57b] underline-offset-4"
                  style={mono}
                >
                  Want the capability details? Browse Image Generation
                </Link>
              </div>
              <div className="mt-8 grid gap-4 xl:grid-cols-3">
                {codeExamples.map((example) => (
                  <CommandCodeCard key={example.title} title={example.title} code={example.code} />
                ))}
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <div className="rounded-[24px] border border-[#d4dbb8] bg-[#f7f8ef]/70 p-6 md:p-8">
                <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                  Style deep dive
                </p>
                <h2 className="mt-3 text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                  Want the preset-specific visual examples?
                </h2>
                <p className="mt-4 max-w-[820px] text-sm leading-6 text-[#4d5145]">
                  The multi-panel doodle collage now lives on the dedicated `funny meme drawings`
                  page. That keeps this anchor page focused on the workflow itself instead of
                  repeating the style-page visuals.
                </p>
                <Link
                  href="/learn/funny-meme-drawings"
                  className="mt-5 inline-flex text-sm text-[#6b7d3a] underline decoration-[#a7b57b] underline-offset-4"
                  style={mono}
                >
                  Browse Funny Meme Drawings
                </Link>
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                Output types
              </p>
              <h2 className="mt-3 text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                This workflow is broader than internet-joke pages
              </h2>
              <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {outputCards.map((card) => (
                  <div
                    key={card.title}
                    className="rounded-[24px] border border-[#d4dbb8] bg-[#fffffc]/70 p-5"
                  >
                    <h3 className="text-[16px] leading-6 text-[#1c1f17]" style={mono}>
                      {card.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-[#4d5145]">{card.body}</p>
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
              <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                Next step
              </p>
              <h2 className="mt-3 text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                Move from the concept into a working setup
              </h2>
              <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {nextMoveCards.map((card) => (
                  <Link
                    key={card.href}
                    href={card.href}
                    className="rounded-[24px] border border-[#d4dbb8] bg-[#fffffc]/70 p-5 transition-colors hover:border-[#6b7d3a]"
                  >
                    <h3 className="text-base text-[#1c1f17]" style={mono}>
                      {card.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-[#4d5145]">{card.body}</p>
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
              <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                FAQ
              </p>
              <h2 className="mt-3 text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                Common questions before you build the workflow
              </h2>
              <div className="mt-8 space-y-4">
                {faqItems.map((item) => (
                  <div
                    key={item.question}
                    className="rounded-[24px] border border-[#d4dbb8] bg-[#fffffc]/70 p-6"
                  >
                    <h3 className="text-base text-[#1c1f17]" style={mono}>
                      {item.question}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-[#4d5145]">{item.answer}</p>
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
