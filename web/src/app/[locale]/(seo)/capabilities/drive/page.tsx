import DriveCapabilityPage, {
  metadata as baseMetadata,
} from "@/app/(seo)/capabilities/drive/page";
import { generateLocalizedPageMetadata, type LocalePageParams } from "@/lib/localized-page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  return generateLocalizedPageMetadata(params, "capabilities-drive", baseMetadata);
}

export default function LocalizedDriveCapabilityPage() {
  return <DriveCapabilityPage />;
}
