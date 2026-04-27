import DriveCapabilityPage from "@/app/(seo)/capabilities/drive/page";
import { getPageMetadata } from "@/app/(seo)/capabilities/drive/metadata";
import { createLocalizedMetadataForPath } from "@/lib/localized-metadata";
import { getValidatedLocale, type LocalePageParams } from "@/lib/localized-page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  const locale = await getValidatedLocale(params);
  if (!locale) {
    return {};
  }

  return createLocalizedMetadataForPath(
    locale,
    "/capabilities/drive",
    getPageMetadata(locale),
  );
}

export default function LocalizedDriveCapabilityPage() {
  return <DriveCapabilityPage />;
}
