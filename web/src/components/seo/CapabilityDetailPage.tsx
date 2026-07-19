import type { ReactNode } from "react";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { EarlyAccessBanner } from "@/components/landing/EarlyAccessBanner";
import { FadeIn } from "@/components/ui/FadeIn";
import { hasJsonLdContent } from "@/lib/schema";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

export type CapabilityAction = {
  label: string;
  href: string;
  external?: boolean;
  primary?: boolean;
};

export type CapabilityCard = {
  eyebrow: string;
  title: string;
  href?: string;
  body: string;
};

export type CapabilityFaqItem = {
  question: string;
  answer: string;
};

export type CapabilityUseCase = {
  title: string;
  description: string;
};

export type CapabilityWorkflowStep = {
  title: string;
  body: string;
};

export type CapabilityDetailChrome = {
  searchIntentLabel: string;
  positioningLines: readonly [string, string];
  positioningSummary: string;
};

const defaultCapabilityDetailChrome: CapabilityDetailChrome = {
  searchIntentLabel: "Search intent",
  positioningLines: [
    "Agents do not need another disconnected tool.",
    "They need the capability inside the workflow.",
  ],
  positioningSummary: "AnyCap turns capability access into agent action.",
};

export type CapabilityDetailPageProps = {
  breadcrumbItems: readonly { name: string; href?: string }[];
  jsonLd: Record<string, unknown>;
  faqJsonLd?: Record<string, unknown>;
  eyebrow: string;
  lastUpdatedLabel?: string;
  title: string;
  accentTitle?: string;
  intro: string;
  chrome?: CapabilityDetailChrome;
  searchIntents: readonly string[];
  actions: readonly CapabilityAction[];
  demo?: ReactNode;
  demoTitle: string;
  demoBody: string;
  proofPoints: readonly string[];
  summaryLabel: string;
  summaryText: string;
  workflowTitle: string;
  workflowSteps: readonly CapabilityWorkflowStep[];
  usageTitle: string;
  usageExamples: readonly { title: string; code: string }[];
  useCasesTitle: string;
  useCases: readonly CapabilityUseCase[];
  relatedTitle: string;
  relatedCards: readonly CapabilityCard[];
  faqTitle: string;
  faqItems: readonly CapabilityFaqItem[];
  finalTitle: string;
  finalBody: string;
};

function ActionLink({ action }: { action: CapabilityAction }) {
  const className = `inline-flex min-h-12 items-center justify-center rounded-lg px-6 py-3 text-[13px] font-bold tracking-[0.8px] transition-all duration-200 active:scale-[0.97] ${
    action.primary
      ? "bg-[#6b7d3a] text-[#f4f5f0] shadow-[0_12px_28px_rgba(107,125,58,0.18)] hover:bg-[#1c1f17]"
      : "border border-[#1c1f17] text-[#1c1f17] hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
  }`;

  if (action.external) {
    return (
      <a href={action.href} target="_blank" rel="noopener noreferrer" className={className} style={mono}>
        {action.label}
      </a>
    );
  }

  return (
    <Link href={action.href} className={className} style={mono}>
      {action.label}
    </Link>
  );
}

function RelatedCard({ card }: { card: CapabilityCard }) {
  const inner = (
    <>
      <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
        {card.eyebrow}
      </p>
      <h3 className="mb-3 text-[16px] text-[#1c1f17] transition-colors group-hover:text-[#6b7d3a]" style={pixel}>
        {card.title}
      </h3>
      <p className="text-sm leading-6 text-[#4d5145]">{card.body}</p>
    </>
  );

  const className =
    "group block border border-[#d4dbb8] bg-[#fffffc]/70 p-5 transition-colors hover:border-[#6b7d3a] hover:bg-[#f9faf5]";

  if (!card.href) {
    return <div className={className}>{inner}</div>;
  }

  return (
    <Link href={card.href} className={className}>
      {inner}
    </Link>
  );
}

export function CapabilityDetailPage({
  breadcrumbItems,
  jsonLd,
  faqJsonLd,
  eyebrow,
  lastUpdatedLabel,
  title,
  accentTitle,
  intro,
  chrome = defaultCapabilityDetailChrome,
  searchIntents,
  actions,
  demo,
  demoTitle,
  demoBody,
  proofPoints,
  summaryLabel,
  summaryText,
  workflowTitle,
  workflowSteps,
  usageTitle,
  usageExamples,
  useCasesTitle,
  useCases,
  relatedTitle,
  relatedCards,
  faqTitle,
  faqItems,
  finalTitle,
  finalBody,
}: CapabilityDetailPageProps) {
  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {hasJsonLdContent(faqJsonLd) ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      ) : null}

      <article className="overflow-x-hidden">
        <section className="flex flex-col px-5 pt-20 sm:px-8 sm:pt-24 md:px-16 lg:px-24 xl:min-h-dvh xl:pb-8">
          <div className="flex flex-col gap-10 md:gap-12 xl:min-h-0 xl:flex-1 xl:flex-row xl:items-center xl:gap-12">
            <div className="min-w-0 flex-1 xl:max-w-[46rem]">
              <FadeIn>
                <p className="mb-4 text-[11px] tracking-[0.8px] text-[#6b7d3a]" style={mono}>
                  {eyebrow}
                  {lastUpdatedLabel ? ` · ${lastUpdatedLabel}` : ""}
                </p>
                <h1
                  className="leading-[1.08] tracking-[-0.03em] text-[#1c1f17]"
                  style={{ ...pixel, fontSize: "clamp(36px, 5.5vw, 76px)" }}
                >
                  {title}
                  {accentTitle ? (
                    <>
                      <br />
                      <span className="text-[#6b7d3a]">{accentTitle}</span>
                    </>
                  ) : null}
                </h1>
                <p className="mt-5 max-w-[700px] text-[15px] leading-6 text-[#4d5145] sm:text-base sm:leading-7 md:text-lg">
                  {intro}
                </p>

                <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                  {actions.map((action) => (
                    <ActionLink key={`${action.label}-${action.href}`} action={action} />
                  ))}
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <span className="text-[11px] tracking-[0.6px] text-[#6b7d3a]" style={mono}>
                    {chrome.searchIntentLabel}
                  </span>
                  {searchIntents.map((item) => (
                    <span
                      key={item}
                      className="inline-flex rounded-full border border-[#d4dbb8] bg-[#fbfcf8] px-3 py-1.5 text-[11px] tracking-[0.5px] text-[#3f4437]"
                      style={mono}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </FadeIn>
            </div>

            <FadeIn
              delay={160}
              className="relative w-full shrink-0 xl:flex xl:min-h-0 xl:w-[50%] xl:flex-col xl:self-stretch xl:justify-center"
            >
              <div className="absolute right-8 top-[-24px] z-10 hidden max-w-[300px] rounded-[28px] border border-[#e6e6e6] bg-white px-5 py-4 text-[#1c1f17] shadow-[0_14px_30px_rgba(0,0,0,0.08)] xl:block">
                <p className="text-[15px] font-semibold leading-[1.35] text-[#182012]">
                  {demoTitle}
                  <span className="text-[#5f7a29]">.</span>
                </p>
                <p className="mt-1.5 text-[12px] leading-[1.55] text-[#495240]">{demoBody}</p>
              </div>
              <div className="flex h-[24rem] w-full flex-col justify-center overflow-hidden rounded-lg bg-[#1c1f17] p-4 shadow-[0_20px_60px_rgba(28,31,23,0.18)] sm:h-[28rem] md:h-[32rem] md:p-6 lg:h-[36rem] xl:h-[calc((100dvh-8rem)*0.78)]">
                {demo}
              </div>
            </FadeIn>
          </div>
        </section>

        <FadeIn from="right" className="mt-16 flex justify-start px-8 md:mt-28 md:justify-end md:px-16 lg:px-24">
          <div className="max-w-[620px] border-l-[3px] border-[#1c1f17] pl-5 text-left md:border-l-0 md:border-r-[3px] md:pl-0 md:pr-8 md:text-right">
            <p className="text-lg leading-[1.65] text-[#3a3e32] md:text-[22px]">
              {chrome.positioningLines[0]}
              <br />
              {chrome.positioningLines[1]}
            </p>
            <p className="mt-5 text-xl text-[#1c1f17] md:text-[24px]" style={pixel}>
              {chrome.positioningSummary}
            </p>
          </div>
        </FadeIn>

        <section className="px-8 py-20 md:px-16 md:py-32 lg:px-24">
          <FadeIn>
            <h2
              className="mb-6 leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(28px, 4.5vw, 60px)" }}
            >
              {summaryLabel}
            </h2>
            <p className="max-w-[860px] text-xl leading-[1.5] text-[#6b7d3a] md:text-2xl" style={mono}>
              {summaryText}
            </p>
          </FadeIn>

          <FadeIn delay={160} className="mt-12 grid max-w-[1120px] gap-4 md:grid-cols-3">
            {proofPoints.map((point, index) => (
              <div key={point} className="border-l-[3px] border-[#6b7d3a] pl-5">
                <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                  0{index + 1}
                </p>
                <p className="text-sm leading-6 text-[#4d5145]">{point}</p>
              </div>
            ))}
          </FadeIn>
        </section>

        <div className="px-5 md:px-16 lg:px-24">
          <hr className="border-t border-[#d4dbb8]" />
        </div>

        <section className="px-8 py-20 md:px-16 md:py-32 lg:px-24">
          <FadeIn>
            <h2 className="mb-8 leading-[1.1] text-[#1c1f17]" style={{ ...pixel, fontSize: "clamp(28px, 4.5vw, 60px)" }}>
              {workflowTitle}
            </h2>
            <div className="grid max-w-[1120px] gap-4 md:grid-cols-3">
              {workflowSteps.map((step, index) => (
                <div key={step.title} className="border border-[#d4dbb8] bg-[#fffffc]/70 p-5">
                  <p className="mb-4 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                    0{index + 1} / {step.title}
                  </p>
                  <p className="text-sm leading-6 text-[#4d5145]">{step.body}</p>
                </div>
              ))}
            </div>
          </FadeIn>
        </section>

        <div className="px-5 md:px-16 lg:px-24">
          <hr className="border-t border-[#d4dbb8]" />
        </div>

        <section className="grid gap-12 px-8 py-20 md:px-16 md:py-32 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] lg:px-24">
          <FadeIn className="min-w-0">
            <h2 className="mb-6 leading-[1.1] text-[#1c1f17]" style={{ ...pixel, fontSize: "clamp(28px, 4.5vw, 60px)" }}>
              {usageTitle}
            </h2>
            <div className="max-w-[860px] space-y-6">
              {usageExamples.map((example) => (
                <div key={example.title}>
                  <p className="mb-3 text-[11px] tracking-[0.5px] text-[#5a5e52]" style={mono}>
                    {example.title}
                  </p>
                  <pre className="overflow-x-auto bg-[#1c1f17] px-5 py-4 text-[13px] leading-6 text-[#d4e0a4]">
                    <code style={mono}>{example.code}</code>
                  </pre>
                </div>
              ))}
            </div>
          </FadeIn>

          <FadeIn delay={160}>
            <h2 className="mb-6 leading-[1.1] text-[#1c1f17]" style={{ ...pixel, fontSize: "clamp(28px, 4.5vw, 60px)" }}>
              {useCasesTitle}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {useCases.map((useCase) => (
                <div key={useCase.title} className="border-l-[3px] border-[#6b7d3a] pl-5">
                  <p className="mb-1 text-sm font-medium text-[#1c1f17]">{useCase.title}</p>
                  <p className="text-sm leading-6 text-[#4d5145]">{useCase.description}</p>
                </div>
              ))}
            </div>
          </FadeIn>
        </section>

        <div className="px-5 md:px-16 lg:px-24">
          <hr className="border-t border-[#d4dbb8]" />
        </div>

        <section className="px-8 py-20 md:px-16 md:py-32 lg:px-24">
          <FadeIn>
            <h2 className="mb-8 leading-[1.1] text-[#1c1f17]" style={{ ...pixel, fontSize: "clamp(28px, 4.5vw, 60px)" }}>
              {relatedTitle}
            </h2>
            <div className="grid max-w-[1120px] gap-4 md:grid-cols-3">
              {relatedCards.map((card) => (
                <RelatedCard key={`${card.title}-${card.href ?? card.eyebrow}`} card={card} />
              ))}
            </div>
          </FadeIn>
        </section>

        <div className="px-5 md:px-16 lg:px-24">
          <hr className="border-t border-[#d4dbb8]" />
        </div>

        <section className="px-8 py-20 md:px-16 md:py-32 lg:px-24">
          <FadeIn>
            <h2 className="mb-8 leading-[1.1] text-[#1c1f17]" style={{ ...pixel, fontSize: "clamp(28px, 4.5vw, 60px)" }}>
              {faqTitle}
            </h2>
            <div className="grid max-w-[1120px] gap-4 md:grid-cols-2">
              {faqItems.map((item) => (
                <div key={item.question} className="border border-[#d4dbb8] bg-[#fffffc]/70 p-5">
                  <h3 className="mb-2 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                    {item.question}
                  </h3>
                  <p className="text-sm leading-6 text-[#4d5145]">{item.answer}</p>
                </div>
              ))}
            </div>
          </FadeIn>
        </section>

        <section className="px-8 py-24 text-center md:px-16 md:py-40 lg:px-24">
          <FadeIn>
            <h2
              className="mb-8 leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(32px, 6vw, 72px)" }}
            >
              {finalTitle}
            </h2>
            <p className="mx-auto mb-10 max-w-[640px] text-base leading-7 text-[#4d5145] md:text-lg">
              {finalBody}
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              {actions.map((action) => (
                <ActionLink key={`final-${action.label}-${action.href}`} action={action} />
              ))}
            </div>
          </FadeIn>
        </section>

        <div className="px-8 pb-16 md:px-16 lg:px-24">
          <EarlyAccessBanner />
        </div>
      </article>
    </>
  );
}
