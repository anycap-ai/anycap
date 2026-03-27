import ImageGenerationPage, {

  metadata as baseMetadata,
} from "@/app/(seo)/capabilities/image-generation/page";
import { generateLocalizedPageMetadata, type LocalePageParams } from "@/lib/localized-page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  return generateLocalizedPageMetadata(params, "capabilities-image-generation", baseMetadata);
}

export default function LocalizedImageGenerationPage() {
  return <ImageGenerationPage />;
}
