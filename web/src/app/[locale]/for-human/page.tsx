import { buildLocalizedPath, isSupportedLocale } from "@/lib/site";
import { notFound, permanentRedirect } from "next/navigation";

export const runtime = "edge";

type LocalizedForHumanPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function LocalizedForHumanPage({
  params,
}: LocalizedForHumanPageProps) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) {
    notFound();
  }

  permanentRedirect(buildLocalizedPath(locale, "/"));
}
