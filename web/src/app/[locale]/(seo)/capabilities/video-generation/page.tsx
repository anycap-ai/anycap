import { createLocalizedMetadataForPath } from "@/lib/localized-metadata";
import { getValidatedLocale, type LocalePageParams } from "@/lib/localized-page";
import {
  getVideoGenerationMetadata,
  VIDEO_GENERATION_PATH,
} from "@/app/(seo)/capabilities/video-generation/content";
import VideoGenerationPage from "@/app/(seo)/capabilities/video-generation/page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  const locale = await getValidatedLocale(params);
  if (!locale) {
    return {};
  }

  return createLocalizedMetadataForPath(
    locale,
    VIDEO_GENERATION_PATH,
    getVideoGenerationMetadata(locale),
  );
}

export default function LocalizedVideoGenerationPage() {
  return <VideoGenerationPage />;
}
