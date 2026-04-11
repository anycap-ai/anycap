import ForPage from "@/app/(seo)/for/page";
import { FOR_PATH, getForMetadata } from "@/app/(seo)/for/content";
import { createLocalizedMetadataForPath } from "@/lib/localized-metadata";
import { getValidatedLocale, type LocalePageParams } from "@/lib/localized-page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  const locale = await getValidatedLocale(params);
  if (!locale) return {};
  return createLocalizedMetadataForPath(locale, FOR_PATH, getForMetadata(locale));
}

export default function LocalizedForPage() {
  return <ForPage />;
}
