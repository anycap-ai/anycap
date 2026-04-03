import { HubIndexPage, buildHubPageMetadata } from "@/components/seo/HubIndexPage";
import { hubPages } from "@/lib/hub-pages";

export const runtime = "edge";

const page = hubPages.glossary;

export const metadata = buildHubPageMetadata(page);

export default function GlossaryIndexPage() {
  return <HubIndexPage page={page} />;
}
