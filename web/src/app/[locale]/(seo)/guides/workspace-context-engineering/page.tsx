import WorkspaceContextEngineeringPage from "@/app/(seo)/guides/workspace-context-engineering/page";
import { getPageMetadata } from "@/app/(seo)/guides/workspace-context-engineering/metadata";
import { getValidatedLocale, type LocalePageParams } from "@/lib/localized-page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  const locale = await getValidatedLocale(params);
  return locale ? getPageMetadata(locale) : {};
}

export default function LocalizedWorkspaceContextEngineeringPage() {
  return <WorkspaceContextEngineeringPage />;
}
