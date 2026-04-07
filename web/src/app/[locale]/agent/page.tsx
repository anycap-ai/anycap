import AgentEntryPage from "@/app/agent/page";
import { createAgentMetadata } from "@/lib/localized-metadata";
import { isSupportedLocale } from "@/lib/site";
import { notFound } from "next/navigation";

export const runtime = "edge";

type LocalizedAgentPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: LocalizedAgentPageProps) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) {
    return {};
  }

  return createAgentMetadata(locale);
}

export default async function LocalizedAgentPage({
  params,
}: LocalizedAgentPageProps) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) {
    notFound();
  }

  return <AgentEntryPage />;
}
