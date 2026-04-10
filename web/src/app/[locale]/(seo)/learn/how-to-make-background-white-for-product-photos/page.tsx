import HowToMakeBackgroundWhiteForProductPhotosPage from "@/app/(seo)/learn/how-to-make-background-white-for-product-photos/page";
import {
  getHowToMakeBackgroundWhiteForProductPhotosMetadata,
  HOW_TO_MAKE_BACKGROUND_WHITE_FOR_PRODUCT_PHOTOS_PATH,
} from "@/app/(seo)/learn/how-to-make-background-white-for-product-photos/content";
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
    HOW_TO_MAKE_BACKGROUND_WHITE_FOR_PRODUCT_PHOTOS_PATH,
    getHowToMakeBackgroundWhiteForProductPhotosMetadata(locale),
  );
}

export default function LocalizedHowToMakeBackgroundWhiteForProductPhotosPage() {
  return <HowToMakeBackgroundWhiteForProductPhotosPage />;
}
