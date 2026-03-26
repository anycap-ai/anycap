export const runtime = 'edge';

import Link from "next/link";
import { cookies } from "next/headers";
import { AnycapMark } from "@/components/brand/AnycapMark";
import { AnycapWordmark } from "@/components/brand/AnycapWordmark";
import { EquipAgent } from "@/components/EquipAgent";
import { ScrambleText } from "@/components/ScrambleText";
import { TerminalDemo } from "@/components/TerminalDemo";
import { FadeIn } from "@/components/FadeIn";
import { readSessionCookie } from "@/lib/auth/session";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace" } as const;

const capabilities = ["Image", "Video", "Music", "Speech", "Search", "Crawl"];

export default async function ForHumanPage() {
  const cookieStore = await cookies();
  const session = await readSessionCookie(cookieStore);
  const isLoggedIn = Boolean(session?.apiKey);

  return (
    <main className="overflow-x-hidden">
      {/* ── Header ── */}
      <header className="px-8 md:px-16 lg:px-24 pt-6 md:pt-10">
        <div className="flex items-center gap-3">
          <AnycapMark size={28} className="shrink-0" />
          <AnycapWordmark
            className="text-xl font-bold leading-none"
            style={{ ...mono, letterSpacing: "-0.5px" }}
          />
          <div className="ml-auto flex items-center gap-5">
            {session?.user?.email ? (
              <span className="text-[11px] text-[#7a7e71] tracking-[1.5px]" style={mono}>
                {session.user.email}
              </span>
            ) : null}

            {isLoggedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-[11px] text-[#9a9e90] hover:text-[#6b7d3a] tracking-[2px] uppercase transition-colors"
                  style={mono}
                >
                  Dashboard
                </Link>
                <Link
                  href="/auth/logout"
                  className="text-[11px] text-[#9a9e90] hover:text-[#6b7d3a] tracking-[2px] uppercase transition-colors"
                  style={mono}
                >
                  Logout
                </Link>
              </>
            ) : (
              <Link
                href="/auth/login"
                className="text-[11px] text-[#9a9e90] hover:text-[#6b7d3a] tracking-[2px] uppercase transition-colors"
                style={mono}
              >
                Login
              </Link>
            )}
            <Link
              href="/"
              className="text-[11px] text-[#9a9e90] hover:text-[#6b7d3a] tracking-[2px] uppercase transition-colors"
              style={mono}
            >
              I&apos;m Agent →
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="px-8 md:px-16 lg:px-24 pt-12 md:pt-20 lg:pt-24">
        <div>
          <div>
            <h1
              className="leading-[0.92] tracking-[-0.03em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(42px, 8vw, 108px)" }}
            >
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
            </h1>
            <p className="mt-6 max-w-[700px] text-base leading-7 text-[#4d5145] md:text-lg">
              Agents can think, but they can&apos;t act — no images, no video, no music,
              no voice. Every capability they need is locked behind a different SDK and
              a different API key. AnyCap makes it one command.
            </p>
          </div>
          <div className="mt-8 md:mt-10">
            <EquipAgent />
          </div>
        </div>
      </section>

      {/* ── Terminal — full-width dark band ── */}
      <div className="mt-16 md:mt-24 bg-[#1c1f17] py-6 md:py-10 px-8 md:px-16 lg:px-24">
        <TerminalDemo />
      </div>

      {/* ── Pull quote — right-aligned ── */}
      <FadeIn from="right" className="px-8 md:px-16 lg:px-24 mt-16 md:mt-28 flex justify-end">
        <div className="border-r-[3px] border-[#1c1f17] pr-6 md:pr-8 text-right max-w-[520px]">
          <p className="text-lg md:text-[22px] leading-[1.65] text-[#3a3e32]">
            It reasons. It plans. It decides.
            <br />
            It cannot paint, compose, or speak.
          </p>
          <p
            className="text-xl md:text-[24px] text-[#1c1f17] mt-5"
            style={pixel}
          >
            <ScrambleText text="We built the hands." speed={20} ticks={2} />
          </p>
        </div>
      </FadeIn>

      {/* ── Anti-pattern ── */}
      <FadeIn className="px-8 md:px-16 lg:px-24 mt-24 md:mt-36">
        <p
          className="text-[#c8d4a0] line-through tracking-[6px] md:tracking-[10px] uppercase mb-4"
          style={{ ...pixel, fontSize: "clamp(14px, 2.2vw, 24px)" }}
        >
          SDK&nbsp;&nbsp;&nbsp;DOCS&nbsp;&nbsp;&nbsp;DASHBOARD&nbsp;&nbsp;&nbsp;UI
        </p>
        <p
          className="tracking-[4px] md:tracking-[8px] uppercase text-[#1c1f17]"
          style={{ ...pixel, fontSize: "clamp(14px, 2.2vw, 24px)" }}
        >
          <ScrambleText text="ONE COMMAND. ONE RESULT. DONE." speed={20} ticks={2} />
        </p>
      </FadeIn>

      <div className="px-8 md:px-16 lg:px-24 mt-24 md:mt-36">
        <hr className="border-t border-[#d4dbb8]" />
      </div>

      {/* ── Belief ── */}
      <section className="px-8 md:px-16 lg:px-24 py-20 md:py-32">
        <FadeIn>
          <p
            className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17] mb-6"
            style={{ ...pixel, fontSize: "clamp(28px, 4.5vw, 60px)" }}
          >
            We believe Agents deserve
            <br />
            products built for them.
          </p>
        </FadeIn>
        <FadeIn delay={200}>
          <p className="text-xl md:text-2xl text-[#6b7d3a]" style={mono}>
            Not adapted. Not retrofitted. Built.
          </p>
        </FadeIn>
      </section>

      <div className="px-8 md:px-16 lg:px-24">
        <hr className="border-t border-[#d4dbb8]" />
      </div>

      {/* ── Capabilities — full-width dramatic stack ── */}
      <section className="px-8 md:px-16 lg:px-24 py-20 md:py-32">
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
            className="tracking-[3px] uppercase text-[#9a9e90] text-right"
            style={{ ...mono, fontSize: "11px" }}
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

      {/* ── Philosophy ── */}
      <section className="px-8 md:px-16 lg:px-24 py-20 md:py-32">
        <FadeIn from="left">
          <div className="border-l-[3px] border-[#6b7d3a] pl-6 md:pl-8 max-w-[700px]">
            <p
              className="leading-[1.3] text-[#6b7d3a]"
              style={{ ...pixel, fontSize: "clamp(22px, 3.5vw, 40px)" }}
            >
              The best infrastructure is the kind you forget exists.
            </p>
          </div>
        </FadeIn>
        <FadeIn delay={200}>
          <p className="text-xl md:text-2xl leading-[1.7] text-[#3a3e32] mt-12 md:mt-16 max-w-[640px]">
            No SDK to learn. No docs to read. No dashboard to check.
            Your agent sends a command. It gets a result. That&apos;s the entire interface.
          </p>
        </FadeIn>
      </section>

      <div className="px-8 md:px-16 lg:px-24">
        <hr className="border-t border-[#d4dbb8]" />
      </div>

      {/* ── Close ── */}
      <section className="px-8 md:px-16 lg:px-24 py-24 md:py-40 text-center">
        <FadeIn>
          <p
            className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17] mb-14"
            style={{ ...pixel, fontSize: "clamp(32px, 6vw, 72px)" }}
          >
            And we&apos;re just
            <br />
            getting started.
          </p>
        </FadeIn>
        <FadeIn delay={300}>
          <a
            href="https://github.com/anycap-ai/anycap"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-10 py-4 text-[11px] font-bold tracking-[3px] uppercase text-[#f4f5f0] bg-[#6b7d3a] hover:bg-[#1c1f17] transition-colors"
            style={mono}
          >
            Get Started
          </a>
        </FadeIn>
      </section>

      {/* ── Footer ── */}
      <footer className="px-8 md:px-16 lg:px-24 py-10 border-t border-[#d4dbb8]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <AnycapMark size={16} />
            <span
              className="text-[10px] text-[#9a9e90] tracking-[2px] uppercase"
              style={mono}
            >
              Built for agents.
            </span>
          </div>
          <Link
            href="/"
            className="text-[10px] text-[#9a9e90] hover:text-[#6b7d3a] tracking-[2px] uppercase transition-colors"
            style={mono}
          >
            Agent Interface →
          </Link>
        </div>
      </footer>
    </main>
  );
}
