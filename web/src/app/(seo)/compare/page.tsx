import { HubIndexPage } from "@/components/seo/HubIndexPage";
import { createLocalizedMetadataForPath } from "@/lib/localized-metadata";
import { getRequestLocale } from "@/lib/request-locale";
import { defaultLocale } from "@/lib/site";
import { COMPARE_PATH, getCompareMetadata, getComparePageData } from "./content";

export const runtime = "edge";

export const metadata = createLocalizedMetadataForPath(
  defaultLocale,
  COMPARE_PATH,
  getCompareMetadata(defaultLocale),
);

export default async function CompareIndexPage() {
  const locale = await getRequestLocale();
  const page = getComparePageData(locale);
  return <HubIndexPage page={page} breadcrumbItems={page.breadcrumbItems} eyebrow={page.eyebrow} />;
}
