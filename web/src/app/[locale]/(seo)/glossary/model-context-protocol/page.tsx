import McpGlossaryPage, {
  metadata as baseMetadata,
} from "@/app/(seo)/glossary/model-context-protocol/page";
import { generateLocalizedPageMetadata, type LocalePageParams } from "@/lib/localized-page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  return generateLocalizedPageMetadata(params, "glossary-model-context-protocol", baseMetadata);
}

export default function LocalizedMcpGlossaryPage() {
  return <McpGlossaryPage />;
}
