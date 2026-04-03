import AudioUnderstandingPage, {
  metadata as baseMetadata,
} from "@/app/(seo)/capabilities/audio-understanding/page";
import { generateLocalizedPageMetadata, type LocalePageParams } from "@/lib/localized-page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  return generateLocalizedPageMetadata(params, "capabilities-audio-understanding", baseMetadata);
}

export default function LocalizedAudioUnderstandingPage() {
  return <AudioUnderstandingPage />;
}
