import { HubIndexPage } from "@/components/seo/HubIndexPage";
import { createLocalizedMetadataForPath } from "@/lib/localized-metadata";
import { defaultLocale } from "@/lib/site";
import { getGlossaryMetadata, getGlossaryPageData, GLOSSARY_PATH } from "./content";

export const runtime = "edge";

const page = getGlossaryPageData(defaultLocale);

export const metadata = createLocalizedMetadataForPath(
  defaultLocale,
  GLOSSARY_PATH,
  getGlossaryMetadata(defaultLocale),
);

export default function GlossaryIndexPage() {
  return <HubIndexPage page={page} />;
}
