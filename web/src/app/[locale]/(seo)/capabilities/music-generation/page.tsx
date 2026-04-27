import MusicGenerationPage from "@/app/(seo)/capabilities/music-generation/page";
import { getPageMetadata } from "@/app/(seo)/capabilities/music-generation/metadata";
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
    "/capabilities/music-generation",
    getPageMetadata(locale),
  );
}

export default function LocalizedMusicGenerationPage() {
  return <MusicGenerationPage />;
}
