import type { Metadata } from "next";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { siteConfig } from "@/lib/site";
import { EarlyAccessBanner } from "@/components/landing/EarlyAccessBanner";
import { FadeIn } from "@/components/ui/FadeIn";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { createTechArticleJsonLd, createFaqPageJsonLd } from "@/lib/schema";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

export const metadata: Metadata = {
  title: "How to Add Video Generation to an AI Agent — Step-by-Step Guide",
  description:
    "Step-by-step guide to adding video generation capabilities to any AI agent using AnyCap CLI and models like Veo 3.1 and Kling 3.0.",
  alternates: { canonical: "/guides/how-to-add-video-generation-to-ai-agent" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/guides/how-to-add-video-generation-to-ai-agent",
    siteName: siteConfig.siteName,
    title: "How to Add Video Generation to an AI Agent — Step-by-Step Guide",
    description:
      "Step-by-step guide to adding video generation capabilities to any AI agent using AnyCap CLI and models like Veo 3.1 and Kling 3.0.",
  },
};

const guideJsonLd = createTechArticleJsonLd({
  headline: "How to Add Video Generation to an AI Agent — Step-by-Step Guide",
  description:
    "Guide to adding video generation to AI agents like Claude Code, Cursor, and Codex using AnyCap CLI with models like Veo 3.1 and Kling 3.0.",
  path: "/guides/how-to-add-video-generation-to-ai-agent",
  about: ["AI agent video generation", "AnyCap CLI", "Veo 3.1", "Kling 3.0"],
  keywords: [
    "how to add video generation to ai agent",
    "ai agent video generation",
    "add video generation to claude code",
    "anycap video generate",
  ],
  datePublished: "2026-04-10",
  dateModified: "2026-04-10",
});

const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "Add Video Generation to an AI Agent",
  description:
    "Step-by-step guide to adding video generation capabilities to any AI agent using AnyCap CLI.",
  totalTime: "PT5M",
  step: [
    {
      "@type": "HowToStep",
      name: "Install the AnyCap skill",
      text: "Run the skills installer to place the AnyCap SKILL.md into your agent's skills directory. For Claude Code: npx -y skills add anycap-ai/anycap -a claude-code -y",
    },
    {
      "@type": "HowToStep",
      name: "Install the AnyCap CLI",
      text: "Run curl -fsSL https://anycap.ai/install.sh | sh to install the CLI binary. Alternatively use npm install -g @anycap/cli.",
    },
    {
      "@type": "HowToStep",
      name: "Log in",
      text: "Run anycap login to authenticate. This single login covers every capability including video generation.",
    },
    {
      "@type": "HowToStep",
      name: "Discover available video models",
      text: "Run anycap video models to list available models such as Veo 3.1, Kling 3.0, and others.",
    },
    {
      "@type": "HowToStep",
      name: "Generate your first video",
      text: "Run anycap video generate --model veo-3.1 --prompt 'a drone shot over a mountain lake at sunrise' to create your first AI-generated video.",
    },
    {
      "@type": "HowToStep",
      name: "Use video generation in agent workflows",
      text: "Ask your agent to generate videos naturally. For example, tell Claude Code: 'Create a product demo video' and it will call AnyCap automatically.",
    },
  ],
};

const faqItems = [
  {
    question: "Which video models does AnyCap support?",
    answer:
      "AnyCap provides access to multiple video generation models including Veo 3.1, Kling 3.0, and others. Run anycap video models to see the latest available options and their capabilities.",
  },
  {
    question: "How long does video generation take?",
    answer:
      "Video generation is asynchronous. The CLI submits the request and polls for completion. Most videos finish within 30 seconds to a few minutes depending on the model and settings. Your agent handles the polling automatically.",
  },
  {
    question: "Can I generate videos from reference images?",
    answer:
      "Yes. Some models support image-to-video generation. Upload a reference image using anycap drive upload, then pass the URL to the video generate command with the --ref flag.",
  },
  {
    question: "Does this work with agents other than Claude Code?",
    answer:
      "Yes. Any agent that can run shell commands supports AnyCap video generation. This includes Cursor, Codex, and Manus. Install the appropriate skill for your agent and follow the same steps.",
  },
] as const;

const faqJsonLd = createFaqPageJsonLd(faqItems);

export default function HowToAddVideoGenerationPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: "Home", href: "/" },
        { name: "Guides", href: "/guides", unlinkable: true },
        { name: "Add Video Generation to AI Agent" },
      ]} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(guideJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <article className="px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[1280px] py-12 md:py-20 lg:py-24">
          <FadeIn>
            <p className="text-[11px] text-[#6b7d3a] tracking-[0.8px] mb-4" style={mono}>Guides</p>
            <h1
              className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(28px, 5vw, 60px)" }}
            >
              How to add video generation to an AI agent
            </h1>
            <p className="mt-6 max-w-[700px] text-base leading-7 text-[#4d5145] md:text-lg">
              AI agents can write code, answer questions, and automate workflows — but they cannot
              create videos on their own. AnyCap adds video generation capabilities through a skill
              file and CLI. This guide walks through adding video generation to any AI agent, using
              models like Veo 3.1 and Kling 3.0 to produce AI-generated videos from text prompts.
            </p>
          </FadeIn>

          <FadeIn className="mt-8">
            <EarlyAccessBanner />
          </FadeIn>

          <div className="mt-16 md:mt-24"><hr className="border-t border-[#d4dbb8]" /></div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="text-lg md:text-xl text-[#1c1f17] mb-6" style={{ ...pixel }}>What you need</h2>
              <ul className="space-y-3 max-w-[700px]">
                <li className="flex items-start gap-3 text-sm text-[#4d5145] leading-6">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#6b7d3a] shrink-0" />
                  An AI agent that can run shell commands (Claude Code, Cursor, Codex, etc.)
                </li>
                <li className="flex items-start gap-3 text-sm text-[#4d5145] leading-6">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#6b7d3a] shrink-0" />
                  Node.js 18+ (for skills.sh and npm install)
                </li>
                <li className="flex items-start gap-3 text-sm text-[#4d5145] leading-6">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#6b7d3a] shrink-0" />
                  A browser for the one-time login flow
                </li>
              </ul>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24"><hr className="border-t border-[#d4dbb8]" /></div>

          <div className="mt-16 md:mt-24 space-y-10 max-w-[800px]">
            <FadeIn>
              <p className="text-sm text-[#4d5145] leading-6 border border-[#d4dbb8] bg-[#f4f5f0]/50 px-5 py-4 max-w-[800px]">
                Video generation is asynchronous — the CLI submits the request and polls until the
                video is ready. Your agent handles this automatically.
              </p>
            </FadeIn>

            {/* Step 1 */}
            <FadeIn>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 flex items-center justify-center text-[13px] font-bold text-[#f4f5f0] bg-[#6b7d3a]" style={mono}>1</span>
                <h2 className="text-lg text-[#1c1f17]" style={{ ...pixel }}>Install the AnyCap skill</h2>
              </div>
              <div className="bg-[#1c1f17] px-5 py-4">
                <p className="text-[13px] text-[#6b7d3a] mb-1" style={mono}># For Claude Code</p>
                <p className="text-[13px] text-[#d4e0a4] mb-3" style={mono}>npx -y skills add anycap-ai/anycap -a claude-code -y</p>
                <p className="text-[13px] text-[#6b7d3a] mb-1" style={mono}># For Cursor</p>
                <p className="text-[13px] text-[#d4e0a4]" style={mono}>npx -y skills add anycap-ai/anycap -a cursor -y</p>
              </div>
              <p className="mt-3 text-sm text-[#4d5145]">This places the AnyCap SKILL.md into your agent&apos;s skills directory. The skill file describes all available capabilities including video generation models and their parameters.</p>
            </FadeIn>

            {/* Step 2 */}
            <FadeIn>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 flex items-center justify-center text-[13px] font-bold text-[#f4f5f0] bg-[#6b7d3a]" style={mono}>2</span>
                <h2 className="text-lg text-[#1c1f17]" style={{ ...pixel }}>Install the AnyCap CLI</h2>
              </div>
              <div className="bg-[#1c1f17] px-5 py-4 mb-3">
                <p className="text-[13px] text-[#d4e0a4]" style={mono}>curl -fsSL https://anycap.ai/install.sh | sh</p>
              </div>
              <p className="text-sm text-[#4d5145]">Or: <code className="text-[12px] text-[#6b7d3a]" style={mono}>npm install -g @anycap/cli</code></p>
            </FadeIn>

            {/* Step 3 */}
            <FadeIn>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 flex items-center justify-center text-[13px] font-bold text-[#f4f5f0] bg-[#6b7d3a]" style={mono}>3</span>
                <h2 className="text-lg text-[#1c1f17]" style={{ ...pixel }}>Log in</h2>
              </div>
              <div className="bg-[#1c1f17] px-5 py-4">
                <p className="text-[13px] text-[#d4e0a4]" style={mono}>anycap login</p>
              </div>
              <p className="mt-3 text-sm text-[#4d5145]">Opens a browser for authentication. One login covers every capability — video generation, image generation, music, and understanding.</p>
            </FadeIn>

            {/* Step 4 */}
            <FadeIn>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 flex items-center justify-center text-[13px] font-bold text-[#f4f5f0] bg-[#6b7d3a]" style={mono}>4</span>
                <h2 className="text-lg text-[#1c1f17]" style={{ ...pixel }}>Discover available video models</h2>
              </div>
              <div className="bg-[#1c1f17] px-5 py-4">
                <p className="text-[13px] text-[#d4e0a4]" style={mono}>anycap video models</p>
              </div>
              <p className="mt-3 text-sm text-[#4d5145]">Lists all available video models including Veo 3.1 and Kling 3.0. Each model has different strengths — check resolution, duration limits, and style capabilities.</p>
            </FadeIn>

            {/* Step 5 */}
            <FadeIn>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 flex items-center justify-center text-[13px] font-bold text-[#f4f5f0] bg-[#6b7d3a]" style={mono}>5</span>
                <h2 className="text-lg text-[#1c1f17]" style={{ ...pixel }}>Generate your first video</h2>
              </div>
              <div className="bg-[#1c1f17] px-5 py-4">
                <p className="text-[13px] text-[#d4e0a4]" style={mono}>anycap video generate --model veo-3.1 --prompt &quot;a drone shot over a mountain lake at sunrise&quot;</p>
              </div>
              <p className="mt-3 text-sm text-[#4d5145]">The CLI submits the generation request and polls until the video is ready. Once complete, it returns the video URL.</p>
            </FadeIn>

            {/* Step 6 */}
            <FadeIn>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 flex items-center justify-center text-[13px] font-bold text-[#f4f5f0] bg-[#6b7d3a]" style={mono}>6</span>
                <h2 className="text-lg text-[#1c1f17]" style={{ ...pixel }}>Use video generation in agent workflows</h2>
              </div>
              <p className="text-sm text-[#4d5145] leading-6 max-w-[700px]">
                Once set up, your agent can generate videos in response to natural-language requests.
                It handles model selection, prompt construction, and async polling automatically.
              </p>
              <div className="bg-[#1c1f17] px-5 py-4 mt-3">
                <p className="text-[13px] text-[#6b7d3a] mb-1" style={mono}># Ask your agent naturally</p>
                <p className="text-[13px] text-[#d4e0a4] mb-3" style={mono}>&quot;Create a 5-second product demo video&quot;</p>
                <p className="text-[13px] text-[#6b7d3a] mb-1" style={mono}># Or generate from a reference image</p>
                <p className="text-[13px] text-[#d4e0a4]" style={mono}>&quot;Animate this mockup into a video walkthrough&quot;</p>
              </div>
              <p className="mt-3 text-sm text-[#4d5145]">The agent reads the skill file, selects the best video model, and handles the asynchronous generation flow end to end.</p>
            </FadeIn>
          </div>

          <div className="mt-16 md:mt-24"><hr className="border-t border-[#d4dbb8]" /></div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="text-lg md:text-xl text-[#1c1f17] mb-8" style={{ ...pixel }}>FAQ</h2>
              <div className="max-w-[860px] space-y-4">
                {faqItems.map((item) => (
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

          <div className="mt-16 md:mt-24"><hr className="border-t border-[#d4dbb8]" /></div>

          <FadeIn>
            <section className="mt-16 md:mt-24 mb-8">
              <div className="flex flex-wrap gap-4">
                <Link href="/for/claude-code" className="inline-block px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#f4f5f0] bg-[#6b7d3a] hover:bg-[#1c1f17] transition-colors rounded-lg" style={mono}>AnyCap for Claude Code</Link>
                <Link href="/capabilities/video-generation" className="inline-block px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] border border-[#1c1f17] hover:bg-[#1c1f17] hover:text-[#f4f5f0] transition-colors rounded-lg" style={mono}>Video Generation</Link>
                <Link href="/start" className="inline-block px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] border border-[#1c1f17] hover:bg-[#1c1f17] hover:text-[#f4f5f0] transition-colors rounded-lg" style={mono}>Get Started</Link>
              </div>
            </section>
          </FadeIn>
        </div>
      </article>
    </>
  );
}
