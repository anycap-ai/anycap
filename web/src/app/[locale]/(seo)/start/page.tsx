import StartPage, { metadata as baseMetadata } from "@/app/(seo)/start/page";
import { generateLocalizedPageMetadata, type LocalePageParams } from "@/lib/localized-page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  return generateLocalizedPageMetadata(params, "start", baseMetadata);
}

export default function LocalizedStartPage() {
  return <StartPage />;
}
