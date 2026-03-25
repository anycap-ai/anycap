import Link from "next/link";
import { AnycapMark } from "@/components/brand/AnycapMark";
import { AnycapWordmark } from "@/components/brand/AnycapWordmark";
import { EquipAgent } from "@/components/EquipAgent";

const mono = { fontFamily: "var(--font-mono), monospace" } as const;

const capabilities = ["Image", "Video", "Music", "Speech", "Search", "Crawl"];

export default function ForHumanPage() {
  return (
    <main className="overflow-x-hidden">
      {/* ── Header ── */}
      <header className="flex items-center gap-3 px-8 md:px-16 lg:px-24 pt-8 md:pt-12">
        <AnycapMark size={28} className="shrink-0" />
        <AnycapWordmark
          className="text-xl font-bold leading-none"
          style={{ ...mono, letterSpacing: "-0.5px" }}
        />
      </header>

      {/* ── Hero ── */}
      <section className="px-8 md:px-16 lg:px-24 pt-12 md:pt-20">
        <h1
          className="font-bold leading-[0.92] tracking-[-0.04em] text-[#1c1f17]"
          style={{ fontSize: "clamp(52px, 10vw, 148px)" }}
        >
          Your Agent
          <br />
          can do anything.
          <br />
          <span className="text-[#6b7d3a]">It just needs AnyCap.</span>
        </h1>
        <div className="mt-8 md:mt-12">
          <EquipAgent />
        </div>
      </section>

      {/* ── Terminal — full-width dark band ── */}
      <div className="mt-12 md:mt-20 bg-[#1c1f17] py-6 md:py-10 px-8 md:px-16 lg:px-24">
        <div className="max-w-[800px] text-[13px] md:text-sm leading-relaxed" style={mono}>
          {/* Session header */}
          <div className="flex items-center gap-2 pb-4 mb-5 border-b border-[#2a2e22]">
            <span className="text-[#8fa34e]">✻</span>
            <span className="text-[#9a9e90] text-xs tracking-wide">agent</span>
          </div>

          {/* User prompt */}
          <div className="mb-5">
            <span className="text-[#6b7d3a]">❯ </span>
            <span className="text-[#d4e0a4]">
              Generate an image of a paper crane in morning light
            </span>
          </div>

          {/* Agent reasoning */}
          <p className="text-[#9a9e90] mb-5">
            {`I'll use AnyCap to generate this. Let me load the skill first.`}
          </p>

          {/* Tool call: load_skill */}
          <div className="mb-5">
            <div className="flex items-start gap-2">
              <span className="text-[#8fa34e] mt-[1px]">●</span>
              <span className="text-[#b8cc6e]">
                {`load_skill("anycap")`}
              </span>
            </div>
            <p className="text-[#6b7d3a] ml-5 mt-1">
              image · video · music · tts · search · crawl
            </p>
          </div>

          {/* Agent reasoning */}
          <p className="text-[#9a9e90] mb-5">
            Found image capability. Generating now.
          </p>

          {/* Tool call: run */}
          <div className="mb-5">
            <div className="flex items-start gap-2">
              <span className="text-[#8fa34e] mt-[1px]">●</span>
              <span className="text-[#b8cc6e]">
                {`run("anycap image generate --prompt 'paper crane in morning light'")`}
              </span>
            </div>
            <p className="text-[#6b7d3a] ml-5 mt-1">
              {`✓ { status: "success", url: "cdn.anycap.ai/img/a3f…" }`}
            </p>
          </div>

          {/* Agent done */}
          <p className="text-[#9a9e90] mb-5">
            Done. Image generated and saved.
          </p>

          {/* Cursor */}
          <div className="flex items-center gap-2">
            <span className="text-[#6b7d3a]">❯</span>
            <span className="inline-block w-[7px] h-[14px] bg-[#b8cc6e] animate-blink" />
          </div>
        </div>
      </div>

      {/* ── Pull quote — right-aligned ── */}
      <div className="px-8 md:px-16 lg:px-24 mt-14 md:mt-24 flex justify-end">
        <div className="border-r-[3px] border-[#1c1f17] pr-6 md:pr-8 text-right max-w-[520px]">
          <p className="text-lg md:text-[22px] leading-[1.65] text-[#3a3e32]">
            It reasons. It plans. It decides.
            <br />
            It cannot paint, compose, or speak.
          </p>
          <p className="text-xl md:text-[24px] font-bold text-[#1c1f17] mt-5">
            We built the hands.
          </p>
        </div>
      </div>

      {/* ── Anti-pattern ── */}
      <section className="px-8 md:px-16 lg:px-24 mt-20 md:mt-32">
        <p
          className="text-[#d4e0a4] line-through tracking-[6px] md:tracking-[10px] uppercase mb-4"
          style={{ ...mono, fontSize: "clamp(14px, 2.2vw, 24px)" }}
        >
          SDK&nbsp;&nbsp;&nbsp;DOCS&nbsp;&nbsp;&nbsp;DASHBOARD&nbsp;&nbsp;&nbsp;UI
        </p>
        <p
          className="font-bold tracking-[4px] md:tracking-[8px] uppercase text-[#1c1f17]"
          style={{ ...mono, fontSize: "clamp(14px, 2.2vw, 24px)" }}
        >
          ONE COMMAND. ONE RESULT. DONE.
        </p>
      </section>

      <div className="px-8 md:px-16 lg:px-24 mt-20 md:mt-32">
        <hr className="border-t-2 border-[#eef2de]" />
      </div>

      {/* ── Belief ── */}
      <section className="px-8 md:px-16 lg:px-24 py-16 md:py-28">
        <p
          className="font-bold leading-[1.05] tracking-[-0.03em] text-[#1c1f17] mb-6"
          style={{ fontSize: "clamp(30px, 4.5vw, 64px)" }}
        >
          We believe Agents deserve
          <br />
          products built for them.
        </p>
        <p className="text-xl md:text-2xl italic text-[#6b7d3a]">
          Not adapted. Not retrofitted. Built.
        </p>
      </section>

      <div className="px-8 md:px-16 lg:px-24">
        <hr className="border-t-2 border-[#eef2de]" />
      </div>

      {/* ── Capabilities — full-width dramatic stack ── */}
      <section className="px-8 md:px-16 lg:px-24 py-16 md:py-28">
        <div className="mb-10">
          {capabilities.map((cap, i) => (
            <p
              key={cap}
              className="font-bold leading-[1.05] tracking-[-0.03em]"
              style={{
                fontSize: "clamp(40px, 7vw, 100px)",
                color: i % 2 === 0 ? "#1c1f17" : "#6b7d3a",
              }}
            >
              {cap}.
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
        <hr className="border-t-2 border-[#eef2de]" />
      </div>

      {/* ── Philosophy ── */}
      <section className="px-8 md:px-16 lg:px-24 py-16 md:py-28">
        <div className="border-l-[3px] border-[#6b7d3a] pl-6 md:pl-8 max-w-[700px]">
          <p
            className="italic leading-[1.35] text-[#6b7d3a]"
            style={{ fontSize: "clamp(24px, 3.5vw, 44px)" }}
          >
            The best infrastructure is the kind you forget exists.
          </p>
        </div>
        <p className="text-xl md:text-2xl leading-[1.7] text-[#3a3e32] mt-10 md:mt-14 max-w-[640px]">
          We&apos;re building the utility layer for the age of Agents —
          so they stop managing tools and start doing work.
        </p>
      </section>

      <div className="px-8 md:px-16 lg:px-24">
        <hr className="border-t-2 border-[#eef2de]" />
      </div>

      {/* ── Close ── */}
      <section className="px-8 md:px-16 lg:px-24 py-20 md:py-36 text-center">
        <p
          className="font-bold leading-[1.0] tracking-[-0.03em] text-[#1c1f17] mb-14"
          style={{ fontSize: "clamp(36px, 6vw, 80px)" }}
        >
          And we&apos;re just
          <br />
          getting started.
        </p>
        <a
          href="#"
          className="inline-block px-10 py-4 text-[11px] font-bold tracking-[3px] uppercase text-[#f4f5f0] bg-[#6b7d3a] hover:bg-[#1c1f17] transition-colors"
          style={mono}
        >
          Get Started
        </a>
      </section>

      {/* ── Footer ── */}
      <footer className="px-8 md:px-16 lg:px-24 py-10 border-t-2 border-[#eef2de]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <AnycapMark size={16} />
            <span
              className="text-[10px] text-[#9a9e90] tracking-[2px] uppercase"
              style={mono}
            >
              Capability Runtime
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
