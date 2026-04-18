import type { Metadata } from "next";
import Link from "next/link";
import { HumanRedirectDialog } from "@/components/landing/HumanRedirectDialog";
import { getLandingMarkdown } from "@/lib/landing-content";
import { getRequestLocale } from "@/lib/request-locale";
import { createAgentMetadata } from "@/lib/localized-metadata";
import { renderSimpleMarkdown } from "@/lib/simple-markdown";
import { defaultLocale, localizePublicPath, siteConfig, type SiteLocale } from "@/lib/site";

export const runtime = "edge";

export async function generateMetadata(): Promise<Metadata> {
  return createAgentMetadata(defaultLocale);
}

const localizedAgentChrome = {
  en: {
    humanLabel: "I'm Human ->",
    licenseLabel: "MIT License",
  },
  "pt-br": {
    humanLabel: "Sou humano ->",
    licenseLabel: "Licenca MIT",
  },
  id: {
    humanLabel: "I'm Human ->",
    licenseLabel: "MIT License",
  },
  de: {
    humanLabel: "Ich bin Mensch ->",
    licenseLabel: "MIT-Lizenz",
  },
} as const satisfies Record<
  SiteLocale,
  {
    humanLabel: string;
    licenseLabel: string;
  }
>;

function localizeAgentMarkdown(markdown: string, locale: SiteLocale) {
  return markdown.replaceAll(
    /https:\/\/anycap\.ai(\/[^\s)\]]*)?/g,
    (match, path = "/") => `${siteConfig.url}${localizePublicPath(locale, path)}`
  );
}

export default async function AgentEntryPage() {
  const locale = await getRequestLocale();
  const homePageHref = localizePublicPath(locale, "/");
  const chrome = localizedAgentChrome[locale] ?? localizedAgentChrome.en;
  const html = renderSimpleMarkdown(localizeAgentMarkdown(getLandingMarkdown(locale), locale));

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e0e0e0] font-mono">
      <main className="max-w-3xl mx-auto px-6 py-12 leading-relaxed">
        <HumanRedirectDialog href={homePageHref} />

        <div className="mb-10 flex flex-wrap justify-end gap-3">
          <a
            href="https://github.com/anycap-ai/anycap"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-5 py-2.5 border border-[#333] text-[#e0e0e0] text-sm font-bold rounded-lg hover:bg-[#111] hover:border-[#4a4a4a] active:scale-[0.97] transition-all"
          >
            GitHub
          </a>
          <Link
            href={homePageHref}
            prefetch={true}
            className="inline-flex items-center px-5 py-2.5 bg-[#e0e0e0] text-[#0a0a0a] text-sm font-bold rounded-lg hover:bg-white active:scale-[0.97] transition-all"
          >
            {chrome.humanLabel}
          </Link>
        </div>

        <article
          className="landing-md"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        <footer className="mt-10 pt-6 border-t border-[#222] text-sm text-[#666]">
          <p>{chrome.licenseLabel}</p>
        </footer>
      </main>
    </div>
  );
}
