import type { Metadata } from "next";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { EarlyAccessBanner } from "@/components/landing/EarlyAccessBanner";
import { FadeIn } from "@/components/ui/FadeIn";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { createTechArticleJsonLd, createFaqPageJsonLd } from "@/lib/schema";
import { createLocalizedMetadataForPath } from "@/lib/localized-metadata";
import { getRequestLocale } from "@/lib/request-locale";
import { defaultLocale, type SiteLocale } from "@/lib/site";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

const PATH = "/guides/how-to-add-vision-to-ai-agent";

type PageContent = {
  eyebrow: string;
  title: [string, string];
  intro: string;
  neededTitle: string;
  neededItems: string[];
  callout: string;
  steps: {
    skill: string;
    cli: string;
    login: string;
    image: string;
    video: string;
    combine: string;
  };
  faqTitle: string;
  ctas: {
    claude: string;
    capability: string;
    start: string;
  };
  breadcrumbLabel: string;
};

const contentByLocale: Record<"en" | "pt-br", PageContent> = {
  en: {
    eyebrow: "Guides",
    title: ["How to add vision capabilities", "to an AI agent"],
    intro:
      "Most AI agents work with text and code — but they cannot see. AnyCap adds vision capabilities through image understanding and video analysis, letting your agent analyze screenshots, inspect UI designs, review video content, and reason about visual information. This guide covers both image read and video read setup.",
    neededTitle: "What you need",
    neededItems: [
      "An AI agent that can run shell commands (Claude Code, Cursor, Codex, etc.)",
      "Node.js 18+ (for skills.sh and npm install)",
      "A browser for the one-time login flow",
      "Images or videos to analyze (URLs or local files)",
    ],
    callout:
      "Vision capabilities include two commands: image read for analyzing images and video read for analyzing videos. Both return structured text that your agent can reason about.",
    steps: {
      skill: "Install the AnyCap skill",
      cli: "Install the AnyCap CLI",
      login: "Log in",
      image: "Use image understanding",
      video: "Use video analysis",
      combine: "Combine vision in agent workflows",
    },
    faqTitle: "FAQ",
    ctas: {
      claude: "AnyCap for Claude Code",
      capability: "All Capabilities",
      start: "Get Started",
    },
    breadcrumbLabel: "Add Vision to AI Agent",
  },
  "pt-br": {
    eyebrow: "Guias",
    title: ["Como adicionar capacidades de visao", "a um agente de IA"],
    intro:
      "A maioria dos agentes de IA trabalha com texto e codigo - mas nao enxerga. O AnyCap adiciona capacidades de visao por meio de entendimento de imagem e analise de video, permitindo que seu agente analise screenshots, revise designs de UI, examine conteudos em video e raciocine sobre informacoes visuais. Este guia cobre a configuracao de image read e video read.",
    neededTitle: "O que voce precisa",
    neededItems: [
      "Um agente de IA que consiga executar comandos de shell (Claude Code, Cursor, Codex, etc.)",
      "Node.js 18+ (para skills.sh e npm install)",
      "Um navegador para o fluxo de login unico",
      "Imagens ou videos para analisar (URLs ou arquivos locais)",
    ],
    callout:
      "As capacidades de visao incluem dois comandos: image read para analisar imagens e video read para analisar videos. Ambos retornam texto estruturado que o agente pode interpretar.",
    steps: {
      skill: "Instale a skill do AnyCap",
      cli: "Instale a CLI do AnyCap",
      login: "Faca login",
      image: "Use entendimento de imagem",
      video: "Use analise de video",
      combine: "Combine visao nos workflows do agente",
    },
    faqTitle: "FAQ",
    ctas: {
      claude: "AnyCap para Claude Code",
      capability: "Todas as capabilities",
      start: "Comecar",
    },
    breadcrumbLabel: "Adicionar visao ao agente de IA",
  },
};

function getPageMetadata(locale: SiteLocale): Metadata {
  const isPtBr = locale === "pt-br";
  return createLocalizedMetadataForPath(locale, PATH, {
    title: isPtBr
      ? "Como adicionar capacidades de visao a um agente de IA - imagem e video"
      : "How to Add Vision Capabilities to an AI Agent — Image and Video Understanding",
    description: isPtBr
      ? "Guia passo a passo para adicionar capacidades de entendimento de imagem e analise de video a qualquer agente de IA usando a CLI do AnyCap. Dê ao seu agente olhos."
      : "Step-by-step guide to adding image understanding and video analysis capabilities to any AI agent using AnyCap CLI. Give your agent eyes.",
  });
}

export const metadata: Metadata = getPageMetadata(defaultLocale);

const guideJsonLd = createTechArticleJsonLd({
  headline: "How to Add Vision Capabilities to an AI Agent — Image and Video Understanding",
  description:
    "Guide to adding image understanding and video analysis to AI agents like Claude Code, Cursor, and Codex using AnyCap CLI.",
  path: "/guides/how-to-add-vision-to-ai-agent",
  about: ["AI agent vision", "Image understanding", "Video analysis", "AnyCap CLI"],
  keywords: [
    "how to add vision to ai agent",
    "ai agent vision capabilities",
    "image understanding for agents",
    "video analysis for ai agents",
  ],
  datePublished: "2026-04-10",
  dateModified: "2026-04-10",
});

const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "Add Vision Capabilities to an AI Agent",
  description:
    "Step-by-step guide to adding image understanding and video analysis capabilities to any AI agent using AnyCap CLI.",
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
      text: "Run anycap login to authenticate. This single login covers every capability including image and video understanding.",
    },
    {
      "@type": "HowToStep",
      name: "Use image understanding",
      text: "Run anycap image read --url https://example.com/screenshot.png to analyze an image. The CLI returns a structured description of the image contents.",
    },
    {
      "@type": "HowToStep",
      name: "Use video analysis",
      text: "Run anycap video read --url https://example.com/demo.mp4 to analyze a video. The CLI returns a structured analysis including scene descriptions and key moments.",
    },
    {
      "@type": "HowToStep",
      name: "Combine vision in agent workflows",
      text: "Ask your agent to analyze visual content naturally. For example: 'Look at this screenshot and describe what UI issues you see' or 'Analyze this demo video and summarize the key features shown.'",
    },
  ],
};

const faqItems = [
  {
    question: "What is the difference between image read and video read?",
    answer:
      "Image read (anycap image read) analyzes a single image and returns a structured description of its contents — objects, text, layout, colors, and context. Video read (anycap video read) analyzes a video file and returns scene-by-scene analysis, key moments, actions, and temporal relationships.",
  },
  {
    question: "What image and video formats are supported?",
    answer:
      "Image read supports JPEG, PNG, WebP, and GIF. Video read supports MP4, WebM, and MOV. You can pass a URL to a hosted file or upload local files using anycap drive upload first.",
  },
  {
    question: "Can vision capabilities work with locally stored files?",
    answer:
      "Yes. Upload local files to AnyCap Drive using anycap drive upload ./screenshot.png, then pass the returned URL to the read command. Your agent handles this file-upload-then-analyze flow automatically when the skill is installed.",
  },
  {
    question: "How accurate is the image and video analysis?",
    answer:
      "AnyCap uses state-of-the-art vision models for both image understanding and video analysis. Accuracy depends on image quality, resolution, and content complexity. The analysis includes confidence levels and structured output that agents can reason about programmatically.",
  },
] as const;

const faqJsonLd = createFaqPageJsonLd(faqItems);

export default async function HowToAddVisionPage() {
  const locale = await getRequestLocale();
  const content = contentByLocale[locale === "pt-br" ? "pt-br" : "en"];
  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: "Home", href: "/" },
        { name: "Guides", href: "/guides", unlinkable: true },
        { name: content.breadcrumbLabel },
      ]} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(guideJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <article className="px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[1280px] py-12 md:py-20 lg:py-24">
          <FadeIn>
            <p className="text-[11px] text-[#6b7d3a] tracking-[0.8px] mb-4" style={mono}>{content.eyebrow}</p>
            <h1
              className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(28px, 5vw, 60px)" }}
            >
              {content.title[0]}
              <br />
              {content.title[1]}
            </h1>
            <p className="mt-6 max-w-[700px] text-base leading-7 text-[#4d5145] md:text-lg">
              {content.intro}
            </p>
          </FadeIn>

          <FadeIn className="mt-8">
            <EarlyAccessBanner />
          </FadeIn>

          <div className="mt-16 md:mt-24"><hr className="border-t border-[#d4dbb8]" /></div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="text-lg md:text-xl text-[#1c1f17] mb-6" style={{ ...pixel }}>{content.neededTitle}</h2>
              <ul className="space-y-3 max-w-[700px]">
                {content.neededItems.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-[#4d5145] leading-6">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#6b7d3a] shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24"><hr className="border-t border-[#d4dbb8]" /></div>

          <div className="mt-16 md:mt-24 space-y-10 max-w-[800px]">
            <FadeIn>
              <p className="text-sm text-[#4d5145] leading-6 border border-[#d4dbb8] bg-[#f4f5f0]/50 px-5 py-4 max-w-[800px]">
                {content.callout}
              </p>
            </FadeIn>

            {/* Step 1 */}
            <FadeIn>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 flex items-center justify-center text-[13px] font-bold text-[#f4f5f0] bg-[#6b7d3a]" style={mono}>1</span>
                <h2 className="text-lg text-[#1c1f17]" style={{ ...pixel }}>{content.steps.skill}</h2>
              </div>
              <div className="bg-[#1c1f17] px-5 py-4">
                <p className="text-[13px] text-[#6b7d3a] mb-1" style={mono}># For Claude Code</p>
                <p className="text-[13px] text-[#d4e0a4] mb-3" style={mono}>npx -y skills add anycap-ai/anycap -a claude-code -y</p>
                <p className="text-[13px] text-[#6b7d3a] mb-1" style={mono}># For Cursor</p>
                <p className="text-[13px] text-[#d4e0a4]" style={mono}>npx -y skills add anycap-ai/anycap -a cursor -y</p>
              </div>
              <p className="mt-3 text-sm text-[#4d5145]">This places the AnyCap SKILL.md into your agent&apos;s skills directory. The skill file describes vision capabilities including image read and video read.</p>
            </FadeIn>

            {/* Step 2 */}
            <FadeIn>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 flex items-center justify-center text-[13px] font-bold text-[#f4f5f0] bg-[#6b7d3a]" style={mono}>2</span>
                <h2 className="text-lg text-[#1c1f17]" style={{ ...pixel }}>{content.steps.cli}</h2>
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
                <h2 className="text-lg text-[#1c1f17]" style={{ ...pixel }}>{content.steps.login}</h2>
              </div>
              <div className="bg-[#1c1f17] px-5 py-4">
                <p className="text-[13px] text-[#d4e0a4]" style={mono}>anycap login</p>
              </div>
              <p className="mt-3 text-sm text-[#4d5145]">Opens a browser for authentication. One login covers every capability — vision, generation, music, and more.</p>
            </FadeIn>

            {/* Step 4 */}
            <FadeIn>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 flex items-center justify-center text-[13px] font-bold text-[#f4f5f0] bg-[#6b7d3a]" style={mono}>4</span>
                <h2 className="text-lg text-[#1c1f17]" style={{ ...pixel }}>{content.steps.image}</h2>
              </div>
              <div className="bg-[#1c1f17] px-5 py-4">
                <p className="text-[13px] text-[#6b7d3a] mb-1" style={mono}># Analyze an image from a URL</p>
                <p className="text-[13px] text-[#d4e0a4] mb-3" style={mono}>anycap image read --url https://example.com/screenshot.png</p>
                <p className="text-[13px] text-[#6b7d3a] mb-1" style={mono}># Analyze with a specific question</p>
                <p className="text-[13px] text-[#d4e0a4]" style={mono}>anycap image read --url https://example.com/ui.png --prompt &quot;What accessibility issues do you see?&quot;</p>
              </div>
              <p className="mt-3 text-sm text-[#4d5145]">Returns a structured description of the image contents — objects, text, layout, colors, and contextual details your agent can use for decision-making.</p>
            </FadeIn>

            {/* Step 5 */}
            <FadeIn>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 flex items-center justify-center text-[13px] font-bold text-[#f4f5f0] bg-[#6b7d3a]" style={mono}>5</span>
                <h2 className="text-lg text-[#1c1f17]" style={{ ...pixel }}>{content.steps.video}</h2>
              </div>
              <div className="bg-[#1c1f17] px-5 py-4">
                <p className="text-[13px] text-[#6b7d3a] mb-1" style={mono}># Analyze a video</p>
                <p className="text-[13px] text-[#d4e0a4] mb-3" style={mono}>anycap video read --url https://example.com/demo.mp4</p>
                <p className="text-[13px] text-[#6b7d3a] mb-1" style={mono}># Analyze with a focused prompt</p>
                <p className="text-[13px] text-[#d4e0a4]" style={mono}>anycap video read --url https://example.com/demo.mp4 --prompt &quot;List each feature shown in order&quot;</p>
              </div>
              <p className="mt-3 text-sm text-[#4d5145]">Returns scene-by-scene analysis of the video including key moments, actions, on-screen text, and temporal relationships.</p>
            </FadeIn>

            {/* Step 6 */}
            <FadeIn>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 flex items-center justify-center text-[13px] font-bold text-[#f4f5f0] bg-[#6b7d3a]" style={mono}>6</span>
                <h2 className="text-lg text-[#1c1f17]" style={{ ...pixel }}>{content.steps.combine}</h2>
              </div>
              <p className="text-sm text-[#4d5145] leading-6 max-w-[700px]">
                With vision installed, your agent gains powerful new workflows. It can analyze
                screenshots to find bugs, review designs, extract text from images, and understand
                video content — all through natural language.
              </p>
              <div className="bg-[#1c1f17] px-5 py-4 mt-3">
                <p className="text-[13px] text-[#6b7d3a] mb-1" style={mono}># UI review workflow</p>
                <p className="text-[13px] text-[#d4e0a4] mb-3" style={mono}>&quot;Look at this screenshot and identify any UI issues&quot;</p>
                <p className="text-[13px] text-[#6b7d3a] mb-1" style={mono}># Video summary workflow</p>
                <p className="text-[13px] text-[#d4e0a4] mb-3" style={mono}>&quot;Watch this demo video and write release notes&quot;</p>
                <p className="text-[13px] text-[#6b7d3a] mb-1" style={mono}># Combined generation + vision</p>
                <p className="text-[13px] text-[#d4e0a4]" style={mono}>&quot;Generate a hero image, then analyze it for brand consistency&quot;</p>
              </div>
              <p className="mt-3 text-sm text-[#4d5145]">The agent orchestrates upload, analysis, and follow-up actions without manual intervention.</p>
            </FadeIn>
          </div>

          <div className="mt-16 md:mt-24"><hr className="border-t border-[#d4dbb8]" /></div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="text-lg md:text-xl text-[#1c1f17] mb-8" style={{ ...pixel }}>{content.faqTitle}</h2>
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
                <Link href="/for/claude-code" className="inline-block px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#f4f5f0] bg-[#6b7d3a] hover:bg-[#1c1f17] transition-colors rounded-lg" style={mono}>{content.ctas.claude}</Link>
                <Link href="/capabilities" className="inline-block px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] border border-[#1c1f17] hover:bg-[#1c1f17] hover:text-[#f4f5f0] transition-colors rounded-lg" style={mono}>{content.ctas.capability}</Link>
                <Link href="/start" className="inline-block px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] border border-[#1c1f17] hover:bg-[#1c1f17] hover:text-[#f4f5f0] transition-colors rounded-lg" style={mono}>{content.ctas.start}</Link>
              </div>
            </section>
          </FadeIn>
        </div>
      </article>
    </>
  );
}
