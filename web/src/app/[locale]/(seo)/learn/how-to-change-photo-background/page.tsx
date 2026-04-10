import HowToChangePhotoBackgroundPage from "@/app/(seo)/learn/how-to-change-photo-background/page";
import {
  getHowToChangePhotoBackgroundMetadata,
  HOW_TO_CHANGE_PHOTO_BACKGROUND_PATH,
} from "@/app/(seo)/learn/how-to-change-photo-background/content";
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
    HOW_TO_CHANGE_PHOTO_BACKGROUND_PATH,
    getHowToChangePhotoBackgroundMetadata(locale),
  );
}

export default function LocalizedHowToChangePhotoBackgroundPage() {
  return <HowToChangePhotoBackgroundPage />;
}
