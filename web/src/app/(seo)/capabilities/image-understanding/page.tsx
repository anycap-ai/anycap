import type { Metadata } from "next";
import { ImageReadDemo } from "@/components/landing/ImageReadDemo";
import { CapabilityDetailPage } from "@/components/seo/CapabilityDetailPage";
import { createLocalizedMetadataForPath } from "@/lib/localized-metadata";
import { defaultLocale } from "@/lib/site";
import { getRequestLocale } from "@/lib/request-locale";
import {
  getImageUnderstandingMetadata,
  IMAGE_UNDERSTANDING_PATH,
  getImageUnderstandingPageData,
} from "@/app/(seo)/capabilities/image-understanding/content";

export const runtime = "edge";

export const metadata: Metadata = createLocalizedMetadataForPath(
  defaultLocale,
  IMAGE_UNDERSTANDING_PATH,
  getImageUnderstandingMetadata(defaultLocale),
);

export default async function ImageUnderstandingPage() {
  const locale = await getRequestLocale();
  const content = getImageUnderstandingPageData(locale);
  const useCases = content.useCases.map((useCase, index) => {
    const [title, ...rest] = useCase.split(".");
    return {
      title: title.length > 70 ? `Use case ${index + 1}` : title,
      description: rest.join(".").trim() || useCase,
    };
  });

  return (
    <CapabilityDetailPage
      breadcrumbItems={content.breadcrumbItems}
      jsonLd={content.articleJsonLd}
      faqJsonLd={content.faqJsonLd}
      eyebrow={content.eyebrow}
      lastUpdatedLabel={content.lastUpdatedLabel}
      title={content.hero.title}
      accentTitle="for AI agents"
      intro={`${content.hero.intro} ${content.namingNote.text}`}
      searchIntents={content.metadata.articleKeywords}
      actions={content.nextActions}
      demo={<ImageReadDemo />}
      demoTitle="Read the visual"
      demoBody="Screenshots, charts, diagrams, and OCR-heavy images become agent context."
      proofPoints={[
        "Screenshots and diagrams become structured context before the agent writes code or docs.",
        "OCR, image description, and focused visual questions share one command surface.",
        "Image understanding pairs with image generation when the workflow needs both analysis and creation.",
      ]}
      summaryLabel={content.hero.summaryLabel.replace("Answer-first", "The short")}
      summaryText={content.hero.summaryText}
      workflowTitle="How image understanding fits an AnyCap workflow"
      workflowSteps={[
        {
          title: "Read",
          body: "The agent sends a screenshot, diagram, chart, or image URL through the AnyCap image-read action.",
        },
        {
          title: "Extract",
          body: "The result can describe the visual, read embedded text, identify UI state, or answer a focused question.",
        },
        {
          title: "Act",
          body: "The extracted context can feed debugging, documentation, design review, research, or generation workflows.",
        },
      ]}
      usageTitle={content.usageTitle}
      usageExamples={content.usageExamples}
      useCasesTitle={content.useCasesTitle}
      useCases={useCases}
      relatedTitle={content.relatedTitle}
      relatedCards={content.relatedCards.map((card) => ({
        eyebrow: card.eyebrow,
        title: card.title,
        href: card.href,
        body: card.description,
      }))}
      faqTitle={content.faqTitle}
      faqItems={content.faqItems}
      finalTitle="Let your agent understand images."
      finalBody="Use AnyCap when screenshots, diagrams, charts, or OCR-heavy visuals should become usable context inside the same agent workflow."
    />
  );
}
