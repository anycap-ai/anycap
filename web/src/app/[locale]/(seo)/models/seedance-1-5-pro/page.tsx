import Seedance15ProPage, {
  metadata as baseMetadata,
} from "@/app/(seo)/models/seedance-1-5-pro/page";
import { generateLocalizedPageMetadata, type LocalePageParams } from "@/lib/localized-page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  return generateLocalizedPageMetadata(params, "models-seedance-1-5-pro", baseMetadata);
}

export default function LocalizedSeedance15ProPage() {
  return <Seedance15ProPage />;
}
