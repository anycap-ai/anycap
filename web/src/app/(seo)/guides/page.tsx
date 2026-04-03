import { HubIndexPage, buildHubPageMetadata } from "@/components/seo/HubIndexPage";
import { hubPages } from "@/lib/hub-pages";

export const runtime = "edge";

const page = hubPages.guides;

export const metadata = buildHubPageMetadata(page);

export default function GuidesIndexPage() {
  return <HubIndexPage page={page} />;
}
