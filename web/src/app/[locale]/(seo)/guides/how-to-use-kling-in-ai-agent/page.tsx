import HowToUseKlingInAiAgentPage, {
  metadata as baseMetadata,
} from "@/app/(seo)/guides/how-to-use-kling-in-ai-agent/page";
import { generateLocalizedPageMetadata, type LocalePageParams } from "@/lib/localized-page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  return generateLocalizedPageMetadata(
    params,
    "guides-how-to-use-kling-in-ai-agent",
    baseMetadata
  );
}

export default function LocalizedHowToUseKlingPage() {
  return <HowToUseKlingInAiAgentPage />;
}
