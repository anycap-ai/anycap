import type { Metadata } from "next";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { EarlyAccessBanner } from "@/components/landing/EarlyAccessBanner";
import { FadeIn } from "@/components/ui/FadeIn";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { ArticleByline } from "@/components/seo/ArticleByline";
import { createLocalizedMetadataForPath } from "@/lib/localized-metadata";
import { getRequestLocale } from "@/lib/request-locale";
import { defaultLocale, type SiteLocale } from "@/lib/site";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

const PATH = "/guides/what-is-agent-harness";

type PageContent = {
  eyebrow: string;
  title: [string, string];
  intro: string;
  comparisonTitle: string;
  comparisonHeaders: [string, string, string];
  comparisonRows: {
    layer: string;
    role: string;
    example: string;
    accent?: boolean;
  }[];
  fitTitle: string;
  fitBody: string[];
  ctas: {
    capabilityRuntime: string;
    workspaceContext: string;
    comparePage: string;
  };
  breadcrumbLabel: string;
  bylineAuthor?: string;
};

const contentByLocale: Record<"en" | "pt-br", PageContent> = {
  en: {
    eyebrow: "Guide",
    title: ["What is an", "agent harness?"],
    intro:
      "An agent harness is the execution layer around an AI model that turns reasoning into real actions. It provides access to files, terminals, tools, browser actions, permission boundaries, and runtime policies that control what is allowed during a task. The model may decide what should happen next, but the harness decides what can actually happen in production. This distinction is critical: planning quality depends on the model, while execution safety, observability, and repeatability depend on the harness. In modern agent products, harness design is often the difference between a demo that works once and a workflow that teams can run every day without fragile manual glue. It is also where teams enforce governance and debugging standards so agent behavior remains auditable as task complexity grows. In short, the harness is the contract between model intent and trustworthy execution.",
    comparisonTitle: "Agent model vs agent harness",
    comparisonHeaders: ["Layer", "Role", "Example"],
    comparisonRows: [
      {
        layer: "Model",
        role: "Reasoning, planning, language generation",
        example:
          "The LLM decides whether to read a file, ask a question, or call a capability",
      },
      {
        layer: "Harness",
        role: "Execution surface and safety boundaries",
        example:
          "Files, shell, browser, permissions, tool contracts, and workflow policies",
      },
      {
        layer: "Capability runtime",
        role: "Curated capability layer the harness can expose",
        example:
          "AnyCap provides image generation, video generation, image read, and video analysis through one interface",
        accent: true,
      },
    ],
    fitTitle: "Where AnyCap fits",
    fitBody: [
      "AnyCap is not the model itself and it is not the full harness. It sits inside the harness as a capability runtime that supplies the actions the model cannot perform on its own. That means the harness can expose multimodal operations through a stable contract instead of wiring a different provider integration for every new task. In practical terms, the agent keeps its familiar reasoning environment while gaining a consistent path to image generation, video generation, media understanding, retrieval, storage, and publishing when those actions are needed.",
      "This distinction matters for architecture decisions. The harness is responsible for lifecycle control, permissions, tool routing, and execution policy. AnyCap is responsible for packaging capabilities so those policies can be applied consistently across multimodal actions. Together, they reduce integration drift: teams keep one CLI surface, one authentication flow, and one operational model across different agent shells. That makes debugging clearer, onboarding faster, and capability upgrades less expensive over time.",
    ],
    ctas: {
      capabilityRuntime: "Capability Runtime",
      workspaceContext: "Workspace Context",
      comparePage: "Compare Page",
    },
    breadcrumbLabel: "What is Agent Harness?",
  },
  "pt-br": {
    eyebrow: "Guia",
    title: ["O que e um", "agent harness?"],
    intro:
      "Um agent harness e a camada de execucao ao redor de um modelo de IA que transforma raciocinio em acao real. Ele oferece acesso a arquivos, terminais, ferramentas, acoes no navegador, limites de permissao e politicas de runtime que controlam o que pode ser feito durante a tarefa. O modelo decide o que deveria acontecer; o harness define o que realmente pode acontecer em producao. Essa diferenca e central: a qualidade do plano vem do modelo, mas seguranca, observabilidade e repetibilidade da execucao vem do harness. Em produtos modernos de agentes, o desenho do harness costuma separar um demo pontual de um workflow confiavel para uso diario.",
    comparisonTitle: "Modelo do agente vs agent harness",
    comparisonHeaders: ["Camada", "Papel", "Exemplo"],
    comparisonRows: [
      {
        layer: "Modelo",
        role: "Raciocinio, planejamento e geracao de linguagem",
        example:
          "O LLM decide se deve ler um arquivo, fazer uma pergunta ou chamar uma capability",
      },
      {
        layer: "Harness",
        role: "Superficie de execucao e limites de seguranca",
        example:
          "Arquivos, shell, navegador, permissoes, contratos de ferramentas e politicas de workflow",
      },
      {
        layer: "Runtime de capabilities",
        role: "Camada curada de capabilities que o harness pode expor",
        example:
          "AnyCap fornece geracao de imagem, geracao de video, leitura de imagem e analise de video por uma unica interface",
        accent: true,
      },
    ],
    fitTitle: "Onde o AnyCap entra",
    fitBody: [
      "O AnyCap nao e o proprio modelo e tambem nao e o harness completo. Ele entra dentro do harness como runtime de capabilities, fornecendo as acoes que o modelo sozinho nao executa. Assim, o harness expoe operacoes multimodais por um contrato estavel, em vez de montar uma integracao diferente para cada provedor e cada tarefa. Na pratica, o agente continua no ambiente de raciocinio que o time ja usa, mas ganha um caminho consistente para geracao de imagem, geracao de video, entendimento de midia, retrieval, armazenamento e publicacao.",
      "Essa separacao melhora decisoes de arquitetura. O harness cuida de ciclo de vida, permissoes, roteamento de ferramentas e politicas de execucao. O AnyCap cuida de empacotar capabilities para que essas politicas sejam aplicadas de forma uniforme entre acoes multimodais. Juntos, os dois reduzem deriva de integracao: uma CLI, um fluxo de autenticacao e um modelo operacional unico entre diferentes shells de agente. Isso acelera onboarding, simplifica depuracao e reduz custo de evolucao do stack.",
    ],
    ctas: {
      capabilityRuntime: "Runtime de Capabilities",
      workspaceContext: "Contexto do Workspace",
      comparePage: "Pagina de Comparacao",
    },
    breadcrumbLabel: "O que e Agent Harness?",
  },
};

function getPageMetadata(locale: SiteLocale): Metadata {
  const isPtBr = locale === "pt-br";
  return createLocalizedMetadataForPath(locale, PATH, {
    title: isPtBr
      ? "O que e um agent harness? A camada de runtime ao redor do agente"
      : "What is an agent harness? The runtime layer around the agent",
    description: isPtBr
      ? "Um agent harness e a camada de execucao que da a um agente de IA ferramentas, estado do workspace, permissoes e controles de runtime. Veja como ele difere do modelo em si e onde o AnyCap entra nessa pilha."
      : "An agent harness is the surrounding execution layer that gives an AI agent tools, workspace state, permissions, and runtime controls. Learn how it differs from the model itself and where AnyCap fits in the stack.",
  });
}

export const metadata: Metadata = getPageMetadata(defaultLocale);

export default async function WhatIsAgentHarnessPage() {
  const locale = await getRequestLocale();
  const content = contentByLocale[locale === "pt-br" ? "pt-br" : "en"];
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Guides", href: "/guides", unlinkable: true },
          { name: content.breadcrumbLabel },
        ]}
      />
      <article className="px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[1280px] py-12 md:py-20 lg:py-24">
          <FadeIn>
            <p className="text-[11px] text-[#6b7d3a] tracking-[0.8px] mb-4" style={mono}>
              {content.eyebrow}
            </p>
            <ArticleByline className="mb-3" />
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
              <h2 className="text-lg md:text-xl text-[#1c1f17] mb-8" style={{ ...pixel }}>
                {content.comparisonTitle}
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[#d4dbb8]">
                      <th className="pb-3 pr-6 text-[11px] text-[#5a5e52] tracking-[0.5px]" style={mono}>
                        {content.comparisonHeaders[0]}
                      </th>
                      <th className="pb-3 pr-6 text-[11px] text-[#5a5e52] tracking-[0.5px]" style={mono}>
                        {content.comparisonHeaders[1]}
                      </th>
                      <th className="pb-3 text-[11px] text-[#5a5e52] tracking-[0.5px]" style={mono}>
                        {content.comparisonHeaders[2]}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {content.comparisonRows.map((row) => (
                      <tr key={row.layer} className="border-b border-[#d4dbb8]/50">
                        <td
                          className={`py-4 pr-6 text-sm font-medium align-top ${
                            row.accent ? "text-[#6b7d3a]" : "text-[#1c1f17]"
                          }`}
                        >
                          {row.layer}
                        </td>
                        <td className="py-4 pr-6 text-sm text-[#4d5145] leading-6 align-top">
                          {row.role}
                        </td>
                        <td className="py-4 text-sm text-[#4d5145] leading-6 align-top">
                          {row.example}
                        </td>
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
              <h2 className="text-lg md:text-xl text-[#1c1f17] mb-6" style={{ ...pixel }}>
                {content.fitTitle}
              </h2>
              <div className="space-y-6 max-w-[780px]">
                {content.fitBody.map((paragraph) => (
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
            <section className="mt-16 md:mt-24 mb-8">
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/glossary/agent-capability-runtime"
                  className="inline-block px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#f4f5f0] bg-[#6b7d3a] hover:bg-[#1c1f17] transition-colors rounded-lg"
                  style={mono}
                >
                  {content.ctas.capabilityRuntime}
                </Link>
                <Link
                  href="/guides/workspace-context-engineering"
                  className="inline-block px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] border border-[#1c1f17] hover:bg-[#1c1f17] hover:text-[#f4f5f0] transition-colors rounded-lg"
                  style={mono}
                >
                  {content.ctas.workspaceContext}
                </Link>
                <Link
                  href="/compare/anycap-vs-openai-agent-builder"
                  className="inline-block px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] border border-[#1c1f17] hover:bg-[#1c1f17] hover:text-[#f4f5f0] transition-colors rounded-lg"
                  style={mono}
                >
                  {content.ctas.comparePage}
                </Link>
              </div>
            </section>
          </FadeIn>
        </div>
      </article>
    </>
  );
}
