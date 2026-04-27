import GroundedWebSearchPage from "@/app/(seo)/capabilities/grounded-web-search/page";
import { getPageMetadata } from "@/app/(seo)/capabilities/grounded-web-search/metadata";
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
    "/capabilities/grounded-web-search",
    getPageMetadata(locale),
  );
}

export default function LocalizedGroundedWebSearchPage() {
  return <GroundedWebSearchPage />;
}
