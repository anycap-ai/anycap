import EquipAgentsIndexPage, { metadata as baseMetadata } from "@/app/(seo)/for/page";
import { generateLocalizedPageMetadata, type LocalePageParams } from "@/lib/localized-page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  return generateLocalizedPageMetadata(params, "for", baseMetadata);
}

export default function LocalizedEquipAgentsIndexPage() {
  return <EquipAgentsIndexPage />;
}
