import ImageReadPage, {

  metadata as baseMetadata,
} from "@/app/(seo)/capabilities/image-read/page";
import { generateLocalizedPageMetadata, type LocalePageParams } from "@/lib/localized-page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  return generateLocalizedPageMetadata(params, "capabilities-image-read", baseMetadata);
}

export default function LocalizedImageReadPage() {
  return <ImageReadPage />;
}
