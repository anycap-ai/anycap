import Veo31Page, { metadata as baseMetadata } from "@/app/(seo)/models/veo-3-1/page";
import { generateLocalizedPageMetadata, type LocalePageParams } from "@/lib/localized-page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  return generateLocalizedPageMetadata(params, "models-veo-3-1", baseMetadata);
}

export default function LocalizedVeo31Page() {
  return <Veo31Page />;
}
