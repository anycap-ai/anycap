import { HubIndexPage } from "@/components/seo/HubIndexPage";
import { createLocalizedMetadataForPath } from "@/lib/localized-metadata";
import { getRequestLocale } from "@/lib/request-locale";
import { defaultLocale } from "@/lib/site";
import { GUIDES_PATH, getGuidesMetadata, getGuidesPageData } from "./content";

export const runtime = "edge";
export const metadata = createLocalizedMetadataForPath(
  defaultLocale,
  GUIDES_PATH,
  getGuidesMetadata(defaultLocale),
);

export default async function GuidesIndexPage() {
  const locale = await getRequestLocale();
  const page = getGuidesPageData(locale);
  return <HubIndexPage page={page} breadcrumbItems={page.breadcrumbItems} eyebrow={page.eyebrow} />;
}
