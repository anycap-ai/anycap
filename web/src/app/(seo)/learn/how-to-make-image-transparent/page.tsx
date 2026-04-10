import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { EarlyAccessBanner } from "@/components/landing/EarlyAccessBanner";
import { LearnProofShowcase } from "@/components/seo/LearnProofShowcase";
import { FadeIn } from "@/components/ui/FadeIn";
import { CommandCodeCard } from "@/components/ui/CommandCodeCard";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { getSeoPageChrome } from "@/lib/seo-ia";
import { createFaqPageJsonLd, createTechArticleJsonLd } from "@/lib/schema";
import { siteConfig } from "@/lib/site";

export const runtime = "edge";

const PAGE_RESOURCE_BASE = "https://cdn.anycap.ai/page_resource/learning";
const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;
const lastUpdatedLabel = "April 9, 2026";
const lastUpdatedIso = "2026-04-09";

const proofPrompt =
  "remove the entire desk background and return only the same running shoe as a clean product cutout on a transparent background, preserve the exact shoe shape, laces, sole texture, and stitching, remove the mug and plant completely, no floor shadow, no extra objects, blank label, no text, no watermark";

const proofImages = {
  source: {
    src: `${PAGE_RESOURCE_BASE}/how-to-make-image-transparent-source.webp`,
    alt: "Source product photo of an off-white running shoe sitting on a cluttered wooden desk near a plant and a coffee mug.",
    width: 2304,
    height: 1728,
    label: "Source image",
    frameVariant: "plain",
  },
  cutout: {
    src: `${PAGE_RESOURCE_BASE}/how-to-make-image-transparent-cutout-true-final.png`,
    alt: "Transparent PNG cutout of the same off-white running shoe with the background fully removed.",
    width: 2400,
    height: 1792,
    label: "Transparent PNG cutout",
    frameVariant: "checkerboard",
  },
} as const;

export const metadata: Metadata = {
  title: "How to Make an Image Transparent with an AI Agent",
  description:
    "Use AnyCap to turn an existing image into a transparent PNG-ready cutout, inspect the edges with image reading, and keep the asset reusable for product, docs, and content workflows.",
  alternates: { canonical: "/learn/how-to-make-image-transparent" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/learn/how-to-make-image-transparent",
    siteName: siteConfig.siteName,
    title: "How to Make an Image Transparent with an AI Agent",
    description:
      "A workflow guide for using AnyCap to remove a background, inspect the cutout, and keep the final asset reusable instead of stopping at a one-click remover.",
  },
};

const articleJsonLd = createTechArticleJsonLd({
  headline: "How to Make an Image Transparent with an AI Agent",
  description:
    "A practical workflow for turning an existing image into a transparent-background cutout through AnyCap image editing and image understanding.",
  path: "/learn/how-to-make-image-transparent",
  about: [
    "Transparent background",
    "Background removal",
    "Image editing",
    "Image understanding",
    "AI agents",
    "Product cutouts",
  ],
  keywords: [
    "make image transparent",
    "make background transparent",
    "transparent png",
    "remove background from image",
    "background remover workflow",
  ],
  datePublished: lastUpdatedIso,
  dateModified: lastUpdatedIso,
});

const faqItems = [
  {
    question: "Is making an image transparent the same as making the background white?",
    answer:
      "No. A transparent image keeps the background removed so the asset can sit on different surfaces later. A white background version is better when the destination needs a clean catalog or marketplace photo.",
  },
  {
    question: "Which AnyCap model should I use first for background removal?",
    answer:
      "Use Nano Banana Pro first when you already have a source image and want the subject preserved through an image-to-image edit. Use Nano Banana 2 when speed and multiple cleanup passes matter more than the strongest single revision. Use Seedream 5 only when you still need to create the source image itself.",
  },
  {
    question: "Why use an agent workflow instead of a one-click remover?",
    answer:
      "Because the job usually does not end at 'background removed.' You often need to inspect the edges, confirm there is no leftover clutter, make a white-background version for another channel, and reuse the asset across docs, pages, or product listings.",
  },
  {
    question: "Can AnyCap check whether the cutout actually looks clean?",
    answer:
      "Yes. After generation, you can use AnyCap image reading to inspect the result and ask whether the subject edges are intact, whether stray background fragments remain, and whether there is any visible text or watermark.",
  },
];

const faqJsonLd = createFaqPageJsonLd(faqItems);
const pageChrome = getSeoPageChrome("/learn/how-to-make-image-transparent");

const quickTakeaways = [
  "Most 'make image transparent' jobs are really subject extraction plus edge QA, not just one click on a remover site.",
  "The strongest AnyCap workflow is to revise the source image, inspect the output with image reading, and keep the final file reusable as a PNG-ready cutout.",
  "The same workflow can branch into a white-background version, a replacement-background version, or a clean product asset for docs and listings.",
] as const;

const validationCards = [
  {
    title: "Capability surface confirmed",
    body: "During page production on April 9, 2026, a live AnyCap status check confirmed image generation, image editing, image reading, Drive, Page, and web retrieval were available in the current environment.",
  },
  {
    title: "Schema confirmed",
    body: "Nano Banana Pro and Nano Banana 2 were checked against the live schema, and the current image-to-image flow uses the `images` parameter instead of older prompt guesses.",
  },
  {
    title: "Proof images generated",
    body: "The source image and cutout shown on this page were generated during the live workflow through AnyCap rather than mocked after the fact in a separate design tool.",
  },
  {
    title: "Output inspected",
    body: "The final cutout file was verified as an RGBA PNG with a real alpha channel, then composited onto a light background and checked through image reading to confirm the edge looked clean without a visible green halo.",
  },
] as const;

const workflowSteps = [
  {
    title: "Start with the real source image",
    body: "Use the product photo, screenshot, or visual draft you actually want to reuse. The higher-fit job here is cutout cleanup, not generating a random replacement subject.",
  },
  {
    title: "Ask for a transparent-background cutout",
    body: "Run an image-to-image edit that preserves the subject but removes the surrounding desk, room, or scene. The prompt should say what must stay, not only what should disappear.",
  },
  {
    title: "Inspect the edges with image reading",
    body: "Check for leftover fragments around hair, laces, fingers, glass, or packaging edges. The point is not only that the background is gone, but that the subject still looks usable.",
  },
  {
    title: "Branch into the version the destination needs",
    body: "From the same source, you can keep the transparent cutout, make a white-background marketplace image, or replace the background entirely for a new context.",
  },
  {
    title: "Reuse the asset in the next workflow",
    body: "Keep the output local for docs and page work, or hand it off to another AnyCap step when you need storage, page publishing, or a follow-on image revision.",
  },
] as const;

const backgroundCards = [
  {
    title: "Transparent background",
    body: "Best when the same asset needs to land on multiple surfaces later, such as docs, decks, product listings, or page layouts with their own background treatment.",
  },
  {
    title: "White background",
    body: "Best when the destination wants a marketplace-style image, a catalog look, or a clean studio result where transparency adds no extra value.",
  },
] as const;

const comparisonRows = [
  {
    lens: "What counts as success",
    shallow: "The export button worked.",
    workflow: "The subject is isolated cleanly, the edges still hold up, and the asset is usable in the next step.",
  },
  {
    lens: "Quality control",
    shallow: "You eyeball it once and hope the crop is good enough.",
    workflow: "The agent can inspect the cutout and catch leftover background fragments or awkward edge damage.",
  },
  {
    lens: "Follow-on edits",
    shallow: "You often need to restart in another tool for a white background or a new scene.",
    workflow: "The same AnyCap image-edit loop can branch into transparent, white-background, or replacement-background versions.",
  },
  {
    lens: "Reusability",
    shallow: "The output is treated like a final download.",
    workflow: "The asset stays inside a broader agent workflow for docs, listings, publishing, and later revisions.",
  },
] as const;

const modelCards = [
  {
    title: "Nano Banana Pro",
    label: "Best first choice for cutouts",
    body: "Use this when the source image already exists and the real job is to preserve the subject while cleaning or removing the background.",
    href: "/models/nano-banana-pro",
  },
  {
    title: "Nano Banana 2",
    label: "Best for faster iteration",
    body: "Use this when you want multiple cleanup passes quickly or when the workflow may branch into several product or content variants.",
    href: "/models/nano-banana-2",
  },
  {
    title: "Seedream 5",
    label: "Best when you still need the source image",
    body: "Use this when there is no starting asset yet and you want a stronger first-pass product image before the cutout workflow begins.",
    href: "/models/seedream-5",
  },
] as const;

const codeExamples = [
  {
    title: "Create a transparent cutout",
    code: `anycap image generate \\
  --model nano-banana-pro \\
  --mode image-to-image \\
  --prompt "remove the background and return only the same subject on a transparent background, preserve the exact shape and edges, no extra objects, no text, no watermark" \\
  --param images=./source-product.png \\
  --param aspect_ratio=4:3 \\
  --param resolution=2k \\
  -o transparent-cutout.png`,
  },
  {
    title: "Create a white-background version from the same source",
    code: `anycap image generate \\
  --model nano-banana-pro \\
  --mode image-to-image \\
  --prompt "replace the background with a clean white studio backdrop, preserve the exact subject and edges, centered marketplace-ready product photo, no text, no watermark" \\
  --param images=./source-product.png \\
  --param aspect_ratio=4:3 \\
  --param resolution=2k \\
  -o white-background-product.png`,
  },
  {
    title: "QA the cutout with image reading",
    code: `anycap actions image-read \\
  --file ./transparent-cutout.png \\
  --instruction "Describe the image, say whether the subject edges look clean, and mention any leftover background fragments, visible text, or watermark."`,
  },
] as const;

const nextMoveCards = [
  {
    title: "How to Change a Photo Background",
    href: "/learn/how-to-change-photo-background",
    body: "Move here when the next step is replacing the removed background with a studio, pedestal, or contextual scene.",
  },
  {
    title: "How to Make Background White for Product Photos",
    href: "/learn/how-to-make-background-white-for-product-photos",
    body: "Use this follow-on workflow when the transparent cutout needs to become a marketplace or catalog-style white-background asset.",
  },
  {
    title: "Nano Banana Pro",
    href: "/models/nano-banana-pro",
    body: "Go deeper on the model that currently fits the strongest subject-preserving cutout workflow.",
  },
  {
    title: "Install AnyCap",
    href: "/guides/install-anycap",
    body: "Move here when you want the shortest path from this page to a working CLI setup.",
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

export default function HowToMakeImageTransparentPage() {
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
            <p className="mb-3 text-[11px] tracking-[0.5px] text-[#5a5e52]" style={mono}>
              Last updated {lastUpdatedLabel}
            </p>
            <h1
              className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(32px, 6vw, 72px)" }}
            >
              How to make an image transparent
              <br />
              without treating it like a dead-end export
            </h1>
            <p className="mt-6 max-w-[820px] text-base leading-7 text-[#4d5145] md:text-lg">
              If you are trying to make an image transparent, the useful question is not whether
              another background remover exists. It is whether your agent can isolate the subject,
              inspect the edges, and keep the final asset reusable for docs, product pages, and
              content workflows. That is where{" "}
              <Link
                href="/capabilities/image-generation"
                className="underline decoration-[#d4dbb8] underline-offset-2 transition-colors hover:text-[#6b7d3a] hover:decoration-[#6b7d3a]"
              >
                AnyCap image generation
              </Link>{" "}
              plus{" "}
              <Link
                href="/capabilities/image-understanding"
                className="underline decoration-[#d4dbb8] underline-offset-2 transition-colors hover:text-[#6b7d3a] hover:decoration-[#6b7d3a]"
              >
                image understanding
              </Link>{" "}
              changes the workflow.
            </p>
            <div className="mt-8 max-w-[860px] rounded-xl border border-[#d4dbb8] bg-[#f9faf5]/80 p-6">
              <p className="mb-3 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                Answer-first summary
              </p>
              <p className="text-sm leading-6 text-[#4d5145]">
                A useful transparent-image workflow is not only background removal. It is subject
                extraction, edge inspection, and output reuse. AnyCap helps the agent run that
                loop in one place: edit the image, inspect the result, and branch into the exact
                version the destination needs, whether that is a transparent cutout or a white
                background variant.
              </p>
            </div>
          </FadeIn>

          <FadeIn className="mt-8">
            <EarlyAccessBanner />
          </FadeIn>

          <FadeIn className="mt-10">
            <LearnProofShowcase
              title="Source image in, transparent cutout out"
              intro="This page uses a real before-and-after proof block instead of stock art. The left frame is the source image. The right frame is a real transparent PNG generated from that same source asset so the isolation step is visible at a glance."
              promptLabel="Edit prompt used with AnyCap"
              prompt={proofPrompt}
              images={[proofImages.source, proofImages.cutout]}
              signals={[
                "It turns the page's main claim into something visual: background removal is more useful when the subject still looks clean enough to reuse.",
                "The checkerboard preview makes the subject-isolation step legible instead of forcing the reader to imagine what changed.",
                "It shows why the AnyCap workflow is not only one export step, but also a QA and reuse step.",
              ]}
              caption="The left image is the source draft. The right image is the final transparent PNG cutout generated from that same source asset for this page."
              priorityFirstImage
            />
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
                The practical answer is extraction plus QA
              </h2>
              <p className="mt-6 text-base leading-7 text-[#4d5145]">
                Making an image transparent is usually framed as a button click. In practice, the
                useful part is whether the subject survives the cleanup well enough to be reused in
                the next step. That is why the better workflow is extraction plus inspection, not
                export alone.
              </p>
              <div className="mt-8 rounded-[24px] border border-[#d4dbb8] bg-[#f7f8ef]/70 p-6">
                <BulletList items={quickTakeaways} />
              </div>
              <div className="mt-8 grid gap-4 md:grid-cols-2">
                {backgroundCards.map((card) => (
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
                Workflow
              </p>
              <h2 className="mt-3 text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                Five steps from source image to reusable asset
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
              <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                Comparison
              </p>
              <h2 className="mt-3 text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                Why this is stronger than a one-click remover mindset
              </h2>
              <div className="mt-8 grid gap-4 md:grid-cols-2">
                {comparisonRows.map((row) => (
                  <div key={row.lens} className="rounded-[24px] border border-[#d4dbb8] bg-[#fffffc]/70 p-6">
                    <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                      {row.lens}
                    </p>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <div className="rounded-2xl border border-[#e1e5d2] bg-[#fbfcf8] p-4">
                        <p className="text-[11px] tracking-[0.5px] text-[#5a5e52]" style={mono}>
                          Shallow default
                        </p>
                        <p className="mt-3 text-sm leading-6 text-[#4d5145]">{row.shallow}</p>
                      </div>
                      <div className="rounded-2xl border border-[#c9d4a9] bg-[#f4f8e7] p-4">
                        <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                          AnyCap workflow
                        </p>
                        <p className="mt-3 text-sm leading-6 text-[#4d5145]">{row.workflow}</p>
                      </div>
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
                Model choice
              </p>
              <h2 className="mt-3 text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                Pick the model based on where the job starts
              </h2>
              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {modelCards.map((card) => (
                  <Link
                    key={card.href}
                    href={card.href}
                    className="block rounded-[24px] border border-[#d4dbb8] bg-[#fffffc]/70 p-5 transition-colors hover:border-[#6b7d3a]"
                  >
                    <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                      {card.label}
                    </p>
                    <h3 className="mt-3 text-[18px] leading-7 text-[#1c1f17]" style={pixel}>
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
                First-hand validation
              </p>
              <h2 className="mt-3 text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                What we checked on the live workflow
              </h2>
              <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {validationCards.map((card) => (
                  <div
                    key={card.title}
                    className="rounded-[24px] border border-[#d4dbb8] bg-[#fffffc]/70 p-5"
                  >
                    <h3 className="text-[15px] leading-6 text-[#1c1f17]" style={mono}>
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
                CLI examples
              </p>
              <h2 className="mt-3 text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                Example commands that match the current schema
              </h2>
              <div className="mt-8 grid gap-4 lg:grid-cols-3">
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
            <section className="mt-16 md:mt-24 max-w-[900px]">
              <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                FAQ
              </p>
              <h2 className="mt-3 text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                Questions that usually come up next
              </h2>
              <div className="mt-8 space-y-4">
                {faqItems.map((item) => (
                  <div
                    key={item.question}
                    className="rounded-[24px] border border-[#d4dbb8] bg-[#fffffc]/70 p-6"
                  >
                    <h3 className="text-[16px] leading-6 text-[#1c1f17]" style={mono}>
                      {item.question}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-[#4d5145]">{item.answer}</p>
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
                Next move
              </p>
              <h2 className="mt-3 text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                Go deeper from the workflow that fits
              </h2>
              <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {nextMoveCards.map((card) => (
                  <Link
                    key={card.href}
                    href={card.href}
                    className="block rounded-[24px] border border-[#d4dbb8] bg-[#fffffc]/70 p-5 transition-colors hover:border-[#6b7d3a]"
                  >
                    <h3 className="text-[18px] leading-7 text-[#1c1f17]" style={pixel}>
                      {card.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-[#4d5145]">{card.body}</p>
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
