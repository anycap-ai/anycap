import type { Metadata } from "next";
import { ImageGenDemo } from "@/components/landing/ImageGenDemo";
import { CapabilityDetailPage } from "@/components/seo/CapabilityDetailPage";
import { createLocalizedMetadataForPath } from "@/lib/localized-metadata";
import { defaultLocale } from "@/lib/site";
import { getRequestLocale } from "@/lib/request-locale";
import {
  getImageGenerationMetadata,
  IMAGE_GENERATION_PATH,
  getImageGenerationPageData,
} from "@/app/(seo)/capabilities/image-generation/content";

export const runtime = "edge";
export const metadata: Metadata = createLocalizedMetadataForPath(
  defaultLocale,
  IMAGE_GENERATION_PATH,
  getImageGenerationMetadata(defaultLocale),
);

export default async function ImageGenerationPage() {
  const locale = await getRequestLocale();
  const content = getImageGenerationPageData(locale);

  return (
    <CapabilityDetailPage
      breadcrumbItems={content.breadcrumbItems}
      jsonLd={content.capabilityGuideJsonLd}
      faqJsonLd={content.faqJsonLd}
      eyebrow={content.eyebrow}
      lastUpdatedLabel={content.lastUpdatedLabel}
      title={content.hero.title}
      accentTitle="for AI agents"
      intro={content.hero.intro}
      searchIntents={content.metadata.articleKeywords}
      actions={[
        { label: "Equip your Agent", href: "/start", primary: true },
        { label: "For creators", href: "/for/creators" },
        { label: "Explore the CLI", href: "/cli" },
        {
          label: "View on GitHub",
          href: "https://github.com/anycap-ai/anycap",
          external: true,
        },
      ]}
      demo={<ImageGenDemo lines={content.demo.lines} labels={content.demo.labels} />}
      demoTitle="Create the visual"
      demoBody="The agent turns a prompt or source image into a usable asset."
      proofPoints={[
        "Agents can create first-pass visuals, revise source images, and keep asset delivery in one AnyCap workflow.",
        "Text-to-image and image-to-image modes stay behind one AnyCap command surface.",
        "Model choice stays explicit, from first-pass generation to revision-heavy image editing.",
      ]}
      summaryLabel={content.hero.summaryLabel.replace("Answer-first", "The short")}
      summaryText={content.hero.summaryText}
      workflowTitle="How image generation fits an AnyCap workflow"
      workflowSteps={[
        {
          title: "Brief",
          body: "The agent turns a product, creator, or design request into a prompt and chooses whether the job starts from text or an existing image.",
        },
        {
          title: "Generate",
          body: "AnyCap runs the selected image model with the right mode, model ID, prompt, and output file.",
        },
        {
          title: "Iterate",
          body: "The result can move into review, editing, Drive delivery, Page publishing, or a follow-up image-to-video workflow.",
        },
      ]}
      usageTitle={content.usageTitle}
      usageExamples={content.usageExamples}
      useCasesTitle={content.useCasesTitle}
      useCases={content.useCases}
      relatedTitle={content.decisionTitle}
      relatedCards={[
        ...content.decisionCards.map((card) => ({
          eyebrow: card.eyebrow,
          title: card.title,
          href: card.href,
          body: card.body,
        })),
        ...content.relatedCards.slice(0, 2).map((card) => ({
          eyebrow: card.eyebrow,
          title: card.title,
          href: card.href,
          body: card.description,
        })),
      ]}
      faqTitle={content.faqTitle}
      faqItems={content.faqItems}
      finalTitle="Let your agent create the visual."
      finalBody="Use AnyCap when image generation, editing, model selection, and asset delivery should stay inside the same agent workflow."
    />
  );
}
