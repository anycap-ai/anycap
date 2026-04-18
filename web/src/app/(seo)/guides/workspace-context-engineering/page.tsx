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

const PATH = "/guides/workspace-context-engineering";

type PageContent = {
  eyebrow: string;
  title: [string, string];
  intro: string;
  contextTitle: string;
  contextCards: { title: string; body: string }[];
  routingTitle: string;
  routingBody: string[];
  ctas: {
    contextEngineering: string;
    imageUnderstanding: string;
    videoAnalysis: string;
  };
  breadcrumbLabel: string;
};

const contentByLocale: Record<SiteLocale, PageContent> = {
  en: {
    eyebrow: "Guide",
    title: ["Workspace context", "engineering"],
    intro:
      "In real developer agents, context is not just prompt text. The workspace includes files, terminals, prior edits, tool permissions, and project rules. That context determines whether the agent should read code, run a command, inspect an image, or call a multimodal capability through AnyCap.",
    contextTitle: "What counts as workspace context",
    contextCards: [
      {
        title: "Project files",
        body: "Source files, docs, configs, and generated artifacts tell the agent what kind of task it is in.",
      },
      {
        title: "Execution state",
        body: "Open terminals, running processes, and prior commands change what is safe and useful to do next.",
      },
      {
        title: "Tool affordances",
        body: "Available tools and permissions shape whether the agent can read, edit, browse, or invoke capabilities.",
      },
      {
        title: "Task history",
        body: "Previous decisions and feedback help the agent avoid repetition and pick a better next action.",
      },
    ],
    routingTitle: "Why this matters for capability routing",
    routingBody: [
      "If the workspace shows a screenshot, a design review note, and an existing image asset, the agent should probably call an image read or editing capability. If the task history shows the team is preparing a product launch, an image generation or video generation capability may be the right next step.",
      "AnyCap helps reduce routing complexity because multiple multimodal actions are exposed through one consistent runtime instead of many unrelated providers.",
    ],
    ctas: {
      contextEngineering: "Context Engineering",
      imageUnderstanding: "Image Understanding",
      videoAnalysis: "Video Analysis",
    },
    breadcrumbLabel: "Workspace Context Engineering",
  },
  "pt-br": {
    eyebrow: "Guia",
    title: ["Context engineering", "do workspace"],
    intro:
      "Em agentes de desenvolvimento reais, contexto nao e apenas texto no prompt. O workspace inclui arquivos, terminais, edicoes anteriores, permissoes de ferramentas e regras do projeto. Esse contexto determina se o agente deve ler codigo, rodar um comando, inspecionar uma imagem ou chamar uma capability multimodal via AnyCap.",
    contextTitle: "O que conta como contexto do workspace",
    contextCards: [
      {
        title: "Arquivos do projeto",
        body: "Arquivos-fonte, docs, configs e artefatos gerados dizem ao agente em que tipo de tarefa ele esta trabalhando.",
      },
      {
        title: "Estado de execucao",
        body: "Terminais abertos, processos em execucao e comandos anteriores mudam o que e seguro e util fazer em seguida.",
      },
      {
        title: "Capacidades das ferramentas",
        body: "Ferramentas disponiveis e permissoes definem se o agente pode ler, editar, navegar ou chamar capabilities.",
      },
      {
        title: "Historico da tarefa",
        body: "Decisoes anteriores e feedback ajudam o agente a evitar repeticao e escolher uma proxima acao melhor.",
      },
    ],
    routingTitle: "Por que isso importa para o roteamento de capabilities",
    routingBody: [
      "Se o workspace mostra um screenshot, uma nota de review de design e um asset de imagem existente, o agente provavelmente deve chamar uma capability de leitura ou edicao de imagem. Se o historico da tarefa mostra que a equipe esta preparando um lancamento, uma capability de geracao de imagem ou de video pode ser o proximo passo certo.",
      "O AnyCap ajuda a reduzir a complexidade de roteamento porque varias acoes multimodais ficam expostas por um runtime consistente, em vez de varios provedores desconectados.",
    ],
    ctas: {
      contextEngineering: "Context Engineering",
      imageUnderstanding: "Entendimento de Imagem",
      videoAnalysis: "Analise de Video",
    },
    breadcrumbLabel: "Context Engineering do Workspace",
  },
  id: {
    eyebrow: "Panduan",
    title: ["Rekayasa konteks", "workspace"],
    intro:
      "Dalam agen developer nyata, konteks bukan cuma teks prompt. Workspace mencakup file, terminal, edit sebelumnya, izin tool, dan aturan proyek. Konteks itu menentukan apakah agen harus membaca kode, menjalankan perintah, meninjau gambar, atau memanggil capability multimodal lewat AnyCap.",
    contextTitle: "Apa saja yang termasuk konteks workspace",
    contextCards: [
      {
        title: "File proyek",
        body: "File source, dokumentasi, konfigurasi, dan artefak hasil build memberi sinyal jenis tugas yang sedang dikerjakan agen.",
      },
      {
        title: "Status eksekusi",
        body: "Terminal terbuka, proses yang sedang berjalan, dan riwayat perintah mengubah tindakan berikutnya yang aman dan berguna.",
      },
      {
        title: "Kemampuan tool",
        body: "Tool dan izin yang tersedia menentukan apakah agen bisa membaca, mengedit, browsing, atau memanggil capabilities.",
      },
      {
        title: "Riwayat tugas",
        body: "Keputusan sebelumnya dan umpan balik membantu agen menghindari pengulangan dan memilih langkah berikutnya yang lebih tepat.",
      },
    ],
    routingTitle: "Kenapa ini penting untuk routing capability",
    routingBody: [
      "Jika workspace menampilkan screenshot, catatan review desain, dan aset gambar yang sudah ada, agen biasanya perlu memanggil capability baca atau edit gambar. Jika riwayat tugas menunjukkan tim sedang menyiapkan peluncuran produk, capability image generation atau video generation bisa jadi langkah berikutnya yang tepat.",
      "AnyCap membantu menurunkan kompleksitas routing karena banyak aksi multimodal diekspos lewat satu runtime yang konsisten, bukan banyak provider yang tidak saling terhubung.",
    ],
    ctas: {
      contextEngineering: "Context Engineering",
      imageUnderstanding: "Pemahaman Gambar",
      videoAnalysis: "Analisis Video",
    },
    breadcrumbLabel: "Rekayasa Konteks Workspace",
  },
  de: {
    eyebrow: "Anleitung",
    title: ["Workspace Context", "Engineering"],
    intro:
      "In echten Entwickler-Agenten ist Kontext nicht nur Prompt-Text. Der Workspace umfasst Dateien, Terminals, frühere Edits, Tool-Berechtigungen und Projektregeln. Dieser Kontext bestimmt, ob der Agent Code lesen, einen Befehl ausführen, ein Bild prüfen oder eine multimodale Capability über AnyCap aufrufen soll.",
    contextTitle: "Was als Workspace-Kontext zählt",
    contextCards: [
      {
        title: "Projektdateien",
        body: "Quelldateien, Docs, Configs und generierte Artefakte sagen dem Agenten, in welcher Art von Aufgabe er sich befindet.",
      },
      {
        title: "Ausführungsstatus",
        body: "Offene Terminals, laufende Prozesse und vorherige Befehle ändern, was als Nächstes sicher und nützlich ist.",
      },
      {
        title: "Tool-Affordances",
        body: "Verfügbare Tools und Berechtigungen bestimmen, ob der Agent lesen, bearbeiten, browsen oder Capabilities aufrufen kann.",
      },
      {
        title: "Aufgabenverlauf",
        body: "Vorherige Entscheidungen und Feedback helfen dem Agenten, Wiederholungen zu vermeiden und eine bessere nächste Aktion zu wählen.",
      },
    ],
    routingTitle: "Warum das für Capability-Routing wichtig ist",
    routingBody: [
      "Wenn der Workspace einen Screenshot, eine Design-Review-Notiz und ein vorhandenes Bild-Asset zeigt, sollte der Agent wahrscheinlich Bildverständnis oder eine Bildbearbeitungs-Capability aufrufen. Wenn der Aufgabenverlauf zeigt, dass das Team einen Produkt-Launch vorbereitet, kann eine Bildgenerierungs- oder Videogenerierungs-Capability der richtige nächste Schritt sein.",
      "AnyCap reduziert die Routing-Komplexität, weil mehrere multimodale Aktionen über eine konsistente Runtime statt vieler unverbundener Provider bereitgestellt werden.",
    ],
    ctas: {
      contextEngineering: "Context Engineering",
      imageUnderstanding: "Bildverständnis",
      videoAnalysis: "Videoanalyse",
    },
    breadcrumbLabel: "Workspace Context Engineering",
  },
};

function getPageMetadata(locale: SiteLocale): Metadata {
  if (locale === "pt-br") {
    return createLocalizedMetadataForPath(locale, PATH, {
      title:
        "Context engineering do workspace — como agentes usam arquivos, ferramentas e estado",
      description:
        "Context engineering do workspace explica como arquivos, terminais, definicoes de ferramentas e estado de execucao moldam o que um agente de IA decide fazer. Veja como isso afeta o roteamento de ferramentas e chamadas multimodais via AnyCap.",
    });
  }

  if (locale === "id") {
    return createLocalizedMetadataForPath(locale, PATH, {
      title:
        "Rekayasa konteks workspace - bagaimana agen memakai file, tool, dan status eksekusi",
      description:
        "Rekayasa konteks workspace menjelaskan bagaimana file, terminal, definisi tool, dan status eksekusi membentuk keputusan agen AI. Pelajari dampaknya pada routing tool dan pemanggilan capability multimodal lewat AnyCap.",
    });
  }

  if (locale === "de") {
    return createLocalizedMetadataForPath(locale, PATH, {
      title:
        "Workspace Context Engineering — Wie KI-Agenten Dateien, Tools und Status nutzen",
      description:
        "Workspace Context Engineering erklärt, wie Dateien, Terminals, Tool-Definitionen und Ausführungsstatus die Entscheidungen eines KI-Agenten prägen. Erfahren Sie, wie das Tool-Routing und multimodale Capability-Aufrufe über AnyCap beeinflusst.",
    });
  }

  return createLocalizedMetadataForPath(locale, PATH, {
    title: "Workspace context engineering — How agents use files, tools, and state",
    description:
      "Workspace context engineering explains how files, terminals, tool definitions, and execution state shape what an AI agent decides to do. Learn how it affects tool routing and multimodal capability calls through AnyCap.",
  });
}

export const metadata: Metadata = getPageMetadata(defaultLocale);

export default async function WorkspaceContextEngineeringPage() {
  const locale = await getRequestLocale();
  const content = contentByLocale[locale] ?? contentByLocale.en;
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
                {content.contextTitle}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 max-w-[980px]">
                {content.contextCards.map((card) => (
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
                {content.routingTitle}
              </h2>
              {content.routingBody.map((paragraph, index) => (
                <p
                  key={paragraph}
                  className={`max-w-[780px] text-base leading-7 text-[#4d5145] ${index === 0 ? "mb-6" : ""}`}
                >
                  {paragraph}
                </p>
              ))}
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24 mb-8">
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/guides/context-engineering-for-agents"
                  className="inline-block px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#f4f5f0] bg-[#6b7d3a] hover:bg-[#1c1f17] transition-colors rounded-lg"
                  style={mono}
                >
                  {content.ctas.contextEngineering}
                </Link>
                <Link
                  href="/capabilities/image-understanding"
                  className="inline-block px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] border border-[#1c1f17] hover:bg-[#1c1f17] hover:text-[#f4f5f0] transition-colors rounded-lg"
                  style={mono}
                >
                  {content.ctas.imageUnderstanding}
                </Link>
                <Link
                  href="/capabilities/video-analysis"
                  className="inline-block px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] border border-[#1c1f17] hover:bg-[#1c1f17] hover:text-[#f4f5f0] transition-colors rounded-lg"
                  style={mono}
                >
                  {content.ctas.videoAnalysis}
                </Link>
              </div>
            </section>
          </FadeIn>
        </div>
      </article>
    </>
  );
}
