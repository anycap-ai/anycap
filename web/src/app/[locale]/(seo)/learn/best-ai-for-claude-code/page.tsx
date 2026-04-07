import BestAIForClaudeCodePage, {
  metadata as baseMetadata,
} from "@/app/(seo)/learn/best-ai-for-claude-code/page";
import { generateLocalizedPageMetadata, type LocalePageParams } from "@/lib/localized-page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  return generateLocalizedPageMetadata(params, "learn-best-ai-for-claude-code", baseMetadata);
}

export default function LocalizedBestAIForClaudeCodePage() {
  return <BestAIForClaudeCodePage />;
}
