import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { defaultLocale } from "@/lib/site";
import { getRequestLocale } from "@/lib/request-locale";
import {
  getNanoBanana2Metadata,
  getNanoBanana2PageData,
} from "@/app/(seo)/models/nano-banana-2/content";
import { Veo31PageView } from "@/app/(seo)/models/veo-3-1/Veo31PageView";

export const runtime = "edge";
export const metadata: Metadata = getNanoBanana2Metadata(defaultLocale);

export default async function NanoBanana2Page() {
  const locale = await getRequestLocale();
  const content = getNanoBanana2PageData(locale);

  return (
    <>
      <BreadcrumbJsonLd items={content.breadcrumbItems} />
      <Veo31PageView content={content} />
    </>
  );
}
