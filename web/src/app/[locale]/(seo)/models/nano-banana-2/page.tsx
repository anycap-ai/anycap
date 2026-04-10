import { createLocalizedMetadataForPath } from "@/lib/localized-metadata";
import { getValidatedLocale, type LocalePageParams } from "@/lib/localized-page";
import {
  getNanoBanana2Metadata,
  NANO_BANANA_2_PATH,
} from "@/app/(seo)/models/nano-banana-2/content";
import NanoBanana2Page from "@/app/(seo)/models/nano-banana-2/page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  const locale = await getValidatedLocale(params);
  if (!locale) {
    return {};
  }

  return createLocalizedMetadataForPath(
    locale,
    NANO_BANANA_2_PATH,
    getNanoBanana2Metadata(locale),
  );
}

export default function LocalizedNanoBanana2Page() {
  return <NanoBanana2Page />;
}
