import Kling30Page, { metadata as baseMetadata } from "@/app/(seo)/models/kling-3-0/page";
import { generateLocalizedPageMetadata, type LocalePageParams } from "@/lib/localized-page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  return generateLocalizedPageMetadata(params, "models-kling-3-0", baseMetadata);
}

export default function LocalizedKling30Page() {
  return <Kling30Page />;
}
