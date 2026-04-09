import EasyMemesToDrawPage, {
  metadata as baseMetadata,
} from "@/app/(seo)/learn/easy-memes-to-draw/page";
import { generateLocalizedPageMetadata, type LocalePageParams } from "@/lib/localized-page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  return generateLocalizedPageMetadata(params, "learn-easy-memes-to-draw", baseMetadata);
}

export default function LocalizedEasyMemesToDrawPage() {
  return <EasyMemesToDrawPage />;
}
