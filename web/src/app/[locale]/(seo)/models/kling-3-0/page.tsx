import { createLocalizedMetadataForPath } from "@/lib/localized-metadata";
import { getValidatedLocale, type LocalePageParams } from "@/lib/localized-page";
import { getKling30Metadata, KLING_30_PATH } from "@/app/(seo)/models/kling-3-0/content";
import Kling30Page from "@/app/(seo)/models/kling-3-0/page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  const locale = await getValidatedLocale(params);
  if (!locale) {
    return {};
  }

  return createLocalizedMetadataForPath(locale, KLING_30_PATH, getKling30Metadata(locale));
}

export default function LocalizedKling30Page() {
  return <Kling30Page />;
}
