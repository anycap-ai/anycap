import CapabilitiesPage from "@/app/(seo)/capabilities/page";
import { getCapabilitiesMetadata, CAPABILITIES_PATH } from "@/app/(seo)/capabilities/content";
import { createLocalizedMetadataForPath } from "@/lib/localized-metadata";
import { getValidatedLocale, type LocalePageParams } from "@/lib/localized-page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  const locale = await getValidatedLocale(params);
  if (!locale) return {};
  return createLocalizedMetadataForPath(locale, CAPABILITIES_PATH, getCapabilitiesMetadata(locale));
}

export default function LocalizedCapabilitiesPage() {
  return <CapabilitiesPage />;
}
