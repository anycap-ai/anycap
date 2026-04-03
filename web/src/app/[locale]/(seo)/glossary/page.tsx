import GlossaryIndexPage, { metadata as baseMetadata } from "@/app/(seo)/glossary/page";
import { generateLocalizedPageMetadata, type LocalePageParams } from "@/lib/localized-page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  return generateLocalizedPageMetadata(params, "glossary", baseMetadata);
}

export default function LocalizedGlossaryIndexPage() {
  return <GlossaryIndexPage />;
}
