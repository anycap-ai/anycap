import { createTechArticleJsonLd } from "@/lib/schema";
import { getCatalogModelsByCapability } from "@/lib/seo/model-catalog";
import type { SiteLocale } from "@/lib/site";

export const VIDEO_AGENT_GUIDE_PATH =
  "/guides/how-to-add-video-generation-to-ai-agent";
export const VIDEO_AGENT_GUIDE_START_HREF = "/start";

type SourcePathKey = "text" | "image" | "footage";
type SetupTargetKey = "claude-code" | "cursor" | "codex";
type RelatedP0Key = "codex" | "video-generation" | "video-analysis";
type RelatedP0Href = "/for/codex" | "/capabilities/video-generation" | "/capabilities/video-analysis";

type SourceDecisionCopy = {
  title: string;
  body: string;
  fit: string;
  limitation: string;
};

type SourceDecisionFact = {
  key: SourcePathKey;
  mode: "text-to-video" | "image-to-video" | "edit-video";
  schemaCommand: string;
  generateCommand: string;
};

type SetupTarget = {
  key: SetupTargetKey;
  agent: "Claude Code" | "Cursor" | "Codex";
  command: string;
};

type StepCopy = {
  skillBody: string;
  cliBody: string;
  loginBody: string;
  discoverBody: string;
  schemaBody: string;
  firstVideoBody: string;
  workflowBody: string;
  workflowFooter: string;
};

type FaqItem = {
  question: string;
  answer: string;
};

type PageContent = {
  eyebrow: string;
  title: [string, string];
  intro: readonly string[];
  neededTitle: string;
  neededItems: readonly string[];
  callout: string;
  steps: {
    skill: string;
    cli: string;
    login: string;
    discover: string;
    schema: string;
    firstVideo: string;
    workflow: string;
  };
  useCasesTitle: string;
  useCases: readonly { title: string; body: string }[];
  promptsTitle: string;
  promptsBody: readonly string[];
  mistakesTitle: string;
  mistakes: readonly { title: string; body: string }[];
  faqTitle: string;
  ctas: {
    claude: string;
    video: string;
    start: string;
  };
  breadcrumbLabel: string;
  article: {
    headline: string;
    description: string;
  };
  sourceDecision: {
    title: string;
    description: string;
    fitLabel: string;
    limitationLabel: string;
    schemaLabel: string;
    generateLabel: string;
    schemaParamNote: string;
    copy: Record<SourcePathKey, SourceDecisionCopy>;
  };
  setupMatrix: {
    title: string;
    description: string;
    agentHeader: string;
    commandHeader: string;
  };
  stepCopy: StepCopy;
  resultExample: {
    title: string;
    description: string;
    outputLabel: string;
  };
  relatedP0: {
    title: string;
    description: string;
    labels: Record<RelatedP0Key, string>;
  };
  faqItems: readonly FaqItem[];
};

const sourceDecisionFacts = [
  {
    key: "text",
    mode: "text-to-video",
    schemaCommand:
      "anycap video models <model-id> schema --operation generate --mode text-to-video",
    generateCommand:
      'anycap video generate --model <model-id> --mode text-to-video --prompt "a short product walkthrough" -o product-walkthrough.mp4',
  },
  {
    key: "image",
    mode: "image-to-video",
    schemaCommand:
      "anycap video models <model-id> schema --operation generate --mode image-to-video",
    generateCommand:
      'anycap video generate --model <model-id> --mode image-to-video --prompt "animate this still with subtle camera movement" --param images=./source.png -o animated-source.mp4',
  },
  {
    key: "footage",
    mode: "edit-video",
    schemaCommand:
      "anycap video models <edit-model-id> schema --operation generate --mode edit-video",
    generateCommand:
      'anycap video generate --model <edit-model-id> --mode edit-video --prompt "brighten the scene while preserving the subject and camera motion" --param videos=./source.mp4 -o edited-source.mp4',
  },
] as const satisfies readonly SourceDecisionFact[];

const requiredSchemaParams: Partial<
  Record<SourcePathKey, "images" | "videos">
> = {
  image: "images",
  footage: "videos",
};

const setupTargets = [
  {
    key: "claude-code",
    agent: "Claude Code",
    command: "npx -y skills add anycap-ai/anycap -a claude-code -y",
  },
  {
    key: "cursor",
    agent: "Cursor",
    command: "npx -y skills add anycap-ai/anycap -a cursor -y",
  },
  {
    key: "codex",
    agent: "Codex",
    command: "npx -y skills add anycap-ai/anycap -a codex -y",
  },
] as const satisfies readonly SetupTarget[];

const relatedP0Facts = [
  { key: "codex", href: "/for/codex" },
  { key: "video-generation", href: "/capabilities/video-generation" },
  { key: "video-analysis", href: "/capabilities/video-analysis" },
] as const satisfies readonly { key: RelatedP0Key; href: RelatedP0Href }[];

const workflowCommands = {
  cliInstall: "curl -fsSL https://anycap.ai/install.sh | sh",
  cliInstallAlternative: "npm install -g @anycap/cli",
  login: "anycap login",
  discover: "anycap video models",
} as const;

const englishContent = {
  eyebrow: "Guides",
  title: ["How to add video generation", "to an AI agent"],
  intro: [
    "AI agents can write code, answer questions, and automate workflows, but they need a media tool to create video. AnyCap adds video generation through a skill and CLI so the agent can discover models, inspect live schemas, run generation, and keep the downloaded asset in the same workflow.",
    "This guide covers Claude Code, Cursor, and Codex. It connects source selection, installation, model discovery, schema validation, prompt structure, and the single-command path from a plain-language request to a completed video.",
    "The practical goal is simple: after setup, an agent can treat video generation like another tool call. A user can ask for a product demo, motion concept, or short social clip, and the agent can handle the end-to-end execution path.",
  ],
  neededTitle: "What you need",
  neededItems: [
    "An AI agent that can run shell commands, such as Claude Code, Cursor, or Codex",
    "Node.js for the skills installer or npm-based CLI installation path",
    "Access to the browser or device authentication flow selected by the CLI",
    "A clear text brief, source image, or existing clip for the first generation test",
  ],
  callout:
    "Video generation completes through one CLI command. The CLI waits for server-side completion, downloads the requested output, and prints flat JSON when the command completes; no separate follow-up command is required.",
  steps: {
    skill: "Install the AnyCap skill",
    cli: "Install the AnyCap CLI",
    login: "Log in",
    discover: "Discover available video models",
    schema: "Inspect the live model schema",
    firstVideo: "Generate your first video",
    workflow: "Use video generation in agent workflows",
  },
  useCasesTitle: "Where video generation helps most",
  useCases: [
    {
      title: "Product demos",
      body: "Turn release notes or a feature summary into a short product demo video that an agent can generate as part of launch preparation.",
    },
    {
      title: "Marketing experiments",
      body: "Ask the agent for short variations of an ad concept, hero animation, or social teaser without leaving the terminal workflow.",
    },
    {
      title: "Design handoff",
      body: "Animate a static mockup into a walkthrough so teams can review motion and narrative earlier in the design cycle.",
    },
  ],
  promptsTitle: "How to get better video outputs",
  promptsBody: [
    "Prompt quality matters because a video model must infer shot composition, movement, duration, and visual continuity. A short vague prompt can work, but a structured prompt is usually more repeatable.",
    "Describe the subject, camera movement, scene, lighting, tone, and intended duration. When an approved visual already exists, choose image-to-video so the source frame anchors the composition.",
    "Ask the agent to draft the prompt first, review it, and then run the matching schema and generation commands. This keeps creative approval separate from execution without breaking the workflow.",
  ],
  mistakesTitle: "Common setup and workflow mistakes",
  mistakes: [
    {
      title: "Skipping model discovery",
      body: "Models expose different modes and tradeoffs. Run anycap video models before choosing one instead of hardcoding the same model for every request.",
    },
    {
      title: "Using underspecified prompts",
      body: "A request such as 'make a product video' is too broad. Add scene context, pacing, camera direction, and intended use before generation.",
    },
    {
      title: "Assuming every source uses the same schema",
      body: "Local images and videos are schema-driven parameters. Inspect the selected mode and add images or videos only when that live schema declares the field.",
    },
  ],
  faqTitle: "FAQ",
  ctas: {
    claude: "AnyCap for Claude Code",
    video: "Explore video generation",
    start: "Start with AnyCap",
  },
  breadcrumbLabel: "Add video generation to an AI agent",
  article: {
    headline: "How to add video generation to an AI agent",
    description:
      "Choose a text brief, source image, or existing clip; install AnyCap for Claude Code, Cursor, or Codex; then validate the live model schema and generate a downloadable video from one agent workflow.",
  },
  sourceDecision: {
    title: "Choose the workflow from your source",
    description:
      "Start with the material you already have. Each path uses a different mode, and the selected model must expose that mode in the live catalog.",
    fitLabel: "Best fit",
    limitationLabel: "Check first",
    schemaLabel: "Live schema",
    generateLabel: "Generate",
    schemaParamNote:
      "Use this local-media parameter only when the returned schema declares it:",
    copy: {
      text: {
        title: "Text brief to video",
        body: "Use a written scene, product, or motion brief as the only creative input.",
        fit: "New clips when the agent can describe the subject, setting, movement, and intended use.",
        limitation:
          "The model has no visual anchor, so include concrete composition and motion direction in the prompt.",
      },
      image: {
        title: "Source image to video",
        body: "Animate a still image while keeping its subject and composition as the starting point.",
        fit: "Mockups, product frames, key art, or other approved visuals that need controlled motion.",
        limitation:
          "Pass the local image only when the selected mode's schema declares the images field.",
      },
      footage: {
        title: "Existing footage to edited video",
        body: "Transform a source clip while preserving the useful subject and camera continuity.",
        fit: "Prompt-directed revisions such as lighting, atmosphere, or visual treatment changes.",
        limitation:
          "This path appears only while the live catalog has an edit-video model, and its schema must declare the videos field.",
      },
    },
  },
  setupMatrix: {
    title: "Install the skill for your agent",
    description:
      "Choose the command that matches the agent running the workflow. The skill supplies operating instructions; the CLI performs the generation.",
    agentHeader: "Agent",
    commandHeader: "Skill command",
  },
  stepCopy: {
    skillBody:
      "Install the AnyCap skill for the agent that will run the workflow. The target-specific command gives that agent durable instructions for choosing a mode, checking the schema, and invoking the CLI.",
    cliBody:
      "Install the AnyCap CLI with the shell installer. The npm command is an alternative; Node.js is required for that package route and for the skills installer, not for the standalone CLI binary.",
    loginBody:
      "Run one login command. The CLI chooses a browser or device flow for the current environment, so the same setup works locally and on a remote shell.",
    discoverBody:
      "List the live video catalog before choosing a model. Match the requested source path to a mode the selected model currently exposes.",
    schemaBody:
      "Inspect the selected model's generate schema for the chosen mode. Add a local image or video parameter only when that schema declares the corresponding field.",
    firstVideoBody:
      "Run the generation command for the chosen source path. The CLI waits for server-side completion, downloads the file, and prints a flat JSON result when the command completes.",
    workflowBody:
      "The agent can now translate a brief into a source decision, select a compatible model, validate its schema, run generation, and carry the downloaded file into review or publishing.",
    workflowFooter:
      "Treat the shown result as representative: the real response can include additional fields, and the absolute local path depends on the directory where the command runs.",
  },
  resultExample: {
    title: "Representative completed result",
    description:
      "credits_used: 20 is illustrative. Actual credits vary by model, duration, and output settings.",
    outputLabel: "Flat JSON output",
  },
  relatedP0: {
    title: "Continue the agent workflow",
    description:
      "Use these focused pages after the end-to-end setup when you need Codex guidance, generation details, or video review.",
    labels: {
      codex: "Set up Codex",
      "video-generation": "Explore video generation",
      "video-analysis": "Review video with an agent",
    },
  },
  faqItems: [
    {
      question: "Which video mode should an agent choose?",
      answer:
        "Use text-to-video for a written brief, image-to-video when a still should anchor the clip, and edit-video for existing footage when that mode is present in the live catalog.",
    },
    {
      question: "Can the commands use local images and videos?",
      answer:
        "Yes, when the selected mode's live schema declares the matching images or videos field. Check the schema before adding the local path parameter.",
    },
    {
      question: "Does the generation command return before the video is ready?",
      answer:
        "No. The CLI waits for server-side completion, downloads the output, and prints the result when the command finishes.",
    },
    {
      question: "Is every video generation charged 20 credits?",
      answer:
        "No. The example value is illustrative; actual usage varies with the selected model, duration, and output settings.",
    },
  ],
} satisfies PageContent;

const portugueseContent = {
  eyebrow: "Guias",
  title: ["Como adicionar geração de vídeo", "a um agente de IA"],
  intro: [
    "Agentes de IA escrevem código, respondem perguntas e automatizam fluxos, mas precisam de uma ferramenta de mídia para criar vídeo. O AnyCap acrescenta essa capacidade com uma skill e uma CLI para que o agente descubra modelos, consulte schemas ativos, execute a geração e mantenha o arquivo baixado no mesmo fluxo.",
    "Este guia abrange Claude Code, Cursor e Codex. Ele conecta a escolha da origem, a instalação, a descoberta de modelos, a validação do schema, a estrutura do prompt e o caminho de um único comando entre o pedido em linguagem natural e o vídeo concluído.",
    "O objetivo prático é simples: depois da configuração, o agente pode tratar a geração de vídeo como outra chamada de ferramenta. O usuário pede um demo de produto, um conceito de movimento ou um clipe social curto, e o agente cuida da execução de ponta a ponta.",
  ],
  neededTitle: "O que você precisa",
  neededItems: [
    "Um agente de IA capaz de executar comandos de shell, como Claude Code, Cursor ou Codex",
    "Node.js para o instalador de skills ou para a opção de instalação da CLI via npm",
    "Acesso ao fluxo de autenticação por navegador ou dispositivo escolhido pela CLI",
    "Um briefing em texto claro, uma imagem de origem ou um clipe existente para o primeiro teste",
  ],
  callout:
    "A geração de vídeo termina em um único comando da CLI. Ela aguarda a conclusão no servidor, baixa a saída solicitada e imprime um JSON plano quando o comando termina; não é necessário executar outro comando depois.",
  steps: {
    skill: "Instale a skill do AnyCap",
    cli: "Instale a CLI do AnyCap",
    login: "Faça login",
    discover: "Descubra os modelos de vídeo disponíveis",
    schema: "Consulte o schema ativo do modelo",
    firstVideo: "Gere seu primeiro vídeo",
    workflow: "Use geração de vídeo nos fluxos do agente",
  },
  useCasesTitle: "Onde a geração de vídeo ajuda mais",
  useCases: [
    {
      title: "Demos de produto",
      body: "Transforme notas de versão ou um resumo de recursos em um vídeo curto de demonstração que o agente gera durante a preparação do lançamento.",
    },
    {
      title: "Experimentos de marketing",
      body: "Peça ao agente variações curtas de um conceito de anúncio, animação principal ou teaser social sem sair do fluxo do terminal.",
    },
    {
      title: "Handoff de design",
      body: "Anime um mockup estático em um walkthrough para que a equipe revise movimento e narrativa mais cedo no ciclo de design.",
    },
  ],
  promptsTitle: "Como conseguir resultados de vídeo melhores",
  promptsBody: [
    "A qualidade do prompt importa porque o modelo de vídeo precisa inferir composição, movimento, duração e continuidade visual. Um pedido curto e vago pode funcionar, mas um prompt estruturado costuma ser mais repetível.",
    "Descreva o tema, o movimento de câmera, a cena, a iluminação, o tom e a duração desejada. Quando já houver um visual aprovado, escolha image-to-video para ancorar a composição no quadro de origem.",
    "Peça primeiro ao agente um rascunho do prompt, revise-o e depois execute os comandos de schema e geração correspondentes. Assim, a aprovação criativa continua separada da execução sem interromper o fluxo.",
  ],
  mistakesTitle: "Erros comuns de configuração e fluxo",
  mistakes: [
    {
      title: "Pular a descoberta de modelos",
      body: "Os modelos expõem modos e compromissos diferentes. Execute anycap video models antes da escolha em vez de fixar o mesmo modelo para todos os pedidos.",
    },
    {
      title: "Usar prompts pouco específicos",
      body: "Um pedido como 'faça um vídeo do produto' é amplo demais. Acrescente contexto da cena, ritmo, direção de câmera e finalidade antes da geração.",
    },
    {
      title: "Supor que toda origem usa o mesmo schema",
      body: "Imagens e vídeos locais são parâmetros definidos pelo schema. Consulte o modo escolhido e adicione images ou videos somente quando o schema ativo declarar o campo.",
    },
  ],
  faqTitle: "Perguntas frequentes",
  ctas: {
    claude: "AnyCap para Claude Code",
    video: "Explorar geração de vídeo",
    start: "Começar com AnyCap",
  },
  breadcrumbLabel: "Adicionar geração de vídeo a um agente de IA",
  article: {
    headline: "Como adicionar geração de vídeo a um agente de IA",
    description:
      "Escolha entre um briefing em texto, uma imagem de origem ou um vídeo existente; instale o AnyCap no Claude Code, Cursor ou Codex; depois valide o schema ativo do modelo e gere um vídeo baixável no mesmo fluxo do agente.",
  },
  sourceDecision: {
    title: "Escolha o fluxo a partir do material de origem",
    description:
      "Comece pelo material que você já tem. Cada caminho usa um modo diferente, e o modelo escolhido precisa expor esse modo no catálogo ativo.",
    fitLabel: "Melhor uso",
    limitationLabel: "Verifique antes",
    schemaLabel: "Schema ativo",
    generateLabel: "Gerar",
    schemaParamNote:
      "Use este parâmetro de mídia local somente quando o schema retornado o declarar:",
    copy: {
      text: {
        title: "De briefing em texto para vídeo",
        body: "Use uma descrição escrita da cena, do produto ou do movimento como única entrada criativa.",
        fit: "Clipes novos quando o agente consegue descrever tema, ambiente, movimento e finalidade.",
        limitation:
          "O modelo não recebe uma âncora visual; inclua composição e direção de movimento concretas no prompt.",
      },
      image: {
        title: "De imagem de origem para vídeo",
        body: "Anime uma imagem estática mantendo seu tema e sua composição como ponto de partida.",
        fit: "Mockups, quadros de produto, artes principais ou outros visuais aprovados que precisam de movimento controlado.",
        limitation:
          "Envie a imagem local somente quando o schema do modo escolhido declarar o campo images.",
      },
      footage: {
        title: "De vídeo existente para versão editada",
        body: "Transforme um clipe de origem preservando o tema útil e a continuidade de câmera.",
        fit: "Revisões guiadas por prompt, como mudanças de luz, atmosfera ou tratamento visual.",
        limitation:
          "Este caminho aparece apenas enquanto houver um modelo edit-video no catálogo ativo, e o schema precisa declarar o campo videos.",
      },
    },
  },
  setupMatrix: {
    title: "Instale a skill no seu agente",
    description:
      "Escolha o comando correspondente ao agente que executará o fluxo. A skill fornece as instruções de operação; a CLI realiza a geração.",
    agentHeader: "Agente",
    commandHeader: "Comando da skill",
  },
  stepCopy: {
    skillBody:
      "Instale a skill do AnyCap no agente que executará o fluxo. O comando específico do destino fornece instruções duradouras para escolher um modo, verificar o schema e chamar a CLI.",
    cliBody:
      "Instale a CLI do AnyCap com o instalador via shell. O comando npm é uma alternativa; o Node.js é necessário nessa opção e no instalador de skills, mas não no binário independente da CLI.",
    loginBody:
      "Execute um único comando de login. A CLI escolhe o fluxo por navegador ou dispositivo conforme o ambiente, então a mesma configuração funciona localmente e em um shell remoto.",
    discoverBody:
      "Liste o catálogo ativo de vídeo antes de escolher um modelo. Relacione o material de origem solicitado a um modo que o modelo selecionado exponha no momento.",
    schemaBody:
      "Inspecione o schema de geração do modelo escolhido para o modo desejado. Adicione um parâmetro de imagem ou vídeo local somente quando esse schema declarar o campo correspondente.",
    firstVideoBody:
      "Execute o comando de geração do caminho escolhido. A CLI aguarda a conclusão no servidor, baixa o arquivo e imprime um resultado JSON plano quando o comando termina.",
    workflowBody:
      "Agora o agente pode transformar o briefing em uma decisão de origem, selecionar um modelo compatível, validar seu schema, executar a geração e levar o arquivo baixado para revisão ou publicação.",
    workflowFooter:
      "Considere o resultado mostrado como representativo: a resposta real pode incluir campos adicionais, e o caminho local absoluto depende do diretório em que o comando é executado.",
  },
  resultExample: {
    title: "Resultado concluído representativo",
    description:
      "credits_used: 20 é ilustrativo. Os créditos reais variam conforme o modelo, a duração e as configurações de saída.",
    outputLabel: "Saída JSON plana",
  },
  relatedP0: {
    title: "Continue o fluxo do agente",
    description:
      "Depois da configuração completa, use estas páginas específicas para orientação sobre Codex, detalhes de geração ou revisão de vídeo.",
    labels: {
      codex: "Configurar o Codex",
      "video-generation": "Explorar geração de vídeo",
      "video-analysis": "Revisar vídeo com um agente",
    },
  },
  faqItems: [
    {
      question: "Qual modo de vídeo o agente deve escolher?",
      answer:
        "Use text-to-video para um briefing escrito, image-to-video quando uma imagem deve ancorar o clipe e edit-video para um vídeo existente quando esse modo estiver no catálogo ativo.",
    },
    {
      question: "Os comandos aceitam imagens e vídeos locais?",
      answer:
        "Sim, quando o schema ativo do modo escolhido declarar o campo images ou videos correspondente. Confira o schema antes de adicionar o parâmetro com o caminho local.",
    },
    {
      question: "O comando de geração retorna antes de o vídeo ficar pronto?",
      answer:
        "Não. A CLI aguarda a conclusão no servidor, baixa o arquivo de saída e imprime o resultado quando o comando termina.",
    },
    {
      question: "Toda geração de vídeo custa 20 créditos?",
      answer:
        "Não. O valor do exemplo é ilustrativo; o uso real varia conforme o modelo selecionado, a duração e as configurações de saída.",
    },
  ],
} satisfies PageContent;

const indonesianContent = {
  eyebrow: "Panduan",
  title: ["Cara menambahkan generasi video", "ke agen AI"],
  intro: [
    "Agen AI dapat menulis kode, menjawab pertanyaan, dan mengotomasi alur, tetapi memerlukan alat media untuk membuat video. AnyCap menambahkan kemampuan tersebut lewat skill dan CLI agar agen bisa menemukan model, memeriksa skema aktif, menjalankan pembuatan, dan mempertahankan berkas unduhan dalam alur yang sama.",
    "Panduan ini mencakup Claude Code, Cursor, dan Codex. Isinya menghubungkan pemilihan sumber, pemasangan, penemuan model, validasi skema, struktur prompt, dan satu perintah yang mengubah permintaan bahasa alami menjadi video selesai.",
    "Tujuan praktisnya sederhana: setelah disiapkan, agen dapat memperlakukan generasi video seperti panggilan alat lain. Pengguna meminta demo produk, konsep gerak, atau klip sosial singkat, lalu agen menangani pelaksanaan dari awal sampai akhir.",
  ],
  neededTitle: "Yang perlu disiapkan",
  neededItems: [
    "Agen AI yang dapat menjalankan perintah shell, seperti Claude Code, Cursor, atau Codex",
    "Node.js untuk pemasang skill atau jalur pemasangan CLI berbasis npm",
    "Akses ke alur autentikasi browser atau perangkat yang dipilih CLI",
    "Brief teks yang jelas, gambar sumber, atau klip yang sudah ada untuk pengujian pertama",
  ],
  callout:
    "Pembuatan video selesai melalui satu perintah CLI. CLI menunggu proses sisi server selesai, mengunduh keluaran yang diminta, lalu mencetak JSON datar saat perintah berakhir; tidak diperlukan perintah lanjutan terpisah.",
  steps: {
    skill: "Pasang skill AnyCap",
    cli: "Pasang AnyCap CLI",
    login: "Masuk ke akun",
    discover: "Temukan model video yang tersedia",
    schema: "Periksa skema model aktif",
    firstVideo: "Buat video pertama Anda",
    workflow: "Gunakan generasi video dalam alur agen",
  },
  useCasesTitle: "Kapan generasi video paling membantu",
  useCases: [
    {
      title: "Demo produk",
      body: "Ubah catatan rilis atau ringkasan fitur menjadi video demo singkat yang dapat dibuat agen saat menyiapkan peluncuran.",
    },
    {
      title: "Eksperimen pemasaran",
      body: "Minta agen membuat variasi singkat untuk konsep iklan, animasi utama, atau teaser sosial tanpa keluar dari alur terminal.",
    },
    {
      title: "Serah terima desain",
      body: "Animasikan mockup statis menjadi walkthrough agar tim dapat menilai gerakan dan narasi lebih awal dalam siklus desain.",
    },
  ],
  promptsTitle: "Cara mendapatkan hasil video yang lebih baik",
  promptsBody: [
    "Kualitas prompt penting karena model video harus menafsirkan komposisi pengambilan gambar, gerakan, durasi, dan kesinambungan visual. Permintaan singkat yang samar bisa berhasil, tetapi prompt terstruktur biasanya lebih konsisten.",
    "Jelaskan subjek, gerakan kamera, adegan, pencahayaan, nuansa, dan durasi yang diinginkan. Jika sudah ada visual yang disetujui, pilih image-to-video agar bingkai sumber menjadi acuan komposisi.",
    "Minta agen menyusun draf prompt terlebih dahulu, tinjau draf itu, lalu jalankan perintah skema dan pembuatan yang sesuai. Persetujuan kreatif tetap terpisah dari eksekusi tanpa memutus alur.",
  ],
  mistakesTitle: "Kesalahan umum dalam penyiapan dan alur",
  mistakes: [
    {
      title: "Melewatkan penemuan model",
      body: "Setiap model menyediakan mode dan kompromi berbeda. Jalankan anycap video models sebelum memilih, bukan menetapkan satu model untuk semua permintaan.",
    },
    {
      title: "Memakai prompt yang kurang spesifik",
      body: "Permintaan seperti 'buat video produk' terlalu luas. Tambahkan konteks adegan, tempo, arah kamera, dan tujuan penggunaan sebelum pembuatan.",
    },
    {
      title: "Menganggap semua sumber memakai skema yang sama",
      body: "Gambar dan video lokal adalah parameter berbasis skema. Periksa mode terpilih dan tambahkan images atau videos hanya ketika skema aktif mendeklarasikan kolomnya.",
    },
  ],
  faqTitle: "Tanya jawab",
  ctas: {
    claude: "AnyCap untuk Claude Code",
    video: "Pelajari generasi video",
    start: "Mulai dengan AnyCap",
  },
  breadcrumbLabel: "Tambahkan generasi video ke agen AI",
  article: {
    headline: "Cara menambahkan generasi video ke agen AI",
    description:
      "Pilih brief teks, gambar sumber, atau rekaman yang sudah ada; pasang AnyCap untuk Claude Code, Cursor, atau Codex; lalu validasi skema model aktif dan buat video yang dapat diunduh dalam satu alur agen.",
  },
  sourceDecision: {
    title: "Pilih alur dari materi sumber",
    description:
      "Mulailah dari materi yang sudah tersedia. Setiap jalur memakai mode berbeda, dan model pilihan harus menyediakan mode tersebut di katalog aktif.",
    fitLabel: "Paling sesuai",
    limitationLabel: "Periksa dahulu",
    schemaLabel: "Skema aktif",
    generateLabel: "Buat video",
    schemaParamNote:
      "Gunakan parameter media lokal ini hanya jika skema yang dikembalikan mendeklarasikannya:",
    copy: {
      text: {
        title: "Dari brief teks ke video",
        body: "Gunakan uraian tertulis tentang adegan, produk, atau gerakan sebagai satu-satunya masukan kreatif.",
        fit: "Klip baru saat agen dapat menjelaskan subjek, latar, gerakan, dan tujuan penggunaan.",
        limitation:
          "Model tidak memiliki acuan visual, jadi sertakan komposisi dan arahan gerak yang konkret dalam prompt.",
      },
      image: {
        title: "Dari gambar sumber ke video",
        body: "Animasikan gambar diam sambil mempertahankan subjek dan komposisinya sebagai titik awal.",
        fit: "Mockup, bingkai produk, visual utama, atau materi lain yang telah disetujui dan memerlukan gerakan terarah.",
        limitation:
          "Kirim gambar lokal hanya jika skema mode yang dipilih mendeklarasikan kolom images.",
      },
      footage: {
        title: "Dari rekaman ke video suntingan",
        body: "Ubah klip sumber sambil menjaga subjek yang penting dan kesinambungan kamera.",
        fit: "Revisi berbasis prompt seperti perubahan pencahayaan, suasana, atau perlakuan visual.",
        limitation:
          "Jalur ini hanya tampil selama katalog aktif memiliki model edit-video, dan skemanya harus mendeklarasikan kolom videos.",
      },
    },
  },
  setupMatrix: {
    title: "Pasang skill untuk agen Anda",
    description:
      "Pilih perintah yang sesuai dengan agen pelaksana. Skill menyediakan petunjuk kerja, sedangkan CLI menjalankan pembuatan video.",
    agentHeader: "Agen",
    commandHeader: "Perintah skill",
  },
  stepCopy: {
    skillBody:
      "Pasang skill AnyCap pada agen yang akan menjalankan alur. Perintah khusus target memberi agen petunjuk tetap untuk memilih mode, memeriksa skema, dan memanggil CLI.",
    cliBody:
      "Pasang AnyCap CLI melalui pemasang shell. Perintah npm adalah pilihan lain; Node.js diperlukan untuk jalur paket tersebut dan pemasang skill, bukan untuk biner CLI mandiri.",
    loginBody:
      "Jalankan satu perintah masuk. CLI memilih alur browser atau perangkat sesuai lingkungan, sehingga konfigurasi yang sama dapat dipakai secara lokal maupun di shell jarak jauh.",
    discoverBody:
      "Lihat katalog video aktif sebelum memilih model. Cocokkan jenis sumber yang diminta dengan mode yang saat ini tersedia pada model pilihan.",
    schemaBody:
      "Periksa skema generate milik model terpilih untuk mode yang dipakai. Tambahkan parameter gambar atau video lokal hanya jika skema tersebut mendeklarasikan kolom yang sesuai.",
    firstVideoBody:
      "Jalankan perintah pembuatan untuk jalur sumber terpilih. CLI menunggu proses sisi server selesai, mengunduh berkas, lalu mencetak hasil JSON datar ketika perintah berakhir.",
    workflowBody:
      "Kini agen dapat mengubah brief menjadi keputusan sumber, memilih model yang cocok, memvalidasi skemanya, menjalankan pembuatan, dan membawa berkas unduhan ke tahap peninjauan atau publikasi.",
    workflowFooter:
      "Anggap hasil yang ditampilkan sebagai contoh representatif: respons nyata dapat memuat kolom tambahan, dan lokasi lokal absolut bergantung pada direktori tempat perintah dijalankan.",
  },
  resultExample: {
    title: "Contoh hasil yang sudah selesai",
    description:
      "credits_used: 20 hanya ilustrasi. Kredit sebenarnya bervariasi menurut model, durasi, dan pengaturan output.",
    outputLabel: "Keluaran JSON datar",
  },
  relatedP0: {
    title: "Lanjutkan alur kerja agen",
    description:
      "Sesudah penyiapan menyeluruh, gunakan halaman terarah ini untuk panduan Codex, rincian pembuatan, atau peninjauan video.",
    labels: {
      codex: "Siapkan Codex",
      "video-generation": "Pelajari generasi video",
      "video-analysis": "Tinjau video dengan agen",
    },
  },
  faqItems: [
    {
      question: "Mode video mana yang sebaiknya dipilih agen?",
      answer:
        "Gunakan text-to-video untuk brief tertulis, image-to-video jika gambar diam perlu menjadi acuan klip, dan edit-video untuk rekaman yang sudah ada ketika mode itu tersedia di katalog aktif.",
    },
    {
      question: "Apakah perintah dapat memakai gambar dan video lokal?",
      answer:
        "Ya, jika skema aktif untuk mode terpilih mendeklarasikan kolom images atau videos yang sesuai. Periksa skema sebelum menambahkan parameter lokasi lokal.",
    },
    {
      question: "Apakah perintah pembuatan selesai sebelum videonya siap?",
      answer:
        "Tidak. CLI menunggu proses sisi server selesai, mengunduh keluaran, dan mencetak hasil saat perintah berakhir.",
    },
    {
      question: "Apakah setiap pembuatan video memakai 20 kredit?",
      answer:
        "Tidak. Nilai contoh hanya ilustrasi; pemakaian sebenarnya berubah menurut model terpilih, durasi, dan pengaturan keluaran.",
    },
  ],
} satisfies PageContent;

const germanContent = {
  eyebrow: "Anleitungen",
  title: ["Videogenerierung für einen", "KI-Agenten einrichten"],
  intro: [
    "KI-Agenten können Code schreiben, Fragen beantworten und Abläufe automatisieren, benötigen zum Erstellen von Videos jedoch ein Medienwerkzeug. AnyCap ergänzt diese Fähigkeit über einen Skill und eine CLI, damit der Agent Modelle findet, aktuelle Schemas prüft, die Generierung ausführt und die heruntergeladene Datei im selben Workflow behält.",
    "Diese Anleitung gilt für Claude Code, Cursor und Codex. Sie verbindet Quellenwahl, Installation, Modellsuche, Schemavalidierung, Prompt-Aufbau und den Weg von einer natürlich formulierten Anfrage zum fertigen Video in einem Befehl.",
    "Das praktische Ziel ist einfach: Nach der Einrichtung kann der Agent Videogenerierung wie einen weiteren Werkzeugaufruf behandeln. Ein Benutzer fordert ein Produktdemo, ein Bewegungskonzept oder einen kurzen Social-Clip an, und der Agent übernimmt die Ausführung von Anfang bis Ende.",
  ],
  neededTitle: "Was Sie benötigen",
  neededItems: [
    "Einen KI-Agenten, der Shell-Befehle ausführen kann, etwa Claude Code, Cursor oder Codex",
    "Node.js für den Skill-Installer oder den npm-basierten Installationsweg der CLI",
    "Zugriff auf den von der CLI gewählten Browser- oder Geräteablauf zur Anmeldung",
    "Ein klares Textbriefing, ein Ausgangsbild oder einen vorhandenen Clip für den ersten Test",
  ],
  callout:
    "Die Videogenerierung wird mit einem einzigen CLI-Befehl abgeschlossen. Die CLI wartet auf den serverseitigen Abschluss, lädt die gewünschte Ausgabe herunter und gibt nach Befehlsende flaches JSON aus; ein weiterer Folgebefehl ist nicht erforderlich.",
  steps: {
    skill: "AnyCap-Skill installieren",
    cli: "AnyCap CLI installieren",
    login: "Anmelden",
    discover: "Verfügbare Videomodelle ermitteln",
    schema: "Aktuelles Modellschema prüfen",
    firstVideo: "Das erste Video generieren",
    workflow: "Videogenerierung in Agenten-Workflows einsetzen",
  },
  useCasesTitle: "Wo Videogenerierung besonders hilft",
  useCases: [
    {
      title: "Produktdemos",
      body: "Verwandeln Sie Versionshinweise oder eine Funktionsübersicht in ein kurzes Demovideo, das der Agent während der Veröffentlichungsvorbereitung erzeugt.",
    },
    {
      title: "Marketing-Experimente",
      body: "Lassen Sie den Agenten kurze Varianten eines Anzeigenkonzepts, einer Hero-Animation oder eines Social-Teasers erstellen, ohne den Terminalablauf zu verlassen.",
    },
    {
      title: "Design-Übergabe",
      body: "Animieren Sie ein statisches Mockup als Walkthrough, damit Teams Bewegung und Erzählung früher im Designzyklus beurteilen können.",
    },
  ],
  promptsTitle: "So erhalten Sie bessere Videoergebnisse",
  promptsBody: [
    "Die Prompt-Qualität ist wichtig, weil ein Videomodell Bildaufbau, Bewegung, Dauer und visuelle Kontinuität ableiten muss. Eine kurze, vage Anfrage kann funktionieren, ein strukturierter Prompt ist jedoch meist besser reproduzierbar.",
    "Beschreiben Sie Motiv, Kamerabewegung, Szene, Licht, Stimmung und gewünschte Dauer. Wenn bereits ein freigegebenes Bild vorliegt, wählen Sie image-to-video, damit der Ausgangsframe die Komposition verankert.",
    "Lassen Sie den Agenten zunächst einen Prompt-Entwurf erstellen, prüfen Sie ihn und führen Sie danach die passenden Schema- und Generierungsbefehle aus. So bleiben kreative Freigabe und Ausführung getrennt, ohne den Workflow zu unterbrechen.",
  ],
  mistakesTitle: "Häufige Fehler bei Einrichtung und Ablauf",
  mistakes: [
    {
      title: "Modellsuche überspringen",
      body: "Modelle bieten unterschiedliche Modi und Abwägungen. Führen Sie vor der Wahl anycap video models aus, statt für jede Anfrage dasselbe Modell fest einzutragen.",
    },
    {
      title: "Zu ungenaue Prompts verwenden",
      body: "Eine Anfrage wie 'Erstelle ein Produktvideo' ist zu breit. Ergänzen Sie vor der Generierung Szenenkontext, Tempo, Kamerarichtung und Verwendungszweck.",
    },
    {
      title: "Für jede Quelle dasselbe Schema annehmen",
      body: "Lokale Bilder und Videos sind schemagesteuerte Parameter. Prüfen Sie den gewählten Modus und fügen Sie images oder videos nur hinzu, wenn das aktuelle Schema das Feld deklariert.",
    },
  ],
  faqTitle: "Häufige Fragen",
  ctas: {
    claude: "AnyCap für Claude Code",
    video: "Videogenerierung erkunden",
    start: "Mit AnyCap beginnen",
  },
  breadcrumbLabel: "Videogenerierung für einen KI-Agenten einrichten",
  article: {
    headline: "So ergänzen Sie einen KI-Agenten um Videogenerierung",
    description:
      "Wählen Sie ein Textbriefing, ein Ausgangsbild oder vorhandenes Filmmaterial; installieren Sie AnyCap für Claude Code, Cursor oder Codex; prüfen Sie anschließend das aktuelle Modellschema und erzeugen Sie ein herunterladbares Video in einem Agenten-Workflow.",
  },
  sourceDecision: {
    title: "Den Ablauf anhand des Ausgangsmaterials wählen",
    description:
      "Beginnen Sie mit dem bereits vorhandenen Material. Jeder Pfad nutzt einen anderen Modus, den das gewählte Modell im aktuellen Katalog anbieten muss.",
    fitLabel: "Geeignet für",
    limitationLabel: "Vorher prüfen",
    schemaLabel: "Aktuelles Schema",
    generateLabel: "Video erzeugen",
    schemaParamNote:
      "Verwenden Sie diesen Parameter für lokale Medien nur, wenn das zurückgegebene Schema ihn deklariert:",
    copy: {
      text: {
        title: "Vom Textbriefing zum Video",
        body: "Nutzen Sie eine schriftliche Szenen-, Produkt- oder Bewegungsbeschreibung als alleinige kreative Eingabe.",
        fit: "Neue Clips, wenn der Agent Motiv, Umgebung, Bewegung und Verwendungszweck beschreiben kann.",
        limitation:
          "Dem Modell fehlt eine visuelle Vorlage; nennen Sie deshalb konkrete Kompositions- und Bewegungsanweisungen im Prompt.",
      },
      image: {
        title: "Vom Ausgangsbild zum Video",
        body: "Animieren Sie ein Standbild und behalten Sie dessen Motiv und Komposition als Ausgangspunkt bei.",
        fit: "Mockups, Produktansichten, Key Visuals oder andere freigegebene Bilder, die gezielte Bewegung benötigen.",
        limitation:
          "Übergeben Sie das lokale Bild nur, wenn das Schema des gewählten Modus das Feld images deklariert.",
      },
      footage: {
        title: "Vom Filmmaterial zur bearbeiteten Fassung",
        body: "Verändern Sie einen Ausgangsclip, ohne das wichtige Motiv und die Kamerakontinuität zu verlieren.",
        fit: "Prompt-gesteuerte Überarbeitungen wie Änderungen an Licht, Atmosphäre oder visueller Behandlung.",
        limitation:
          "Dieser Pfad wird nur angezeigt, solange der aktuelle Katalog ein edit-video-Modell enthält; dessen Schema muss das Feld videos deklarieren.",
      },
    },
  },
  setupMatrix: {
    title: "Den Skill für Ihren Agenten installieren",
    description:
      "Wählen Sie den Befehl für den Agenten, der den Ablauf ausführt. Der Skill liefert Arbeitsanweisungen; die CLI übernimmt die Videogenerierung.",
    agentHeader: "Agenten-Werkzeug",
    commandHeader: "Skill-Befehl",
  },
  stepCopy: {
    skillBody:
      "Installieren Sie den AnyCap-Skill für den Agenten, der den Ablauf ausführt. Der zielspezifische Befehl gibt ihm dauerhafte Anweisungen zum Auswählen eines Modus, Prüfen des Schemas und Aufrufen der CLI.",
    cliBody:
      "Installieren Sie die AnyCap CLI mit dem Shell-Installer. Der npm-Befehl ist eine Alternative; Node.js wird für diesen Paketweg und den Skill-Installer benötigt, nicht für die eigenständige CLI-Datei.",
    loginBody:
      "Führen Sie einen einzigen Anmeldebefehl aus. Die CLI wählt je nach Umgebung einen Browser- oder Geräteablauf, sodass dieselbe Einrichtung lokal und in einer entfernten Shell funktioniert.",
    discoverBody:
      "Rufen Sie vor der Modellwahl den aktuellen Videokatalog ab. Ordnen Sie die gewünschte Quellenart einem Modus zu, den das ausgewählte Modell momentan anbietet.",
    schemaBody:
      "Prüfen Sie das Generierungsschema des ausgewählten Modells für den gewählten Modus. Fügen Sie einen lokalen Bild- oder Videoparameter nur hinzu, wenn das Schema das passende Feld deklariert.",
    firstVideoBody:
      "Führen Sie den Generierungsbefehl für den gewählten Quellenpfad aus. Die CLI wartet auf den serverseitigen Abschluss, lädt die Datei herunter und gibt nach Befehlsende ein flaches JSON-Ergebnis aus.",
    workflowBody:
      "Der Agent kann nun aus dem Briefing einen Quellenpfad ableiten, ein kompatibles Modell wählen, dessen Schema prüfen, die Generierung ausführen und die heruntergeladene Datei zur Prüfung oder Veröffentlichung weitergeben.",
    workflowFooter:
      "Das gezeigte Ergebnis ist repräsentativ: Die tatsächliche Antwort kann weitere Felder enthalten, und der absolute lokale Pfad hängt vom Ausführungsverzeichnis des Befehls ab.",
  },
  resultExample: {
    title: "Repräsentatives abgeschlossenes Ergebnis",
    description:
      "credits_used: 20 ist nur ein Beispiel. Die tatsächlichen Credits variieren je nach Modell, Dauer und Ausgabeeinstellungen.",
    outputLabel: "Flache JSON-Ausgabe",
  },
  relatedP0: {
    title: "Den Agenten-Workflow fortsetzen",
    description:
      "Nutzen Sie nach der vollständigen Einrichtung diese spezialisierten Seiten für Codex-Anleitungen, Generierungsdetails oder die Videoprüfung.",
    labels: {
      codex: "Codex einrichten",
      "video-generation": "Videogenerierung erkunden",
      "video-analysis": "Video mit einem Agenten prüfen",
    },
  },
  faqItems: [
    {
      question: "Welchen Videomodus sollte ein Agent wählen?",
      answer:
        "Verwenden Sie text-to-video für ein schriftliches Briefing, image-to-video mit einem Standbild als Vorlage und edit-video für vorhandenes Filmmaterial, wenn dieser Modus im aktuellen Katalog verfügbar ist.",
    },
    {
      question: "Können die Befehle lokale Bilder und Videos verwenden?",
      answer:
        "Ja, wenn das aktuelle Schema des gewählten Modus das passende Feld images oder videos deklariert. Prüfen Sie das Schema, bevor Sie den lokalen Pfad als Parameter ergänzen.",
    },
    {
      question: "Endet der Generierungsbefehl, bevor das Video bereitsteht?",
      answer:
        "Nein. Die CLI wartet auf den serverseitigen Abschluss, lädt die Ausgabe herunter und gibt das Ergebnis aus, wenn der Befehl beendet ist.",
    },
    {
      question: "Kostet jede Videogenerierung 20 Credits?",
      answer:
        "Nein. Der Beispielwert dient nur zur Veranschaulichung; der tatsächliche Verbrauch hängt vom gewählten Modell, der Dauer und den Ausgabeeinstellungen ab.",
    },
  ],
} satisfies PageContent;

const contentByLocale = {
  en: englishContent,
  "pt-br": portugueseContent,
  id: indonesianContent,
  de: germanContent,
} satisfies Record<SiteLocale, PageContent>;

type SourceDecisionItem = SourceDecisionFact &
  SourceDecisionCopy & {
    requiredSchemaParam?: "images" | "videos";
  };

type RelatedP0Link = {
  key: RelatedP0Key;
  href: RelatedP0Href;
  label: string;
};

export type VideoGuidePageData = Omit<
  PageContent,
  "sourceDecision" | "setupMatrix" | "relatedP0"
> & {
  sourceDecision: Omit<PageContent["sourceDecision"], "copy"> & {
    items: readonly SourceDecisionItem[];
  };
  setupMatrix: PageContent["setupMatrix"] & {
    rows: readonly SetupTarget[];
  };
  relatedP0: Omit<PageContent["relatedP0"], "labels"> & {
    links: readonly RelatedP0Link[];
  };
  workflowCommands: typeof workflowCommands;
  guideJsonLd: ReturnType<typeof createTechArticleJsonLd>;
};

export function getVideoGuidePageData(
  locale: SiteLocale,
): VideoGuidePageData {
  const localized: PageContent = contentByLocale[locale];
  const {
    sourceDecision,
    setupMatrix,
    relatedP0,
    ...localizedPresentation
  } = localized;
  const { copy: sourceCopy, ...sourceDecisionChrome } = sourceDecision;
  const { labels: relatedLabels, ...relatedP0Chrome } = relatedP0;
  const supportsEditVideo = getCatalogModelsByCapability("video").some(
    ({ modes }) => modes.includes("edit-video"),
  );
  const sourceItems = sourceDecisionFacts
    .filter((fact) => fact.mode !== "edit-video" || supportsEditVideo)
    .map((fact): SourceDecisionItem => {
      const requiredSchemaParam = requiredSchemaParams[fact.key];

      return {
        ...fact,
        ...sourceCopy[fact.key],
        ...(requiredSchemaParam ? { requiredSchemaParam } : {}),
      };
    });
  const relatedLinks = relatedP0Facts.map(
    (fact): RelatedP0Link => ({
      ...fact,
      label: relatedLabels[fact.key],
    }),
  );

  return {
    ...localizedPresentation,
    sourceDecision: {
      ...sourceDecisionChrome,
      items: sourceItems,
    },
    setupMatrix: {
      ...setupMatrix,
      rows: setupTargets,
    },
    relatedP0: {
      ...relatedP0Chrome,
      links: relatedLinks,
    },
    workflowCommands,
    guideJsonLd: createTechArticleJsonLd({
      headline: localized.article.headline,
      description: localized.article.description,
      path: VIDEO_AGENT_GUIDE_PATH,
      locale,
      about: ["AI agent video generation", "AnyCap CLI", "video workflows"],
      keywords: [
        "how to add video generation to ai agent",
        "ai agent video generation",
        "image to video agent workflow",
        "anycap video generate",
      ],
      datePublished: "2026-04-14",
      dateModified: "2026-07-11",
    }),
  };
}
