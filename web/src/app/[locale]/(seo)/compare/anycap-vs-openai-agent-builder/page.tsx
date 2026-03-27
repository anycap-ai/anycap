import AnycapVsOpenAIAgentBuilderPage, {

  metadata as baseMetadata,
} from "@/app/(seo)/compare/anycap-vs-openai-agent-builder/page";
import { generateLocalizedPageMetadata, type LocalePageParams } from "@/lib/localized-page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  return generateLocalizedPageMetadata(
    params,
    "compare-anycap-vs-openai-agent-builder",
    baseMetadata
  );
}

export default function LocalizedAnycapVsOpenAIAgentBuilderPage() {
  return <AnycapVsOpenAIAgentBuilderPage />;
}
