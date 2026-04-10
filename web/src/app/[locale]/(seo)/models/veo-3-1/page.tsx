import { createLocalizedMetadataForPath } from "@/lib/localized-metadata";
import { getValidatedLocale, type LocalePageParams } from "@/lib/localized-page";
import { getVeo31Metadata, VEO_31_PATH } from "@/app/(seo)/models/veo-3-1/content";
import Veo31Page from "@/app/(seo)/models/veo-3-1/page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  const locale = await getValidatedLocale(params);
  if (!locale) {
    return {};
  }

  return createLocalizedMetadataForPath(locale, VEO_31_PATH, getVeo31Metadata(locale));
}

export default function LocalizedVeo31Page() {
  return <Veo31Page />;
}
