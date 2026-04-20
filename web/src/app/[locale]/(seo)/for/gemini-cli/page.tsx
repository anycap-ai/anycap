import ForGeminiCliPage, {
  metadata as baseMetadata,
} from "@/app/(seo)/for/gemini-cli/page";
import { generateLocalizedPageMetadata, type LocalePageParams } from "@/lib/localized-page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  return generateLocalizedPageMetadata(
    params,
    "for-gemini-cli",
    baseMetadata
  );
}

export default function LocalizedForGeminiCliPage() {
  return <ForGeminiCliPage />;
}
