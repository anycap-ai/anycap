import HowToMakeBackgroundWhiteForProductPhotosPage, {
  metadata as baseMetadata,
} from "@/app/(seo)/learn/how-to-make-background-white-for-product-photos/page";
import { generateLocalizedPageMetadata, type LocalePageParams } from "@/lib/localized-page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  return generateLocalizedPageMetadata(
    params,
    "learn-how-to-make-background-white-for-product-photos",
    baseMetadata
  );
}

export default function LocalizedHowToMakeBackgroundWhiteForProductPhotosPage() {
  return <HowToMakeBackgroundWhiteForProductPhotosPage />;
}
