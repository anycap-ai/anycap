import AudioUnderstandingPage from "@/app/(seo)/capabilities/audio-understanding/page";
import { getPageMetadata } from "@/app/(seo)/capabilities/audio-understanding/metadata";
import { getValidatedLocale, type LocalePageParams } from "@/lib/localized-page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  const locale = await getValidatedLocale(params);
  return locale ? getPageMetadata(locale) : {};
}

export default function LocalizedAudioUnderstandingPage() {
  return <AudioUnderstandingPage />;
}
