import type { Metadata } from "next";
import {
  createLocalizedMetadata,
  createLocalizedMetadataForPath,
} from "@/lib/localized-metadata";
import { getAboutMetadata } from "@/app/(seo)/about/content";
import { getCliMetadata } from "@/app/(seo)/cli/content";
import { getCompareMetadata } from "@/app/(seo)/compare/content";
import { getAnyCapVsFalAiMetadata } from "@/app/(seo)/compare/anycap-vs-fal-ai/content";
import { getAnyCapVsOpenAIAgentBuilderMetadata } from "@/app/(seo)/compare/anycap-vs-openai-agent-builder/content";
import { getAnyCapVsReplicateMetadata } from "@/app/(seo)/compare/anycap-vs-replicate/content";
import { getFalAiAlternativesMetadata } from "@/app/(seo)/compare/fal-ai-alternatives-for-agents/content";
import { getReplicateAlternativesMetadata } from "@/app/(seo)/compare/replicate-alternatives-for-agents/content";
import { getContactMetadata } from "@/app/(seo)/contact/content";
import { getForMetadata } from "@/app/(seo)/for/content";
import { getForCodexMetadata } from "@/app/(seo)/for/codex/content";
import { getForCursorMetadata } from "@/app/(seo)/for/cursor/content";
import { getGlossaryMetadata } from "@/app/(seo)/glossary/content";
import {
  getAgentHarnessGlossaryMetadata,
  getAgenticWorkflowGlossaryMetadata,
} from "@/app/(seo)/glossary/content";
import { getContextEngineeringForAgentsMetadata } from "@/app/(seo)/guides/context-engineering-for-agents/content";
import { getGuidesMetadata } from "@/app/(seo)/guides/content";
import { getMcpVsSkillsMetadata } from "@/app/(seo)/guides/mcp-vs-skills/content";
import { getLearnMetadata } from "@/app/(seo)/learn/content";
import { getBestAICursorMetadata } from "@/app/(seo)/learn/best-ai-for-cursor/content";
import { getWhatIsTheMostAdvancedAIMetadata } from "@/app/(seo)/learn/what-is-the-most-advanced-ai/content";
import { getSkillsMetadata } from "@/app/(seo)/skills/content";
import { getPrivacyMetadata } from "@/app/(seo)/privacy/content";
import { getTermsMetadata } from "@/app/(seo)/terms/content";
import { getVideoAnalysisMetadata } from "@/app/(seo)/capabilities/video-analysis/content";
import { getWebCrawlMetadata } from "@/app/(seo)/capabilities/web-crawl/content";
import { isSupportedLocale, type PublicRouteKey, type SiteLocale } from "@/lib/site";

export type LocalePageParams = {
  params: Promise<{ locale: string }>;
};

type LocalizedMetadataResolver = (locale: SiteLocale) => Metadata;

const localizedMetadataByRouteKey: Partial<
  Record<PublicRouteKey, LocalizedMetadataResolver>
> = {
  about: getAboutMetadata,
  cli: getCliMetadata,
  compare: getCompareMetadata,
  "compare-anycap-vs-fal-ai": getAnyCapVsFalAiMetadata,
  "compare-anycap-vs-openai-agent-builder":
    getAnyCapVsOpenAIAgentBuilderMetadata,
  "compare-anycap-vs-replicate": getAnyCapVsReplicateMetadata,
  "compare-fal-ai-alternatives-for-agents": getFalAiAlternativesMetadata,
  "compare-replicate-alternatives-for-agents":
    getReplicateAlternativesMetadata,
  contact: getContactMetadata,
  for: getForMetadata,
  "for-codex": getForCodexMetadata,
  "for-cursor": getForCursorMetadata,
  glossary: getGlossaryMetadata,
  "glossary-agent-harness": getAgentHarnessGlossaryMetadata,
  "glossary-agentic-workflow": getAgenticWorkflowGlossaryMetadata,
  guides: getGuidesMetadata,
  "guides-context-engineering-for-agents":
    getContextEngineeringForAgentsMetadata,
  learn: getLearnMetadata,
  "learn-best-ai-for-cursor": getBestAICursorMetadata,
  "learn-what-is-the-most-advanced-ai": getWhatIsTheMostAdvancedAIMetadata,
  privacy: getPrivacyMetadata,
  skills: getSkillsMetadata,
  terms: getTermsMetadata,
  "capabilities-video-analysis": getVideoAnalysisMetadata,
  "capabilities-web-crawl": getWebCrawlMetadata,
};

const localizedMetadataByPath: Partial<Record<string, LocalizedMetadataResolver>> =
  {
    "/guides/mcp-vs-skills": getMcpVsSkillsMetadata,
  };

export async function getValidatedLocale(
  paramsPromise: Promise<{ locale: string }>
): Promise<SiteLocale | null> {
  const { locale } = await paramsPromise;
  if (!isSupportedLocale(locale)) {
    return null;
  }

  return locale;
}

export async function generateLocalizedPageMetadata(
  paramsPromise: Promise<{ locale: string }>,
  routeKey: PublicRouteKey,
  metadata: Metadata
): Promise<Metadata> {
  const locale = await getValidatedLocale(paramsPromise);
  if (!locale) {
    return {};
  }

  const localizedMetadata = localizedMetadataByRouteKey[routeKey]?.(locale);

  return createLocalizedMetadata(
    locale,
    routeKey,
    localizedMetadata ?? metadata
  );
}

export async function generateLocalizedPageMetadataForPath(
  paramsPromise: Promise<{ locale: string }>,
  pathname: string,
  metadata: Metadata
): Promise<Metadata> {
  const locale = await getValidatedLocale(paramsPromise);
  if (!locale) {
    return {};
  }

  const localizedMetadata = localizedMetadataByPath[pathname]?.(locale);

  return createLocalizedMetadataForPath(
    locale,
    pathname,
    localizedMetadata ?? metadata
  );
}
