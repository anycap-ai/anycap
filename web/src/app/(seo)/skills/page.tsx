import type { Metadata } from "next";
import { LocalizedLink as Link } from "@/components/LocalizedLink";
import { siteConfig } from "@/lib/site";
import { EarlyAccessBanner } from "@/components/EarlyAccessBanner";
import { FadeIn } from "@/components/FadeIn";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

export const metadata: Metadata = {
  title: "AnyCap skills — Installable skills for AI agents",
  description:
    "AnyCap skills teach AI agents how to discover, install, authenticate, and invoke capabilities through one runtime. Learn how skills relate to the CLI, capabilities, and supported agent products.",
  alternates: { canonical: "/skills" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/skills",
    siteName: siteConfig.siteName,
    title: "AnyCap skills — Installable skills for AI agents",
    description:
      "Learn what AnyCap skills are, how they fit with the CLI and capability runtime, and which agent products can use them.",
  },
};

const relationshipRows = [
  {
    label: "Skill",
    summary: "Instruction layer that teaches the agent how to install and use AnyCap.",
  },
  {
    label: "CLI",
    summary: "Executable surface the agent or operator actually runs, like `anycap image generate`.",
  },
  {
    label: "Capability",
    summary: "The concrete action exposed through the runtime, such as image generation or video analysis.",
  },
  {
    label: "Tool",
    summary: "Generic execution surface. A skill can describe a tool, but it is not the same thing as the capability runtime.",
  },
];

const supportedTargets = [
  { name: "Claude Code", href: "/for/claude-code" },
  { name: "Cursor", href: "/for/cursor" },
  { name: "Codex", href: "/for/codex" },
  { name: "OpenCode", href: null },
  { name: "OpenClaw", href: null },
];

const installPatterns = [
  {
    title: "Install through skills.sh",
    note: "Best when the agent ecosystem already supports skills as a distribution format.",
    code: "npx -y skills add anycap-ai/anycap -a claude-code -y",
  },
  {
    title: "Install through AnyCap CLI",
    note: "Useful when you want the runtime to place the skill file in a known target directory.",
    code: "anycap skill install --target ~/.claude/skills/anycap-cli/",
  },
  {
    title: "Install manually",
    note: "Fallback path when you want direct control over the skill file location.",
    code: "curl -fsSL https://raw.githubusercontent.com/anycap-ai/anycap/main/skills/anycap-cli/SKILL.md --create-dirs -o ~/.claude/skills/anycap-cli/SKILL.md",
  },
];

const skillsHubJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "AnyCap Skills",
  description:
    "Hub page for installable AnyCap skills that teach AI agents how to discover and use capabilities through one runtime.",
  url: `${siteConfig.url}/skills`,
  hasPart: [
    { "@type": "WebPage", name: "AnyCap for Claude Code", url: `${siteConfig.url}/for/claude-code` },
    { "@type": "WebPage", name: "AnyCap for Cursor", url: `${siteConfig.url}/for/cursor` },
    { "@type": "WebPage", name: "Agent Skills for Developer Tools", url: `${siteConfig.url}/guides/agent-skills-for-developer-tools` },
    { "@type": "WebPage", name: "Install AnyCap", url: `${siteConfig.url}/guides/install-anycap` },
  ],
};

export default function SkillsPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Home", href: "/" }, { name: "Skills" }]} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(skillsHubJsonLd) }}
      />
      <article className="px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[1280px] py-12 md:py-20 lg:py-24">
          <FadeIn>
            <p className="text-[11px] text-[#6b7d3a] tracking-[0.8px] mb-4" style={mono}>
              Hub
            </p>
            <h1
              className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(32px, 6vw, 72px)" }}
            >
              AnyCap skills
            </h1>
            <p className="mt-6 max-w-[780px] text-base leading-7 text-[#4d5145] md:text-lg">
              Skills are the installable instructions that teach an AI agent how to discover,
              install, authenticate, and invoke AnyCap. They are not the capability itself and
              they are not the CLI binary. They are the distribution layer that helps agents like
              Claude Code, Cursor, and Codex understand how to use the same capability runtime.
            </p>
          </FadeIn>

          <FadeIn className="mt-8">
            <EarlyAccessBanner />
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="text-lg md:text-xl text-[#1c1f17] mb-8" style={{ ...pixel }}>
                How skills fit in the stack
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {relationshipRows.map((row) => (
                  <div key={row.label} className="border border-[#d4dbb8] p-5">
                    <p className="text-[11px] text-[#6b7d3a] tracking-[0.5px] mb-2" style={mono}>
                      {row.label}
                    </p>
                    <p className="text-sm text-[#4d5145] leading-6">{row.summary}</p>
                  </div>
                ))}
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="text-lg md:text-xl text-[#1c1f17] mb-8" style={{ ...pixel }}>
                Supported agent products
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {supportedTargets.map((target) =>
                  target.href ? (
                    <Link
                      key={target.name}
                      href={target.href}
                      className="border border-[#d4dbb8] p-5 hover:border-[#6b7d3a] transition-colors"
                    >
                      <p className="text-[12px] text-[#6b7d3a] tracking-[0.8px] mb-2" style={mono}>
                        Supported
                      </p>
                      <h3 className="text-[15px] font-bold text-[#1c1f17]" style={mono}>
                        {target.name}
                      </h3>
                    </Link>
                  ) : (
                    <div key={target.name} className="border border-[#d4dbb8]/70 p-5 opacity-80">
                      <p className="text-[12px] text-[#5a5e52] tracking-[0.8px] mb-2" style={mono}>
                        Planned
                      </p>
                      <h3 className="text-[15px] font-bold text-[#1c1f17]" style={mono}>
                        {target.name}
                      </h3>
                    </div>
                  ),
                )}
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="text-lg md:text-xl text-[#1c1f17] mb-8" style={{ ...pixel }}>
                Install patterns
              </h2>
              <div className="space-y-6 max-w-[920px]">
                {installPatterns.map((pattern) => (
                  <div key={pattern.title} className="border border-[#d4dbb8] p-5">
                    <h3 className="text-[14px] font-bold text-[#1c1f17] mb-2" style={mono}>
                      {pattern.title}
                    </h3>
                    <p className="text-sm text-[#4d5145] leading-6 mb-4">{pattern.note}</p>
                    <div className="bg-[#1c1f17] px-5 py-4">
                      <p className="text-[13px] text-[#d4e0a4] break-all" style={mono}>
                        {pattern.code}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="text-lg md:text-xl text-[#1c1f17] mb-6" style={{ ...pixel }}>
                What skills are not
              </h2>
              <div className="space-y-4 max-w-[760px]">
                <p className="text-base leading-7 text-[#4d5145]">
                  A skill is not the same as MCP, A2A, or another agent protocol. Those protocols
                  describe how systems communicate. A skill describes how an agent should install
                  and use a capability runtime inside its execution environment.
                </p>
                <p className="text-base leading-7 text-[#4d5145]">
                  A skill is also not a generic tools directory. It is the agent-facing
                  instruction layer that points the agent toward the runtime, the CLI, and the
                  capabilities it can call once installed.
                </p>
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24 mb-8">
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/guides/install-anycap"
                  className="inline-block px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#f4f5f0] bg-[#6b7d3a] hover:bg-[#1c1f17] transition-colors rounded-lg"
                  style={mono}
                >
                  Install AnyCap
                </Link>
                <Link
                  href="/guides/agent-skills-for-developer-tools"
                  className="inline-block px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] border border-[#1c1f17] hover:bg-[#1c1f17] hover:text-[#f4f5f0] transition-colors rounded-lg"
                  style={mono}
                >
                  Skills Guide
                </Link>
                <Link
                  href="/guides/mcp-vs-a2a-for-ai-agents"
                  className="inline-block px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] border border-[#1c1f17] hover:bg-[#1c1f17] hover:text-[#f4f5f0] transition-colors rounded-lg"
                  style={mono}
                >
                  MCP vs A2A
                </Link>
              </div>
            </section>
          </FadeIn>
        </div>
      </article>
    </>
  );
}
