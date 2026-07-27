import { AgentBubble } from "@/components/landing/AgentBubble";
import { LazyEquipAgent } from "@/components/landing/LazyEquipAgent";
import { ParticleAgent } from "@/components/landing/ParticleAgent";
import { TerminalDemo } from "@/components/landing/TerminalDemo";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { ScrambleText } from "@/components/ui/ScrambleText";

const pixel = {
  fontFamily: "var(--font-geist-pixel-square), monospace",
} as const;
const mono = {
  fontFamily: "var(--font-mono), monospace",
  fontWeight: 500,
} as const;

const popularPaths = [
  { href: "/start", label: "Start here" },
  { href: "/skills", label: "Skills" },
  { href: "/capabilities", label: "Capabilities" },
  { href: "/guides/mcp-vs-skills", label: "MCP vs Skills" },
  { href: "/pricing", label: "Pricing" },
  { href: "/for/codex", label: "For Codex" },
] as const;

export function TerminalHero() {
  return (
    <section className="flex flex-col px-5 pt-20 sm:px-8 sm:pt-24 md:px-16 lg:px-24 xl:min-h-[calc(100dvh-5rem)] xl:pb-8">
      <div className="flex flex-col gap-10 md:gap-12 xl:min-h-0 xl:flex-1 xl:flex-row xl:items-center xl:gap-12">
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
                text="agent"
                className="text-[#6b7d3a]"
                style={{ fontSize: "1.08em" }}
                speed={30}
                ticks={3}
              />
              <br />
              <ScrambleText text="can" speed={30} ticks={3} />{" "}
              <ScrambleText text="do" speed={30} ticks={3} />{" "}
              <ScrambleText text="more." speed={30} ticks={3} />
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
            Your agent can reason and code, but it can&apos;t create images,
            produce videos, search the web, inspect media, or publish pages on
            its own. AnyCap gives your agent the missing capability layer with
            one install, one auth flow, and one CLI.
          </p>
          <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="flex w-full justify-start sm:w-auto">
              <LazyEquipAgent
                style={mono}
                containerClassName="w-full sm:w-auto"
                buttonClassName="w-full justify-center sm:w-auto"
              />
            </div>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span
              className="text-[11px] tracking-[0.6px] text-[#6b7d3a]"
              style={mono}
            >
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
          <div className="flex h-[22rem] w-full flex-col overflow-hidden rounded-lg bg-[#1c1f17] px-4 pb-4 pt-0 transition-all duration-300 sm:h-[26rem] sm:px-5 sm:pb-5 md:h-[30rem] md:px-6 md:pb-6 lg:h-[34rem] lg:px-8 lg:pb-8 xl:h-[calc((100dvh-8rem)*0.78)] xl:hover:scale-[1.02] xl:hover:shadow-[0_20px_60px_rgba(28,31,23,0.25)]">
            <TerminalDemo headerRight={<ParticleAgent scale={0.35} />} />
          </div>
        </div>
      </div>
    </section>
  );
}
