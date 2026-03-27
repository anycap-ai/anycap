import { notFound } from "next/navigation";
import { SeoShell } from "@/components/SeoShell";
import { isSupportedLocale } from "@/lib/site";

export const runtime = "edge";

type LocalizedSeoLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocalizedSeoLayout({
  children,
  params,
}: LocalizedSeoLayoutProps) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) {
    notFound();
  }

  return <SeoShell>{children}</SeoShell>;
}
