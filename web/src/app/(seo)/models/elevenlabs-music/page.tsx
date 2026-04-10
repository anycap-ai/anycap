import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { defaultLocale } from "@/lib/site";
import { getRequestLocale } from "@/lib/request-locale";
import {
  getElevenLabsMusicMetadata,
  getElevenLabsMusicPageData,
} from "@/app/(seo)/models/elevenlabs-music/content";
import { Veo31PageView } from "@/app/(seo)/models/veo-3-1/Veo31PageView";

export const runtime = "edge";
export const metadata: Metadata = getElevenLabsMusicMetadata(defaultLocale);

export default async function ElevenLabsMusicPage() {
  const locale = await getRequestLocale();
  const content = getElevenLabsMusicPageData(locale);

  return (
    <>
      <BreadcrumbJsonLd items={content.breadcrumbItems} />
      <Veo31PageView content={content} />
    </>
  );
}
