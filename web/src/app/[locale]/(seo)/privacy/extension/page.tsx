import ExtensionPrivacyPage, {
  metadata as baseMetadata,
} from "@/app/(seo)/privacy/extension/page";
import {
  generateLocalizedPageMetadataForPath,
  type LocalePageParams,
} from "@/lib/localized-page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  return generateLocalizedPageMetadataForPath(
    params,
    "/privacy/extension",
    baseMetadata
  );
}

export default function LocalizedExtensionPrivacyPage() {
  return <ExtensionPrivacyPage />;
}
