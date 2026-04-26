import AudioUnderstandingPage from "@/app/(seo)/capabilities/audio-understanding/page";
import { getPageMetadata } from "@/app/(seo)/capabilities/audio-understanding/metadata";
import { createLocalizedMetadataForPath } from "@/lib/localized-metadata";
import { getValidatedLocale, type LocalePageParams } from "@/lib/localized-page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  const locale = await getValidatedLocale(params);
  if (!locale) {
    return {};
  }

  return createLocalizedMetadataForPath(
    locale,
    "/capabilities/audio-understanding",
    getPageMetadata(locale),
  );
}

export default function LocalizedAudioUnderstandingPage() {
  return <AudioUnderstandingPage />;
}
