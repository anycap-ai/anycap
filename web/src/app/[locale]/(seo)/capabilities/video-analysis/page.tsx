import VideoAnalysisPage, {

  metadata as baseMetadata,
} from "@/app/(seo)/capabilities/video-analysis/page";
import { generateLocalizedPageMetadata, type LocalePageParams } from "@/lib/localized-page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  return generateLocalizedPageMetadata(params, "capabilities-video-analysis", baseMetadata);
}

export default function LocalizedVideoAnalysisPage() {
  return <VideoAnalysisPage />;
}
