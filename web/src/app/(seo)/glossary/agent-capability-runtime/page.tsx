import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { EarlyAccessBanner } from "@/components/landing/EarlyAccessBanner";
import { FadeIn } from "@/components/ui/FadeIn";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { createLocalizedMetadataForPath } from "@/lib/localized-metadata";
import { defaultLocale } from "@/lib/site";
import {
  AGENT_CAPABILITY_RUNTIME_PATH,
  getAgentCapabilityRuntimeMetadata,
  getAgentCapabilityRuntimePageData,
} from "./content";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

const content = getAgentCapabilityRuntimePageData(defaultLocale);

export const metadata: Metadata = createLocalizedMetadataForPath(
  defaultLocale,
  AGENT_CAPABILITY_RUNTIME_PATH,
  getAgentCapabilityRuntimeMetadata(defaultLocale),
);

export default function AgentCapabilityRuntimePage() {
  return (
    <>
      <BreadcrumbJsonLd items={content.breadcrumbItems} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(content.definitionJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(content.articleJsonLd) }}
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
              style={{ ...pixel, fontSize: "clamp(28px, 5vw, 60px)" }}
            >
              {content.heroTitle[0]}
              <br />
              {content.heroTitle[1]}
            </h1>
          </FadeIn>

          <FadeIn>
            <div className="mt-8 max-w-[700px] border-l-[3px] border-[#6b7d3a] pl-6">
              <p className="text-base leading-7 text-[#4d5145] md:text-lg">{content.heroBody[0]}</p>
            </div>
          </FadeIn>

          <FadeIn className="mt-6">
            <div className="max-w-[700px] space-y-4">
              <p className="text-base leading-7 text-[#4d5145]">{content.heroBody[1]}</p>
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
              <p className="mb-4 text-[11px] tracking-[0.8px] text-[#6b7d3a]" style={mono}>
                {content.sectionLabels.architecture}
              </p>
              <h2 className="mb-4 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.architectureHeading}
              </h2>
              <p className="mb-8 max-w-[700px] text-base leading-7 text-[#4d5145]">
                {content.architectureIntro}
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[#d4dbb8]">
                      <th className="w-[200px] pb-3 pr-6 text-[11px] tracking-[0.5px] text-[#5a5e52]" style={mono}>
                        Layer
                      </th>
                      <th className="pb-3 pr-6 text-[11px] tracking-[0.5px] text-[#5a5e52]" style={mono}>
                        Responsibility
                      </th>
                      <th className="pb-3 text-[11px] tracking-[0.5px] text-[#5a5e52]" style={mono}>
                        Examples
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {content.architectureTable.map((row) => (
                      <tr key={row.layer} className="border-b border-[#d4dbb8]/50">
                        <td
                          className={`align-top py-4 pr-6 text-sm font-medium ${
                            row.layer === "Capability runtime" || row.layer === "Runtime de capacidades"
                              ? "text-[#6b7d3a]"
                              : "text-[#1c1f17]"
                          }`}
                        >
                          {row.layer}
                        </td>
                        <td className="align-top py-4 pr-6 text-sm leading-6 text-[#4d5145]">{row.role}</td>
                        <td className="align-top py-4 text-sm leading-6 text-[#4d5145]">{row.examples}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-6 max-w-[700px] text-sm leading-6 text-[#5a5e52]">
                {content.architectureClosing}
              </p>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <p className="mb-4 text-[11px] tracking-[0.8px] text-[#6b7d3a]" style={mono}>
                {content.sectionLabels.motivation}
              </p>
              <h2 className="mb-4 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.motivationHeading}
              </h2>
              <p className="mb-8 max-w-[700px] text-base leading-7 text-[#4d5145]">
                {content.motivationIntro}
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[#d4dbb8]">
                      <th className="pb-3 pr-6 text-[11px] tracking-[0.5px] text-[#5a5e52]" style={mono}>
                        Signal
                      </th>
                      <th className="pb-3 pr-6 text-[11px] tracking-[0.5px] text-[#5a5e52]" style={mono}>
                        Without a runtime
                      </th>
                      <th className="pb-3 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                        With a runtime
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {content.problemSignals.map((row) => (
                      <tr key={row.signal} className="border-b border-[#d4dbb8]/50">
                        <td className="align-top py-4 pr-6 text-sm font-medium text-[#1c1f17]">{row.signal}</td>
                        <td className="align-top py-4 pr-6 text-sm leading-6 text-[#4d5145]">{row.without}</td>
                        <td className="align-top py-4 text-sm leading-6 text-[#4d5145]">{row.with}</td>
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
              <p className="mb-4 text-[11px] tracking-[0.8px] text-[#6b7d3a]" style={mono}>
                {content.sectionLabels.comparison}
              </p>
              <h2 className="mb-4 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.comparisonHeading}
              </h2>
              <p className="mb-8 max-w-[700px] text-base leading-7 text-[#4d5145]">
                {content.comparisonIntro}
              </p>
              <div className="space-y-4">
                {content.approachComparisons.map((row) => (
                  <div
                    key={row.approach}
                    className={`rounded-xl border p-6 ${
                      row.approach === "Capability runtime" || row.approach === "Runtime de capacidades"
                        ? "border-[#6b7d3a] bg-[#f7f8ef]/80"
                        : "border-[#d4dbb8] bg-[#fffffc]/70"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <h3
                        className={`text-[15px] font-bold ${
                          row.approach === "Capability runtime" || row.approach === "Runtime de capacidades"
                            ? "text-[#6b7d3a]"
                            : "text-[#1c1f17]"
                        }`}
                        style={mono}
                      >
                        {row.approach}
                      </h3>
                      <span className="shrink-0 text-[11px] tracking-[0.5px] text-[#5a5e52]" style={mono}>
                        {row.bestFor}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-[#4d5145]">{row.what}</p>
                    <div className="mt-4 grid gap-4 sm:grid-cols-3">
                      <div>
                        <p className="mb-1 text-[11px] tracking-[0.5px] text-[#5a5e52]" style={mono}>
                          Install
                        </p>
                        <p className="text-sm leading-6 text-[#4d5145]">{row.install}</p>
                      </div>
                      <div>
                        <p className="mb-1 text-[11px] tracking-[0.5px] text-[#5a5e52]" style={mono}>
                          Auth
                        </p>
                        <p className="text-sm leading-6 text-[#4d5145]">{row.auth}</p>
                      </div>
                      <div>
                        <p className="mb-1 text-[11px] tracking-[0.5px] text-[#5a5e52]" style={mono}>
                          Trade-off
                        </p>
                        <p className="text-sm leading-6 text-[#4d5145]">{row.tradeoff}</p>
                      </div>
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
              <p className="mb-4 text-[11px] tracking-[0.8px] text-[#6b7d3a]" style={mono}>
                {content.sectionLabels.scope}
              </p>
              <h2 className="mb-4 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.scopeHeading}
              </h2>
              <p className="mb-8 max-w-[700px] text-base leading-7 text-[#4d5145]">
                {content.scopeIntro}
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                {content.capabilityCategories.map((cat) => (
                  <div key={cat.category} className="rounded-xl border border-[#d4dbb8] bg-[#fffffc]/70 p-6">
                    <h3 className="mb-3 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                      {cat.category}
                    </h3>
                    <p className="mb-3 text-sm leading-6 text-[#4d5145]">{cat.capabilities}</p>
                    <p className="text-[11px] tracking-[0.5px] text-[#5a5e52]" style={mono}>
                      Agent use: {cat.agentUse}
                    </p>
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
              <p className="mb-4 text-[11px] tracking-[0.8px] text-[#6b7d3a]" style={mono}>
                {content.sectionLabels.design}
              </p>
              <h2 className="mb-4 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.designHeading}
              </h2>
              <div className="max-w-[700px] space-y-6">
                {content.designPrinciples.map((principle) => (
                  <div key={principle.title} className="border-l-[3px] border-[#6b7d3a] pl-6">
                    <h3 className="mb-2 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                      {principle.title}
                    </h3>
                    <p className="text-sm leading-6 text-[#4d5145]">{principle.body}</p>
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
              <p className="mb-4 text-[11px] tracking-[0.8px] text-[#6b7d3a]" style={mono}>
                {content.sectionLabels.example}
              </p>
              <h2 className="mb-4 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.exampleHeading}
              </h2>
              <div className="max-w-[700px] space-y-4">
                <p className="text-base leading-7 text-[#4d5145]">
                  <Link
                    href="/"
                    className="underline decoration-[#d4dbb8] underline-offset-2 transition-colors hover:text-[#6b7d3a] hover:decoration-[#6b7d3a]"
                  >
                    AnyCap
                  </Link>{" "}
                  {content.exampleBody[0].replace(/^AnyCap is /, "")}
                </p>
                <p className="text-base leading-7 text-[#4d5145]">{content.exampleBody[1]}</p>
                <div className="rounded-lg bg-[#1c1f17] px-5 py-4">
                  <p className="text-[13px] text-[#d4e0a4]" style={mono}>
                    {content.exampleCallout}
                  </p>
                </div>
                <p className="text-sm leading-6 text-[#5a5e52]">
                  {content.examplePostscript.split("anycap")[0]}
                  <span className="text-[#6b7d3a]" style={mono}>
                    anycap &lt;capability&gt; &lt;operation&gt;
                  </span>
                  {content.examplePostscript.split("anycap <capability> <operation>")[1]}
                </p>
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.faqHeading}
              </h2>
              <div className="max-w-[860px] space-y-4">
                {content.faqItems.map((item) => (
                  <div key={item.question} className="rounded-xl border border-[#d4dbb8] bg-[#fffffc]/70 p-5">
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
            <section className="mt-16 md:mt-24">
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.relatedHeading}
              </h2>
              <div className="grid max-w-[1060px] gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {content.relatedPages.map((page) => (
                  <Link
                    key={page.href}
                    href={page.href}
                    className="rounded-xl border border-[#d4dbb8] p-5 transition-colors hover:border-[#6b7d3a]"
                  >
                    <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                      {page.eyebrow}
                    </p>
                    <h3 className="mb-2 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                      {page.title}
                    </h3>
                    <p className="text-sm leading-6 text-[#4d5145]">{page.summary}</p>
                  </Link>
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
                <Link
                  href="/capabilities"
                  className="inline-block rounded-lg bg-[#6b7d3a] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#f4f5f0] transition-colors hover:bg-[#1c1f17]"
                  style={mono}
                >
                  {content.ctas.primary}
                </Link>
                <Link
                  href="/cli"
                  className="inline-block rounded-lg border border-[#1c1f17] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                  style={mono}
                >
                  {content.ctas.secondary}
                </Link>
                <Link
                  href="/start"
                  className="inline-block rounded-lg border border-[#1c1f17] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                  style={mono}
                >
                  {content.ctas.tertiary}
                </Link>
                <a
                  href="https://github.com/anycap-ai/anycap"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block rounded-lg border border-[#1c1f17] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                  style={mono}
                >
                  {content.ctas.github}
                </a>
              </div>
            </section>
          </FadeIn>
        </div>
      </article>
    </>
  );
}
