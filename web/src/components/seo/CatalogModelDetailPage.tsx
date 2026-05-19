import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { EarlyAccessBanner } from "@/components/landing/EarlyAccessBanner";
import { FadeIn } from "@/components/ui/FadeIn";
import type { CatalogModel } from "@/lib/seo/model-catalog";
import { createFaqPageJsonLd, createTechArticleJsonLd } from "@/lib/schema";
import type { SiteLocale } from "@/lib/site";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;
const lastUpdatedIso = "2026-05-13";

function getCapabilityPath(model: CatalogModel) {
  if (model.capability === "image") return "/capabilities/image-generation";
  if (model.capability === "video") return "/capabilities/video-generation";
  return "/capabilities/music-generation";
}

function getGenerateCommand(model: CatalogModel) {
  const base = `anycap ${model.capability} generate --model ${model.modelId}`;
  if (model.capability === "music") {
    return `${base} --prompt "${model.examplePrompt}" -o ${model.outputFile}`;
  }

  return `${base} --prompt "${model.examplePrompt}" -o ${model.outputFile}`;
}

function getReferenceCommand(model: CatalogModel) {
  if (model.capability === "image" && model.modes.includes("image-to-image")) {
    return `anycap image generate --model ${model.modelId} --mode image-to-image --prompt "refine this visual for a cleaner launch asset" --param images=./input.png -o ${model.outputFile}`;
  }

  if (model.capability === "video" && model.modes.includes("image-to-video")) {
    return `anycap video generate --model ${model.modelId} --mode image-to-video --prompt "animate this reference frame with subtle camera motion" --param images=./frame.png -o ${model.outputFile}`;
  }

  return null;
}

export function getCatalogModelFaqItems(model: CatalogModel) {
  return [
    {
      question: `What is ${model.displayName} best for in AnyCap?`,
      answer: `${model.displayName} is best for ${model.bestFor.toLowerCase()} AnyCap exposes it as an active ${model.capabilityLabel.toLowerCase()} model with the model ID ${model.modelId}.`,
    },
    {
      question: `What AnyCap CLI model ID should agents use for ${model.displayName}?`,
      answer: `Use ${model.modelId}. Agents can discover the current catalog entry with anycap ${model.capability} models and inspect its schema with anycap ${model.capability} models ${model.modelId} schema --operation generate.`,
    },
    {
      question: `Which modes does ${model.displayName} support through AnyCap?`,
      answer: `The current AnyCap CLI catalog lists ${model.displayName} as active for ${model.modes.join(", ")} under the generate operation.`,
    },
  ];
}

export function createCatalogModelArticleJsonLd(model: CatalogModel, locale: SiteLocale) {
  return createTechArticleJsonLd({
    headline: `${model.displayName} for AI agents through AnyCap`,
    description: model.description,
    path: model.path,
    locale,
    about: [model.displayName, model.provider, model.capabilityLabel, "AnyCap", "AI agents"],
    keywords: [
      model.displayName.toLowerCase(),
      `${model.displayName.toLowerCase()} api`,
      model.modelId,
      model.capabilityLabel.toLowerCase(),
      "anycap models",
      "ai agent model",
    ],
    datePublished: lastUpdatedIso,
    dateModified: lastUpdatedIso,
  });
}

export function CatalogModelDetailPage({
  model,
  locale,
}: {
  model: CatalogModel;
  locale: SiteLocale;
}) {
  const faqItems = getCatalogModelFaqItems(model);
  const referenceCommand = getReferenceCommand(model);
  const articleJsonLd = createCatalogModelArticleJsonLd(model, locale);
  const faqJsonLd = createFaqPageJsonLd(faqItems);
  const capabilityPath = getCapabilityPath(model);
  const schemaCommand = `anycap ${model.capability} models ${model.modelId} schema --operation generate${
    model.modes.length === 1 ? ` --mode ${model.modes[0]}` : ""
  }`;

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Models", href: "/models" },
          { name: model.displayName, href: model.path },
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
              Model
            </p>
            <p className="mb-3 text-[11px] tracking-[0.5px] text-[#5a5e52]" style={mono}>
              Last updated May 13, 2026
            </p>
            <h1
              className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(32px, 6vw, 72px)" }}
            >
              {model.displayName}
              <br />
              for AI agents
            </h1>
            <p className="mt-6 max-w-[760px] text-base leading-7 text-[#4d5145] md:text-lg">
              {model.description} This page is grounded in the current AnyCap CLI catalog so
              agents can copy the exact model ID, operation, and modes instead of guessing from
              provider-facing names.
            </p>
            <div className="mt-8 max-w-[900px] border border-[#d4dbb8] bg-[#f9faf5]/80 p-6">
              <p className="mb-3 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                Answer-first summary
              </p>
              <p className="text-sm leading-6 text-[#4d5145]">
                Use <span style={mono}>{model.modelId}</span> when an agent needs{" "}
                {model.bestFor.toLowerCase()} The current AnyCap catalog lists it as{" "}
                <span style={mono}>{model.status}</span> for {model.modes.join(", ")} through the{" "}
                <span style={mono}>{model.operation}</span> operation.
              </p>
            </div>
          </FadeIn>

          <FadeIn className="mt-8">
            <EarlyAccessBanner />
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-6 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                Current AnyCap catalog entry
              </h2>
              <div className="overflow-x-auto rounded-xl border border-[#d4dbb8] bg-[#f9faf5]/80">
                <table className="w-full text-left">
                  <tbody>
                    {[
                      ["Model ID", model.modelId],
                      ["Display name", model.displayName],
                      ["Provider", model.provider],
                      ["Capability", model.capabilityLabel],
                      ["Operation", model.operation],
                      ["Supported modes", model.modes.join(", ")],
                      ["Catalog status", model.status],
                      ["Credit estimate", model.creditEstimate],
                    ].map(([label, value]) => (
                      <tr key={label} className="border-b border-[#d4dbb8]/60 last:border-b-0">
                        <th className="w-[190px] bg-[#f4f5f0] px-5 py-4 align-top text-[11px] tracking-[0.5px] text-[#5a5e52]" style={mono}>
                          {label}
                        </th>
                        <td className="px-5 py-4 align-top text-sm leading-6 text-[#4d5145]">
                          {value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-4 max-w-[760px] text-sm leading-6 text-[#4d5145]">
                {model.evidenceNote}
              </p>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-6 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                When agents should choose {model.displayName}
              </h2>
              <div className="grid max-w-[980px] gap-4 md:grid-cols-2">
                <div className="border border-[#d4dbb8] bg-[#fffffc]/70 p-5">
                  <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                    Best fit
                  </p>
                  <p className="text-sm leading-6 text-[#4d5145]">{model.bestFor}</p>
                </div>
                <div className="border border-[#d4dbb8] bg-[#fffffc]/70 p-5">
                  <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                    Tradeoff
                  </p>
                  <p className="text-sm leading-6 text-[#4d5145]">{model.tradeoff}</p>
                </div>
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-6 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                Call {model.displayName} through AnyCap
              </h2>
              <div className="max-w-[860px] space-y-6">
                {[
                  ["Discover models", `anycap ${model.capability} models`],
                  ["Inspect schema", schemaCommand],
                  [`Generate with ${model.displayName}`, getGenerateCommand(model)],
                  ...(referenceCommand ? [["Use a reference asset", referenceCommand]] : []),
                ].map(([label, command]) => (
                  <div key={label}>
                    <p className="mb-3 text-[11px] tracking-[0.5px] text-[#5a5e52]" style={mono}>
                      {label}
                    </p>
                    <div className="bg-[#1c1f17] px-5 py-4">
                      <p className="break-all text-[13px] text-[#d4e0a4]" style={mono}>
                        {command}
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
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                FAQ
              </h2>
              <div className="max-w-[860px] space-y-6">
                {faqItems.map((item) => (
                  <div key={item.question} className="border border-[#d4dbb8] p-5">
                    <h3 className="mb-2 text-[14px] font-bold text-[#1c1f17]" style={mono}>
                      {item.question}
                    </h3>
                    <p className="text-sm leading-6 text-[#4d5145]">{item.answer}</p>
                  </div>
                ))}
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
                  href={capabilityPath}
                  className="inline-block rounded-lg bg-[#6b7d3a] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#f4f5f0] transition-colors hover:bg-[#1c1f17]"
                  style={mono}
                >
                  {model.capabilityLabel}
                </Link>
                <Link
                  href="/models"
                  className="inline-block rounded-lg border border-[#1c1f17] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                  style={mono}
                >
                  All models
                </Link>
              </div>
            </section>
          </FadeIn>
        </div>
      </article>
    </>
  );
}
