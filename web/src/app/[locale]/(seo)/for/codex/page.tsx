import ForCodexPage, { metadata as baseMetadata } from "@/app/(seo)/for/codex/page";
import { generateLocalizedPageMetadata, type LocalePageParams } from "@/lib/localized-page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  return generateLocalizedPageMetadata(params, "for-codex", baseMetadata);
}

export default function LocalizedForCodexPage() {
  return <ForCodexPage />;
}
