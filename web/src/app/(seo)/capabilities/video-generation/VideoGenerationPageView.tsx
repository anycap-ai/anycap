import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { FadeIn } from "@/components/ui/FadeIn";
import { EarlyAccessBanner } from "@/components/landing/EarlyAccessBanner";
import { VideoGenDemo } from "@/components/landing/VideoGenDemo";
import type { VideoGenerationPageData } from "@/app/(seo)/capabilities/video-generation/content";
import { hasJsonLdContent } from "@/lib/schema";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

const proofPoints = [
  "Trending Gemini Omni Flash Preview edits route back into the same agent workflow.",
  "Text-to-video, image-to-video, and edit-video through one command surface.",
  "Model choice stays visible: premium quality, fast iteration, or image-first motion.",
  "Outputs land back in the same workflow for review, sharing, and publishing.",
] as const;

const fitSignals = [
  ["Best fit", "Agents that need repeatable video creation inside coding, research, or content workflows."],
  ["Not a fit", "Teams that only want a consumer video editor with a manual timeline-first UI."],
  ["Conversion path", "Start with CLI setup, then route model-specific pages and agent pages from this capability hub."],
] as const;

function ActionLink({
  href,
  children,
  primary = false,
  external = false,
}: {
  href: string;
  children: React.ReactNode;
  primary?: boolean;
  external?: boolean;
}) {
  const className = `inline-flex min-h-12 items-center justify-center rounded-lg px-6 py-3 text-[13px] font-bold tracking-[0.8px] transition-all duration-200 active:scale-[0.97] ${
    primary
      ? "bg-[#6b7d3a] text-[#f4f5f0] shadow-[0_12px_28px_rgba(107,125,58,0.18)] hover:bg-[#1c1f17]"
      : "border border-[#1c1f17] text-[#1c1f17] hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
  }`;

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className} style={mono}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className} style={mono}>
      {children}
    </Link>
  );
}

export function VideoGenerationPageView({ content }: { content: VideoGenerationPageData }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(content.capabilityGuideJsonLd) }}
      />
      {hasJsonLdContent(content.faqJsonLd) ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(content.faqJsonLd) }}
        />
      ) : null}

      <article className="overflow-x-hidden">
        <section className="flex flex-col px-5 pt-20 sm:px-8 sm:pt-24 md:px-16 lg:px-24 xl:min-h-dvh xl:pb-8">
          <div className="flex flex-col gap-10 md:gap-12 xl:min-h-0 xl:flex-1 xl:flex-row xl:items-center xl:gap-12">
            <div className="min-w-0 flex-1 xl:max-w-[46rem]">
              <FadeIn>
                <p className="mb-4 text-[11px] tracking-[0.8px] text-[#6b7d3a]" style={mono}>
                  {content.eyebrow} · {content.lastUpdatedLabel}
                </p>
                <h1
                  className="leading-[1.08] tracking-[-0.03em] text-[#1c1f17]"
                  style={{ ...pixel, fontSize: "clamp(36px, 5.5vw, 76px)" }}
                >
                  Video generation{" "}
                  <br />
                  <span className="text-[#6b7d3a]" style={{ fontSize: "1.08em" }}>
                    for AI agents.
                  </span>{" "}
                  <br />
                  Text to video.{" "}
                  <br />
                  Image to video.
                </h1>
                <p className="mt-5 max-w-[700px] text-[15px] leading-6 text-[#4d5145] sm:text-base sm:leading-7 md:text-lg">
                  {content.hero.intro}
                </p>

                <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                  <ActionLink href="/start" primary>
                    Equip your Agent
                  </ActionLink>
                  <ActionLink href="/for/claude-code/video-generation">
                    Claude Code workflow
                  </ActionLink>
                  <ActionLink href="#models">
                    Compare models
                  </ActionLink>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-2 text-[12px] leading-5 text-[#4d5145]" style={mono}>
                  <span className="text-[#6b7d3a]">Trending now</span>
                  <Link
                    href="/models/gemini-omni-flash-preview"
                    className="inline-flex rounded-full border border-[#6b7d3a] bg-[#edf3d9] px-3 py-1.5 text-[#1c1f17] transition-colors hover:bg-[#6b7d3a] hover:text-[#f4f5f0]"
                  >
                    Gemini Omni Flash Preview →
                  </Link>
                  <span>edit-video route for existing clips</span>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <span className="text-[11px] tracking-[0.6px] text-[#6b7d3a]" style={mono}>
                    Search intent
                  </span>
                  {[
                    "Gemini Omni Flash Preview",
                    "video generation API",
                    "text-to-video",
                    "image-to-video",
                    "edit-video",
                    "AI agents",
                  ].map((item) => (
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
                  See the workflow, not just the claim<span className="text-[#5f7a29]">.</span>
                </p>
                <p className="mt-1.5 text-[12px] leading-[1.55] text-[#495240]">
                  Prompt, model call, generated clip, and next step in one agent flow.
                </p>
              </div>
              <div className="flex h-[24rem] w-full flex-col justify-center overflow-hidden rounded-lg bg-[#1c1f17] p-4 shadow-[0_20px_60px_rgba(28,31,23,0.18)] sm:h-[28rem] md:h-[32rem] md:p-6 lg:h-[36rem] xl:h-[calc((100dvh-8rem)*0.78)]">
                <VideoGenDemo lines={content.demo.lines} labels={content.demo.labels} />
              </div>
            </FadeIn>
          </div>
        </section>

        <FadeIn from="right" className="mt-16 flex justify-start px-8 md:mt-28 md:justify-end md:px-16 lg:px-24">
          <div className="max-w-[560px] border-l-[3px] border-[#1c1f17] pl-5 text-left md:border-l-0 md:border-r-[3px] md:pl-0 md:pr-8 md:text-right">
            <p className="text-lg leading-[1.65] text-[#3a3e32] md:text-[22px]">
              Searchers want a video API.
              <br />
              Agent builders need a workflow layer.
            </p>
            <p className="mt-5 text-xl text-[#1c1f17] md:text-[24px]" style={pixel}>
              AnyCap turns model access into agent action.
            </p>
          </div>
        </FadeIn>

        <FadeIn className="mt-24 px-8 md:mt-36 md:px-16 lg:px-24">
          <p
            className="mb-4 text-[#c8d4a0] line-through"
            style={{ ...pixel, fontSize: "clamp(14px, 2.2vw, 24px)", letterSpacing: "1px" }}
          >
            PICK&nbsp;ONE&nbsp;MODEL&nbsp;&nbsp;&nbsp;WIRE&nbsp;ONE&nbsp;API&nbsp;&nbsp;&nbsp;REBUILD&nbsp;THE&nbsp;WORKFLOW
          </p>
          <p
            className="text-[#1c1f17]"
            style={{ ...pixel, fontSize: "clamp(14px, 2.2vw, 24px)", letterSpacing: "1px" }}
          >
            ONE CLI. MULTIPLE VIDEO MODELS. AGENT-READY OUTPUTS.
          </p>
        </FadeIn>

        <div className="mt-24 px-5 md:mt-36 md:px-16 lg:px-24">
          <hr className="border-t border-[#d4dbb8]" />
        </div>

        <section className="px-8 py-20 md:px-16 md:py-32 lg:px-24">
          <FadeIn>
            <h2
              className="mb-6 leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(28px, 4.5vw, 60px)" }}
            >
              {content.hero.summaryLabel}
            </h2>
            <p className="max-w-[860px] text-xl leading-[1.5] text-[#6b7d3a] md:text-2xl" style={mono}>
              {content.hero.summaryText}
            </p>
          </FadeIn>

          <FadeIn delay={160} className="mt-12 grid max-w-[1040px] gap-4 md:grid-cols-3">
            {proofPoints.map((point, index) => (
              <div key={point} className="border-l-[3px] border-[#6b7d3a] pl-5">
                <p className="mb-2 text-[11px] tracking-[0.6px] text-[#6b7d3a]" style={mono}>
                  0{index + 1}
                </p>
                <p className="text-[15px] leading-7 text-[#4d5145] md:text-base">{point}</p>
              </div>
            ))}
          </FadeIn>
        </section>

        <div className="px-5 md:px-16 lg:px-24">
          <hr className="border-t border-[#d4dbb8]" />
        </div>

        <section id="models" className="px-8 py-20 md:px-16 md:py-32 lg:px-24">
          <FadeIn>
            <h2
              className="mb-8 leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(28px, 4.5vw, 60px)" }}
            >
              {content.decisionTitle}
            </h2>
            <div className="grid max-w-[1080px] gap-4 md:grid-cols-3">
              {content.decisionCards.map((card) => (
                <Link
                  key={card.title}
                  href={card.href}
                  aria-label={content.decisionCardAriaLabelTemplate.replace("{title}", card.title)}
                  className="group flex min-h-[220px] flex-col justify-between rounded-lg border border-[#d4dbb8] bg-[#fbfcf8] p-5 transition-all hover:-translate-y-0.5 hover:border-[#6b7d3a] hover:bg-white hover:shadow-[0_10px_24px_rgba(28,31,23,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6b7d3a] focus-visible:ring-offset-2"
                >
                  <span>
                    <p className="mb-4 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                      {card.eyebrow}
                    </p>
                    <h3
                      className="mb-3 text-[18px] leading-tight text-[#1c1f17] transition-colors group-hover:text-[#6b7d3a]"
                      style={pixel}
                    >
                      {card.title}
                    </h3>
                    <p className="text-sm leading-6 text-[#4d5145]">{card.body}</p>
                  </span>
                  <span
                    className="mt-6 text-[11px] tracking-[0.5px] text-[#5a5e52] transition-colors group-hover:text-[#6b7d3a]"
                    style={mono}
                  >
                    {content.decisionCardCta}
                  </span>
                </Link>
              ))}
            </div>
          </FadeIn>

          <FadeIn delay={160} className="mt-12 max-w-[1080px] overflow-hidden rounded-lg border border-[#d4dbb8] bg-white/40">
            <table className="w-full text-left">
              <thead className="bg-[#f9faf5]">
                <tr className="border-b border-[#d4dbb8]">
                  <th className="px-5 py-3 pr-6 text-[11px] tracking-[0.5px] text-[#5a5e52]" style={mono}>
                    {content.tableHeaders.model}
                  </th>
                  <th className="px-5 py-3 pr-6 text-[11px] tracking-[0.5px] text-[#5a5e52]" style={mono}>
                    {content.tableHeaders.modes}
                  </th>
                  <th className="px-5 py-3 text-[11px] tracking-[0.5px] text-[#5a5e52]" style={mono}>
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
          </FadeIn>
        </section>

        <div className="px-5 md:px-16 lg:px-24">
          <hr className="border-t border-[#d4dbb8]" />
        </div>

        <section className="px-8 py-20 md:px-16 md:py-32 lg:px-24">
          <FadeIn>
            <div className="grid max-w-[1120px] gap-12 lg:grid-cols-[0.82fr_1fr] lg:items-start">
              <div>
                <h2
                  className="mb-6 leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
                  style={{ ...pixel, fontSize: "clamp(28px, 4.5vw, 60px)" }}
                >
                  {content.usageTitle}
                </h2>
                <p className="max-w-[520px] text-base leading-7 text-[#4d5145] md:text-lg">
                  The page must prove that AnyCap is not just a list of models. The CLI examples show
                  how an agent can discover models, generate from text, and animate a reference frame.
                </p>
              </div>
              <div className="space-y-6">
                {content.usageExamples.map((example) => (
                  <div key={example.title}>
                    <p className="mb-3 text-[11px] tracking-[0.5px] text-[#5a5e52]" style={mono}>
                      {example.title}
                    </p>
                    <div className="rounded-lg bg-[#1c1f17] px-5 py-4">
                      <p className="break-all text-[13px] leading-6 text-[#d4e0a4]" style={mono}>
                        {example.code}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
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
                We believe video generation pages should show the agent workflow, not only describe the model.
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={160} className="mt-12 grid max-w-[1120px] gap-10 lg:grid-cols-[1fr_0.8fr]">
            <div>
              <h2 className="sr-only">{content.useCasesTitle}</h2>
              <div className="space-y-8">
                {content.useCases.map((useCase) => (
                  <div key={useCase.title} className="border-l-[3px] border-[#6b7d3a] pl-5">
                    <p className="mb-1 text-sm font-medium text-[#1c1f17]">{useCase.title}</p>
                    <p className="text-sm leading-6 text-[#4d5145]">{useCase.description}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-[#d4dbb8] bg-[#fbfcf8] p-6">
              <p className="mb-4 text-[11px] tracking-[0.6px] text-[#6b7d3a]" style={mono}>
                Page fit signals
              </p>
              <div className="space-y-5">
                {fitSignals.map(([label, body]) => (
                  <div key={label}>
                    <p className="text-[13px] font-bold text-[#1c1f17]" style={mono}>
                      {label}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-[#4d5145]">{body}</p>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </section>

        <div className="px-5 md:px-16 lg:px-24">
          <hr className="border-t border-[#d4dbb8]" />
        </div>

        <section className="px-8 py-20 md:px-16 md:py-32 lg:px-24">
          <FadeIn>
            <h2
              className="mb-8 leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(28px, 4.5vw, 60px)" }}
            >
              {content.relatedTitle}
            </h2>
            <div className="grid max-w-[1100px] gap-4 md:grid-cols-3">
              {content.relatedCards.map((card) => (
                <Link
                  key={card.title}
                  href={card.href}
                  className="rounded-lg border border-[#d4dbb8] bg-[#fbfcf8] p-5 transition-colors hover:border-[#6b7d3a] hover:bg-white"
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
          </FadeIn>
        </section>

        <div className="px-5 md:px-16 lg:px-24">
          <hr className="border-t border-[#d4dbb8]" />
        </div>

        <section className="px-8 py-20 md:px-16 md:py-32 lg:px-24">
          <FadeIn>
            <h2
              className="mb-8 leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(28px, 4.5vw, 60px)" }}
            >
              {content.faqTitle}
            </h2>
            <div className="max-w-[900px] divide-y divide-[#d4dbb8] border-y border-[#d4dbb8]">
              {content.faqItems.map((item) => (
                <div key={item.question} className="py-6">
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
              Let your agent{" "}
              <br />
              generate the clip.
            </h2>
            <p className="mx-auto mb-10 max-w-[640px] text-base leading-7 text-[#4d5145] md:text-lg">
              Start with the CLI, choose the model at runtime, and keep video generation inside the
              same agent workflow that plans, reviews, and publishes the result.
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              {content.nextActions.map((action) => (
                <ActionLink
                  key={action.label}
                  href={action.href}
                  primary={"primary" in action && action.primary}
                  external={"external" in action && action.external}
                >
                  {action.label}
                </ActionLink>
              ))}
            </div>
          </FadeIn>
        </section>

        <div className="px-8 pb-10 md:px-16 lg:px-24">
          <EarlyAccessBanner />
        </div>
      </article>
    </>
  );
}
