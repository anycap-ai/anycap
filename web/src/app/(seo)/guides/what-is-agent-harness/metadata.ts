import type { Metadata } from "next";
import { createLocalizedMetadataForPath } from "@/lib/localized-metadata";
import { defaultLocale, type SiteLocale } from "@/lib/site";

const PATH = "/guides/what-is-agent-harness";

export function getPageMetadata(locale: SiteLocale): Metadata {
  const isPtBr = locale === "pt-br";

  return createLocalizedMetadataForPath(locale, PATH, {
    title: isPtBr
      ? "O que e um agent harness? A camada de runtime ao redor do agente"
      : "What is an agent harness? The runtime layer around the agent",
    description: isPtBr
      ? "Um agent harness e a camada de execucao que da a um agente de IA ferramentas, estado do workspace, permissoes e controles de runtime. Veja como ele difere do modelo em si e onde o AnyCap entra nessa pilha."
      : "An agent harness is the surrounding execution layer that gives an AI agent tools, workspace state, permissions, and runtime controls. Learn how it differs from the model itself and where AnyCap fits in the stack.",
  });
}

export const metadata: Metadata = getPageMetadata(defaultLocale);
