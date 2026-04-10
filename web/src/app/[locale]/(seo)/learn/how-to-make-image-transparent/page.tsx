import HowToMakeImageTransparentPage, {
  metadata as baseMetadata,
} from "@/app/(seo)/learn/how-to-make-image-transparent/page";
import { generateLocalizedPageMetadata, type LocalePageParams } from "@/lib/localized-page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  return generateLocalizedPageMetadata(params, "learn-how-to-make-image-transparent", baseMetadata);
}

export default function LocalizedHowToMakeImageTransparentPage() {
  return <HowToMakeImageTransparentPage />;
}
