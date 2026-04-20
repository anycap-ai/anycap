import BestVideoGenApiForAgentsPage, {
  metadata as baseMetadata,
} from "@/app/(seo)/learn/best-video-generation-api-for-ai-agents-2026/page";
import { generateLocalizedPageMetadata, type LocalePageParams } from "@/lib/localized-page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  return generateLocalizedPageMetadata(
    params,
    "learn-best-video-generation-api-for-ai-agents-2026",
    baseMetadata
  );
}

export default function LocalizedBestVideoGenApiPage() {
  return <BestVideoGenApiForAgentsPage />;
}
