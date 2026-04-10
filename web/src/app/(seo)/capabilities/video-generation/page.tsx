import type { Metadata } from "next";
import { defaultLocale } from "@/lib/site";
import { getRequestLocale } from "@/lib/request-locale";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { createLocalizedMetadataForPath } from "@/lib/localized-metadata";
import {
  getVideoGenerationMetadata,
  VIDEO_GENERATION_PATH,
  getVideoGenerationPageData,
} from "@/app/(seo)/capabilities/video-generation/content";
import { VideoGenerationPageView } from "@/app/(seo)/capabilities/video-generation/VideoGenerationPageView";

export const runtime = "edge";
export const metadata: Metadata = createLocalizedMetadataForPath(
  defaultLocale,
  VIDEO_GENERATION_PATH,
  getVideoGenerationMetadata(defaultLocale),
);

export default async function VideoGenerationPage() {
  const locale = await getRequestLocale();
  const content = getVideoGenerationPageData(locale);

  return (
    <>
      <BreadcrumbJsonLd items={content.breadcrumbItems} />
      <VideoGenerationPageView content={content} />
    </>
  );
}
