import HowToRemovePeopleFromPhotosPage from "@/app/(seo)/learn/how-to-remove-people-from-photos/page";
import {
  getHowToRemovePeopleFromPhotosMetadata,
  HOW_TO_REMOVE_PEOPLE_FROM_PHOTOS_PATH,
} from "@/app/(seo)/learn/how-to-remove-people-from-photos/content";
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
    HOW_TO_REMOVE_PEOPLE_FROM_PHOTOS_PATH,
    getHowToRemovePeopleFromPhotosMetadata(locale),
  );
}

export default function LocalizedHowToRemovePeopleFromPhotosPage() {
  return <HowToRemovePeopleFromPhotosPage />;
}
