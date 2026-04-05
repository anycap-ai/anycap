import NanoBanana2Page, {
  metadata as baseMetadata,
} from "@/app/(seo)/models/nano-banana-2/page";
import { generateLocalizedPageMetadata, type LocalePageParams } from "@/lib/localized-page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  return generateLocalizedPageMetadata(params, "models-nano-banana-2", baseMetadata);
}

export default function LocalizedNanoBanana2Page() {
  return <NanoBanana2Page />;
}
