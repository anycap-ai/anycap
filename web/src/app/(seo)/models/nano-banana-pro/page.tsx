import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { defaultLocale } from "@/lib/site";
import { getRequestLocale } from "@/lib/request-locale";
import {
  getNanoBananaProMetadata,
  getNanoBananaProPageData,
} from "@/app/(seo)/models/nano-banana-pro/content";
import { Veo31PageView } from "@/app/(seo)/models/veo-3-1/Veo31PageView";

export const runtime = "edge";
export const metadata: Metadata = getNanoBananaProMetadata(defaultLocale);

export default async function NanoBananaProPage() {
  const locale = await getRequestLocale();
  const content = getNanoBananaProPageData(locale);

  return (
    <>
      <BreadcrumbJsonLd items={content.breadcrumbItems} />
      <Veo31PageView content={content} />
    </>
  );
}
