import PhotoToDrawingPage from "@/app/(seo)/learn/how-to-make-a-photo-into-a-drawing/page";
import {
  getPhotoToDrawingMetadata,
  HOW_TO_MAKE_A_PHOTO_INTO_A_DRAWING_PATH,
} from "@/app/(seo)/learn/how-to-make-a-photo-into-a-drawing/content";
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
    HOW_TO_MAKE_A_PHOTO_INTO_A_DRAWING_PATH,
    getPhotoToDrawingMetadata(locale),
  );
}

export default function LocalizedPhotoToDrawingPage() {
  return <PhotoToDrawingPage />;
}
