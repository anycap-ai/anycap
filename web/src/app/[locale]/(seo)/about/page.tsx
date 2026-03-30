import AboutPage, { metadata as baseMetadata } from "@/app/(seo)/about/page";
import { generateLocalizedPageMetadata, type LocalePageParams } from "@/lib/localized-page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  return generateLocalizedPageMetadata(params, "about", baseMetadata);
}

export default function LocalizedAboutPage() {
  return <AboutPage />;
}
