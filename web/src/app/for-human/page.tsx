import { Suspense } from "react";
import { Footer } from "@/components/Footer";
import { Header, humanNavLinks } from "@/components/Header";
import { AuthNav } from "@/components/AuthNav";
import { LazyEquipAgent } from "@/components/LazyEquipAgent";
import { TerminalDemo } from "@/components/TerminalDemo";
import { FadeIn } from "@/components/FadeIn";
import { ScrambleText } from "@/components/ScrambleText";
import { ParticleAgent } from "@/components/animation/ParticleAgent";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

const capabilities = ["Image", "Video", "Music", "Speech", "Search", "Crawl"];

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

      <section className="flex flex-col px-5 pt-24 md:px-16 md:pt-28 lg:h-dvh lg:px-24 lg:pb-8 lg:pt-24">
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
              Agents can think, but they can&apos;t act — no images, no video, no music,
              no voice. Every capability they need is locked behind a different SDK and
              a different API key. AnyCap makes it one command.
            </p>
            <div className="mt-8 md:mt-8">
              <LazyEquipAgent style={mono} />
            </div>
          </div>

          <div className="w-full shrink-0 lg:flex lg:w-[50%] lg:items-center">
            <div className="w-full overflow-hidden rounded-lg bg-[#1c1f17] px-5 pt-0 pb-5 md:px-6 md:pb-6 lg:px-8 lg:pb-8 transition-all duration-300 lg:hover:scale-[1.02] lg:hover:shadow-[0_20px_60px_rgba(28,31,23,0.25)]">
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
          className="mb-4 tracking-[1px] text-[#c8d4a0] line-through md:tracking-[1px]"
          style={{ ...pixel, fontSize: "clamp(14px, 2.2vw, 24px)" }}
        >
          SDK&nbsp;&nbsp;&nbsp;DOCS&nbsp;&nbsp;&nbsp;DASHBOARD&nbsp;&nbsp;&nbsp;UI
        </p>
        <p
          className="tracking-[1px] text-[#1c1f17] md:tracking-[1px]"
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
          <p
            className="mb-6 leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
            style={{ ...pixel, fontSize: "clamp(28px, 4.5vw, 60px)" }}
          >
            We believe Agents deserve
            <br />
            products built for them.
          </p>
        </FadeIn>
        <FadeIn delay={200}>
          <p className="text-xl text-[#6b7d3a] md:text-2xl" style={mono}>
            Not adapted. Not retrofitted. Built.
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
            Same interface.
            <br />
            Always.
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
              The best infrastructure is the kind you forget exists.
            </p>
          </div>
        </FadeIn>
        <FadeIn delay={200}>
          <p className="mt-12 max-w-[640px] text-xl leading-[1.7] text-[#3a3e32] md:mt-16 md:text-2xl">
            No SDK to learn. No docs to read. No dashboard to check.
            Your agent sends a command. It gets a result. That&apos;s the entire interface.
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
            And we&apos;re just
            <br />
            getting started.
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
