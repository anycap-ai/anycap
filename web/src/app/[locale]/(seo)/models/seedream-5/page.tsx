import Seedream5Page, { metadata as baseMetadata } from "@/app/(seo)/models/seedream-5/page";
import { generateLocalizedPageMetadata, type LocalePageParams } from "@/lib/localized-page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  return generateLocalizedPageMetadata(params, "models-seedream-5", baseMetadata);
}

export default function LocalizedSeedream5Page() {
  return <Seedream5Page />;
}
