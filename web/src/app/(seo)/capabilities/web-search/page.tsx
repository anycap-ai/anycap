import { WebSearchDemo } from "@/components/landing/WebSearchDemo";
import { CapabilityDetailPage } from "@/components/seo/CapabilityDetailPage";
import { createLocalizedMetadataForPath } from "@/lib/localized-metadata";
import { getRequestLocale } from "@/lib/request-locale";
import { defaultLocale } from "@/lib/site";
import { createFaqPageJsonLd } from "@/lib/schema";
import { getWebSearchMetadata, getWebSearchPageData, WEB_SEARCH_PATH } from "./content";

export const runtime = "edge";

export const metadata = createLocalizedMetadataForPath(
  defaultLocale,
  WEB_SEARCH_PATH,
  getWebSearchMetadata(defaultLocale),
);

export default async function WebSearchPage() {
  const locale = await getRequestLocale();
  const content = getWebSearchPageData(locale);
  const faqJsonLd = createFaqPageJsonLd(content.faqItems);
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
      jsonLd={content.capabilityGuideJsonLd}
      faqJsonLd={faqJsonLd}
      eyebrow={content.eyebrow}
      lastUpdatedLabel="Live retrieval"
      title={content.heroTitle}
      accentTitle="for AI agents"
      intro={content.heroIntro}
      searchIntents={[
        "web search API",
        "search API for AI agents",
        "real-time web search",
        "domain filters",
      ]}
      actions={[
        { label: "Equip your Agent", href: "/start", primary: true },
        { label: "Grounded Search", href: "/capabilities/grounded-web-search" },
        { label: "Web Crawl", href: "/capabilities/web-crawl" },
      ]}
      demo={<WebSearchDemo />}
      demoTitle="Find the sources"
      demoBody="The agent retrieves structured results before it writes, cites, or crawls."
      proofPoints={content.strengthCards.map((card) => `${card.title}: ${card.body}`)}
      summaryLabel="The short answer"
      summaryText="Use AnyCap web search when the agent needs source discovery, trusted-domain retrieval, recency filters, or a result set it can inspect before synthesis."
      workflowTitle={content.workflowTitle}
      workflowSteps={content.workflowSteps}
      usageTitle={content.usageTitle}
      usageExamples={content.usageExamples}
      useCasesTitle={content.useCasesTitle}
      useCases={useCases}
      relatedTitle={content.relatedTitle}
      relatedCards={content.relatedPages}
      faqTitle={content.faqTitle}
      faqItems={content.faqItems}
      finalTitle="Let your agent find the sources."
      finalBody="Use web search when the workflow starts with discovery, result selection, and source bundles rather than a final answer."
    />
  );
}
