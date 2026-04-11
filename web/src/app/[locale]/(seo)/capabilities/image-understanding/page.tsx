import ImageUnderstandingPage from "@/app/(seo)/capabilities/image-understanding/page";
import {
  getImageUnderstandingMetadata,
  IMAGE_UNDERSTANDING_PATH,
} from "@/app/(seo)/capabilities/image-understanding/content";
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
    IMAGE_UNDERSTANDING_PATH,
    getImageUnderstandingMetadata(locale),
  );
}

export default function LocalizedImageUnderstandingPage() {
  return <ImageUnderstandingPage />;
}
