import ReplicateAlternativesPage, {
  metadata as baseMetadata,
} from "@/app/(seo)/compare/replicate-alternatives-for-agents/page";
import { generateLocalizedPageMetadata, type LocalePageParams } from "@/lib/localized-page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  return generateLocalizedPageMetadata(params, "compare-replicate-alternatives-for-agents", baseMetadata);
}

export default function LocalizedReplicateAlternativesPage() {
  return <ReplicateAlternativesPage />;
}
