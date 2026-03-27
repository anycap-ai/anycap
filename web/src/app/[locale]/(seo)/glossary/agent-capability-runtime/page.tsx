import AgentCapabilityRuntimeGlossaryPage, {

  metadata as baseMetadata,
} from "@/app/(seo)/glossary/agent-capability-runtime/page";
import { generateLocalizedPageMetadata, type LocalePageParams } from "@/lib/localized-page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  return generateLocalizedPageMetadata(params, "glossary-agent-capability-runtime", baseMetadata);
}

export default function LocalizedAgentCapabilityRuntimeGlossaryPage() {
  return <AgentCapabilityRuntimeGlossaryPage />;
}
