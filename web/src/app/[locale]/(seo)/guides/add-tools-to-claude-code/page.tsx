import AddToolsToClaudeCodeGuidePage, {

  metadata as baseMetadata,
} from "@/app/(seo)/guides/add-tools-to-claude-code/page";
import { generateLocalizedPageMetadata, type LocalePageParams } from "@/lib/localized-page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  return generateLocalizedPageMetadata(params, "guides-add-tools-to-claude-code", baseMetadata);
}

export default function LocalizedAddToolsToClaudeCodeGuidePage() {
  return <AddToolsToClaudeCodeGuidePage />;
}
