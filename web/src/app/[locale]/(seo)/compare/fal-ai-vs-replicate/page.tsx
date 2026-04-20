import FalAiVsReplicatePage, {
  metadata as baseMetadata,
} from "@/app/(seo)/compare/fal-ai-vs-replicate/page";
import { generateLocalizedPageMetadata, type LocalePageParams } from "@/lib/localized-page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  return generateLocalizedPageMetadata(
    params,
    "compare-fal-ai-vs-replicate",
    baseMetadata
  );
}

export default function LocalizedFalAiVsReplicatePage() {
  return <FalAiVsReplicatePage />;
}
