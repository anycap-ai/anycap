import PageComponent from "@/app/(seo)/guides/how-to-add-vision-to-ai-agent/page";
import { getPageMetadata } from "@/app/(seo)/guides/how-to-add-vision-to-ai-agent/metadata";
import { getValidatedLocale, type LocalePageParams } from "@/lib/localized-page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  const locale = await getValidatedLocale(params);
  return locale ? getPageMetadata(locale) : {};
}

export default function LocalizedPage() {
  return <PageComponent />;
}
