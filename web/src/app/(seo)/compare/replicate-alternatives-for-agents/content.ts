import type { Metadata } from "next";
import { getLocaleConfig, siteConfig, type SiteLocale } from "@/lib/site";

export const REPLICATE_ALTERNATIVES_PATH = "/compare/replicate-alternatives-for-agents";

type AlternativeCard = {
  name: string;
  category: string;
  focus: string;
  strengths: readonly string[];
  considerations: readonly string[];
  bestFor: string;
  href?: string;
  cta?: string;
};

type ComparisonDimension = { dimension: string; replicate: string; anycap: string };

type ReplicateAlternativesPageData = {
  metadata: {
    title: string;
    description: string;
    openGraphTitle: string;
    openGraphDescription: string;
  };
  breadcrumbItems: readonly { name: string; href?: string; unlinkable?: boolean }[];
  eyebrow: string;
  lastUpdatedLabel: string;
  heroTitle: [string, string];
  heroIntro: string;
  tableTitle: string;
  tableIntro: string;
  tableColumns: { dimension: string; replicate: string; anycap: string };
  comparisonDimensions: readonly ComparisonDimension[];
  alternativesTitle: string;
  alternatives: readonly AlternativeCard[];
  faqTitle: string;
  faqItems: readonly { question: string; answer: string }[];
  relatedTitle: string;
  relatedComparisons: readonly { href: string; eyebrow: string; title: string; body: string }[];
  cta: readonly { href: string; label: string }[];
};

const en: ReplicateAlternativesPageData = {
  metadata: {
    title: "Top Replicate Alternatives for AI Agents (2026) — Image, Video, and Vision",
    description:
      "Compare the best Replicate alternatives for AI agent workflows. See how AnyCap, fal.ai, Hugging Face, and others handle image generation, video generation, and vision for Claude Code, Cursor, and Codex.",
    openGraphTitle: "Top Replicate Alternatives for AI Agents (2026)",
    openGraphDescription:
      "Compare Replicate alternatives for agent-native image, video, and vision workflows. Evaluate install experience, auth model, and agent compatibility.",
  },
  breadcrumbItems: [
    { name: "Home", href: "/" },
    { name: "Compare", href: "/compare", unlinkable: true },
    { name: "Replicate Alternatives for Agents" },
  ],
  eyebrow: "Compare",
  lastUpdatedLabel: "April 10, 2026",
  heroTitle: ["Top Replicate alternatives", "for AI agent workflows"],
  heroIntro:
    "Replicate is a strong model inference platform, but it was built for developers calling model APIs from custom code. If your workflow runs inside an AI agent like Claude Code, Cursor, or Codex, you may need a different kind of tool — one that installs into the agent, authenticates once, and provides capabilities through the same interface the agent already uses.",
  tableTitle: "Replicate vs AnyCap at a glance",
  tableIntro:
    "Before comparing all alternatives, here is how Replicate and AnyCap differ on the dimensions that matter most for agent workflows.",
  tableColumns: { dimension: "Dimension", replicate: "Replicate", anycap: "AnyCap" },
  comparisonDimensions: [
    {
      dimension: "Agent compatibility",
      replicate: "REST API and Python SDK; requires custom integration per agent",
      anycap: "Works across Claude Code, Cursor, Codex via skill files and one CLI",
    },
    {
      dimension: "Install experience",
      replicate: "pip install replicate + API key per model",
      anycap: "One skill file + one CLI binary + one login",
    },
    {
      dimension: "Model selection",
      replicate: "Thousands of community and official models",
      anycap: "Curated models (Seedream 5, Nano Banana Pro, Veo 3.1, Kling 3.0, etc.)",
    },
    {
      dimension: "Capability scope",
      replicate: "Primarily model inference (image, video, audio, text)",
      anycap: "Image, video, music, vision, search, crawl, storage, page publishing",
    },
    {
      dimension: "Auth model",
      replicate: "One API token, but each model has its own versioning and schema",
      anycap: "One login, one CLI, every capability through the same interface",
    },
    {
      dimension: "Pricing model",
      replicate: "Per-prediction pricing varies by model and hardware",
      anycap: "Pay-as-you-go with $5 free credit, no monthly fee",
    },
  ],
  alternativesTitle: "Alternatives compared",
  alternatives: [
    {
      name: "AnyCap",
      category: "Agent capability runtime",
      focus: "Built for AI agents. One CLI, one auth, every capability.",
      strengths: [
        "Single install path for image, video, vision, search, storage, and publishing",
        "Works across Claude Code, Cursor, Codex, and other agent products via skill files",
        "One login covers the full capability stack — no per-model API keys",
        "CLI-first interface designed for terminal-native agent workflows",
      ],
      considerations: [
        "Curated model selection rather than open model library",
        "Agent-native design — not built for custom backend pipelines",
      ],
      bestFor: "Teams using coding agents that need multimodal capabilities without per-provider integration",
      href: "/start",
      cta: "Get started with AnyCap",
    },
    {
      name: "fal.ai",
      category: "Serverless inference platform",
      focus: "Fast serverless inference for generative media models.",
      strengths: [
        "Very fast cold-start times for image and video models",
        "Pay-per-second pricing with no idle costs",
        "Python SDK and REST API for custom integration",
      ],
      considerations: [
        "Requires per-model API integration in your code",
        "No built-in agent discovery or skill-based install",
        "Separate auth and billing from other capability providers",
      ],
      bestFor: "Developers building custom backends or pipelines that need fast serverless GPU inference",
      href: "/compare/anycap-vs-fal-ai",
      cta: "See AnyCap vs fal.ai",
    },
    {
      name: "Hugging Face Inference API",
      category: "Model hub + inference endpoints",
      focus: "Access to the largest open-model ecosystem with managed inference.",
      strengths: [
        "Enormous model library — community and official models",
        "Free tier for experimentation",
        "Strong ecosystem for model discovery and evaluation",
      ],
      considerations: [
        "Cold starts on free tier can be slow",
        "Quality varies significantly across community models",
        "No unified auth across different model types",
      ],
      bestFor: "Researchers and teams that want access to the broadest model selection and are comfortable managing model quality themselves",
    },
    {
      name: "RunPod",
      category: "GPU cloud + serverless inference",
      focus: "Affordable GPU compute for custom model deployment.",
      strengths: [
        "Competitive GPU pricing",
        "Supports custom Docker containers and model deployments",
        "Good for teams with existing ComfyUI or custom pipelines",
      ],
      considerations: [
        "Requires infrastructure management for production use",
        "No agent-native interface or skill-based discovery",
        "You manage model selection, scaling, and reliability",
      ],
      bestFor: "Teams that want raw GPU compute and already have their own model serving infrastructure",
    },
    {
      name: "OpenAI Image API (DALL-E / GPT Image)",
      category: "First-party model API",
      focus: "OpenAI's image generation models through their API.",
      strengths: [
        "Strong brand recognition and documentation",
        "GPT Image model produces high-quality results",
        "Native integration with OpenAI agent SDKs",
      ],
      considerations: [
        "Only covers image generation — no video, vision, search, or storage",
        "Locked to OpenAI's model ecosystem",
        "Pricing can be higher than specialized providers for high-volume use",
      ],
      bestFor: "Teams already in the OpenAI ecosystem that only need image generation",
    },
  ],
  faqTitle: "FAQ",
  faqItems: [
    {
      question: "Is AnyCap a direct replacement for Replicate?",
      answer:
        "Not exactly. Replicate is a model inference platform for developers building custom backends. AnyCap is a capability runtime for AI agents. If you need to call specific models from your own code with fine-grained control, Replicate is the right tool. If you need agents like Claude Code or Cursor to generate images, create videos, and analyze visual content through one interface, AnyCap is the better fit.",
    },
    {
      question: "Can I use Replicate models through AnyCap?",
      answer:
        "AnyCap curates its own model selection rather than proxying Replicate's model library. The current image models include Seedream 5 and Nano Banana Pro; video models include Veo 3.1 and Kling 3.0. The trade-off is fewer models but a more consistent agent-native experience.",
    },
    {
      question: "Which is cheaper for image generation?",
      answer:
        "Pricing depends on the specific model and volume. AnyCap offers $5 in free credit and pay-as-you-go pricing with no monthly fee. Replicate charges per prediction with rates that vary by model and GPU. For agent workflows, the total cost also includes integration time — AnyCap's single-install approach can reduce setup overhead significantly.",
    },
    {
      question: "What if I need a model that AnyCap does not offer?",
      answer:
        "You can use Replicate, Hugging Face, or fal.ai for models outside AnyCap's curated selection. AnyCap does not lock you into its model set — it is one layer in your stack, not a replacement for every model API.",
    },
  ],
  relatedTitle: "Related comparisons",
  relatedComparisons: [
    {
      href: "/compare/anycap-vs-replicate",
      eyebrow: "Compare",
      title: "AnyCap vs Replicate",
      body: "Deep 1:1 comparison of AnyCap and Replicate.",
    },
    {
      href: "/compare/anycap-vs-fal-ai",
      eyebrow: "Compare",
      title: "AnyCap vs fal.ai",
      body: "Compare an agent capability runtime with a serverless inference platform.",
    },
  ],
  cta: [
    { href: "/start", label: "Get Started" },
    { href: "/capabilities", label: "See Capabilities" },
  ],
};

const ptBr: ReplicateAlternativesPageData = {
  metadata: {
    title: "Principais alternativas ao Replicate para agentes de IA (2026) — imagem, vídeo e visão",
    description:
      "Compare as melhores alternativas ao Replicate para fluxos de agentes de IA. Veja como AnyCap, fal.ai, Hugging Face e outras lidam com geração de imagem, geração de vídeo e visão para Claude Code, Cursor e Codex.",
    openGraphTitle: "Principais alternativas ao Replicate para agentes de IA (2026)",
    openGraphDescription:
      "Compare alternativas ao Replicate para fluxos nativos de agente em imagem, vídeo e visão. Avalie instalação, autenticação e compatibilidade com agentes.",
  },
  breadcrumbItems: [
    { name: "Início", href: "/" },
    { name: "Comparar", href: "/compare", unlinkable: true },
    { name: "Alternativas ao Replicate para agentes" },
  ],
  eyebrow: "Comparar",
  lastUpdatedLabel: "10 de abril de 2026",
  heroTitle: ["Principais alternativas ao Replicate", "para fluxos de agentes de IA"],
  heroIntro:
    "O Replicate é uma plataforma forte de inferência de modelos, mas foi criado para desenvolvedores que chamam APIs de modelo a partir de código próprio. Se o seu fluxo roda dentro de um agente de IA como Claude Code, Cursor ou Codex, você pode precisar de outra ferramenta — uma que se instala no agente, autentica uma vez e entrega capacidades pela mesma interface que o agente já usa.",
  tableTitle: "Replicate vs AnyCap em resumo",
  tableIntro:
    "Antes de comparar todas as alternativas, veja como Replicate e AnyCap diferem nas dimensões que mais importam para fluxos de agentes.",
  tableColumns: { dimension: "Dimensão", replicate: "Replicate", anycap: "AnyCap" },
  comparisonDimensions: [
    {
      dimension: "Compatibilidade com agente",
      replicate: "REST API e SDK Python; requer integração customizada por agente",
      anycap: "Funciona em Claude Code, Cursor e Codex via arquivos de skill e uma CLI única",
    },
    {
      dimension: "Experiência de instalação",
      replicate: "pip install replicate + API key por modelo",
      anycap: "Um arquivo de skill + um binário de CLI + um login",
    },
    {
      dimension: "Seleção de modelos",
      replicate: "Milhares de modelos da comunidade e oficiais",
      anycap: "Modelos curados (Seedream 5, Nano Banana Pro, Veo 3.1, Kling 3.0 etc.)",
    },
    {
      dimension: "Escopo de capacidades",
      replicate: "Principalmente inferência de modelos (imagem, vídeo, áudio, texto)",
      anycap: "Imagem, vídeo, música, visão, busca, crawl, armazenamento e publicação de páginas",
    },
    {
      dimension: "Modelo de autenticação",
      replicate: "Um token de API, mas cada modelo tem seu próprio versionamento e schema",
      anycap: "Um login, uma CLI e todas as capacidades pela mesma interface",
    },
    {
      dimension: "Modelo de preço",
      replicate: "Preço por prediction varia por modelo e hardware",
      anycap: "Pay-as-you-go com US$ 5 de crédito grátis, sem mensalidade",
    },
  ],
  alternativesTitle: "Alternativas comparadas",
  alternatives: [
    {
      name: "AnyCap",
      category: "Runtime de capacidades para agentes",
      focus: "Feito para agentes de IA. Uma CLI, uma autenticação, todas as capacidades.",
      strengths: [
        "Caminho único de instalação para imagem, vídeo, visão, busca, armazenamento e publicação",
        "Funciona em Claude Code, Cursor, Codex e outros produtos de agente via arquivos de skill",
        "Um login cobre toda a stack de capacidades — sem API key por modelo",
        "Interface CLI-first pensada para fluxos nativos de terminal",
      ],
      considerations: [
        "Seleção de modelos curada em vez de biblioteca aberta",
        "Projeto nativo para agente, não para pipelines customizados de backend",
      ],
      bestFor: "Times que usam agentes de código e precisam de capacidades multimodais sem integração por provedor",
      href: "/start",
      cta: "Comece com o AnyCap",
    },
    {
      name: "fal.ai",
      category: "Plataforma serverless de inferência",
      focus: "Inferência serverless rápida para modelos de mídia generativa.",
      strengths: [
        "Cold starts muito rápidos para modelos de imagem e vídeo",
        "Preço por segundo, sem custo ocioso",
        "SDK Python e REST API para integração personalizada",
      ],
      considerations: [
        "Exige integração por modelo no seu código",
        "Sem descoberta nativa por agente ou instalação por skill",
        "Autenticação e faturamento separados de outros provedores de capacidade",
      ],
      bestFor: "Desenvolvedores que constroem backends ou pipelines personalizados e precisam de inferência serverless rápida em GPU",
      href: "/compare/anycap-vs-fal-ai",
      cta: "Ver AnyCap vs fal.ai",
    },
    {
      name: "Hugging Face Inference API",
      category: "Hub de modelos + endpoints de inferência",
      focus: "Acesso ao maior ecossistema de modelos abertos com inferência gerenciada.",
      strengths: [
        "Biblioteca imensa de modelos — da comunidade e oficiais",
        "Plano grátis para experimentação",
        "Ecossistema forte para descoberta e avaliação de modelos",
      ],
      considerations: [
        "Cold starts no plano grátis podem ser lentos",
        "A qualidade varia bastante entre modelos da comunidade",
        "Sem autenticação unificada entre tipos de modelo",
      ],
      bestFor: "Pesquisadores e equipes que querem acesso à seleção de modelos mais ampla e aceitam gerenciar a qualidade sozinhos",
    },
    {
      name: "RunPod",
      category: "Cloud de GPU + inferência serverless",
      focus: "Compute de GPU acessível para deployment de modelos customizados.",
      strengths: [
        "Preço competitivo de GPU",
        "Suporta containers Docker e deployments customizados",
        "Bom para equipes que já usam ComfyUI ou pipelines próprios",
      ],
      considerations: [
        "Exige gestão de infraestrutura para produção",
        "Sem interface nativa para agente ou descoberta por skill",
        "Você gerencia seleção de modelo, escala e confiabilidade",
      ],
      bestFor: "Times que querem compute bruto em GPU e já possuem sua própria infraestrutura de serving de modelos",
    },
    {
      name: "OpenAI Image API (DALL-E / GPT Image)",
      category: "API de modelo first-party",
      focus: "Modelos de geração de imagem da OpenAI via API.",
      strengths: [
        "Marca forte e boa documentação",
        "O modelo GPT Image produz resultados de alta qualidade",
        "Integração nativa com os SDKs de agente da OpenAI",
      ],
      considerations: [
        "Só cobre geração de imagem — sem vídeo, visão, busca ou armazenamento",
        "Preso ao ecossistema de modelos da OpenAI",
        "Pode ser mais caro que provedores especializados em alto volume",
      ],
      bestFor: "Times já dentro do ecossistema OpenAI que só precisam de geração de imagem",
    },
  ],
  faqTitle: "FAQ",
  faqItems: [
    {
      question: "O AnyCap substitui o Replicate diretamente?",
      answer:
        "Não exatamente. O Replicate é uma plataforma de inferência para desenvolvedores que constroem backends customizados. O AnyCap é um runtime de capacidades para agentes de IA. Se você precisa chamar modelos específicos do seu próprio código com controle fino, o Replicate é a ferramenta certa. Se você precisa que agentes como Claude Code ou Cursor gerem imagens, criem vídeos e analisem conteúdo visual por uma única interface, o AnyCap encaixa melhor.",
    },
    {
      question: "Posso usar modelos do Replicate através do AnyCap?",
      answer:
        "O AnyCap faz curadoria dos próprios modelos em vez de fazer proxy da biblioteca do Replicate. Os modelos de imagem atuais incluem Seedream 5 e Nano Banana Pro; os de vídeo incluem Veo 3.1 e Kling 3.0. A troca é ter menos modelos, mas uma experiência nativa de agente mais consistente.",
    },
    {
      question: "Qual é mais barato para geração de imagem?",
      answer:
        "O preço depende do modelo e do volume. O AnyCap oferece US$ 5 de crédito grátis e preço pay-as-you-go sem mensalidade. O Replicate cobra por prediction com taxas que variam por modelo e GPU. Em fluxos de agente, o custo total também inclui tempo de integração — a abordagem de instalação única do AnyCap pode reduzir bastante o overhead de setup.",
    },
    {
      question: "E se eu precisar de um modelo que o AnyCap não oferece?",
      answer:
        "Você pode usar Replicate, Hugging Face ou fal.ai para modelos fora da seleção curada do AnyCap. O AnyCap não prende você ao seu conjunto de modelos — ele é uma camada da stack, não uma substituição para todas as APIs de modelo.",
    },
  ],
  relatedTitle: "Comparações relacionadas",
  relatedComparisons: [
    {
      href: "/compare/anycap-vs-replicate",
      eyebrow: "Comparar",
      title: "AnyCap vs Replicate",
      body: "Comparação 1:1 detalhada entre AnyCap e Replicate.",
    },
    {
      href: "/compare/anycap-vs-fal-ai",
      eyebrow: "Comparar",
      title: "AnyCap vs fal.ai",
      body: "Compare um runtime de capacidades para agentes com uma plataforma serverless de inferência.",
    },
  ],
  cta: [
    { href: "/start", label: "Começar" },
    { href: "/capabilities", label: "Ver capacidades" },
  ],
};

const id: ReplicateAlternativesPageData = {
  metadata: {
    title: "Alternatif Replicate terbaik untuk agen AI (2026) — gambar, video, dan visi",
    description:
      "Bandingkan alternatif Replicate terbaik untuk alur kerja agen AI. Lihat bagaimana AnyCap, fal.ai, Hugging Face, dan lainnya menangani pembuatan gambar, pembuatan video, dan visi untuk Claude Code, Cursor, dan Codex.",
    openGraphTitle: "Alternatif Replicate terbaik untuk agen AI (2026)",
    openGraphDescription:
      "Bandingkan alternatif Replicate untuk alur gambar, video, dan visi yang ramah agen. Nilai pengalaman instalasi, model autentikasi, dan kompatibilitas agen.",
  },
  breadcrumbItems: [
    { name: "Beranda", href: "/" },
    { name: "Bandingkan", href: "/compare", unlinkable: true },
    { name: "Alternatif Replicate untuk agen" },
  ],
  eyebrow: "Bandingkan",
  lastUpdatedLabel: "10 April 2026",
  heroTitle: ["Alternatif Replicate teratas", "untuk alur kerja agen AI"],
  heroIntro:
    "Replicate adalah platform inferensi model yang kuat, tetapi dibuat untuk pengembang yang memanggil API model dari kode kustom. Jika alur kerja Anda berjalan di dalam agen AI seperti Claude Code, Cursor, atau Codex, Anda mungkin memerlukan jenis alat lain — yang terpasang ke agen, mengautentikasi sekali, dan menyediakan kemampuan melalui antarmuka yang sama yang sudah digunakan agen.",
  tableTitle: "Replicate vs AnyCap sekilas",
  tableIntro:
    "Sebelum membandingkan semua alternatif, berikut perbedaan Replicate dan AnyCap pada dimensi yang paling penting untuk alur kerja agen.",
  tableColumns: { dimension: "Dimensi", replicate: "Replicate", anycap: "AnyCap" },
  comparisonDimensions: [
    {
      dimension: "Kompatibilitas agen",
      replicate: "REST API dan SDK Python; memerlukan integrasi kustom per agen",
      anycap: "Berjalan di Claude Code, Cursor, Codex melalui file skill dan satu CLI",
    },
    {
      dimension: "Pengalaman instalasi",
      replicate: "pip install replicate + API key per model",
      anycap: "Satu file skill + satu biner CLI + satu login",
    },
    {
      dimension: "Pemilihan model",
      replicate: "Ribuan model komunitas dan resmi",
      anycap: "Model terkurasi (Seedream 5, Nano Banana Pro, Veo 3.1, Kling 3.0, dll.)",
    },
    {
      dimension: "Cakupan kemampuan",
      replicate: "Terutama inferensi model (gambar, video, audio, teks)",
      anycap: "Gambar, video, musik, visi, pencarian, crawl, penyimpanan, publikasi halaman",
    },
    {
      dimension: "Model autentikasi",
      replicate: "Satu token API, tetapi setiap model punya versi dan skema sendiri",
      anycap: "Satu login, satu CLI, semua kemampuan melalui antarmuka yang sama",
    },
    {
      dimension: "Model harga",
      replicate: "Harga per prediksi bervariasi menurut model dan perangkat keras",
      anycap: "Bayar sesuai pemakaian dengan kredit gratis $5, tanpa biaya bulanan",
    },
  ],
  alternativesTitle: "Alternatif yang dibandingkan",
  alternatives: [
    {
      name: "AnyCap",
      category: "Runtime kemampuan untuk agen",
      focus: "Dibangun untuk agen AI. Satu CLI, satu autentikasi, semua kemampuan.",
      strengths: [
        "Satu jalur instalasi untuk gambar, video, visi, pencarian, penyimpanan, dan publikasi",
        "Berjalan di Claude Code, Cursor, Codex, dan produk agen lain melalui file skill",
        "Satu login mencakup seluruh tumpukan kemampuan — tanpa API key per model",
        "Antarmuka berbasis CLI yang dirancang untuk alur kerja agen native terminal",
      ],
      considerations: [
        "Pemilihan model terkurasi, bukan pustaka model terbuka",
        "Desain native untuk agen — tidak dibuat untuk pipeline backend kustom",
      ],
      bestFor:
        "Tim yang menggunakan agen pengkodean dan membutuhkan kemampuan multimodal tanpa integrasi per penyedia",
      href: "/start",
      cta: "Mulai dengan AnyCap",
    },
    {
      name: "fal.ai",
      category: "Platform inferensi serverless",
      focus: "Inferensi serverless cepat untuk model media generatif.",
      strengths: [
        "Waktu cold start sangat cepat untuk model gambar dan video",
        "Harga per detik tanpa biaya menganggur",
        "SDK Python dan REST API untuk integrasi kustom",
      ],
      considerations: [
        "Memerlukan integrasi API per model dalam kode Anda",
        "Tidak ada penemuan agen bawaan atau instalasi berbasis skill",
        "Autentikasi dan penagihan terpisah dari penyedia kemampuan lain",
      ],
      bestFor:
        "Pengembang yang membangun backend atau pipeline kustom yang membutuhkan inferensi GPU serverless cepat",
      href: "/compare/anycap-vs-fal-ai",
      cta: "Lihat AnyCap vs fal.ai",
    },
    {
      name: "Hugging Face Inference API",
      category: "Hub model + endpoint inferensi",
      focus: "Akses ke ekosistem model terbuka terbesar dengan inferensi terkelola.",
      strengths: [
        "Pustaka model sangat besar — komunitas dan resmi",
        "Tingkat gratis untuk eksperimen",
        "Ekosistem kuat untuk penemuan dan evaluasi model",
      ],
      considerations: [
        "Cold start di tingkat gratis bisa lambat",
        "Kualitas sangat bervariasi antar model komunitas",
        "Tidak ada autentikasi terpadu di berbagai jenis model",
      ],
      bestFor:
        "Peneliti dan tim yang ingin akses ke pemilihan model terluas dan nyaman mengelola kualitas model sendiri",
    },
    {
      name: "RunPod",
      category: "Cloud GPU + inferensi serverless",
      focus: "Komputasi GPU terjangkau untuk deployment model kustom.",
      strengths: [
        "Harga GPU kompetitif",
        "Mendukung kontainer Docker kustom dan deployment model",
        "Cocok untuk tim yang sudah punya ComfyUI atau pipeline kustom",
      ],
      considerations: [
        "Memerlukan pengelolaan infrastruktur untuk produksi",
        "Tidak ada antarmuka native agen atau penemuan berbasis skill",
        "Anda mengelola pemilihan model, skalabilitas, dan keandalan",
      ],
      bestFor:
        "Tim yang ingin komputasi GPU mentah dan sudah memiliki infrastruktur serving model sendiri",
    },
    {
      name: "OpenAI Image API (DALL-E / GPT Image)",
      category: "API model first-party",
      focus: "Model pembuatan gambar OpenAI melalui API mereka.",
      strengths: [
        "Pengakuan merek kuat dan dokumentasi baik",
        "Model GPT Image menghasilkan kualitas tinggi",
        "Integrasi native dengan SDK agen OpenAI",
      ],
      considerations: [
        "Hanya mencakup pembuatan gambar — tanpa video, visi, pencarian, atau penyimpanan",
        "Terikat pada ekosistem model OpenAI",
        "Harga bisa lebih tinggi dari penyedia khusus untuk volume tinggi",
      ],
      bestFor: "Tim yang sudah di ekosistem OpenAI dan hanya membutuhkan pembuatan gambar",
    },
  ],
  faqTitle: "FAQ",
  faqItems: [
    {
      question: "Apakah AnyCap pengganti langsung untuk Replicate?",
      answer:
        "Tidak persis. Replicate adalah platform inferensi model untuk pengembang yang membangun backend kustom. AnyCap adalah runtime kemampuan untuk agen AI. Jika Anda perlu memanggil model tertentu dari kode Anda sendiri dengan kontrol halus, Replicate adalah alat yang tepat. Jika Anda membutuhkan agen seperti Claude Code atau Cursor untuk membuat gambar, membuat video, dan menganalisis konten visual melalui satu antarmuka, AnyCap lebih cocok.",
    },
    {
      question: "Bisakah saya menggunakan model Replicate melalui AnyCap?",
      answer:
        "AnyCap mengkurasi pemilihan modelnya sendiri daripada mem-proxy pustaka model Replicate. Model gambar saat ini mencakup Seedream 5 dan Nano Banana Pro; model video mencakup Veo 3.1 dan Kling 3.0. Trade-off-nya adalah lebih sedikit model tetapi pengalaman native agen yang lebih konsisten.",
    },
    {
      question: "Mana yang lebih murah untuk pembuatan gambar?",
      answer:
        "Harga bergantung pada model spesifik dan volume. AnyCap menawarkan $5 kredit gratis dan harga bayar sesuai pemakaian tanpa biaya bulanan. Replicate mengenakan biaya per prediksi dengan tarif yang bervariasi menurut model dan GPU. Untuk alur kerja agen, total biaya juga mencakup waktu integrasi — pendekatan instalasi tunggal AnyCap dapat mengurangi overhead penyiapan secara signifikan.",
    },
    {
      question: "Bagaimana jika saya membutuhkan model yang tidak ditawarkan AnyCap?",
      answer:
        "Anda dapat menggunakan Replicate, Hugging Face, atau fal.ai untuk model di luar pilihan terkurasi AnyCap. AnyCap tidak mengunci Anda pada set modelnya — ini satu lapisan dalam tumpukan Anda, bukan pengganti setiap API model.",
    },
  ],
  relatedTitle: "Perbandingan terkait",
  relatedComparisons: [
    {
      href: "/compare/anycap-vs-replicate",
      eyebrow: "Bandingkan",
      title: "AnyCap vs Replicate",
      body: "Perbandingan mendalam 1:1 antara AnyCap dan Replicate.",
    },
    {
      href: "/compare/anycap-vs-fal-ai",
      eyebrow: "Bandingkan",
      title: "AnyCap vs fal.ai",
      body: "Bandingkan runtime kemampuan agen dengan platform inferensi serverless.",
    },
  ],
  cta: [
    { href: "/start", label: "Mulai" },
    { href: "/capabilities", label: "Lihat kemampuan" },
  ],
};

const contentByLocale: Record<SiteLocale, ReplicateAlternativesPageData> = {
  en,
  "pt-br": ptBr,
  id,
};

export function getReplicateAlternativesMetadata(locale: SiteLocale): Metadata {
  const content = contentByLocale[locale] ?? contentByLocale.en;
  return {
    title: content.metadata.title,
    description: content.metadata.description,
    openGraph: {
      type: "website",
      locale: getLocaleConfig(locale).ogLocale,
      url: REPLICATE_ALTERNATIVES_PATH,
      siteName: siteConfig.siteName,
      title: content.metadata.openGraphTitle,
      description: content.metadata.openGraphDescription,
    },
  };
}

export function getReplicateAlternativesPageData(locale: SiteLocale) {
  return contentByLocale[locale] ?? contentByLocale.en;
}
