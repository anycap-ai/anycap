import BestAIForCodingAgentsPage, {
  metadata as baseMetadata,
} from "@/app/(seo)/learn/best-ai-for-coding-agents/page";
import { generateLocalizedPageMetadata, type LocalePageParams } from "@/lib/localized-page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  return generateLocalizedPageMetadata(params, "learn-best-ai-for-coding-agents", baseMetadata);
}

export default function LocalizedBestAIForCodingAgentsPage() {
  return <BestAIForCodingAgentsPage />;
}
