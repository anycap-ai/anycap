import ForCursorPage, { metadata as baseMetadata } from "@/app/(seo)/for/cursor/page";
import { generateLocalizedPageMetadata, type LocalePageParams } from "@/lib/localized-page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  return generateLocalizedPageMetadata(params, "for-cursor", baseMetadata);
}

export default function LocalizedForCursorPage() {
  return <ForCursorPage />;
}
