import { Suspense } from "react";
import { Footer } from "@/components/layout/Footer";
import { Header, humanNavLinks } from "@/components/layout/Header";
import { AuthNav } from "@/components/layout/AuthNav";
import { LazyEquipAgent } from "@/components/landing/LazyEquipAgent";
import { TerminalDemo } from "@/components/landing/TerminalDemo";
import { FadeIn } from "@/components/ui/FadeIn";
import { ScrambleText } from "@/components/ui/ScrambleText";
import { ParticleAgent } from "@/components/landing/ParticleAgent";

export const runtime = "edge";
const githubHref = "https://github.com/anycap-ai/anycap";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

const capabilities = ["Image", "Video", "Music", "Voice", "Vision", "Pages"];

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

      <section
        className="flex flex-col px-5 md:px-16 lg:h-dvh lg:px-24 lg:pb-8"
        style={{ paddingTop: "84px" }}
      >
        <div className="flex flex-col gap-8 lg:flex-1 lg:min-h-0 lg:flex-row lg:items-center lg:gap-12">
          <div className="min-w-0 flex-1">
            <h1
              className="leading-[1.15] tracking-[-0.03em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(42px, 5.5vw, 76px)" }}
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
            <p className="mt-5 hidden max-w-[700px] text-base leading-7 text-[#4d5145] md:block md:text-lg">
              Your agent can reason and code, but it can&apos;t create images, produce
              videos, or publish sites. AnyCap gives it any capability it&apos;s
              missing&nbsp;&mdash; with one install.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3 md:mt-8">
              <LazyEquipAgent style={mono} />
              <a
                href={githubHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-[#ccd1c3] bg-[#fafbf8] px-6 py-4 text-[13px] text-[#3a3e32] shadow-[0_1px_2px_rgba(0,0,0,0.06)] transition-all duration-200 ease-out hover:border-[#b8bdaf] hover:bg-[#f0f2eb] hover:text-[#1c1f17]"
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
          </div>

          <div className="relative w-full shrink-0 lg:flex lg:flex-col lg:w-[50%] lg:self-stretch lg:justify-center lg:min-h-0">
            <div className="absolute right-[168px] top-3 z-10 hidden max-w-[320px] rounded-[24px] bg-[linear-gradient(180deg,#fbfcf6_0%,#eef4e2_100%)] px-5 py-4 text-[#23281d] shadow-[0_18px_40px_rgba(10,12,9,0.18),0_1px_0_rgba(255,255,255,0.7)_inset] lg:block">
              <p className="text-[15px] font-semibold leading-[1.35] text-[#182012]">
                Start me with <span className="text-[#5f7a29]">250 bonus credits</span>.
              </p>
              <p className="mt-2 text-[12px] leading-[1.55] text-[#495240]">
                Sign up before <span className="font-semibold text-[#1f2619]">Apr 10</span> and
                give me about <span className="font-semibold text-[#1f2619]">USD 5</span> in starter fuel.
              </p>
            </div>
            <div className="flex h-[50vh] w-full flex-col overflow-hidden rounded-lg bg-[#1c1f17] px-5 pt-0 pb-5 md:px-6 md:pb-6 lg:h-[calc((100dvh-8rem)*0.8)] lg:px-8 lg:pb-8 transition-all duration-300 lg:hover:scale-[1.02] lg:hover:shadow-[0_20px_60px_rgba(28,31,23,0.25)]">
              <TerminalDemo
                headerRight={
                  <ParticleAgent scale={0.35} />
                }
              />
            </div>
          </div>
        </div>
      </section>

      <FadeIn from="right" className="mt-16 flex justify-end px-8 md:mt-28 md:px-16 lg:px-24">
        <div className="max-w-[520px] border-r-[3px] border-[#1c1f17] pr-6 text-right md:pr-8">
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
          <p className="mt-12 max-w-[640px] text-xl leading-[1.7] text-[#3a3e32] md:mt-16 md:text-2xl">
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
