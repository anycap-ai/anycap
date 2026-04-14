import WhatIsAgentHarnessPage from "@/app/(seo)/guides/what-is-agent-harness/page";
import { getPageMetadata } from "@/app/(seo)/guides/what-is-agent-harness/metadata";
import { getValidatedLocale, type LocalePageParams } from "@/lib/localized-page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  const locale = await getValidatedLocale(params);
  return locale ? getPageMetadata(locale) : {};
}

export default function LocalizedWhatIsAgentHarnessPage() {
  return <WhatIsAgentHarnessPage />;
}
