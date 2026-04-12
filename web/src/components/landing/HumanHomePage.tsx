import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { Footer } from "@/components/layout/Footer";
import { Header, humanNavLinks } from "@/components/layout/Header";
import { AuthNav } from "@/components/layout/AuthNav";
import { LazyEquipAgent } from "@/components/landing/LazyEquipAgent";
import { TerminalDemo } from "@/components/landing/TerminalDemo";
import { FadeIn } from "@/components/ui/FadeIn";
import { ScrambleText } from "@/components/ui/ScrambleText";
import { ParticleAgent } from "@/components/landing/ParticleAgent";
import { AgentBubble } from "@/components/landing/AgentBubble";
import { siteConfig } from "@/lib/site";
import { createSoftwareApplicationJsonLd } from "@/lib/schema";

const githubHref = "https://github.com/anycap-ai/anycap";
const websiteId = `${siteConfig.url}#website`;
const homePageId = `${siteConfig.url}#home`;
const softwareApplicationEntityId = `${siteConfig.url}#software-application`;

const homeWebPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": homePageId,
  name: "AnyCap | AI Agent Capabilities Through One CLI",
  url: siteConfig.url,
  description:
    "AnyCap gives coding agents one install path, one login, and one CLI for media generation, media understanding, web retrieval, storage, and publishing workflows.",
  isPartOf: {
    "@id": websiteId,
  },
  about: [
    { "@type": "Thing", name: "AI agents" },
    { "@type": "Thing", name: "Coding agents" },
    { "@type": "Thing", name: "Agent capabilities" },
    { "@type": "Thing", name: "Developer tools" },
  ],
  primaryImageOfPage: {
    "@type": "ImageObject",
    url: `${siteConfig.url}/opengraph-image`,
  },
  mainEntity: {
    "@id": softwareApplicationEntityId,
  },
};

const homeSoftwareApplicationJsonLd = {
  ...createSoftwareApplicationJsonLd({
    name: "AnyCap",
    description:
      "Open-source AI agent capability runtime for coding agents. AnyCap gives one CLI and one auth flow for image generation, video generation, music generation, image understanding, video analysis, audio understanding, web search, grounded web search, web crawl, drive storage, page publishing, and file download.",
    path: "/",
    installUrl: `${siteConfig.url}/install.sh`,
  }),
  "@id": softwareApplicationEntityId,
  sameAs: [githubHref],
  isAccessibleForFree: true,
};

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

const capabilities = ["Image", "Video", "Music", "Voice", "Vision", "Pages"];
const popularPaths = [
  { href: "/start", label: "Start here" },
  { href: "/capabilities", label: "Capabilities" },
  { href: "/pricing", label: "Pricing" },
  { href: "/for/codex", label: "For Codex" },
] as const;

export function HumanHomePage() {
  return (
    <main className="overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeWebPageJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(homeSoftwareApplicationJsonLd),
        }}
      />

      <Header
        logoHref="/"
        links={humanNavLinks}
        authSlot={<AuthNav />}
      />

      <section className="flex flex-col px-5 pt-20 sm:px-8 sm:pt-24 md:px-16 lg:px-24 xl:h-dvh xl:pb-8">
        <div className="flex flex-col gap-10 md:gap-12 xl:flex-1 xl:min-h-0 xl:flex-row xl:items-center xl:gap-12">
          <div className="min-w-0 flex-1 xl:max-w-[46rem]">
            <h1
              className="leading-[1.08] tracking-[-0.03em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(36px, 5.5vw, 76px)" }}
            >
              <span className="sr-only">
                Your Agent can do anything. It just needs AnyCap.
              </span>
              <span aria-hidden>
                <ScrambleText text="Your" speed={30} ticks={3} />{" "}
                <ScrambleText
                  text="Agent"
                  className="text-[#6b7d3a]"
                  style={{ fontSize: "1.08em" }}
                  speed={30}
                  ticks={3}
                />
                <br />
                <ScrambleText text="can" speed={30} ticks={3} />{" "}
                <ScrambleText text="do" speed={30} ticks={3} />{" "}
                <ScrambleText text="anything." speed={30} ticks={3} />
                <br />
                <ScrambleText text="It" speed={30} ticks={3} />{" "}
                <ScrambleText text="just" speed={30} ticks={3} />{" "}
                <ScrambleText text="needs" speed={30} ticks={3} />{" "}
                <ScrambleText
                  text="AnyCap."
                  className="text-[#6b7d3a]"
                  style={{ fontSize: "1.08em" }}
                  speed={30}
                  ticks={3}
                />
              </span>
            </h1>
            <p className="mt-5 max-w-[700px] text-[15px] leading-6 text-[#4d5145] sm:text-base sm:leading-7 md:text-lg">
              Your agent can reason and code, but it can&apos;t create images, produce
              videos, or publish sites. AnyCap gives it any capability it&apos;s
              missing&nbsp;&mdash; with one install.
            </p>
            <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <div className="flex w-full justify-start sm:w-auto">
                <LazyEquipAgent
                  style={mono}
                  containerClassName="w-full sm:w-auto"
                  buttonClassName="w-full justify-center sm:w-auto"
                />
              </div>
              <a
                href={githubHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#ccd1c3] bg-[#fafbf8] px-6 py-4 text-[13px] text-[#3a3e32] shadow-[0_1px_2px_rgba(0,0,0,0.06)] transition-all duration-200 ease-out hover:border-[#b8bdaf] hover:bg-[#f0f2eb] hover:text-[#1c1f17] sm:w-auto sm:justify-start"
                style={mono}
              >
                View on GitHub
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="opacity-60">
                  <path
                    d="M3 9L9 3M4 3h5v5"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="text-[11px] tracking-[0.6px] text-[#6b7d3a]" style={mono}>
                Popular paths
              </span>
              {popularPaths.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="inline-flex rounded-full border border-[#d4dbb8] bg-[#fbfcf8] px-3 py-1.5 text-[11px] tracking-[0.5px] text-[#3f4437] transition-colors hover:border-[#6b7d3a] hover:text-[#1c1f17]"
                  style={mono}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="relative w-full shrink-0 xl:flex xl:min-h-0 xl:w-[50%] xl:flex-col xl:self-stretch xl:justify-center">
            <AgentBubble />
            <div className="flex h-[22rem] w-full flex-col overflow-hidden rounded-lg bg-[#1c1f17] px-4 pb-4 pt-0 sm:h-[26rem] sm:px-5 sm:pb-5 md:h-[30rem] md:px-6 md:pb-6 lg:h-[34rem] lg:px-8 lg:pb-8 xl:h-[calc((100dvh-8rem)*0.78)] xl:hover:scale-[1.02] xl:hover:shadow-[0_20px_60px_rgba(28,31,23,0.25)] transition-all duration-300">
              <TerminalDemo
                headerRight={
                  <ParticleAgent scale={0.35} />
                }
              />
            </div>
          </div>
        </div>
      </section>

      <FadeIn from="right" className="mt-16 flex justify-start px-8 md:mt-28 md:justify-end md:px-16 lg:px-24">
        <div className="max-w-[520px] border-l-[3px] border-[#1c1f17] pl-5 text-left md:border-l-0 md:border-r-[3px] md:pl-0 md:pr-8 md:text-right">
          <p className="text-lg leading-[1.65] text-[#3a3e32] md:text-[22px]">
            It reasons. It plans. It writes code.
            <br />
            Then you ask it to generate an image&nbsp;&mdash; and it stops.
          </p>
          <p className="mt-5 text-xl text-[#1c1f17] md:text-[24px]" style={pixel}>
            <ScrambleText text="AnyCap picks up where it left off." speed={20} ticks={2} />
          </p>
        </div>
      </FadeIn>

      <FadeIn className="mt-24 px-8 md:mt-36 md:px-16 lg:px-24">
        <p
          className="mb-4 tracking-[1px] text-[#c8d4a0] line-through md:tracking-[1px]"
          style={{ ...pixel, fontSize: "clamp(14px, 2.2vw, 24px)" }}
        >
          CAN&apos;T&nbsp;SEE&nbsp;&nbsp;&nbsp;CAN&apos;T&nbsp;HEAR&nbsp;&nbsp;&nbsp;CAN&apos;T&nbsp;CREATE&nbsp;&nbsp;&nbsp;CAN&apos;T&nbsp;PUBLISH
        </p>
        <p
          className="tracking-[1px] text-[#1c1f17] md:tracking-[1px]"
          style={{ ...pixel, fontSize: "clamp(14px, 2.2vw, 24px)" }}
        >
          <ScrambleText text="NOW IT CAN." speed={20} ticks={2} />
        </p>
      </FadeIn>

      <div className="mt-24 px-8 md:mt-36 md:px-16 lg:px-24">
        <hr className="border-t border-[#d4dbb8]" />
      </div>

      <section className="px-8 py-20 md:px-16 md:py-32 lg:px-24">
        <FadeIn>
          <p
            className="mb-6 leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
            style={{ ...pixel, fontSize: "clamp(28px, 4.5vw, 60px)" }}
          >
            Any capability
            <br />
            your agent was missing.
          </p>
        </FadeIn>
        <FadeIn delay={200}>
          <p className="text-xl text-[#6b7d3a] md:text-2xl" style={mono}>
            Image. Video. Music. Voice. Vision. Pages.
          </p>
        </FadeIn>
      </section>

      <div className="px-5 md:px-16 lg:px-24">
        <hr className="border-t border-[#d4dbb8]" />
      </div>

      <section className="px-8 py-20 md:px-16 md:py-32 lg:px-24">
        <div className="mb-10">
          {capabilities.map((cap, i) => (
            <p
              key={cap}
              className="leading-[1.1] tracking-[-0.02em]"
              style={{
                ...pixel,
                fontSize: "clamp(36px, 7vw, 96px)",
                color: i % 2 === 0 ? "#1c1f17" : "#6b7d3a",
              }}
            >
              <ScrambleText text={`${cap}.`} speed={25} ticks={2} />
            </p>
          ))}
        </div>
        <div className="flex justify-end">
          <p
            className="text-right text-[11px] tracking-[0.8px] text-[#9a9e90]"
            style={mono}
          >
            One install.
            <br />
            All of this.
          </p>
        </div>
      </section>

      <div className="px-5 md:px-16 lg:px-24">
        <hr className="border-t border-[#d4dbb8]" />
      </div>

      <section className="px-8 py-20 md:px-16 md:py-32 lg:px-24">
        <FadeIn from="left">
          <div className="max-w-[700px] border-l-[3px] border-[#6b7d3a] pl-6 md:pl-8">
            <p
              className="leading-[1.3] text-[#6b7d3a]"
              style={{ ...pixel, fontSize: "clamp(22px, 3.5vw, 40px)" }}
            >
              We believe agents shouldn&apos;t stop at &ldquo;I can&apos;t do that.&rdquo;
            </p>
          </div>
        </FadeIn>
        <FadeIn delay={200}>
          <p className="mt-12 max-w-[640px] text-lg leading-[1.7] text-[#3a3e32] sm:text-xl md:mt-16 md:text-2xl">
            Today&apos;s agents learned to think. But thinking is only part of getting
            things done. They can&apos;t generate images, produce videos, store files, or
            publish pages. These real-world capabilities are the last mile between what
            your agent plans and what it actually delivers. We&apos;re building that last mile.
          </p>
        </FadeIn>
      </section>

      <div className="px-5 md:px-16 lg:px-24">
        <hr className="border-t border-[#d4dbb8]" />
      </div>

      <section className="px-8 py-24 text-center md:px-16 md:py-40 lg:px-24">
        <FadeIn>
          <p
            className="mb-14 leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
            style={{ ...pixel, fontSize: "clamp(32px, 6vw, 72px)" }}
          >
            Let your agent finish
            <br />
            what it started.
          </p>
        </FadeIn>
        <FadeIn delay={300}>
          <LazyEquipAgent label="Get Started" style={mono} />
        </FadeIn>
      </section>

      <Footer />
    </main>
  );
}
