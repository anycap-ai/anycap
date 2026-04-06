import Link from "next/link";
import { AnycapLogo } from "@/components/brand/AnycapLogo";
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
      { href: "/guides/install-anycap", label: "Install AnyCap" },
      { href: "/guides/context-engineering-for-agents", label: "Context Engineering" },
      { href: "/compare", label: "Compare AnyCap" },
      { href: "/learn/what-agents-cant-do", label: "What agents can't do" },
    ],
  },
  {
    title: "Product",
    links: [
      { href: "/for-human", label: "Product overview" },
      { href: "/models", label: "Models" },
      { href: "/guides/install-anycap", label: "Install AnyCap" },
      { href: "/guides/add-tools-to-claude-code", label: "Add Tools to Claude Code" },
    ],
  },
];

export async function Footer() {
  const locale = await getRequestLocale();

  return (
    <footer className="px-5 md:px-16 lg:px-24 pt-16 pb-10 border-t border-[#d4dbb8]">
      <div className="mx-auto max-w-[1280px]">
        {/* Column links */}
        <div className="mb-12 grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
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
                <a
                  href="https://github.com/anycap-ai/anycap"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${linkClass} inline-flex items-center gap-1`}
                  style={mono}
                >
                  <svg width={12} height={12} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                  </svg>
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-[#d4dbb8]">
          <AnycapLogo size={16} />
        </div>
      </div>
    </footer>
  );
}
