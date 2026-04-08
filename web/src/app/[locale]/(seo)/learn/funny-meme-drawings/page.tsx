import FunnyMemeDrawingsPage, {
  metadata as baseMetadata,
} from "@/app/(seo)/learn/funny-meme-drawings/page";
import { generateLocalizedPageMetadata, type LocalePageParams } from "@/lib/localized-page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  return generateLocalizedPageMetadata(params, "learn-funny-meme-drawings", baseMetadata);
}

export default function LocalizedFunnyMemeDrawingsPage() {
  return <FunnyMemeDrawingsPage />;
}
