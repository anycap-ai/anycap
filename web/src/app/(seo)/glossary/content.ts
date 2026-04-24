import type { Metadata } from "next";
import {
  getHubPageDefinition,
  type HubPageDefinition,
} from "@/lib/seo/hub-pages";
import { getLocaleConfig, getLocalizedRouteUrl, siteConfig, type SiteLocale } from "@/lib/site";

export const GLOSSARY_PATH = "/glossary";

type GlossaryHubPageData = HubPageDefinition & {
  breadcrumbItems: readonly { name: string; href: string }[];
};

type GlossaryEntryPageData = {
  metadata: {
    title: string;
    description: string;
    openGraphTitle: string;
    openGraphDescription: string;
  };
  breadcrumbItems: readonly { name: string; href: string }[];
  eyebrow: string;
  heroTitle: [string, string];
  intro: string;
  definitionJsonLd: Record<string, unknown>;
  whyTitle: string;
  whyBody: [string, string];
  relatedLinks: readonly { label: string; href: string; variant: "primary" | "secondary" }[];
};

const glossaryHubContentEn: GlossaryHubPageData = {
  ...getHubPageDefinition("en", "glossary"),
  breadcrumbItems: [
    { name: "Home", href: "/" },
    { name: "Glossary", href: GLOSSARY_PATH },
  ],
};

const glossaryHubContentPtBr: GlossaryHubPageData = {
  ...getHubPageDefinition("pt-br", "glossary"),
  breadcrumbItems: [
    { name: "Início", href: "/" },
    { name: "Glossário", href: GLOSSARY_PATH },
  ],
};

const glossaryHubContentDe: GlossaryHubPageData = {
  ...getHubPageDefinition("de", "glossary"),
  breadcrumbItems: [
    { name: "Startseite", href: "/" },
    { name: "Glossar", href: GLOSSARY_PATH },
  ],
};

const glossaryHubContentId: GlossaryHubPageData = {
  ...getHubPageDefinition("id", "glossary"),
  breadcrumbItems: [
    { name: "Beranda", href: "/" },
    { name: "Glosarium", href: GLOSSARY_PATH },
  ],
};

const contextEngineeringContentEn: GlossaryEntryPageData = {
  metadata: {
    title: "What is context engineering? How AI agents use context",
    description:
      "Context engineering shapes what an AI agent sees, remembers, and can do during execution. Learn how it affects capability calls and multimodal workflows.",
    openGraphTitle: "What is context engineering? How AI agents use context",
    openGraphDescription:
      "Learn what context engineering means for AI agents and how it affects capability calls, workspace behavior, and multimodal workflows.",
  },
  breadcrumbItems: [
    { name: "Home", href: "/" },
    { name: "Glossary", href: GLOSSARY_PATH },
    { name: "Context Engineering", href: "/glossary/context-engineering" },
  ],
  eyebrow: "Glossary",
  heroTitle: ["What is", "context engineering?"],
  intro:
    "Context engineering is the practice of shaping the information and action space an AI agent uses during live execution, not just during prompt drafting. It includes prompts, workspace files, tool definitions, runtime state, permission boundaries, prior steps, and operational constraints that influence decision quality. In production workflows, these signals determine whether an agent selects the right tool at the right time, asks for missing data, or continues reasoning in text. Strong context engineering reduces avoidable tool calls, lowers failure loops, and makes behavior more reproducible across runs. Without it, even a capable model can make poor execution choices because critical state is missing, ambiguous, or presented too late. This is why high-performing agent teams treat context design as core infrastructure rather than copywriting. It functions as execution architecture, not just communication style, especially in multimodal workflows with strict reliability goals.",
  definitionJsonLd: {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: "Context Engineering",
    description:
      "The practice of shaping the information, tools, constraints, and runtime state an AI agent uses during execution so it can make better decisions.",
    url: getLocalizedRouteUrl(siteConfig.defaultLocale, "/glossary/context-engineering"),
  },
  whyTitle: "Why it matters",
  whyBody: [
    "A capable agent needs more than a strong model. It needs the right context to understand what tools exist, which files are authoritative, what actions are allowed, and what success should look like for the current step. If those signals are weak, the agent may skip the right tool call, select the wrong capability, or trigger actions too early. Good context engineering improves reliability because it aligns model reasoning with execution reality.",
    "For AnyCap, context engineering directly affects capability invocation quality. It determines when an agent should call image generation, video generation, image read, or video analysis through the runtime, and when it should remain in text. Better context means fewer blind calls, cleaner multimodal routing, and more predictable outcomes for teams operating across agent environments.",
  ],
  relatedLinks: [
    { label: "Context Guide", href: "/guides/context-engineering-for-agents", variant: "primary" },
    { label: "Workspace Context", href: "/guides/workspace-context-engineering", variant: "secondary" },
    { label: "Capability Runtime", href: "/glossary/agent-capability-runtime", variant: "secondary" },
  ],
};

const contextEngineeringContentPtBr: GlossaryEntryPageData = {
  metadata: {
    title: "O que é engenharia de contexto? Como agentes de IA usam contexto",
    description:
      "Engenharia de contexto é a prática de moldar o que um agente de IA vê, lembra e pode fazer durante a execução. Veja como isso afeta chamadas de capacidade, comportamento do workspace e fluxos multimodais.",
    openGraphTitle: "O que é engenharia de contexto? Como agentes de IA usam contexto",
    openGraphDescription:
      "Entenda o que engenharia de contexto significa para agentes de IA e como isso afeta chamadas de capacidade, comportamento do workspace e fluxos multimodais.",
  },
  breadcrumbItems: [
    { name: "Início", href: "/" },
    { name: "Glossário", href: GLOSSARY_PATH },
    { name: "Engenharia de Contexto", href: "/glossary/context-engineering" },
  ],
  eyebrow: "Glossário",
  heroTitle: ["O que é", "engenharia de contexto?"],
  intro:
    "Engenharia de contexto é a prática de moldar o espaço de informação e de ação que um agente de IA usa durante a execução real, e não apenas no texto do prompt inicial. Ela inclui prompts, arquivos do workspace, definições de ferramentas, estado do runtime, limites de permissão, passos anteriores e restrições operacionais que influenciam decisões. Em fluxos de produção, esses sinais determinam se o agente escolhe a ferramenta certa no momento certo, pede dados ausentes ou continua no raciocínio textual. Sem esse cuidado, até modelos fortes cometem erros de execução porque o estado crítico aparece incompleto, ambíguo ou tarde demais.",
  definitionJsonLd: {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: "Engenharia de Contexto",
    description:
      "A prática de moldar as informações, ferramentas, restrições e o estado de runtime que um agente de IA usa durante a execução para tomar decisões melhores.",
    url: getLocalizedRouteUrl(siteConfig.defaultLocale, "/glossary/context-engineering"),
  },
  whyTitle: "Por que isso importa",
  whyBody: [
    "Um agente capaz precisa de mais do que um modelo forte. Ele precisa do contexto correto para entender quais ferramentas existem, quais arquivos são fonte de verdade, quais ações estão autorizadas e qual resultado representa sucesso naquela etapa. Quando esses sinais estão fracos, o agente pode ignorar a ferramenta certa, escolher a capacidade errada ou agir cedo demais. Boa engenharia de contexto aumenta previsibilidade porque alinha raciocínio com realidade de execução.",
    "No AnyCap, engenharia de contexto impacta diretamente a qualidade da invocação de capacidades. Ela define quando o agente deve chamar geração de imagem, geração de vídeo, leitura de imagem ou análise de vídeo pelo runtime, e quando deve continuar no texto. Com contexto melhor, há menos chamadas cegas, roteamento multimodal mais limpo e resultados mais reproduzíveis entre diferentes ambientes de agente.",
  ],
  relatedLinks: [
    { label: "Guia de Contexto", href: "/guides/context-engineering-for-agents", variant: "primary" },
    { label: "Contexto do Workspace", href: "/guides/workspace-context-engineering", variant: "secondary" },
    { label: "Runtime de Capacidade", href: "/glossary/agent-capability-runtime", variant: "secondary" },
  ],
};

const agentHarnessContentEn: GlossaryEntryPageData = {
  metadata: {
    title: "Agent Harness — The Execution Layer for AI Agents",
    description:
      "An agent harness is the execution layer around an AI agent providing tools, files, and runtime controls. Learn where AnyCap fits as a capability runtime.",
    openGraphTitle: "What is an agent harness? The execution layer around AI agents",
    openGraphDescription:
      "Learn what an agent harness is and where AnyCap fits as a capability runtime inside the agent stack.",
  },
  breadcrumbItems: [
    { name: "Home", href: "/" },
    { name: "Glossary", href: GLOSSARY_PATH },
    { name: "Agent Harness", href: "/glossary/agent-harness" },
  ],
  eyebrow: "Glossary",
  heroTitle: ["What is an", "agent harness?"],
  intro:
    "An agent harness is the execution layer around the model that turns reasoning output into real operations. It provides files, terminals, browser control, tool routing, permission boundaries, and runtime rules that determine what actions are possible at each step. The model decides what should happen; the harness governs what can happen safely and predictably in the environment. This layer is critical for production reliability because it controls access, sequencing, and failure handling across tool calls. Without a well-defined harness, agent behavior becomes fragile, hard to audit, and difficult to reproduce across teams or runs.",
  definitionJsonLd: {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: "Agent Harness",
    description:
      "The execution environment around an AI agent that provides tools, files, permissions, runtime state, and policy controls.",
    url: getLocalizedRouteUrl(siteConfig.defaultLocale, "/glossary/agent-harness"),
  },
  whyTitle: "Why it matters",
  whyBody: [
    "The model decides what to do, but the harness determines what it can actually do in practice. That includes which tools are discoverable, which files are visible, what permissions are granted, and which action sequences are allowed in the execution environment. This separation is what makes policy, safety, and observability enforceable without degrading model flexibility.",
    "AnyCap fits inside that harness as a capability runtime. It gives the harness a clean, consistent way to expose multimodal actions through one interface, rather than stitching separate provider integrations into every workflow. The result is clearer operational boundaries, easier debugging, and faster reuse across different agent shells.",
  ],
  relatedLinks: [
    { label: "Harness Guide", href: "/guides/what-is-agent-harness", variant: "primary" },
    { label: "Capability Runtime", href: "/glossary/agent-capability-runtime", variant: "secondary" },
    { label: "Agent Builder Compare", href: "/compare/anycap-vs-openai-agent-builder", variant: "secondary" },
  ],
};

const agentHarnessContentPtBr: GlossaryEntryPageData = {
  metadata: {
    title: "O que é um agent harness? A camada de execução ao redor de agentes de IA",
    description:
      "Um agent harness é a camada de execução ao redor de um agente de IA que fornece ferramentas, arquivos, permissões e controles de runtime. Entenda como ele se relaciona com o modelo e onde o AnyCap entra como runtime de capacidades.",
    openGraphTitle: "O que é um agent harness? A camada de execução ao redor de agentes de IA",
    openGraphDescription:
      "Entenda o que é um agent harness e onde o AnyCap se encaixa como runtime de capacidades dentro da stack de agentes.",
  },
  breadcrumbItems: [
    { name: "Início", href: "/" },
    { name: "Glossário", href: GLOSSARY_PATH },
    { name: "Agent Harness", href: "/glossary/agent-harness" },
  ],
  eyebrow: "Glossário",
  heroTitle: ["O que é um", "agent harness?"],
  intro:
    "Um agent harness é a camada de execução ao redor do modelo que transforma raciocínio em operação real. Ele fornece arquivos, terminais, navegador, roteamento de ferramentas, limites de permissão e regras de runtime que definem o que é possível em cada etapa. O modelo decide o que deveria acontecer; o harness governa o que pode acontecer com segurança e previsibilidade no ambiente. Essa camada é essencial para confiabilidade em produção porque controla acesso, sequência e tratamento de falhas entre chamadas de ferramenta. Sem um harness bem definido, o comportamento do agente fica frágil, difícil de auditar e difícil de reproduzir entre equipes.",
  definitionJsonLd: {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: "Agent Harness",
    description:
      "O ambiente de execução ao redor de um agente de IA que fornece ferramentas, arquivos, permissões, estado de runtime e controles de política.",
    url: getLocalizedRouteUrl(siteConfig.defaultLocale, "/glossary/agent-harness"),
  },
  whyTitle: "Por que isso importa",
  whyBody: [
    "O modelo decide o que fazer, mas o harness determina o que ele realmente pode fazer na prática. Isso inclui quais ferramentas estão descobríveis, quais arquivos estão visíveis, quais permissões foram concedidas e quais sequências de ação são aceitas no ambiente de execução. Essa separação é o que permite aplicar política, segurança e observabilidade sem reduzir a flexibilidade do modelo.",
    "O AnyCap entra nesse harness como runtime de capacidades. Ele oferece um caminho consistente para expor ações multimodais por uma única interface, em vez de costurar integrações separadas por provedor em cada fluxo. O resultado é fronteira operacional mais clara, depuração mais simples e reutilização mais rápida entre diferentes shells de agente.",
  ],
  relatedLinks: [
    { label: "Guia de Harness", href: "/guides/what-is-agent-harness", variant: "primary" },
    { label: "Runtime de Capacidade", href: "/glossary/agent-capability-runtime", variant: "secondary" },
    { label: "Comparar com Agent Builder", href: "/compare/anycap-vs-openai-agent-builder", variant: "secondary" },
  ],
};

const contextEngineeringContentDe: GlossaryEntryPageData = {
  metadata: {
    title: "Was ist Context Engineering? Wie KI-Agents Kontext nutzen",
    description:
      "Context Engineering ist die Praxis, das zu gestalten, was ein KI-Agent während der Ausführung sieht, behält und tun kann. Erfahren Sie, wie das Capability-Aufrufe, Workspace-Verhalten und multimodale Workflows beeinflusst.",
    openGraphTitle: "Was ist Context Engineering? Wie KI-Agents Kontext nutzen",
    openGraphDescription:
      "Erfahren Sie, was Context Engineering für KI-Agents bedeutet und wie es Capability-Aufrufe, Workspace-Verhalten und multimodale Workflows beeinflusst.",
  },
  breadcrumbItems: [
    { name: "Startseite", href: "/" },
    { name: "Glossar", href: GLOSSARY_PATH },
    { name: "Context Engineering", href: "/glossary/context-engineering" },
  ],
  eyebrow: "Glossar",
  heroTitle: ["Was ist", "Context Engineering?"],
  intro:
    "Context Engineering ist die Praxis, den Informations- und Aktionsraum zu gestalten, den ein KI-Agent während der Live-Ausführung nutzt — nicht nur während des Prompt-Entwurfs. Dazu gehören Prompts, Workspace-Dateien, Tool-Definitionen, Runtime-State, Berechtigungsgrenzen, vorherige Schritte und operative Einschränkungen, die die Entscheidungsqualität beeinflussen. In Produktiv-Workflows entscheiden diese Signale, ob ein Agent das richtige Tool zum richtigen Zeitpunkt wählt, fehlende Daten anfragt oder im Text weiter-räsoniert. Starkes Context Engineering reduziert vermeidbare Tool-Aufrufe, senkt Fehler-Loops und macht Verhalten über Runs hinweg reproduzierbarer. Ohne das kann selbst ein fähiges Modell schlechte Ausführungsentscheidungen treffen, weil kritischer State fehlt, mehrdeutig ist oder zu spät präsentiert wird.",
  definitionJsonLd: {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: "Context Engineering",
    description:
      "Die Praxis, Informationen, Tools, Constraints und Runtime-State so zu gestalten, dass ein KI-Agent während der Ausführung bessere Entscheidungen treffen kann.",
    url: getLocalizedRouteUrl(siteConfig.defaultLocale, "/glossary/context-engineering"),
  },
  whyTitle: "Warum es zählt",
  whyBody: [
    "Ein fähiger Agent braucht mehr als ein starkes Modell. Er braucht den richtigen Kontext, um zu verstehen, welche Tools existieren, welche Dateien autoritativ sind, welche Aktionen erlaubt sind und wie Erfolg im aktuellen Schritt aussieht. Sind diese Signale schwach, kann der Agent den richtigen Tool-Aufruf überspringen, die falsche Capability wählen oder Aktionen zu früh auslösen. Gutes Context Engineering verbessert Zuverlässigkeit, weil es Modell-Reasoning mit der Ausführungsrealität ausrichtet.",
    "Bei AnyCap beeinflusst Context Engineering direkt die Qualität des Capability-Aufrufs. Es entscheidet, wann ein Agent Image Generation, Video Generation, Image Read oder Video Analysis über den Runtime aufrufen soll und wann er im Text bleiben sollte. Besserer Kontext bedeutet weniger blinde Aufrufe, sauberere multimodale Routings und vorhersehbarere Ergebnisse für Teams in unterschiedlichen Agent-Umgebungen.",
  ],
  relatedLinks: [
    { label: "Context Guide", href: "/guides/context-engineering-for-agents", variant: "primary" },
    { label: "Workspace Context", href: "/guides/workspace-context-engineering", variant: "secondary" },
    { label: "Capability Runtime", href: "/glossary/agent-capability-runtime", variant: "secondary" },
  ],
};

const agentHarnessContentDe: GlossaryEntryPageData = {
  metadata: {
    title: "Was ist ein Agent Harness? Die Ausführungsschicht um KI-Agents",
    description:
      "Ein Agent Harness ist die Ausführungsschicht um einen KI-Agent, die Tools, Dateien, Berechtigungen und Runtime-Steuerung bereitstellt. Erfahren Sie, wie sie zum Modell steht und wo AnyCap als Capability-Runtime einfließt.",
    openGraphTitle: "Was ist ein Agent Harness? Die Ausführungsschicht um KI-Agents",
    openGraphDescription:
      "Erfahren Sie, was ein Agent Harness ist und wo AnyCap als Capability-Runtime im Agent-Stack einfließt.",
  },
  breadcrumbItems: [
    { name: "Startseite", href: "/" },
    { name: "Glossar", href: GLOSSARY_PATH },
    { name: "Agent Harness", href: "/glossary/agent-harness" },
  ],
  eyebrow: "Glossar",
  heroTitle: ["Was ist ein", "Agent Harness?"],
  intro:
    "Ein Agent Harness ist die Ausführungsschicht um das Modell, die Reasoning-Output in reale Operationen verwandelt. Sie stellt Dateien, Terminals, Browser-Steuerung, Tool-Routing, Berechtigungsgrenzen und Runtime-Regeln bereit, die bestimmen, welche Aktionen in jedem Schritt möglich sind. Das Modell entscheidet, was passieren soll; der Harness regelt, was sicher und vorhersehbar in der Umgebung passieren kann. Diese Schicht ist kritisch für produktive Zuverlässigkeit, weil sie Zugriff, Reihenfolge und Fehlerbehandlung über Tool-Aufrufe steuert. Ohne klar definierten Harness wird Agent-Verhalten fragil, schwer auditierbar und schwer reproduzierbar.",
  definitionJsonLd: {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: "Agent Harness",
    description:
      "Die Ausführungsumgebung um einen KI-Agent, die Tools, Dateien, Berechtigungen, Runtime-State und Policy-Kontrollen bereitstellt.",
    url: getLocalizedRouteUrl(siteConfig.defaultLocale, "/glossary/agent-harness"),
  },
  whyTitle: "Warum es zählt",
  whyBody: [
    "Das Modell entscheidet, was zu tun ist, aber der Harness bestimmt, was es in der Praxis tatsächlich tun kann. Dazu gehört, welche Tools auffindbar sind, welche Dateien sichtbar sind, welche Berechtigungen erteilt werden und welche Aktions-Sequenzen in der Ausführungsumgebung erlaubt sind. Diese Trennung macht Policy, Safety und Observability durchsetzbar, ohne die Modell-Flexibilität zu beschneiden.",
    "AnyCap fügt sich in diesen Harness als Capability-Runtime ein. Es gibt dem Harness einen sauberen, konsistenten Weg, multimodale Aktionen über eine Schnittstelle zu exponieren, statt für jeden Workflow separate Provider-Integrationen zusammenzunähen. Das Ergebnis sind klarere operative Grenzen, einfacheres Debugging und schnellere Wiederverwendung über verschiedene Agent-Shells hinweg.",
  ],
  relatedLinks: [
    { label: "Harness Guide", href: "/guides/what-is-agent-harness", variant: "primary" },
    { label: "Capability Runtime", href: "/glossary/agent-capability-runtime", variant: "secondary" },
    { label: "Agent Builder Compare", href: "/compare/anycap-vs-openai-agent-builder", variant: "secondary" },
  ],
};

const contextEngineeringContentId: GlossaryEntryPageData = {
  metadata: {
    title: "Apa itu context engineering? Cara agen AI memakai konteks",
    description:
      "Context engineering adalah praktik membentuk apa yang dilihat, diingat, dan bisa dilakukan agen AI saat eksekusi. Pelajari pengaruhnya pada panggilan kapabilitas dan workflow multimodal.",
    openGraphTitle: "Apa itu context engineering? Cara agen AI memakai konteks",
    openGraphDescription:
      "Pahami arti context engineering bagi agen AI dan pengaruhnya pada panggilan kapabilitas, perilaku workspace, dan workflow multimodal.",
  },
  breadcrumbItems: [
    { name: "Beranda", href: "/" },
    { name: "Glosarium", href: GLOSSARY_PATH },
    { name: "Context Engineering", href: "/glossary/context-engineering" },
  ],
  eyebrow: "Glosarium",
  heroTitle: ["Apa itu", "context engineering?"],
  intro:
    "Context engineering adalah praktik membentuk ruang informasi dan ruang aksi yang dipakai agen AI saat eksekusi berjalan, bukan hanya saat menulis prompt awal. Cakupannya termasuk prompt, file workspace, definisi tool, runtime state, batas izin, langkah-langkah sebelumnya, dan batasan operasional yang memengaruhi kualitas keputusan. Di workflow produksi, sinyal-sinyal ini menentukan apakah agen memilih tool yang tepat di waktu yang tepat, meminta data yang hilang, atau lanjut bernalar dalam teks. Context engineering yang kuat mengurangi panggilan tool yang tidak perlu, menekan loop kegagalan, dan membuat perilaku lebih mudah direproduksi antar run. Tanpa itu, model yang kuat sekalipun bisa mengambil keputusan eksekusi yang buruk karena state penting hilang, ambigu, atau muncul terlambat. Itulah sebabnya tim agen yang berkinerja tinggi memperlakukan desain konteks sebagai infrastruktur inti, bukan urusan copywriting. Konteks berfungsi sebagai arsitektur eksekusi, bukan gaya komunikasi semata, terutama di workflow multimodal dengan target reliabilitas yang ketat.",
  definitionJsonLd: {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: "Context Engineering",
    description:
      "Praktik membentuk informasi, tool, batasan, dan runtime state yang dipakai agen AI saat eksekusi agar bisa mengambil keputusan yang lebih baik.",
    url: getLocalizedRouteUrl(siteConfig.defaultLocale, "/glossary/context-engineering"),
  },
  whyTitle: "Mengapa ini penting",
  whyBody: [
    "Agen yang andal butuh lebih dari sekadar model yang kuat. Ia butuh konteks yang tepat untuk memahami tool apa saja yang tersedia, file mana yang otoritatif, aksi apa yang diizinkan, dan seperti apa wujud sukses untuk langkah saat ini. Kalau sinyalnya lemah, agen bisa melewatkan panggilan tool yang benar, memilih kapabilitas yang salah, atau memicu aksi terlalu cepat. Context engineering yang baik meningkatkan reliabilitas karena menyelaraskan reasoning model dengan realitas eksekusi.",
    "Untuk AnyCap, context engineering langsung memengaruhi kualitas pemanggilan kapabilitas. Ia menentukan kapan agen sebaiknya memanggil image generation, video generation, image read, atau video analysis lewat runtime, dan kapan sebaiknya tetap di teks. Konteks yang lebih baik berarti lebih sedikit panggilan buta, routing multimodal yang lebih bersih, dan hasil yang lebih bisa diprediksi untuk tim yang beroperasi di berbagai lingkungan agen.",
  ],
  relatedLinks: [
    { label: "Panduan Konteks", href: "/guides/context-engineering-for-agents", variant: "primary" },
    { label: "Konteks Workspace", href: "/guides/workspace-context-engineering", variant: "secondary" },
    { label: "Capability Runtime", href: "/glossary/agent-capability-runtime", variant: "secondary" },
  ],
};

const agentHarnessContentId: GlossaryEntryPageData = {
  metadata: {
    title: "Apa itu agent harness? Lapisan eksekusi di sekitar agen AI",
    description:
      "Agent harness adalah lapisan eksekusi di sekitar agen AI yang menyediakan tool, file, dan kontrol runtime. Pelajari posisi AnyCap sebagai capability runtime di stack agen.",
    openGraphTitle: "Apa itu agent harness? Lapisan eksekusi di sekitar agen AI",
    openGraphDescription:
      "Pelajari apa itu agent harness dan posisi AnyCap sebagai capability runtime di dalam stack agen.",
  },
  breadcrumbItems: [
    { name: "Beranda", href: "/" },
    { name: "Glosarium", href: GLOSSARY_PATH },
    { name: "Agent Harness", href: "/glossary/agent-harness" },
  ],
  eyebrow: "Glosarium",
  heroTitle: ["Apa itu", "agent harness?"],
  intro:
    "Agent harness adalah lapisan eksekusi di sekitar model yang mengubah hasil reasoning menjadi operasi nyata. Ia menyediakan file, terminal, kontrol browser, routing tool, batas izin, dan aturan runtime yang menentukan aksi apa saja yang mungkin di tiap langkah. Model memutuskan apa yang seharusnya terjadi; harness mengatur apa yang boleh terjadi dengan aman dan terprediksi di lingkungan. Lapisan ini krusial untuk reliabilitas produksi karena ia mengontrol akses, urutan, dan penanganan kegagalan antar panggilan tool. Tanpa harness yang dirancang jelas, perilaku agen jadi rapuh, sulit diaudit, dan susah direproduksi antar tim atau antar run.",
  definitionJsonLd: {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: "Agent Harness",
    description:
      "Lingkungan eksekusi di sekitar agen AI yang menyediakan tool, file, izin, runtime state, dan kontrol kebijakan.",
    url: getLocalizedRouteUrl(siteConfig.defaultLocale, "/glossary/agent-harness"),
  },
  whyTitle: "Mengapa ini penting",
  whyBody: [
    "Model memutuskan apa yang harus dilakukan, tetapi harness yang menentukan apa yang sebenarnya bisa ia lakukan dalam praktik. Itu termasuk tool mana yang bisa ditemukan, file mana yang terlihat, izin apa yang diberikan, dan urutan aksi mana yang diperbolehkan di lingkungan eksekusi. Pemisahan inilah yang membuat kebijakan, keamanan, dan observability bisa ditegakkan tanpa mengikis fleksibilitas model.",
    "AnyCap masuk ke harness itu sebagai capability runtime. Ia memberi harness cara yang bersih dan konsisten untuk mengekspos aksi multimodal lewat satu antarmuka, alih-alih menjahit integrasi provider terpisah ke setiap workflow. Hasilnya adalah batas operasional yang lebih jelas, debugging yang lebih mudah, dan reuse yang lebih cepat antar shell agen yang berbeda.",
  ],
  relatedLinks: [
    { label: "Panduan Harness", href: "/guides/what-is-agent-harness", variant: "primary" },
    { label: "Capability Runtime", href: "/glossary/agent-capability-runtime", variant: "secondary" },
    { label: "Bandingkan dengan Agent Builder", href: "/compare/anycap-vs-openai-agent-builder", variant: "secondary" },
  ],
};

const glossaryHubContentByLocale: Record<SiteLocale, GlossaryHubPageData> = {
  en: glossaryHubContentEn,
  "pt-br": glossaryHubContentPtBr,
  id: glossaryHubContentId,
  de: glossaryHubContentDe,
};

const contextEngineeringContentByLocale: Record<SiteLocale, GlossaryEntryPageData> = {
  en: contextEngineeringContentEn,
  "pt-br": contextEngineeringContentPtBr,
  id: contextEngineeringContentId,
  de: contextEngineeringContentDe,
};

const agentHarnessContentByLocale: Record<SiteLocale, GlossaryEntryPageData> = {
  en: agentHarnessContentEn,
  "pt-br": agentHarnessContentPtBr,
  id: agentHarnessContentId,
  de: agentHarnessContentDe,
};

export function getGlossaryMetadata(locale: SiteLocale): Metadata {
  const content = glossaryHubContentByLocale[locale] ?? glossaryHubContentByLocale.en;

  return {
    title: content.title,
    description: content.description,
    openGraph: {
      title: content.title,
      description: content.description,
      locale: getLocaleConfig(locale).ogLocale,
      siteName: siteConfig.siteName,
    },
  };
}

export function getGlossaryPageData(locale: SiteLocale) {
  return glossaryHubContentByLocale[locale] ?? glossaryHubContentByLocale.en;
}

export function getContextEngineeringGlossaryMetadata(locale: SiteLocale): Metadata {
  const content = contextEngineeringContentByLocale[locale] ?? contextEngineeringContentByLocale.en;

  return {
    title: content.metadata.title,
    description: content.metadata.description,
    openGraph: {
      title: content.metadata.openGraphTitle,
      description: content.metadata.openGraphDescription,
      locale: getLocaleConfig(locale).ogLocale,
      siteName: siteConfig.siteName,
    },
  };
}

export function getContextEngineeringGlossaryPageData(locale: SiteLocale) {
  return contextEngineeringContentByLocale[locale] ?? contextEngineeringContentByLocale.en;
}

export function getAgentHarnessGlossaryMetadata(locale: SiteLocale): Metadata {
  const content = agentHarnessContentByLocale[locale] ?? agentHarnessContentByLocale.en;

  return {
    title: content.metadata.title,
    description: content.metadata.description,
    openGraph: {
      title: content.metadata.openGraphTitle,
      description: content.metadata.openGraphDescription,
      locale: getLocaleConfig(locale).ogLocale,
      siteName: siteConfig.siteName,
    },
  };
}

export function getAgentHarnessGlossaryPageData(locale: SiteLocale) {
  return agentHarnessContentByLocale[locale] ?? agentHarnessContentByLocale.en;
}

// ─── Model Context Protocol ───────────────────────────────────────────────────

const mcpContentEn: GlossaryEntryPageData = {
  metadata: {
    title: "Model Context Protocol — AI Agent Glossary",
    description:
      "Open standard for how AI agents discover and invoke tools. Learn how MCP works, how it differs from a capability runtime, and where AnyCap fits.",
    openGraphTitle: "Model Context Protocol — AI Agent Glossary",
    openGraphDescription:
      "MCP is an open standard that defines how AI agents discover and call tools. Learn how it differs from a capability runtime and where AnyCap fits.",
  },
  breadcrumbItems: [
    { name: "Home", href: "/" },
    { name: "Glossary", href: GLOSSARY_PATH },
    { name: "Model Context Protocol", href: "/glossary/model-context-protocol" },
  ],
  eyebrow: "Glossary",
  heroTitle: ["What is the", "Model Context Protocol?"],
  intro:
    "The Model Context Protocol (MCP) is an open communication standard that defines how AI agents discover and invoke tools, capabilities, and external services during execution. Released by Anthropic in late 2024, MCP standardizes the message format between an agent host and any conforming server, replacing the previous pattern of building a custom integration for every tool, data source, or capability an agent might need. At its core, MCP establishes a host-client-server architecture: the agent host manages the active model session, MCP clients translate tool calls into protocol messages, and MCP servers expose discrete capabilities through a stable interface. Because the protocol is open, any developer can build an MCP server for a new tool, and any agent product that supports MCP can consume it immediately without custom SDK work. This makes MCP a connectivity standard rather than a capability runtime. It defines how agents talk to tools, not what those tools can actually do. The what is the responsibility of the tool layer — the capability runtime — that sits behind the protocol.",
  definitionJsonLd: {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: "Model Context Protocol (MCP)",
    description:
      "An open communication standard that defines how AI agents discover and invoke tools, capabilities, and external services during execution.",
    url: getLocalizedRouteUrl(siteConfig.defaultLocale, "/glossary/model-context-protocol"),
  },
  whyTitle: "Why it matters",
  whyBody: [
    "MCP changes the economics of tool integration for agent developers. Before MCP, adding a capability to an agent required a custom integration with per-provider authentication, error handling, and response parsing. With MCP, any capability exposed through a conforming server becomes immediately accessible to every agent that supports the standard. This shifts the integration surface from per-tool work to per-server work, and a growing community of MCP server authors does much of that work publicly. The result is that developers who adopt MCP early gain access to an expanding ecosystem of tools without incremental integration cost.",
    "For teams using AnyCap, MCP and the capability runtime operate at different layers. MCP is the communication protocol — it standardizes how the agent calls the runtime. AnyCap is the capability runtime — it provides the actual capabilities (image generation, video generation, image understanding, video analysis, web search, and others) that the protocol routes requests to. These are not competing choices. A team uses MCP as the wire and AnyCap as what runs on that wire. The skill file install path gives the agent the instruction layer it needs to connect the two.",
  ],
  relatedLinks: [
    { label: "MCP vs Skills", href: "/guides/mcp-vs-skills", variant: "primary" },
    { label: "Capability Runtime", href: "/glossary/agent-capability-runtime", variant: "secondary" },
    { label: "AnyCap Capabilities", href: "/capabilities", variant: "secondary" },
  ],
};

const mcpContentPtBr: GlossaryEntryPageData = {
  metadata: {
    title: "O que é o Model Context Protocol (MCP)? Como agentes de IA se conectam a ferramentas",
    description:
      "O Model Context Protocol (MCP) é um padrão de comunicação aberto que define como agentes de IA descobrem e invocam ferramentas, capacidades e serviços externos. Veja como o MCP funciona, como ele difere de um runtime de capacidades e onde o AnyCap entra na stack.",
    openGraphTitle: "O que é o Model Context Protocol (MCP)? Como agentes de IA se conectam a ferramentas",
    openGraphDescription:
      "O MCP é um padrão aberto que define como agentes de IA descobrem e chamam ferramentas. Veja como ele difere de um runtime de capacidades e onde o AnyCap entra.",
  },
  breadcrumbItems: [
    { name: "Início", href: "/" },
    { name: "Glossário", href: GLOSSARY_PATH },
    { name: "Model Context Protocol", href: "/glossary/model-context-protocol" },
  ],
  eyebrow: "Glossário",
  heroTitle: ["O que é o", "Model Context Protocol?"],
  intro:
    "O Model Context Protocol (MCP) é um padrão de comunicação aberto que define como agentes de IA descobrem e invocam ferramentas, capacidades e serviços externos durante a execução. Lançado pela Anthropic no final de 2024, o MCP padroniza o formato de mensagem entre um host de agente e qualquer servidor compatível, substituindo o padrão anterior de construir uma integração personalizada para cada ferramenta ou capacidade que um agente possa precisar. No núcleo, o MCP estabelece uma arquitetura host-client-server: o host gerencia a sessão ativa do modelo, os clientes MCP traduzem chamadas de ferramenta em mensagens de protocolo e os servidores MCP expõem capacidades discretas por meio de uma interface estável. Como o protocolo é aberto, qualquer desenvolvedor pode criar um servidor MCP para uma nova ferramenta, e qualquer produto de agente que suporte MCP pode consumir esse servidor imediatamente, sem trabalho personalizado de SDK. Isso faz do MCP um padrão de conectividade, não um runtime de capacidades. Ele define como agentes falam com ferramentas, não o que essas ferramentas realmente fazem.",
  definitionJsonLd: {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: "Model Context Protocol (MCP)",
    description:
      "Um padrão de comunicação aberto que define como agentes de IA descobrem e invocam ferramentas, capacidades e serviços externos durante a execução.",
    url: getLocalizedRouteUrl(siteConfig.defaultLocale, "/glossary/model-context-protocol"),
  },
  whyTitle: "Por que isso importa",
  whyBody: [
    "O MCP muda a economia da integração de ferramentas para desenvolvedores de agentes. Antes do MCP, adicionar uma capacidade a um agente exigia uma integração personalizada com autenticação, tratamento de erros e parsing de resposta por provedor. Com o MCP, qualquer capacidade exposta por um servidor compatível fica imediatamente acessível para todo agente que suporta o padrão. Isso desloca o esforço de integração de por-ferramenta para por-servidor, e uma comunidade crescente de autores de servidores MCP faz grande parte desse trabalho publicamente.",
    "Para times que usam AnyCap, o MCP e o runtime de capacidades operam em camadas diferentes. O MCP é o protocolo de comunicação — ele define como o agente chama o runtime. O AnyCap é o runtime de capacidades — ele fornece as capacidades reais (geração de imagem, geração de vídeo, entendimento de imagem, análise de vídeo, busca na web e outras) para as quais o protocolo roteia as chamadas. Não são escolhas concorrentes. O time usa o MCP como o fio e o AnyCap como o que roda nesse fio.",
  ],
  relatedLinks: [
    { label: "MCP vs Skills", href: "/guides/mcp-vs-skills", variant: "primary" },
    { label: "Runtime de Capacidade", href: "/glossary/agent-capability-runtime", variant: "secondary" },
    { label: "Capacidades do AnyCap", href: "/capabilities", variant: "secondary" },
  ],
};

const mcpContentDe: GlossaryEntryPageData = {
  metadata: {
    title: "Was ist das Model Context Protocol (MCP)? Wie KI-Agents Tools anbinden",
    description:
      "Das Model Context Protocol (MCP) ist ein offener Kommunikationsstandard, der definiert, wie KI-Agents Tools, Capabilities und externe Services entdecken und aufrufen. Erfahren Sie, wie MCP funktioniert, wie es sich von einer Capability-Runtime unterscheidet und wo AnyCap im Stack einfließt.",
    openGraphTitle: "Was ist das Model Context Protocol (MCP)? Wie KI-Agents Tools anbinden",
    openGraphDescription:
      "MCP ist ein offener Standard, der definiert, wie KI-Agents Tools entdecken und aufrufen. Erfahren Sie, wie es sich von einer Capability-Runtime unterscheidet und wo AnyCap einfließt.",
  },
  breadcrumbItems: [
    { name: "Startseite", href: "/" },
    { name: "Glossar", href: GLOSSARY_PATH },
    { name: "Model Context Protocol", href: "/glossary/model-context-protocol" },
  ],
  eyebrow: "Glossar",
  heroTitle: ["Was ist das", "Model Context Protocol?"],
  intro:
    "Das Model Context Protocol (MCP) ist ein offener Kommunikationsstandard, der definiert, wie KI-Agents Tools, Capabilities und externe Services während der Ausführung entdecken und aufrufen. Ende 2024 von Anthropic veröffentlicht, standardisiert MCP das Nachrichtenformat zwischen einem Agent-Host und jedem konformen Server und ersetzt das frühere Muster, für jedes Tool, jede Datenquelle oder Capability eine eigene Integration zu bauen. Im Kern etabliert MCP eine Host-Client-Server-Architektur: Der Agent-Host verwaltet die aktive Modell-Session, MCP-Clients übersetzen Tool-Aufrufe in Protokoll-Nachrichten, und MCP-Server exponieren einzelne Capabilities über eine stabile Schnittstelle. Weil das Protokoll offen ist, kann jeder Entwickler einen MCP-Server für ein neues Tool bauen, und jedes Agent-Produkt mit MCP-Unterstützung kann ihn ohne SDK-Eigenarbeit konsumieren. Damit ist MCP ein Konnektivitäts-Standard, keine Capability-Runtime. Es definiert, wie Agents mit Tools sprechen — nicht, was diese Tools tatsächlich leisten. Das Was ist Sache der Tool-Schicht — der Capability-Runtime — die hinter dem Protokoll sitzt.",
  definitionJsonLd: {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: "Model Context Protocol (MCP)",
    description:
      "Ein offener Kommunikationsstandard, der definiert, wie KI-Agents Tools, Capabilities und externe Services während der Ausführung entdecken und aufrufen.",
    url: getLocalizedRouteUrl(siteConfig.defaultLocale, "/glossary/model-context-protocol"),
  },
  whyTitle: "Warum es zählt",
  whyBody: [
    "MCP verändert die Ökonomie der Tool-Integration für Agent-Entwickler. Vor MCP brauchte das Hinzufügen einer Capability eine eigene Integration mit anbieterspezifischer Authentifizierung, Fehlerbehandlung und Response-Parsing. Mit MCP ist jede Capability, die über einen konformen Server bereitgestellt wird, sofort für jeden MCP-fähigen Agent zugänglich. Das verschiebt die Integrationsfläche von Pro-Tool-Arbeit zu Pro-Server-Arbeit, und eine wachsende Community von MCP-Server-Autoren erledigt einen Großteil dieser Arbeit öffentlich. Teams, die MCP früh einsetzen, gewinnen Zugriff auf ein wachsendes Tool-Ökosystem ohne zusätzliche Integrationskosten.",
    "Für Teams, die AnyCap nutzen, arbeiten MCP und die Capability-Runtime auf unterschiedlichen Schichten. MCP ist das Kommunikationsprotokoll — es standardisiert, wie der Agent die Runtime aufruft. AnyCap ist die Capability-Runtime — sie liefert die tatsächlichen Capabilities (Image Generation, Video Generation, Image Understanding, Video Analysis, Web Search und weitere), an die das Protokoll Anfragen routet. Das sind keine konkurrierenden Optionen. Ein Team nutzt MCP als Leitung und AnyCap als das, was auf dieser Leitung läuft. Der Skill-File-Installationspfad gibt dem Agent die Instruktionsschicht, die beide verbindet.",
  ],
  relatedLinks: [
    { label: "MCP vs Skills", href: "/guides/mcp-vs-skills", variant: "primary" },
    { label: "Capability Runtime", href: "/glossary/agent-capability-runtime", variant: "secondary" },
    { label: "AnyCap Capabilities", href: "/capabilities", variant: "secondary" },
  ],
};

const mcpContentId: GlossaryEntryPageData = {
  metadata: {
    title: "Apa itu Model Context Protocol (MCP)? Cara agen AI terhubung ke tool",
    description:
      "Model Context Protocol (MCP) adalah standar komunikasi terbuka yang mendefinisikan cara agen AI menemukan dan memanggil tool, kapabilitas, dan layanan eksternal. Pelajari cara kerjanya, bedanya dengan capability runtime, dan posisi AnyCap di stack.",
    openGraphTitle: "Apa itu Model Context Protocol (MCP)? Cara agen AI terhubung ke tool",
    openGraphDescription:
      "MCP adalah standar terbuka yang mendefinisikan cara agen AI menemukan dan memanggil tool. Pelajari bedanya dengan capability runtime dan posisi AnyCap.",
  },
  breadcrumbItems: [
    { name: "Beranda", href: "/" },
    { name: "Glosarium", href: GLOSSARY_PATH },
    { name: "Model Context Protocol", href: "/glossary/model-context-protocol" },
  ],
  eyebrow: "Glosarium",
  heroTitle: ["Apa itu", "Model Context Protocol?"],
  intro:
    "Model Context Protocol (MCP) adalah standar komunikasi terbuka yang mendefinisikan cara agen AI menemukan dan memanggil tool, kapabilitas, dan layanan eksternal saat eksekusi. Dirilis Anthropic akhir 2024, MCP menstandarkan format pesan antara agent host dan server mana pun yang patuh pada protokol, menggantikan pola lama membangun integrasi khusus untuk setiap tool, sumber data, atau kapabilitas yang mungkin dibutuhkan agen. Pada intinya, MCP membentuk arsitektur host-client-server: agent host mengelola session model yang aktif, klien MCP menerjemahkan panggilan tool menjadi pesan protokol, dan server MCP mengekspos kapabilitas-kapabilitas terpisah lewat antarmuka yang stabil. Karena protokolnya terbuka, developer mana pun bisa membuat server MCP untuk tool baru, dan produk agen mana pun yang mendukung MCP bisa langsung memakainya tanpa kerja SDK khusus. Itu menjadikan MCP sebagai standar konektivitas, bukan capability runtime. Ia mendefinisikan cara agen bicara ke tool, bukan apa yang sebenarnya bisa dilakukan tool itu. Bagian apa adalah tanggung jawab lapisan tool — capability runtime — yang duduk di belakang protokol.",
  definitionJsonLd: {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: "Model Context Protocol (MCP)",
    description:
      "Standar komunikasi terbuka yang mendefinisikan cara agen AI menemukan dan memanggil tool, kapabilitas, dan layanan eksternal saat eksekusi.",
    url: getLocalizedRouteUrl(siteConfig.defaultLocale, "/glossary/model-context-protocol"),
  },
  whyTitle: "Mengapa ini penting",
  whyBody: [
    "MCP mengubah ekonomi integrasi tool bagi developer agen. Sebelum MCP, menambahkan kapabilitas ke agen butuh integrasi khusus dengan autentikasi, penanganan error, dan parsing respons per provider. Dengan MCP, kapabilitas mana pun yang diekspos lewat server yang patuh standar langsung bisa diakses oleh setiap agen yang mendukung standar tersebut. Ini menggeser permukaan integrasi dari per-tool menjadi per-server, dan komunitas penulis server MCP yang terus tumbuh mengerjakan sebagian besar pekerjaan itu secara publik. Hasilnya, developer yang mengadopsi MCP lebih dini mendapat akses ke ekosistem tool yang berkembang tanpa biaya integrasi tambahan.",
    "Untuk tim yang memakai AnyCap, MCP dan capability runtime beroperasi di lapisan yang berbeda. MCP adalah protokol komunikasi — ia menstandarkan bagaimana agen memanggil runtime. AnyCap adalah capability runtime — ia menyediakan kapabilitas konkret (image generation, video generation, image understanding, video analysis, web search, dan lainnya) yang dituju oleh protokol. Keduanya bukan pilihan yang bersaing. Tim memakai MCP sebagai kabelnya, dan AnyCap sebagai yang berjalan di atas kabel itu. Skill file install path memberi agen lapisan instruksi yang dibutuhkan untuk menyambungkan keduanya.",
  ],
  relatedLinks: [
    { label: "MCP vs Skills", href: "/guides/mcp-vs-skills", variant: "primary" },
    { label: "Capability Runtime", href: "/glossary/agent-capability-runtime", variant: "secondary" },
    { label: "Kapabilitas AnyCap", href: "/capabilities", variant: "secondary" },
  ],
};

const mcpContentByLocale: Record<SiteLocale, GlossaryEntryPageData> = {
  en: mcpContentEn,
  "pt-br": mcpContentPtBr,
  id: mcpContentId,
  de: mcpContentDe,
};

export function getMcpGlossaryMetadata(locale: SiteLocale): Metadata {
  const content = mcpContentByLocale[locale] ?? mcpContentByLocale.en;
  return {
    title: content.metadata.title,
    description: content.metadata.description,
    openGraph: {
      title: content.metadata.openGraphTitle,
      description: content.metadata.openGraphDescription,
      locale: getLocaleConfig(locale).ogLocale,
      siteName: siteConfig.siteName,
    },
  };
}

export function getMcpGlossaryPageData(locale: SiteLocale) {
  return mcpContentByLocale[locale] ?? mcpContentByLocale.en;
}

// ─── Agentic Workflow ─────────────────────────────────────────────────────────

const agenticWorkflowContentEn: GlossaryEntryPageData = {
  metadata: {
    title: "Agentic Workflow — AI Agent Glossary",
    description:
      "Goal-directed AI decision loops that run to completion without per-step human approval. Learn how agentic workflows work and why capability coverage matters.",
    openGraphTitle: "Agentic Workflow — AI Agent Glossary",
    openGraphDescription:
      "An agentic workflow is a goal-directed sequence of AI decisions and tool actions that runs without per-step human approval. Learn how capability coverage shapes workflow reliability.",
  },
  breadcrumbItems: [
    { name: "Home", href: "/" },
    { name: "Glossary", href: GLOSSARY_PATH },
    { name: "Agentic Workflow", href: "/glossary/agentic-workflow" },
  ],
  eyebrow: "Glossary",
  heroTitle: ["What is an", "agentic workflow?"],
  intro:
    "An agentic workflow is a goal-directed sequence of model decisions and real-world tool actions that runs to completion without requiring human approval at each step. The model decides what to do; the agent harness executes it; the results feed back into the next decision. This loop continues until the goal is met, a stop condition is reached, or the agent requests human input. What distinguishes an agentic workflow from a simple chat session is the combination of autonomy, tool use, and state persistence across steps. The model does not just generate text — it calls tools, reads file contents, generates images, searches the web, runs code, and stores results that subsequent steps build on. Agentic workflows are what make AI systems genuinely useful for multi-step production tasks rather than isolated queries. The reliability of each step depends heavily on which tools are available, how well they are described to the model, and what constraints govern execution. Workflows that cross capability boundaries — generating an image, then analyzing it, then publishing the result — require a runtime that covers all those actions through one consistent interface.",
  definitionJsonLd: {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: "Agentic Workflow",
    description:
      "A goal-directed sequence of AI model decisions and real-world tool actions that runs to completion without requiring human approval at each step.",
    url: getLocalizedRouteUrl(siteConfig.defaultLocale, "/glossary/agentic-workflow"),
  },
  whyTitle: "Why it matters",
  whyBody: [
    "Agentic workflows are where capability gaps become most visible. A well-designed agent with strong reasoning but no access to image generation, vision, or web retrieval will fail at steps that require those actions — regardless of how capable its language understanding is. This means capability coverage is a workflow design question, not just a product selection question. The more diverse the workflow, the more types of capabilities it requires. Teams that plan workflow steps before selecting their capability layer avoid discovering gaps mid-execution, which is the most expensive time to find them.",
    "For teams using AnyCap, the capability runtime is the tool layer that makes agentic workflows with generation, understanding, and retrieval possible. Without it, developers must build and maintain separate integrations for each action type, which adds failure surface and slows iteration. A runtime that covers image, video, vision, web search, web crawl, storage, and publishing in one install path reduces the integration overhead that would otherwise fragment the workflow into disconnected pieces. This is why teams running high-diversity agentic workflows typically benefit most from the runtime architecture.",
  ],
  relatedLinks: [
    { label: "What Agents Can't Do", href: "/learn/what-agents-cant-do", variant: "primary" },
    { label: "Context Engineering", href: "/glossary/context-engineering", variant: "secondary" },
    { label: "AnyCap Capabilities", href: "/capabilities", variant: "secondary" },
  ],
};

const agenticWorkflowContentPtBr: GlossaryEntryPageData = {
  metadata: {
    title: "O que é um fluxo agêntico? Como agentes de IA encadeiam decisões e ações",
    description:
      "Um fluxo agêntico é uma sequência orientada a objetivos de decisões do modelo e ações reais com ferramentas que executa até a conclusão sem exigir aprovação humana a cada etapa. Veja como funcionam os fluxos agênticos e por que a cobertura de capacidades importa.",
    openGraphTitle: "O que é um fluxo agêntico? Como agentes de IA encadeiam decisões e ações",
    openGraphDescription:
      "Um fluxo agêntico é uma sequência de decisões de IA e ações de ferramentas que roda sem aprovação humana por etapa. Veja como cobertura de capacidades molda confiabilidade.",
  },
  breadcrumbItems: [
    { name: "Início", href: "/" },
    { name: "Glossário", href: GLOSSARY_PATH },
    { name: "Fluxo Agêntico", href: "/glossary/agentic-workflow" },
  ],
  eyebrow: "Glossário",
  heroTitle: ["O que é um", "fluxo agêntico?"],
  intro:
    "Um fluxo agêntico é uma sequência orientada a objetivos de decisões do modelo e ações reais com ferramentas que executa até a conclusão sem exigir aprovação humana a cada etapa. O modelo decide o que fazer; o harness do agente executa; os resultados alimentam a próxima decisão. Esse loop continua até que o objetivo seja alcançado, uma condição de parada seja atingida ou o agente solicite entrada humana. O que distingue um fluxo agêntico de uma simples sessão de chat é a combinação de autonomia, uso de ferramentas e persistência de estado entre as etapas. O modelo não apenas gera texto — ele chama ferramentas, lê conteúdo de arquivos, gera imagens, pesquisa na web, executa código e armazena resultados que etapas subsequentes utilizam. Fluxos agênticos são o que torna sistemas de IA genuinamente úteis para tarefas de produção de múltiplas etapas, em vez de consultas isoladas. A confiabilidade de cada etapa depende fortemente de quais ferramentas estão disponíveis e como elas estão descritas ao modelo.",
  definitionJsonLd: {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: "Fluxo Agêntico",
    description:
      "Uma sequência orientada a objetivos de decisões do modelo de IA e ações reais com ferramentas que executa até a conclusão sem exigir aprovação humana a cada etapa.",
    url: getLocalizedRouteUrl(siteConfig.defaultLocale, "/glossary/agentic-workflow"),
  },
  whyTitle: "Por que isso importa",
  whyBody: [
    "Fluxos agênticos são onde as lacunas de capacidade ficam mais visíveis. Um agente bem projetado com raciocínio forte, mas sem acesso a geração de imagem, visão ou recuperação web, vai falhar nas etapas que exigem essas ações — independente de quão boa seja sua compreensão de linguagem. Isso significa que cobertura de capacidades é uma questão de design de fluxo, não apenas de seleção de produto. Quanto mais diverso o fluxo, mais tipos de capacidades ele requer.",
    "Para times que usam AnyCap, o runtime de capacidades é a camada de ferramentas que torna possíveis fluxos agênticos com geração, entendimento e recuperação. Sem ele, os desenvolvedores precisam construir e manter integrações separadas para cada tipo de ação, o que adiciona superfície de falha e desacelera a iteração. Um runtime que cobre imagem, vídeo, visão, busca web, web crawl, armazenamento e publicação em um único caminho de instalação reduz o overhead de integração que, de outra forma, fragmentaria o fluxo em partes desconectadas.",
  ],
  relatedLinks: [
    { label: "O que agentes não conseguem fazer", href: "/learn/what-agents-cant-do", variant: "primary" },
    { label: "Engenharia de Contexto", href: "/glossary/context-engineering", variant: "secondary" },
    { label: "Capacidades do AnyCap", href: "/capabilities", variant: "secondary" },
  ],
};

const agenticWorkflowContentDe: GlossaryEntryPageData = {
  metadata: {
    title: "Was ist ein Agentic Workflow? Wie KI-Agents Entscheidungen und Aktionen verketten",
    description:
      "Ein Agentic Workflow ist eine zielgerichtete Sequenz aus KI-Modellentscheidungen und realen Tool-Aktionen, die ohne menschliche Freigabe pro Schritt bis zum Ende läuft. Erfahren Sie, wie Agentic Workflows funktionieren und warum Capability-Abdeckung zählt.",
    openGraphTitle: "Was ist ein Agentic Workflow? Wie KI-Agents Entscheidungen und Aktionen verketten",
    openGraphDescription:
      "Ein Agentic Workflow ist eine zielgerichtete Sequenz aus KI-Entscheidungen und Tool-Aktionen ohne Freigabe pro Schritt. Erfahren Sie, wie Capability-Abdeckung Workflow-Zuverlässigkeit prägt.",
  },
  breadcrumbItems: [
    { name: "Startseite", href: "/" },
    { name: "Glossar", href: GLOSSARY_PATH },
    { name: "Agentic Workflow", href: "/glossary/agentic-workflow" },
  ],
  eyebrow: "Glossar",
  heroTitle: ["Was ist ein", "Agentic Workflow?"],
  intro:
    "Ein Agentic Workflow ist eine zielgerichtete Sequenz aus Modell-Entscheidungen und realen Tool-Aktionen, die bis zum Ende läuft, ohne dass ein Mensch in jedem Schritt freigeben muss. Das Modell entscheidet, was zu tun ist; der Agent-Harness führt es aus; die Ergebnisse fließen in die nächste Entscheidung ein. Diese Schleife läuft, bis das Ziel erreicht ist, eine Stop-Bedingung greift oder der Agent Human-Input anfordert. Was einen Agentic Workflow von einer einfachen Chat-Session unterscheidet, ist die Kombination aus Autonomie, Tool-Nutzung und State-Persistenz über Schritte hinweg. Das Modell generiert nicht nur Text — es ruft Tools auf, liest Datei-Inhalte, generiert Bilder, durchsucht das Web, führt Code aus und speichert Ergebnisse, auf denen Folgeschritte aufbauen. Agentic Workflows sind das, was KI-Systeme für mehrstufige Produktiv-Aufgaben wirklich nützlich macht — nicht nur für isolierte Anfragen. Die Zuverlässigkeit jedes Schritts hängt stark davon ab, welche Tools verfügbar sind, wie gut sie dem Modell beschrieben werden und welche Constraints die Ausführung steuern. Workflows, die Capability-Grenzen überschreiten — ein Bild generieren, dann analysieren, dann das Ergebnis publizieren — brauchen eine Runtime, die all diese Aktionen über eine konsistente Schnittstelle abdeckt.",
  definitionJsonLd: {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: "Agentic Workflow",
    description:
      "Eine zielgerichtete Sequenz aus KI-Modellentscheidungen und realen Tool-Aktionen, die ohne menschliche Freigabe pro Schritt bis zum Ende läuft.",
    url: getLocalizedRouteUrl(siteConfig.defaultLocale, "/glossary/agentic-workflow"),
  },
  whyTitle: "Warum es zählt",
  whyBody: [
    "Agentic Workflows sind dort, wo Capability-Lücken am sichtbarsten werden. Ein gut entworfener Agent mit starkem Reasoning, aber ohne Zugriff auf Image Generation, Vision oder Web-Retrieval scheitert an Schritten, die diese Aktionen erfordern — egal wie stark sein Sprachverständnis ist. Das macht Capability-Abdeckung zu einer Frage des Workflow-Designs, nicht nur der Produktauswahl. Je vielfältiger der Workflow, desto mehr Capability-Typen braucht er. Teams, die Workflow-Schritte vor der Wahl ihrer Capability-Schicht planen, vermeiden es, Lücken erst während der Ausführung zu entdecken — der teuerste Zeitpunkt, sie zu finden.",
    "Für Teams, die AnyCap nutzen, ist die Capability-Runtime die Tool-Schicht, die Agentic Workflows mit Generation, Understanding und Retrieval möglich macht. Ohne sie müssten Entwickler separate Integrationen für jeden Aktionstyp bauen und pflegen, was die Fehlerfläche vergrößert und Iteration verlangsamt. Eine Runtime, die Image, Video, Vision, Web Search, Web Crawl, Storage und Publishing in einem Installationspfad abdeckt, reduziert den Integrations-Overhead, der den Workflow sonst in unverbundene Teile fragmentieren würde. Deshalb profitieren Teams mit hochdiversen Agentic Workflows typischerweise am meisten von der Runtime-Architektur.",
  ],
  relatedLinks: [
    { label: "Was Agents nicht können", href: "/learn/what-agents-cant-do", variant: "primary" },
    { label: "Context Engineering", href: "/glossary/context-engineering", variant: "secondary" },
    { label: "AnyCap Capabilities", href: "/capabilities", variant: "secondary" },
  ],
};

const agenticWorkflowContentId: GlossaryEntryPageData = {
  metadata: {
    title: "Apa itu agentic workflow? Cara agen AI merangkai keputusan dan aksi",
    description:
      "Agentic workflow adalah rangkaian berorientasi tujuan dari keputusan model dan aksi tool nyata yang berjalan sampai selesai tanpa persetujuan manusia per langkah. Pelajari cara kerja agentic workflow dan mengapa cakupan kapabilitas penting.",
    openGraphTitle: "Apa itu agentic workflow? Cara agen AI merangkai keputusan dan aksi",
    openGraphDescription:
      "Agentic workflow adalah rangkaian keputusan AI dan aksi tool yang berjalan tanpa persetujuan manusia per langkah. Lihat bagaimana cakupan kapabilitas membentuk reliabilitas.",
  },
  breadcrumbItems: [
    { name: "Beranda", href: "/" },
    { name: "Glosarium", href: GLOSSARY_PATH },
    { name: "Agentic Workflow", href: "/glossary/agentic-workflow" },
  ],
  eyebrow: "Glosarium",
  heroTitle: ["Apa itu", "agentic workflow?"],
  intro:
    "Agentic workflow adalah rangkaian berorientasi tujuan dari keputusan model dan aksi tool nyata yang berjalan sampai selesai tanpa butuh persetujuan manusia di setiap langkah. Model memutuskan apa yang dilakukan; agent harness mengeksekusinya; hasilnya jadi masukan untuk keputusan berikutnya. Loop ini terus berjalan sampai tujuan tercapai, kondisi berhenti dipicu, atau agen meminta input manusia. Yang membedakan agentic workflow dari sesi chat biasa adalah kombinasi otonomi, pemakaian tool, dan persistensi state antar langkah. Model tidak sekadar menghasilkan teks — ia memanggil tool, membaca isi file, menghasilkan gambar, mencari di web, menjalankan kode, dan menyimpan hasil yang dipakai langkah selanjutnya. Agentic workflow adalah yang membuat sistem AI benar-benar berguna untuk tugas produksi multi-langkah, bukan sekadar query terpisah. Reliabilitas tiap langkah sangat bergantung pada tool yang tersedia, seberapa baik tool itu dideskripsikan ke model, dan batasan apa yang mengatur eksekusi. Workflow yang melintasi batas kapabilitas — menghasilkan gambar, lalu menganalisanya, lalu mempublikasikan hasilnya — butuh runtime yang menutup semua aksi itu lewat satu antarmuka yang konsisten.",
  definitionJsonLd: {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: "Agentic Workflow",
    description:
      "Rangkaian berorientasi tujuan dari keputusan model AI dan aksi tool nyata yang berjalan sampai selesai tanpa membutuhkan persetujuan manusia di setiap langkah.",
    url: getLocalizedRouteUrl(siteConfig.defaultLocale, "/glossary/agentic-workflow"),
  },
  whyTitle: "Mengapa ini penting",
  whyBody: [
    "Agentic workflow adalah tempat celah kapabilitas paling kelihatan. Agen yang dirancang baik dengan reasoning kuat tapi tanpa akses ke pembuatan gambar, visi, atau pengambilan data web akan gagal di langkah-langkah yang butuh aksi itu — sekuat apa pun pemahaman bahasanya. Artinya, cakupan kapabilitas adalah pertanyaan desain workflow, bukan sekadar pemilihan produk. Makin beragam workflow-nya, makin banyak tipe kapabilitas yang dibutuhkan. Tim yang merencanakan langkah workflow sebelum memilih lapisan kapabilitas terhindar dari menemukan celah di tengah eksekusi — saat paling mahal untuk menemukannya.",
    "Untuk tim yang memakai AnyCap, capability runtime adalah lapisan tool yang membuat agentic workflow dengan pembuatan, pemahaman, dan pengambilan data jadi mungkin. Tanpa itu, developer harus membangun dan memelihara integrasi terpisah untuk tiap tipe aksi, yang menambah permukaan kegagalan dan memperlambat iterasi. Runtime yang menutup image, video, visi, web search, web crawl, storage, dan publishing dalam satu install path mengurangi overhead integrasi yang kalau tidak akan memecah workflow jadi potongan-potongan yang tidak terhubung. Itulah sebabnya tim yang menjalankan agentic workflow dengan keragaman tinggi biasanya paling diuntungkan oleh arsitektur runtime ini.",
  ],
  relatedLinks: [
    { label: "Yang tidak bisa dilakukan agen", href: "/learn/what-agents-cant-do", variant: "primary" },
    { label: "Context Engineering", href: "/glossary/context-engineering", variant: "secondary" },
    { label: "Kapabilitas AnyCap", href: "/capabilities", variant: "secondary" },
  ],
};

const agenticWorkflowContentByLocale: Record<SiteLocale, GlossaryEntryPageData> = {
  en: agenticWorkflowContentEn,
  "pt-br": agenticWorkflowContentPtBr,
  id: agenticWorkflowContentId,
  de: agenticWorkflowContentDe,
};

export function getAgenticWorkflowGlossaryMetadata(locale: SiteLocale): Metadata {
  const content = agenticWorkflowContentByLocale[locale] ?? agenticWorkflowContentByLocale.en;
  return {
    title: content.metadata.title,
    description: content.metadata.description,
    openGraph: {
      title: content.metadata.openGraphTitle,
      description: content.metadata.openGraphDescription,
      locale: getLocaleConfig(locale).ogLocale,
      siteName: siteConfig.siteName,
    },
  };
}

export function getAgenticWorkflowGlossaryPageData(locale: SiteLocale) {
  return agenticWorkflowContentByLocale[locale] ?? agenticWorkflowContentByLocale.en;
}
