import HowToMakeImageTransparentPage from "@/app/(seo)/learn/how-to-make-image-transparent/page";
import {
  getHowToMakeImageTransparentMetadata,
  HOW_TO_MAKE_IMAGE_TRANSPARENT_PATH,
} from "@/app/(seo)/learn/how-to-make-image-transparent/content";
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
    HOW_TO_MAKE_IMAGE_TRANSPARENT_PATH,
    getHowToMakeImageTransparentMetadata(locale),
  );
}

export default function LocalizedHowToMakeImageTransparentPage() {
  return <HowToMakeImageTransparentPage />;
}
