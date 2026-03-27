import WhatIsAgentHarnessPage, {

  metadata as baseMetadata,
} from "@/app/(seo)/guides/what-is-agent-harness/page";
import { generateLocalizedPageMetadata, type LocalePageParams } from "@/lib/localized-page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  return generateLocalizedPageMetadata(params, "guides-what-is-agent-harness", baseMetadata);
}

export default function LocalizedWhatIsAgentHarnessPage() {
  return <WhatIsAgentHarnessPage />;
}
