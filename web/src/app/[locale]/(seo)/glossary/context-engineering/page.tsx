import ContextEngineeringGlossaryPage, {

  metadata as baseMetadata,
} from "@/app/(seo)/glossary/context-engineering/page";
import { generateLocalizedPageMetadata, type LocalePageParams } from "@/lib/localized-page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  return generateLocalizedPageMetadata(params, "glossary-context-engineering", baseMetadata);
}

export default function LocalizedContextEngineeringGlossaryPage() {
  return <ContextEngineeringGlossaryPage />;
}
