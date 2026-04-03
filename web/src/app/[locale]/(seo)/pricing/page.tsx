import PricingPage, { metadata as baseMetadata } from "@/app/(seo)/pricing/page";
import { generateLocalizedPageMetadata, type LocalePageParams } from "@/lib/localized-page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  return generateLocalizedPageMetadata(params, "pricing", baseMetadata);
}

export default function LocalizedPricingPage() {
  return <PricingPage />;
}
