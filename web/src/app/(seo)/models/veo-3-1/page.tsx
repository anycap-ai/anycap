import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { createLocalizedMetadataForPath } from "@/lib/localized-metadata";
import { defaultLocale } from "@/lib/site";
import { getRequestLocale } from "@/lib/request-locale";
import {
  getVeo31Metadata,
  getVeo31PageData,
  VEO_31_PATH,
} from "@/app/(seo)/models/veo-3-1/content";
import { Veo31PageView } from "@/app/(seo)/models/veo-3-1/Veo31PageView";

export const runtime = "edge";
export const metadata: Metadata = createLocalizedMetadataForPath(
  defaultLocale,
  VEO_31_PATH,
  getVeo31Metadata(defaultLocale),
);

export default async function Veo31Page() {
  const locale = await getRequestLocale();
  const content = getVeo31PageData(locale);

  return (
    <>
      <BreadcrumbJsonLd items={content.breadcrumbItems} />
      <Veo31PageView content={content} />
    </>
  );
}
