import AnycapVsOpenClawImageGenerationPage, {
  metadata as baseMetadata,
} from "@/app/(seo)/compare/anycap-vs-openclaw-image-generation/page";
import { generateLocalizedPageMetadata, type LocalePageParams } from "@/lib/localized-page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  return generateLocalizedPageMetadata(
    params,
    "compare-anycap-vs-openclaw-image-generation",
    baseMetadata
  );
}

export default function LocalizedAnycapVsOpenClawImageGenerationPage() {
  return <AnycapVsOpenClawImageGenerationPage />;
}
