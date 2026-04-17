import DriveCapabilityPage from "@/app/(seo)/capabilities/drive/page";
import { getPageMetadata } from "@/app/(seo)/capabilities/drive/metadata";
import { getValidatedLocale, type LocalePageParams } from "@/lib/localized-page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  const locale = await getValidatedLocale(params);
  return locale ? getPageMetadata(locale) : {};
}

export default function LocalizedDriveCapabilityPage() {
  return <DriveCapabilityPage />;
}
