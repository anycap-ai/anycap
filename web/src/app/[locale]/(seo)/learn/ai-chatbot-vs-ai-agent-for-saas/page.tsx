import AIChatbotVsAIAgentForSaaSPage, {
  metadata as baseMetadata,
} from "@/app/(seo)/learn/ai-chatbot-vs-ai-agent-for-saas/page";
import { generateLocalizedPageMetadata, type LocalePageParams } from "@/lib/localized-page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  return generateLocalizedPageMetadata(params, "learn-ai-chatbot-vs-ai-agent-for-saas", baseMetadata);
}

export default function LocalizedAIChatbotVsAIAgentForSaaSPage() {
  return <AIChatbotVsAIAgentForSaaSPage />;
}
