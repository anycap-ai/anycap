import type { Metadata } from "next";
import { CapabilityDemo } from "@/components/landing/CapabilityDemo";
import { CapabilityDetailPage } from "@/components/seo/CapabilityDetailPage";
import { createLocalizedMetadataForPath } from "@/lib/localized-metadata";
import { getRequestLocale } from "@/lib/request-locale";
import { defaultLocale } from "@/lib/site";
import {
  VIDEO_ANALYSIS_PATH,
  getVideoAnalysisMetadata,
  getVideoAnalysisPageData,
} from "./content";

export const runtime = "edge";

export const metadata: Metadata = createLocalizedMetadataForPath(
  defaultLocale,
  VIDEO_ANALYSIS_PATH,
  getVideoAnalysisMetadata(defaultLocale),
);

export default async function VideoAnalysisPage() {
  const locale = await getRequestLocale();
  const content = getVideoAnalysisPageData(locale);

  return (
    <CapabilityDetailPage
      breadcrumbItems={content.breadcrumbItems}
      jsonLd={content.capabilityGuideJsonLd}
      eyebrow={content.eyebrow}
      lastUpdatedLabel={content.lastUpdatedLabel}
      title={content.title}
      accentTitle={content.accentTitle}
      intro={content.intro}
      chrome={content.chrome}
      searchIntents={content.searchIntents}
      actions={content.actions}
      demo={<CapabilityDemo lines={content.demo.lines} labels={content.demo.labels} />}
      demoTitle={content.demo.title}
      demoBody={content.demo.body}
      proofPoints={content.proofPoints}
      summaryLabel={content.summary.label}
      summaryText={content.summary.text}
      workflowTitle={content.workflow.title}
      workflowSteps={content.workflow.steps}
      usageTitle={content.usageTitle}
      usageExamples={content.usageExamples}
      useCasesTitle={content.useCasesTitle}
      useCases={content.useCases}
      relatedTitle={content.relatedTitle}
      relatedCards={content.relatedCards}
      faqTitle={content.faqTitle}
      faqItems={content.faqItems}
      finalTitle={content.final.title}
      finalBody={content.final.body}
    />
  );
}
