import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { Footer } from "@/components/layout/Footer";
import { Header, humanNavLinks } from "@/components/layout/Header";
import { AuthNav } from "@/components/layout/AuthNav";
import { LazyEquipAgent } from "@/components/landing/LazyEquipAgent";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { ScrambleText } from "@/components/ui/ScrambleText";
import { CapabilityMarquee } from "@/components/landing/CapabilityMarquee";
import { TerminalHero } from "@/components/landing/TerminalHero";
import { TerminalWorkflowSection } from "@/components/landing/TerminalWorkflowSection";
import { FuturisticRobotSection } from "@/components/landing/futuristic-robot/FuturisticRobotSection";
import { siteConfig } from "@/lib/site";

const websiteId = `${siteConfig.url}#website`;
const homePageId = `${siteConfig.url}#home`;

const homeWebPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": homePageId,
  name: "AnyCap | AI Agent Capabilities Through One CLI",
  url: siteConfig.url,
  description:
    "AnyCap gives agent users one install path, one login, and one CLI for media generation, media understanding, web retrieval, storage, and publishing workflows.",
  isPartOf: {
    "@id": websiteId,
  },
  about: [
    { "@type": "Thing", name: "AI agents" },
    { "@type": "Thing", name: "Agent users" },
    { "@type": "Thing", name: "Creators" },
    { "@type": "Thing", name: "Power users" },
    { "@type": "Thing", name: "Agent capabilities" },
    { "@type": "Thing", name: "Capability runtimes" },
  ],
  primaryImageOfPage: {
    "@type": "ImageObject",
    url: `${siteConfig.url}/opengraph-image.png`,
  },
};

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

const capabilities = ["Image", "Video", "Music", "Voice", "Vision", "Pages"];

export type HomeHeroVariant = "robot" | "terminal";

export function HumanHomePage({
  heroVariant = "robot",
}: {
  heroVariant?: HomeHeroVariant;
}) {
  return (
    <main className="overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeWebPageJsonLd) }}
      />

      <Header
        logoHref="/"
        links={humanNavLinks}
        authSlot={<AuthNav />}
      />

      {heroVariant === "robot" ? (
        <FuturisticRobotSection placement="hero" />
      ) : (
        <TerminalHero />
      )}

      <ScrollReveal from="right" className="mt-16 flex justify-start px-8 md:mt-28 md:justify-end md:px-16 lg:px-24">
        <div className="max-w-[520px] border-l-[3px] border-[#1c1f17] pl-5 text-left md:border-l-0 md:border-r-[3px] md:pl-0 md:pr-8 md:text-right">
          <p className="text-lg leading-[1.65] text-[#3a3e32] md:text-[22px]">
            It reasons. It plans. It writes code.
            <br />
            Then you ask it to generate an image, and it stops.
          </p>
          <p className="mt-5 text-xl text-[#1c1f17] md:text-[24px]" style={pixel}>
            <ScrambleText text="AnyCap picks up where it left off." speed={20} ticks={2} />
          </p>
        </div>
      </ScrollReveal>

      <ScrollReveal className="mt-24 px-8 md:mt-36 md:px-16 lg:px-24">
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
      </ScrollReveal>

      <ScrollReveal delay={80}>
        <CapabilityMarquee />
      </ScrollReveal>

      {heroVariant === "terminal" ? (
        <>
          <div className="mt-16 px-8 md:mt-20 md:px-16 lg:px-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>
          <FuturisticRobotSection />
          <div className="px-8 md:px-16 lg:px-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>
        </>
      ) : (
        <div className="mt-16 px-8 md:mt-20 md:px-16 lg:px-24">
          <hr className="border-t border-[#d4dbb8]" />
        </div>
      )}

      {heroVariant === "terminal" ? (
        <>
          <section className="px-8 py-20 md:px-16 md:py-32 lg:px-24">
            <ScrollReveal>
              <p
                className="mb-6 leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
                style={{ ...pixel, fontSize: "clamp(28px, 4.5vw, 60px)" }}
              >
                Any capability
                <br />
                your agent was missing.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={120}>
              <p className="text-xl text-[#6b7d3a] md:text-2xl" style={mono}>
                Image. Video. Music. Voice. Vision. Pages.
              </p>
            </ScrollReveal>
          </section>
          <div className="px-5 md:px-16 lg:px-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>
        </>
      ) : null}

      {heroVariant === "robot" ? (
        <>
          <TerminalWorkflowSection />
          <div className="px-5 md:px-16 lg:px-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>
        </>
      ) : null}

      <section className="px-8 py-20 md:px-16 md:py-32 lg:px-24">
        <ScrollReveal>
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
        </ScrollReveal>
      </section>

      <div className="px-5 md:px-16 lg:px-24">
        <hr className="border-t border-[#d4dbb8]" />
      </div>

      <section className="px-8 py-20 md:px-16 md:py-32 lg:px-24">
        <ScrollReveal from="left">
          <div className="max-w-[700px] border-l-[3px] border-[#6b7d3a] pl-6 md:pl-8">
            <p
              className="leading-[1.3] text-[#6b7d3a]"
              style={{ ...pixel, fontSize: "clamp(22px, 3.5vw, 40px)" }}
            >
              We believe agents shouldn&apos;t stop at &ldquo;I can&apos;t do that.&rdquo;
            </p>
          </div>
        </ScrollReveal>
        <ScrollReveal delay={120}>
          <p className="mt-12 max-w-[640px] text-lg leading-[1.7] text-[#3a3e32] sm:text-xl md:mt-16 md:text-2xl">
            Today&apos;s agents learned to think. But thinking is only part of getting
            things done. They can&apos;t generate images, produce videos, store files, or
            publish pages. These real-world capabilities are the last mile between what
            your agent plans and what it actually delivers. We&apos;re building that last mile.
          </p>
        </ScrollReveal>
      </section>

      <div className="px-5 md:px-16 lg:px-24">
        <hr className="border-t border-[#d4dbb8]" />
      </div>

      <section className="px-8 py-24 text-center md:px-16 md:py-40 lg:px-24">
        <ScrollReveal>
          <p
            className="mb-14 leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
            style={{ ...pixel, fontSize: "clamp(32px, 6vw, 72px)" }}
          >
            Let your agent finish
            <br />
            what it started.
          </p>
        </ScrollReveal>
        <ScrollReveal delay={160}>
          <LazyEquipAgent label="Get Started" style={mono} />
        </ScrollReveal>
      </section>

      <Footer />
    </main>
  );
}
