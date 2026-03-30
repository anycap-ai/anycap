import WhatAgentsCantDoPage, {
  metadata as baseMetadata,
} from "@/app/(seo)/learn/what-agents-cant-do/page";
import { generateLocalizedPageMetadata, type LocalePageParams } from "@/lib/localized-page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  return generateLocalizedPageMetadata(params, "learn-what-agents-cant-do", baseMetadata);
}

export default function LocalizedWhatAgentsCantDoPage() {
  return <WhatAgentsCantDoPage />;
}
