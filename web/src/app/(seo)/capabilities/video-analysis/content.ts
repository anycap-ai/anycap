import type { Metadata } from "next";
import type { DemoLine } from "@/components/landing/CapabilityDemo";
import type {
  CapabilityAction,
  CapabilityCard,
  CapabilityDetailChrome,
  CapabilityFaqItem,
  CapabilityUseCase,
  CapabilityWorkflowStep,
} from "@/components/seo/CapabilityDetailPage";
import { createTechArticleJsonLd } from "@/lib/schema";
import { getLocaleConfig, siteConfig, type SiteLocale } from "@/lib/site";

export const VIDEO_ANALYSIS_PATH = "/capabilities/video-analysis";

const ARTICLE_PUBLISHED_ISO = "2026-04-13";
const LAST_UPDATED_ISO = "2026-07-11";
const VIDEO_ANALYSIS_DEMO_COMMAND =
  'run("anycap actions video-read --file ./bug-report.mp4 --instruction \'Summarize key events and identify bug reproduction steps\'")';

type VideoAnalysisUseCase = CapabilityUseCase & {
  meaning: "quality-review" | "content-extraction" | "workflow-checkpoint";
};

type VideoAnalysisResponseExample = {
  title: string;
  code: string;
};

type VideoAnalysisPageContent = {
  metadata: {
    title: string;
    description: string;
    openGraphTitle: string;
    openGraphDescription: string;
    articleHeadline: string;
    articleDescription: string;
    articleAbout: readonly string[];
    articleKeywords: readonly string[];
  };
  breadcrumbItems: readonly { name: string; href?: string }[];
  eyebrow: string;
  lastUpdatedLabel: string;
  title: string;
  accentTitle: string;
  intro: string;
  chrome: CapabilityDetailChrome;
  searchIntents: readonly string[];
  actions: readonly CapabilityAction[];
  demo: {
    labels: { header: string };
    title: string;
    body: string;
    lines: readonly DemoLine[];
  };
  proofPoints: readonly string[];
  summary: { label: string; text: string };
  workflow: {
    title: string;
    steps: readonly CapabilityWorkflowStep[];
  };
  usageTitle: string;
  usageExamples: readonly { title: string; code: string }[];
  responseExample: VideoAnalysisResponseExample;
  useCasesTitle: string;
  useCases: readonly VideoAnalysisUseCase[];
  relatedTitle: string;
  relatedCards: readonly CapabilityCard[];
  faqTitle: string;
  faqItems: readonly CapabilityFaqItem[];
  final: { title: string; body: string };
};

const contentByLocale = {
  en: {
    metadata: {
      title: "Video analysis for AI agents | AnyCap",
      description:
        "Give AI agents one CLI workflow for analyzing remote videos and local recordings, extracting useful context, and carrying findings into the next step.",
      openGraphTitle: "Video analysis for AI agents | AnyCap",
      openGraphDescription:
        "Analyze remote videos and local recordings from an agent workflow with the AnyCap CLI.",
      articleHeadline: "Video analysis for AI agents",
      articleDescription:
        "Operational guide to using the AnyCap video-read action for recording review, content extraction, and workflow checkpoints.",
      articleAbout: [
        "Video analysis",
        "Video understanding",
        "Recording review",
        "AI agent workflows",
        "AnyCap CLI",
      ],
      articleKeywords: [
        "video analysis for AI agents",
        "video understanding CLI",
        "screen recording analysis",
        "agent quality review",
      ],
    },
    breadcrumbItems: [
      { name: "Home", href: "/" },
      { name: "Capabilities", href: "/capabilities" },
      { name: "Video analysis", href: VIDEO_ANALYSIS_PATH },
    ],
    eyebrow: "Capabilities",
    lastUpdatedLabel: "Last updated July 11, 2026",
    title: "Video analysis",
    accentTitle: "for AI agents.",
    intro:
      "AnyCap lets an agent analyze one remote video or uploaded local recording with the video-read action. Add an instruction when the workflow needs a focused answer, then carry the returned content and request context into review, extraction, or the next automated step.",
    chrome: {
      searchIntentLabel: "Common tasks",
      positioningLines: [
        "A recording is input, not a separate review queue.",
        "The agent can inspect it before the workflow continues.",
      ],
      positioningSummary: "AnyCap turns video evidence into agent context.",
    },
    searchIntents: [
      "Review a bug recording",
      "Extract key events",
      "Check a workflow step",
    ],
    actions: [
      { label: "Equip your agent", href: "/start", primary: true },
      { label: "Codex workflow", href: "/for/codex" },
      { label: "Generate video", href: "/capabilities/video-generation" },
    ],
    demo: {
      labels: { header: "agent with anycap" },
      title: "Inspect the recording",
      body: "A focused instruction turns the recording into findings the agent can use.",
      lines: [
        { type: "header", delay: 0 },
        {
          type: "prompt",
          content: "Summarize this bug recording and identify the reproduction steps",
          delay: 500,
        },
        {
          type: "text",
          content: "I'll analyze the recording using AnyCap's video analysis.",
          delay: 800,
        },
        { type: "tool", content: VIDEO_ANALYSIS_DEMO_COMMAND, delay: 600 },
        {
          type: "text",
          content: "Analysis complete — 12s recording, 4 key events detected.",
          sub: "✓",
          delay: 1800,
        },
        {
          type: "analysis",
          delay: 300,
          analysisLines: [
            "0:00 – User opens Settings panel from the sidebar.",
            '0:03 – Clicks "Theme" toggle to switch to dark mode.',
            "0:05 – Modal flashes white for ~200ms before applying the dark background.",
            "0:08 – User closes and reopens Settings — flash repeats on every toggle.",
            "",
            "Bug: theme transition applies to the page before the modal backdrop, causing a visible white flash.",
            "Root cause: likely CSS transition ordering — backdrop delay is longer than content swap.",
          ] as string[],
        },
        {
          type: "text",
          content: "The flash happens on every toggle. Looks like a CSS transition ordering issue.",
          delay: 600,
        },
        { type: "cursor", delay: 500 },
      ],
    },
    proofPoints: [
      "The action accepts one video URL or one uploaded local file and an optional instruction or model.",
      "The CLI returns analysis content with request context instead of exposing provider-specific response fields.",
      "The same result can support quality review, content extraction, or a checkpoint before another agent action.",
    ],
    summary: {
      label: "The operational answer",
      text:
        "Use video-read when an agent must inspect a recording, extract a useful finding, and keep that finding inside the active workflow.",
    },
    workflow: {
      title: "How video analysis fits the workflow",
      steps: [
        {
          title: "Provide",
          body: "Give the action one remote video URL or one local file. Local files are uploaded before analysis.",
        },
        {
          title: "Direct",
          body: "Use --instruction when the agent needs a focused result such as a defect, event list, or checkpoint decision.",
        },
        {
          title: "Continue",
          body: "Use the returned content in the next review, document, generation, or automation step and retain request context for support.",
        },
      ],
    },
    usageTitle: "CLI usage and representative output",
    usageExamples: [
      {
        title: "Analyze a remote video",
        code: "anycap actions video-read --url https://example.com/demo.mp4",
      },
      {
        title: "Analyze a local recording",
        code: "anycap actions video-read --file ./recording.mp4",
      },
      {
        title: "Ask a focused question",
        code: 'anycap actions video-read --url https://example.com/demo.mp4 --instruction "Identify the visible checkout defect"',
      },
    ],
    responseExample: {
      title: "Representative successful response — 10 credits per request",
      code: `{
  "status": "success",
  "content": "The recording shows the checkout modal clipping its submit button on a narrow viewport.",
  "credit_cost": 10,
  "request_id": "req_abc123"
}`,
    },
    useCasesTitle: "Three ways agents use video analysis",
    useCases: [
      {
        meaning: "quality-review",
        title: "Quality review",
        description:
          "Inspect a bug recording or recorded test session for visible defects, reproduction evidence, and UI behavior.",
      },
      {
        meaning: "content-extraction",
        title: "Content extraction",
        description:
          "Turn a demo, walkthrough, or research clip into a summary, event list, or focused observation.",
      },
      {
        meaning: "workflow-checkpoint",
        title: "Workflow checkpoint",
        description:
          "Confirm that a recorded step reached the expected state before the agent writes, routes, or generates the next artifact.",
      },
    ],
    relatedTitle: "Continue the video workflow",
    relatedCards: [
      {
        eyebrow: "Agent page",
        title: "Video workflows for Codex",
        href: "/for/codex",
        body: "See how Codex discovers AnyCap actions and carries structured results into the next step.",
      },
      {
        eyebrow: "Related capability",
        title: "Video generation",
        href: "/capabilities/video-generation",
        body: "Create or edit a clip, then use video analysis when the workflow needs to inspect it.",
      },
      {
        eyebrow: "Implementation guide",
        title: "Add video generation to an AI agent",
        href: "/guides/how-to-add-video-generation-to-ai-agent",
        body: "Follow the schema-first generation flow and connect returned clips to review and delivery.",
      },
    ],
    faqTitle: "FAQ",
    faqItems: [
      {
        question: "What does the video-read action accept?",
        answer:
          "Provide either one --url or one --file. A local file is uploaded first and must be no larger than 100 MB. You can also add --instruction or select a model.",
      },
      {
        question: "Why is the command named video-read?",
        answer:
          "video-read is the AnyCap action for analyzing video content. It sends the supplied video and optional instruction to the video read capability and returns the analysis as structured CLI output.",
      },
      {
        question: "Which fields can the CLI return?",
        answer:
          "Every successful video-read request costs 10 credits and includes credit_cost: 10. The response also includes status and content; request_id appears when the server supplies one, and the top-level CLI normally adds trace_id. Additional operational fields may appear.",
      },
      {
        question: "Can an agent ask a focused question about a recording?",
        answer:
          "Yes. Pass --instruction to request a specific observation, summary, event list, or review finding instead of a general description.",
      },
    ],
    final: {
      title: "Turn the recording into a decision.",
      body: "Equip the agent, provide a video, and keep the resulting evidence in the workflow that needs it.",
    },
  },
  "pt-br": {
    metadata: {
      title: "Análise de vídeo para agentes de IA | AnyCap",
      description:
        "Dê aos agentes de IA um fluxo de CLI para analisar vídeos remotos e gravações locais, extrair contexto útil e levar as conclusões para a próxima etapa.",
      openGraphTitle: "Análise de vídeo para agentes de IA | AnyCap",
      openGraphDescription:
        "Analise vídeos remotos e gravações locais a partir do fluxo de um agente com a CLI do AnyCap.",
      articleHeadline: "Análise de vídeo para agentes de IA",
      articleDescription:
        "Guia operacional para usar a ação video-read do AnyCap em revisão de gravações, extração de conteúdo e pontos de controle do fluxo.",
      articleAbout: [
        "Análise de vídeo",
        "Entendimento de vídeo",
        "Revisão de gravações",
        "Fluxos de agentes de IA",
        "CLI do AnyCap",
      ],
      articleKeywords: [
        "análise de vídeo para agentes de IA",
        "CLI de entendimento de vídeo",
        "análise de gravação de tela",
        "revisão de qualidade por agente",
      ],
    },
    breadcrumbItems: [
      { name: "Início", href: "/" },
      { name: "Capacidades", href: "/capabilities" },
      { name: "Análise de vídeo", href: VIDEO_ANALYSIS_PATH },
    ],
    eyebrow: "Capacidades",
    lastUpdatedLabel: "Atualizado em 11 de julho de 2026",
    title: "Análise de vídeo",
    accentTitle: "para agentes de IA.",
    intro:
      "O AnyCap permite que um agente analise um vídeo remoto ou uma gravação local enviada com a ação video-read. Adicione uma instrução quando o fluxo precisar de uma resposta específica e leve o conteúdo retornado e o contexto da solicitação para revisão, extração ou a próxima etapa automatizada.",
    chrome: {
      searchIntentLabel: "Tarefas comuns",
      positioningLines: [
        "Uma gravação é uma entrada, não outra fila de revisão.",
        "O agente pode inspecioná-la antes de o fluxo continuar.",
      ],
      positioningSummary: "O AnyCap transforma evidência em vídeo em contexto para o agente.",
    },
    searchIntents: [
      "Revisar uma gravação de bug",
      "Extrair eventos importantes",
      "Verificar uma etapa do fluxo",
    ],
    actions: [
      { label: "Equipar seu agente", href: "/start", primary: true },
      { label: "Fluxo do Codex", href: "/for/codex" },
      { label: "Gerar vídeo", href: "/capabilities/video-generation" },
    ],
    demo: {
      labels: { header: "agente com anycap" },
      title: "Inspecione a gravação",
      body: "Uma instrução específica transforma a gravação em conclusões que o agente pode usar.",
      lines: [
        { type: "header", delay: 0 },
        {
          type: "prompt",
          content: "Resuma esta gravação de bug e identifique as etapas de reprodução",
          delay: 500,
        },
        {
          type: "text",
          content: "Vou analisar a gravação usando a análise de vídeo do AnyCap.",
          delay: 800,
        },
        { type: "tool", content: VIDEO_ANALYSIS_DEMO_COMMAND, delay: 600 },
        {
          type: "text",
          content: "Análise concluída — gravação de 12 s, 4 eventos principais detectados.",
          sub: "✓",
          delay: 1800,
        },
        {
          type: "analysis",
          delay: 300,
          analysisLines: [
            "0:00 – O usuário abre o painel Configurações pela barra lateral.",
            '0:03 – Clica no controle "Tema" para mudar para o modo escuro.',
            "0:05 – O modal pisca em branco por ~200 ms antes de aplicar o fundo escuro.",
            "0:08 – O usuário fecha e reabre Configurações — o flash se repete a cada alteração.",
            "",
            "Bug: a transição de tema é aplicada à página antes do backdrop do modal, causando um flash branco visível.",
            "Causa raiz: provavelmente a ordem das transições CSS — o atraso do backdrop é maior que o da troca de conteúdo.",
          ] as string[],
        },
        {
          type: "text",
          content: "O flash ocorre a cada alteração. Parece um problema na ordem das transições CSS.",
          delay: 600,
        },
        { type: "cursor", delay: 500 },
      ],
    },
    proofPoints: [
      "A ação aceita uma URL de vídeo ou um arquivo local enviado, além de instrução e modelo opcionais.",
      "A CLI retorna o conteúdo da análise com contexto da solicitação, sem expor campos específicos do provedor.",
      "O mesmo resultado pode apoiar revisão de qualidade, extração de conteúdo ou um ponto de controle antes de outra ação do agente.",
    ],
    summary: {
      label: "A resposta operacional",
      text:
        "Use video-read quando um agente precisar inspecionar uma gravação, extrair uma conclusão útil e mantê-la no fluxo ativo.",
    },
    workflow: {
      title: "Como a análise de vídeo entra no fluxo",
      steps: [
        {
          title: "Fornecer",
          body: "Dê à ação uma URL de vídeo remoto ou um arquivo local. Arquivos locais são enviados antes da análise.",
        },
        {
          title: "Direcionar",
          body: "Use --instruction quando o agente precisar de um resultado específico, como um defeito, uma lista de eventos ou uma decisão de controle.",
        },
        {
          title: "Continuar",
          body: "Use o conteúdo retornado na próxima revisão, documento, geração ou automação e preserve o contexto da solicitação para suporte.",
        },
      ],
    },
    usageTitle: "Uso na CLI e resultado representativo",
    usageExamples: [
      {
        title: "Analisar um vídeo remoto",
        code: "anycap actions video-read --url https://example.com/demo.mp4",
      },
      {
        title: "Analisar uma gravação local",
        code: "anycap actions video-read --file ./recording.mp4",
      },
      {
        title: "Fazer uma pergunta específica",
        code: 'anycap actions video-read --url https://example.com/demo.mp4 --instruction "Identifique o defeito visível no checkout"',
      },
    ],
    responseExample: {
      title: "Resposta de sucesso representativa — 10 créditos por solicitação",
      code: `{
  "status": "success",
  "content": "A gravação mostra o modal de checkout cortando o botão de envio em uma viewport estreita.",
  "credit_cost": 10,
  "request_id": "req_abc123"
}`,
    },
    useCasesTitle: "Três formas de usar a análise de vídeo",
    useCases: [
      {
        meaning: "quality-review",
        title: "Revisão de qualidade",
        description:
          "Inspecione uma gravação de bug ou uma sessão de teste gravada em busca de defeitos visíveis, evidência de reprodução e comportamento da interface.",
      },
      {
        meaning: "content-extraction",
        title: "Extração de conteúdo",
        description:
          "Transforme uma demo, um walkthrough ou um clipe de pesquisa em resumo, lista de eventos ou observação específica.",
      },
      {
        meaning: "workflow-checkpoint",
        title: "Ponto de controle do fluxo",
        description:
          "Confirme que uma etapa gravada chegou ao estado esperado antes de o agente escrever, encaminhar ou gerar o próximo artefato.",
      },
    ],
    relatedTitle: "Continue o fluxo de vídeo",
    relatedCards: [
      {
        eyebrow: "Página de agente",
        title: "Fluxos de vídeo para Codex",
        href: "/for/codex",
        body: "Veja como o Codex descobre ações do AnyCap e leva resultados estruturados para a próxima etapa.",
      },
      {
        eyebrow: "Capacidade relacionada",
        title: "Geração de vídeo",
        href: "/capabilities/video-generation",
        body: "Crie ou edite um clipe e use a análise de vídeo quando o fluxo precisar inspecioná-lo.",
      },
      {
        eyebrow: "Guia de implementação",
        title: "Adicionar geração de vídeo a um agente de IA",
        href: "/guides/how-to-add-video-generation-to-ai-agent",
        body: "Siga o fluxo de geração orientado por schema e conecte os clipes retornados à revisão e à entrega.",
      },
    ],
    faqTitle: "Perguntas frequentes",
    faqItems: [
      {
        question: "O que a ação video-read aceita?",
        answer:
          "Forneça um --url ou um --file. Um arquivo local é enviado primeiro e não pode passar de 100 MB. Você também pode adicionar --instruction ou selecionar um modelo.",
      },
      {
        question: "Por que o comando se chama video-read?",
        answer:
          "video-read é a ação do AnyCap para analisar conteúdo de vídeo. Ela envia o vídeo fornecido e uma instrução opcional à capacidade de leitura de vídeo e retorna a análise como saída estruturada da CLI.",
      },
      {
        question: "Quais campos a CLI pode retornar?",
        answer:
          "Toda solicitação video-read concluída com sucesso custa 10 créditos e inclui credit_cost: 10. A resposta também inclui status e content; request_id aparece quando o servidor o fornece, e a CLI normalmente adiciona trace_id no nível superior. Outros campos operacionais podem aparecer.",
      },
      {
        question: "Um agente pode fazer uma pergunta específica sobre uma gravação?",
        answer:
          "Sim. Passe --instruction para solicitar uma observação, um resumo, uma lista de eventos ou uma conclusão de revisão em vez de uma descrição geral.",
      },
    ],
    final: {
      title: "Transforme a gravação em uma decisão.",
      body: "Equipe o agente, forneça um vídeo e mantenha a evidência resultante no fluxo que precisa dela.",
    },
  },
  id: {
    metadata: {
      title: "Analisis video untuk agen AI | AnyCap",
      description:
        "Berikan agen AI satu alur CLI untuk menganalisis video jarak jauh dan rekaman lokal, mengekstrak konteks berguna, lalu membawa temuan ke langkah berikutnya.",
      openGraphTitle: "Analisis video untuk agen AI | AnyCap",
      openGraphDescription:
        "Analisis video jarak jauh dan rekaman lokal dari alur agen dengan CLI AnyCap.",
      articleHeadline: "Analisis video untuk agen AI",
      articleDescription:
        "Panduan operasional untuk memakai tindakan video-read AnyCap dalam peninjauan rekaman, ekstraksi konten, dan checkpoint alur kerja.",
      articleAbout: [
        "Analisis video",
        "Pemahaman video",
        "Peninjauan rekaman",
        "Alur kerja agen AI",
        "CLI AnyCap",
      ],
      articleKeywords: [
        "analisis video untuk agen AI",
        "CLI pemahaman video",
        "analisis rekaman layar",
        "tinjauan kualitas agen",
      ],
    },
    breadcrumbItems: [
      { name: "Beranda", href: "/" },
      { name: "Kapabilitas", href: "/capabilities" },
      { name: "Analisis video", href: VIDEO_ANALYSIS_PATH },
    ],
    eyebrow: "Kapabilitas",
    lastUpdatedLabel: "Diperbarui 11 Juli 2026",
    title: "Analisis video",
    accentTitle: "untuk agen AI.",
    intro:
      "AnyCap memungkinkan agen menganalisis satu video jarak jauh atau rekaman lokal yang diunggah dengan tindakan video-read. Tambahkan instruksi saat alur memerlukan jawaban terarah, lalu bawa konten yang dikembalikan dan konteks permintaan ke peninjauan, ekstraksi, atau langkah otomatis berikutnya.",
    chrome: {
      searchIntentLabel: "Tugas umum",
      positioningLines: [
        "Rekaman adalah input, bukan antrean peninjauan terpisah.",
        "Agen dapat memeriksanya sebelum alur berlanjut.",
      ],
      positioningSummary: "AnyCap mengubah bukti video menjadi konteks agen.",
    },
    searchIntents: [
      "Tinjau rekaman bug",
      "Ekstrak peristiwa penting",
      "Periksa satu langkah alur",
    ],
    actions: [
      { label: "Lengkapi agen Anda", href: "/start", primary: true },
      { label: "Alur Codex", href: "/for/codex" },
      { label: "Buat video", href: "/capabilities/video-generation" },
    ],
    demo: {
      labels: { header: "agen dengan anycap" },
      title: "Periksa rekamannya",
      body: "Instruksi terarah mengubah rekaman menjadi temuan yang dapat digunakan agen.",
      lines: [
        { type: "header", delay: 0 },
        {
          type: "prompt",
          content: "Ringkas rekaman bug ini dan identifikasi langkah reproduksinya",
          delay: 500,
        },
        {
          type: "text",
          content: "Saya akan menganalisis rekaman ini dengan analisis video AnyCap.",
          delay: 800,
        },
        { type: "tool", content: VIDEO_ANALYSIS_DEMO_COMMAND, delay: 600 },
        {
          type: "text",
          content: "Analisis selesai — rekaman 12 detik, 4 peristiwa utama terdeteksi.",
          sub: "✓",
          delay: 1800,
        },
        {
          type: "analysis",
          delay: 300,
          analysisLines: [
            "0:00 – Pengguna membuka panel Pengaturan dari sidebar.",
            '0:03 – Mengklik toggle "Tema" untuk beralih ke mode gelap.',
            "0:05 – Modal berkedip putih selama ~200 ms sebelum menerapkan latar gelap.",
            "0:08 – Pengguna menutup dan membuka kembali Pengaturan — kilat putih berulang setiap kali tema diubah.",
            "",
            "Bug: transisi tema diterapkan ke halaman sebelum backdrop modal, sehingga menimbulkan kilat putih yang terlihat.",
            "Akar masalah: kemungkinan urutan transisi CSS — jeda backdrop lebih lama daripada pergantian konten.",
          ] as string[],
        },
        {
          type: "text",
          content: "Kilat putih terjadi setiap kali tema diubah. Ini tampak seperti masalah urutan transisi CSS.",
          delay: 600,
        },
        { type: "cursor", delay: 500 },
      ],
    },
    proofPoints: [
      "Tindakan ini menerima satu URL video atau satu file lokal yang diunggah serta instruksi atau model opsional.",
      "CLI mengembalikan konten analisis bersama konteks permintaan tanpa mengekspos field respons khusus penyedia.",
      "Hasil yang sama dapat mendukung tinjauan kualitas, ekstraksi konten, atau checkpoint sebelum tindakan agen berikutnya.",
    ],
    summary: {
      label: "Jawaban operasional",
      text:
        "Gunakan video-read saat agen perlu memeriksa rekaman, mengekstrak temuan yang berguna, dan mempertahankannya di dalam alur aktif.",
    },
    workflow: {
      title: "Cara analisis video masuk ke dalam alur",
      steps: [
        {
          title: "Berikan",
          body: "Berikan satu URL video jarak jauh atau satu file lokal. File lokal diunggah sebelum analisis.",
        },
        {
          title: "Arahkan",
          body: "Gunakan --instruction saat agen membutuhkan hasil terarah seperti cacat, daftar peristiwa, atau keputusan checkpoint.",
        },
        {
          title: "Lanjutkan",
          body: "Gunakan konten yang dikembalikan dalam peninjauan, dokumen, generasi, atau otomatisasi berikutnya dan simpan konteks permintaan untuk dukungan.",
        },
      ],
    },
    usageTitle: "Penggunaan CLI dan output representatif",
    usageExamples: [
      {
        title: "Analisis video jarak jauh",
        code: "anycap actions video-read --url https://example.com/demo.mp4",
      },
      {
        title: "Analisis rekaman lokal",
        code: "anycap actions video-read --file ./recording.mp4",
      },
      {
        title: "Ajukan pertanyaan terarah",
        code: 'anycap actions video-read --url https://example.com/demo.mp4 --instruction "Identifikasi cacat checkout yang terlihat"',
      },
    ],
    responseExample: {
      title: "Respons berhasil representatif — 10 kredit per permintaan",
      code: `{
  "status": "success",
  "content": "Rekaman menunjukkan modal checkout memotong tombol kirimnya pada viewport yang sempit.",
  "credit_cost": 10,
  "request_id": "req_abc123"
}`,
    },
    useCasesTitle: "Tiga cara agen memakai analisis video",
    useCases: [
      {
        meaning: "quality-review",
        title: "Tinjauan kualitas",
        description:
          "Periksa rekaman bug atau sesi pengujian yang direkam untuk menemukan cacat visual, bukti reproduksi, dan perilaku UI.",
      },
      {
        meaning: "content-extraction",
        title: "Ekstraksi konten",
        description:
          "Ubah demo, walkthrough, atau klip riset menjadi ringkasan, daftar peristiwa, atau pengamatan terarah.",
      },
      {
        meaning: "workflow-checkpoint",
        title: "Checkpoint alur kerja",
        description:
          "Pastikan langkah yang direkam mencapai keadaan yang diharapkan sebelum agen menulis, meneruskan, atau membuat artefak berikutnya.",
      },
    ],
    relatedTitle: "Lanjutkan alur video",
    relatedCards: [
      {
        eyebrow: "Halaman agen",
        title: "Alur video untuk Codex",
        href: "/for/codex",
        body: "Lihat bagaimana Codex menemukan tindakan AnyCap dan membawa hasil terstruktur ke langkah berikutnya.",
      },
      {
        eyebrow: "Kapabilitas terkait",
        title: "Generasi video",
        href: "/capabilities/video-generation",
        body: "Buat atau edit klip, lalu gunakan analisis video saat alur perlu memeriksanya.",
      },
      {
        eyebrow: "Panduan implementasi",
        title: "Tambahkan generasi video ke agen AI",
        href: "/guides/how-to-add-video-generation-to-ai-agent",
        body: "Ikuti alur generasi berbasis schema dan hubungkan klip yang dikembalikan ke peninjauan serta pengiriman.",
      },
    ],
    faqTitle: "Pertanyaan umum",
    faqItems: [
      {
        question: "Apa yang diterima tindakan video-read?",
        answer:
          "Berikan salah satu dari --url atau --file. File lokal diunggah terlebih dahulu dan ukurannya tidak boleh melebihi 100 MB. Anda juga dapat menambahkan --instruction atau memilih model.",
      },
      {
        question: "Mengapa perintahnya bernama video-read?",
        answer:
          "video-read adalah tindakan AnyCap untuk menganalisis konten video. Tindakan ini mengirim video dan instruksi opsional ke kapabilitas pembacaan video lalu mengembalikan analisis sebagai output CLI terstruktur.",
      },
      {
        question: "Field apa yang dapat dikembalikan CLI?",
        answer:
          "Setiap permintaan video-read yang berhasil dikenai biaya 10 kredit dan menyertakan credit_cost: 10. Respons juga menyertakan status dan content; request_id muncul saat server menyediakannya, dan CLI tingkat atas biasanya menambahkan trace_id. Field operasional tambahan dapat muncul.",
      },
      {
        question: "Bisakah agen mengajukan pertanyaan terarah tentang rekaman?",
        answer:
          "Bisa. Gunakan --instruction untuk meminta pengamatan, ringkasan, daftar peristiwa, atau temuan peninjauan tertentu, bukan deskripsi umum.",
      },
    ],
    final: {
      title: "Ubah rekaman menjadi keputusan.",
      body: "Lengkapi agen, berikan video, dan pertahankan bukti yang dihasilkan di dalam alur yang membutuhkannya.",
    },
  },
  de: {
    metadata: {
      title: "Videoanalyse für KI-Agenten | AnyCap",
      description:
        "Geben Sie KI-Agenten einen CLI-Workflow, um Remote-Videos und lokale Aufnahmen zu analysieren, verwertbaren Kontext zu extrahieren und Erkenntnisse in den nächsten Schritt zu übernehmen.",
      openGraphTitle: "Videoanalyse für KI-Agenten | AnyCap",
      openGraphDescription:
        "Analysieren Sie Remote-Videos und lokale Aufnahmen aus einem Agenten-Workflow mit der AnyCap-CLI.",
      articleHeadline: "Videoanalyse für KI-Agenten",
      articleDescription:
        "Operativer Leitfaden zur AnyCap-Aktion video-read für Aufnahmeprüfung, Inhaltsextraktion und Workflow-Kontrollpunkte.",
      articleAbout: [
        "Videoanalyse",
        "Videoverständnis",
        "Aufnahmeprüfung",
        "KI-Agenten-Workflows",
        "AnyCap-CLI",
      ],
      articleKeywords: [
        "Videoanalyse für KI-Agenten",
        "CLI für Videoverständnis",
        "Bildschirmaufnahme analysieren",
        "Qualitätsprüfung durch Agenten",
      ],
    },
    breadcrumbItems: [
      { name: "Startseite", href: "/" },
      { name: "Capabilities", href: "/capabilities" },
      { name: "Videoanalyse", href: VIDEO_ANALYSIS_PATH },
    ],
    eyebrow: "Capabilities",
    lastUpdatedLabel: "Aktualisiert am 11. Juli 2026",
    title: "Videoanalyse",
    accentTitle: "für KI-Agenten.",
    intro:
      "Mit AnyCap kann ein Agent ein Remote-Video oder eine hochgeladene lokale Aufnahme über die Aktion video-read analysieren. Ergänzen Sie eine Anweisung, wenn der Workflow eine gezielte Antwort braucht, und übernehmen Sie den zurückgegebenen Inhalt sowie den Anfragekontext in die Prüfung, Extraktion oder den nächsten automatisierten Schritt.",
    chrome: {
      searchIntentLabel: "Häufige Aufgaben",
      positioningLines: [
        "Eine Aufnahme ist Eingabe, keine separate Prüfwarteschlange.",
        "Der Agent kann sie prüfen, bevor der Workflow fortfährt.",
      ],
      positioningSummary: "AnyCap macht Videobelege zu Agentenkontext.",
    },
    searchIntents: [
      "Eine Bug-Aufnahme prüfen",
      "Schlüsselereignisse extrahieren",
      "Einen Workflow-Schritt kontrollieren",
    ],
    actions: [
      { label: "Agenten ausstatten", href: "/start", primary: true },
      { label: "Codex-Workflow", href: "/for/codex" },
      { label: "Video generieren", href: "/capabilities/video-generation" },
    ],
    demo: {
      labels: { header: "Agent mit AnyCap" },
      title: "Aufnahme prüfen",
      body: "Eine gezielte Anweisung macht aus der Aufnahme Erkenntnisse, die der Agent verwenden kann.",
      lines: [
        { type: "header", delay: 0 },
        {
          type: "prompt",
          content: "Fasse diese Bug-Aufnahme zusammen und ermittle die Reproduktionsschritte",
          delay: 500,
        },
        {
          type: "text",
          content: "Ich analysiere die Aufnahme mit der Videoanalyse von AnyCap.",
          delay: 800,
        },
        { type: "tool", content: VIDEO_ANALYSIS_DEMO_COMMAND, delay: 600 },
        {
          type: "text",
          content: "Analyse abgeschlossen — 12-Sekunden-Aufnahme, 4 Schlüsselereignisse erkannt.",
          sub: "✓",
          delay: 1800,
        },
        {
          type: "analysis",
          delay: 300,
          analysisLines: [
            "0:00 – Der Nutzer öffnet den Bereich Einstellungen über die Seitenleiste.",
            '0:03 – Klickt auf den Schalter "Theme", um in den Dunkelmodus zu wechseln.',
            "0:05 – Das Modal blitzt für etwa 200 ms weiß auf, bevor der dunkle Hintergrund angewendet wird.",
            "0:08 – Der Nutzer schließt und öffnet Einstellungen erneut — der Blitz wiederholt sich bei jedem Umschalten.",
            "",
            "Bug: Der Theme-Übergang wird auf die Seite angewendet, bevor der Modal-Backdrop folgt; dadurch entsteht ein sichtbarer weißer Blitz.",
            "Ursache: wahrscheinlich die Reihenfolge der CSS-Übergänge — die Verzögerung des Backdrops ist länger als der Inhaltswechsel.",
          ] as string[],
        },
        {
          type: "text",
          content: "Der weiße Blitz tritt bei jedem Umschalten auf. Das deutet auf ein Problem mit der Reihenfolge der CSS-Übergänge hin.",
          delay: 600,
        },
        { type: "cursor", delay: 500 },
      ],
    },
    proofPoints: [
      "Die Aktion akzeptiert eine Video-URL oder eine hochgeladene lokale Datei sowie optional eine Anweisung oder ein Modell.",
      "Die CLI gibt Analyseinhalt mit Anfragekontext zurück, ohne anbieterspezifische Antwortfelder offenzulegen.",
      "Dasselbe Ergebnis kann Qualitätsprüfung, Inhaltsextraktion oder einen Kontrollpunkt vor der nächsten Agentenaktion unterstützen.",
    ],
    summary: {
      label: "Die operative Antwort",
      text:
        "Verwenden Sie video-read, wenn ein Agent eine Aufnahme prüfen, eine verwertbare Erkenntnis extrahieren und sie im aktiven Workflow behalten muss.",
    },
    workflow: {
      title: "So passt Videoanalyse in den Workflow",
      steps: [
        {
          title: "Bereitstellen",
          body: "Geben Sie der Aktion eine Remote-Video-URL oder eine lokale Datei. Lokale Dateien werden vor der Analyse hochgeladen.",
        },
        {
          title: "Steuern",
          body: "Verwenden Sie --instruction, wenn der Agent ein gezieltes Ergebnis wie einen Defekt, eine Ereignisliste oder eine Kontrollpunktentscheidung braucht.",
        },
        {
          title: "Fortsetzen",
          body: "Nutzen Sie den zurückgegebenen Inhalt in der nächsten Prüfung, im nächsten Dokument, in der Generierung oder Automatisierung und bewahren Sie den Anfragekontext für den Support auf.",
        },
      ],
    },
    usageTitle: "CLI-Nutzung und repräsentative Ausgabe",
    usageExamples: [
      {
        title: "Ein Remote-Video analysieren",
        code: "anycap actions video-read --url https://example.com/demo.mp4",
      },
      {
        title: "Eine lokale Aufnahme analysieren",
        code: "anycap actions video-read --file ./recording.mp4",
      },
      {
        title: "Eine gezielte Frage stellen",
        code: 'anycap actions video-read --url https://example.com/demo.mp4 --instruction "Identifiziere den sichtbaren Checkout-Defekt"',
      },
    ],
    responseExample: {
      title: "Repräsentative erfolgreiche Antwort — 10 Credits pro Anfrage",
      code: `{
  "status": "success",
  "content": "Die Aufnahme zeigt, dass das Checkout-Modal seinen Absenden-Button in einem schmalen Viewport abschneidet.",
  "credit_cost": 10,
  "request_id": "req_abc123"
}`,
    },
    useCasesTitle: "Drei Einsatzformen der Videoanalyse",
    useCases: [
      {
        meaning: "quality-review",
        title: "Qualitätsprüfung",
        description:
          "Prüfen Sie eine Bug-Aufnahme oder eine aufgezeichnete Testsitzung auf sichtbare Defekte, Reproduktionsbelege und UI-Verhalten.",
      },
      {
        meaning: "content-extraction",
        title: "Inhaltsextraktion",
        description:
          "Machen Sie aus einer Demo, einem Walkthrough oder einem Rechercheclip eine Zusammenfassung, Ereignisliste oder gezielte Beobachtung.",
      },
      {
        meaning: "workflow-checkpoint",
        title: "Workflow-Kontrollpunkt",
        description:
          "Bestätigen Sie, dass ein aufgezeichneter Schritt den erwarteten Zustand erreicht hat, bevor der Agent das nächste Artefakt schreibt, weiterleitet oder generiert.",
      },
    ],
    relatedTitle: "Video-Workflow fortsetzen",
    relatedCards: [
      {
        eyebrow: "Agenten-Seite",
        title: "Video-Workflows für Codex",
        href: "/for/codex",
        body: "Sehen Sie, wie Codex AnyCap-Aktionen entdeckt und strukturierte Ergebnisse in den nächsten Schritt übernimmt.",
      },
      {
        eyebrow: "Verwandte Capability",
        title: "Videogenerierung",
        href: "/capabilities/video-generation",
        body: "Erstellen oder bearbeiten Sie einen Clip und nutzen Sie Videoanalyse, wenn der Workflow ihn prüfen muss.",
      },
      {
        eyebrow: "Implementierungsleitfaden",
        title: "Videogenerierung zu einem KI-Agenten hinzufügen",
        href: "/guides/how-to-add-video-generation-to-ai-agent",
        body: "Folgen Sie dem schemaorientierten Generierungsablauf und verbinden Sie zurückgegebene Clips mit Prüfung und Auslieferung.",
      },
    ],
    faqTitle: "Häufige Fragen",
    faqItems: [
      {
        question: "Was akzeptiert die Aktion video-read?",
        answer:
          "Geben Sie entweder --url oder --file an. Eine lokale Datei wird zuerst hochgeladen und darf höchstens 100 MB groß sein. Sie können außerdem --instruction hinzufügen oder ein Modell auswählen.",
      },
      {
        question: "Warum heißt der Befehl video-read?",
        answer:
          "video-read ist die AnyCap-Aktion zur Analyse von Videoinhalten. Sie sendet das angegebene Video und eine optionale Anweisung an die Video-Read-Capability und gibt die Analyse als strukturierte CLI-Ausgabe zurück.",
      },
      {
        question: "Welche Felder kann die CLI zurückgeben?",
        answer:
          "Jede erfolgreiche video-read-Anfrage kostet 10 Credits und enthält credit_cost: 10. Die Antwort enthält außerdem status und content; request_id erscheint, wenn der Server eine ID liefert, und die oberste CLI-Ebene ergänzt normalerweise trace_id. Zusätzliche betriebliche Felder können erscheinen.",
      },
      {
        question: "Kann ein Agent eine gezielte Frage zu einer Aufnahme stellen?",
        answer:
          "Ja. Verwenden Sie --instruction, um statt einer allgemeinen Beschreibung eine bestimmte Beobachtung, Zusammenfassung, Ereignisliste oder Prüferkenntnis anzufordern.",
      },
    ],
    final: {
      title: "Machen Sie aus der Aufnahme eine Entscheidung.",
      body: "Statten Sie den Agenten aus, stellen Sie ein Video bereit und behalten Sie die resultierenden Belege in dem Workflow, der sie benötigt.",
    },
  },
} as const satisfies Record<SiteLocale, VideoAnalysisPageContent>;

export function getVideoAnalysisMetadata(locale: SiteLocale): Metadata {
  const content: VideoAnalysisPageContent = contentByLocale[locale] ?? contentByLocale.en;

  return {
    title: content.metadata.title,
    description: content.metadata.description,
    alternates: { canonical: VIDEO_ANALYSIS_PATH },
    openGraph: {
      type: "website",
      locale: getLocaleConfig(locale).ogLocale,
      url: VIDEO_ANALYSIS_PATH,
      siteName: siteConfig.siteName,
      title: content.metadata.openGraphTitle,
      description: content.metadata.openGraphDescription,
    },
  };
}

export function getVideoAnalysisPageData(locale: SiteLocale) {
  const content: VideoAnalysisPageContent = contentByLocale[locale] ?? contentByLocale.en;
  const capabilityGuideJsonLd = createTechArticleJsonLd({
    headline: content.metadata.articleHeadline,
    description: content.metadata.articleDescription,
    path: VIDEO_ANALYSIS_PATH,
    locale,
    about: [...content.metadata.articleAbout],
    keywords: [...content.metadata.articleKeywords],
    datePublished: ARTICLE_PUBLISHED_ISO,
    dateModified: LAST_UPDATED_ISO,
  });

  return {
    ...content,
    usageExamples: [
      ...content.usageExamples,
      content.responseExample,
    ],
    capabilityGuideJsonLd,
  };
}

export type VideoAnalysisPageData = ReturnType<typeof getVideoAnalysisPageData>;
