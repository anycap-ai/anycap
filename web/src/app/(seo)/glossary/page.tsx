import { HubIndexPage } from "@/components/seo/HubIndexPage";
import { createLocalizedMetadataForPath } from "@/lib/localized-metadata";
import { defaultLocale } from "@/lib/site";
import { getRequestLocale } from "@/lib/request-locale";
import { getGlossaryMetadata, getGlossaryPageData, GLOSSARY_PATH } from "./content";

export const runtime = "edge";

export const metadata = createLocalizedMetadataForPath(
  defaultLocale,
  GLOSSARY_PATH,
  getGlossaryMetadata(defaultLocale),
);

export default async function GlossaryIndexPage() {
  const locale = await getRequestLocale();
  const page = getGlossaryPageData(locale);

  return <HubIndexPage page={page} />;
}
