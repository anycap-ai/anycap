import { HubIndexPage, buildHubPageMetadata } from "@/components/seo/HubIndexPage";
import { hubPages } from "@/lib/hub-pages";

export const runtime = "edge";

const page = hubPages.for;

export const metadata = buildHubPageMetadata(page);

export default function EquipAgentsIndexPage() {
  return <HubIndexPage page={page} />;
}
