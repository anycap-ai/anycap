import { HubIndexPage, buildHubPageMetadata } from "@/components/seo/HubIndexPage";
import { hubPages } from "@/lib/hub-pages";

export const runtime = "edge";

const page = hubPages.learn;

export const metadata = buildHubPageMetadata(page);

export default function LearnIndexPage() {
  return <HubIndexPage page={page} />;
}
