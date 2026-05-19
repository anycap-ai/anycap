import type { Metadata } from "next";
import { CatalogModelDetailPage } from "@/components/seo/CatalogModelDetailPage";
import { createLocalizedMetadataForPath } from "@/lib/localized-metadata";
import { getRequestLocale } from "@/lib/request-locale";
import { catalogModelsBySlug } from "@/lib/seo/model-catalog";
import { defaultLocale } from "@/lib/site";

export const runtime = "edge";

// BreadcrumbJsonLd is rendered inside CatalogModelDetailPage.

const model = catalogModelsBySlug["seedance-2"];

export const metadata: Metadata = createLocalizedMetadataForPath(defaultLocale, model.path, {
  title: `${model.displayName} for AI agents — ${model.capabilityLabel} through AnyCap`,
  description: `${model.displayName} is available through AnyCap as ${model.modelId}. See supported modes, best-fit workflows, and exact CLI commands for agent use.`,
  openGraph: {
    type: "website",
    title: `${model.displayName} for AI agents — AnyCap model guide`,
    description: model.description,
  },
  other: {
    "article:published_time": "2026-05-13",
    "article:modified_time": "2026-05-13",
  },
});

export default async function Seedance2Page() {
  const locale = await getRequestLocale();

  return <CatalogModelDetailPage model={model} locale={locale} />;
}
