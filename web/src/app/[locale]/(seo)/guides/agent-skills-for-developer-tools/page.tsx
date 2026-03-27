import AgentSkillsForDeveloperToolsPage, {

  metadata as baseMetadata,
} from "@/app/(seo)/guides/agent-skills-for-developer-tools/page";
import { generateLocalizedPageMetadata, type LocalePageParams } from "@/lib/localized-page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  return generateLocalizedPageMetadata(
    params,
    "guides-agent-skills-for-developer-tools",
    baseMetadata
  );
}

export default function LocalizedAgentSkillsForDeveloperToolsPage() {
  return <AgentSkillsForDeveloperToolsPage />;
}
