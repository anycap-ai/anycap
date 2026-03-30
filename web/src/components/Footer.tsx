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
      { href: "/capabilities/image-read", label: "Image Read" },
      { href: "/capabilities/video-analysis", label: "Video Analysis" },
    ],
  },
  {
    title: "Integrations",
    links: [
      { href: "/for/claude-code", label: "Claude Code" },
      { href: "/for/cursor", label: "Cursor" },
      { href: "/compare/anycap-vs-composio", label: "AnyCap vs Composio" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "/cli", label: "CLI" },
      { href: "/skills", label: "Skills" },
      { href: "/guides/install-anycap", label: "Install AnyCap" },
      { href: "/guides/mcp-vs-a2a-for-ai-agents", label: "MCP vs A2A" },
      { href: "/guides/add-tools-to-claude-code", label: "Add Tools to Claude Code" },
      { href: "/glossary/agent-capability-runtime", label: "What is ACR?" },
    ],
  },
];

export async function Footer() {
  const locale = await getRequestLocale();

  return (
    <footer className="px-5 md:px-16 lg:px-24 pt-16 pb-10 border-t border-[#d4dbb8]">
      <div className="mx-auto max-w-[1280px]">
        {/* Column links */}
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-4 mb-12">
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
                  href={localizePublicPath(locale, "/for-human")}
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
                  className={linkClass}
                  style={mono}
                >
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
