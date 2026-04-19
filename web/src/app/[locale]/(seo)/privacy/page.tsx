import PrivacyPage from "@/app/(seo)/privacy/page";
export { generateMetadata } from "@/app/(seo)/privacy/page";

export const runtime = "edge";

export default function LocalizedPrivacyPage() {
  return <PrivacyPage />;
}
