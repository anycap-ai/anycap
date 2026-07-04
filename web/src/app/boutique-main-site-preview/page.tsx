import type { Metadata } from "next";
import Link from "next/link";
import { AgentBubble } from "@/components/landing/AgentBubble";
import { LazyEquipAgent } from "@/components/landing/LazyEquipAgent";
import { ParticleAgent } from "@/components/landing/ParticleAgent";
import { TerminalDemo } from "@/components/landing/TerminalDemo";
import { AuthNav } from "@/components/layout/AuthNav";
import { Footer } from "@/components/layout/Footer";
import { Header, humanNavLinks } from "@/components/layout/Header";
import { FadeIn } from "@/components/ui/FadeIn";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "AnyCap Boutique Main Site Preview",
  robots: {
    index: false,
    follow: false,
  },
};

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

const popularPaths = [
  { href: "/platform", label: "Platform" },
  { href: "/capabilities", label: "Capabilities" },
  { href: "/for/codex", label: "For Codex" },
  { href: "/compare", label: "Compare" },
  { href: "/pricing", label: "Pricing" },
] as const;

const mainSitePages = [
  ["Platform.", "Position AnyCap as the capability layer agents use after reasoning and coding."],
  ["Capabilities.", "Turn each core capability into proof: terminal flow, CLI snippets, use cases, and schema-ready answers."],
  ["Equip Agents.", "Keep persona pages for Codex, Claude Code, Cursor, and other agent surfaces on the main site."],
  ["Compare.", "Use decision tables and fair competitor framing for high-intent commercial searches."],
  ["Pricing.", "Make the next step obvious from every boutique page."],
] as const;

const routePlan = [
  {
    path: "/platform",
    note: "The product spine: what AnyCap is, why agents need a capability runtime, and where to start.",
  },
  {
    path: "/capabilities/image-generation",
    note: "A proof page: agent prompt, AnyCap command, generated output, limits, FAQ, and links to related CMS examples.",
  },
  {
    path: "/for/codex",
    note: "A persona page: how Codex uses AnyCap to generate media, inspect files, search the web, and publish outputs.",
  },
  {
    path: "/compare/anycap-vs-replicate",
    note: "A commercial page: facts, fit, tradeoffs, and a clear path to try AnyCap.",
  },
] as const;

export default function BoutiqueMainSitePreviewPage() {
  return (
    <main className="overflow-x-hidden">
      <Header
        logoHref="/"
        links={humanNavLinks}
        authSlot={<AuthNav />}
      />

      <section className="flex flex-col px-5 pt-20 sm:px-8 sm:pt-24 md:px-16 lg:px-24 xl:h-dvh xl:pb-8">
        <div className="flex flex-col gap-10 md:gap-12 xl:min-h-0 xl:flex-1 xl:flex-row xl:items-center xl:gap-12">
          <div className="min-w-0 flex-1 xl:max-w-[46rem]">
            <h1
              className="leading-[1.08] tracking-[-0.03em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(36px, 5.5vw, 76px)" }}
            >
              Your main site
              <br />
              can do more.
              <br />
              It just needs
              <br />
              <span className="text-[#6b7d3a]" style={{ fontSize: "1.08em" }}>
                boutique pages.
              </span>
            </h1>

            <p className="mt-5 max-w-[700px] text-[15px] leading-6 text-[#4d5145] sm:text-base sm:leading-7 md:text-lg">
              Keep the current AnyCap homepage as the visual source of truth. The main site
              should become a small set of polished product-proof pages, while the CMS handles
              long-tail how-to content, release updates, and experiments that link back into the
              core spine.
            </p>

            <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <div className="flex w-full justify-start sm:w-auto">
                <LazyEquipAgent
                  label="Preview the Spine"
                  style={mono}
                  containerClassName="w-full sm:w-auto"
                  buttonClassName="w-full justify-center sm:w-auto"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="text-[11px] tracking-[0.6px] text-[#6b7d3a]" style={mono}>
                Boutique paths
              </span>
              {popularPaths.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={false}
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
            The CMS can publish broadly.
            <br />
            The main site should persuade deeply.
          </p>
          <p className="mt-5 text-xl text-[#1c1f17] md:text-[24px]" style={pixel}>
            Same AnyCap visual language. Sharper page jobs.
          </p>
        </div>
      </FadeIn>

      <FadeIn className="mt-24 px-8 md:mt-36 md:px-16 lg:px-24">
        <p
          className="mb-4 text-[#c8d4a0] line-through"
          style={{ ...pixel, fontSize: "clamp(14px, 2.2vw, 24px)", letterSpacing: "1px" }}
        >
          EVERY&nbsp;KEYWORD&nbsp;&nbsp;&nbsp;EVERY&nbsp;PAGE&nbsp;&nbsp;&nbsp;EVERYTHING&nbsp;ON&nbsp;THE&nbsp;MAIN&nbsp;SITE
        </p>
        <p
          className="text-[#1c1f17]"
          style={{ ...pixel, fontSize: "clamp(14px, 2.2vw, 24px)", letterSpacing: "1px" }}
        >
          MAIN SITE FOR PRODUCT PROOF. CMS FOR CONTENT COVERAGE.
        </p>
      </FadeIn>

      <div className="mt-24 px-5 md:mt-36 md:px-16 lg:px-24">
        <hr className="border-t border-[#d4dbb8]" />
      </div>

      <section className="px-8 py-20 md:px-16 md:py-32 lg:px-24">
        <FadeIn>
          <p
            className="mb-6 leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
            style={{ ...pixel, fontSize: "clamp(28px, 4.5vw, 60px)" }}
          >
            Boutique pages
            <br />
            should earn the homepage.
          </p>
        </FadeIn>
        <FadeIn delay={200}>
          <p className="max-w-[760px] text-xl leading-[1.5] text-[#6b7d3a] md:text-2xl" style={mono}>
            Use the main site only for product spine pages that can carry positioning,
            proof, comparisons, and conversion. Let CMS posts cover long-tail queries and
            point authority back to these pages.
          </p>
        </FadeIn>
      </section>

      <div className="px-5 md:px-16 lg:px-24">
        <hr className="border-t border-[#d4dbb8]" />
      </div>

      <section className="px-8 py-20 md:px-16 md:py-32 lg:px-24">
        <div className="mb-10">
          {mainSitePages.map(([title, note], i) => (
            <div key={title} className="mb-8 last:mb-0">
              <p
                className="leading-[1.1] tracking-[-0.02em]"
                style={{
                  ...pixel,
                  fontSize: "clamp(36px, 7vw, 96px)",
                  color: i % 2 === 0 ? "#1c1f17" : "#6b7d3a",
                }}
              >
                {title}
              </p>
              <p className="mt-3 max-w-[620px] text-[15px] leading-7 text-[#4d5145] md:text-lg">
                {note}
              </p>
            </div>
          ))}
        </div>
        <div className="flex justify-end">
          <p
            className="text-right text-[11px] tracking-[0.8px] text-[#9a9e90]"
            style={mono}
          >
            Small count.
            <br />
            Strong pages.
            <br />
            Clear routes.
          </p>
        </div>
      </section>

      <div className="px-5 md:px-16 lg:px-24">
        <hr className="border-t border-[#d4dbb8]" />
      </div>

      <section className="px-8 py-20 md:px-16 md:py-32 lg:px-24">
        <FadeIn from="left">
          <div className="max-w-[760px] border-l-[3px] border-[#6b7d3a] pl-6 md:pl-8">
            <p
              className="leading-[1.3] text-[#6b7d3a]"
              style={{ ...pixel, fontSize: "clamp(22px, 3.5vw, 40px)" }}
            >
              We believe SEO pages should show the product working, not just explain
              that it works.
            </p>
          </div>
        </FadeIn>
        <FadeIn delay={200}>
          <div className="mt-12 max-w-[820px] space-y-7 text-lg leading-[1.7] text-[#3a3e32] sm:text-xl md:mt-16 md:text-2xl">
            {routePlan.map((item) => (
              <p key={item.path}>
                <span className="text-[#6b7d3a]" style={mono}>{item.path}</span>
                <br />
                {item.note}
              </p>
            ))}
          </div>
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
            Let CMS scale.
            <br />
            Let the main site convert.
          </p>
        </FadeIn>
        <FadeIn delay={300}>
          <LazyEquipAgent label="Use this visual system" style={mono} />
        </FadeIn>
      </section>

      <Footer />
    </main>
  );
}
