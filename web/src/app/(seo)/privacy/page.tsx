import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { EmailActionButton } from "@/components/ui/EmailActionButton";
import { FadeIn } from "@/components/ui/FadeIn";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { createLocalizedMetadataForPath } from "@/lib/localized-metadata";
import { getRequestLocale } from "@/lib/request-locale";
import { defaultLocale } from "@/lib/site";
import { getPrivacyMetadata, getPrivacyPageData, PRIVACY_PATH } from "./content";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;
const sectionTitleClass =
  "text-[22px] leading-8 tracking-[-0.01em] text-[#1c1f17] md:text-[26px]";
const bodyClass = "text-base leading-7 text-[#4d5145]";
const listClass =
  "mt-5 list-disc space-y-3 pl-5 text-base leading-7 text-[#4d5145] marker:text-[#6b7d3a]";
const linkClass = "text-[#1c1f17] underline decoration-[#6b7d3a] underline-offset-4";
const buttonLinkClass = `${linkClass} cursor-pointer border-0 bg-transparent p-0`;

export const metadata: Metadata = createLocalizedMetadataForPath(
  defaultLocale,
  PRIVACY_PATH,
  getPrivacyMetadata(defaultLocale),
);

function PageSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-14 md:mt-16">
      <h2 className={sectionTitleClass}>{title}</h2>
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

export default async function PrivacyPage() {
  const locale = await getRequestLocale();
  const content = getPrivacyPageData(locale);
  const summaryTitle =
    locale === "id"
      ? "Cara memakai kebijakan ini"
      : locale === "pt-br"
        ? "Como usar esta política"
        : "How to use this policy";
  const summaryParagraphs =
    locale === "id"
      ? [
          "Kebijakan privasi ini ditulis untuk menjelaskan data apa saja yang bisa muncul selama pengalaman menggunakan AnyCap dan bagaimana informasi tersebut terhubung dengan autentikasi, dukungan, penagihan, dan operasi produk.",
          "Halaman ini juga berfungsi sebagai referensi bagi pembaca yang perlu menemukan jalur pengumpulan, retensi, berbagi, dan permintaan dengan cepat tanpa bergantung hanya pada bahasa hukum yang dipadatkan.",
        ]
      : locale === "pt-br"
        ? [
            "Esta política de privacidade foi escrita para explicar quais dados podem aparecer ao longo da experiência com o AnyCap e como essas informações se relacionam com autenticação, suporte, faturamento e operação do produto.",
            "Ela também funciona como página de referência para pessoas que precisam localizar coleta, retenção, compartilhamento e caminhos de solicitação sem depender apenas de linguagem jurídica condensada.",
          ]
        : [
            "This privacy policy is written to explain what data can appear across the AnyCap experience and how that information connects to authentication, support, billing, and product operations.",
            "It also works as a reference page for readers who need to locate collection, retention, sharing, and request paths quickly instead of relying only on condensed legal language.",
          ];

  return (
    <>
      <BreadcrumbJsonLd items={content.breadcrumbItems} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(content.privacyPageJsonLd) }}
      />

      <article className="px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[820px] py-12 md:py-20 lg:py-24">
          <FadeIn>
            <p className="mb-4 text-[11px] tracking-[0.8px] text-[#6b7d3a]" style={mono}>
              {content.eyebrow}
            </p>
            <h1
              className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(32px, 6vw, 72px)" }}
            >
              {content.heroTitle}
            </h1>
            <p className="mt-6 max-w-[760px] text-base leading-7 text-[#4d5145] md:text-lg">
              {content.heroIntro}
            </p>
            <p className="mt-4 text-[11px] text-[#5a5e52]" style={mono}>
              {content.lastUpdatedLabel}
            </p>
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
            <PageSection title={content.sections.infoTitle}>
              <p className={bodyClass}>{content.sections.infoIntro}</p>
              <ul className={listClass}>
                {content.sections.infoCategories.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </PageSection>
          </FadeIn>

          <FadeIn>
            <PageSection title={content.sections.useTitle}>
              <ul className={listClass}>
                {content.sections.useCases.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </PageSection>
          </FadeIn>

          <FadeIn>
            <PageSection title={content.sections.sharingTitle}>
              <ul className={listClass}>
                {content.sections.sharingCategories.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className={bodyClass}>{content.sections.retentionText}</p>
              <p className={bodyClass}>{content.sections.securityText}</p>
            </PageSection>
          </FadeIn>

          <FadeIn>
            <PageSection title={content.sections.requestTitle}>
              <p className={bodyClass}>
                {content.sections.requestText1}{" "}
                <EmailActionButton subject="AnyCap privacy request" className={buttonLinkClass}>
                  {locale === "id" ? "tim AnyCap" : "the AnyCap team"}
                </EmailActionButton>{" "}
                {locale === "id" ? "atau gunakan" : "or use the"}{" "}
                <Link href="/contact" className={linkClass}>
                  {locale === "id" ? "halaman kontak" : "contact page"}
                </Link>
                .
              </p>
              <p className={bodyClass}>
                {content.sections.requestText2}{" "}
                <Link href="/terms" className={linkClass}>
                  {locale === "id" ? "Ketentuan Layanan" : "Terms of Service"}
                </Link>
                {locale === "id" ? ", halaman" : ", the"}{" "}
                <Link href="/pricing" className={linkClass}>
                  {locale === "id" ? "harga" : "pricing"}
                </Link>{" "}
                {locale === "id" ? "halaman, dan" : "page, and the"}{" "}
                <Link href="/about" className={linkClass}>
                  {locale === "id" ? "halaman about" : "about"}
                </Link>{" "}
                {locale === "id" ? "halaman." : "page."}
              </p>
            </PageSection>
          </FadeIn>
        </div>
      </article>
    </>
  );
}
