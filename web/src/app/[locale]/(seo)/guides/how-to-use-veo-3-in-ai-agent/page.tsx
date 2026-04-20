import HowToUseVeo3InAiAgentPage, {
  metadata as baseMetadata,
} from "@/app/(seo)/guides/how-to-use-veo-3-in-ai-agent/page";
import { generateLocalizedPageMetadata, type LocalePageParams } from "@/lib/localized-page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  return generateLocalizedPageMetadata(
    params,
    "guides-how-to-use-veo-3-in-ai-agent",
    baseMetadata
  );
}

export default function LocalizedHowToUseVeo3Page() {
  return <HowToUseVeo3InAiAgentPage />;
}
