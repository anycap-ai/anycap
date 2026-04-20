import AnycapVsTogetherAiPage, {
  metadata as baseMetadata,
} from "@/app/(seo)/compare/anycap-vs-together-ai/page";
import { generateLocalizedPageMetadata, type LocalePageParams } from "@/lib/localized-page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  return generateLocalizedPageMetadata(
    params,
    "compare-anycap-vs-together-ai",
    baseMetadata
  );
}

export default function LocalizedAnycapVsTogetherAiPage() {
  return <AnycapVsTogetherAiPage />;
}
