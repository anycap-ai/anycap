import type { Metadata } from "next";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { EarlyAccessBanner } from "@/components/landing/EarlyAccessBanner";
import { FadeIn } from "@/components/ui/FadeIn";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { ArticleByline } from "@/components/seo/ArticleByline";
import { createLocalizedMetadataForPath } from "@/lib/localized-metadata";
import { getRequestLocale } from "@/lib/request-locale";
import { createTechArticleJsonLd } from "@/lib/schema";
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

const contentByLocale: Record<SiteLocale, PageContent> = {
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
  id: {
    eyebrow: "Panduan",
    title: ["Apa itu", "agent harness?"],
    intro:
      "Agent harness adalah lapisan eksekusi di sekitar model AI yang mengubah penalaran menjadi aksi nyata. Harness memberi akses ke file, terminal, tools, aksi browser, batas izin, dan kebijakan runtime yang menentukan apa yang boleh dilakukan selama tugas berjalan. Model bisa memutuskan langkah berikutnya, tetapi harness menentukan apa yang benar-benar bisa dieksekusi di production. Perbedaan ini krusial: kualitas rencana bergantung pada model, sedangkan keamanan eksekusi, observability, dan repeatability bergantung pada harness. Di produk agen modern, desain harness sering menjadi pembeda antara demo sekali jalan dan workflow yang bisa dipakai tim setiap hari tanpa glue code rapuh.",
    comparisonTitle: "Model agen vs agent harness",
    comparisonHeaders: ["Layer", "Peran", "Contoh"],
    comparisonRows: [
      {
        layer: "Model",
        role: "Penalaran, perencanaan, dan generasi bahasa",
        example:
          "LLM memutuskan apakah perlu membaca file, bertanya, atau memanggil capability",
      },
      {
        layer: "Harness",
        role: "Permukaan eksekusi dan batas keamanan",
        example:
          "File, shell, browser, permission, kontrak tool, dan kebijakan workflow",
      },
      {
        layer: "Capability runtime",
        role: "Lapisan capability terkurasi yang bisa diekspos harness",
        example:
          "AnyCap menyediakan image generation, video generation, image read, dan video analysis lewat satu interface",
        accent: true,
      },
    ],
    fitTitle: "Posisi AnyCap",
    fitBody: [
      "AnyCap bukan model itu sendiri dan bukan harness penuh. AnyCap berada di dalam harness sebagai capability runtime yang menyediakan aksi yang tidak bisa dijalankan model sendirian. Dengan begitu, harness bisa mengekspos operasi multimodal melalui kontrak yang stabil, bukan merangkai integrasi provider berbeda untuk setiap tugas baru. Secara praktis, agen tetap memakai lingkungan penalaran yang familiar, tetapi mendapat jalur konsisten ke image generation, video generation, media understanding, retrieval, storage, dan publishing saat dibutuhkan.",
      "Pemisahan ini penting untuk keputusan arsitektur. Harness bertanggung jawab atas lifecycle control, permission, routing tool, dan kebijakan eksekusi. AnyCap bertanggung jawab mengemas capabilities agar kebijakan itu bisa diterapkan konsisten lintas aksi multimodal. Kombinasi keduanya mengurangi integration drift: tim mempertahankan satu permukaan CLI, satu alur autentikasi, dan satu model operasional di berbagai agent shell. Dampaknya adalah onboarding lebih cepat, debugging lebih jelas, dan biaya upgrade capability lebih rendah dari waktu ke waktu.",
    ],
    ctas: {
      capabilityRuntime: "Capability Runtime",
      workspaceContext: "Konteks Workspace",
      comparePage: "Halaman Perbandingan",
    },
    breadcrumbLabel: "Apa itu Agent Harness?",
  },
  de: {
    eyebrow: "Anleitung",
    title: ["Was ist ein", "Agent-Harness?"],
    intro:
      "Ein Agent-Harness ist die Ausführungsschicht um ein KI-Modell, die Reasoning in echte Aktionen verwandelt. Er bietet Zugriff auf Dateien, Terminals, Tools, Browser-Aktionen, Berechtigungsgrenzen und Runtime-Richtlinien, die steuern, was während einer Aufgabe erlaubt ist. Das Modell entscheidet vielleicht, was als Nächstes passieren soll, aber der Harness entscheidet, was tatsächlich in der Produktion passieren kann. Diese Unterscheidung ist entscheidend: Planungsqualität hängt vom Modell ab, während Ausführungssicherheit, Observability und Reproduzierbarkeit vom Harness abhängen. In modernen Agentenprodukten ist das Harness-Design oft der Unterschied zwischen einer Demo, die einmal funktioniert, und einem Workflow, den Teams täglich ohne fragilen manuellen Glue-Code laufen lassen können. Hier setzen Teams auch Governance- und Debugging-Standards durch, damit Agentenverhalten auditierbar bleibt, während die Aufgabenkomplexität wächst. Kurz: Der Harness ist der Vertrag zwischen Modell-Intent und vertrauenswürdiger Ausführung.",
    comparisonTitle: "Agentenmodell vs. Agent-Harness",
    comparisonHeaders: ["Schicht", "Rolle", "Beispiel"],
    comparisonRows: [
      {
        layer: "Modell",
        role: "Reasoning, Planung, Sprachgenerierung",
        example:
          "Das LLM entscheidet, ob es eine Datei lesen, eine Frage stellen oder eine Capability aufrufen soll",
      },
      {
        layer: "Harness",
        role: "Ausführungsoberfläche und Sicherheitsgrenzen",
        example:
          "Dateien, Shell, Browser, Berechtigungen, Tool-Verträge und Workflow-Richtlinien",
      },
      {
        layer: "Capability-Runtime",
        role: "Kuratierte Capability-Schicht, die der Harness bereitstellen kann",
        example:
          "AnyCap bietet Bildgenerierung, Videogenerierung, Bildverständnis und Videoanalyse über eine Schnittstelle",
        accent: true,
      },
    ],
    fitTitle: "Wo AnyCap einzuordnen ist",
    fitBody: [
      "AnyCap ist nicht das Modell selbst und nicht der vollständige Harness. Es sitzt im Harness als Capability-Runtime, die die Aktionen liefert, die das Modell allein nicht ausführen kann. Damit kann der Harness multimodale Operationen über einen stabilen Vertrag bereitstellen, statt für jede neue Aufgabe eine andere Provider-Integration zu verkabeln. Praktisch bleibt der Agent in seiner gewohnten Reasoning-Umgebung und gewinnt einen konsistenten Pfad zu Bildgenerierung, Videogenerierung, Medienverständnis, Retrieval, Storage und Publishing, wenn diese Aktionen benötigt werden.",
      "Diese Unterscheidung ist wichtig für Architekturentscheidungen. Der Harness ist verantwortlich für Lifecycle-Kontrolle, Berechtigungen, Tool-Routing und Ausführungsrichtlinien. AnyCap ist verantwortlich, Capabilities so zu verpacken, dass diese Richtlinien konsistent über multimodale Aktionen angewendet werden können. Zusammen reduzieren sie Integrationsdrift: Teams behalten eine CLI-Oberfläche, einen Authentifizierungsfluss und ein Betriebsmodell über verschiedene Agent-Shells. Das macht Debugging klarer, Onboarding schneller und Capability-Upgrades langfristig günstiger.",
    ],
    ctas: {
      capabilityRuntime: "Capability-Runtime",
      workspaceContext: "Workspace-Kontext",
      comparePage: "Vergleichsseite",
    },
    breadcrumbLabel: "Was ist ein Agent-Harness?",
  },
};

function getPageMetadata(locale: SiteLocale): Metadata {
  if (locale === "pt-br") {
    return createLocalizedMetadataForPath(locale, PATH, {
      title: "O que e um agent harness? A camada de runtime ao redor do agente",
      description:
        "Um agent harness e a camada de execucao que da a um agente de IA ferramentas, estado do workspace, permissoes e controles de runtime. Veja como ele difere do modelo em si e onde o AnyCap entra nessa pilha.",
    });
  }

  if (locale === "id") {
    return createLocalizedMetadataForPath(locale, PATH, {
      title: "Apa itu agent harness? Lapisan runtime di sekitar agen AI",
      description:
        "Agent harness adalah lapisan eksekusi yang memberi agen AI akses ke tool, status workspace, permission, dan kontrol runtime. Pelajari bedanya dengan model itu sendiri serta posisi AnyCap di dalam stack ini.",
    });
  }

  if (locale === "de") {
    return createLocalizedMetadataForPath(locale, PATH, {
      title: "Was ist ein Agent-Harness? Die Runtime-Schicht um den Agenten",
      description:
        "Ein Agent-Harness ist die umgebende Ausführungsschicht, die einem KI-Agenten Tools, Workspace-Status, Berechtigungen und Runtime-Kontrollen gibt. Erfahren Sie, wie er sich vom Modell unterscheidet und wo AnyCap im Stack einzuordnen ist.",
    });
  }

  return createLocalizedMetadataForPath(locale, PATH, {
    title: "What is an agent harness? The runtime layer around the agent",
    description:
      "An agent harness is the surrounding execution layer that gives an AI agent tools, workspace state, permissions, and runtime controls. Learn how it differs from the model itself and where AnyCap fits in the stack.",
  });
}

export const metadata: Metadata = getPageMetadata(defaultLocale);

export default async function WhatIsAgentHarnessPage() {
  const locale = await getRequestLocale();
  const content = contentByLocale[locale] ?? contentByLocale.en;
  const articleJsonLd = createTechArticleJsonLd({
    headline: content.title.join(" "),
    description: content.intro,
    path: PATH,
    locale,
    about: ["AI agents", "agent harness", "capability runtime"],
    keywords: ["agent harness", "AI agent runtime", "capability runtime"],
  });

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Guides", href: "/guides", unlinkable: true },
          { name: content.breadcrumbLabel },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
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
                  href="/glossary/agent-harness"
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
