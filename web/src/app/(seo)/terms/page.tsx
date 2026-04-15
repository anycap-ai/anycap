import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { EmailActionButton } from "@/components/ui/EmailActionButton";
import { FadeIn } from "@/components/ui/FadeIn";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { createLocalizedMetadataForPath } from "@/lib/localized-metadata";
import { getRequestLocale } from "@/lib/request-locale";
import { defaultLocale } from "@/lib/site";
import { getTermsMetadata, getTermsPageData, TERMS_PATH } from "./content";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;
const sectionTitleClass =
  "text-[22px] leading-8 tracking-[-0.01em] text-[#1c1f17] md:text-[26px]";
const subTitleClass =
  "text-[18px] leading-7 tracking-[-0.01em] text-[#1c1f17] md:text-[20px]";
const bodyClass = "text-base leading-7 text-[#4d5145]";
const listClass =
  "mt-4 list-disc space-y-3 pl-5 text-base leading-7 text-[#4d5145] marker:text-[#6b7d3a]";
const linkClass = "text-[#1c1f17] underline decoration-[#6b7d3a] underline-offset-4";
const buttonLinkClass = `${linkClass} cursor-pointer border-0 bg-transparent p-0`;

export const metadata: Metadata = createLocalizedMetadataForPath(
  defaultLocale,
  TERMS_PATH,
  getTermsMetadata(defaultLocale),
);

function PageSection({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-14 md:mt-16">
      {eyebrow ? (
        <p className="mb-4 text-[11px] tracking-[0.7px] text-[#6b7d3a]" style={mono}>
          {eyebrow}
        </p>
      ) : null}
      <h2 className={sectionTitleClass}>{title}</h2>
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}

export default async function TermsPage() {
  const locale = await getRequestLocale();
  const content = getTermsPageData(locale);
  const summaryTitle =
    locale === "id"
      ? "Cara membaca ketentuan ini"
      : locale === "pt-br"
        ? "Como ler estes termos"
        : "How to read these terms";
  const summaryParagraphs =
    locale === "id"
      ? [
          "Halaman ini merangkum dasar hukum untuk memakai situs AnyCap, CLI, dan workflow terkait. Susunannya dibuat agar pembaca bisa cepat memahami apa yang ditawarkan, di mana batas penggunaan berada, dan bagaimana konteks operasional produk terhubung dengan ketentuan.",
          "Alih-alih hanya menjadi dokumen kepatuhan, halaman ini juga berfungsi sebagai referensi praktis bagi operator dan pembeli yang ingin menyelaraskan penggunaan, penagihan, dukungan, dan konteks kebijakan produk di satu tempat.",
        ]
      : locale === "pt-br"
        ? [
            "Esta página resume a base legal para usar o site, a CLI e os workflows relacionados ao AnyCap. Ela foi estruturada para que a pessoa consiga entender com rapidez o que está sendo oferecido, onde estão os limites de uso e como o contexto operacional do produto se conecta aos termos.",
            "Em vez de funcionar apenas como documento de compliance, a página também serve como referência prática para operadores e compradores que querem alinhar uso, cobrança, suporte e políticas do produto em um único lugar.",
          ]
        : [
            "This page summarizes the legal baseline for using the AnyCap site, CLI, and related workflows. It is structured so readers can understand what is being offered, where the usage boundaries sit, and how the product's operating context connects to the terms.",
            "Rather than acting only as a compliance document, the page also works as a practical reference for operators and buyers who want usage, billing, support, and policy context aligned in one place.",
          ];

  return (
    <>
      <BreadcrumbJsonLd items={content.breadcrumbItems} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(content.termsPageJsonLd) }}
      />

      <article className="px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[860px] py-12 md:py-20 lg:py-24">
          <FadeIn>
            <div className="max-w-[760px]">
              <p className="mb-4 text-[11px] tracking-[0.8px] text-[#6b7d3a]" style={mono}>
                {content.eyebrow}
              </p>
              <h1
                className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
                style={{ ...pixel, fontSize: "clamp(32px, 6vw, 72px)" }}
              >
                {content.heroTitle}
              </h1>
              <p className="mt-6 text-base leading-7 text-[#4d5145] md:text-lg">
                {content.heroIntro}
              </p>
              <p className="mt-4 text-[11px] text-[#5a5e52]" style={mono}>
                {content.lastUpdatedLabel}
              </p>
            </div>
          </FadeIn>

          <div className="mt-14 md:mt-16">
            <hr className="border-t border-[#dce0d2]" />
          </div>

          <FadeIn>
            <PageSection title={summaryTitle}>
              {summaryParagraphs.map((paragraph) => (
                <p key={paragraph} className={bodyClass}>
                  {paragraph}
                </p>
              ))}
            </PageSection>
          </FadeIn>

          <FadeIn>
            <PageSection eyebrow={content.keyTermsTitle} title={content.keyTermsTitle}>
              <p className={bodyClass}>{content.keyTermsTitle}</p>
              <div className="space-y-6">
                {content.keyTerms.map((item) => (
                  <div key={item.title}>
                    <h3 className={subTitleClass}>{item.title}</h3>
                    <p className={`${bodyClass} mt-2`}>{item.body}</p>
                  </div>
                ))}
              </div>
            </PageSection>
          </FadeIn>

          <FadeIn>
            <PageSection eyebrow={content.coreTermsTitle} title={content.coreTermsTitle}>
              <div className="space-y-10">
                {content.coreTerms.map((section) => (
                  <section key={section.title}>
                    <p className="text-[11px] tracking-[0.7px] text-[#6b7d3a]" style={mono}>
                      {section.kicker}
                    </p>
                    <h3 className={`${subTitleClass} mt-2`}>{section.title}</h3>
                    <ul className={listClass}>
                      {section.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            </PageSection>
          </FadeIn>

          <FadeIn>
            <PageSection eyebrow={content.footerTitle} title={content.footerTitle}>
              <p className={bodyClass}>{content.footerIntro}</p>
              <p className={bodyClass}>
                {content.footerBody1}{" "}
                <Link href="/privacy" className={linkClass}>
                  {locale === "id" ? "kebijakan privasi" : "privacy policy"}
                </Link>
                {locale === "id" ? ", " : ", "}{" "}
                <Link href="/pricing" className={linkClass}>
                  {locale === "id" ? "harga" : "pricing"}
                </Link>
                {locale === "id" ? ", dan " : ", and "}{" "}
                <Link href="/about" className={linkClass}>
                  {locale === "id" ? "about" : "about"}
                </Link>{" "}
                {locale === "id"
                  ? "halaman agar dasar hukumnya selaras dengan produk dan konteks operasional."
                  : "pages so the legal baseline matches the product and operating context."}
              </p>
              <p className={bodyClass}>
                {content.footerBody2}{" "}
                <EmailActionButton subject="AnyCap terms question" className={buttonLinkClass}>
                  {locale === "id" ? "tim AnyCap" : "the AnyCap team"}
                </EmailActionButton>{" "}
                {locale === "id" ? "atau gunakan" : "or use the"}{" "}
                <Link href="/contact" className={linkClass}>
                  {locale === "id" ? "halaman kontak" : "contact page"}
                </Link>
                .
              </p>
            </PageSection>
          </FadeIn>
        </div>
      </article>
    </>
  );
}
