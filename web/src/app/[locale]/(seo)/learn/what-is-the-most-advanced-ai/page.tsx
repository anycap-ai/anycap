import WhatIsTheMostAdvancedAIPage, {
  metadata as baseMetadata,
} from "@/app/(seo)/learn/what-is-the-most-advanced-ai/page";
import { generateLocalizedPageMetadata, type LocalePageParams } from "@/lib/localized-page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  return generateLocalizedPageMetadata(params, "learn-what-is-the-most-advanced-ai", baseMetadata);
}

export default function LocalizedWhatIsTheMostAdvancedAIPage() {
  return <WhatIsTheMostAdvancedAIPage />;
}
