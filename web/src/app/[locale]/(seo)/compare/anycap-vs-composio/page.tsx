import CompareAnyCapVsComposioPage, {

  metadata as baseMetadata,
} from "@/app/(seo)/compare/anycap-vs-composio/page";
import { generateLocalizedPageMetadata, type LocalePageParams } from "@/lib/localized-page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  return generateLocalizedPageMetadata(params, "compare-anycap-vs-composio", baseMetadata);
}

export default function LocalizedCompareAnyCapVsComposioPage() {
  return <CompareAnyCapVsComposioPage />;
}
