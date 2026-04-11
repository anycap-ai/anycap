import ForCodexPage from "@/app/(seo)/for/codex/page";
import { createLocalizedMetadataForPath } from "@/lib/localized-metadata";
import { getValidatedLocale, type LocalePageParams } from "@/lib/localized-page";
import { FOR_CODEX_PATH, getForCodexMetadata } from "./content";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  const locale = await getValidatedLocale(params);
  if (!locale) return {};

  return createLocalizedMetadataForPath(locale, FOR_CODEX_PATH, getForCodexMetadata(locale));
}

export default function LocalizedForCodexPage() {
  return <ForCodexPage />;
}
