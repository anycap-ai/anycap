import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { EarlyAccessBanner } from "@/components/landing/EarlyAccessBanner";
import { FadeIn } from "@/components/ui/FadeIn";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { createLocalizedMetadataForPath } from "@/lib/localized-metadata";
import { defaultLocale } from "@/lib/site";
import { getRequestLocale } from "@/lib/request-locale";
import { getSkillMetadata, getSkillPageData, SKILL_PATH } from "./content";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

export const metadata = createLocalizedMetadataForPath(
  defaultLocale,
  SKILL_PATH,
  getSkillMetadata(defaultLocale),
);

export default async function SkillPage() {
  const locale = await getRequestLocale();
  const content = getSkillPageData(locale);

  return (
    <>
      <BreadcrumbJsonLd items={content.breadcrumbItems} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(content.definitionJsonLd) }}
      />

      <article className="px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[1280px] py-12 md:py-20 lg:py-24">
          <FadeIn>
            <p className="mb-4 text-[11px] tracking-[0.8px] text-[#6b7d3a]" style={mono}>
              {content.eyebrow}
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
            <div className="mt-8 max-w-[720px] border-l-[3px] border-[#6b7d3a] pl-6">
              <p className="text-base leading-7 text-[#4d5145] md:text-lg">{content.intro}</p>
            </div>
          </FadeIn>

          <FadeIn className="mt-8">
            <EarlyAccessBanner />
          </FadeIn>

          <FadeIn className="mt-8">
            <div className="flex flex-wrap gap-4">
              {content.trustSignals.map((sig) => (
                <div key={sig.label} className="border border-[#d4dbb8] px-4 py-3">
                  <p className="text-[11px] text-[#9aa36a]" style={mono}>{sig.label}</p>
                  <p className="text-[13px] font-bold text-[#1c1f17]" style={mono}>{sig.value}</p>
                </div>
              ))}
            </div>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-6 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.installTitle}
              </h2>
              <div className="max-w-[720px] bg-[#1c1f17] px-5 py-4">
                <p className="break-all text-[13px] text-[#d4e0a4]" style={mono}>
                  {content.installCode}
                </p>
              </div>
              <div className="mt-4">
                <Link
                  href={content.githubUrl}
                  className="text-[13px] text-[#6b7d3a] underline underline-offset-2 hover:text-[#1c1f17]"
                  style={mono}
                >
                  View SKILL.md on GitHub →
                </Link>
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.workflowTitle}
              </h2>
              <div className="mb-8 grid gap-4 sm:grid-cols-2">
                <div className="border border-[#d4dbb8] p-5">
                  <p className="mb-2 text-[11px] tracking-[0.8px] text-[#9aa36a]" style={mono}>
                    BEFORE
                  </p>
                  <p className="text-sm leading-6 text-[#4d5145]">{content.workflowBefore}</p>
                </div>
                <div className="border border-[#6b7d3a] p-5">
                  <p className="mb-2 text-[11px] tracking-[0.8px] text-[#6b7d3a]" style={mono}>
                    AFTER
                  </p>
                  <p className="text-sm leading-6 text-[#4d5145]">{content.workflowAfter}</p>
                </div>
              </div>
              {content.comparisonTable && (
                <div className="mb-8 overflow-x-auto">
                  <p className="mb-3 text-[13px] font-bold text-[#1c1f17]" style={mono}>
                    {content.comparisonTable.title}
                  </p>
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr>
                        <th className="border border-[#d4dbb8] p-3 text-left text-[11px] text-[#6b7280]" style={mono}></th>
                        <th className="border border-[#d4dbb8] p-3 text-left text-[11px] text-[#9aa36a]" style={mono}>WITHOUT SKILL</th>
                        <th className="border border-[#6b7d3a] p-3 text-left text-[11px] text-[#6b7d3a]" style={mono}>WITH SKILL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {content.comparisonTable.rows.map((row, i) => (
                        <tr key={i}>
                          <td className="border border-[#d4dbb8] p-3 text-[13px] font-bold text-[#1c1f17]" style={mono}>{row.label}</td>
                          <td className="border border-[#d4dbb8] p-3 text-[13px] text-[#6b7280]">{row.without}</td>
                          <td className="border border-[#6b7d3a] p-3 text-[13px] text-[#4d5145]">{row.with}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <ol className="max-w-[720px] space-y-4">
                {content.workflowSteps.map((step, i) => (
                  <li key={i} className="flex gap-4">
                    <span
                      className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center border border-[#6b7d3a] text-[11px] text-[#6b7d3a]"
                      style={mono}
                    >
                      {i + 1}
                    </span>
                    <div>
                      <p className="mb-1 text-[13px] font-bold text-[#1c1f17]" style={mono}>
                        {step.label}
                      </p>
                      <p className="text-sm leading-6 text-[#4d5145]">{step.detail}</p>
                    </div>
                  </li>
                ))}
              </ol>
              {content.sampleOutput && (
                <div className="mt-8 max-w-[720px]">
                  <p className="mb-2 text-[11px] tracking-[0.8px] text-[#9aa36a]" style={mono}>
                    SAMPLE OUTPUT
                  </p>
                  <div className="bg-[#1c1f17] px-5 py-4">
                    <pre
                      className="overflow-x-auto text-[13px] leading-6 text-[#d4e0a4] whitespace-pre"
                      style={mono}
                    >
                      {content.sampleOutput}
                    </pre>
                  </div>
                </div>
              )}
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.capabilitiesTitle}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {content.capabilities.map((cap) => (
                  <Link
                    key={cap.href}
                    href={cap.href}
                    className="border border-[#d4dbb8] p-5 transition-colors hover:border-[#6b7d3a]"
                  >
                    <p className="mb-2 text-[13px] font-bold text-[#1c1f17]" style={mono}>
                      {cap.name}
                    </p>
                    <p className="text-sm leading-6 text-[#4d5145]">{cap.summary}</p>
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
                {content.agentsTitle}
              </h2>
              <div className="flex flex-wrap gap-3">
                {content.agents.map((agent) =>
                  agent.href ? (
                    <Link
                      key={agent.name}
                      href={agent.href}
                      className="border border-[#d4dbb8] px-5 py-3 text-sm text-[#1c1f17] transition-colors hover:border-[#6b7d3a]"
                      style={mono}
                    >
                      {agent.name}
                    </Link>
                  ) : (
                    <span
                      key={agent.name}
                      className="border border-[#d4dbb8]/70 px-5 py-3 text-sm text-[#6b7280] opacity-80"
                      style={mono}
                    >
                      {agent.name}
                    </span>
                  ),
                )}
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
              <dl className="max-w-[720px] space-y-6">
                {content.faqs.map((faq, i) => (
                  <div key={i} className="border-l-[3px] border-[#d4dbb8] pl-6">
                    <dt className="mb-2 text-[13px] font-bold text-[#1c1f17]" style={mono}>
                      {faq.question}
                    </dt>
                    <dd className="text-sm leading-6 text-[#4d5145]">{faq.answer}</dd>
                  </div>
                ))}
              </dl>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24 mb-8">
              <div className="flex flex-wrap gap-4">
                {content.relatedLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={
                      link.variant === "primary"
                        ? "inline-block rounded-lg bg-[#6b7d3a] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#f4f5f0] transition-colors hover:bg-[#1c1f17]"
                        : "inline-block rounded-lg border border-[#1c1f17] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                    }
                    style={mono}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </section>
          </FadeIn>
        </div>
      </article>
    </>
  );
}
