import { createLocalizedMetadataForPath } from "@/lib/localized-metadata";
import { getValidatedLocale, type LocalePageParams } from "@/lib/localized-page";
import {
  ELEVENLABS_MUSIC_PATH,
  getElevenLabsMusicMetadata,
} from "@/app/(seo)/models/elevenlabs-music/content";
import ElevenLabsMusicPage from "@/app/(seo)/models/elevenlabs-music/page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  const locale = await getValidatedLocale(params);
  if (!locale) {
    return {};
  }

  return createLocalizedMetadataForPath(
    locale,
    ELEVENLABS_MUSIC_PATH,
    getElevenLabsMusicMetadata(locale),
  );
}

export default function LocalizedElevenLabsMusicPage() {
  return <ElevenLabsMusicPage />;
}
