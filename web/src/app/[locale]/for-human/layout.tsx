import { notFound } from "next/navigation";
import { ForHumanShell } from "@/components/layout/ForHumanShell";
import { createForHumanMetadata } from "@/lib/localized-metadata";
import { isSupportedLocale } from "@/lib/site";

export const runtime = "edge";

type LocalizedForHumanLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: LocalizedForHumanLayoutProps) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) {
    return {};
  }

  return createForHumanMetadata(locale);
}

export default async function LocalizedForHumanLayout({
  children,
  params,
}: LocalizedForHumanLayoutProps) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) {
    notFound();
  }

  return <ForHumanShell>{children}</ForHumanShell>;
}
