import HowToMakeAIInfluencerVideosPage from "@/app/(seo)/learn/how-to-make-ai-influencer-videos/page";
import {
  getHowToMakeAIInfluencerVideosMetadata,
  HOW_TO_MAKE_AI_INFLUENCER_VIDEOS_PATH,
} from "@/app/(seo)/learn/how-to-make-ai-influencer-videos/content";
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
    HOW_TO_MAKE_AI_INFLUENCER_VIDEOS_PATH,
    getHowToMakeAIInfluencerVideosMetadata(locale),
  );
}

export default function LocalizedHowToMakeAIInfluencerVideosPage() {
  return <HowToMakeAIInfluencerVideosPage />;
}
