import AIImageToVideoPage from "@/app/(seo)/learn/ai-video-generator-from-image/page";
import {
  AI_VIDEO_GENERATOR_FROM_IMAGE_PATH,
  getAiVideoGeneratorFromImageMetadata,
} from "@/app/(seo)/learn/ai-video-generator-from-image/content";
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
    AI_VIDEO_GENERATOR_FROM_IMAGE_PATH,
    getAiVideoGeneratorFromImageMetadata(locale),
  );
}

export default function LocalizedAIImageToVideoPage() {
  return <AIImageToVideoPage />;
}
