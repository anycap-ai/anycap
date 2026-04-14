import Image from "next/image";
import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { EarlyAccessBanner } from "@/components/landing/EarlyAccessBanner";
import { FadeIn } from "@/components/ui/FadeIn";
import { CommandCodeCard } from "@/components/ui/CommandCodeCard";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { ArticleByline } from "@/components/seo/ArticleByline";
import { getSeoPageChrome } from "@/lib/seo/ia";
import { createFaqPageJsonLd, createTechArticleJsonLd } from "@/lib/schema";
import { siteConfig } from "@/lib/site";

export const runtime = "edge";

const CDN_BASE = "https://cdn.anycap.ai/page_resource/learning";
const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;
const lastUpdatedLabel = "April 8, 2026";
const lastUpdatedIso = "2026-04-08";

export const metadata: Metadata = {
  title: "Funny Meme Drawings with an AI Agent",
  description:
    "Use AnyCap with Nano Banana 2 to generate funny meme drawings, classic doodle memes, and bad-drawing variants while keeping captions exact when wording matters.",
  alternates: { canonical: "/learn/funny-meme-drawings" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/learn/funny-meme-drawings",
    siteName: siteConfig.siteName,
    title: "Funny Meme Drawings with an AI Agent",
    description:
      "A workflow guide for generating funny meme drawings with AnyCap, choosing the right doodle preset, and keeping the final meme reproducible.",
  },
};

const articleJsonLd = createTechArticleJsonLd({
  headline: "Funny Meme Drawings with an AI Agent",
  description:
    "A practical guide to generating funny meme drawings with AnyCap, from classic doodles to bad-drawing variants, without losing exact caption control.",
  path: "/learn/funny-meme-drawings",
  about: [
    "Funny meme drawings",
    "AI agents",
    "Image generation",
    "Doodle memes",
    "Nano Banana 2",
    "Codex",
    "Cursor",
    "Claude Code",
  ],
  keywords: [
    "funny meme drawings",
    "meme drawings",
    "drawn memes",
    "funny drawn memes",
    "easy memes to draw",
    "bad drawing meme",
  ],
  datePublished: lastUpdatedIso,
  dateModified: lastUpdatedIso,
});

const faqItems = [
  {
    question: "What style is the best fit for funny meme drawings?",
    answer:
      "Classic doodle or stick-figure-adjacent humor is usually the best fit. It maps well to search intent, tolerates stylization, and still works even before exact caption text is added.",
  },
  {
    question: "Should I make a separate page for every meme style?",
    answer:
      "No. A few repeatable presets are more useful than a long list of trend pages. The strongest setup is one anchor workflow plus a small number of style-specific supporting pages.",
  },
  {
    question: "Is Nano Banana 2 the first model to try here?",
    answer:
      "Yes. Nano Banana 2 is the best first model when you want fast iteration across doodle, bad-drawing, and simple comic-panel directions.",
  },
  {
    question: "Do funny meme drawings still need deterministic captions?",
    answer:
      "Sometimes not. If the drawing carries the joke already, you can publish it as-is. When the exact line matters, keep the caption deterministic after generation.",
  },
];

const faqJsonLd = createFaqPageJsonLd(faqItems);

const pageChrome = getSeoPageChrome("/learn/funny-meme-drawings");

const quickTakeaways = [
  "Funny meme drawings are one of the strongest search-fit style families for AnyCap because the image can land the joke before the caption is finalized.",
  "The highest-value preset is `classic-doodle`, then `bad-drawing` as a supporting variation. `Rage-comic-adjacent` works better as side content than as the core SEO bet.",
  "Nano Banana 2 is the best first model because the workflow benefits from fast variation more than polished realism.",
] as const;

const workflowSteps = [
  {
    title: "Choose the preset first",
    body: "Decide whether the joke wants a classic doodle, a deliberately bad drawing, or a comic-panel reaction before you write the prompt.",
  },
  {
    title: "Generate two to four variants",
    body: "Funny meme drawings usually improve through iteration. Ask for several close variants and keep the clearest one.",
  },
  {
    title: "Keep the image readable at thumbnail size",
    body: "Simple shapes, clear expressions, and clean negative space matter more than detail in this style family.",
  },
  {
    title: "Add exact wording only when needed",
    body: "If the picture already carries the joke, stop there. If the punchline still needs precise words, overlay the caption locally after generation.",
  },
  {
    title: "Link the style page back into the cluster",
    body: "Use the style-specific page to send readers into the broader workflow page, image generation capability page, and installation path.",
  },
] as const;

const presetCards = [
  {
    title: "Classic doodle",
    label: "Best cluster bet",
    body: "Simple blob people, stick-figure-adjacent characters, and rough office-creature humor are the strongest long-tail fit for funny meme drawings.",
    searchFit: "High",
    pageRole: "Core supporting page",
    prompt:
      "funny meme drawing, classic doodle internet-humor style, simple blob or stick-figure character, thick sketch lines, expressive face, absurd tiny-problem energy, clean negative space for optional caption, no words",
  },
  {
    title: "Bad drawing",
    label: "Good variation",
    body: "This works when the joke is funny because the art is awkward. It is still useful, but it behaves more like a supporting variant than a whole hub.",
    searchFit: "Medium",
    pageRole: "P2 supporting page",
    prompt:
      "intentionally bad meme drawing, awkward anatomy, uneven hand-drawn lines, low-fi internet humor, exaggerated emotion, funny because the drawing is clumsy, optional caption-safe space, no words",
  },
  {
    title: "Rage-comic-adjacent",
    label: "Use carefully",
    body: "The format has heat, but the SERP is more lore-heavy and archive-heavy. Use it for side content without copying canonical faces or making it the cluster center.",
    searchFit: "Low to medium",
    pageRole: "Side article or subsection",
    prompt:
      "black-and-white internet comic panel, early-web meme energy, expressive overreaction, simple inked linework, four-panel-friendly composition, avoid exact canonical meme faces, optional empty speech bubble area, no words",
  },
] as const;

const proofCards = [
  {
    title: "Live capability check",
    body: "AnyCap status was rechecked on April 8, 2026 before expanding this cluster. Image generation, image reading, Drive, Page, and video generation were available.",
  },
  {
    title: "Real generated examples",
    body: "The hero and collage on this page were generated with Nano Banana 2 for this workflow, not added as decorative stock art later.",
  },
  {
    title: "SERP sanity check",
    body: "Live SERP checks showed funny meme drawings are more workflow-friendly than rage-comic history or highly specific meme-lore pages.",
  },
] as const;

const commandExamples = [
  {
    title: "Classic doodle prompt",
    code: `anycap image generate \\
  --model nano-banana-2 \\
  --prompt "funny meme drawing, classic doodle internet-humor style, exhausted office goblin melting into an office chair while holding a tiny coffee cup, absurd tiny-problem energy, wildly exaggerated defeated expression, messy desk chaos without readable screens, thick sketch lines, off-white paper texture, muted green accents, obvious blank space for optional caption, no words, no letters, no watermark" \\
  --param aspect_ratio=4:3 \\
  --param resolution=2k \\
  -o funny-meme-drawings-hero.png`,
  },
  {
    title: "Bad drawing variant",
    code: `anycap image generate \\
  --model nano-banana-2 \\
  --prompt "intentionally bad meme drawing, awkward office creature reacting to a tiny notification like it is world-ending, uneven hand-drawn lines, exaggerated emotion, funny because the art is clumsy, white background, caption-safe space, no words, no letters" \\
  --param aspect_ratio=1:1 \\
  --param resolution=2k \\
  -o bad-drawing-meme.png`,
  },
  {
    title: "Check if the joke reads",
    code: `anycap actions image-read \\
  --file ./funny-meme-drawings-hero.png \\
  --instruction "Describe the scene, note whether any visible letters appeared, and say if the image still reads as a meme at thumbnail size."`,
  },
] as const;

const commonMistakes = [
  "Making the drawing too detailed. Meme drawings usually get weaker when the scene looks polished instead of immediate.",
  "Trying to force exact caption text into the model output. That is where readability usually breaks.",
  "Treating rage-comic nostalgia as the main content bet. The SERP is often looking for lore, not a workflow tutorial.",
  "Launching too many style pages before the main doodle page proves that the cluster can attract impressions and clicks.",
] as const;

const nextMoveCards = [
  {
    title: "Main meme workflow",
    href: "/learn/how-to-make-memes-online",
    body: "Go back to the anchor page if you want the broader workflow around caption control, delivery, and repeatability.",
  },
  {
    title: "Image Generation",
    href: "/capabilities/image-generation",
    body: "See the capability surface that powers the first-pass images and iterative style exploration.",
  },
  {
    title: "Install AnyCap",
    href: "/guides/install-anycap",
    body: "Use this when you want the shortest path from article to working CLI setup.",
  },
  {
    title: "Skills",
    href: "/skills",
    body: "See how a reusable skill turns this from a one-off prompt into a repeatable workflow.",
  },
  {
    title: "Easy Memes to Draw",
    href: "/learn/easy-memes-to-draw",
    body: "Go narrower if you want the beginner-friendly starter-sheet version of this style family.",
  },
  {
    title: "Bad Drawing Memes",
    href: "/learn/how-to-make-bad-drawing-memes",
    body: "Go deeper on the awkward-on-purpose variant when the joke depends on the art looking clumsy.",
  },
] as const;

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

export default function FunnyMemeDrawingsPage() {
  return (
    <>
      <BreadcrumbJsonLd items={pageChrome?.breadcrumbItems} />
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
              {pageChrome?.eyebrow ?? "Learn"}
            </p>
            <ArticleByline
              className="mb-3"
              author={pageChrome?.authorLabel}
              updatedLabel={`Last updated ${lastUpdatedLabel}`}
            />
            <h1
              className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(32px, 6vw, 72px)" }}
            >
              Funny meme drawings
              <br />
              are one of the best AI-agent fits
            </h1>
            <p className="mt-6 max-w-[820px] text-base leading-7 text-[#4d5145] md:text-lg">
              If you want funny meme drawings, the goal is not to recreate every old internet meme.
              The smarter move is to choose a repeatable visual preset, generate a few strong
              doodle-style variants, and only add exact copy when the joke needs it. That is where{" "}
              <Link
                href="/capabilities/image-generation"
                className="underline decoration-[#d4dbb8] underline-offset-2 transition-colors hover:text-[#6b7d3a] hover:decoration-[#6b7d3a]"
              >
                AnyCap image generation
              </Link>{" "}
              fits especially well around Codex, Cursor, and Claude Code.
            </p>
            <div className="mt-8 max-w-[860px] rounded-xl border border-[#d4dbb8] bg-[#f9faf5]/80 p-6">
              <p className="mb-3 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                Answer-first summary
              </p>
              <p className="text-sm leading-6 text-[#4d5145]">
                The strongest funny meme drawings workflow starts with `classic-doodle`, uses Nano
                Banana 2 for fast iteration, and treats the caption as optional until the image
                itself stops carrying the joke.
              </p>
            </div>
          </FadeIn>

          <FadeIn className="mt-8">
            <EarlyAccessBanner />
          </FadeIn>

          <FadeIn className="mt-10">
            <div className="overflow-hidden rounded-xl border border-[#d8dcd0] bg-[#fbfcf8]">
              <Image
                src={`${CDN_BASE}/learn-funny-meme-drawings-hero.webp`}
                alt="A funny meme drawing of an exhausted office goblin melting into a chair with a tiny coffee cup beside a chaotic desk."
                width={2400}
                height={1792}
                unoptimized
                className="h-auto w-full"
                priority
              />
            </div>
            <p className="mt-4 max-w-[760px] text-sm leading-6 text-[#4d5145]">
              This hero image was generated with Nano Banana 2 during the workflow build for this
              page. It is exactly the kind of low-fi, expressive visual that makes funny meme
              drawings more durable than trend-chasing meme-template pages.
            </p>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24 max-w-[940px]">
              <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                Quick answer
              </p>
              <h2 className="mt-3 text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                Use presets, not random prompt drift
              </h2>
              <p className="mt-6 text-base leading-7 text-[#4d5145]">
                Funny meme drawings become much easier to scale once you stop treating each image
                as a totally new art direction. A small preset library lets the skill, the article
                screenshots, and the search cluster reinforce each other.
              </p>
              <div className="mt-8 rounded-[24px] border border-[#d4dbb8] bg-[#f7f8ef]/70 p-6">
                <BulletList items={quickTakeaways} />
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                Style presets
              </p>
              <h2 className="mt-3 text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                Keep three styles. Build around one.
              </h2>
              <div className="mt-8 grid gap-4 xl:grid-cols-3">
                {presetCards.map((card) => (
                  <div key={card.title} className="rounded-[24px] border border-[#d4dbb8] bg-[#fffffc]/70 p-6">
                    <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                      {card.label}
                    </p>
                    <h3 className="mt-3 text-[20px] leading-7 text-[#1c1f17]" style={pixel}>
                      {card.title}
                    </h3>
                    <p className="mt-4 text-sm leading-6 text-[#4d5145]">{card.body}</p>
                    <div className="mt-5 space-y-2 text-sm leading-6 text-[#4d5145]">
                      <p>
                        <strong>Search fit:</strong> {card.searchFit}
                      </p>
                      <p>
                        <strong>Page role:</strong> {card.pageRole}
                      </p>
                    </div>
                    <div className="mt-5 rounded-xl bg-[#f7f8ef] p-4">
                      <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                        Prompt starter
                      </p>
                      <p className="text-sm leading-6 text-[#4d5145]">{card.prompt}</p>
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
              <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                Workflow
              </p>
              <h2 className="mt-3 text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                Five steps from preset to usable page asset
              </h2>
              <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                {workflowSteps.map((step, index) => (
                  <div key={step.title} className="rounded-[24px] border border-[#d4dbb8] bg-[#fffffc]/70 p-5">
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
              <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                Visual proof
              </p>
              <h2 className="mt-3 text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                One family of prompts can cover multiple article angles
              </h2>
              <div className="mt-8 overflow-hidden rounded-xl border border-[#d8dcd0] bg-[#fbfcf8]">
                <Image
                  src={`${CDN_BASE}/learn-funny-meme-drawings-collage.webp`}
                  alt="A three-panel collage of funny meme drawings showing classic doodle, awkward bad-drawing energy, and comic-panel reaction humor."
                  width={2752}
                  height={1536}
                  unoptimized
                  className="h-auto w-full"
                />
              </div>
              <p className="mt-4 max-w-[840px] text-sm leading-6 text-[#4d5145]">
                This collage was generated in the same live workflow and intentionally spans more
                than one preset family. That is the practical point of the cluster: one reliable
                capability path can support several article angles without turning into low-value
                template spam.
              </p>
              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {proofCards.map((card) => (
                  <div key={card.title} className="rounded-[24px] border border-[#d4dbb8] bg-[#fffffc]/70 p-5">
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
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                    Command examples
                  </p>
                  <h2 className="mt-3 text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                    Start with the preset that matches the joke
                  </h2>
                </div>
                <Link
                  href="/learn/how-to-make-memes-online"
                  className="text-sm text-[#6b7d3a] underline decoration-[#a7b57b] underline-offset-4"
                  style={mono}
                >
                  Need the broader workflow? Read How to Make Memes Online
                </Link>
              </div>
              <div className="mt-8 grid gap-4 xl:grid-cols-3">
                {commandExamples.map((example) => (
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
              <div className="grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.25fr)]">
                <div>
                  <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                    Common mistakes
                  </p>
                  <h2 className="mt-3 text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                    Most pages fail when they chase heat instead of workflow
                  </h2>
                </div>
                <div className="rounded-[24px] border border-[#d4dbb8] bg-[#f7f8ef]/70 p-6">
                  <BulletList items={commonMistakes} />
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
                Next step
              </p>
              <h2 className="mt-3 text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                Move from one style page into the broader cluster
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
                Common questions before you expand this style family
              </h2>
              <div className="mt-8 space-y-4">
                {faqItems.map((item) => (
                  <div key={item.question} className="rounded-[24px] border border-[#d4dbb8] bg-[#fffffc]/70 p-6">
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
