import CliPage, { metadata as baseMetadata } from "@/app/(seo)/cli/page";
import { generateLocalizedPageMetadata, type LocalePageParams } from "@/lib/localized-page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  return generateLocalizedPageMetadata(params, "cli", baseMetadata);
}

export default function LocalizedCliPage() {
  return <CliPage />;
}
