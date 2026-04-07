import type { Metadata } from "next";
import Link from "next/link";
import { marked } from "marked";
import { landingMarkdown } from "@/lib/landing-content";
import { HumanRedirectDialog } from "@/components/landing/HumanRedirectDialog";
import { getRequestLocale } from "@/lib/request-locale";
import { createRootMetadata } from "@/lib/localized-metadata";
import { defaultLocale, localizePublicPath } from "@/lib/site";

export const runtime = "edge";

export async function generateMetadata(): Promise<Metadata> {
  return createRootMetadata(defaultLocale);
}

const html = marked.parse(landingMarkdown, { async: false }) as string;

export default async function AgentLanding() {
  const locale = await getRequestLocale();
  const humanPageHref = localizePublicPath(locale, "/for-human");

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e0e0e0] font-mono">
      <main className="max-w-3xl mx-auto px-6 py-12 leading-relaxed">
        <HumanRedirectDialog href={humanPageHref} />

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
            href={humanPageHref}
            prefetch={true}
            className="inline-flex items-center px-5 py-2.5 bg-[#e0e0e0] text-[#0a0a0a] text-sm font-bold rounded-lg hover:bg-white active:scale-[0.97] transition-all"
          >
            {"I'm Human →"}
          </Link>
        </div>

        <article
          className="landing-md"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        <footer className="mt-10 pt-6 border-t border-[#222] text-sm text-[#666]">
          <p>MIT License</p>
        </footer>
      </main>
    </div>
  );
}
