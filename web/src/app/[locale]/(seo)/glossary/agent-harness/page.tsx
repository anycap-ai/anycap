import AgentHarnessGlossaryPage, {

  metadata as baseMetadata,
} from "@/app/(seo)/glossary/agent-harness/page";
import { generateLocalizedPageMetadata, type LocalePageParams } from "@/lib/localized-page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  return generateLocalizedPageMetadata(params, "glossary-agent-harness", baseMetadata);
}

export default function LocalizedAgentHarnessGlossaryPage() {
  return <AgentHarnessGlossaryPage />;
}
