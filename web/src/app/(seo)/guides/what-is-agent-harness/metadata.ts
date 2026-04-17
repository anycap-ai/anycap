import type { Metadata } from "next";
import { createLocalizedMetadataForPath } from "@/lib/localized-metadata";
import { defaultLocale, type SiteLocale } from "@/lib/site";

const PATH = "/guides/what-is-agent-harness";

export function getPageMetadata(locale: SiteLocale): Metadata {
  if (locale === "pt-br") {
    return createLocalizedMetadataForPath(locale, PATH, {
      title: "O que e um agent harness? A camada de runtime ao redor do agente",
      description:
        "Um agent harness e a camada de execucao que da a um agente de IA ferramentas, estado do workspace, permissoes e controles de runtime. Veja como ele difere do modelo em si e onde o AnyCap entra nessa pilha.",
    });
  }

  if (locale === "id") {
    return createLocalizedMetadataForPath(locale, PATH, {
      title: "Apa itu agent harness? Lapisan runtime di sekitar agen AI",
      description:
        "Agent harness adalah lapisan eksekusi yang memberi agen AI akses ke tool, status workspace, permission, dan kontrol runtime. Pelajari bedanya dengan model itu sendiri serta posisi AnyCap di dalam stack ini.",
    });
  }

  return createLocalizedMetadataForPath(locale, PATH, {
    title: "What is an agent harness? The runtime layer around the agent",
    description:
      "An agent harness is the surrounding execution layer that gives an AI agent tools, workspace state, permissions, and runtime controls. Learn how it differs from the model itself and where AnyCap fits in the stack.",
  });
}

export const metadata: Metadata = getPageMetadata(defaultLocale);
