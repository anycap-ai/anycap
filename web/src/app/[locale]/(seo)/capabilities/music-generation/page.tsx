import MusicGenerationPage, {
  metadata as baseMetadata,
} from "@/app/(seo)/capabilities/music-generation/page";
import { generateLocalizedPageMetadata, type LocalePageParams } from "@/lib/localized-page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  return generateLocalizedPageMetadata(params, "capabilities-music-generation", baseMetadata);
}

export default function LocalizedMusicGenerationPage() {
  return <MusicGenerationPage />;
}
