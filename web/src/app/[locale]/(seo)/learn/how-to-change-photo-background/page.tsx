import HowToChangePhotoBackgroundPage, {
  metadata as baseMetadata,
} from "@/app/(seo)/learn/how-to-change-photo-background/page";
import { generateLocalizedPageMetadata, type LocalePageParams } from "@/lib/localized-page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  return generateLocalizedPageMetadata(params, "learn-how-to-change-photo-background", baseMetadata);
}

export default function LocalizedHowToChangePhotoBackgroundPage() {
  return <HowToChangePhotoBackgroundPage />;
}
