import CapabilitiesPage, { metadata as baseMetadata } from "@/app/(seo)/capabilities/page";
import { generateLocalizedPageMetadata, type LocalePageParams } from "@/lib/localized-page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  return generateLocalizedPageMetadata(params, "capabilities", baseMetadata);
}

export default function LocalizedCapabilitiesPage() {
  return <CapabilitiesPage />;
}
