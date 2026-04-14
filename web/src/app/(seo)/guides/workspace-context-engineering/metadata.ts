import type { Metadata } from "next";
import { createLocalizedMetadataForPath } from "@/lib/localized-metadata";
import { defaultLocale, type SiteLocale } from "@/lib/site";

const PATH = "/guides/workspace-context-engineering";

export function getPageMetadata(locale: SiteLocale): Metadata {
  const isPtBr = locale === "pt-br";

  return createLocalizedMetadataForPath(locale, PATH, {
    title: isPtBr
      ? "Context engineering do workspace — como agentes usam arquivos, ferramentas e estado"
      : "Workspace context engineering — How agents use files, tools, and state",
    description: isPtBr
      ? "Context engineering do workspace explica como arquivos, terminais, definicoes de ferramentas e estado de execucao moldam o que um agente de IA decide fazer. Veja como isso afeta o roteamento de ferramentas e chamadas multimodais via AnyCap."
      : "Workspace context engineering explains how files, terminals, tool definitions, and execution state shape what an AI agent decides to do. Learn how it affects tool routing and multimodal capability calls through AnyCap.",
  });
}

export const metadata: Metadata = getPageMetadata(defaultLocale);
