import CompareIndexPage, { metadata as baseMetadata } from "@/app/(seo)/compare/page";
import { generateLocalizedPageMetadata, type LocalePageParams } from "@/lib/localized-page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  return generateLocalizedPageMetadata(params, "compare", baseMetadata);
}

export default function LocalizedCompareIndexPage() {
  return <CompareIndexPage />;
}
