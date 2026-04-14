import type { Metadata } from "next";
import { createLocalizedMetadataForPath } from "@/lib/localized-metadata";
import { defaultLocale, type SiteLocale } from "@/lib/site";

const PATH = "/guides/agent-skills-for-developer-tools";

export function getPageMetadata(locale: SiteLocale): Metadata {
  const isPtBr = locale === "pt-br";

  return createLocalizedMetadataForPath(locale, PATH, {
    title: isPtBr
      ? "Skills de agentes para ferramentas de desenvolvimento"
      : "Agent skills for developer tools — How agent capabilities are distributed",
    description: isPtBr
      ? "Skills de agentes ensinam ferramentas como Claude Code, Cursor e Codex a descobrir e usar capacidades. Entenda como arquivos de skill funcionam, por que importam e como o AnyCap os usa para distribuir capacidades multimodais entre agentes de desenvolvimento."
      : "Learn how agent skills work in Claude Code, Cursor, and Codex, what a skill file should contain, when to use skills versus native tools, and how AnyCap distributes multimodal capabilities across developer agents.",
  });
}

export const metadata: Metadata = getPageMetadata(defaultLocale);
