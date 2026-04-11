import ComparePage from "@/app/(seo)/compare/page";
import { COMPARE_PATH, getCompareMetadata } from "@/app/(seo)/compare/content";
import { createLocalizedMetadataForPath } from "@/lib/localized-metadata";
import { getValidatedLocale, type LocalePageParams } from "@/lib/localized-page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  const locale = await getValidatedLocale(params);
  if (!locale) return {};
  return createLocalizedMetadataForPath(locale, COMPARE_PATH, getCompareMetadata(locale));
}

export default function LocalizedComparePage() {
  return <ComparePage />;
}
