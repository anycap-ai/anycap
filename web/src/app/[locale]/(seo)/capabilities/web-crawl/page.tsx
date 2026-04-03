import WebCrawlPage, {
  metadata as baseMetadata,
} from "@/app/(seo)/capabilities/web-crawl/page";
import { generateLocalizedPageMetadata, type LocalePageParams } from "@/lib/localized-page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  return generateLocalizedPageMetadata(params, "capabilities-web-crawl", baseMetadata);
}

export default function LocalizedWebCrawlPage() {
  return <WebCrawlPage />;
}
