import HowToMakeAIInfluencersPage from "@/app/(seo)/learn/how-to-make-ai-influencers/page";
import {
  getHowToMakeAIInfluencersMetadata,
  HOW_TO_MAKE_AI_INFLUENCERS_PATH,
} from "@/app/(seo)/learn/how-to-make-ai-influencers/content";
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
    HOW_TO_MAKE_AI_INFLUENCERS_PATH,
    getHowToMakeAIInfluencersMetadata(locale),
  );
}

export default function LocalizedHowToMakeAIInfluencersPage() {
  return <HowToMakeAIInfluencersPage />;
}
