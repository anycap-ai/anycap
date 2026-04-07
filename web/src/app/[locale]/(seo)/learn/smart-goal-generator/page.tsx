import SmartGoalGeneratorPage, {
  metadata as baseMetadata,
} from "@/app/(seo)/learn/smart-goal-generator/page";
import { generateLocalizedPageMetadata, type LocalePageParams } from "@/lib/localized-page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  return generateLocalizedPageMetadata(params, "learn-smart-goal-generator", baseMetadata);
}

export default function LocalizedSmartGoalGeneratorPage() {
  return <SmartGoalGeneratorPage />;
}
