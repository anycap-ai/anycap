import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { FadeIn } from "@/components/ui/FadeIn";
import { EarlyAccessBanner } from "@/components/landing/EarlyAccessBanner";
import { VideoGenDemo } from "@/components/landing/VideoGenDemo";
import type { VideoGenerationPageData } from "@/app/(seo)/capabilities/video-generation/content";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

export function VideoGenerationPageView({ content }: { content: VideoGenerationPageData }) {
  const isPtBr = content.eyebrow.toLowerCase().includes("capacidade");
  const overviewTitle = isPtBr ? "Por que esta página de capability importa" : "Why this capability page matters";
  const overviewBody =
    isPtBr
      ? "Uma página dedicada de capability ajuda equipes a decidir quando geração de vídeo deve virar uma ação do agente em vez de permanecer apenas como intenção de produto. Isso é útil para ligar casos de uso, decisões de modelo, exemplos de chamada e próximos passos operacionais em um mesmo lugar."
      : "A dedicated capability page helps teams decide when video generation should become an agent action rather than remain only a product idea. It links use cases, model decisions, command examples, and operational next steps in one place so the workflow is easier to route and reuse.";
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(content.capabilityGuideJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(content.faqJsonLd) }}
      />

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
              {content.hero.title}
            </h1>
            <p className="mt-6 max-w-[760px] text-base leading-7 text-[#4d5145] md:text-lg">
              {content.hero.intro}
            </p>
            <div className="mt-8 max-w-[860px] border border-[#d4dbb8] bg-[#f9faf5]/80 p-6">
              <p className="mb-3 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                {content.hero.summaryLabel}
              </p>
              <p className="text-sm leading-6 text-[#4d5145]">{content.hero.summaryText}</p>
            </div>
          </FadeIn>

          <FadeIn className="mt-8">
            <EarlyAccessBanner />
          </FadeIn>

          <FadeIn className="mt-10">
            <VideoGenDemo lines={content.demo.lines} labels={content.demo.labels} />
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-6 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {overviewTitle}
              </h2>
              <div className="max-w-[860px] space-y-4">
                <p className="text-base leading-7 text-[#4d5145]">{content.hero.summaryText}</p>
                <p className="text-base leading-7 text-[#4d5145]">{overviewBody}</p>
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.decisionTitle}
              </h2>
              <div className="grid max-w-[1040px] gap-4 sm:grid-cols-3">
                {content.decisionCards.map((card) => (
                  <Link
                    key={card.title}
                    href={card.href}
                    aria-label={content.decisionCardAriaLabelTemplate.replace("{title}", card.title)}
                    className="group flex h-full flex-col rounded-xl border border-[#d4dbb8] p-5 transition-all hover:-translate-y-0.5 hover:border-[#6b7d3a] hover:shadow-[0_10px_24px_rgba(28,31,23,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6b7d3a] focus-visible:ring-offset-2"
                  >
                    <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                      {card.eyebrow}
                    </p>
                    <h3
                      className="mb-2 text-[15px] font-bold text-[#1c1f17] transition-colors group-hover:text-[#6b7d3a]"
                      style={mono}
                    >
                      {card.title}
                    </h3>
                    <p className="text-sm leading-6 text-[#4d5145]">{card.body}</p>
                    <span
                      className="mt-4 text-[11px] tracking-[0.5px] text-[#5a5e52] transition-colors group-hover:text-[#6b7d3a]"
                      style={mono}
                    >
                      {content.decisionCardCta}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.supportedModelsTitle}
              </h2>
              <div className="overflow-x-auto rounded-xl border border-[#d4dbb8]">
                <table className="w-full text-left">
                  <thead className="bg-[#f9faf5]">
                    <tr className="border-b border-[#d4dbb8]">
                      <th
                        className="px-5 py-3 pr-6 text-[11px] tracking-[0.5px] text-[#5a5e52]"
                        style={mono}
                      >
                        {content.tableHeaders.model}
                      </th>
                      <th
                        className="px-5 py-3 pr-6 text-[11px] tracking-[0.5px] text-[#5a5e52]"
                        style={mono}
                      >
                        {content.tableHeaders.modes}
                      </th>
                      <th
                        className="px-5 py-3 text-[11px] tracking-[0.5px] text-[#5a5e52]"
                        style={mono}
                      >
                        {content.tableHeaders.bestFit}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {content.models.map((model) => (
                      <tr key={model.name} className="border-b border-[#d4dbb8]/50 last:border-b-0">
                        <td className="px-5 py-4 pr-6 text-sm font-medium text-[#1c1f17]">
                          <Link href={model.href} className="transition-colors hover:text-[#6b7d3a]">
                            {model.name}
                          </Link>
                        </td>
                        <td className="px-5 py-4 pr-6 text-sm text-[#4d5145]">{model.modes}</td>
                        <td className="px-5 py-4 text-sm text-[#4d5145]">{model.bestFor}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-6 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.usageTitle}
              </h2>
              <div className="max-w-[860px] space-y-6">
                {content.usageExamples.map((example) => (
                  <div key={example.title}>
                    <p className="mb-3 text-[11px] tracking-[0.5px] text-[#5a5e52]" style={mono}>
                      {example.title}
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

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-6 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.useCasesTitle}
              </h2>
              <div className="grid max-w-[920px] gap-4 sm:grid-cols-2">
                {content.useCases.map((useCase) => (
                  <div key={useCase.title} className="border-l-[3px] border-[#6b7d3a] pl-5">
                    <p className="mb-1 text-sm font-medium text-[#1c1f17]">{useCase.title}</p>
                    <p className="text-sm leading-6 text-[#4d5145]">{useCase.description}</p>
                  </div>
                ))}
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.relatedTitle}
              </h2>
              <div className="grid max-w-[1100px] gap-4 sm:grid-cols-3">
                {content.relatedCards.map((card) => (
                  <Link
                    key={card.title}
                    href={card.href}
                    className="rounded-xl border border-[#d4dbb8] p-5 transition-colors hover:border-[#6b7d3a]"
                  >
                    <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                      {card.eyebrow}
                    </p>
                    <h3 className="mb-2 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                      {card.title}
                    </h3>
                    <p className="text-sm leading-6 text-[#4d5145]">{card.description}</p>
                  </Link>
                ))}
              </div>
            </section>
          </FadeIn>

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
                  <div key={item.question} className="rounded-xl border border-[#d4dbb8] p-5">
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
              <h2 className="mb-6 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.nextStepsTitle}
              </h2>
              <div className="flex flex-wrap gap-4">
                {content.nextActions.map((action) => {
                  const isExternal = "external" in action && action.external;
                  const isPrimary = "primary" in action && action.primary;

                  return isExternal ? (
                    <a
                      key={action.label}
                      href={action.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-block rounded-lg px-8 py-3 text-[11px] font-bold tracking-[0.8px] transition-colors ${
                        isPrimary
                          ? "bg-[#6b7d3a] text-[#f4f5f0] hover:bg-[#1c1f17]"
                          : "border border-[#1c1f17] text-[#1c1f17] hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                      }`}
                      style={mono}
                    >
                      {action.label}
                    </a>
                  ) : (
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
    </>
  );
}
