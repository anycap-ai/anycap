import ClaudeCodeImageGenerationPage, {
  metadata as baseMetadata,
} from "@/app/(seo)/for/claude-code/image-generation/page";
import { generateLocalizedPageMetadata, type LocalePageParams } from "@/lib/localized-page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  return generateLocalizedPageMetadata(params, "for-claude-code-image-generation", baseMetadata);
}

export default function LocalizedClaudeCodeImageGenerationPage() {
  return <ClaudeCodeImageGenerationPage />;
}
