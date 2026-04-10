import { createLocalizedMetadataForPath } from "@/lib/localized-metadata";
import { getValidatedLocale, type LocalePageParams } from "@/lib/localized-page";
import {
  getSeedance15ProMetadata,
  SEEDANCE_15_PRO_PATH,
} from "@/app/(seo)/models/seedance-1-5-pro/content";
import Seedance15ProPage from "@/app/(seo)/models/seedance-1-5-pro/page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  const locale = await getValidatedLocale(params);
  if (!locale) {
    return {};
  }

  return createLocalizedMetadataForPath(
    locale,
    SEEDANCE_15_PRO_PATH,
    getSeedance15ProMetadata(locale),
  );
}

export default function LocalizedSeedance15ProPage() {
  return <Seedance15ProPage />;
}
