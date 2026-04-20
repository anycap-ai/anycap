import type { Metadata } from "next";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { EarlyAccessBanner } from "@/components/landing/EarlyAccessBanner";
import { FadeIn } from "@/components/ui/FadeIn";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { ArticleByline } from "@/components/seo/ArticleByline";
import { createTechArticleJsonLd, createFaqPageJsonLd } from "@/lib/schema";
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
    discover: string;
    firstVideo: string;
    workflow: string;
  };
  useCasesTitle: string;
  useCases: { title: string; body: string }[];
  promptsTitle: string;
  promptsBody: string[];
  mistakesTitle: string;
  mistakes: { title: string; body: string }[];
  faqTitle: string;
  ctas: {
    claude: string;
    video: string;
    start: string;
  };
  breadcrumbLabel: string;
};

const contentByLocale: Record<"en" | "pt-br" | "id" | "de", PageContent> = {
  en: {
    eyebrow: "Guides",
    title: ["How to add video generation", "to an AI agent"],
    intro: [
      "AI agents can write code, answer questions, and automate workflows, but they cannot create videos on their own. AnyCap adds video generation capabilities through a skill file and CLI so the agent can discover models, submit jobs, and wait for results without leaving the workflow.",
      "This guide walks through adding video generation to any AI agent, including Claude Code, Cursor, and Codex. It covers setup, model discovery, prompt structure, and the async workflow that turns a plain-language request into a finished video asset.",
      "The practical goal is simple: after setup, your agent should be able to treat video generation like any other tool call. A user can ask for a product demo, motion concept, or short social clip, and the agent can handle the end-to-end execution path for them.",
    ],
    neededTitle: "What you need",
    neededItems: [
      "An AI agent that can run shell commands (Claude Code, Cursor, Codex, and similar tools)",
      "Node.js 18+ for skills.sh and npm-based installation flows",
      "A browser for the one-time login flow",
      "A clear prompt or a reference image for the first generation test",
    ],
    callout:
      "Video generation is asynchronous. The CLI submits the request, polls until the job is finished, and returns the result URL. Your agent can manage that polling loop automatically after setup.",
    steps: {
      skill: "Install the AnyCap skill",
      cli: "Install the AnyCap CLI",
      login: "Log in",
      discover: "Discover available video models",
      firstVideo: "Generate your first video",
      workflow: "Use video generation in agent workflows",
    },
    useCasesTitle: "Where video generation helps most",
    useCases: [
      {
        title: "Product demos",
        body: "Turn release notes or a feature summary into a short product demo video that an agent can generate as part of launch prep.",
      },
      {
        title: "Marketing experiments",
        body: "Ask the agent for multiple short variations of an ad concept, hero animation, or social teaser without leaving the terminal workflow.",
      },
      {
        title: "Design handoff",
        body: "Animate a static mockup into a walkthrough video so teams can review motion and narrative earlier in the design cycle.",
      },
    ],
    promptsTitle: "How to get better video outputs",
    promptsBody: [
      "Prompt quality matters more for video than for many text tasks because the model has to infer shot composition, movement, duration, and visual continuity. A short vague prompt often still works, but a structured prompt usually gives more repeatable results.",
      "For best results, tell the agent the subject, camera motion, scene, lighting, tone, and length. If you have a visual starting point, use a reference image so the agent can anchor the video around a specific layout or art direction.",
      "A good pattern is to ask the agent for a draft prompt first, review it, and then have it run the generation command. That keeps the workflow collaborative while still letting the agent handle the operational details.",
    ],
    mistakesTitle: "Common setup and workflow mistakes",
    mistakes: [
      {
        title: "Skipping model discovery",
        body: "Different models have different strengths, durations, and motion styles. Running anycap video models first helps the agent choose a model that matches the request.",
      },
      {
        title: "Using underspecified prompts",
        body: "A request like 'make a product video' is usually too broad. Add scene context, pacing, camera direction, and intended use so the agent can build a stronger prompt.",
      },
      {
        title: "Treating video generation like a synchronous command",
        body: "Video jobs take time. The agent should submit the request, keep polling, and only continue the workflow after the result URL is available.",
      },
    ],
    faqTitle: "FAQ",
    ctas: {
      claude: "AnyCap for Claude Code",
      video: "Video Generation",
      start: "Get Started",
    },
    breadcrumbLabel: "Add Video Generation to AI Agent",
  },
  "pt-br": {
    eyebrow: "Guias",
    title: ["Como adicionar geracao de video", "a um agente de IA"],
    intro: [
      "Agentes de IA conseguem escrever codigo, responder perguntas e automatizar workflows, mas nao conseguem criar videos sozinhos. O AnyCap adiciona geracao de video por meio de uma skill e da CLI para que o agente descubra modelos, envie jobs e aguarde o resultado sem sair do fluxo.",
      "Este guia mostra como adicionar geracao de video a qualquer agente de IA, incluindo Claude Code, Cursor e Codex. Ele cobre setup, descoberta de modelos, estrutura de prompt e o fluxo assincrono que transforma um pedido em linguagem natural em um video pronto.",
      "O objetivo pratico e simples: depois do setup, seu agente deve tratar geracao de video como mais uma chamada de ferramenta. O usuario pede um demo, um conceito em motion ou um clipe curto, e o agente cuida da execucao de ponta a ponta.",
    ],
    neededTitle: "O que voce precisa",
    neededItems: [
      "Um agente de IA que consiga executar comandos de shell, como Claude Code, Cursor, Codex e ferramentas semelhantes",
      "Node.js 18+ para skills.sh e fluxos de instalacao via npm",
      "Um navegador para o login unico",
      "Um prompt claro ou uma imagem de referencia para o primeiro teste",
    ],
    callout:
      "A geracao de video e assincrona. A CLI envia a requisicao, faz polling ate o job terminar e retorna a URL final. Depois do setup, seu agente pode cuidar desse polling automaticamente.",
    steps: {
      skill: "Instale a skill do AnyCap",
      cli: "Instale a CLI do AnyCap",
      login: "Faca login",
      discover: "Descubra os modelos de video disponiveis",
      firstVideo: "Gere seu primeiro video",
      workflow: "Use geracao de video nos workflows do agente",
    },
    useCasesTitle: "Onde geracao de video ajuda mais",
    useCases: [
      {
        title: "Demos de produto",
        body: "Transforme release notes ou um resumo de features em um video curto de demonstracao gerado pelo agente durante a preparacao do lancamento.",
      },
      {
        title: "Experimentos de marketing",
        body: "Peca ao agente varias variacoes curtas de um conceito de anuncio, animacao hero ou teaser social sem sair do workflow do terminal.",
      },
      {
        title: "Handoff de design",
        body: "Anime um mockup estatico em um walkthrough para que o time revise movimento e narrativa mais cedo no ciclo de design.",
      },
    ],
    promptsTitle: "Como conseguir videos melhores",
    promptsBody: [
      "A qualidade do prompt importa mais em video do que em muitas tarefas de texto porque o modelo precisa inferir composicao, movimento, duracao e continuidade visual. Um prompt curto e vago pode funcionar, mas um prompt estruturado tende a ser mais repetivel.",
      "Para melhores resultados, diga ao agente o assunto, movimento de camera, cena, iluminacao, tom e duracao. Se voce ja tem uma direcao visual, use uma imagem de referencia para ancorar o resultado.",
      "Um bom padrao e pedir primeiro ao agente um rascunho de prompt, revisar esse rascunho e depois mandar executar o comando. Assim o fluxo continua colaborativo sem abrir mao da automacao.",
    ],
    mistakesTitle: "Erros comuns de setup e workflow",
    mistakes: [
      {
        title: "Pular a descoberta de modelos",
        body: "Modelos diferentes tem forcas, duracoes e estilos de movimento diferentes. Rodar anycap video models primeiro ajuda o agente a escolher melhor.",
      },
      {
        title: "Usar prompts pouco especificos",
        body: "Um pedido como 'faz um video do produto' costuma ser amplo demais. Acrescente contexto de cena, ritmo, camera e objetivo final.",
      },
      {
        title: "Tratar geracao de video como comando sincrono",
        body: "Jobs de video levam tempo. O agente precisa enviar a requisicao, continuar fazendo polling e so depois seguir o workflow.",
      },
    ],
    faqTitle: "FAQ",
    ctas: {
      claude: "AnyCap para Claude Code",
      video: "Geracao de Video",
      start: "Comecar",
    },
    breadcrumbLabel: "Adicionar geracao de video ao agente de IA",
  },
  id: {
    eyebrow: "Panduan",
    title: ["Cara menambahkan generasi video", "ke agen AI"],
    intro: [
      "Agen AI bisa menulis kode, menjawab pertanyaan, dan mengotomasi workflow, tetapi tidak bisa membuat video sendiri. AnyCap menambahkan kapabilitas generasi video lewat file skill dan CLI agar agen bisa menemukan model, mengirim job, dan menunggu hasil tanpa keluar dari workflow.",
      "Panduan ini menjelaskan cara menambahkan generasi video ke agen AI apa pun, termasuk Claude Code, Cursor, dan Codex. Isinya mencakup setup, discovery model, struktur prompt, dan workflow asinkron yang mengubah permintaan bahasa alami menjadi aset video siap pakai.",
      "Tujuan praktisnya sederhana: setelah setup, agen Anda bisa memperlakukan generasi video seperti panggilan tool biasa. Pengguna cukup meminta demo produk, konsep motion, atau klip sosial singkat, lalu agen menjalankan alur end-to-end.",
    ],
    neededTitle: "Yang perlu disiapkan",
    neededItems: [
      "Agen AI yang bisa menjalankan perintah shell (Claude Code, Cursor, Codex, dan tool sejenis)",
      "Node.js 18+ untuk skills.sh dan alur instalasi berbasis npm",
      "Browser untuk alur login sekali saja",
      "Prompt yang jelas atau gambar referensi untuk uji generasi pertama",
    ],
    callout:
      "Generasi video bersifat asinkron. CLI mengirim request, melakukan polling sampai job selesai, lalu mengembalikan URL hasil. Setelah setup, agen bisa mengelola polling ini otomatis.",
    steps: {
      skill: "Instal skill AnyCap",
      cli: "Instal AnyCap CLI",
      login: "Login",
      discover: "Temukan model video yang tersedia",
      firstVideo: "Buat video pertama Anda",
      workflow: "Gunakan generasi video dalam workflow agen",
    },
    useCasesTitle: "Kasus penggunaan paling umum",
    useCases: [
      {
        title: "Demo produk",
        body: "Ubah release notes atau ringkasan fitur menjadi video demo singkat yang bisa dibuat agen saat persiapan launch.",
      },
      {
        title: "Eksperimen marketing",
        body: "Minta agen membuat beberapa variasi singkat untuk konsep iklan, animasi hero, atau teaser sosial tanpa keluar dari workflow terminal.",
      },
      {
        title: "Handoff desain",
        body: "Animasikan mockup statis menjadi video walkthrough agar tim bisa meninjau gerak dan narasi lebih awal di siklus desain.",
      },
    ],
    promptsTitle: "Cara mendapatkan output video yang lebih baik",
    promptsBody: [
      "Kualitas prompt lebih menentukan pada video dibanding banyak tugas teks karena model harus menebak komposisi shot, gerakan, durasi, dan kontinuitas visual. Prompt pendek dan samar tetap bisa jalan, tetapi prompt terstruktur biasanya jauh lebih konsisten.",
      "Untuk hasil terbaik, beri tahu agen tentang subjek, gerakan kamera, adegan, pencahayaan, tone, dan durasi. Jika sudah ada arahan visual, gunakan gambar referensi agar video tetap terikat pada layout atau art direction yang jelas.",
      "Pola yang aman adalah meminta agen membuat draf prompt dulu, Anda review, lalu agen menjalankan command generation. Alur tetap kolaboratif tanpa kehilangan otomasi.",
    ],
    mistakesTitle: "Kesalahan setup dan workflow yang sering terjadi",
    mistakes: [
      {
        title: "Melewatkan discovery model",
        body: "Setiap model punya kekuatan, durasi, dan gaya gerak yang berbeda. Menjalankan anycap video models lebih dulu membantu agen memilih model yang sesuai kebutuhan.",
      },
      {
        title: "Menggunakan prompt yang terlalu umum",
        body: "Permintaan seperti 'buat video produk' biasanya terlalu luas. Tambahkan konteks adegan, pacing, arah kamera, dan tujuan akhir agar prompt agen lebih kuat.",
      },
      {
        title: "Menganggap generasi video sebagai command sinkron",
        body: "Job video butuh waktu. Agen harus mengirim request, terus polling, lalu lanjut workflow hanya setelah URL hasil tersedia.",
      },
    ],
    faqTitle: "FAQ",
    ctas: {
      claude: "AnyCap untuk Claude Code",
      video: "Generasi Video",
      start: "Mulai",
    },
    breadcrumbLabel: "Tambah generasi video ke agen AI",
  },
  de: {
    eyebrow: "Anleitungen",
    title: ["Videogenerierung zu einem KI-Agenten", "hinzufuegen"],
    intro: [
      "KI-Agenten koennen Code schreiben, Fragen beantworten und Workflows automatisieren, aber sie koennen keine Videos eigenstaendig erstellen. AnyCap ergaenzt die Videogenerierung ueber eine Skill-Datei und eine CLI, damit der Agent Modelle entdecken, Jobs einreichen und auf Ergebnisse warten kann, ohne den Workflow zu verlassen.",
      "Diese Anleitung zeigt, wie Sie Videogenerierung zu einem beliebigen KI-Agenten hinzufuegen, einschliesslich Claude Code, Cursor und Codex. Sie deckt die Einrichtung, die Modellsuche, den Prompt-Aufbau und den asynchronen Workflow ab, der eine Anfrage in natuerlicher Sprache in ein fertiges Videoasset umwandelt.",
      "Das praktische Ziel ist einfach: Nach der Einrichtung sollte Ihr Agent Videogenerierung wie jeden anderen Tool-Aufruf behandeln koennen. Ein Benutzer kann ein Produktdemo, ein Motion-Konzept oder einen kurzen Social-Clip anfordern, und der Agent uebernimmt den gesamten Ausfuehrungsweg.",
    ],
    neededTitle: "Was Sie benoetigen",
    neededItems: [
      "Einen KI-Agenten, der Shell-Befehle ausfuehren kann (Claude Code, Cursor, Codex und aehnliche Tools)",
      "Node.js 18+ fuer skills.sh und npm-basierte Installationsablaeufe",
      "Einen Browser fuer den einmaligen Anmeldevorgang",
      "Einen klaren Prompt oder ein Referenzbild fuer den ersten Generierungstest",
    ],
    callout:
      "Videogenerierung ist asynchron. Die CLI sendet die Anfrage, fragt den Status ab bis der Job abgeschlossen ist, und gibt die Ergebnis-URL zurueck. Ihr Agent kann diese Abfrageschleife nach der Einrichtung automatisch verwalten.",
    steps: {
      skill: "AnyCap-Skill installieren",
      cli: "AnyCap CLI installieren",
      login: "Anmelden",
      discover: "Verfuegbare Videomodelle entdecken",
      firstVideo: "Ihr erstes Video generieren",
      workflow: "Videogenerierung in Agenten-Workflows verwenden",
    },
    useCasesTitle: "Wo Videogenerierung am meisten hilft",
    useCases: [
      {
        title: "Produktdemos",
        body: "Verwandeln Sie Release-Notes oder eine Feature-Zusammenfassung in ein kurzes Produktdemovideo, das ein Agent als Teil der Startvorbereitung generieren kann.",
      },
      {
        title: "Marketing-Experimente",
        body: "Bitten Sie den Agenten um mehrere kurze Varianten eines Werbekonzepts, einer Hero-Animation oder eines Social-Teasers, ohne den Terminal-Workflow zu verlassen.",
      },
      {
        title: "Design-Handoff",
        body: "Animieren Sie einen statischen Mockup zu einem Walkthrough-Video, damit Teams Bewegung und Erzaehlung frueher im Designzyklus ueberpruefen koennen.",
      },
    ],
    promptsTitle: "Bessere Video-Ausgaben erzielen",
    promptsBody: [
      "Die Prompt-Qualitaet ist bei Videos wichtiger als bei vielen Textaufgaben, da das Modell Bildkomposition, Bewegung, Dauer und visuelle Kontinuitaet erschliessen muss. Ein kurzer vager Prompt funktioniert oft noch, aber ein strukturierter Prompt liefert in der Regel reproduzierbarere Ergebnisse.",
      "Fuer beste Ergebnisse teilen Sie dem Agenten das Motiv, die Kamerabewegung, die Szene, die Beleuchtung, den Ton und die Laenge mit. Wenn Sie einen visuellen Ausgangspunkt haben, verwenden Sie ein Referenzbild, damit der Agent das Video um ein bestimmtes Layout oder eine Artdirection verankern kann.",
      "Ein gutes Muster ist, den Agenten zuerst um einen Entwurfs-Prompt zu bitten, diesen zu ueberpruefen und ihn dann den Generierungsbefehl ausfuehren zu lassen. Das haelt den Workflow kollaborativ, waehrend der Agent trotzdem die operativen Details uebernimmt.",
    ],
    mistakesTitle: "Haeufige Einrichtungs- und Workflow-Fehler",
    mistakes: [
      {
        title: "Modellsuche ueberspringen",
        body: "Verschiedene Modelle haben unterschiedliche Staerken, Dauern und Bewegungsstile. Das vorherige Ausfuehren von anycap video models hilft dem Agenten, ein Modell zu waehlen, das zur Anfrage passt.",
      },
      {
        title: "Unterspezifizierte Prompts verwenden",
        body: "Eine Anfrage wie 'Erstelle ein Produktvideo' ist ueblicherweise zu allgemein. Fuegen Sie Szenenkontext, Tempo, Kamerarichtung und beabsichtigten Verwendungszweck hinzu, damit der Agent einen staerkeren Prompt erstellen kann.",
      },
      {
        title: "Videogenerierung wie einen synchronen Befehl behandeln",
        body: "Videojobs benoetigen Zeit. Der Agent sollte die Anfrage senden, weiterhin den Status abfragen und den Workflow erst fortsetzen, wenn die Ergebnis-URL verfuegbar ist.",
      },
    ],
    faqTitle: "FAQ",
    ctas: {
      claude: "AnyCap fuer Claude Code",
      video: "Videogenerierung",
      start: "Jetzt starten",
    },
    breadcrumbLabel: "Videogenerierung zu KI-Agent hinzufuegen",
  },
};

export const metadata: Metadata = getPageMetadata(defaultLocale);

const guideJsonLd = createTechArticleJsonLd({
  headline: "How to Add Video Generation to an AI Agent — Step-by-Step Setup Guide",
  description:
    "Guide to adding video generation to AI agents like Claude Code, Cursor, and Codex using AnyCap CLI with model discovery, prompt guidance, and async workflow patterns.",
  path: "/guides/how-to-add-video-generation-to-ai-agent",
  about: ["AI agent video generation", "AnyCap CLI", "Veo 3.1", "Kling 3.0"],
  keywords: [
    "how to add video generation to ai agent",
    "ai agent video generation",
    "add video generation to claude code",
    "anycap video generate",
  ],
  datePublished: "2026-04-14",
  dateModified: "2026-04-14",
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
      text: "Run the skills installer to place the AnyCap skill into your agent's skills directory. For Claude Code: npx -y skills add anycap-ai/anycap -a claude-code -y",
    },
    {
      "@type": "HowToStep",
      name: "Install the AnyCap CLI",
      text: "Run curl -fsSL https://anycap.ai/install.sh | sh to install the CLI binary, or use npm install -g @anycap/cli.",
    },
    {
      "@type": "HowToStep",
      name: "Log in",
      text: "Run anycap login to authenticate. The one-time login covers video generation and the rest of the AnyCap capability surface.",
    },
    {
      "@type": "HowToStep",
      name: "Discover available video models",
      text: "Run anycap video models to inspect available models such as Veo 3.1 and Kling 3.0 and choose the one that fits your request.",
    },
    {
      "@type": "HowToStep",
      name: "Generate your first video",
      text: "Run anycap video generate --model veo-3.1 --prompt 'a drone shot over a mountain lake at sunrise' to create your first AI-generated video.",
    },
    {
      "@type": "HowToStep",
      name: "Use video generation in agent workflows",
      text: "Ask your agent for a video naturally. It can construct the prompt, submit the job, and wait for the final result URL automatically.",
    },
  ],
};

const faqItems = [
  {
    question: "Which video models does AnyCap support?",
    answer:
      "AnyCap provides access to multiple video generation models including Veo 3.1, Kling 3.0, and others. Run anycap video models to see the currently available options and choose based on motion style, duration, and output goals.",
  },
  {
    question: "How long does video generation take?",
    answer:
      "Video generation is asynchronous. The CLI submits the request and polls for completion. Many jobs finish within tens of seconds to a few minutes depending on the model, queue state, and settings. Agents can handle that waiting loop for you.",
  },
  {
    question: "Can I generate videos from reference images?",
    answer:
      "Yes. Some models support image-to-video generation. Upload a reference image using AnyCap Drive or provide the relevant asset path so the agent can anchor the motion around an existing design or frame.",
  },
  {
    question: "Does this work with agents other than Claude Code?",
    answer:
      "Yes. Any agent that can run shell commands can use AnyCap video generation, including Cursor, Codex, and similar tools. Install the corresponding skill target and the rest of the workflow stays nearly the same.",
  },
] as const;

export default async function HowToAddVideoGenerationPage() {
  const locale = await getRequestLocale();
  const content =
    contentByLocale[locale === "pt-br" ? "pt-br" : locale === "id" ? "id" : locale === "de" ? "de" : "en"];
  const localizedFaqItems =
    locale === "id"
      ? [
          {
            question: "Model video apa saja yang didukung AnyCap?",
            answer:
              "AnyCap memberi akses ke beberapa model generasi video seperti Veo 3.1, Kling 3.0, dan lainnya. Jalankan anycap video models untuk melihat opsi yang tersedia lalu pilih berdasarkan gaya gerak, durasi, dan target output.",
          },
          {
            question: "Berapa lama proses generasi video?",
            answer:
              "Generasi video berjalan asinkron. CLI mengirim request lalu polling sampai selesai. Banyak job selesai dalam puluhan detik sampai beberapa menit, tergantung model, antrean, dan pengaturan. Agen bisa menangani loop tunggu ini otomatis.",
          },
          {
            question: "Apakah bisa membuat video dari gambar referensi?",
            answer:
              "Bisa. Beberapa model mendukung image-to-video. Unggah gambar referensi lewat AnyCap Drive atau berikan path aset yang relevan agar agen bisa menjaga gerakan tetap sesuai frame awal.",
          },
          {
            question: "Apakah ini hanya untuk Claude Code?",
            answer:
              "Tidak. Semua agen yang bisa menjalankan command shell dapat memakai generasi video AnyCap, termasuk Cursor, Codex, dan tool sejenis. Instal target skill yang sesuai dan alur lainnya hampir sama.",
          },
        ]
      : locale === "de"
      ? [
          {
            question: "Welche Videomodelle unterstuetzt AnyCap?",
            answer:
              "AnyCap bietet Zugang zu mehreren Videogenerierungsmodellen, darunter Veo 3.1, Kling 3.0 und weitere. Fuehren Sie anycap video models aus, um die aktuell verfuegbaren Optionen anzuzeigen, und waehlen Sie basierend auf Bewegungsstil, Dauer und Ausgabezielen.",
          },
          {
            question: "Wie lange dauert die Videogenerierung?",
            answer:
              "Videogenerierung ist asynchron. Die CLI sendet die Anfrage und fragt den Status bis zum Abschluss ab. Viele Jobs werden innerhalb weniger Sekunden bis einiger Minuten abgeschlossen, abhangig von Modell, Warteschlangenstatus und Einstellungen. Agenten koennen diese Warteschleife fuer Sie uebernehmen.",
          },
          {
            question: "Kann ich Videos aus Referenzbildern generieren?",
            answer:
              "Ja. Einige Modelle unterstuetzen die Bild-zu-Video-Generierung. Laden Sie ein Referenzbild ueber AnyCap Drive hoch oder geben Sie den entsprechenden Asset-Pfad an, damit der Agent die Bewegung um ein vorhandenes Design oder einen Frame verankern kann.",
          },
          {
            question: "Funktioniert das auch mit anderen Agenten als Claude Code?",
            answer:
              "Ja. Jeder Agent, der Shell-Befehle ausfuehren kann, kann die AnyCap-Videogenerierung verwenden, einschliesslich Cursor, Codex und aehnlicher Tools. Installieren Sie das entsprechende Skill-Target und der Rest des Workflows bleibt nahezu identisch.",
          },
        ]
      : faqItems;
  const faqJsonLd = createFaqPageJsonLd(localizedFaqItems);
  const localizedCopy =
    locale === "id"
      ? {
          skillBody:
            "Perintah ini menaruh skill AnyCap ke direktori skills agen Anda. File ini memberi instruksi yang bisa ditemukan agen untuk generasi video, jadi agen tahu command apa yang harus dijalankan tanpa menebak dari dokumentasi.",
          cliBody:
            "Atau gunakan npm install -g @anycap/cli. CLI adalah surface eksekusi yang benar-benar mengirim dan melacak job multimodal.",
          loginBody:
            "Ini membuka alur autentikasi lewat browser. Satu kali login sudah mencakup generasi video dan kapabilitas AnyCap lainnya, jadi workflow agen lebih sederhana.",
          discoverBody:
            "Perintah ini menampilkan model video yang tersedia dan sebaiknya dijalankan sebelum run pertama. Agen bisa memakai output ini untuk memilih model yang tepat alih-alih selalu hardcode model yang sama.",
          firstVideoBody:
            "CLI akan mengirim request lalu polling sampai video siap. Setelah job selesai, CLI mengembalikan URL hasil agar agen bisa lanjut ke langkah posting, embed, atau review.",
          workflowBody:
            "Setelah setup selesai, agen bisa membuat video langsung dari permintaan bahasa alami. Agen dapat memilih model, menyusun prompt, mengirim job generation, lalu menunggu hasil tanpa pengawasan command-per-command.",
          askLabel: "# Minta langsung ke agen Anda",
          refLabel: "# Atau buat dari gambar referensi",
          askPrompt: "\"Buat video demo produk berdurasi 5 detik untuk fitur baru kami\"",
          refPrompt: "\"Animasikan mockup ini menjadi walkthrough onboarding singkat\"",
          workflowFooter:
            "Agen membaca skill, memakai CLI sebagai runtime, dan mengelola alur generasi asinkron dari awal sampai akhir.",
        }
      : locale === "de"
      ? {
          skillBody:
            "Dadurch wird der AnyCap-Skill in das Skill-Verzeichnis Ihres Agenten eingefuegt. Die Datei gibt dem Agenten auffindbare Anweisungen fuer die Videogenerierung, sodass er weiss, welche Befehle auszufuehren sind, ohne aus der Dokumentation zu improvisieren.",
          cliBody:
            "Oder verwenden Sie npm install -g @anycap/cli. Die CLI ist die Ausfuehrungsoberflaeche, die multimodale Jobs tatsaechlich sendet und verfolgt.",
          loginBody:
            "Dadurch wird der browserbasierte Authentifizierungsablauf geoeffnet. Eine einmalige Anmeldung deckt die Videogenerierung und den Rest der AnyCap-Faehigkeiten ab, was Agenten-Workflows spaeter vereinfacht.",
          discoverBody:
            "Dadurch werden die verfuegbaren Videomodelle aufgelistet, was vor dem ersten Ausfuehren empfehlenswert ist. Agenten koennen diese Ausgabe nutzen, um die Anfrage dem besten verfuegbaren Modell zuzuordnen, anstatt jedes Mal dieselbe Wahl fest zu codieren.",
          firstVideoBody:
            "Die CLI sendet die Anfrage und fragt den Status ab, bis das Video fertig ist. Sobald der Job abgeschlossen ist, gibt sie die resultierende URL zurueck, damit der Agent mit den Schritten zur Veroeffentlichung, Einbettung oder Ueberprueue fortfahren kann.",
          workflowBody:
            "Nach Abschluss der Einrichtung kann Ihr Agent Videos aus Anfragen in natuerlicher Sprache generieren. Er kann ein Modell auswaehlen, einen Prompt erstellen, den Generierungsjob einreichen und auf den Abschluss warten, ohne manuelle Befehl-fuer-Befehl-Ueberwachung.",
          askLabel: "# Bitten Sie Ihren Agenten direkt",
          refLabel: "# Oder aus einem Referenzbild generieren",
          askPrompt: "\"Erstelle ein 5-Sekunden-Produktdemovideo fuer unsere neue Funktion\"",
          refPrompt: "\"Animiere diesen Mockup zu einem kurzen Onboarding-Walkthrough\"",
          workflowFooter:
            "Der Agent liest den Skill, verwendet die CLI als Runtime und verwaltet den asynchronen Generierungsablauf von Anfang bis Ende.",
        }
      : {
          skillBody:
            "This places the AnyCap skill into your agent's skills directory. The file gives the agent discoverable instructions for video generation so it knows which commands to run instead of improvising from docs.",
          cliBody:
            "Or use npm install -g @anycap/cli. The CLI is the execution surface that actually submits and tracks multimodal jobs.",
          loginBody:
            "This opens the browser-based auth flow. One login covers video generation and the rest of the AnyCap capability set, which keeps agent workflows simpler later on.",
          discoverBody:
            "This lists the available video models and is worth doing before the first run. Agents can use that output to match the request to the best available model instead of hardcoding the same choice every time.",
          firstVideoBody:
            "The CLI submits the request and polls until the video is ready. Once the job finishes, it returns the resulting URL so the agent can continue with posting, embedding, or review steps.",
          workflowBody:
            "Once setup is complete, your agent can generate videos from natural-language requests. It can select a model, draft a prompt, submit the generation job, and wait for completion without manual command-by-command supervision.",
          askLabel: "# Ask your agent naturally",
          refLabel: "# Or generate from a reference image",
          askPrompt: "\"Create a 5-second product demo video for our new feature\"",
          refPrompt: "\"Animate this mockup into a short onboarding walkthrough\"",
          workflowFooter:
            "The agent reads the skill, uses the CLI as the runtime, and manages the asynchronous generation flow end to end.",
        };

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Guides", href: "/guides", unlinkable: true },
          { name: content.breadcrumbLabel },
        ]}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(guideJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

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
            <div className="mt-6 max-w-[780px] space-y-4">
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
                  # For Claude Code
                </p>
                <p className="mb-3 text-[13px] text-[#d4e0a4]" style={mono}>
                  npx -y skills add anycap-ai/anycap -a claude-code -y
                </p>
                <p className="mb-1 text-[13px] text-[#6b7d3a]" style={mono}>
                  # For Cursor
                </p>
                <p className="text-[13px] text-[#d4e0a4]" style={mono}>
                  npx -y skills add anycap-ai/anycap -a cursor -y
                </p>
              </div>
              <p className="mt-3 text-sm leading-6 text-[#4d5145]">
                {localizedCopy.skillBody}
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
                {localizedCopy.cliBody.split("npm install -g @anycap/cli")[0]}
                <code className="text-[12px] text-[#6b7d3a]" style={mono}>npm install -g @anycap/cli</code>
                {localizedCopy.cliBody.split("npm install -g @anycap/cli")[1]}
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
                {localizedCopy.loginBody}
              </p>
            </FadeIn>

            <FadeIn>
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center bg-[#6b7d3a] text-[13px] font-bold text-[#f4f5f0]" style={mono}>
                  4
                </span>
                <h2 className="text-lg text-[#1c1f17]" style={pixel}>
                  {content.steps.discover}
                </h2>
              </div>
              <div className="bg-[#1c1f17] px-5 py-4">
                <p className="text-[13px] text-[#d4e0a4]" style={mono}>
                  anycap video models
                </p>
              </div>
              <p className="mt-3 text-sm leading-6 text-[#4d5145]">
                {localizedCopy.discoverBody}
              </p>
            </FadeIn>

            <FadeIn>
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center bg-[#6b7d3a] text-[13px] font-bold text-[#f4f5f0]" style={mono}>
                  5
                </span>
                <h2 className="text-lg text-[#1c1f17]" style={pixel}>
                  {content.steps.firstVideo}
                </h2>
              </div>
              <div className="bg-[#1c1f17] px-5 py-4">
                <p className="text-[13px] text-[#d4e0a4]" style={mono}>
                  anycap video generate --model veo-3.1 --prompt &quot;a drone shot over a mountain lake at sunrise&quot;
                </p>
              </div>
              <p className="mt-3 text-sm leading-6 text-[#4d5145]">
                {localizedCopy.firstVideoBody}
              </p>
            </FadeIn>

            <FadeIn>
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center bg-[#6b7d3a] text-[13px] font-bold text-[#f4f5f0]" style={mono}>
                  6
                </span>
                <h2 className="text-lg text-[#1c1f17]" style={pixel}>
                  {content.steps.workflow}
                </h2>
              </div>
              <p className="max-w-[760px] text-sm leading-6 text-[#4d5145]">
                {localizedCopy.workflowBody}
              </p>
              <div className="mt-3 bg-[#1c1f17] px-5 py-4">
                <p className="mb-1 text-[13px] text-[#6b7d3a]" style={mono}>
                  {localizedCopy.askLabel}
                </p>
                <p className="mb-3 text-[13px] text-[#d4e0a4]" style={mono}>
                  {localizedCopy.askPrompt}
                </p>
                <p className="mb-1 text-[13px] text-[#6b7d3a]" style={mono}>
                  {localizedCopy.refLabel}
                </p>
                <p className="text-[13px] text-[#d4e0a4]" style={mono}>
                  {localizedCopy.refPrompt}
                </p>
              </div>
              <p className="mt-3 text-sm leading-6 text-[#4d5145]">
                {localizedCopy.workflowFooter}
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
                {content.promptsTitle}
              </h2>
              <div className="max-w-[820px] space-y-4">
                {content.promptsBody.map((paragraph) => (
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
                  href="/capabilities/video-generation"
                  className="inline-block rounded-lg border border-[#1c1f17] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                  style={mono}
                >
                  {content.ctas.video}
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
