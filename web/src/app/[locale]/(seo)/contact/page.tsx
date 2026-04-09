import ContactPage, { metadata as baseMetadata } from "@/app/(seo)/contact/page";
import { generateLocalizedPageMetadata, type LocalePageParams } from "@/lib/localized-page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  return generateLocalizedPageMetadata(params, "contact", baseMetadata);
}

export default function LocalizedContactPage() {
  return <ContactPage />;
}
