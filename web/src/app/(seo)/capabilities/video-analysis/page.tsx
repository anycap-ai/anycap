import type { Metadata } from "next";
import { VideoReadDemo } from "@/components/landing/VideoReadDemo";
import { CapabilityDetailPage } from "@/components/seo/CapabilityDetailPage";
import { createLocalizedMetadataForPath } from "@/lib/localized-metadata";
import { createFaqPageJsonLd, createTechArticleJsonLd } from "@/lib/schema";
import { getRequestLocale } from "@/lib/request-locale";
import { defaultLocale } from "@/lib/site";
import {
  VIDEO_ANALYSIS_PATH,
  getVideoAnalysisMetadata,
  getVideoAnalysisPageData,
} from "./content";

export const runtime = "edge";

const PAGE_LAST_MODIFIED_ISO = "2026-04-13";

export const metadata: Metadata = createLocalizedMetadataForPath(
  defaultLocale,
  VIDEO_ANALYSIS_PATH,
  getVideoAnalysisMetadata(defaultLocale),
);

export default async function VideoAnalysisPage() {
  const locale = await getRequestLocale();
  const content = getVideoAnalysisPageData(locale);

  const capabilityGuideJsonLd = createTechArticleJsonLd({
    headline: content.metadata.title,
    description: content.metadata.description,
    path: VIDEO_ANALYSIS_PATH,
    about: ["Video analysis", "Video understanding", "Video intelligence", "AnyCap"],
    keywords: [
      "video analysis for ai agents",
      "video understanding api",
      "ai video analysis api",
      "video intelligence api",
    ],
    dateModified: PAGE_LAST_MODIFIED_ISO,
  });
  const faqJsonLd = createFaqPageJsonLd(content.faqItems);
  const actions = content.cta.map((item, index) => ({
    ...item,
    primary: index === 0,
    external: item.href.startsWith("http"),
  }));

  return (
    <CapabilityDetailPage
      breadcrumbItems={content.breadcrumbItems}
      jsonLd={capabilityGuideJsonLd}
      faqJsonLd={faqJsonLd}
      eyebrow={content.eyebrow}
      lastUpdatedLabel="Last updated April 13, 2026"
      title={content.heroTitle}
      accentTitle="for AI agents"
      intro={content.heroIntro}
      searchIntents={[
        "video analysis API",
        "video understanding",
        "screen recordings",
        "agent QA",
      ]}
      actions={actions}
      demo={<VideoReadDemo />}
      demoTitle="Read the recording"
      demoBody="The agent turns screen recordings and demos into usable context."
      proofPoints={[
        "Screen recordings become summaries, key events, and reproduction notes inside the same workflow.",
        "Agents can ask focused questions about video instead of manually reviewing every frame.",
        "Video analysis pairs with image understanding and audio understanding for richer media review.",
      ]}
      summaryLabel="The short answer"
      summaryText="Use AnyCap video analysis when an agent needs to understand a recording before acting on it, writing about it, or handing it to another workflow."
      workflowTitle="How video analysis fits an AnyCap workflow"
      workflowSteps={[
        {
          title: "Read",
          body: "The agent receives a local video or URL and sends it through the AnyCap video-read action.",
        },
        {
          title: "Interpret",
          body: "The response can summarize scenes, identify UI transitions, extract key moments, or answer a focused question.",
        },
        {
          title: "Route",
          body: "The agent can turn the video context into bug notes, QA findings, demo docs, research notes, or follow-up actions.",
        },
      ]}
      usageTitle={content.usageTitle}
      usageExamples={content.usageExamples}
      useCasesTitle={content.scenariosTitle}
      useCases={content.scenarios.map((scenario) => ({
        title: scenario.title,
        description: scenario.body,
      }))}
      relatedTitle={content.relatedTitle}
      relatedCards={content.relatedPages.map((page) => ({
        eyebrow: page.label,
        title: page.title,
        href: page.href,
        body: page.body,
      }))}
      faqTitle={content.faqTitle}
      faqItems={content.faqItems}
      finalTitle="Let your agent understand video."
      finalBody="Use AnyCap when a recording should become context, not another file someone has to watch from start to finish."
    />
  );
}
