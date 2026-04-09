import PrivacyPage, { metadata as baseMetadata } from "@/app/(seo)/privacy/page";
import { generateLocalizedPageMetadata, type LocalePageParams } from "@/lib/localized-page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  return generateLocalizedPageMetadata(params, "privacy", baseMetadata);
}

export default function LocalizedPrivacyPage() {
  return <PrivacyPage />;
}
