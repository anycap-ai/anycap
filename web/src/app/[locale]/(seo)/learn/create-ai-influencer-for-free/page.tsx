import CreateAIInfluencerForFreePage from "@/app/(seo)/learn/create-ai-influencer-for-free/page";
import {
  CREATE_AI_INFLUENCER_FOR_FREE_PATH,
  getCreateAIInfluencerForFreeMetadata,
} from "@/app/(seo)/learn/create-ai-influencer-for-free/content";
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
    CREATE_AI_INFLUENCER_FOR_FREE_PATH,
    getCreateAIInfluencerForFreeMetadata(locale),
  );
}

export default function LocalizedCreateAIInfluencerForFreePage() {
  return <CreateAIInfluencerForFreePage />;
}
