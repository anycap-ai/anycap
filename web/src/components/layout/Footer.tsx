import Link from "next/link";
import { AnycapLogo } from "@/components/brand/AnycapLogo";
import { EmailActionButton } from "@/components/ui/EmailActionButton";
import { getHostedPageHubLinks } from "@/lib/seo/hosted-pages";
import { getRequestLocale } from "@/lib/request-locale";
import { localizePublicPath } from "@/lib/site";

const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

const linkClass =
  "px-2 py-1 text-[10px] text-[#3f4437] hover:text-[#1c1f17] hover:bg-[#6b7d3a]/[0.08] active:scale-[0.97] tracking-[0.5px] rounded-lg transition-all duration-200 ease-out";

const columnTitleClass =
  "text-[10px] text-[#3a3e32] tracking-[0.5px] font-bold mb-2";

type FooterLink = { href: string; label: string };

const columns: { title: string; links: FooterLink[] }[] = [
  {
    title: "Capabilities",
    links: [
      { href: "/capabilities", label: "Overview" },
      { href: "/capabilities/image-generation", label: "Image Generation" },
      { href: "/capabilities/video-generation", label: "Video Generation" },
      { href: "/capabilities/music-generation", label: "Music Generation" },
      { href: "/capabilities/image-understanding", label: "Image Understanding" },
      { href: "/capabilities/video-analysis", label: "Video Analysis" },
      { href: "/capabilities/audio-understanding", label: "Audio Understanding" },
      { href: "/capabilities/web-search", label: "Web Search" },
      { href: "/capabilities/grounded-web-search", label: "Grounded Web Search" },
      { href: "/capabilities/web-crawl", label: "Web Crawl" },
      { href: "/capabilities/drive", label: "Drive" },
    ],
  },
  {
    title: "Equip Agents",
    links: [
      { href: "/for", label: "Overview" },
      { href: "/start", label: "Start here" },
      { href: "/for/claude-code", label: "Claude Code" },
      { href: "/for/cursor", label: "Cursor" },
      { href: "/for/codex", label: "Codex" },
      { href: "/for/manus", label: "Manus" },
    ],
  },
  {
    title: "Learn",
    links: [
      { href: "/learn", label: "Overview" },
      { href: "/cli", label: "CLI" },
      { href: "/skills", label: "Skills" },
      { href: "/start", label: "Install AnyCap" },
      { href: "/guides/context-engineering-for-agents", label: "Context Engineering" },
      { href: "/guides/agent-skills-for-developer-tools", label: "Agent Skills" },
      { href: "/learn/smart-goal-generator", label: "SMART Goal Generator" },
      { href: "/capabilities/image-generation", label: "How to Make Memes Online" },
      { href: "/compare", label: "Compare Overview" },
      { href: "/compare/anycap-vs-replicate", label: "AnyCap vs Replicate" },
      { href: "/compare/anycap-vs-fal-ai", label: "AnyCap vs fal.ai" },
      { href: "/learn/what-agents-cant-do", label: "What Agents Can't Do" },
    ],
  },
  {
    title: "Product",
    links: [
      { href: "/", label: "Product overview" },
      { href: "/models", label: "Models" },
      { href: "/start", label: "Install AnyCap" },
      { href: "/guides/agent-skills-for-developer-tools", label: "Add Tools to Claude Code" },
    ],
  },
];

const hostedHubColumnTitleByLocale = {
  en: "Published on AnyCap",
  "pt-br": "Publicado no AnyCap",
  id: "Dipublikasikan di AnyCap",
  de: "Auf AnyCap veröffentlicht",
} as const;

export async function Footer() {
  const locale = await getRequestLocale();
  const hostedPageLinks = getHostedPageHubLinks(locale);

  return (
    <footer className="px-5 md:px-16 lg:px-24 pt-16 pb-10 border-t border-[#d4dbb8]">
      <div className="mx-auto max-w-[1280px]">
        {/* Column links */}
        <div className="mb-12 grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-6">
          {columns.map(({ title, links }) => (
            <div key={title}>
              <p className={columnTitleClass} style={mono}>{title}</p>
              <ul className="space-y-1">
                {links.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={localizePublicPath(locale, href)}
                      prefetch={false}
                      className={linkClass}
                      style={mono}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <p className={columnTitleClass} style={mono}>
              {hostedHubColumnTitleByLocale[locale]}
            </p>
            <ul className="space-y-1">
              {hostedPageLinks.map(({ href, label }) => (
                <li key={href}>
                  <a
                    href={href}
                    className={linkClass}
                    style={mono}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className={columnTitleClass} style={mono}>Company</p>
            <ul className="space-y-1">
              <li>
                <Link
                  href={localizePublicPath(locale, "/about")}
                  prefetch={false}
                  className={linkClass}
                  style={mono}
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href={localizePublicPath(locale, "/contact")}
                  prefetch={false}
                  className={linkClass}
                  style={mono}
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href={localizePublicPath(locale, "/privacy")}
                  prefetch={false}
                  className={linkClass}
                  style={mono}
                >
                  Privacy
                </Link>
              </li>
              <li>
                <Link
                  href={localizePublicPath(locale, "/terms")}
                  prefetch={false}
                  className={linkClass}
                  style={mono}
                >
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col gap-4 border-t border-[#d4dbb8] pt-6 sm:flex-row sm:items-end sm:justify-between">
          <AnycapLogo size={16} />
          <EmailActionButton
            aria-label="Email the AnyCap team"
            className="inline-flex cursor-pointer flex-col items-start rounded-lg border-0 bg-transparent px-2 py-1 text-left transition-colors duration-200 hover:bg-[#6b7d3a]/[0.08] sm:items-end sm:text-right"
            style={mono}
          >
            <span className="text-[9px] uppercase tracking-[0.7px] text-[#697057]">
              Contact
            </span>
            <span className="mt-1 text-[10px] tracking-[0.35px] text-[#1f221a]">
              Email the team
            </span>
          </EmailActionButton>
        </div>
      </div>
    </footer>
  );
}
