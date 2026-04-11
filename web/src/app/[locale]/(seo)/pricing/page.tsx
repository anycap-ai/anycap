import PricingPage from "@/app/(seo)/pricing/page";
import { getPricingMetadata, PRICING_PATH } from "@/app/(seo)/pricing/content";
import { createLocalizedMetadataForPath } from "@/lib/localized-metadata";
import { getValidatedLocale, type LocalePageParams } from "@/lib/localized-page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  const locale = await getValidatedLocale(params);
  if (!locale) {
    return {};
  }

  return createLocalizedMetadataForPath(locale, PRICING_PATH, getPricingMetadata(locale));
}

export default function LocalizedPricingPage() {
  return <PricingPage />;
}
