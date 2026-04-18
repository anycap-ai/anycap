import SkillPage, { metadata as baseMetadata } from "@/app/(seo)/skills/anycap-blog-production/page";
import { generateLocalizedPageMetadataForPath, type LocalePageParams } from "@/lib/localized-page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  return generateLocalizedPageMetadataForPath(params, "/skills/anycap-blog-production", baseMetadata);
}

export default function LocalizedSkillPage() {
  return <SkillPage />;
}
