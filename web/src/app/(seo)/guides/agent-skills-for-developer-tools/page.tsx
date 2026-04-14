import type { Metadata } from "next";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { EarlyAccessBanner } from "@/components/landing/EarlyAccessBanner";
import { FadeIn } from "@/components/ui/FadeIn";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { ArticleByline } from "@/components/seo/ArticleByline";
import { getSeoPageChrome } from "@/lib/seo/ia";
import { createLocalizedMetadataForPath } from "@/lib/localized-metadata";
import { getRequestLocale } from "@/lib/request-locale";
import { defaultLocale, type SiteLocale } from "@/lib/site";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

const PATH = "/guides/agent-skills-for-developer-tools";

const agentTargets = ["Claude Code", "Cursor", "Codex", "OpenCode", "OpenClaw"];

const pageChrome = getSeoPageChrome("/guides/agent-skills-for-developer-tools");

type PageContent = {
  eyebrow: string;
  title: [string, string];
  intro: string;
  whatTitle: string;
  whatBody: string[];
  fitTitle: string;
  fitCards: { title: string; body: string }[];
  patternTitle: string;
  installLabel: string;
  switchLabel: string;
  ctas: {
    install: string;
    claude: string;
    codex: string;
  };
};

const contentByLocale: Record<"en" | "pt-br", PageContent> = {
  en: {
    eyebrow: pageChrome?.eyebrow ?? "Guide",
    title: ["Agent skills", "for developer tools"],
    intro:
      "Agent skills are instruction files that teach an AI agent how to discover, install, authenticate, and invoke a capability. They matter because developer agents do not just need tools. They need a reliable description of how to use those tools inside the execution environment. AnyCap uses skills to distribute one capability runtime across Claude Code, Cursor, Codex, and similar products.",
    whatTitle: "What a skill actually does",
    whatBody: [
      "A skill is not only metadata. It gives the agent a working model of how a capability fits into its workflow. That includes installation steps, auth flow, command examples, and the situations where the agent should call the capability instead of staying in text.",
      "That is why skills are a strong distribution mechanism for AnyCap. The same runtime can be installed once, then described consistently to multiple agent products without rewriting the capability interface every time.",
    ],
    fitTitle: "Where skills fit",
    fitCards: [
      {
        title: "Discovery",
        body: "The agent learns that a capability exists and what outcomes it enables.",
      },
      {
        title: "Installation",
        body: "The skill explains how to install the runtime and how authentication works.",
      },
      {
        title: "Invocation",
        body: "The agent sees examples and usage patterns it can reuse during execution.",
      },
    ],
    patternTitle: "AnyCap distribution pattern",
    installLabel: "# Install through skills.sh",
    switchLabel: "# Or switch the agent target",
    ctas: {
      install: "Install AnyCap",
      claude: "For Claude Code",
      codex: "For Codex",
    },
  },
  "pt-br": {
    eyebrow: "Guia",
    title: ["Skills de agentes", "para ferramentas de desenvolvimento"],
    intro:
      "Skills de agentes sao arquivos de instrucoes que ensinam um agente de IA a descobrir, instalar, autenticar e invocar uma capability. Elas importam porque agentes de desenvolvimento nao precisam apenas de ferramentas. Eles precisam de uma descricao confiavel de como usar essas ferramentas dentro do ambiente de execucao. O AnyCap usa skills para distribuir um unico runtime de capabilities entre Claude Code, Cursor, Codex e produtos semelhantes.",
    whatTitle: "O que uma skill realmente faz",
    whatBody: [
      "Uma skill nao e apenas metadado. Ela da ao agente um modelo funcional de como uma capability entra no workflow. Isso inclui passos de instalacao, fluxo de autenticacao, exemplos de comando e os cenarios em que o agente deve chamar a capability em vez de ficar so no texto.",
      "E por isso que skills sao um mecanismo forte de distribuicao para o AnyCap. O mesmo runtime pode ser instalado uma vez e depois descrito de forma consistente para varios produtos de agente, sem reescrever a interface da capability toda vez.",
    ],
    fitTitle: "Onde as skills entram",
    fitCards: [
      {
        title: "Descoberta",
        body: "O agente aprende que a capability existe e que tipos de resultado ela viabiliza.",
      },
      {
        title: "Instalacao",
        body: "A skill explica como instalar o runtime e como a autenticacao funciona.",
      },
      {
        title: "Invocacao",
        body: "O agente ve exemplos e padroes de uso que pode reutilizar durante a execucao.",
      },
    ],
    patternTitle: "Padrao de distribuicao do AnyCap",
    installLabel: "# Instale via skills.sh",
    switchLabel: "# Ou troque o alvo do agente",
    ctas: {
      install: "Instalar AnyCap",
      claude: "Para Claude Code",
      codex: "Para Codex",
    },
  },
};

function getPageMetadata(locale: SiteLocale): Metadata {
  const isPtBr = locale === "pt-br";
  return createLocalizedMetadataForPath(locale, PATH, {
    title: isPtBr
      ? "Skills de agentes para ferramentas de desenvolvimento — como capabilities sao distribuidas"
      : "Agent skills for developer tools — How capabilities are distributed",
    description: isPtBr
      ? "Skills de agentes ensinam ferramentas como Claude Code, Cursor e Codex a descobrir e usar capabilities. Entenda como skill files funcionam, por que importam e como o AnyCap os usa para distribuir capabilities multimodais entre agentes de desenvolvimento."
      : "Agent skills teach tools like Claude Code, Cursor, and Codex how to discover and use capabilities. Learn how skill files work, why they matter, and how AnyCap uses them to distribute multimodal capabilities across developer agents.",
  });
}

export const metadata: Metadata = getPageMetadata(defaultLocale);

export default async function AgentSkillsForDeveloperToolsPage() {
  const locale = await getRequestLocale();
  const content = contentByLocale[locale === "pt-br" ? "pt-br" : "en"];
  return (
    <>
      <BreadcrumbJsonLd items={pageChrome?.breadcrumbItems} />
      <article className="px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[1280px] py-12 md:py-20 lg:py-24">
          <FadeIn>
            <p className="text-[11px] text-[#6b7d3a] tracking-[0.8px] mb-4" style={mono}>
              {content.eyebrow}
            </p>
            <ArticleByline className="mb-3" author={pageChrome?.authorLabel} />
            <h1
              className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(32px, 6vw, 72px)" }}
            >
              {content.title[0]}
              <br />
              {content.title[1]}
            </h1>
            <p className="mt-6 max-w-[760px] text-base leading-7 text-[#4d5145] md:text-lg">
              {content.intro}
            </p>
          </FadeIn>

          <FadeIn className="mt-8">
            <EarlyAccessBanner />
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="text-lg md:text-xl text-[#1c1f17] mb-6" style={{ ...pixel }}>
                {content.whatTitle}
              </h2>
              <div className="space-y-4 max-w-[780px]">
                {content.whatBody.map((paragraph) => (
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
              <h2 className="text-lg md:text-xl text-[#1c1f17] mb-8" style={{ ...pixel }}>
                {content.fitTitle}
              </h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {content.fitCards.map((card) => (
                  <div key={card.title} className="border border-[#d4dbb8] p-5">
                    <h3 className="text-[14px] font-bold text-[#1c1f17] mb-2" style={mono}>
                      {card.title}
                    </h3>
                    <p className="text-sm text-[#4d5145] leading-6">{card.body}</p>
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
              <h2 className="text-lg md:text-xl text-[#1c1f17] mb-6" style={{ ...pixel }}>
                {content.patternTitle}
              </h2>
              <div className="bg-[#1c1f17] px-6 py-5 md:px-8 md:py-6 max-w-[820px]">
                <p className="text-[13px] text-[#6b7d3a] mb-1" style={mono}>
                  {content.installLabel}
                </p>
                <p className="text-[13px] text-[#d4e0a4] mb-4" style={mono}>
                  npx -y skills add anycap-ai/anycap -a claude-code -y
                </p>
                <p className="text-[13px] text-[#6b7d3a] mb-1" style={mono}>
                  {content.switchLabel}
                </p>
                <p className="text-[13px] text-[#d4e0a4]" style={mono}>
                  npx -y skills add anycap-ai/anycap -a codex -y
                </p>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                {agentTargets.map((target) => (
                  <span
                    key={target}
                    className="border border-[#d4dbb8] px-4 py-2 text-[12px] text-[#1c1f17] tracking-[1px]"
                    style={mono}
                  >
                    {target}
                  </span>
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
                  href="/guides/install-anycap"
                  className="inline-block px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#f4f5f0] bg-[#6b7d3a] hover:bg-[#1c1f17] transition-colors rounded-lg"
                  style={mono}
                >
                  {content.ctas.install}
                </Link>
                <Link
                  href="/for/claude-code"
                  className="inline-block px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] border border-[#1c1f17] hover:bg-[#1c1f17] hover:text-[#f4f5f0] transition-colors rounded-lg"
                  style={mono}
                >
                  {content.ctas.claude}
                </Link>
                <Link
                  href="/for/codex"
                  className="inline-block px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] border border-[#1c1f17] hover:bg-[#1c1f17] hover:text-[#f4f5f0] transition-colors rounded-lg"
                  style={mono}
                >
                  {content.ctas.codex}
                </Link>
              </div>
            </section>
          </FadeIn>
        </div>
      </article>
    </>
  );
}
