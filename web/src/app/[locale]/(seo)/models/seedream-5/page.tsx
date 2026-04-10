import { createLocalizedMetadataForPath } from "@/lib/localized-metadata";
import { getValidatedLocale, type LocalePageParams } from "@/lib/localized-page";
import { getSeedream5Metadata, SEEDREAM_5_PATH } from "@/app/(seo)/models/seedream-5/content";
import Seedream5Page from "@/app/(seo)/models/seedream-5/page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  const locale = await getValidatedLocale(params);
  if (!locale) {
    return {};
  }

  return createLocalizedMetadataForPath(locale, SEEDREAM_5_PATH, getSeedream5Metadata(locale));
}

export default function LocalizedSeedream5Page() {
  return <Seedream5Page />;
}
