import WorkspaceContextEngineeringPage, {

  metadata as baseMetadata,
} from "@/app/(seo)/guides/workspace-context-engineering/page";
import { generateLocalizedPageMetadata, type LocalePageParams } from "@/lib/localized-page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  return generateLocalizedPageMetadata(
    params,
    "guides-workspace-context-engineering",
    baseMetadata
  );
}

export default function LocalizedWorkspaceContextEngineeringPage() {
  return <WorkspaceContextEngineeringPage />;
}
