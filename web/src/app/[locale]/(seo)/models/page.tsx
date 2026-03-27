import ModelsPage, { metadata as baseMetadata } from "@/app/(seo)/models/page";
import { generateLocalizedPageMetadata, type LocalePageParams } from "@/lib/localized-page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  return generateLocalizedPageMetadata(params, "models", baseMetadata);
}

export default function LocalizedModelsPage() {
  return <ModelsPage />;
}
