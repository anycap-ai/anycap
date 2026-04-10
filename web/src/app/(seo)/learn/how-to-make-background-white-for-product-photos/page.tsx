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
  "preserve the same off-white running shoe, replace the desk, notebook, mug, plant, and window with a seamless pure white studio background, centered ecommerce product photo, soft grounded shadow, clean edge separation, realistic materials, no text, no watermark";

const proofImages = {
  source: {
    src: `${PAGE_RESOURCE_BASE}/how-to-make-image-transparent-source.webp`,
    alt: "Source product photo of an off-white running shoe sitting on a cluttered wooden desk near a plant and a coffee mug.",
    width: 2304,
    height: 1728,
    label: "Source image",
    frameVariant: "plain",
  },
  white: {
    src: `${PAGE_RESOURCE_BASE}/how-to-make-background-white-product-result-1600.png`,
    alt: "The same off-white running shoe centered on a seamless white studio background with a soft shadow for a catalog-style product photo.",
    width: 1600,
    height: 1195,
    label: "White-background result",
    frameVariant: "plain",
  },
} as const;

export const metadata: Metadata = {
  title: "How to Make Background White for Product Photos with an AI Agent",
  description:
    "Use AnyCap to turn a cluttered product photo into a white-background listing image while preserving the original subject and checking the result before export.",
  alternates: { canonical: "/learn/how-to-make-background-white-for-product-photos" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/learn/how-to-make-background-white-for-product-photos",
    siteName: siteConfig.siteName,
    title: "How to Make Background White for Product Photos with an AI Agent",
    description:
      "A workflow guide for turning an existing product photo into a white-background listing image through AnyCap without losing the original subject.",
  },
};

const articleJsonLd = createTechArticleJsonLd({
  headline: "How to Make Background White for Product Photos with an AI Agent",
  description:
    "A practical workflow for converting an existing product photo into a white-background catalog image through AnyCap image editing.",
  path: "/learn/how-to-make-background-white-for-product-photos",
  about: [
    "White background",
    "Product photos",
    "Catalog images",
    "Ecommerce editing",
    "AI agents",
  ],
  keywords: [
    "make background white for product photos",
    "white background product photo",
    "product photo white background",
    "ecommerce product image background",
    "marketplace-ready product photo",
  ],
  datePublished: lastUpdatedIso,
  dateModified: lastUpdatedIso,
});

const faqItems = [
  {
    question: "When is a white background better than transparency?",
    answer:
      "Use white when the destination is catalog, marketplace, or another channel that expects a clean product image with no styling decisions left open. Use transparency when the asset still needs to sit on several different surfaces later.",
  },
  {
    question: "When is a white background better than a styled studio scene?",
    answer:
      "Use white when consistency, compliance, or visual neutrality matters more than mood. Use a styled scene when the page needs more editorial framing or a stronger product-story signal.",
  },
  {
    question: "Which AnyCap model should I use first for white-background product edits?",
    answer:
      "Use Nano Banana Pro first when the source product photo already exists and the job is to preserve the original item while simplifying the environment. Use Nano Banana 2 when you want faster iteration or several listing variants. Use Seedream 5 when you still need the original product photo before cleanup starts.",
  },
  {
    question: "Can AnyCap help inspect whether the result still looks marketplace-ready?",
    answer:
      "Yes. After generation, you can use AnyCap image reading to check whether the same product is preserved, whether the edges still look clean, and whether any visible text or watermark was introduced.",
  },
];

const faqJsonLd = createFaqPageJsonLd(faqItems);
const pageChrome = getSeoPageChrome("/learn/how-to-make-background-white-for-product-photos");

const quickTakeaways = [
  "White-background product photos are usually about channel fit, not aesthetics alone.",
  "The strong workflow is to preserve the original product while removing the desk, room, and lifestyle clutter around it.",
  "The same source image can still branch into white-background, transparent, or styled-scene versions depending on the destination.",
] as const;

const validationCards = [
  {
    title: "Capability surface confirmed",
    body: "During page production on April 9, 2026, a live AnyCap status check confirmed image generation, image editing, and image reading were available in the current environment.",
  },
  {
    title: "Schema confirmed",
    body: "Nano Banana Pro's live image-to-image schema was checked and the current source-asset parameter is `images`.",
  },
  {
    title: "Proof pair generated",
    body: "The before-and-after images on this page were generated through AnyCap from the same source product photo rather than assembled from unrelated examples.",
  },
  {
    title: "Result inspected",
    body: "Image reading was used to confirm the white-background result preserved the same shoe and did not introduce visible text or watermark artifacts.",
  },
] as const;

const workflowSteps = [
  {
    title: "Start with the real product image",
    body: "Use the product photo that already matters to your listing, doc, or catalog flow. This is not the best place to regenerate the subject from scratch.",
  },
  {
    title: "Ask for white background specifically",
    body: "Say `white studio background` or `marketplace-ready product photo` directly. White should be an explicit requirement, not a vague cleanup guess.",
  },
  {
    title: "Keep the product identity stable",
    body: "Repeat the subject-preservation constraint so the model treats the item as fixed while simplifying only the surroundings around it.",
  },
  {
    title: "Check edges and shadow behavior",
    body: "The result should feel clean without looking cut out badly. Keep an eye on laces, soles, packaging edges, and whether the grounded shadow still feels plausible.",
  },
  {
    title: "Export the version the channel expects",
    body: "From the same source, you can still branch into transparent or styled versions later, but the white-background listing image should stay the most neutral output in the set.",
  },
] as const;

const comparisonRows = [
  {
    lens: "Destination fit",
    shallow: "The product looks cleaner, but the page does not say why white matters.",
    workflow: "The page explains that white is usually the right lane for catalog, marketplace, and compliance-style image slots.",
  },
  {
    lens: "What changes",
    shallow: "The tool edits the image without a strong constraint on preserving the product.",
    workflow: "The subject stays anchored while the cluttered environment is replaced by a neutral white setup.",
  },
  {
    lens: "Asset reuse",
    shallow: "The edited photo becomes a one-off export.",
    workflow: "The same source can branch into white, transparent, or styled-scene variants depending on the next channel.",
  },
  {
    lens: "QA standard",
    shallow: "The background is white, so the job feels done.",
    workflow: "The agent also checks subject consistency, edge quality, and whether the result still looks product-grade.",
  },
] as const;

const optionCards = [
  {
    title: "Marketplace slots",
    body: "Best when the destination wants simple, consistent product images that minimize styling differences across a catalog.",
  },
  {
    title: "Internal product docs",
    body: "Best when the image should stay neutral and easy to reuse in docs, specs, or other operational material.",
  },
  {
    title: "Comparison pages",
    body: "Best when the image needs to sit beside several other products without one of them carrying a much more styled background treatment.",
  },
] as const;

const modelCards = [
  {
    title: "Nano Banana Pro",
    label: "Best first choice for listing cleanup",
    body: "Use this when the source photo already exists and the main job is to preserve the product while converting the scene into a neutral white setup.",
    href: "/models/nano-banana-pro",
  },
  {
    title: "Nano Banana 2",
    label: "Best for faster listing variants",
    body: "Use this when you want a quicker loop across several white-background directions or slightly different product framings.",
    href: "/models/nano-banana-2",
  },
  {
    title: "Seedream 5",
    label: "Best when the source photo is still missing",
    body: "Use this when you need the original product image first and only then want to branch into white-background cleanup.",
    href: "/models/seedream-5",
  },
] as const;

const codeExamples = [
  {
    title: "Convert a source photo into a white-background listing image",
    code: `anycap image generate \\
  --model nano-banana-pro \\
  --mode image-to-image \\
  --prompt "preserve the same product, replace the room with a pure white studio background, centered ecommerce product photo, soft grounded shadow, no text, no watermark" \\
  --param images=./source-product.png \\
  --param aspect_ratio=4:3 \\
  --param resolution=2k \\
  -o white-background-product.png`,
  },
  {
    title: "Branch from the same source into a transparent version",
    code: `anycap image generate \\
  --model nano-banana-pro \\
  --mode image-to-image \\
  --prompt "remove the background and keep only the same product as a clean cutout preview, preserve edges and materials, no text, no watermark" \\
  --param images=./source-product.png \\
  --param aspect_ratio=4:3 \\
  --param resolution=2k \\
  -o transparent-product-cutout.png`,
  },
  {
    title: "QA the white-background result",
    code: `anycap actions image-read \\
  --file ./white-background-product.png \\
  --instruction "Describe the image, confirm whether the same product is preserved, and mention any visible text, watermark, or edge problems."`,
  },
] as const;

const nextMoveCards = [
  {
    title: "How to Change a Photo Background",
    href: "/learn/how-to-change-photo-background",
    body: "Use this broader workflow when the target is a studio scene or a contextual replacement instead of pure white.",
  },
  {
    title: "How to Make an Image Transparent",
    href: "/learn/how-to-make-image-transparent",
    body: "Use this when the destination wants the product isolated for reuse across several different layouts later.",
  },
  {
    title: "Nano Banana Pro",
    href: "/models/nano-banana-pro",
    body: "Go deeper on the model that currently fits the strongest source-preserving revision loop for product cleanup.",
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

export default function HowToMakeBackgroundWhiteForProductPhotosPage() {
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
              How to make background white
              <br />
              for product photos
            </h1>
            <p className="mt-6 max-w-[820px] text-base leading-7 text-[#4d5145] md:text-lg">
              If the destination is marketplace, catalog, or another compliance-style image slot,
              the question is usually not whether the photo can be made prettier. It is whether the
              product can be preserved while the surrounding lifestyle clutter is replaced by a
              neutral white setup. That is where{" "}
              <Link
                href="/capabilities/image-generation"
                className="underline decoration-[#d4dbb8] underline-offset-2 transition-colors hover:text-[#6b7d3a] hover:decoration-[#6b7d3a]"
              >
                AnyCap image generation
              </Link>{" "}
              gives the agent a cleaner product-photo workflow.
            </p>
            <div className="mt-8 max-w-[860px] rounded-xl border border-[#d4dbb8] bg-[#f9faf5]/80 p-6">
              <p className="mb-3 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                Answer-first summary
              </p>
              <p className="text-sm leading-6 text-[#4d5145]">
                A useful white-background workflow keeps the original product and simplifies only
                the environment around it. AnyCap helps the agent edit from the source photo,
                inspect the result, and keep the output aligned with channels that expect a neutral
                product image instead of an editorial scene.
              </p>
            </div>
          </FadeIn>

          <FadeIn className="mt-8">
            <EarlyAccessBanner />
          </FadeIn>

          <FadeIn className="mt-10">
            <LearnProofShowcase
              title="One source product photo, one white-background listing version"
              intro="This page uses a real before-and-after proof pair. The left frame is the cluttered desk photo. The right frame is the AnyCap revision that keeps the same shoe but converts the environment into a white-background listing image."
              promptLabel="Edit prompt used with AnyCap"
              prompt={proofPrompt}
              images={[proofImages.source, proofImages.white]}
              signals={[
                "It shows why white-background cleanup is a narrower job than generic background replacement.",
                "The proof pair makes the marketplace-style use case concrete instead of leaving the page at the level of abstract advice.",
                "It demonstrates that the agent can move from a lived-in source photo to a cleaner catalog-style result without swapping the product identity.",
              ]}
              caption="The left image is the source product photo. The right image is the AnyCap white-background revision generated from that same source asset for this page."
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
                White background is a channel decision
              </h2>
              <p className="mt-6 text-base leading-7 text-[#4d5145]">
                A white-background product image is usually not about making the photo more
                dramatic. It is about meeting the expectations of a channel that wants neutral,
                repeatable, easy-to-compare product visuals. That is why this workflow is narrower
                than a general background changer.
              </p>
              <div className="mt-8 rounded-[24px] border border-[#d4dbb8] bg-[#f7f8ef]/70 p-6">
                <BulletList items={quickTakeaways} />
              </div>
              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {optionCards.map((card) => (
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
                Five steps from lifestyle source to listing image
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
                Why this is different from generic cleanup
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
                Pick the model based on where the cleanup starts
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
                Example commands for white-background product cleanup
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
                Questions that usually come next
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
                Move into the workflow the channel actually needs
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
