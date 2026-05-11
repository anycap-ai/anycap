import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { FadeIn } from "@/components/ui/FadeIn";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "Privacy — AnyCap Chrome Extension",
  description:
    "What data the AnyCap Chrome Extension collects for browser capabilities and how it is used.",
};

const bodyClass = "text-base leading-7 text-[#4d5145]";
const listClass =
  "mt-5 list-disc space-y-3 pl-5 text-base leading-7 text-[#4d5145] marker:text-[#6b7d3a]";
const sectionTitleClass =
  "text-[22px] leading-8 tracking-[-0.01em] text-[#1c1f17] md:text-[26px]";

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

export default function ExtensionPrivacyPage() {
  return (
    <>
      <BreadcrumbJsonLd />
      <article className="px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[820px] py-12 md:py-20 lg:py-24">
          <FadeIn>
            <p className="mb-4 text-[11px] tracking-[0.8px] text-[#6b7d3a] font-mono">
              Privacy
            </p>
            <h1
              className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ fontSize: "clamp(32px, 6vw, 72px)" }}
            >
              AnyCap Chrome Extension — Privacy
            </h1>
            <p className="mt-6 max-w-[760px] text-base leading-7 text-[#4d5145] md:text-lg">
              This page explains what data the AnyCap Chrome Extension collects,
              how it is used, and what we do not collect when you generate
              media, search the web, or crawl a page from the browser.
            </p>
            <p className="mt-4 text-[11px] text-[#5a5e52] font-mono">
              Effective date: May 11, 2026
            </p>
          </FadeIn>

          <div className="mt-14 md:mt-16">
            <hr className="border-t border-[#dce0d2]" />
          </div>

          <FadeIn>
            <PageSection title="Data we collect">
              <ul className={listClass}>
                <li>
                  <strong>Capability inputs you choose to submit.</strong> This
                  can include prompts, selected text, model choices, aspect
                  ratio, duration, a right-clicked image URL, a page URL, or a
                  link URL, depending on which extension action you run.
                </li>
                <li>
                  <strong>Web search and crawl inputs.</strong> Search queries
                  and crawl URLs are sent to AnyCap so the server can return web
                  results, extracted Markdown, summaries, and source links.
                </li>
                <li>
                  <strong>An anonymous install ID.</strong> A random UUID is
                  generated in your browser and sent when you are not signed in.
                  It is used for anonymous-trial limits and abuse prevention.
                </li>
                <li>
                  <strong>If you sign in:</strong> the extension stores your
                  AnyCap auth token in <code>chrome.storage.local</code> and
                  sends it as a bearer token for authenticated requests.
                </li>
                <li>
                  <strong>Local extension state.</strong> Settings, onboarding
                  status, recent request history, and the anonymous install ID
                  are stored in Chrome extension storage on your device.
                </li>
                <li>
                  <strong>Operational request metadata.</strong> AnyCap may log
                  request status, timing, feature names, error codes, IP-derived
                  abuse-control buckets, and provider task metadata needed to
                  operate and secure the service.
                </li>
              </ul>
            </PageSection>
          </FadeIn>

          <FadeIn>
            <PageSection title="What we DO NOT collect">
              <ul className={listClass}>
                <li>Your full browsing history.</li>
                <li>Cookies or page credentials.</li>
                <li>Page DOM from pages you did not explicitly act on.</li>
                <li>Clipboard contents, except when you choose to copy a result.</li>
                <li>Background screenshots or screen recordings.</li>
              </ul>
            </PageSection>
          </FadeIn>

          <FadeIn>
            <PageSection title="Data retention">
              <p className={bodyClass}>
                Recent extension history and settings stay in Chrome extension
                storage until you clear them or uninstall the extension.
                Anonymous trial counters and abuse-control buckets are retained
                server-side for the active rate-limit window. Generated media,
                search results, crawl output, and request logs may be retained
                by AnyCap as needed to provide the result, secure the service,
                debug failures, and comply with operational requirements. When
                signed in, generated assets may be associated with your AnyCap
                account and can be managed through AnyCap surfaces that expose
                those assets.
              </p>
            </PageSection>
          </FadeIn>

          <FadeIn>
            <PageSection title="Third parties">
              <p className={bodyClass}>
                AnyCap may send the inputs needed for a capability to model,
                search, crawl, storage, authentication, hosting, and security
                providers. For example, prompts or reference images may be sent
                to media-generation providers, search queries to search
                providers, and URLs to crawl providers. Providers process this
                data only for the requested capability and related operational
                needs.
              </p>
            </PageSection>
          </FadeIn>

          <FadeIn>
            <PageSection title="Chrome Web Store Limited Use">
              <p className={bodyClass}>
                AnyCap uses Chrome extension data only to provide and secure the
                requested capability, support users, debug failures, and prevent
                abuse. Extension data is not sold, not used for advertising or
                creditworthiness decisions, and not used for unrelated products.
                If the extension receives information from Google APIs, AnyCap
                uses and transfers that information in accordance with the
                Chrome Web Store User Data Policy, including the Limited Use
                requirements.
              </p>
            </PageSection>
          </FadeIn>

          <FadeIn>
            <PageSection title="Contact">
              <p className={bodyClass}>
                Questions? Email{" "}
                <a
                  href="mailto:privacy@anycap.ai"
                  className="text-[#1c1f17] underline decoration-[#6b7d3a] underline-offset-4"
                >
                  privacy@anycap.ai
                </a>{" "}
                or visit the{" "}
                <Link
                  href="/contact"
                  className="text-[#1c1f17] underline decoration-[#6b7d3a] underline-offset-4"
                >
                  contact page
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
