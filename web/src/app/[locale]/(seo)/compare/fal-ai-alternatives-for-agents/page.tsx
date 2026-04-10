import FalAiAlternativesPage, {
  metadata as baseMetadata,
} from "@/app/(seo)/compare/fal-ai-alternatives-for-agents/page";
import { generateLocalizedPageMetadata, type LocalePageParams } from "@/lib/localized-page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  return generateLocalizedPageMetadata(params, "compare-fal-ai-alternatives-for-agents", baseMetadata);
}

export default function LocalizedFalAiAlternativesPage() {
  return <FalAiAlternativesPage />;
}
