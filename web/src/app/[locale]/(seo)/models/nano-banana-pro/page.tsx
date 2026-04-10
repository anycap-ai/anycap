import { createLocalizedMetadataForPath } from "@/lib/localized-metadata";
import { getValidatedLocale, type LocalePageParams } from "@/lib/localized-page";
import {
  getNanoBananaProMetadata,
  NANO_BANANA_PRO_PATH,
} from "@/app/(seo)/models/nano-banana-pro/content";
import NanoBananaProPage from "@/app/(seo)/models/nano-banana-pro/page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  const locale = await getValidatedLocale(params);
  if (!locale) {
    return {};
  }

  return createLocalizedMetadataForPath(
    locale,
    NANO_BANANA_PRO_PATH,
    getNanoBananaProMetadata(locale),
  );
}

export default function LocalizedNanoBananaProPage() {
  return <NanoBananaProPage />;
}
