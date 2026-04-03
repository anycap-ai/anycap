import GroundedWebSearchPage, {
  metadata as baseMetadata,
} from "@/app/(seo)/capabilities/grounded-web-search/page";
import { generateLocalizedPageMetadata, type LocalePageParams } from "@/lib/localized-page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  return generateLocalizedPageMetadata(params, "capabilities-grounded-web-search", baseMetadata);
}

export default function LocalizedGroundedWebSearchPage() {
  return <GroundedWebSearchPage />;
}
