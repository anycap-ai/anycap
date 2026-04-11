import { HubIndexPage } from "@/components/seo/HubIndexPage";
import { createLocalizedMetadataForPath } from "@/lib/localized-metadata";
import { getRequestLocale } from "@/lib/request-locale";
import { defaultLocale } from "@/lib/site";
import { FOR_PATH, getForMetadata, getForPageData } from "./content";

export const runtime = "edge";

export const metadata = createLocalizedMetadataForPath(
  defaultLocale,
  FOR_PATH,
  getForMetadata(defaultLocale),
);

export default async function EquipAgentsIndexPage() {
  const locale = await getRequestLocale();
  const page = getForPageData(locale);
  return <HubIndexPage page={page} breadcrumbItems={page.breadcrumbItems} eyebrow={page.eyebrow} />;
}
