import WebSearchPage, {
  metadata as baseMetadata,
} from "@/app/(seo)/capabilities/web-search/page";
import { generateLocalizedPageMetadata, type LocalePageParams } from "@/lib/localized-page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  return generateLocalizedPageMetadata(params, "capabilities-web-search", baseMetadata);
}

export default function LocalizedWebSearchPage() {
  return <WebSearchPage />;
}
