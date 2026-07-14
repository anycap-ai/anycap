import type { Metadata } from "next";
import { CatalogModelDetailPage } from "@/components/seo/CatalogModelDetailPage";
import { getRequestLocale } from "@/lib/request-locale";
import { getCatalogModelForLocale } from "@/lib/seo/model-catalog";
import { defaultLocale } from "@/lib/site";
import { getGeminiOmniFlashPreviewMetadata } from "./metadata";

export const runtime = "edge";

// BreadcrumbJsonLd is rendered inside CatalogModelDetailPage.

const MODEL_SLUG = "gemini-omni-flash-preview";

export const metadata: Metadata = getGeminiOmniFlashPreviewMetadata(defaultLocale);

export default async function GeminiOmniFlashPreviewPage() {
  const locale = await getRequestLocale();
  const localizedModel = getCatalogModelForLocale(MODEL_SLUG, locale);

  return <CatalogModelDetailPage model={localizedModel} locale={locale} />;
}
