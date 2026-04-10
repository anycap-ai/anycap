import HowToBrightenAPhotoOnlinePage from "@/app/(seo)/learn/how-to-brighten-a-photo-online/page";
import {
  getHowToBrightenAPhotoOnlineMetadata,
  HOW_TO_BRIGHTEN_A_PHOTO_ONLINE_PATH,
} from "@/app/(seo)/learn/how-to-brighten-a-photo-online/content";
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
    HOW_TO_BRIGHTEN_A_PHOTO_ONLINE_PATH,
    getHowToBrightenAPhotoOnlineMetadata(locale),
  );
}

export default function LocalizedHowToBrightenAPhotoOnlinePage() {
  return <HowToBrightenAPhotoOnlinePage />;
}
