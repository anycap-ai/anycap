import type { Metadata } from "next";
import { createLocalizedMetadataForPath } from "@/lib/localized-metadata";
import { defaultLocale, type SiteLocale } from "@/lib/site";

const PATH = "/guides/agent-skills-for-developer-tools";

export function getPageMetadata(locale: SiteLocale): Metadata {
  const isPtBr = locale === "pt-br";

  return createLocalizedMetadataForPath(locale, PATH, {
    title: isPtBr
      ? "Skills de agentes para ferramentas de desenvolvimento — como capabilities sao distribuidas"
      : "Agent skills for developer tools — How capabilities are distributed",
    description: isPtBr
      ? "Skills de agentes ensinam ferramentas como Claude Code, Cursor e Codex a descobrir e usar capabilities. Entenda como skill files funcionam, por que importam e como o AnyCap os usa para distribuir capabilities multimodais entre agentes de desenvolvimento."
      : "Agent skills teach tools like Claude Code, Cursor, and Codex how to discover and use capabilities. Learn how skill files work, why they matter, and how AnyCap uses them to distribute multimodal capabilities across developer agents.",
  });
}

export const metadata: Metadata = getPageMetadata(defaultLocale);
