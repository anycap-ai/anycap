import SkillPage, { metadata as baseMetadata } from "@/app/(seo)/skills/anycap-human-interaction/page";
import { generateLocalizedPageMetadataForPath, type LocalePageParams } from "@/lib/localized-page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  return generateLocalizedPageMetadataForPath(params, "/skills/anycap-human-interaction", baseMetadata);
}

export default function LocalizedSkillPage() {
  return <SkillPage />;
}
