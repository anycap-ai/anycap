import StartPage from "@/app/(seo)/start/page";
import { getStartMetadata, START_PATH } from "@/app/(seo)/start/content";
import { createLocalizedMetadataForPath } from "@/lib/localized-metadata";
import { getValidatedLocale, type LocalePageParams } from "@/lib/localized-page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  const locale = await getValidatedLocale(params);
  if (!locale) return {};
  return createLocalizedMetadataForPath(locale, START_PATH, getStartMetadata(locale));
}

export default function LocalizedStartPage() {
  return <StartPage />;
}
