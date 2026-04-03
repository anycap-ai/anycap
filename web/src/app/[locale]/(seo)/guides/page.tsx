import GuidesIndexPage, { metadata as baseMetadata } from "@/app/(seo)/guides/page";
import { generateLocalizedPageMetadata, type LocalePageParams } from "@/lib/localized-page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  return generateLocalizedPageMetadata(params, "guides", baseMetadata);
}

export default function LocalizedGuidesIndexPage() {
  return <GuidesIndexPage />;
}
