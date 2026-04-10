import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { EarlyAccessBanner } from "@/components/landing/EarlyAccessBanner";
import { FadeIn } from "@/components/ui/FadeIn";
import {
  ModelVisualShowcaseWithLabels,
  type ModelVisualShowcaseEntry,
} from "@/components/seo/ModelVisualShowcase";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

export interface ModelDetailPageContent {
  metadata: {
    title: string;
    description: string;
    openGraphTitle: string;
    openGraphDescription: string;
    articleHeadline: string;
    articleDescription: string;
    articleAbout: readonly string[];
    articleKeywords: readonly string[];
  };
  breadcrumbItems: readonly { name: string; href?: string }[];
  eyebrow: string;
  lastUpdatedLabel: string;
  hero: {
    titleLine1: string;
    titleLine2: string;
    intro: string;
  };
  showcaseLabels: {
    generatedExampleLabel: string;
    signalsLabel: string;
  };
  showcase: ModelVisualShowcaseEntry;
  useCasesTitle: string;
  useCases: readonly string[];
  callSectionTitle: string;
  callExamples: readonly { label: string; code: string }[];
  workflowTitle?: string;
  workflowParagraph?: string;
  workflowCards?: readonly { eyebrow: string; body: string }[];
  comparisonTitle?: string;
  comparisonHeaders?: {
    dimension: string;
    primary: string;
    alternative: string;
  };
  comparisonRows?: readonly { dimension: string; primary: string; alternative: string }[];
  faqTitle: string;
  faqItems: readonly { question: string; answer: string }[];
  nextActions: readonly { label: string; href: string; primary?: boolean }[];
};

export function Veo31PageView({ content }: { content: ModelDetailPageContent }) {
  return (
    <article className="px-6 md:px-12 lg:px-20">
      <div className="mx-auto max-w-[1280px] py-12 md:py-20 lg:py-24">
        <FadeIn>
          <p className="mb-4 text-[11px] tracking-[0.8px] text-[#6b7d3a]" style={mono}>
            {content.eyebrow}
          </p>
          <p className="mb-3 text-[11px] tracking-[0.5px] text-[#5a5e52]" style={mono}>
            {content.lastUpdatedLabel}
          </p>
          <h1
            className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
            style={{ ...pixel, fontSize: "clamp(32px, 6vw, 72px)" }}
          >
            {content.hero.titleLine1}
            <br />
            {content.hero.titleLine2}
          </h1>
          <p className="mt-6 max-w-[740px] text-base leading-7 text-[#4d5145] md:text-lg">
            {content.hero.intro}
          </p>
        </FadeIn>

        <FadeIn className="mt-8">
          <EarlyAccessBanner />
        </FadeIn>

        <FadeIn className="mt-10">
          <ModelVisualShowcaseWithLabels
            entry={content.showcase}
            generatedExampleLabel={content.showcaseLabels.generatedExampleLabel}
            signalsLabel={content.showcaseLabels.signalsLabel}
          />
        </FadeIn>

        <div className="mt-16 md:mt-24">
          <hr className="border-t border-[#d4dbb8]" />
        </div>

        <FadeIn>
          <section className="mt-16 md:mt-24">
            <h2 className="mb-6 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
              {content.useCasesTitle}
            </h2>
            <ul className="max-w-[760px] space-y-3">
              {content.useCases.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-sm leading-6 text-[#4d5145]"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#6b7d3a]" />
                  {item}
                </li>
              ))}
            </ul>
          </section>
        </FadeIn>

        <div className="mt-16 md:mt-24">
          <hr className="border-t border-[#d4dbb8]" />
        </div>

        <FadeIn>
          <section className="mt-16 md:mt-24">
            <h2 className="mb-6 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
              {content.callSectionTitle}
            </h2>
            <div className="max-w-[820px] space-y-6">
              {content.callExamples.map((example) => (
                <div key={example.label}>
                  <p className="mb-3 text-[11px] tracking-[0.5px] text-[#5a5e52]" style={mono}>
                    {example.label}
                  </p>
                  <div className="bg-[#1c1f17] px-5 py-4">
                    <p className="break-all text-[13px] text-[#d4e0a4]" style={mono}>
                      {example.code}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </FadeIn>

        <div className="mt-16 md:mt-24">
          <hr className="border-t border-[#d4dbb8]" />
        </div>

        {content.workflowCards?.length ? (
          <>
            <div className="mt-16 md:mt-24">
              <hr className="border-t border-[#d4dbb8]" />
            </div>

            <FadeIn>
              <section className="mt-16 md:mt-24">
                <h2 className="mb-6 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                  {content.workflowTitle ?? "Workflow"}
                </h2>
                {content.workflowParagraph ? (
                  <p className="mb-6 max-w-[760px] text-base leading-7 text-[#4d5145]">
                    {content.workflowParagraph}
                  </p>
                ) : null}
                <div className="grid max-w-[960px] gap-6 sm:grid-cols-2">
                  {content.workflowCards.map((card) => (
                    <div key={card.eyebrow} className="border border-[#d4dbb8] p-5">
                      <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                        {card.eyebrow}
                      </p>
                      <p className="text-sm leading-6 text-[#4d5145]">{card.body}</p>
                    </div>
                  ))}
                </div>
              </section>
            </FadeIn>
          </>
        ) : null}

        {content.comparisonRows?.length ? (
          <>
            <div className="mt-16 md:mt-24">
              <hr className="border-t border-[#d4dbb8]" />
            </div>

            <FadeIn>
              <section className="mt-16 md:mt-24">
                <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                  {content.comparisonTitle ?? "Comparison"}
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-[#d4dbb8]">
                        <th
                          className="pb-3 pr-6 text-[11px] tracking-[0.5px] text-[#5a5e52]"
                          style={mono}
                        >
                          {content.comparisonHeaders?.dimension ?? "Dimension"}
                        </th>
                        <th
                          className="pb-3 pr-6 text-[11px] tracking-[0.5px] text-[#6b7d3a]"
                          style={mono}
                        >
                          {content.comparisonHeaders?.primary ?? "Primary"}
                        </th>
                        <th
                          className="pb-3 text-[11px] tracking-[0.5px] text-[#5a5e52]"
                          style={mono}
                        >
                          {content.comparisonHeaders?.alternative ?? "Alternative"}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {content.comparisonRows.map((row) => (
                        <tr key={row.dimension} className="border-b border-[#d4dbb8]/50">
                          <td className="align-top py-4 pr-6 text-sm font-medium text-[#1c1f17]">
                            {row.dimension}
                          </td>
                          <td className="align-top py-4 pr-6 text-sm leading-6 text-[#4d5145]">
                            {row.primary}
                          </td>
                          <td className="align-top py-4 text-sm leading-6 text-[#4d5145]">
                            {row.alternative}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </FadeIn>
          </>
        ) : null}

        <div className="mt-16 md:mt-24">
          <hr className="border-t border-[#d4dbb8]" />
        </div>

        <FadeIn>
          <section className="mt-16 md:mt-24">
            <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
              {content.faqTitle}
            </h2>
            <div className="max-w-[860px] space-y-6">
              {content.faqItems.map((item) => (
                <div key={item.question} className="border border-[#d4dbb8] p-5">
                  <h3 className="mb-2 text-[14px] font-bold text-[#1c1f17]" style={mono}>
                    {item.question}
                  </h3>
                  <p className="text-sm leading-6 text-[#4d5145]">{item.answer}</p>
                </div>
              ))}
            </div>
          </section>
        </FadeIn>

        <div className="mt-16 md:mt-24">
          <hr className="border-t border-[#d4dbb8]" />
        </div>

        <FadeIn>
          <section className="mt-16 md:mt-24 mb-8">
            <div className="flex flex-wrap gap-4">
              {content.nextActions.map((action) => {
                const isPrimary = "primary" in action && action.primary;

                return (
                  <Link
                    key={action.label}
                    href={action.href}
                    className={`inline-block rounded-lg px-8 py-3 text-[11px] font-bold tracking-[0.8px] transition-colors ${
                      isPrimary
                        ? "bg-[#6b7d3a] text-[#f4f5f0] hover:bg-[#1c1f17]"
                        : "border border-[#1c1f17] text-[#1c1f17] hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                    }`}
                    style={mono}
                  >
                    {action.label}
                  </Link>
                );
              })}
            </div>
          </section>
        </FadeIn>
      </div>
    </article>
  );
}
