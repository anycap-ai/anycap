import AnycapVsFalAiPage, {
  metadata as baseMetadata,
} from "@/app/(seo)/compare/anycap-vs-fal-ai/page";
import { generateLocalizedPageMetadata, type LocalePageParams } from "@/lib/localized-page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  return generateLocalizedPageMetadata(
    params,
    "compare-anycap-vs-fal-ai",
    baseMetadata
  );
}

export default function LocalizedAnycapVsFalAiPage() {
  return <AnycapVsFalAiPage />;
}
