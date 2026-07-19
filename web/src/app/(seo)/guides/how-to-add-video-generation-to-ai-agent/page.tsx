import type { Metadata } from "next";
import { EarlyAccessBanner } from "@/components/landing/EarlyAccessBanner";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { ArticleByline } from "@/components/seo/ArticleByline";
import { FadeIn } from "@/components/ui/FadeIn";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { getRequestLocale } from "@/lib/request-locale";
import { defaultLocale } from "@/lib/site";
import {
  VIDEO_AGENT_GUIDE_START_HREF,
  getVideoGuidePageData,
  type VideoGuidePageData,
} from "./content";
import { getPageMetadata } from "./metadata";

export const runtime = "edge";
export const metadata: Metadata = getPageMetadata(defaultLocale);

const pixel = {
  fontFamily: "var(--font-geist-pixel-square), monospace",
} as const;
const mono = {
  fontFamily: "var(--font-mono), monospace",
  fontWeight: 500,
} as const;

function StepHeading({ number, title }: { number: number; title: string }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center bg-[#6b7d3a] text-[13px] font-bold text-[#f4f5f0]"
        style={mono}
      >
        {number}
      </span>
      <h2 className="text-lg text-[#1c1f17]" style={pixel}>
        {title}
      </h2>
    </div>
  );
}

function CommandBlock({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto bg-[#1c1f17] px-5 py-4 text-[12px] leading-6 text-[#d4e0a4]">
      <code style={mono}>{children}</code>
    </pre>
  );
}

export default async function VideoAgentGuidePage() {
  const locale = await getRequestLocale();
  const content: VideoGuidePageData = getVideoGuidePageData(locale);

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "AnyCap", href: "/" },
          { name: content.eyebrow, href: "/guides", unlinkable: true },
          { name: content.breadcrumbLabel },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(content.guideJsonLd) }}
      />

      <article className="px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[1280px] py-12 md:py-20 lg:py-24">
          <FadeIn>
            <p className="mb-4 text-[11px] tracking-[0.8px] text-[#6b7d3a]" style={mono}>
              {content.eyebrow}
            </p>
            <ArticleByline author="AnyCap" updatedLabel="2026-07-11" className="mb-3" />
            <h1
              className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(28px, 5vw, 60px)" }}
            >
              {content.title[0]}
              <br />
              {content.title[1]}
            </h1>
            <div className="mt-6 max-w-[820px] space-y-4">
              {content.intro.map((paragraph) => (
                <p key={paragraph} className="text-base leading-7 text-[#4d5145] md:text-lg">
                  {paragraph}
                </p>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={VIDEO_AGENT_GUIDE_START_HREF}
                className="rounded-lg bg-[#6b7d3a] px-7 py-3 text-[11px] font-bold tracking-[0.8px] text-[#f4f5f0] transition-colors hover:bg-[#1c1f17]"
                style={mono}
              >
                {content.ctas.start}
              </Link>
              <a
                href="#source-path"
                className="rounded-lg border border-[#1c1f17] px-7 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                style={mono}
              >
                {content.sourceDecision.title}
              </a>
            </div>
          </FadeIn>

          <FadeIn className="mt-8">
            <EarlyAccessBanner />
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-6 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.neededTitle}
              </h2>
              <ul className="max-w-[820px] space-y-3">
                {content.neededItems.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm leading-6 text-[#4d5145]">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#6b7d3a]" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-8 max-w-[820px] border border-[#d4dbb8] bg-[#f4f5f0]/50 px-5 py-4 text-sm leading-6 text-[#4d5145]">
                {content.callout}
              </p>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section id="source-path" className="mt-16 scroll-mt-24 md:mt-24">
              <h2 className="text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.sourceDecision.title}
              </h2>
              <p className="mt-3 max-w-[820px] text-sm leading-6 text-[#4d5145]">
                {content.sourceDecision.description}
              </p>
              <div className="mt-8 grid gap-5 lg:grid-cols-3">
                {content.sourceDecision.items.map((source) => (
                  <article
                    key={source.key}
                    className="flex min-w-0 flex-col rounded-xl border border-[#d4dbb8] bg-[#fffffc]/70 p-5"
                  >
                    <p className="text-[11px] text-[#6b7d3a]" style={mono}>
                      {source.mode}
                    </p>
                    <h3 className="mt-2 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                      {source.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-[#4d5145]">{source.body}</p>
                    <dl className="mt-5 space-y-4 border-t border-[#d4dbb8] pt-4">
                      <div>
                        <dt className="text-[11px] font-bold text-[#1c1f17]" style={mono}>
                          {content.sourceDecision.fitLabel}
                        </dt>
                        <dd className="mt-1 text-sm leading-6 text-[#4d5145]">{source.fit}</dd>
                      </div>
                      <div>
                        <dt className="text-[11px] font-bold text-[#1c1f17]" style={mono}>
                          {content.sourceDecision.limitationLabel}
                        </dt>
                        <dd className="mt-1 text-sm leading-6 text-[#4d5145]">
                          {source.limitation}
                        </dd>
                      </div>
                    </dl>
                    <div className="mt-5 space-y-3">
                      <div>
                        <p className="mb-1 text-[11px] text-[#6b7d3a]" style={mono}>
                          {content.sourceDecision.schemaLabel}
                        </p>
                        <CommandBlock>{source.schemaCommand}</CommandBlock>
                      </div>
                      {source.requiredSchemaParam ? (
                        <p className="text-xs leading-5 text-[#5a5e52]">
                          {content.sourceDecision.schemaParamNote}{" "}
                          <code className="text-[#6b7d3a]" style={mono}>
                            {source.requiredSchemaParam}
                          </code>
                        </p>
                      ) : null}
                      <div>
                        <p className="mb-1 text-[11px] text-[#6b7d3a]" style={mono}>
                          {content.sourceDecision.generateLabel}
                        </p>
                        <CommandBlock>{source.generateCommand}</CommandBlock>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <div className="mt-16 max-w-[900px] space-y-12 md:mt-24">
            <FadeIn>
              <StepHeading number={1} title={content.steps.skill} />
              <p className="max-w-[820px] text-sm leading-6 text-[#4d5145]">
                {content.stepCopy.skillBody}
              </p>
              <div className="mt-5 overflow-hidden rounded-xl border border-[#d4dbb8]">
                <div className="border-b border-[#d4dbb8] bg-[#f4f5f0]/70 px-5 py-4">
                  <h3 className="text-[14px] font-bold text-[#1c1f17]" style={mono}>
                    {content.setupMatrix.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[#4d5145]">
                    {content.setupMatrix.description}
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[680px] border-collapse text-left">
                    <thead>
                      <tr className="border-b border-[#d4dbb8] bg-[#fffffc]">
                        <th className="px-5 py-3 text-[11px] text-[#5a5e52]" style={mono}>
                          {content.setupMatrix.agentHeader}
                        </th>
                        <th className="px-5 py-3 text-[11px] text-[#5a5e52]" style={mono}>
                          {content.setupMatrix.commandHeader}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {content.setupMatrix.rows.map((target) => (
                        <tr key={target.key} className="border-b border-[#d4dbb8] last:border-b-0">
                          <td className="px-5 py-4 text-sm font-bold text-[#1c1f17]" style={mono}>
                            {target.agent}
                          </td>
                          <td className="px-5 py-4">
                            <code className="text-[12px] text-[#4d5145]" style={mono}>
                              {target.command}
                            </code>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </FadeIn>

            <FadeIn>
              <StepHeading number={2} title={content.steps.cli} />
              <div className="space-y-3">
                <CommandBlock>{content.workflowCommands.cliInstall}</CommandBlock>
                <CommandBlock>{content.workflowCommands.cliInstallAlternative}</CommandBlock>
              </div>
              <p className="mt-3 text-sm leading-6 text-[#4d5145]">
                {content.stepCopy.cliBody}
              </p>
            </FadeIn>

            <FadeIn>
              <StepHeading number={3} title={content.steps.login} />
              <CommandBlock>{content.workflowCommands.login}</CommandBlock>
              <p className="mt-3 text-sm leading-6 text-[#4d5145]">
                {content.stepCopy.loginBody}
              </p>
            </FadeIn>

            <FadeIn>
              <StepHeading number={4} title={content.steps.discover} />
              <CommandBlock>{content.workflowCommands.discover}</CommandBlock>
              <p className="mt-3 text-sm leading-6 text-[#4d5145]">
                {content.stepCopy.discoverBody}
              </p>
            </FadeIn>

            <FadeIn>
              <StepHeading number={5} title={content.steps.schema} />
              <p className="text-sm leading-6 text-[#4d5145]">
                {content.stepCopy.schemaBody}
              </p>
            </FadeIn>

            <FadeIn>
              <StepHeading number={6} title={content.steps.firstVideo} />
              <p className="text-sm leading-6 text-[#4d5145]">
                {content.stepCopy.firstVideoBody}
              </p>
            </FadeIn>

            <FadeIn>
              <StepHeading number={7} title={content.steps.workflow} />
              <p className="text-sm leading-6 text-[#4d5145]">
                {content.stepCopy.workflowBody}
              </p>
              <div className="mt-5 overflow-hidden rounded-xl border border-[#d4dbb8]">
                <div className="border-b border-[#d4dbb8] bg-[#f4f5f0]/70 px-5 py-4">
                  <h3 className="text-[14px] font-bold text-[#1c1f17]" style={mono}>
                    {content.resultExample.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[#4d5145]">
                    {content.resultExample.description}
                  </p>
                </div>
                <div className="bg-[#1c1f17] px-5 py-4">
                  <p className="mb-2 text-[11px] text-[#6b7d3a]" style={mono}>
                    {content.resultExample.outputLabel}
                  </p>
                  <pre className="overflow-x-auto text-[12px] leading-6 text-[#d4e0a4]">
                    <code style={mono}>{`{
  "status": "success",
  "local_path": "/workspace/product-walkthrough.mp4",
  "model": "<model-id>",
  "credits_used": 20,
  "request_id": "req_abc123"
}`}</code>
                  </pre>
                </div>
              </div>
              <p className="mt-3 text-sm leading-6 text-[#4d5145]">
                {content.stepCopy.workflowFooter}
              </p>
            </FadeIn>
          </div>

          <FadeIn>
            <section className="mt-10 max-w-[900px] rounded-xl border border-[#d4dbb8] bg-[#fffffc]/70 p-5">
              <h2 className="text-lg text-[#1c1f17]" style={pixel}>
                {content.relatedP0.title}
              </h2>
              <p className="mt-2 max-w-[760px] text-sm leading-6 text-[#4d5145]">
                {content.relatedP0.description}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                {content.relatedP0.links.map((link) => (
                  <Link
                    key={link.key}
                    href={link.href}
                    className="rounded-lg border border-[#1c1f17] px-5 py-2.5 text-[11px] font-bold tracking-[0.5px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                    style={mono}
                  >
                    {link.label}
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
                {content.useCasesTitle}
              </h2>
              <div className="grid gap-4 md:grid-cols-3">
                {content.useCases.map((item) => (
                  <article key={item.title} className="rounded-xl border border-[#d4dbb8] bg-[#fffffc]/70 p-5">
                    <h3 className="mb-2 text-[14px] font-bold text-[#1c1f17]" style={mono}>
                      {item.title}
                    </h3>
                    <p className="text-sm leading-6 text-[#4d5145]">{item.body}</p>
                  </article>
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
                {content.promptsTitle}
              </h2>
              <div className="max-w-[820px] space-y-4">
                {content.promptsBody.map((paragraph) => (
                  <p key={paragraph} className="text-base leading-7 text-[#4d5145]">
                    {paragraph}
                  </p>
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
                {content.mistakesTitle}
              </h2>
              <div className="grid gap-4 md:grid-cols-3">
                {content.mistakes.map((item) => (
                  <article key={item.title} className="rounded-xl border border-[#d4dbb8] bg-[#fffffc]/70 p-5">
                    <h3 className="mb-2 text-[14px] font-bold text-[#1c1f17]" style={mono}>
                      {item.title}
                    </h3>
                    <p className="text-sm leading-6 text-[#4d5145]">{item.body}</p>
                  </article>
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
              <div className="max-w-[900px] space-y-4">
                {content.faqItems.map((item) => (
                  <article key={item.question} className="rounded-xl border border-[#d4dbb8] bg-[#fffffc]/70 p-5">
                    <h3 className="mb-2 text-[14px] font-bold text-[#1c1f17]" style={mono}>
                      {item.question}
                    </h3>
                    <p className="text-sm leading-6 text-[#4d5145]">{item.answer}</p>
                  </article>
                ))}
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mb-8 mt-16 md:mt-24">
              <div className="flex flex-wrap gap-4">
                <Link
                  href={VIDEO_AGENT_GUIDE_START_HREF}
                  className="rounded-lg bg-[#6b7d3a] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#f4f5f0] transition-colors hover:bg-[#1c1f17]"
                  style={mono}
                >
                  {content.ctas.start}
                </Link>
                <Link
                  href="/for/claude-code"
                  className="rounded-lg border border-[#1c1f17] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                  style={mono}
                >
                  {content.ctas.claude}
                </Link>
                <Link
                  href="/capabilities/video-generation"
                  className="rounded-lg border border-[#1c1f17] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                  style={mono}
                >
                  {content.ctas.video}
                </Link>
              </div>
            </section>
          </FadeIn>
        </div>
      </article>
    </>
  );
}
