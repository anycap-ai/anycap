import InstallAnyCapGuidePage, {

  metadata as baseMetadata,
} from "@/app/(seo)/guides/install-anycap/page";
import { generateLocalizedPageMetadata, type LocalePageParams } from "@/lib/localized-page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  return generateLocalizedPageMetadata(params, "guides-install-anycap", baseMetadata);
}

export default function LocalizedInstallAnyCapGuidePage() {
  return <InstallAnyCapGuidePage />;
}
