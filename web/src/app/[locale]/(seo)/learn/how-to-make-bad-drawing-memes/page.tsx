import HowToMakeBadDrawingMemesPage, {
  metadata as baseMetadata,
} from "@/app/(seo)/learn/how-to-make-bad-drawing-memes/page";
import { generateLocalizedPageMetadata, type LocalePageParams } from "@/lib/localized-page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  return generateLocalizedPageMetadata(params, "learn-how-to-make-bad-drawing-memes", baseMetadata);
}

export default function LocalizedHowToMakeBadDrawingMemesPage() {
  return <HowToMakeBadDrawingMemesPage />;
}
