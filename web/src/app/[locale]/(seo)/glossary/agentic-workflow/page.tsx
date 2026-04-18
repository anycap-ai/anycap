import AgenticWorkflowGlossaryPage, {
  metadata as baseMetadata,
} from "@/app/(seo)/glossary/agentic-workflow/page";
import { generateLocalizedPageMetadata, type LocalePageParams } from "@/lib/localized-page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  return generateLocalizedPageMetadata(params, "glossary-agentic-workflow", baseMetadata);
}

export default function LocalizedAgenticWorkflowGlossaryPage() {
  return <AgenticWorkflowGlossaryPage />;
}
