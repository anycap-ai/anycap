import PageComponent, {
  metadata as baseMetadata,
} from "@/app/(seo)/guides/how-to-add-video-generation-to-ai-agent/page";
import { generateLocalizedPageMetadata, type LocalePageParams } from "@/lib/localized-page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  return generateLocalizedPageMetadata(params, "guides-how-to-add-video-generation-to-ai-agent", baseMetadata);
}

export default function LocalizedPage() {
  return <PageComponent />;
}
