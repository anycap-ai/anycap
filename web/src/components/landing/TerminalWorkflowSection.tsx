import { AgentBubble } from "@/components/landing/AgentBubble";
import { ParticleAgent } from "@/components/landing/ParticleAgent";
import { TerminalDemo } from "@/components/landing/TerminalDemo";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const pixel = {
  fontFamily: "var(--font-geist-pixel-square), monospace",
} as const;
const mono = {
  fontFamily: "var(--font-mono), monospace",
  fontWeight: 500,
} as const;

export function TerminalWorkflowSection() {
  return (
    <section
      id="agent-with-anycap"
      className="px-8 py-20 md:px-16 md:py-32 lg:px-24"
    >
      <div className="mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-[minmax(15rem,0.52fr)_minmax(0,1.48fr)] lg:items-center lg:gap-16">
        <ScrollReveal from="left">
          <h2
            className="leading-[1.05] tracking-[-0.025em] text-[#1c1f17]"
            style={{ ...pixel, fontSize: "clamp(32px, 4.2vw, 58px)" }}
          >
            Any capability
            <br />
            your agent was missing.
          </h2>
          <p className="mt-6 text-lg text-[#6b7d3a]" style={mono}>
            Image. Video. Music.
            <br />
            Voice. Vision. Pages.
          </p>
          <div className="mt-10 max-w-[27rem] border-t border-[#d4dbb8] pt-8">
            <p
              className="text-[24px] leading-tight text-[#1c1f17]"
              style={pixel}
            >
              Agent with AnyCap.
            </p>
            <p className="mt-4 text-base leading-7 text-[#4d5145]">
              The capability core becomes a real workflow through one install,
              one login, and one CLI.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal from="right" delay={120}>
          <div className="relative pt-28">
            <AgentBubble placement="workflow" />
            <div className="flex h-[30rem] w-full flex-col overflow-hidden rounded-lg bg-[#1c1f17] px-5 pb-5 pt-0 shadow-[0_18px_50px_rgba(28,31,23,0.14)] md:h-[36rem] md:px-7 md:pb-7">
              <TerminalDemo headerRight={<ParticleAgent scale={0.32} />} />
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
