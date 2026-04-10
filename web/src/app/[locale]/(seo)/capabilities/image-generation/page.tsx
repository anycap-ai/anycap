import ImageGenerationPage from "@/app/(seo)/capabilities/image-generation/page";
import {
  getImageGenerationMetadata,
  IMAGE_GENERATION_PATH,
} from "@/app/(seo)/capabilities/image-generation/content";
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
    IMAGE_GENERATION_PATH,
    getImageGenerationMetadata(locale),
  );
}

export default function LocalizedImageGenerationPage() {
  return <ImageGenerationPage />;
}
