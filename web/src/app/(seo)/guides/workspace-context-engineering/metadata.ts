import type { Metadata } from "next";
import { createLocalizedMetadataForPath } from "@/lib/localized-metadata";
import { defaultLocale, type SiteLocale } from "@/lib/site";

const PATH = "/guides/workspace-context-engineering";

export function getPageMetadata(locale: SiteLocale): Metadata {
  if (locale === "pt-br") {
    return createLocalizedMetadataForPath(locale, PATH, {
      title:
        "Context engineering do workspace — como agentes usam arquivos, ferramentas e estado",
      description:
        "Context engineering do workspace explica como arquivos, terminais, definicoes de ferramentas e estado de execucao moldam o que um agente de IA decide fazer. Veja como isso afeta o roteamento de ferramentas e chamadas multimodais via AnyCap.",
    });
  }

  if (locale === "id") {
    return createLocalizedMetadataForPath(locale, PATH, {
      title:
        "Rekayasa konteks workspace - bagaimana agen memakai file, tool, dan status eksekusi",
      description:
        "Rekayasa konteks workspace menjelaskan bagaimana file, terminal, definisi tool, dan status eksekusi membentuk keputusan agen AI. Pelajari dampaknya pada routing tool dan pemanggilan capability multimodal lewat AnyCap.",
    });
  }

  return createLocalizedMetadataForPath(locale, PATH, {
    title: "Workspace context engineering — How agents use files, tools, and state",
    description:
      "Workspace context engineering explains how files, terminals, tool definitions, and execution state shape what an AI agent decides to do. Learn how it affects tool routing and multimodal capability calls through AnyCap.",
  });
}

export const metadata: Metadata = getPageMetadata(defaultLocale);
