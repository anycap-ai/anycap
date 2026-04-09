import type { Metadata } from "next";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { getLocalizedRouteUrl, siteConfig } from "@/lib/site";
import { EarlyAccessBanner } from "@/components/landing/EarlyAccessBanner";
import { FadeIn } from "@/components/ui/FadeIn";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { getSeoPageChrome } from "@/lib/seo-ia";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

export const metadata: Metadata = {
  title: "AnyCap Skills | Add Capabilities to AI Agents",
  description:
    "A skill teaches Claude Code, Cursor, or Codex how to discover, install, authenticate, and invoke AnyCap. It is the instruction layer that turns a capable coding agent into a capable multimodal agent.",
  alternates: { canonical: "/skills" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/skills",
    siteName: siteConfig.siteName,
    title: "AnyCap Skills | Add Capabilities to AI Agents",
    description:
      "Learn how AnyCap skills connect the agent to the CLI, runtime, and capability stack.",
  },
};

const relationshipRows = [
  {
    label: "Skill",
    summary: "Instruction layer that teaches the agent what missing capabilities exist and how to install and invoke them.",
  },
  {
    label: "CLI",
    summary: "Executable surface the agent or operator actually runs, like `anycap image generate`.",
  },
  {
    label: "Capability",
    summary: "Concrete action exposed through the runtime, such as image generation, image understanding, or video analysis.",
  },
  {
    label: "Tool",
    summary: "Generic execution surface. A skill can describe a tool, but it is not the same thing as the capability runtime itself.",
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

const nextPages = [
  {
    eyebrow: "Learn",
    title: "Why one CLI matters",
    href: "/cli",
    summary: "Use this when you want to see how the command surface stays stable across image, video, and vision workflows.",
  },
  {
    eyebrow: "Learn",
    title: "What agents can't do",
    href: "/learn/what-agents-cant-do",
    summary: "Use this when you want the capability-gap narrative before choosing the next product or capability page.",
  },
  {
    eyebrow: "Guides",
    title: "Install AnyCap",
    href: "/guides/install-anycap",
    summary: "Use this when you want the shortest install path after you understand how the instruction layer works.",
  },
];

const skillsHubJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "AnyCap Skills",
  description:
    "Hub page for installable AnyCap skills that teach AI agents how to discover and use capabilities through one runtime.",
  url: getLocalizedRouteUrl(siteConfig.defaultLocale, "/skills"),
  hasPart: [
    {
      "@type": "WebPage",
      name: "AnyCap for Claude Code",
      url: getLocalizedRouteUrl(siteConfig.defaultLocale, "/for/claude-code"),
    },
    {
      "@type": "WebPage",
      name: "AnyCap for Cursor",
      url: getLocalizedRouteUrl(siteConfig.defaultLocale, "/for/cursor"),
    },
    { "@type": "WebPage", name: "AnyCap CLI", url: getLocalizedRouteUrl(siteConfig.defaultLocale, "/cli") },
    {
      "@type": "WebPage",
      name: "Install AnyCap",
      url: getLocalizedRouteUrl(siteConfig.defaultLocale, "/guides/install-anycap"),
    },
  ],
};

const pageChrome = getSeoPageChrome("/skills");

export default function SkillsPage() {
  return (
    <>
      <BreadcrumbJsonLd items={pageChrome?.breadcrumbItems} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(skillsHubJsonLd) }}
      />
      <article className="px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[1280px] py-12 md:py-20 lg:py-24">
          <FadeIn>
            <p className="mb-4 text-[11px] tracking-[0.8px] text-[#6b7d3a]" style={mono}>
              {pageChrome?.eyebrow ?? "Learn"}
            </p>
            <h1
              className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(32px, 6vw, 72px)" }}
            >
              Skills teach your agent
              <br />
              how to use the capabilities it doesn&apos;t ship with.
            </h1>
            <p className="mt-6 max-w-[780px] text-base leading-7 text-[#4d5145] md:text-lg">
              The agent may know how to code, but it does not automatically know how to discover,
              install, authenticate, and invoke your capability runtime. A skill is the instruction
              layer that closes that gap. It tells Claude Code, Cursor, Codex, and similar agents
              how to connect to AnyCap without turning every setup into a manual integration job.
            </p>
            <p className="mt-4 text-sm leading-6 text-[#6b7d3a]" style={mono}>
              Keep the agent. Teach it the missing runtime.
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
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                What a skill adds to the workflow
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {relationshipRows.map((row) => (
                  <div key={row.label} className="border border-[#d4dbb8] p-5">
                    <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                      {row.label}
                    </p>
                    <p className="text-sm leading-6 text-[#4d5145]">{row.summary}</p>
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
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                Where skills plug in
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {supportedTargets.map((target) =>
                  target.href ? (
                    <Link
                      key={target.name}
                      href={target.href}
                      className="border border-[#d4dbb8] p-5 transition-colors hover:border-[#6b7d3a]"
                    >
                      <p className="mb-2 text-[12px] tracking-[0.8px] text-[#6b7d3a]" style={mono}>
                        Supported
                      </p>
                      <h3 className="text-[15px] font-bold text-[#1c1f17]" style={mono}>
                        {target.name}
                      </h3>
                    </Link>
                  ) : (
                    <div key={target.name} className="border border-[#d4dbb8]/70 p-5 opacity-80">
                      <p className="mb-2 text-[12px] tracking-[0.8px] text-[#5a5e52]" style={mono}>
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
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                Three ways to install the skill
              </h2>
              <div className="max-w-[920px] space-y-6">
                {installPatterns.map((pattern) => (
                  <div key={pattern.title} className="border border-[#d4dbb8] p-5">
                    <h3 className="mb-2 text-[14px] font-bold text-[#1c1f17]" style={mono}>
                      {pattern.title}
                    </h3>
                    <p className="mb-4 text-sm leading-6 text-[#4d5145]">{pattern.note}</p>
                    <div className="bg-[#1c1f17] px-5 py-4">
                      <p className="break-all text-[13px] text-[#d4e0a4]" style={mono}>
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
              <h2 className="mb-6 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                What skills are not
              </h2>
              <div className="max-w-[760px] space-y-4">
                <p className="text-base leading-7 text-[#4d5145]">
                  A skill is not the same as MCP, A2A, or another agent protocol. Those protocols
                  describe how systems communicate. A skill describes how the agent should install
                  and use a capability runtime inside its execution environment.
                </p>
                <p className="text-base leading-7 text-[#4d5145]">
                  A skill is also not the capability itself. It is the instruction layer that
                  points the agent toward the runtime, the CLI, and the concrete commands it can
                  call once the install path is complete.
                </p>
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                Where to go next
              </h2>
              <div className="grid gap-4 lg:grid-cols-3">
                {nextPages.map((page) => (
                  <Link
                    key={page.href}
                    href={page.href}
                    className="rounded-xl border border-[#d4dbb8] bg-[#fffffc]/70 p-6 transition-colors hover:border-[#6b7d3a]"
                  >
                    <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                      {page.eyebrow}
                    </p>
                    <h3 className="mb-3 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                      {page.title}
                    </h3>
                    <p className="text-sm leading-6 text-[#4d5145]">{page.summary}</p>
                  </Link>
                ))}
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
                  className="inline-block rounded-lg bg-[#6b7d3a] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#f4f5f0] transition-colors hover:bg-[#1c1f17]"
                  style={mono}
                >
                  Install AnyCap
                </Link>
                <Link
                  href="/cli"
                  className="inline-block rounded-lg border border-[#1c1f17] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                  style={mono}
                >
                  Why One CLI Matters
                </Link>
                <Link
                  href="/learn/what-agents-cant-do"
                  className="inline-block rounded-lg border border-[#1c1f17] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                  style={mono}
                >
                  See Capability Gaps
                </Link>
              </div>
            </section>
          </FadeIn>
        </div>
      </article>
    </>
  );
}
