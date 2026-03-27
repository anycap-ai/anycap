import VideoGenerationPage, {

  metadata as baseMetadata,
} from "@/app/(seo)/capabilities/video-generation/page";
import { generateLocalizedPageMetadata, type LocalePageParams } from "@/lib/localized-page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  return generateLocalizedPageMetadata(params, "capabilities-video-generation", baseMetadata);
}

export default function LocalizedVideoGenerationPage() {
  return <VideoGenerationPage />;
}
