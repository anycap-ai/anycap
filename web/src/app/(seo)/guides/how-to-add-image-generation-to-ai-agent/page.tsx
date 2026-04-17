import type { Metadata } from "next";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { defaultLocale, getLocaleConfig, siteConfig, type SiteLocale } from "@/lib/site";
import { getRequestLocale } from "@/lib/request-locale";
import { EarlyAccessBanner } from "@/components/landing/EarlyAccessBanner";
import { FadeIn } from "@/components/ui/FadeIn";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { createTechArticleJsonLd, createFaqPageJsonLd } from "@/lib/schema";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

const metadataByLocale: Record<
  SiteLocale,
  { title: string; description: string; openGraphTitle: string; openGraphDescription: string }
> = {
  en: {
    title: "How to Add Image Generation to an AI Agent — Step-by-Step Guide",
    description:
      "Step-by-step guide to adding image generation capabilities to any AI agent — Claude Code, Cursor, or Codex — using AnyCap CLI and models like Seedream 5 and Nano Banana Pro.",
    openGraphTitle: "How to Add Image Generation to an AI Agent — Step-by-Step Guide",
    openGraphDescription:
      "Step-by-step guide to adding image generation capabilities to any AI agent — Claude Code, Cursor, or Codex — using AnyCap CLI and models like Seedream 5 and Nano Banana Pro.",
  },
  "pt-br": {
    title: "How to Add Image Generation to an AI Agent — Step-by-Step Guide",
    description:
      "Step-by-step guide to adding image generation capabilities to any AI agent — Claude Code, Cursor, or Codex — using AnyCap CLI and models like Seedream 5 and Nano Banana Pro.",
    openGraphTitle: "How to Add Image Generation to an AI Agent — Step-by-Step Guide",
    openGraphDescription:
      "Step-by-step guide to adding image generation capabilities to any AI agent — Claude Code, Cursor, or Codex — using AnyCap CLI and models like Seedream 5 and Nano Banana Pro.",
  },
  id: {
    title: "Cara menambahkan generasi gambar ke agen AI — panduan langkah demi langkah",
    description:
      "Panduan langkah demi langkah untuk menambahkan kapabilitas generasi gambar ke agen AI apa pun menggunakan AnyCap CLI serta model seperti Seedream 5 dan Nano Banana Pro.",
    openGraphTitle: "Cara menambahkan generasi gambar ke agen AI — panduan langkah demi langkah",
    openGraphDescription:
      "Pelajari setup AnyCap CLI, pemilihan model, dan workflow praktis agar agen AI dapat membuat gambar secara konsisten.",
  },
};

function getPageMetadata(locale: SiteLocale): Metadata {
  const localizedMetadata = metadataByLocale[locale] ?? metadataByLocale[defaultLocale];

  return {
    title: localizedMetadata.title,
    description: localizedMetadata.description,
    alternates: { canonical: "/guides/how-to-add-image-generation-to-ai-agent" },
    openGraph: {
      type: "website",
      locale: getLocaleConfig(locale).ogLocale,
      url: "/guides/how-to-add-image-generation-to-ai-agent",
      siteName: siteConfig.siteName,
      title: localizedMetadata.openGraphTitle,
      description: localizedMetadata.openGraphDescription,
    },
  };
}

export const metadata: Metadata = getPageMetadata(defaultLocale);

const guideJsonLd = createTechArticleJsonLd({
  headline: "How to Add Image Generation to an AI Agent — Step-by-Step Guide",
  description:
    "Guide to adding image generation to AI agents like Claude Code, Cursor, and Codex using AnyCap CLI with models like Seedream 5, Nano Banana Pro, and Nano Banana 2.",
  path: "/guides/how-to-add-image-generation-to-ai-agent",
  about: ["AI agent image generation", "AnyCap CLI", "Seedream 5", "Nano Banana Pro"],
  keywords: [
    "how to add image generation to ai agent",
    "ai agent image generation",
    "add image generation to claude code",
    "anycap image generate",
  ],
  datePublished: "2026-04-10",
  dateModified: "2026-04-10",
});

const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "Add Image Generation to an AI Agent",
  description:
    "Step-by-step guide to adding image generation capabilities to any AI agent using AnyCap CLI.",
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
      text: "Run anycap login to authenticate. This single login covers every capability including image generation.",
    },
    {
      "@type": "HowToStep",
      name: "Discover available image models",
      text: "Run anycap image models to list available models: Seedream 5, Seedream 4.5, Nano Banana Pro, Nano Banana 2.",
    },
    {
      "@type": "HowToStep",
      name: "Generate your first image",
      text: "Run anycap image generate --model seedream-5 --prompt 'a product photo on white background' to create your first AI-generated image.",
    },
    {
      "@type": "HowToStep",
      name: "Use image generation in agent workflows",
      text: "Ask your agent to generate images naturally. For example, tell Claude Code: 'Generate a hero image for the landing page' and it will call AnyCap automatically.",
    },
  ],
};

const faqItems = [
  {
    question: "Which AI agents support AnyCap image generation?",
    answer:
      "Any agent that can run shell commands supports AnyCap. This includes Claude Code, Cursor, Codex, and Manus. The agent calls the AnyCap CLI directly from the terminal.",
  },
  {
    question: "What image models are available?",
    answer:
      "AnyCap provides access to Seedream 5, Seedream 4.5, Nano Banana Pro, and Nano Banana 2. Each model has different strengths — Seedream 5 excels at photorealistic images while Nano Banana Pro handles artistic styles well.",
  },
  {
    question: "Can the agent choose the right model automatically?",
    answer:
      "Yes. When the AnyCap skill is installed, your agent learns about each model's strengths. It can select the best model based on the prompt and desired output style without manual intervention.",
  },
  {
    question: "How much does image generation cost?",
    answer:
      "AnyCap uses pay-as-you-go pricing with no monthly fee. New users receive $5 in free credit. Pricing varies by model — see the pricing page for per-generation rates.",
  },
] as const;

const idFaqItems = [
  {
    question: "Agen AI mana saja yang mendukung generasi gambar AnyCap?",
    answer:
      "Semua agen yang bisa menjalankan perintah shell dapat memakai AnyCap, termasuk Claude Code, Cursor, Codex, dan Manus. Agen akan memanggil AnyCap CLI langsung dari terminal.",
  },
  {
    question: "Model gambar apa saja yang tersedia?",
    answer:
      "AnyCap menyediakan Seedream 5, Seedream 4.5, Nano Banana Pro, dan Nano Banana 2. Masing-masing punya keunggulan berbeda, misalnya Seedream 5 untuk hasil fotorealistik dan Nano Banana Pro untuk gaya visual yang lebih artistik.",
  },
  {
    question: "Apakah agen bisa memilih model yang tepat secara otomatis?",
    answer:
      "Bisa. Setelah skill AnyCap terpasang, agen memahami karakter tiap model dan dapat memilih model yang paling sesuai berdasarkan prompt dan gaya output yang diinginkan.",
  },
  {
    question: "Berapa biaya generasi gambar?",
    answer:
      "AnyCap menggunakan skema bayar sesuai pemakaian tanpa biaya bulanan. Pengguna baru mendapat kredit gratis $5. Biaya berbeda antar model, lihat halaman pricing untuk tarif per generasi.",
  },
] as const;

const copyByLocale = {
  en: {
    breadcrumbHome: "Home",
    breadcrumbGuides: "Guides",
    breadcrumbCurrent: "Add Image Generation to AI Agent",
    eyebrow: "Guides",
    heroTitle: "How to add image generation to an AI agent",
    heroIntro:
      "AI agents like Claude Code, Cursor, and Codex are powerful at writing and reasoning about code - but they cannot generate images on their own. AnyCap bridges that gap. This guide walks through adding image generation to any AI agent in under five minutes, from installing the skill to generating your first image with models like Seedream 5 and Nano Banana Pro.",
    neededTitle: "What you need",
    neededItems: [
      "An AI agent that can run shell commands (Claude Code, Cursor, Codex, etc.)",
      "Node.js 18+ (for skills.sh and npm install)",
      "A browser for the one-time login flow",
    ],
    callout:
      "These steps work for any agent that can execute shell commands. The examples use Claude Code, but the same commands work in Cursor, Codex, and other agents.",
    step1Title: "Install the AnyCap skill",
    step1ForClaude: "# For Claude Code",
    step1ForCursor: "# For Cursor",
    step1Body:
      "This places the AnyCap SKILL.md into your agent's skills directory. The skill file teaches the agent which image models are available and how to call them.",
    step2Title: "Install the AnyCap CLI",
    step2Prefix: "Or: ",
    step3Title: "Log in",
    step3Body:
      "Opens a browser for authentication. One login covers every capability - image generation, video, music, and understanding.",
    step4Title: "Discover available image models",
    step4Body:
      "Lists all available image models. Current options include Seedream 5, Seedream 4.5, Nano Banana Pro, and Nano Banana 2 - each with different strengths for photorealism, artistic styles, and speed.",
    step5Title: "Generate your first image",
    step5Body:
      "The CLI returns the generated image URL. Your agent can download, display, or use the image in subsequent steps.",
    step6Title: "Use image generation in agent workflows",
    step6Intro:
      "Once the skill is installed and the CLI is authenticated, your agent can generate images in response to natural-language prompts. Tell your agent:",
    step6AskLabel: "# Ask your agent naturally",
    step6AskPrompt: "\"Generate a hero image for the landing page\"",
    step6ModelLabel: "# Or specify a model",
    step6ModelPrompt: "\"Create a logo concept using nano-banana-pro\"",
    step6Body:
      "The agent reads the skill file, selects an appropriate model, and calls AnyCap CLI - no manual command construction needed.",
    faqTitle: "FAQ",
    ctaClaude: "AnyCap for Claude Code",
    ctaImage: "Image Generation",
    ctaStart: "Get Started",
  },
  id: {
    breadcrumbHome: "Beranda",
    breadcrumbGuides: "Panduan",
    breadcrumbCurrent: "Tambah generasi gambar ke agen AI",
    eyebrow: "Panduan",
    heroTitle: "Cara menambahkan generasi gambar ke agen AI",
    heroIntro:
      "Agen AI seperti Claude Code, Cursor, dan Codex sangat kuat untuk menulis serta menalar kode, tetapi belum bisa membuat gambar sendiri. AnyCap menutup celah itu. Panduan ini menjelaskan langkah praktis menambahkan generasi gambar ke agen AI dalam waktu singkat, mulai dari instal skill sampai membuat gambar pertama dengan model seperti Seedream 5 dan Nano Banana Pro.",
    neededTitle: "Yang perlu disiapkan",
    neededItems: [
      "Agen AI yang bisa menjalankan perintah shell (Claude Code, Cursor, Codex, dan sejenisnya)",
      "Node.js 18+ (untuk skills.sh dan instalasi npm)",
      "Browser untuk alur login satu kali",
    ],
    callout:
      "Langkah ini berlaku untuk semua agen yang bisa mengeksekusi perintah shell. Contoh di sini memakai Claude Code, tetapi command yang sama juga bisa dipakai di Cursor, Codex, dan agen lainnya.",
    step1Title: "Instal skill AnyCap",
    step1ForClaude: "# Untuk Claude Code",
    step1ForCursor: "# Untuk Cursor",
    step1Body:
      "Perintah ini menaruh file SKILL.md AnyCap ke direktori skill agen Anda. Dari file ini agen belajar model gambar apa yang tersedia dan cara memanggilnya.",
    step2Title: "Instal AnyCap CLI",
    step2Prefix: "Atau: ",
    step3Title: "Login",
    step3Body:
      "Perintah ini membuka browser untuk autentikasi. Satu kali login sudah mencakup semua kapabilitas, termasuk generasi gambar, video, musik, dan understanding.",
    step4Title: "Lihat model gambar yang tersedia",
    step4Body:
      "Perintah ini menampilkan daftar model gambar yang tersedia. Saat ini ada Seedream 5, Seedream 4.5, Nano Banana Pro, dan Nano Banana 2, masing-masing dengan keunggulan berbeda untuk fotorealisme, gaya artistik, dan kecepatan.",
    step5Title: "Buat gambar pertama Anda",
    step5Body:
      "CLI akan mengembalikan URL gambar hasil generasi. Agen Anda bisa mengunduh, menampilkan, atau memakai gambar tersebut di langkah berikutnya.",
    step6Title: "Pakai generasi gambar dalam workflow agen",
    step6Intro:
      "Setelah skill terpasang dan CLI terautentikasi, agen Anda bisa membuat gambar dari instruksi bahasa alami. Contohnya:",
    step6AskLabel: "# Minta langsung ke agen",
    step6AskPrompt: "\"Buat hero image untuk landing page\"",
    step6ModelLabel: "# Atau tentukan model",
    step6ModelPrompt: "\"Buat konsep logo dengan nano-banana-pro\"",
    step6Body:
      "Agen akan membaca skill, memilih model yang sesuai, lalu memanggil AnyCap CLI tanpa Anda menyusun command secara manual.",
    faqTitle: "FAQ",
    ctaClaude: "AnyCap untuk Claude Code",
    ctaImage: "Generasi Gambar",
    ctaStart: "Mulai",
  },
} as const;

export default async function HowToAddImageGenerationPage() {
  const locale = await getRequestLocale();
  const copy = locale === "id" ? copyByLocale.id : copyByLocale.en;
  const localizedFaqItems = locale === "id" ? idFaqItems : faqItems;
  const faqJsonLd = createFaqPageJsonLd(localizedFaqItems);

  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: copy.breadcrumbHome, href: "/" },
        { name: copy.breadcrumbGuides, href: "/guides", unlinkable: true },
        { name: copy.breadcrumbCurrent },
      ]} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(guideJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <article className="px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[1280px] py-12 md:py-20 lg:py-24">
          <FadeIn>
            <p className="text-[11px] text-[#6b7d3a] tracking-[0.8px] mb-4" style={mono}>{copy.eyebrow}</p>
            <h1
              className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(28px, 5vw, 60px)" }}
            >
              {copy.heroTitle}
            </h1>
            <p className="mt-6 max-w-[700px] text-base leading-7 text-[#4d5145] md:text-lg">
              {copy.heroIntro}
            </p>
          </FadeIn>

          <FadeIn className="mt-8">
            <EarlyAccessBanner />
          </FadeIn>

          <div className="mt-16 md:mt-24"><hr className="border-t border-[#d4dbb8]" /></div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="text-lg md:text-xl text-[#1c1f17] mb-6" style={{ ...pixel }}>{copy.neededTitle}</h2>
              <ul className="space-y-3 max-w-[700px]">
                {copy.neededItems.map((item) => (
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
                {copy.callout}
              </p>
            </FadeIn>

            {/* Step 1 */}
            <FadeIn>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 flex items-center justify-center text-[13px] font-bold text-[#f4f5f0] bg-[#6b7d3a]" style={mono}>1</span>
                <h2 className="text-lg text-[#1c1f17]" style={{ ...pixel }}>{copy.step1Title}</h2>
              </div>
              <div className="bg-[#1c1f17] px-5 py-4">
                <p className="text-[13px] text-[#6b7d3a] mb-1" style={mono}>{copy.step1ForClaude}</p>
                <p className="text-[13px] text-[#d4e0a4] mb-3" style={mono}>npx -y skills add anycap-ai/anycap -a claude-code -y</p>
                <p className="text-[13px] text-[#6b7d3a] mb-1" style={mono}>{copy.step1ForCursor}</p>
                <p className="text-[13px] text-[#d4e0a4]" style={mono}>npx -y skills add anycap-ai/anycap -a cursor -y</p>
              </div>
              <p className="mt-3 text-sm text-[#4d5145]">{copy.step1Body}</p>
            </FadeIn>

            {/* Step 2 */}
            <FadeIn>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 flex items-center justify-center text-[13px] font-bold text-[#f4f5f0] bg-[#6b7d3a]" style={mono}>2</span>
                <h2 className="text-lg text-[#1c1f17]" style={{ ...pixel }}>{copy.step2Title}</h2>
              </div>
              <div className="bg-[#1c1f17] px-5 py-4 mb-3">
                <p className="text-[13px] text-[#d4e0a4]" style={mono}>curl -fsSL https://anycap.ai/install.sh | sh</p>
              </div>
              <p className="text-sm text-[#4d5145]">{copy.step2Prefix}<code className="text-[12px] text-[#6b7d3a]" style={mono}>npm install -g @anycap/cli</code></p>
            </FadeIn>

            {/* Step 3 */}
            <FadeIn>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 flex items-center justify-center text-[13px] font-bold text-[#f4f5f0] bg-[#6b7d3a]" style={mono}>3</span>
                <h2 className="text-lg text-[#1c1f17]" style={{ ...pixel }}>{copy.step3Title}</h2>
              </div>
              <div className="bg-[#1c1f17] px-5 py-4">
                <p className="text-[13px] text-[#d4e0a4]" style={mono}>anycap login</p>
              </div>
              <p className="mt-3 text-sm text-[#4d5145]">{copy.step3Body}</p>
            </FadeIn>

            {/* Step 4 */}
            <FadeIn>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 flex items-center justify-center text-[13px] font-bold text-[#f4f5f0] bg-[#6b7d3a]" style={mono}>4</span>
                <h2 className="text-lg text-[#1c1f17]" style={{ ...pixel }}>{copy.step4Title}</h2>
              </div>
              <div className="bg-[#1c1f17] px-5 py-4">
                <p className="text-[13px] text-[#d4e0a4]" style={mono}>anycap image models</p>
              </div>
              <p className="mt-3 text-sm text-[#4d5145]">{copy.step4Body}</p>
            </FadeIn>

            {/* Step 5 */}
            <FadeIn>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 flex items-center justify-center text-[13px] font-bold text-[#f4f5f0] bg-[#6b7d3a]" style={mono}>5</span>
                <h2 className="text-lg text-[#1c1f17]" style={{ ...pixel }}>{copy.step5Title}</h2>
              </div>
              <div className="bg-[#1c1f17] px-5 py-4">
                <p className="text-[13px] text-[#d4e0a4]" style={mono}>anycap image generate --model seedream-5 --prompt &quot;a product photo on white background&quot;</p>
              </div>
              <p className="mt-3 text-sm text-[#4d5145]">{copy.step5Body}</p>
            </FadeIn>

            {/* Step 6 */}
            <FadeIn>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 flex items-center justify-center text-[13px] font-bold text-[#f4f5f0] bg-[#6b7d3a]" style={mono}>6</span>
                <h2 className="text-lg text-[#1c1f17]" style={{ ...pixel }}>{copy.step6Title}</h2>
              </div>
              <p className="text-sm text-[#4d5145] leading-6 max-w-[700px]">
                {copy.step6Intro}
              </p>
              <div className="bg-[#1c1f17] px-5 py-4 mt-3">
                <p className="text-[13px] text-[#6b7d3a] mb-1" style={mono}>{copy.step6AskLabel}</p>
                <p className="text-[13px] text-[#d4e0a4] mb-3" style={mono}>{copy.step6AskPrompt}</p>
                <p className="text-[13px] text-[#6b7d3a] mb-1" style={mono}>{copy.step6ModelLabel}</p>
                <p className="text-[13px] text-[#d4e0a4]" style={mono}>{copy.step6ModelPrompt}</p>
              </div>
              <p className="mt-3 text-sm text-[#4d5145]">{copy.step6Body}</p>
            </FadeIn>
          </div>

          <div className="mt-16 md:mt-24"><hr className="border-t border-[#d4dbb8]" /></div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="text-lg md:text-xl text-[#1c1f17] mb-8" style={{ ...pixel }}>{copy.faqTitle}</h2>
              <div className="max-w-[860px] space-y-4">
                {localizedFaqItems.map((item) => (
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
                <Link href="/for/claude-code" className="inline-block px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#f4f5f0] bg-[#6b7d3a] hover:bg-[#1c1f17] transition-colors rounded-lg" style={mono}>{copy.ctaClaude}</Link>
                <Link href="/capabilities/image-generation" className="inline-block px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] border border-[#1c1f17] hover:bg-[#1c1f17] hover:text-[#f4f5f0] transition-colors rounded-lg" style={mono}>{copy.ctaImage}</Link>
                <Link href="/start" className="inline-block px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] border border-[#1c1f17] hover:bg-[#1c1f17] hover:text-[#f4f5f0] transition-colors rounded-lg" style={mono}>{copy.ctaStart}</Link>
              </div>
            </section>
          </FadeIn>
        </div>
      </article>
    </>
  );
}
