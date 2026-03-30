import ForManusPage, { metadata as baseMetadata } from "@/app/(seo)/for/manus/page";
import { generateLocalizedPageMetadata, type LocalePageParams } from "@/lib/localized-page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  return generateLocalizedPageMetadata(params, "for-manus", baseMetadata);
}

export default function LocalizedForManusPage() {
  return <ForManusPage />;
}
