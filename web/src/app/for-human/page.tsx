import Link from "next/link";
import { Suspense } from "react";
import { Footer } from "@/components/Footer";
import { Header, humanNavLinks } from "@/components/Header";
import { AuthNav } from "@/components/AuthNav";
import { LazyEquipAgent } from "@/components/LazyEquipAgent";
import { LazyTerminalDemo } from "@/components/LazyTerminalDemo";
import { FadeIn } from "@/components/FadeIn";
import { ScrambleText } from "@/components/ScrambleText";
import { ParticleAgent } from "@/components/animation/ParticleAgent";
import { buildLocalizedPath, defaultLocale } from "@/lib/site";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace" } as const;

const capabilities = ["Image", "Video", "Music", "Speech", "Search", "Crawl"];
const cliHref = buildLocalizedPath(defaultLocale, "/cli");
const capabilitiesHref = buildLocalizedPath(defaultLocale, "/capabilities");
const imageUnderstandingHref = buildLocalizedPath(
  defaultLocale,
  "/capabilities/image-understanding"
);
const videoAnalysisHref = buildLocalizedPath(defaultLocale, "/capabilities/video-analysis");
const installGuideHref = buildLocalizedPath(defaultLocale, "/guides/install-anycap");
const modelsHref = buildLocalizedPath(defaultLocale, "/models");

const startLinks = [
  {
    href: installGuideHref,
    label: "Install AnyCap",
    description: "Set up the skill, CLI, and login flow.",
  },
  {
    href: cliHref,
    label: "CLI Overview",
    description: "See the agent-facing command model and workflow.",
  },
  {
    href: capabilitiesHref,
    label: "Capabilities",
    description: "Browse what AnyCap exposes today and what is next.",
  },
] as const;

const bodyLinkClass =
  "underline decoration-[#6b7d3a] underline-offset-4 transition-colors hover:text-[#1c1f17]";

export default function ForHumanPage() {
  return (
    <main className="overflow-x-hidden">
      <Header
        logoHref="/for-human"
        links={humanNavLinks}
        authSlot={
          <Suspense fallback={null}>
            <AuthNav />
          </Suspense>
        }
      />

      <section className="px-8 pt-12 md:px-16 md:pt-20 lg:px-24 lg:pt-24">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-12">
          <div className="min-w-0 flex-1">
            <h1
              className="leading-[0.92] tracking-[-0.03em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(42px, 8vw, 108px)" }}
            >
              <span className="sr-only">
                Your Agent can do anything. It just needs AnyCap.
              </span>
              <span aria-hidden>
                Your{" "}
                <ScrambleText
                  text="Agent"
                  className="text-[#6b7d3a]"
                  style={{ fontSize: "1.08em" }}
                  speed={30}
                  ticks={3}
                />
                <br />
                can do anything.
                <br />
                It just needs{" "}
                <ScrambleText
                  text="AnyCap."
                  className="text-[#6b7d3a]"
                  style={{ fontSize: "1.08em" }}
                  speed={30}
                  ticks={3}
                />
              </span>
            </h1>
            <p className="mt-6 max-w-[700px] text-base leading-7 text-[#4d5145] md:text-lg">
              Agents can think, but they can&apos;t act — no images, no video, no music,
              no voice. Every capability they need is locked behind a different SDK and
              a different API key. AnyCap makes it one command.
            </p>
            <div className="mt-8 md:mt-10">
              <LazyEquipAgent style={mono} />
            </div>
          </div>

          <div className="hidden shrink-0 lg:block lg:-translate-x-12 xl:-translate-x-24">
            <ParticleAgent scale={0.85} />
          </div>
        </div>
      </section>

      <section className="mt-16 px-8 md:mt-24 md:px-16 lg:px-24">
        <div className="grid gap-10 border border-[#d4dbb8] bg-[#eef0e5] p-8 md:p-10 lg:grid-cols-[minmax(0,1.6fr)_minmax(280px,0.9fr)]">
          <div className="max-w-[760px]">
            <h2
              className="text-[#1c1f17] leading-[1.04] tracking-[-0.02em]"
              style={{ ...pixel, fontSize: "clamp(28px, 4.4vw, 58px)" }}
            >
              What AnyCap gives human teams building with agents.
            </h2>
            <p className="mt-6 text-base leading-7 text-[#3f4437] md:text-lg">
              AnyCap is an agent-native capability runtime and CLI for teams using
              Cursor, Claude Code, Codex, and other agent tooling. It gives agents one
              install path, one authentication flow, and one interface for image, video,
              music, speech, search, and crawl capabilities.
            </p>
            <p className="mt-5 text-base leading-7 text-[#4d5145] md:text-lg">
              Instead of wiring separate SDKs, dashboards, and API keys for every model
              vendor, you can standardize on the{" "}
              <Link href={cliHref} className={bodyLinkClass}>
                AnyCap CLI
              </Link>{" "}
              and roll out new workflows faster. Start with the{" "}
              <Link href={installGuideHref} className={bodyLinkClass}>
                install guide
              </Link>
              , review the documented{" "}
              <Link href={capabilitiesHref} className={bodyLinkClass}>
                capabilities
              </Link>
              , and use the{" "}
              <Link href={modelsHref} className={bodyLinkClass}>
                models hub
              </Link>{" "}
              when you need provider-level detail.
            </p>
          </div>

          <aside className="border border-[#d4dbb8] bg-[#f4f5f0] p-6">
            <h3
              className="text-[#1c1f17] uppercase tracking-[3px] text-[12px]"
              style={mono}
            >
              Start Here
            </h3>
            <div className="mt-5 space-y-4">
              {startLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block border border-[#d4dbb8] bg-white px-4 py-4 transition-colors hover:border-[#6b7d3a] hover:bg-[#f7f9f0]"
                >
                  <p className="text-[12px] uppercase tracking-[2px] text-[#1c1f17]" style={mono}>
                    {item.label}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#4d5145]">{item.description}</p>
                </Link>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="mt-16 bg-[#1c1f17] px-8 py-8 md:mt-24 md:px-16 md:py-10 lg:px-24">
        <div className="max-w-[800px]">
          <h2
            className="text-[#d4e0a4] leading-[1.1] tracking-[-0.02em]"
            style={{ ...pixel, fontSize: "clamp(24px, 3.2vw, 40px)" }}
          >
            How AnyCap works in an agent workflow.
          </h2>
          <p className="mt-4 max-w-[720px] text-sm leading-7 text-[#9a9e90] md:text-base">
            Install the skill, install the CLI, log in once, and let your agent call
            capabilities from the environment it already uses. The demo below is backed
            by the same interface described across the CLI and capability pages.
          </p>
          <div className="mt-6">
            <LazyTerminalDemo style={mono} />
          </div>
        </div>
      </section>

      <FadeIn from="right" className="mt-16 flex justify-end px-8 md:mt-28 md:px-16 lg:px-24">
        <div className="max-w-[520px] border-r-[3px] border-[#1c1f17] pr-6 text-right md:pr-8">
          <p className="text-lg leading-[1.65] text-[#3a3e32] md:text-[22px]">
            It reasons. It plans. It decides.
            <br />
            It cannot paint, compose, or speak.
          </p>
          <p className="mt-5 text-xl text-[#1c1f17] md:text-[24px]" style={pixel}>
            <ScrambleText text="We built the hands." speed={20} ticks={2} />
          </p>
        </div>
      </FadeIn>

      <FadeIn className="mt-24 px-8 md:mt-36 md:px-16 lg:px-24">
        <p
          className="mb-4 uppercase tracking-[6px] text-[#c8d4a0] line-through md:tracking-[10px]"
          style={{ ...pixel, fontSize: "clamp(14px, 2.2vw, 24px)" }}
        >
          SDK&nbsp;&nbsp;&nbsp;DOCS&nbsp;&nbsp;&nbsp;DASHBOARD&nbsp;&nbsp;&nbsp;UI
        </p>
        <p
          className="uppercase tracking-[4px] text-[#1c1f17] md:tracking-[8px]"
          style={{ ...pixel, fontSize: "clamp(14px, 2.2vw, 24px)" }}
        >
          <ScrambleText text="ONE COMMAND. ONE RESULT. DONE." speed={20} ticks={2} />
        </p>
      </FadeIn>

      <div className="mt-24 px-8 md:mt-36 md:px-16 lg:px-24">
        <hr className="border-t border-[#d4dbb8]" />
      </div>

      <section className="px-8 py-20 md:px-16 md:py-32 lg:px-24">
        <FadeIn>
          <h2
            className="mb-6 leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
            style={{ ...pixel, fontSize: "clamp(28px, 4.5vw, 60px)" }}
          >
            We believe Agents deserve
            <br />
            products built for them.
          </h2>
        </FadeIn>
        <FadeIn delay={200}>
          <p className="text-xl text-[#6b7d3a] md:text-2xl" style={mono}>
            Not adapted. Not retrofitted. Built.
          </p>
        </FadeIn>
      </section>

      <div className="px-8 md:px-16 lg:px-24">
        <hr className="border-t border-[#d4dbb8]" />
      </div>

      <section className="px-8 py-20 md:px-16 md:py-32 lg:px-24">
        <div className="mb-12 max-w-[760px]">
          <h2
            className="text-[#1c1f17] leading-[1.08] tracking-[-0.02em]"
            style={{ ...pixel, fontSize: "clamp(28px, 4.4vw, 56px)" }}
          >
            Capabilities your agent can use without a new integration each time.
          </h2>
          <p className="mt-5 text-base leading-7 text-[#4d5145] md:text-lg">
            Today the public site documents production-ready entry points such as{" "}
            <Link href={imageUnderstandingHref} className={bodyLinkClass}>
              image understanding
            </Link>{" "}
            and{" "}
            <Link href={videoAnalysisHref} className={bodyLinkClass}>
              video analysis
            </Link>
            . The broader{" "}
            <Link href={capabilitiesHref} className={bodyLinkClass}>
              capabilities overview
            </Link>{" "}
            explains how these building blocks fit together for agent-native products.
          </p>
        </div>
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
            className="text-right text-[11px] uppercase tracking-[3px] text-[#5a5e52]"
            style={mono}
          >
            Same interface.
            <br />
            Always.
          </p>
        </div>
      </section>

      <div className="px-8 md:px-16 lg:px-24">
        <hr className="border-t border-[#d4dbb8]" />
      </div>

      <section className="px-8 py-20 md:px-16 md:py-32 lg:px-24">
        <FadeIn from="left">
          <div className="max-w-[700px] border-l-[3px] border-[#6b7d3a] pl-6 md:pl-8">
            <h2
              className="leading-[1.3] text-[#6b7d3a]"
              style={{ ...pixel, fontSize: "clamp(22px, 3.5vw, 40px)" }}
            >
              The best infrastructure is the kind you forget exists.
            </h2>
          </div>
        </FadeIn>
        <FadeIn delay={200}>
          <p className="mt-12 max-w-[640px] text-xl leading-[1.7] text-[#3a3e32] md:mt-16 md:text-2xl">
            No SDK to learn. No docs to read. No dashboard to check.
            Your agent sends a command. It gets a result. That&apos;s the entire interface.
          </p>
        </FadeIn>
      </section>

      <div className="px-8 md:px-16 lg:px-24">
        <hr className="border-t border-[#d4dbb8]" />
      </div>

      <section className="px-8 py-24 text-center md:px-16 md:py-40 lg:px-24">
        <FadeIn>
          <h2
            className="mb-14 leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
            style={{ ...pixel, fontSize: "clamp(32px, 6vw, 72px)" }}
          >
            And we&apos;re just
            <br />
            getting started.
          </h2>
        </FadeIn>
        <FadeIn delay={300}>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href={installGuideHref}
              className="inline-block bg-[#6b7d3a] px-10 py-4 text-[11px] font-bold uppercase tracking-[3px] text-[#f4f5f0] transition-colors hover:bg-[#1c1f17]"
              style={mono}
            >
              Install AnyCap
            </Link>
            <Link
              href={cliHref}
              className="inline-block border border-[#1c1f17] px-10 py-4 text-[11px] font-bold uppercase tracking-[3px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
              style={mono}
            >
              Explore the CLI
            </Link>
          </div>
          <p className="mx-auto mt-8 max-w-[720px] text-sm leading-7 text-[#4d5145] md:text-base">
            Need more context first? Browse the{" "}
            <Link href={capabilitiesHref} className={bodyLinkClass}>
              capabilities overview
            </Link>
            , inspect the{" "}
            <Link href={modelsHref} className={bodyLinkClass}>
              models hub
            </Link>
            , or visit{" "}
            <a
              href="https://github.com/anycap-ai/anycap"
              target="_blank"
              rel="noopener noreferrer"
              className={bodyLinkClass}
            >
              GitHub
            </a>{" "}
            for the repository and release history.
          </p>
        </FadeIn>
      </section>

      <Footer />
    </main>
  );
}
