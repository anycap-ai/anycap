import AgentSkillsForDeveloperToolsPage from "@/app/(seo)/guides/agent-skills-for-developer-tools/page";
import { getPageMetadata } from "@/app/(seo)/guides/agent-skills-for-developer-tools/metadata";
import { getValidatedLocale, type LocalePageParams } from "@/lib/localized-page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  const locale = await getValidatedLocale(params);
  return locale ? getPageMetadata(locale) : {};
}

export default function LocalizedAgentSkillsForDeveloperToolsPage() {
  return <AgentSkillsForDeveloperToolsPage />;
}
