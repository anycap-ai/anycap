import { HubIndexPage, buildHubPageMetadata } from "@/components/seo/HubIndexPage";
import { hubPages } from "@/lib/hub-pages";

export const runtime = "edge";

const page = hubPages.compare;

export const metadata = buildHubPageMetadata(page);

export default function CompareIndexPage() {
  return <HubIndexPage page={page} />;
}
