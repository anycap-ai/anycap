import BestAIForCursorPage, {
  metadata as baseMetadata,
} from "@/app/(seo)/learn/best-ai-for-cursor/page";
import { generateLocalizedPageMetadata, type LocalePageParams } from "@/lib/localized-page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  return generateLocalizedPageMetadata(params, "learn-best-ai-for-cursor", baseMetadata);
}

export default function LocalizedBestAIForCursorPage() {
  return <BestAIForCursorPage />;
}
