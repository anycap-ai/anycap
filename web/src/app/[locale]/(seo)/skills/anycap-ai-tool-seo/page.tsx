import SkillPage, { metadata as baseMetadata } from "@/app/(seo)/skills/anycap-ai-tool-seo/page";
import { generateLocalizedPageMetadataForPath, type LocalePageParams } from "@/lib/localized-page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  return generateLocalizedPageMetadataForPath(params, "/skills/anycap-ai-tool-seo", baseMetadata);
}

export default function LocalizedSkillPage() {
  return <SkillPage />;
}
