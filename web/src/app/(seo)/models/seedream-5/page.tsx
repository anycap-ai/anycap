import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { defaultLocale } from "@/lib/site";
import { getRequestLocale } from "@/lib/request-locale";
import { getSeedream5Metadata, getSeedream5PageData } from "@/app/(seo)/models/seedream-5/content";
import { Veo31PageView } from "@/app/(seo)/models/veo-3-1/Veo31PageView";

export const runtime = "edge";
export const metadata: Metadata = getSeedream5Metadata(defaultLocale);

export default async function Seedream5Page() {
  const locale = await getRequestLocale();
  const content = getSeedream5PageData(locale);

  return (
    <>
      <BreadcrumbJsonLd items={content.breadcrumbItems} />
      <Veo31PageView content={content} />
    </>
  );
}
