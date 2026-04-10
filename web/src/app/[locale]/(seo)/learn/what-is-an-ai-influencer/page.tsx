import WhatIsAnAIInfluencerPage from "@/app/(seo)/learn/what-is-an-ai-influencer/page";
import {
  getWhatIsAnAIInfluencerMetadata,
  WHAT_IS_AN_AI_INFLUENCER_PATH,
} from "@/app/(seo)/learn/what-is-an-ai-influencer/content";
import { createLocalizedMetadataForPath } from "@/lib/localized-metadata";
import { getValidatedLocale, type LocalePageParams } from "@/lib/localized-page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  const locale = await getValidatedLocale(params);
  if (!locale) {
    return {};
  }

  return createLocalizedMetadataForPath(
    locale,
    WHAT_IS_AN_AI_INFLUENCER_PATH,
    getWhatIsAnAIInfluencerMetadata(locale),
  );
}

export default function LocalizedWhatIsAnAIInfluencerPage() {
  return <WhatIsAnAIInfluencerPage />;
}
