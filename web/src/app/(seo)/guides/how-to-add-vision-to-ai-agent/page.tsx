import type { Metadata } from "next";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { EarlyAccessBanner } from "@/components/landing/EarlyAccessBanner";
import { FadeIn } from "@/components/ui/FadeIn";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { ArticleByline } from "@/components/seo/ArticleByline";
import { createTechArticleJsonLd } from "@/lib/schema";
import { getPageMetadata } from "./metadata";
import { getRequestLocale } from "@/lib/request-locale";
import { defaultLocale } from "@/lib/site";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

type PageContent = {
  eyebrow: string;
  title: [string, string];
  intro: string[];
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
  useCasesTitle: string;
  useCases: { title: string; body: string }[];
  interpretationTitle: string;
  interpretationBody: string[];
  mistakesTitle: string;
  mistakes: { title: string; body: string }[];
  faqTitle: string;
  ctas: {
    claude: string;
    capability: string;
    start: string;
  };
  breadcrumbLabel: string;
};

const contentByLocale: Record<"en" | "pt-br" | "id" | "de", PageContent> = {
  en: {
    eyebrow: "Guides",
    title: ["How to add vision capabilities", "to an AI agent"],
    intro: [
      "Most AI agents work with text and code, but they cannot see unless you give them a visual capability surface. AnyCap adds image understanding and video analysis so the agent can inspect screenshots, review designs, summarize demos, and reason about visual evidence inside the same workflow.",
      "This guide covers both image read and video read setup for agents such as Claude Code, Cursor, and Codex. The setup is straightforward, but the value comes from what happens after installation: the agent can move from text-only reasoning to visual inspection, extraction, and QA tasks.",
      "Once configured, your agent can treat a screenshot, a UI mockup, or a recorded demo as structured input. That opens up new workflows for bug triage, accessibility review, competitor research, release-note drafting, and design validation.",
    ],
    neededTitle: "What you need",
    neededItems: [
      "An AI agent that can run shell commands, such as Claude Code, Cursor, or Codex",
      "Node.js 18+ for skills.sh and npm install support",
      "A browser for the one-time login flow",
      "Images or videos to analyze, either as URLs or local files that can be uploaded first",
    ],
    callout:
      "Vision capabilities usually show up as two commands: image read for still images and video read for temporal analysis. Both return structured text that an agent can reason over, summarize, or feed into follow-up actions.",
    steps: {
      skill: "Install the AnyCap skill",
      cli: "Install the AnyCap CLI",
      login: "Log in",
      image: "Use image understanding",
      video: "Use video analysis",
      combine: "Combine vision in agent workflows",
    },
    useCasesTitle: "Where vision adds the most value",
    useCases: [
      {
        title: "UI and QA review",
        body: "Have the agent inspect screenshots for layout regressions, accessibility problems, text overflow, or visual bugs before a release.",
      },
      {
        title: "Design and brand review",
        body: "Ask the agent to compare a mockup against brand guidelines, extract visible text, or summarize the hierarchy and composition of a layout.",
      },
      {
        title: "Video understanding",
        body: "Feed a product demo, user recording, or ad creative into the agent so it can summarize scenes, extract key moments, and turn the analysis into notes or tickets.",
      },
    ],
    interpretationTitle: "How agents use vision output well",
    interpretationBody: [
      "Vision features are most useful when the analysis becomes part of a larger workflow rather than a one-off caption. For example, an agent can read a screenshot, identify accessibility issues, and then open code files to propose a fix based on what it found.",
      "The same applies to video. A scene-by-scene summary becomes more valuable when the agent turns it into release notes, a QA checklist, or a list of missing product explanations. The capability is not just about describing visuals. It is about helping the agent make decisions with visual evidence.",
      "In practice, focused prompts produce better results than generic ones. Asking 'What is in this image?' is useful, but asking 'What onboarding issues would block a first-time user in this screenshot?' gives the model a sharper evaluation frame.",
    ],
    mistakesTitle: "Common setup and usage mistakes",
    mistakes: [
      {
        title: "Forgetting the upload step for local files",
        body: "If the input is not already reachable by URL, the agent needs to upload it first and then pass the resulting URL to the read command.",
      },
      {
        title: "Using generic prompts for complex reviews",
        body: "Broad prompts get broad answers. A targeted question about accessibility, information hierarchy, or feature order produces more actionable output.",
      },
      {
        title: "Treating vision as a standalone task",
        body: "The highest leverage comes when the agent uses the visual analysis to drive the next step, such as drafting notes, filing bugs, or making code changes.",
      },
    ],
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
    intro: [
      "A maioria dos agentes de IA trabalha com texto e codigo, mas nao enxerga ate voce dar uma superficie visual para eles. O AnyCap adiciona entendimento de imagem e analise de video para que o agente examine screenshots, revise designs, resuma demos e raciocine com evidencias visuais no mesmo workflow.",
      "Este guia cobre o setup de image read e video read para agentes como Claude Code, Cursor e Codex. A instalacao e simples, mas o valor real aparece depois: o agente sai de um raciocinio so em texto e passa a inspecionar, extrair e validar informacao visual.",
      "Depois de configurado, seu agente pode tratar um screenshot, um mockup ou um video de produto como entrada estruturada. Isso abre workflows de triagem de bugs, revisao de acessibilidade, pesquisa competitiva, release notes e validacao de design.",
    ],
    neededTitle: "O que voce precisa",
    neededItems: [
      "Um agente de IA que consiga executar comandos de shell, como Claude Code, Cursor ou Codex",
      "Node.js 18+ para compatibilidade com skills.sh e npm install",
      "Um navegador para o login unico",
      "Imagens ou videos para analisar, por URL ou como arquivo local que possa ser enviado antes",
    ],
    callout:
      "As capacidades de visao normalmente aparecem em dois comandos: image read para imagens estaticas e video read para analise temporal. Ambos retornam texto estruturado que o agente pode interpretar, resumir ou usar em acao seguinte.",
    steps: {
      skill: "Instale a skill do AnyCap",
      cli: "Instale a CLI do AnyCap",
      login: "Faca login",
      image: "Use entendimento de imagem",
      video: "Use analise de video",
      combine: "Combine visao nos workflows do agente",
    },
    useCasesTitle: "Onde visao agrega mais valor",
    useCases: [
      {
        title: "Revisao de UI e QA",
        body: "Peca ao agente para inspecionar screenshots em busca de regressos visuais, problemas de acessibilidade, overflow de texto ou bugs antes do release.",
      },
      {
        title: "Revisao de design e marca",
        body: "Peca ao agente para comparar um mockup com guidelines de marca, extrair textos visiveis ou resumir hierarquia e composicao do layout.",
      },
      {
        title: "Entendimento de video",
        body: "Passe um demo de produto, gravacao de usuario ou criativo de anuncio para o agente resumir cenas, extrair momentos importantes e transformar isso em notas ou tickets.",
      },
    ],
    interpretationTitle: "Como agentes usam bem a saida visual",
    interpretationBody: [
      "Recursos de visao sao mais uteis quando a analise entra em um workflow maior em vez de virar apenas uma legenda. Por exemplo, o agente pode ler um screenshot, identificar problemas de acessibilidade e depois abrir arquivos de codigo para propor um ajuste.",
      "O mesmo vale para video. Um resumo cena a cena fica mais valioso quando o agente o transforma em release notes, checklist de QA ou lista de features mostradas. O ponto nao e apenas descrever a imagem. E permitir decisoes com evidencia visual.",
      "Na pratica, prompts focados produzem resultados melhores do que prompts genericos. Perguntar 'o que tem nessa imagem?' ajuda, mas perguntar 'quais problemas de onboarding aparecem neste screenshot?' da um quadro de avaliacao mais util.",
    ],
    mistakesTitle: "Erros comuns de setup e uso",
    mistakes: [
      {
        title: "Esquecer o upload de arquivos locais",
        body: "Se a entrada ainda nao estiver disponivel por URL, o agente precisa enviar o arquivo primeiro e depois passar a URL resultante ao comando de leitura.",
      },
      {
        title: "Usar prompts genericos em revisoes complexas",
        body: "Prompts amplos geram respostas amplas. Perguntas focadas em acessibilidade, hierarquia ou ordem de features produzem saidas mais acionaveis.",
      },
      {
        title: "Tratar visao como tarefa isolada",
        body: "O maior ganho aparece quando o agente usa a analise visual para conduzir o proximo passo, como abrir bug, redigir notas ou sugerir mudancas no codigo.",
      },
    ],
    faqTitle: "FAQ",
    ctas: {
      claude: "AnyCap para Claude Code",
      capability: "Todas as capabilities",
      start: "Comecar",
    },
    breadcrumbLabel: "Adicionar visao ao agente de IA",
  },
  id: {
    eyebrow: "Panduan",
    title: ["Cara menambahkan kapabilitas vision", "ke agen AI"],
    intro: [
      "Sebagian besar agen AI bekerja dengan teks dan kode, tetapi belum bisa melihat sampai Anda memberi surface visual. AnyCap menambahkan image understanding dan video analysis agar agen bisa meninjau screenshot, mengecek desain, merangkum demo, dan bernalar dari bukti visual di workflow yang sama.",
      "Panduan ini membahas setup image read dan video read untuk agen seperti Claude Code, Cursor, dan Codex. Instalasinya sederhana, tetapi nilai utamanya muncul setelah aktif: agen bisa bergerak dari reasoning berbasis teks ke inspeksi visual, ekstraksi informasi, dan tugas QA.",
      "Setelah dikonfigurasi, agen Anda dapat memperlakukan screenshot, mockup UI, atau rekaman demo sebagai input terstruktur. Ini membuka workflow baru untuk triase bug, review aksesibilitas, riset kompetitor, draft release notes, dan validasi desain.",
    ],
    neededTitle: "Yang perlu disiapkan",
    neededItems: [
      "Agen AI yang bisa menjalankan command shell, seperti Claude Code, Cursor, atau Codex",
      "Node.js 18+ untuk mendukung skills.sh dan npm install",
      "Browser untuk alur login satu kali",
      "Gambar atau video yang akan dianalisis, baik berupa URL maupun file lokal yang bisa diunggah dulu",
    ],
    callout:
      "Kapabilitas vision biasanya hadir sebagai dua command: image read untuk gambar statis dan video read untuk analisis temporal. Keduanya mengembalikan output teks terstruktur yang bisa dipakai agen untuk reasoning, ringkasan, atau langkah lanjutan.",
    steps: {
      skill: "Instal skill AnyCap",
      cli: "Instal AnyCap CLI",
      login: "Login",
      image: "Gunakan image understanding",
      video: "Gunakan video analysis",
      combine: "Gabungkan vision ke workflow agen",
    },
    useCasesTitle: "Use case paling bernilai untuk vision",
    useCases: [
      {
        title: "Review UI dan QA",
        body: "Minta agen memeriksa screenshot untuk regresi layout, isu aksesibilitas, teks terpotong, atau bug visual sebelum rilis.",
      },
      {
        title: "Review desain dan brand",
        body: "Minta agen membandingkan mockup dengan guideline brand, mengekstrak teks yang terlihat, atau merangkum hierarki dan komposisi layout.",
      },
      {
        title: "Pemahaman video",
        body: "Berikan demo produk, rekaman pengguna, atau materi iklan agar agen merangkum scene, mengambil momen penting, lalu mengubahnya menjadi catatan atau tiket.",
      },
    ],
    interpretationTitle: "Cara memanfaatkan output vision secara efektif",
    interpretationBody: [
      "Fitur vision paling berguna saat hasil analisis masuk ke workflow yang lebih besar, bukan berhenti di caption satu kali. Contohnya, agen membaca screenshot, menemukan isu aksesibilitas, lalu membuka file kode untuk menyarankan perbaikan.",
      "Hal yang sama berlaku untuk video. Ringkasan per scene menjadi jauh lebih bernilai ketika agen mengubahnya menjadi release notes, checklist QA, atau daftar poin produk yang belum dijelaskan. Intinya bukan sekadar mendeskripsikan visual, tetapi membantu agen mengambil keputusan berbasis bukti visual.",
      "Dalam praktik, prompt yang fokus memberi hasil lebih baik daripada prompt generik. Pertanyaan seperti 'Apa isi gambar ini?' tetap berguna, tetapi pertanyaan seperti 'Masalah onboarding apa yang menghambat user baru di screenshot ini?' memberi frame evaluasi yang lebih tajam.",
    ],
    mistakesTitle: "Kesalahan setup dan penggunaan yang sering terjadi",
    mistakes: [
      {
        title: "Lupa langkah upload untuk file lokal",
        body: "Jika input belum tersedia lewat URL, agen harus mengunggah file terlebih dahulu lalu memakai URL hasil upload pada command read.",
      },
      {
        title: "Menggunakan prompt terlalu umum untuk review kompleks",
        body: "Prompt yang terlalu luas memberi jawaban luas. Pertanyaan spesifik tentang aksesibilitas, hierarki informasi, atau urutan fitur menghasilkan output yang lebih bisa ditindaklanjuti.",
      },
      {
        title: "Memperlakukan vision sebagai tugas terpisah",
        body: "Dampak terbesar muncul saat agen menggunakan analisis visual untuk mendorong langkah berikutnya, misalnya membuat bug report, menulis catatan, atau mengusulkan perubahan kode.",
      },
    ],
    faqTitle: "FAQ",
    ctas: {
      claude: "AnyCap untuk Claude Code",
      capability: "Semua Kapabilitas",
      start: "Mulai",
    },
    breadcrumbLabel: "Tambah vision ke agen AI",
  },
  de: {
    eyebrow: "Anleitungen",
    title: ["Visuelle Faehigkeiten zu einem KI-Agenten", "hinzufuegen"],
    intro: [
      "Die meisten KI-Agenten arbeiten mit Text und Code, aber sie koennen nicht sehen, es sei denn, Sie geben ihnen eine visuelle Faehigkeitsoberflaeche. AnyCap fuegt Bildverstaendnis und Videoanalyse hinzu, damit der Agent Screenshots ueberpruefen, Designs begutachten, Demos zusammenfassen und visuelle Belege im selben Workflow beurteilen kann.",
      "Diese Anleitung behandelt die Einrichtung von image read und video read fuer Agenten wie Claude Code, Cursor und Codex. Die Einrichtung ist unkompliziert, aber der Mehrwert entsteht nach der Installation: Der Agent kann von rein textbasiertem Denken zu visueller Inspektion, Extraktion und QA-Aufgaben uebergehen.",
      "Nach der Konfiguration kann Ihr Agent einen Screenshot, ein UI-Mockup oder eine aufgezeichnete Demo als strukturierte Eingabe behandeln. Das eroeffnet neue Workflows fuer Bug-Triage, Barrierefreiheitspruefung, Wettbewerbsforschung, Release-Notes-Erstellung und Design-Validierung.",
    ],
    neededTitle: "Was Sie benoetigen",
    neededItems: [
      "Einen KI-Agenten, der Shell-Befehle ausfuehren kann, wie Claude Code, Cursor oder Codex",
      "Node.js 18+ fuer die Unterstuetzung von skills.sh und npm install",
      "Einen Browser fuer den einmaligen Anmeldevorgang",
      "Bilder oder Videos zur Analyse, entweder als URLs oder lokale Dateien, die zuerst hochgeladen werden koennen",
    ],
    callout:
      "Visuelle Faehigkeiten erscheinen ueblicherweise als zwei Befehle: image read fuer Standbilder und video read fuer zeitliche Analysen. Beide geben strukturierten Text zurueck, ueber den ein Agent nachdenken, zusammenfassen oder Folgemaessnahmen einleiten kann.",
    steps: {
      skill: "AnyCap-Skill installieren",
      cli: "AnyCap CLI installieren",
      login: "Anmelden",
      image: "Bildverstaendnis verwenden",
      video: "Videoanalyse verwenden",
      combine: "Visuelle Faehigkeiten in Agenten-Workflows kombinieren",
    },
    useCasesTitle: "Wo visuelle Faehigkeiten den groessten Mehrwert bieten",
    useCases: [
      {
        title: "UI- und QA-Pruefung",
        body: "Lassen Sie den Agenten Screenshots auf Layout-Regressionen, Barrierefreiheitsprobleme, Textueberlaeufe oder visuelle Bugs vor einem Release ueberpruefen.",
      },
      {
        title: "Design- und Markenpruefung",
        body: "Bitten Sie den Agenten, einen Mockup mit Brand-Guidelines zu vergleichen, sichtbaren Text zu extrahieren oder die Hierarchie und Komposition eines Layouts zusammenzufassen.",
      },
      {
        title: "Videoverstaendnis",
        body: "Uebergeben Sie dem Agenten ein Produktdemo, eine Nutzeraufzeichnung oder ein Werbekreativ, damit er Szenen zusammenfassen, Schluesselmomente extrahieren und die Analyse in Notizen oder Tickets umwandeln kann.",
      },
    ],
    interpretationTitle: "Wie Agenten die visuelle Ausgabe gut nutzen",
    interpretationBody: [
      "Visuelle Funktionen sind am nuetzlichsten, wenn die Analyse Teil eines groesseren Workflows wird, anstatt nur eine einmalige Bildunterschrift zu sein. Beispielsweise kann ein Agent einen Screenshot lesen, Barrierefreiheitsprobleme identifizieren und dann Code-Dateien oeffnen, um eine Korrektur basierend auf dem Gefundenen vorzuschlagen.",
      "Das Gleiche gilt fuer Videos. Eine szenenweise Zusammenfassung wird wertvoller, wenn der Agent sie in Release-Notes, eine QA-Checkliste oder eine Liste fehlender Produkterklaerungen umwandelt. Es geht nicht nur darum, Bilder zu beschreiben, sondern dem Agenten zu helfen, Entscheidungen auf der Grundlage visueller Belege zu treffen.",
      "In der Praxis liefern gezielte Prompts bessere Ergebnisse als generische. Die Frage 'Was ist in diesem Bild?' ist nuetzlich, aber die Frage 'Welche Onboarding-Probleme wuerden einen Erstbenutzer in diesem Screenshot aufhalten?' gibt dem Modell einen schaerferen Bewertungsrahmen.",
    ],
    mistakesTitle: "Haeufige Einrichtungs- und Nutzungsfehler",
    mistakes: [
      {
        title: "Den Upload-Schritt fuer lokale Dateien vergessen",
        body: "Wenn die Eingabe noch nicht ueber eine URL erreichbar ist, muss der Agent sie zuerst hochladen und dann die resultierende URL an den Lesebefehl uebergeben.",
      },
      {
        title: "Generische Prompts fuer komplexe Pruefungen verwenden",
        body: "Breite Prompts liefern breite Antworten. Eine gezielte Frage zur Barrierefreiheit, Informationshierarchie oder Funktionsreihenfolge erzeugt umsetzbarere Ausgaben.",
      },
      {
        title: "Visuelle Faehigkeiten als isolierte Aufgabe behandeln",
        body: "Der groesste Hebel entsteht, wenn der Agent die visuelle Analyse nutzt, um den naechsten Schritt voranzutreiben, z. B. Notizen zu verfassen, Bugs zu erstellen oder Codeaenderungen vorzunehmen.",
      },
    ],
    faqTitle: "FAQ",
    ctas: {
      claude: "AnyCap fuer Claude Code",
      capability: "Alle Faehigkeiten",
      start: "Jetzt starten",
    },
    breadcrumbLabel: "Visuelle Faehigkeiten zu KI-Agent hinzufuegen",
  },
};

export const metadata: Metadata = getPageMetadata(defaultLocale);

const guideJsonLd = createTechArticleJsonLd({
  headline: "How to Add Vision Capabilities to an AI Agent — Image and Video Understanding Guide",
  description:
    "Guide to adding image understanding and video analysis to AI agents like Claude Code, Cursor, and Codex using AnyCap CLI, with setup steps, use cases, and workflow patterns.",
  path: "/guides/how-to-add-vision-to-ai-agent",
  about: ["AI agent vision", "Image understanding", "Video analysis", "AnyCap CLI"],
  keywords: [
    "how to add vision to ai agent",
    "ai agent vision capabilities",
    "image understanding for agents",
    "video analysis for ai agents",
  ],
  datePublished: "2026-04-14",
  dateModified: "2026-04-14",
});

const faqItems = [
  {
    question: "What is the difference between image read and video read?",
    answer:
      "Image read analyzes a single visual frame and returns structured details such as objects, visible text, layout, and context. Video read adds temporal understanding, so the output includes scenes, actions, sequence, and key moments over time.",
  },
  {
    question: "What image and video formats are supported?",
    answer:
      "Image workflows commonly support formats such as JPEG, PNG, WebP, and GIF, while video workflows commonly support MP4, WebM, and MOV. The easiest pattern is to provide a stable URL or let the agent upload the local file first.",
  },
  {
    question: "Can vision capabilities work with locally stored files?",
    answer:
      "Yes. If the file is local, the agent can upload it first and then pass the resulting hosted URL to the image read or video read command. That upload-then-analyze pattern is exactly the kind of operational detail a skill helps automate.",
  },
  {
    question: "What are good first use cases for vision in an agent?",
    answer:
      "Strong early use cases include screenshot QA, accessibility review, extracting information from UI mockups, summarizing product demos, and comparing visuals against design or brand expectations.",
  },
] as const;

const idFaqItems = [
  {
    question: "Apa perbedaan image read dan video read?",
    answer:
      "Image read menganalisis satu frame visual dan mengembalikan detail terstruktur seperti objek, teks yang terlihat, layout, dan konteks. Video read menambahkan dimensi waktu sehingga output mencakup scene, aksi, urutan, dan momen penting sepanjang video.",
  },
  {
    question: "Format gambar dan video apa yang didukung?",
    answer:
      "Untuk gambar, workflow umumnya mendukung JPEG, PNG, WebP, dan GIF. Untuk video, format yang umum adalah MP4, WebM, dan MOV. Pola paling aman adalah memakai URL yang stabil atau biarkan agen mengunggah file lokal terlebih dulu.",
  },
  {
    question: "Apakah kapabilitas vision bisa dipakai untuk file lokal?",
    answer:
      "Bisa. Jika file masih lokal, agen dapat mengunggahnya dulu lalu meneruskan URL hasil upload ke command image read atau video read. Pola upload-lalu-analisis ini justru bagian penting yang diotomasi skill.",
  },
  {
    question: "Use case awal terbaik untuk vision di agen apa saja?",
    answer:
      "Use case awal yang kuat meliputi screenshot QA, review aksesibilitas, ekstraksi informasi dari mockup UI, ringkasan demo produk, dan perbandingan visual terhadap standar desain atau brand.",
  },
] as const;

const deFaqItems = [
  {
    question: "Was ist der Unterschied zwischen image read und video read?",
    answer:
      "Image read analysiert einen einzelnen visuellen Frame und gibt strukturierte Details wie Objekte, sichtbaren Text, Layout und Kontext zurueck. Video read fuegt zeitliches Verstaendnis hinzu, sodass die Ausgabe Szenen, Aktionen, Abfolge und Schluesselmomente im Zeitverlauf umfasst.",
  },
  {
    question: "Welche Bild- und Videoformate werden unterstuetzt?",
    answer:
      "Bild-Workflows unterstuetzen gaengige Formate wie JPEG, PNG, WebP und GIF, waehrend Video-Workflows gaengige Formate wie MP4, WebM und MOV unterstuetzen. Das einfachste Muster ist, eine stabile URL anzugeben oder die lokale Datei zuerst vom Agenten hochladen zu lassen.",
  },
  {
    question: "Funktionieren visuelle Faehigkeiten mit lokal gespeicherten Dateien?",
    answer:
      "Ja. Wenn die Datei lokal ist, kann der Agent sie zuerst hochladen und dann die resultierende gehostete URL an den image read- oder video read-Befehl uebergeben. Dieses Upload-dann-Analyse-Muster ist genau die Art von operativem Detail, das ein Skill zu automatisieren hilft.",
  },
  {
    question: "Was sind gute erste Anwendungsfaelle fuer visuelle Faehigkeiten in einem Agenten?",
    answer:
      "Starke fruehe Anwendungsfaelle umfassen Screenshot-QA, Barrierefreiheitspruefung, Informationsextraktion aus UI-Mockups, Zusammenfassung von Produktdemos und den Vergleich von Visuals mit Design- oder Markenvorgaben.",
  },
] as const;

const localizedStepCopy = {
  en: {
    breadcrumbHome: "Home",
    breadcrumbGuides: "Guides",
    skillForClaude: "# For Claude Code",
    skillForCursor: "# For Cursor",
    skillBody:
      "This installs the AnyCap skill so your agent can discover image and video analysis without improvising the workflow from scratch. The skill explains commands, setup, and the situations where vision should be used.",
    cliPrefix: "Or use ",
    cliSuffix:
      ". The CLI is the runtime surface that executes image and video reads after the skill tells the agent how to call them.",
    loginBody:
      "This authenticates the CLI once so the agent can use visual understanding together with other AnyCap capabilities in the same session.",
    imageReadLabel: "# Analyze an image from a URL",
    imagePromptLabel: "# Analyze with a specific question",
    imagePromptValue: "What accessibility issues do you see?",
    imageBody:
      "The command returns structured details about visible text, objects, layout, and context. Focused prompts usually make the output much more useful for real product work.",
    videoReadLabel: "# Analyze a video",
    videoPromptLabel: "# Analyze with a focused prompt",
    videoPromptValue: "List each feature shown in order",
    videoBody:
      "Video analysis returns scene-level structure, key moments, and temporal relationships, which makes it useful for demos, user recordings, and competitive analysis.",
    workflowLabel: "# UI review workflow",
    workflowPrompt1: "\"Look at this screenshot and identify any UI issues\"",
    workflowLabel2: "# Video summary workflow",
    workflowPrompt2: "\"Watch this demo video and write release notes\"",
    workflowLabel3: "# Combined generation plus vision",
    workflowPrompt3: "\"Generate a hero image, then analyze it for brand consistency\"",
    workflowBody:
      "The agent can orchestrate upload, analysis, interpretation, and follow-up actions without forcing the user to manage each step manually.",
    combineBody:
      "With vision installed, your agent can combine visual input with writing, coding, and planning tasks. That is where the capability becomes more than a captioning tool.",
  },
  id: {
    breadcrumbHome: "Beranda",
    breadcrumbGuides: "Panduan",
    skillForClaude: "# Untuk Claude Code",
    skillForCursor: "# Untuk Cursor",
    skillBody:
      "Langkah ini menginstal skill AnyCap agar agen Anda bisa menemukan workflow image dan video analysis tanpa menyusun alurnya dari nol. Skill menjelaskan command, setup, dan kapan kapabilitas vision sebaiknya dipakai.",
    cliPrefix: "Atau gunakan ",
    cliSuffix:
      ". CLI adalah surface runtime yang menjalankan image read dan video read setelah skill memberi tahu agen cara memanggilnya.",
    loginBody:
      "Perintah ini mengautentikasi CLI satu kali sehingga agen dapat memakai pemahaman visual bersama kapabilitas AnyCap lain dalam sesi yang sama.",
    imageReadLabel: "# Analisis gambar dari URL",
    imagePromptLabel: "# Analisis dengan pertanyaan spesifik",
    imagePromptValue: "Masalah aksesibilitas apa yang terlihat?",
    imageBody:
      "Perintah ini mengembalikan detail terstruktur tentang teks yang terlihat, objek, layout, dan konteks. Prompt yang fokus biasanya memberi hasil yang jauh lebih berguna untuk pekerjaan produk nyata.",
    videoReadLabel: "# Analisis video",
    videoPromptLabel: "# Analisis dengan prompt terfokus",
    videoPromptValue: "Daftarkan setiap fitur yang ditampilkan sesuai urutan",
    videoBody:
      "Video analysis mengembalikan struktur per scene, momen penting, dan hubungan antarbagian waktu, sehingga cocok untuk demo, rekaman pengguna, dan analisis kompetitor.",
    workflowLabel: "# Workflow review UI",
    workflowPrompt1: "\"Lihat screenshot ini dan identifikasi masalah UI\"",
    workflowLabel2: "# Workflow ringkasan video",
    workflowPrompt2: "\"Tonton video demo ini lalu tulis release notes\"",
    workflowLabel3: "# Workflow gabungan generasi + vision",
    workflowPrompt3: "\"Buat hero image lalu analisis konsistensinya terhadap guideline brand\"",
    workflowBody:
      "Agen dapat mengorkestrasi upload, analisis, interpretasi, dan aksi lanjutan tanpa memaksa pengguna mengelola setiap langkah secara manual.",
    combineBody:
      "Setelah vision terpasang, agen Anda dapat menggabungkan input visual dengan tugas penulisan, coding, dan perencanaan. Di sinilah kapabilitas ini menjadi lebih dari sekadar alat pembuat caption.",
  },
  de: {
    breadcrumbHome: "Startseite",
    breadcrumbGuides: "Anleitungen",
    skillForClaude: "# Fuer Claude Code",
    skillForCursor: "# Fuer Cursor",
    skillBody:
      "Dadurch wird der AnyCap-Skill installiert, damit Ihr Agent Bild- und Videoanalyse entdecken kann, ohne den Workflow von Grund auf neu zu improvieren. Der Skill erklaert Befehle, die Einrichtung und die Situationen, in denen visuelle Faehigkeiten eingesetzt werden sollten.",
    cliPrefix: "Oder verwenden Sie ",
    cliSuffix:
      ". Die CLI ist die Runtime-Oberflaeche, die image read und video read ausfuehrt, nachdem der Skill dem Agenten mitgeteilt hat, wie er sie aufrufen soll.",
    loginBody:
      "Dadurch wird die CLI einmalig authentifiziert, sodass der Agent visuelles Verstaendnis zusammen mit anderen AnyCap-Faehigkeiten in derselben Sitzung nutzen kann.",
    imageReadLabel: "# Bild von einer URL analysieren",
    imagePromptLabel: "# Mit einer spezifischen Frage analysieren",
    imagePromptValue: "Welche Barrierefreiheitsprobleme sehen Sie?",
    imageBody:
      "Der Befehl gibt strukturierte Details ueber sichtbaren Text, Objekte, Layout und Kontext zurueck. Gezielte Prompts machen die Ausgabe ueblicherweise fuer echte Produktarbeit viel nuetzlicher.",
    videoReadLabel: "# Video analysieren",
    videoPromptLabel: "# Mit einem gezielten Prompt analysieren",
    videoPromptValue: "Listen Sie alle gezeigten Funktionen in der Reihenfolge auf",
    videoBody:
      "Die Videoanalyse gibt Struktur auf Szenenebene, Schluesselmomente und zeitliche Zusammenhaenge zurueck, was sie fuer Demos, Nutzeraufzeichnungen und Wettbewerbsanalysen nuetzlich macht.",
    workflowLabel: "# UI-Pruefungs-Workflow",
    workflowPrompt1: "\"Sieh dir diesen Screenshot an und identifiziere alle UI-Probleme\"",
    workflowLabel2: "# Video-Zusammenfassungs-Workflow",
    workflowPrompt2: "\"Schau dir dieses Demovideo an und schreibe Release-Notes\"",
    workflowLabel3: "# Kombinierter Generierungs- plus Sicht-Workflow",
    workflowPrompt3: "\"Generiere ein Hero-Bild und analysiere es dann auf Markenkonsistenz\"",
    workflowBody:
      "Der Agent kann Upload, Analyse, Interpretation und Folgemaessnahmen orchestrieren, ohne den Benutzer zu zwingen, jeden Schritt manuell zu verwalten.",
    combineBody:
      "Mit installierten visuellen Faehigkeiten kann Ihr Agent visuelle Eingaben mit Schreib-, Coding- und Planungsaufgaben kombinieren. Hier wird die Faehigkeit zu mehr als nur einem Bildunterschriften-Tool.",
  },
} as const;

export default async function HowToAddVisionPage() {
  const locale = await getRequestLocale();
  const content = contentByLocale[locale === "pt-br" ? "pt-br" : locale === "id" ? "id" : locale === "de" ? "de" : "en"];
  const localizedFaqItems = locale === "id" ? idFaqItems : locale === "de" ? deFaqItems : faqItems;
  const stepCopy = locale === "id" ? localizedStepCopy.id : locale === "de" ? localizedStepCopy.de : localizedStepCopy.en;

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: stepCopy.breadcrumbHome, href: "/" },
          { name: stepCopy.breadcrumbGuides, href: "/guides", unlinkable: true },
          { name: content.breadcrumbLabel },
        ]}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(guideJsonLd) }} />

      <article className="px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[1280px] py-12 md:py-20 lg:py-24">
          <FadeIn>
            <p className="mb-4 text-[11px] tracking-[0.8px] text-[#6b7d3a]" style={mono}>
              {content.eyebrow}
            </p>
            <ArticleByline className="mb-3" />
            <h1
              className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(28px, 5vw, 60px)" }}
            >
              {content.title[0]}
              <br />
              {content.title[1]}
            </h1>
            <div className="mt-6 max-w-[800px] space-y-4">
              {content.intro.map((paragraph) => (
                <p key={paragraph} className="text-base leading-7 text-[#4d5145] md:text-lg">
                  {paragraph}
                </p>
              ))}
            </div>
          </FadeIn>

          <FadeIn className="mt-8">
            <EarlyAccessBanner />
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-6 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.neededTitle}
              </h2>
              <ul className="max-w-[760px] space-y-3">
                {content.neededItems.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm leading-6 text-[#4d5145]">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#6b7d3a]" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <div className="mt-16 max-w-[820px] space-y-10 md:mt-24">
            <FadeIn>
              <p className="max-w-[800px] border border-[#d4dbb8] bg-[#f4f5f0]/50 px-5 py-4 text-sm leading-6 text-[#4d5145]">
                {content.callout}
              </p>
            </FadeIn>

            <FadeIn>
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center bg-[#6b7d3a] text-[13px] font-bold text-[#f4f5f0]" style={mono}>
                  1
                </span>
                <h2 className="text-lg text-[#1c1f17]" style={pixel}>
                  {content.steps.skill}
                </h2>
              </div>
              <div className="bg-[#1c1f17] px-5 py-4">
                <p className="mb-1 text-[13px] text-[#6b7d3a]" style={mono}>
                  {stepCopy.skillForClaude}
                </p>
                <p className="mb-3 text-[13px] text-[#d4e0a4]" style={mono}>
                  npx -y skills add anycap-ai/anycap -a claude-code -y
                </p>
                <p className="mb-1 text-[13px] text-[#6b7d3a]" style={mono}>
                  {stepCopy.skillForCursor}
                </p>
                <p className="text-[13px] text-[#d4e0a4]" style={mono}>
                  npx -y skills add anycap-ai/anycap -a cursor -y
                </p>
              </div>
              <p className="mt-3 text-sm leading-6 text-[#4d5145]">
                {stepCopy.skillBody}
              </p>
            </FadeIn>

            <FadeIn>
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center bg-[#6b7d3a] text-[13px] font-bold text-[#f4f5f0]" style={mono}>
                  2
                </span>
                <h2 className="text-lg text-[#1c1f17]" style={pixel}>
                  {content.steps.cli}
                </h2>
              </div>
              <div className="mb-3 bg-[#1c1f17] px-5 py-4">
                <p className="text-[13px] text-[#d4e0a4]" style={mono}>
                  curl -fsSL https://anycap.ai/install.sh | sh
                </p>
              </div>
              <p className="text-sm leading-6 text-[#4d5145]">
                {stepCopy.cliPrefix}
                <code className="text-[12px] text-[#6b7d3a]" style={mono}>npm install -g @anycap/cli</code>
                {stepCopy.cliSuffix}
              </p>
            </FadeIn>

            <FadeIn>
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center bg-[#6b7d3a] text-[13px] font-bold text-[#f4f5f0]" style={mono}>
                  3
                </span>
                <h2 className="text-lg text-[#1c1f17]" style={pixel}>
                  {content.steps.login}
                </h2>
              </div>
              <div className="bg-[#1c1f17] px-5 py-4">
                <p className="text-[13px] text-[#d4e0a4]" style={mono}>
                  anycap login
                </p>
              </div>
              <p className="mt-3 text-sm leading-6 text-[#4d5145]">
                {stepCopy.loginBody}
              </p>
            </FadeIn>

            <FadeIn>
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center bg-[#6b7d3a] text-[13px] font-bold text-[#f4f5f0]" style={mono}>
                  4
                </span>
                <h2 className="text-lg text-[#1c1f17]" style={pixel}>
                  {content.steps.image}
                </h2>
              </div>
              <div className="bg-[#1c1f17] px-5 py-4">
                <p className="mb-1 text-[13px] text-[#6b7d3a]" style={mono}>
                  {stepCopy.imageReadLabel}
                </p>
                <p className="mb-3 text-[13px] text-[#d4e0a4]" style={mono}>
                  anycap image read --url https://example.com/screenshot.png
                </p>
                <p className="mb-1 text-[13px] text-[#6b7d3a]" style={mono}>
                  {stepCopy.imagePromptLabel}
                </p>
                <p className="text-[13px] text-[#d4e0a4]" style={mono}>
                  {`anycap image read --url https://example.com/ui.png --prompt "${stepCopy.imagePromptValue}"`}
                </p>
              </div>
              <p className="mt-3 text-sm leading-6 text-[#4d5145]">
                {stepCopy.imageBody}
              </p>
            </FadeIn>

            <FadeIn>
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center bg-[#6b7d3a] text-[13px] font-bold text-[#f4f5f0]" style={mono}>
                  5
                </span>
                <h2 className="text-lg text-[#1c1f17]" style={pixel}>
                  {content.steps.video}
                </h2>
              </div>
              <div className="bg-[#1c1f17] px-5 py-4">
                <p className="mb-1 text-[13px] text-[#6b7d3a]" style={mono}>
                  {stepCopy.videoReadLabel}
                </p>
                <p className="mb-3 text-[13px] text-[#d4e0a4]" style={mono}>
                  anycap video read --url https://example.com/demo.mp4
                </p>
                <p className="mb-1 text-[13px] text-[#6b7d3a]" style={mono}>
                  {stepCopy.videoPromptLabel}
                </p>
                <p className="text-[13px] text-[#d4e0a4]" style={mono}>
                  {`anycap video read --url https://example.com/demo.mp4 --prompt "${stepCopy.videoPromptValue}"`}
                </p>
              </div>
              <p className="mt-3 text-sm leading-6 text-[#4d5145]">
                {stepCopy.videoBody}
              </p>
            </FadeIn>

            <FadeIn>
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center bg-[#6b7d3a] text-[13px] font-bold text-[#f4f5f0]" style={mono}>
                  6
                </span>
                <h2 className="text-lg text-[#1c1f17]" style={pixel}>
                  {content.steps.combine}
                </h2>
              </div>
              <p className="max-w-[760px] text-sm leading-6 text-[#4d5145]">
                {stepCopy.combineBody}
              </p>
              <div className="mt-3 bg-[#1c1f17] px-5 py-4">
                <p className="mb-1 text-[13px] text-[#6b7d3a]" style={mono}>
                  {stepCopy.workflowLabel}
                </p>
                <p className="mb-3 text-[13px] text-[#d4e0a4]" style={mono}>
                  {stepCopy.workflowPrompt1}
                </p>
                <p className="mb-1 text-[13px] text-[#6b7d3a]" style={mono}>
                  {stepCopy.workflowLabel2}
                </p>
                <p className="mb-3 text-[13px] text-[#d4e0a4]" style={mono}>
                  {stepCopy.workflowPrompt2}
                </p>
                <p className="mb-1 text-[13px] text-[#6b7d3a]" style={mono}>
                  {stepCopy.workflowLabel3}
                </p>
                <p className="text-[13px] text-[#d4e0a4]" style={mono}>
                  {stepCopy.workflowPrompt3}
                </p>
              </div>
              <p className="mt-3 text-sm leading-6 text-[#4d5145]">
                {stepCopy.workflowBody}
              </p>
            </FadeIn>
          </div>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.useCasesTitle}
              </h2>
              <div className="grid gap-4 md:grid-cols-3">
                {content.useCases.map((item) => (
                  <div key={item.title} className="rounded-xl border border-[#d4dbb8] bg-[#fffffc]/70 p-5">
                    <h3 className="mb-2 text-[14px] font-bold text-[#1c1f17]" style={mono}>
                      {item.title}
                    </h3>
                    <p className="text-sm leading-6 text-[#4d5145]">{item.body}</p>
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
              <h2 className="mb-6 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.interpretationTitle}
              </h2>
              <div className="max-w-[820px] space-y-4">
                {content.interpretationBody.map((paragraph) => (
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
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.mistakesTitle}
              </h2>
              <div className="grid gap-4 md:grid-cols-3">
                {content.mistakes.map((item) => (
                  <div key={item.title} className="rounded-xl border border-[#d4dbb8] bg-[#fffffc]/70 p-5">
                    <h3 className="mb-2 text-[14px] font-bold text-[#1c1f17]" style={mono}>
                      {item.title}
                    </h3>
                    <p className="text-sm leading-6 text-[#4d5145]">{item.body}</p>
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
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.faqTitle}
              </h2>
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

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24 mb-8">
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/for/claude-code"
                  className="inline-block rounded-lg bg-[#6b7d3a] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#f4f5f0] transition-colors hover:bg-[#1c1f17]"
                  style={mono}
                >
                  {content.ctas.claude}
                </Link>
                <Link
                  href="/capabilities"
                  className="inline-block rounded-lg border border-[#1c1f17] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                  style={mono}
                >
                  {content.ctas.capability}
                </Link>
                <Link
                  href="/start"
                  className="inline-block rounded-lg border border-[#1c1f17] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                  style={mono}
                >
                  {content.ctas.start}
                </Link>
              </div>
            </section>
          </FadeIn>
        </div>
      </article>
    </>
  );
}
