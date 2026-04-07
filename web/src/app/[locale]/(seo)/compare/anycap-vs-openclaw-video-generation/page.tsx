import AnycapVsOpenClawVideoGenerationPage, {
  metadata as baseMetadata,
} from "@/app/(seo)/compare/anycap-vs-openclaw-video-generation/page";
import { generateLocalizedPageMetadata, type LocalePageParams } from "@/lib/localized-page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  return generateLocalizedPageMetadata(
    params,
    "compare-anycap-vs-openclaw-video-generation",
    baseMetadata
  );
}

export default function LocalizedAnycapVsOpenClawVideoGenerationPage() {
  return <AnycapVsOpenClawVideoGenerationPage />;
}
