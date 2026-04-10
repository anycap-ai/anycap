import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { defaultLocale } from "@/lib/site";
import { getRequestLocale } from "@/lib/request-locale";
import {
  getSeedance15ProMetadata,
  getSeedance15ProPageData,
} from "@/app/(seo)/models/seedance-1-5-pro/content";
import { Veo31PageView } from "@/app/(seo)/models/veo-3-1/Veo31PageView";

export const runtime = "edge";
export const metadata: Metadata = getSeedance15ProMetadata(defaultLocale);

export default async function Seedance15ProPage() {
  const locale = await getRequestLocale();
  const content = getSeedance15ProPageData(locale);

  return (
    <>
      <BreadcrumbJsonLd items={content.breadcrumbItems} />
      <Veo31PageView content={content} />
    </>
  );
}
