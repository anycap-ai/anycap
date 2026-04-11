import ForCursorPage from "@/app/(seo)/for/cursor/page";
import { createLocalizedMetadataForPath } from "@/lib/localized-metadata";
import { getValidatedLocale, type LocalePageParams } from "@/lib/localized-page";
import { FOR_CURSOR_PATH, getForCursorMetadata } from "./content";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  const locale = await getValidatedLocale(params);
  if (!locale) return {};
  return createLocalizedMetadataForPath(locale, FOR_CURSOR_PATH, getForCursorMetadata(locale));
}

export default function LocalizedForCursorPage() {
  return <ForCursorPage />;
}
