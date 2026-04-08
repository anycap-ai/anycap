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
const CDN_VERSION = "20260408";
const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;
const lastUpdatedLabel = "April 8, 2026";
const lastUpdatedIso = "2026-04-08";

export const metadata: Metadata = {
  title: "How to Make Bad Drawing Memes with an AI Agent",
  description:
    "Use AnyCap and Nano Banana 2 to make bad drawing memes on purpose, keep the awkward style readable, and turn poorly drawn joke ideas into repeatable page-ready visuals.",
  alternates: { canonical: "/learn/how-to-make-bad-drawing-memes" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/learn/how-to-make-bad-drawing-memes",
    siteName: siteConfig.siteName,
    title: "How to Make Bad Drawing Memes with an AI Agent",
    description:
      "A style-specific workflow guide for making bad drawing memes with AnyCap, from intentionally awkward prompts to final caption-safe visuals.",
  },
};

const articleJsonLd = createTechArticleJsonLd({
  headline: "How to Make Bad Drawing Memes with an AI Agent",
  description:
    "A practical guide to making bad drawing memes with AnyCap, using Nano Banana 2 to keep the awkward style funny on purpose instead of just sloppy.",
  path: "/learn/how-to-make-bad-drawing-memes",
  about: [
    "Bad drawing memes",
    "Poorly drawn memes",
    "Funny meme drawings",
    "AI agents",
    "Image generation",
    "Nano Banana 2",
  ],
  keywords: [
    "bad drawing meme",
    "poorly drawn meme",
    "how to make bad drawing memes",
    "badly drawn memes",
    "funny meme drawings",
  ],
  datePublished: lastUpdatedIso,
  dateModified: lastUpdatedIso,
});

const faqItems = [
  {
    question: "What makes a bad drawing meme funny instead of just messy?",
    answer:
      "The joke still needs one clear emotional read. Bad drawing memes work when the anatomy is awkward on purpose, the expression is obvious, and the scene stays simple enough to understand immediately.",
  },
  {
    question: "Should this be a bigger page than funny meme drawings?",
    answer:
      "No. Bad drawing meme is better as a supporting style page. Live SERP checks on April 8, 2026 leaned toward Pinterest, Reddit, and meme archives, so the right page shape is a style explainer with workflow proof, not a giant hub.",
  },
  {
    question: "Is Nano Banana 2 the best first model here?",
    answer:
      "Yes. Bad drawing memes usually benefit more from fast variation and prompt iteration than from high-polish realism, so Nano Banana 2 is the best first pass.",
  },
  {
    question: "Do I still need deterministic captions for badly drawn memes?",
    answer:
      "Only when the exact wording matters. If the face and situation already carry the joke, publish the image alone. If the punchline needs precise text, add it after generation.",
  },
];

const faqJsonLd = createFaqPageJsonLd(faqItems);

const quickTakeaways = [
  "Bad drawing memes work when the awkwardness feels intentional, not when the image becomes unreadable.",
  "This query is best served by a style-specific supporting page because the live SERP is dominated by inspiration boards, community examples, and meme archives.",
  "Nano Banana 2 is the right first model because you want fast weird variants, not polished illustration.",
] as const;

const styleSignals = [
  {
    title: "Uneven lines",
    body: "Let the outline wobble. Straight clean vector-style lines usually kill the charm of this format.",
  },
  {
    title: "Overcommitted emotion",
    body: "The face should look more dramatic than the situation deserves. Tiny stakes with huge emotion is a reliable bad-drawing meme pattern.",
  },
  {
    title: "Too-simple anatomy",
    body: "Limbs can look wrong, proportions can drift, and posture can feel clumsy, but the silhouette still has to read at a glance.",
  },
  {
    title: "Caption-safe emptiness",
    body: "Keep white space around the character. A crowded background makes the style look accidentally low quality instead of deliberately funny.",
  },
] as const;

const workflowSteps = [
  {
    title: "Pick one tiny disaster",
    body: "Bad drawing memes are strongest when the scenario is small and relatable: a spilled drink, a typo, a missed notification, or a dramatic overreaction to a routine task.",
  },
  {
    title: "Prompt for clumsy style on purpose",
    body: "Tell the model to keep the lines uneven, the anatomy awkward, and the emotion exaggerated. Do not leave the badness implied.",
  },
  {
    title: "Generate several close variants",
    body: "The first image is rarely the funniest. Make three to five versions and choose the one where the expression lands fastest.",
  },
  {
    title: "Check readability at small size",
    body: "If the character turns into noisy scribbles at thumbnail size, the image is too chaotic for a meme page.",
  },
  {
    title: "Add text only if the image still needs it",
    body: "Keep the output caption-free when the face is enough. If wording matters, add the final line after generation so it stays exact.",
  },
] as const;

const proofCards = [
  {
    title: "SERP shape checked live",
    body: "On April 8, 2026, live results for `bad drawing meme` and `poorly drawn meme` were dominated by Pinterest, Reddit, Tenor, Imgflip, and meme archives rather than product pages.",
  },
  {
    title: "Page type chosen deliberately",
    body: "Because of that SERP mix, this page is written as a style explainer with workflow proof instead of pretending to be a full template library.",
  },
  {
    title: "Images generated for the page",
    body: "The hero and collage on this page were generated with Nano Banana 2 for this workflow and stored as page assets instead of being backfilled later.",
  },
] as const;

const commandExamples = [
  {
    title: "Generate a bad drawing meme hero",
    code: `anycap image generate \\
  --model nano-banana-2 \\
  --prompt "bad drawing meme, intentionally awkward internet doodle, off-white paper, one lumpy crying face reacting to a tiny spilled coffee like it is a personal catastrophe, uneven sketch lines, clumsy anatomy, exaggerated emotion, minimal background, large empty caption-safe space, no words, no letters, no watermark" \\
  --param aspect_ratio=4:3 \\
  --param resolution=2k \\
  -o learn-how-to-make-bad-drawing-memes-hero.png`,
  },
  {
    title: "Generate a multi-style badly drawn collage",
    code: `anycap image generate \\
  --model nano-banana-2 \\
  --prompt "three-panel collage of bad drawing memes, left panel crying scribble face with overly dramatic tears, middle panel awkward cute blocky character asking where is my art with empty speech area but no readable text, right panel round face on paper with tiny legs and earrings, all intentionally badly drawn, uneven hand-drawn lines, off-white paper textures, minimal backgrounds, internet meme energy, no words, no letters, no watermark" \\
  --param aspect_ratio=16:9 \\
  --param resolution=2k \\
  -o learn-how-to-make-bad-drawing-memes-collage.png`,
  },
  {
    title: "QA if the chaos is still readable",
    code: `anycap actions image-read \\
  --file ./learn-how-to-make-bad-drawing-memes-hero.png \\
  --instruction "Describe the character emotion, note whether any accidental letters appeared, and say whether the image still reads clearly at thumbnail size."`,
  },
] as const;

const commonMistakes = [
  "Making the style too polished so the page starts looking like a normal illustration tutorial.",
  "Making the lines so chaotic that the character stops reading immediately.",
  "Copying canonical old meme faces too closely instead of using adjacent bad-drawing energy.",
  "Treating this query like a broad meme-maker page when the SERP is really asking for examples and style guidance.",
] as const;

const nextMoveCards = [
  {
    title: "Funny Meme Drawings",
    href: "/learn/funny-meme-drawings",
    body: "Go broader when you want the full preset system behind doodle memes, bad-drawing variants, and adjacent styles.",
  },
  {
    title: "Easy Memes to Draw",
    href: "/learn/easy-memes-to-draw",
    body: "Go simpler if the searcher needs beginner-friendly ideas before they are ready for deliberate ugly style.",
  },
  {
    title: "Main meme workflow",
    href: "/learn/how-to-make-memes-online",
    body: "Return to the cluster anchor when you want the full workflow around caption control, delivery, and repeatability.",
  },
  {
    title: "Image Generation",
    href: "/capabilities/image-generation",
    body: "See the capability surface that powers the first-pass sketches and fast variant generation.",
  },
  {
    title: "Install AnyCap",
    href: "/guides/install-anycap",
    body: "Use this when you want the shortest path from page idea to a working CLI setup.",
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

export default function HowToMakeBadDrawingMemesPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Learn", href: "/learn", unlinkable: true },
          { name: "How to make bad drawing memes" },
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
              How to make bad drawing memes
              <br />
              that look funny on purpose
            </h1>
            <p className="mt-6 max-w-[840px] text-base leading-7 text-[#4d5145] md:text-lg">
              If you want to make bad drawing memes, the goal is not to make the image fail. The
              goal is to make the awkwardness look intentional, readable, and emotionally obvious.
              That is exactly why this style works well with{" "}
              <Link
                href="/capabilities/image-generation"
                className="underline decoration-[#d4dbb8] underline-offset-2 transition-colors hover:text-[#6b7d3a] hover:decoration-[#6b7d3a]"
              >
                AnyCap image generation
              </Link>{" "}
              and fast prompt iteration in Codex, Cursor, or Claude Code.
            </p>
            <div className="mt-8 max-w-[880px] rounded-xl border border-[#d4dbb8] bg-[#f9faf5]/80 p-6">
              <p className="mb-3 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                Answer-first summary
              </p>
              <p className="text-sm leading-6 text-[#4d5145]">
                The best bad drawing memes use one very clear expression, deliberately clumsy
                anatomy, and a small absurd scenario. Generate a few ugly-on-purpose variants,
                keep the background clean, and only add exact copy after the image is locked.
              </p>
            </div>
          </FadeIn>

          <FadeIn className="mt-8">
            <EarlyAccessBanner />
          </FadeIn>

          <FadeIn className="mt-10">
            <div className="overflow-hidden rounded-xl border border-[#d8dcd0] bg-[#fbfcf8]">
              <Image
                src={`${CDN_BASE}/learn-how-to-make-bad-drawing-memes-hero.webp?v=${CDN_VERSION}`}
                alt="An intentionally awkward bad drawing meme showing a lumpy crying face overreacting to a tiny spilled coffee on off-white paper."
                width={2400}
                height={1792}
                unoptimized
                className="h-auto w-full"
                priority
              />
            </div>
            <p className="mt-4 max-w-[780px] text-sm leading-6 text-[#4d5145]">
              This hero visual was generated with Nano Banana 2 for this page. It is deliberately
              crude, but the expression still lands instantly, which is the whole point of the
              format.
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
                Make the art worse. Keep the read clearer.
              </h2>
              <p className="mt-6 text-base leading-7 text-[#4d5145]">
                Live results for this topic lean heavily toward inspiration boards, meme archives,
                and community examples. That means the page wins by explaining the style clearly,
                showing repeatable outputs, and then linking readers back into the broader meme
                workflow instead of pretending to be a canonical meme database.
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
                Style signals
              </p>
              <h2 className="mt-3 text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                Four things that make a bad drawing look intentional
              </h2>
              <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {styleSignals.map((card) => (
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
              <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                Workflow
              </p>
              <h2 className="mt-3 text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                Five steps from ugly sketch to usable meme asset
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
                One ugly-on-purpose workflow can support several joke angles
              </h2>
              <div className="mt-8 overflow-hidden rounded-xl border border-[#d8dcd0] bg-[#fbfcf8]">
                <Image
                  src={`${CDN_BASE}/learn-how-to-make-bad-drawing-memes-collage.webp?v=${CDN_VERSION}`}
                  alt="A three-panel collage of bad drawing memes with a crying scribble face, an awkward cute character, and a round face on paper with tiny legs."
                  width={2752}
                  height={1536}
                  unoptimized
                  className="h-auto w-full"
                />
              </div>
              <p className="mt-4 max-w-[860px] text-sm leading-6 text-[#4d5145]">
                This collage stays within the same bad-drawing family without copying any one old
                meme template directly. That is the safer and more durable way to build this part
                of the cluster.
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
                    Prompt the awkwardness directly
                  </h2>
                </div>
                <Link
                  href="/learn/funny-meme-drawings"
                  className="text-sm text-[#6b7d3a] underline decoration-[#a7b57b] underline-offset-4"
                  style={mono}
                >
                  Need the broader preset logic? Read Funny Meme Drawings
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
                    The page breaks when ugly becomes unreadable
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
                Move from one ugly style page back into the full cluster
              </h2>
              <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
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
                Common questions before you publish badly drawn meme pages
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
