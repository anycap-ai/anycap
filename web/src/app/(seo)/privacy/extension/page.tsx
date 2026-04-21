import type { Metadata } from "next";
import { FadeIn } from "@/components/ui/FadeIn";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "Privacy — AnyCap Chrome Extension",
  description:
    "What data the AnyCap Chrome Extension collects and how it is used.",
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
            how it is used, and what we do not collect.
          </p>
          <p className="mt-4 text-[11px] text-[#5a5e52] font-mono">
            Effective date: April 28, 2026
          </p>
        </FadeIn>

        <div className="mt-14 md:mt-16">
          <hr className="border-t border-[#dce0d2]" />
        </div>

        <FadeIn>
          <PageSection title="Data we collect">
            <ul className={listClass}>
              <li>
                <strong>The image URL you right-click.</strong> Sent to our
                server to generate the variation.
              </li>
              <li>
                <strong>An anonymous install ID</strong> (random UUID generated
                in your browser). Used only for anonymous-trial rate limiting.
              </li>
              <li>
                <strong>If you sign in</strong>: your AnyCap account ID and auth
                token. Stored only in <code>chrome.storage.local</code>.
              </li>
              <li>
                <strong>Usage telemetry</strong> (install / generate / download /
                login counts). No URLs, no image content.
              </li>
            </ul>
          </PageSection>
        </FadeIn>

        <FadeIn>
          <PageSection title="What we DO NOT collect">
            <ul className={listClass}>
              <li>Page DOM, cookies, or browsing history.</li>
              <li>Any content from pages you do not right-click on.</li>
              <li>Your clipboard.</li>
            </ul>
          </PageSection>
        </FadeIn>

        <FadeIn>
          <PageSection title="Data retention">
            <p className={bodyClass}>
              Generated images (results) are stored in your AnyCap Drive when
              you sign in. They are deleted when you delete them from Drive or
              close your account. Anonymous generations are not persisted beyond
              the session.
            </p>
          </PageSection>
        </FadeIn>

        <FadeIn>
          <PageSection title="Third parties">
            <p className={bodyClass}>
              Images are sent to our model providers (NexusHub → e.g.
              nano-banana) to produce the variation. These providers do not
              retain the images after the generation completes.
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
  );
}
