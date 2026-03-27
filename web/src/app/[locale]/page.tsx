import AgentLanding from "@/app/page";
import { createRootMetadata } from "@/lib/localized-metadata";
import { isSupportedLocale } from "@/lib/site";

export const runtime = "edge";

type LocalizedHomePageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: LocalizedHomePageProps) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) {
    return {};
  }

  return createRootMetadata(locale);
}

export default function LocalizedHomePage() {
  return <AgentLanding />;
}
