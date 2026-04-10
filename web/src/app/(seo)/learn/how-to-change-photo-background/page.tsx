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
  "preserve the same off-white running shoe, replace the entire desk, notebook, mug, plant, and window scene with a clean warm cream studio backdrop and a minimal low pedestal, keep the shoe realistic and centered, add soft editorial side light and a subtle grounded shadow, premium product photo, no text, no watermark";

const proofImages = {
  source: {
    src: `${PAGE_RESOURCE_BASE}/how-to-make-image-transparent-source.webp`,
    alt: "Source product photo of an off-white running shoe sitting on a cluttered wooden desk near a plant and a coffee mug.",
    width: 2304,
    height: 1728,
    label: "Source image",
    frameVariant: "plain",
  },
  replaced: {
    src: `${PAGE_RESOURCE_BASE}/how-to-change-photo-background-result.webp`,
    alt: "The same off-white running shoe placed on a minimal cream pedestal with a warm studio background after the photo background was replaced.",
    width: 2304,
    height: 1728,
    label: "Background-replaced result",
    frameVariant: "plain",
  },
} as const;

export const metadata: Metadata = {
  title: "How to Change a Photo Background with an AI Agent",
  description:
    "Use AnyCap to replace a photo background without losing the subject, inspect the revision, and branch into white, studio, or scene-specific versions from the same source image.",
  alternates: { canonical: "/learn/how-to-change-photo-background" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/learn/how-to-change-photo-background",
    siteName: siteConfig.siteName,
    title: "How to Change a Photo Background with an AI Agent",
    description:
      "A workflow guide for replacing a photo background through AnyCap while keeping the subject consistent enough for product, docs, and content workflows.",
  },
};

const articleJsonLd = createTechArticleJsonLd({
  headline: "How to Change a Photo Background with an AI Agent",
  description:
    "A practical workflow for replacing a photo background through AnyCap image editing while preserving the original subject.",
  path: "/learn/how-to-change-photo-background",
  about: [
    "Background replacement",
    "Photo editing",
    "Image-to-image editing",
    "AI agents",
    "Product photos",
  ],
  keywords: [
    "change photo background",
    "replace image background",
    "change background of a picture",
    "photo background changer",
    "background replacement workflow",
  ],
  datePublished: lastUpdatedIso,
  dateModified: lastUpdatedIso,
});

const faqItems = [
  {
    question: "Is changing a photo background the same as making it transparent?",
    answer:
      "No. A transparent version removes the environment so you can place the subject elsewhere later. A background-replaced version already chooses the new environment, such as a white studio, a pedestal setup, or a scene that better matches the page or listing.",
  },
  {
    question: "When should I use a white background instead of a styled replacement?",
    answer:
      "Use white when the destination is marketplace, catalog, or compliance-driven. Use a styled replacement when the image needs to feel more editorial, product-led, or context-aware on a landing page, doc, or content asset.",
  },
  {
    question: "Which AnyCap model should I use first for background replacement?",
    answer:
      "Use Nano Banana Pro first when you already have the source image and the job is to preserve the subject while replacing only the environment. Use Nano Banana 2 when you want faster iteration across several background directions. Use Seedream 5 when you still need the original product image before editing begins.",
  },
  {
    question: "Can AnyCap help inspect whether the replacement still looks believable?",
    answer:
      "Yes. After generation, you can use AnyCap image reading to check whether the same subject identity is preserved, whether the new setting feels coherent, and whether there is any visible text, watermark, or prompt drift.",
  },
];

const faqJsonLd = createFaqPageJsonLd(faqItems);
const pageChrome = getSeoPageChrome("/learn/how-to-change-photo-background");

const quickTakeaways = [
  "Changing a photo background is strongest when the prompt says what must stay, not only what should be removed.",
  "The useful workflow is subject preservation plus environment replacement, then a QA pass for lighting, scale, and edge consistency.",
  "The same source image can branch into a white studio version, a styled pedestal shot, or a more contextual scene depending on where the asset will be used.",
] as const;

const validationCards = [
  {
    title: "Capability surface confirmed",
    body: "During page production on April 9, 2026, a live AnyCap status check confirmed image generation, image editing, image reading, Drive, Page, and web retrieval were available in the current environment.",
  },
  {
    title: "Schema confirmed",
    body: "The current image-to-image schema for Nano Banana Pro was checked live and uses the `images` parameter for source assets.",
  },
  {
    title: "Proof pair generated",
    body: "The before-and-after proof on this page was generated through AnyCap from the same source asset instead of being assembled from unrelated images.",
  },
  {
    title: "Replacement QA checked",
    body: "Image reading was used to confirm the studio-background replacement still preserved the same shoe and did not introduce visible text or watermark artifacts.",
  },
] as const;

const workflowSteps = [
  {
    title: "Choose the image that already matters",
    body: "Start with the photo you actually want to reuse. This workflow is better when the subject is already right and only the surrounding environment needs to change.",
  },
  {
    title: "Specify the target environment clearly",
    body: "Tell the model whether the destination is a white marketplace photo, a soft studio pedestal, or a more contextual scene. The background target should be concrete.",
  },
  {
    title: "Preserve the subject while replacing the scene",
    body: "Use image-to-image editing and repeat the subject-preservation constraints. The job is not to redesign the product. It is to change the setting around it.",
  },
  {
    title: "Inspect coherence, not only cleanliness",
    body: "Check that the scale, shadow, and perspective still feel believable. A clean replacement can still fail if the new environment looks detached from the subject.",
  },
  {
    title: "Branch into the version the channel needs",
    body: "From the same source, you can create a white-background listing image, a softer studio page visual, or a more expressive campaign direction.",
  },
] as const;

const optionCards = [
  {
    title: "White studio",
    body: "Best for catalog, marketplace, and compliance-heavy photo slots where the background should disappear as a decision.",
  },
  {
    title: "Pedestal or gradient setup",
    body: "Best for product pages, docs, and editorial-style content where the image should look cleaner than the raw source but still feel premium.",
  },
  {
    title: "Context scene",
    body: "Best when the background should help sell mood, use case, or campaign framing rather than simply getting out of the way.",
  },
] as const;

const comparisonRows = [
  {
    lens: "What changes",
    shallow: "Everything gets regenerated and the product may drift with it.",
    workflow: "Only the environment changes while the subject is kept as close to the source as possible.",
  },
  {
    lens: "Output quality",
    shallow: "The background is different, but the image no longer feels like the same photo.",
    workflow: "The result still reads as the same asset, just placed in a setting that better matches the channel.",
  },
  {
    lens: "Reuse path",
    shallow: "You solve one image, then restart from scratch for every new context.",
    workflow: "One source image can branch into white, studio, or context-specific variations as needed.",
  },
  {
    lens: "QA standard",
    shallow: "The new background looks nicer, so the job seems done.",
    workflow: "The agent also checks whether the subject, scale, and lighting still feel coherent after the edit.",
  },
] as const;

const modelCards = [
  {
    title: "Nano Banana Pro",
    label: "Best first choice for background replacement",
    body: "Use this when the source photo already exists and the main job is to preserve the same subject while changing only the surrounding scene.",
    href: "/models/nano-banana-pro",
  },
  {
    title: "Nano Banana 2",
    label: "Best for faster variant loops",
    body: "Use this when you want to test several background directions quickly before deciding which visual lane the page or listing should take.",
    href: "/models/nano-banana-2",
  },
  {
    title: "Seedream 5",
    label: "Best when the source photo does not exist yet",
    body: "Use this when you still need a stronger first-pass product image before any background replacement or cleanup begins.",
    href: "/models/seedream-5",
  },
] as const;

const codeExamples = [
  {
    title: "Replace the background with a warm studio setup",
    code: `anycap image generate \\
  --model nano-banana-pro \\
  --mode image-to-image \\
  --prompt "preserve the same subject, replace the desk and room with a warm cream studio backdrop and a simple pedestal, keep realistic lighting and grounded shadow, no text, no watermark" \\
  --param images=./source-photo.png \\
  --param aspect_ratio=4:3 \\
  --param resolution=2k \\
  -o studio-background-replacement.png`,
  },
  {
    title: "Branch into a white-background version",
    code: `anycap image generate \\
  --model nano-banana-pro \\
  --mode image-to-image \\
  --prompt "preserve the same subject, replace the environment with a clean white studio background, centered marketplace-ready product photo, no text, no watermark" \\
  --param images=./source-photo.png \\
  --param aspect_ratio=4:3 \\
  --param resolution=2k \\
  -o white-background-version.png`,
  },
  {
    title: "QA the replacement result",
    code: `anycap actions image-read \\
  --file ./studio-background-replacement.png \\
  --instruction "Describe the image, confirm whether the same subject is preserved, and mention any visible text, watermark, or awkward background mismatch."`,
  },
] as const;

const nextMoveCards = [
  {
    title: "How to Make an Image Transparent",
    href: "/learn/how-to-make-image-transparent",
    body: "Start here when the background should be removed first instead of replaced immediately.",
  },
  {
    title: "Image Generation",
    href: "/capabilities/image-generation",
    body: "See the exact AnyCap image surface that powers background replacement and other image-to-image workflows.",
  },
  {
    title: "Nano Banana Pro",
    href: "/models/nano-banana-pro",
    body: "Go deeper on the model that currently fits the strongest subject-preserving revision loop.",
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

export default function HowToChangePhotoBackgroundPage() {
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
              How to change a photo background
              <br />
              without losing the original subject
            </h1>
            <p className="mt-6 max-w-[820px] text-base leading-7 text-[#4d5145] md:text-lg">
              If you are trying to change a photo background, the real job is not only to make the
              old scene disappear. It is to preserve the same subject while moving it into a new
              environment that still looks believable. That is where{" "}
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
              gives the agent a stronger workflow than a generic one-click changer.
            </p>
            <div className="mt-8 max-w-[860px] rounded-xl border border-[#d4dbb8] bg-[#f9faf5]/80 p-6">
              <p className="mb-3 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                Answer-first summary
              </p>
              <p className="text-sm leading-6 text-[#4d5145]">
                A useful photo-background replacement workflow keeps the subject stable and changes
                only the environment around it. AnyCap helps the agent run that loop in one place:
                edit from the source photo, inspect whether the revision still looks like the same
                asset, and branch into the exact background style the destination needs.
              </p>
            </div>
          </FadeIn>

          <FadeIn className="mt-8">
            <EarlyAccessBanner />
          </FadeIn>

          <FadeIn className="mt-10">
            <LearnProofShowcase
              title="One source photo, one cleaner replacement scene"
              intro="This page uses a real before-and-after proof pair. The left frame is the original desk photo. The right frame is the AnyCap revision that keeps the same shoe but moves it into a cleaner studio setting."
              promptLabel="Edit prompt used with AnyCap"
              prompt={proofPrompt}
              images={[proofImages.source, proofImages.replaced]}
              signals={[
                "It makes the page's main promise concrete: the useful job is replacing the environment without drifting away from the source subject.",
                "The proof pair shows why background replacement is different from simple cutout export or full regeneration.",
                "It gives the page first-party evidence that the edit workflow can move from a cluttered source photo into a cleaner product-style result.",
              ]}
              caption="The left image is the original source photo. The right image is the AnyCap background-replacement revision generated from that same source asset for this page."
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
                Preserve the subject, replace only the environment
              </h2>
              <p className="mt-6 text-base leading-7 text-[#4d5145]">
                Many background changer tools treat the image like a disposable draft. That is not
                the best fit when the original product, person, or screenshot already matters. The
                stronger workflow is to keep the same subject and revise the surroundings around it.
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
                Five steps from cluttered photo to cleaner setting
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
                Why replacement is not the same as regeneration
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
                Pick the model based on whether the source already exists
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
                Example commands for replacement workflows
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
                Move into the workflow that fits the destination
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
