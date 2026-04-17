import type { Metadata } from "next";
import { defaultLocale, getLocaleConfig, siteConfig, type SiteLocale } from "@/lib/site";

const metadataByLocale: Record<
  SiteLocale,
  { title: string; description: string; openGraphTitle: string; openGraphDescription: string }
> = {
  en: {
    title: "Drive for AI agents - Shared storage, file organization, and public URLs",
    description:
      "Give AI agents a shared drive through AnyCap. Store generated outputs, organize assets, and create public URLs through one interface instead of stitching storage into each workflow.",
    openGraphTitle: "Drive for AI agents - Shared storage, file organization, and public URLs",
    openGraphDescription:
      "Add shared storage and file delivery to AI agent workflows with AnyCap Drive.",
  },
  "pt-br": {
    title: "Drive para agentes de IA - armazenamento compartilhado e URLs publicas",
    description:
      "Dê aos agentes um drive compartilhado com AnyCap para armazenar resultados, organizar ativos e gerar URLs publicas sem reintegrar armazenamento em cada fluxo.",
    openGraphTitle: "Drive para agentes de IA - armazenamento compartilhado e URLs publicas",
    openGraphDescription:
      "Adicione armazenamento compartilhado e entrega de arquivos aos workflows de agentes com AnyCap Drive.",
  },
  id: {
    title: "Drive untuk agen AI - penyimpanan bersama, organisasi file, dan URL publik",
    description:
      "Berikan drive bersama ke agen AI melalui AnyCap. Simpan output generasi, rapikan aset, dan buat URL publik lewat satu antarmuka tanpa merangkai sistem storage terpisah per workflow.",
    openGraphTitle: "Drive untuk agen AI - penyimpanan bersama, organisasi file, dan URL publik",
    openGraphDescription:
      "Tambahkan penyimpanan bersama dan distribusi file ke workflow agen AI dengan AnyCap Drive.",
  },
};

export function getPageMetadata(locale: SiteLocale): Metadata {
  const localizedMetadata = metadataByLocale[locale] ?? metadataByLocale[defaultLocale];
  return {
    title: localizedMetadata.title,
    description: localizedMetadata.description,
    alternates: { canonical: "/capabilities/drive" },
    openGraph: {
      type: "website",
      locale: getLocaleConfig(locale).ogLocale,
      url: "/capabilities/drive",
      siteName: siteConfig.siteName,
      title: localizedMetadata.openGraphTitle,
      description: localizedMetadata.openGraphDescription,
    },
  };
}

export const metadata: Metadata = getPageMetadata(defaultLocale);
