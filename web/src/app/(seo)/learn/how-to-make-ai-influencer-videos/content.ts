import type { Metadata } from "next";
import { createFaqPageJsonLd, createTechArticleJsonLd } from "@/lib/schema";
import { defaultLocale, getLocaleConfig, siteConfig, type SiteLocale } from "@/lib/site";

export const HOW_TO_MAKE_AI_INFLUENCER_VIDEOS_PATH = "/learn/how-to-make-ai-influencer-videos";

const PAGE_RESOURCE_BASE = "https://cdn.anycap.ai/page_resource/learning";
const LAST_UPDATED_ISO = "2026-04-09";
const SOURCE_STILL_SRC = `${PAGE_RESOURCE_BASE}/how-to-make-ai-influencer-videos-product-demo.png`;
const PRODUCT_DEMO_VIDEO_SRC = `${PAGE_RESOURCE_BASE}/how-to-make-ai-influencer-videos-product-demo.mp4`;

type BreadcrumbItem = {
  name: string;
  href?: string;
};

type MetadataContent = {
  title: string;
  description: string;
  openGraphTitle: string;
  openGraphDescription: string;
  articleHeadline: string;
  articleDescription: string;
  articleAbout: string[];
  articleKeywords: string[];
};

type FaqItem = {
  question: string;
  answer: string;
};

type WorkflowStep = {
  title: string;
  body: string;
};

type ModelCard = {
  title: string;
  label: string;
  body: string;
  href: string;
};

type ValidationCard = {
  title: string;
  body: string;
};

type ComparisonRow = {
  lens: string;
  generic: string;
  workflow: string;
};

type CodeExample = {
  title: string;
  code: string;
};

type NextMoveCard = {
  title: string;
  href: string;
  body: string;
};

type LocalizedPageContent = {
  metadata: MetadataContent;
  breadcrumbItems: BreadcrumbItem[];
  eyebrow: string;
  lastUpdatedLabel: string;
  heroTitleLine1: string;
  heroTitleLine2: string;
  introBeforeLink: string;
  introLinkLabel: string;
  introAfterLink: string;
  answerSummaryLabel: string;
  answerSummaryText: string;
  generatedProofLabel: string;
  generatedProofTitle: string;
  generatedProofBody: string;
  sourceStillLabel: string;
  sourceStillAlt: string;
  generatedVideoLabel: string;
  productDemoVideoTitle: string;
  productDemoVideoDescription: string;
  motionPromptLabel: string;
  proofPrompt: string;
  whyProofMattersLabel: string;
  whyProofSignals: string[];
  proofSectionAfterText: string;
  quickAnswerLabel: string;
  quickAnswerTitle: string;
  quickAnswerBody: string;
  quickTakeaways: string[];
  workflowLabel: string;
  workflowTitle: string;
  stepLabelPrefix: string;
  workflowSteps: WorkflowStep[];
  validationLabel: string;
  validationTitle: string;
  validationCards: ValidationCard[];
  modelChoiceLabel: string;
  modelChoiceTitle: string;
  modelCards: ModelCard[];
  comparisonLabel: string;
  comparisonTitle: string;
  comparisonColumns: {
    lens: string;
    generic: string;
    workflow: string;
  };
  comparisonRows: ComparisonRow[];
  commandExamplesLabel: string;
  commandExamplesTitle: string;
  commandExamplesCta: string;
  codeExamples: CodeExample[];
  faqLabel: string;
  faqTitle: string;
  faqItems: FaqItem[];
  nextStepLabel: string;
  nextStepTitle: string;
  nextMoveCards: NextMoveCard[];
};

const enContent: LocalizedPageContent = {
    metadata: {
      title: "How to Make AI Influencer Videos with an AI Agent",
      description:
        "Create AI influencer videos by starting with a realistic still, promoting only the strongest frame into image-to-video, and inspecting the result before handoff.",
      openGraphTitle: "How to Make AI Influencer Videos with an AI Agent",
      openGraphDescription:
        "A still-first workflow for AI influencer videos using AnyCap image generation, image-to-video, and video QA instead of a generic avatar-video shortcut.",
      articleHeadline: "How to Make AI Influencer Videos with an AI Agent",
      articleDescription:
        "A practical guide to building AI influencer videos by locking the still image first, then animating the winning frame through image-to-video and reviewing the result inside the same workflow.",
      articleAbout: [
        "AI influencer videos",
        "Image-to-video",
        "Short-form video",
        "Video generation",
        "AI agents",
      ],
      articleKeywords: [
        "how to make ai influencer videos",
        "ai influencer video",
        "ai influencer video generator",
        "virtual influencer videos",
        "image to video influencer workflow",
      ],
    },
    breadcrumbItems: [
      { name: "Home", href: "/" },
      { name: "Learn", href: "/learn" },
      { name: "How to Make AI Influencer Videos", href: HOW_TO_MAKE_AI_INFLUENCER_VIDEOS_PATH },
    ],
    eyebrow: "Learn",
    lastUpdatedLabel: "Last updated April 9, 2026",
    heroTitleLine1: "How to make AI influencer videos",
    heroTitleLine2: "without starting from the wrong layer",
    introBeforeLink:
      "The practical answer is not `find a talking avatar tool and hope for the best.` Start with a realistic frame that already works. Then promote that frame into motion through",
    introLinkLabel: "AnyCap video generation",
    introAfterLink:
      ". That is the cleaner route when identity stability matters more than novelty.",
    answerSummaryLabel: "Answer-first summary",
    answerSummaryText:
      "The strongest AI influencer video workflow is still-first. Use Nano Banana to make a believable creator frame. Animate that frame through image-to-video. Then review the clip before you share it. This is more controllable than treating the whole job like one avatar-video prompt.",
    generatedProofLabel: "Generated proof",
    generatedProofTitle: "A source still plus one selling clip is stronger proof",
    generatedProofBody:
      "The talking-head still was moved to the concept page. Here, the better proof object is a channel-ready source frame plus the short Kling 3 motion pass generated from it. That makes the page show the actual branch from still to video instead of stopping one step early.",
    sourceStillLabel: "Source still",
    sourceStillAlt:
      "Photoreal vertical source still of a fictional beauty influencer holding an unlabeled serum bottle beside her face in a clean creator-studio setup.",
    generatedVideoLabel: "Generated video",
    productDemoVideoTitle: "Kling 3 product-demo video",
    productDemoVideoDescription:
      "A short Kling 3 product-selling clip generated from the source still to test whether the same identity survives creator-style motion.",
    motionPromptLabel: "Kling 3 motion prompt",
    proofPrompt:
      "take the same fictional beauty influencer identity from the source still and generate a short Kling 3 vertical skincare-selling clip. Keep the same face, hair, sweater, jewelry, and amber bottle. Add subtle bottle presentation toward camera, natural blink, light head motion, and believable creator-to-camera energy. Keep the motion realistic and the frame free of overlays, readable text, or watermark artifacts.",
    whyProofMattersLabel: "Why this proof matters",
    whyProofSignals: [
      "The source still already reads like a usable creator-commerce frame before motion begins.",
      "The Kling 3 clip tests the exact branch the page recommends: still first, then a narrow motion pass.",
      "Using the product-demo frame instead of another portrait pressures the workflow where identity, props, and hand motion usually break first.",
    ],
    proofSectionAfterText:
      "This proof section is closer to the real job than a pair of static stills. It shows the source frame that carried the identity and the generated selling clip that now has to keep that identity intact while adding motion.",
    quickAnswerLabel: "Quick answer",
    quickAnswerTitle: "The video is a branch from a frame",
    quickAnswerBody:
      "A believable AI influencer video depends on a believable still. The expression, the wardrobe, the social framing, and the lighting all need to work before motion enters the conversation. Once the frame is strong, the motion brief can stay small and realistic instead of trying to invent everything at once.",
    quickTakeaways: [
      "The still is the real budget decision. If the frame does not work, the video usually will not save it.",
      "The best workflow is still-first, then image-to-video, then clip QA. That is more controllable than jumping straight to a final avatar video.",
      "AnyCap is useful here because the agent can generate the still, animate it, inspect the clip, and keep the file in the same workflow.",
    ],
    workflowLabel: "Workflow",
    workflowTitle: "Five steps from still to short-form clip",
    stepLabelPrefix: "Step",
    workflowSteps: [
      {
        title: "Generate a realistic still first",
        body: "Start with a creator frame that already feels publishable as a thumbnail or promo still before you ask it to move.",
      },
      {
        title: "Frame for the channel",
        body: "Decide whether the target is vertical short-form, square social, or a wider promo shot. Motion behaves better when the crop is chosen early.",
      },
      {
        title: "Animate through image-to-video",
        body: "Use a small motion brief: natural head movement, subtle hand motion, direct-to-camera delivery. The point is believable motion, not maximal chaos.",
      },
      {
        title: "Review the clip with video QA",
        body: "Check whether the identity still feels stable, whether any visual artifacts appeared, and whether the shot still reads at the intended social size.",
      },
      {
        title: "Branch only if the first clip survives",
        body: "If the motion works, then create more scene variants, more aspect ratios, or more clips. If it fails, go back to the still instead of brute-forcing more video runs.",
      },
    ],
    validationLabel: "First-hand validation",
    validationTitle: "What we checked before recommending this path",
    validationCards: [
      {
        title: "Capability surface confirmed",
        body: "AnyCap status was rechecked on April 9, 2026. Image generation, video generation, image reading, video reading, Drive, and Page were available.",
      },
      {
        title: "Schema checked",
        body: "Nano Banana Pro, Nano Banana 2, Seedance 1.5 Pro, and Kling 3.0 were checked against the live schema before drafting and enriching this page.",
      },
      {
        title: "Still-first recommendation",
        body: "This page now shows the source still and a generated product-demo clip so the motion layer stays tied to a stable frame instead of floating free from the identity anchor.",
      },
      {
        title: "Realistic direction selected",
        body: "The proof asset direction stays in realistic creator-commerce territory rather than stylized avatar art, using a short product-selling motion pass instead of another static portrait only.",
      },
    ],
    modelChoiceLabel: "Model choice",
    modelChoiceTitle: "Assign one model to the still and one to motion",
    modelCards: [
      {
        title: "Nano Banana Pro",
        label: "Best first still",
        body: "Use this when realism and identity hold matter more than raw iteration speed.",
        href: "/models/nano-banana-pro",
      },
      {
        title: "Nano Banana 2",
        label: "Best for faster still exploration",
        body: "Use this when you want to compare several realistic creator directions before choosing the one worth animating.",
        href: "/models/nano-banana-2",
      },
      {
        title: "Seedance 1.5 Pro",
        label: "Best motion step",
        body: "Use this when the still already works and the next question is whether it can survive subtle creator-style motion.",
        href: "/models/seedance-1-5-pro",
      },
    ],
    comparisonLabel: "Comparison",
    comparisonTitle: "Generic avatar-video shortcut vs still-first workflow",
    comparisonColumns: {
      lens: "Lens",
      generic: "Generic shortcut",
      workflow: "Still-first workflow",
    },
    comparisonRows: [
      {
        lens: "Starting point",
        generic: "You start with the video generator and hope the identity settles later.",
        workflow: "You start with a still that already works, then animate only the frame that deserves it.",
      },
      {
        lens: "Motion control",
        generic: "The request is often too broad: talking head, gestures, scene, and style all at once.",
        workflow: "The motion brief stays narrow because the still already carries the identity, outfit, and framing.",
      },
      {
        lens: "Quality check",
        generic: "The workflow ends at render completion.",
        workflow: "The agent can read the clip and catch drift, artifacts, or awkward overlays before delivery.",
      },
      {
        lens: "Reuse",
        generic: "Every clip starts over.",
        workflow: "A good still can branch into several clips, crops, and short-form directions.",
      },
    ],
    commandExamplesLabel: "Command examples",
    commandExamplesTitle: "The still-first video loop in commands",
    commandExamplesCta: "Browse Video Generation",
    codeExamples: [
      {
        title: "Generate the still to animate",
        code: [
          "anycap image generate \\",
          "  --model nano-banana-pro \\",
          '  --prompt "fictional virtual creator, realistic short-form video portrait, creator speaking to camera, home-studio setup, natural skin texture, clean lighting, no readable text, no watermark" \\',
          "  --param aspect_ratio=9:16 \\",
          "  --param resolution=2k \\",
          "  -o influencer-video-still.png",
        ].join("\n"),
      },
      {
        title: "Animate the still through image-to-video",
        code: [
          "anycap video generate \\",
          "  --model seedance-1.5-pro \\",
          "  --mode image-to-video \\",
          '  --prompt "subtle hand gesture, natural head movement, direct-to-camera delivery, realistic social-video motion, keep the identity stable, no text overlays" \\',
          "  --param images=./influencer-video-still.png \\",
          "  --param aspect_ratio=9:16 \\",
          "  --param duration=5 \\",
          "  --param resolution=720p \\",
          "  -o influencer-video-short.mp4",
        ].join("\n"),
      },
      {
        title: "Review the finished clip",
        code: [
          "anycap actions video-read \\",
          "  --file ./influencer-video-short.mp4 \\",
          '  --instruction "Describe the clip, say whether the creator identity stayed stable, and mention any visible text overlays or motion artifacts."',
        ].join("\n"),
      },
    ],
    faqLabel: "FAQ",
    faqTitle: "Common questions before you animate the still",
    faqItems: [
      {
        question: "Should I start from text-to-video for AI influencer clips?",
        answer:
          "Usually no. The safer first move is to create a realistic still that already looks publishable, then animate that still through image-to-video. This keeps the identity more stable.",
      },
      {
        question: "Which AnyCap model should I use first on this page?",
        answer:
          "Use Nano Banana Pro when you want the strongest realistic still before motion. Use Nano Banana 2 for faster still exploration. Then move to Seedance 1.5 Pro when the frame is good enough to animate.",
      },
      {
        question: "Can AnyCap check whether the final clip still looks right?",
        answer:
          "Yes. After generation, use video reading to review whether the identity drifted, whether the framing stayed usable, and whether any text overlays or visual artifacts appeared.",
      },
      {
        question: "Do I need voice before I can make the video useful?",
        answer:
          "Not necessarily. The first useful milestone is a clean short-form motion clip with a stable identity. Voice can be layered later if the visual concept is already working.",
      },
    ],
    nextStepLabel: "Next step",
    nextStepTitle: "Keep the workflow moving in the same direction",
    nextMoveCards: [
      {
        title: "How to Make AI Influencers",
        href: "/learn/how-to-make-ai-influencers",
        body: "Go back to the anchor page if you need the broader still-plus-motion cluster view.",
      },
      {
        title: "AI Video Generator from Image",
        href: "/learn/ai-video-generator-from-image",
        body: "Use this when the image-to-video question is broader than the influencer niche alone.",
      },
      {
        title: "Create AI Influencer for Free",
        href: "/learn/create-ai-influencer-for-free",
        body: "Go here when you still need to validate the persona cheaply before you spend on motion.",
      },
      {
        title: "Video Generation",
        href: "/capabilities/video-generation",
        body: "Browse the public capability surface for the motion layer used on this page.",
      },
      {
        title: "Install AnyCap",
        href: "/guides/install-anycap",
        body: "Use this when you want to run the still-first video workflow locally.",
      },
      {
        title: "Drive",
        href: "/capabilities/drive",
        body: "Use Drive when the finished clip needs a shareable link for human review.",
      },
    ],
};

const contentByLocale = {
  en: enContent,
  "pt-br": {
    metadata: {
      title: "Como criar vídeos de influenciador com IA usando um agente de IA",
      description:
        "Crie vídeos de influenciador com IA começando por um still realista, promovendo apenas o melhor frame para image-to-video e revisando o resultado antes da entrega.",
      openGraphTitle: "Como criar vídeos de influenciador com IA usando um agente de IA",
      openGraphDescription:
        "Um fluxo still-first para vídeos de influenciador com IA usando geração de imagem do AnyCap, image-to-video e QA de vídeo em vez de um atalho genérico de avatar falante.",
      articleHeadline: "Como criar vídeos de influenciador com IA usando um agente de IA",
      articleDescription:
        "Um guia prático para produzir vídeos de influenciador com IA travando primeiro a imagem still, depois animando o frame vencedor com image-to-video e revisando o resultado no mesmo fluxo.",
      articleAbout: [
        "vídeos de influenciador com IA",
        "image-to-video",
        "vídeo curto",
        "geração de vídeo",
        "agentes de IA",
      ],
      articleKeywords: [
        "como criar vídeos de influenciador com ia",
        "vídeo de influenciador com ia",
        "gerador de vídeo de influenciador com ia",
        "vídeos de influenciador virtual",
        "workflow image-to-video para influenciadores",
      ],
    },
    breadcrumbItems: [
      { name: "Início", href: "/" },
      { name: "Aprender", href: "/learn" },
      { name: "Como criar vídeos de influenciador com IA", href: HOW_TO_MAKE_AI_INFLUENCER_VIDEOS_PATH },
    ],
    eyebrow: "Aprender",
    lastUpdatedLabel: "Atualizado em 9 de abril de 2026",
    heroTitleLine1: "Como criar vídeos de influenciador com IA",
    heroTitleLine2: "sem começar pela camada errada",
    introBeforeLink:
      "A resposta prática não é `encontre uma ferramenta de avatar falante e torça pelo melhor.` Comece por um frame realista que já funcione. Depois promova esse frame para movimento por meio de",
    introLinkLabel: "AnyCap video generation",
    introAfterLink:
      ". Esse é o caminho mais limpo quando a estabilidade da identidade importa mais do que a novidade.",
    answerSummaryLabel: "Resumo direto",
    answerSummaryText:
      "O fluxo mais forte para vídeos de influenciador com IA é still-first. Use Nano Banana para criar um frame de creator convincente. Anime esse frame com image-to-video. Depois revise o clipe antes de compartilhá-lo. Isso é mais controlável do que tratar tudo como um único prompt de avatar em vídeo.",
    generatedProofLabel: "Prova gerada",
    generatedProofTitle: "Um still de origem mais um clipe de venda é uma prova mais forte",
    generatedProofBody:
      "O still de talking head foi movido para a página de conceito. Aqui, o melhor objeto de prova é um frame de origem pronto para canal junto com o curto movimento em Kling 3 gerado a partir dele. Assim a página mostra o ramo real do still para o vídeo, em vez de parar uma etapa antes.",
    sourceStillLabel: "Still de origem",
    sourceStillAlt:
      "Still vertical fotorealista de uma influenciadora fictícia de beleza segurando um frasco de sérum sem rótulo ao lado do rosto em um setup limpo de creator studio.",
    generatedVideoLabel: "Vídeo gerado",
    productDemoVideoTitle: "Vídeo demo de produto em Kling 3",
    productDemoVideoDescription:
      "Um clipe curto de venda de produto em Kling 3 gerado a partir do still de origem para testar se a mesma identidade sobrevive ao movimento em estilo creator.",
    motionPromptLabel: "Prompt de movimento em Kling 3",
    proofPrompt:
      "pegue a mesma identidade fictícia de influenciadora de beleza do still de origem e gere um clipe vertical curto em Kling 3 vendendo skincare. Mantenha o mesmo rosto, cabelo, suéter, joias e frasco âmbar. Adicione uma apresentação sutil do frasco para a câmera, piscar natural, leve movimento de cabeça e uma energia crível de creator falando para a câmera. Mantenha o movimento realista e o frame sem overlays, texto legível ou artefatos de marca d'água.",
    whyProofMattersLabel: "Por que essa prova importa",
    whyProofSignals: [
      "O still de origem já funciona como um frame de creator commerce utilizável antes de o movimento começar.",
      "O clipe em Kling 3 testa exatamente o ramo recomendado na página: still primeiro, depois um passe de movimento estreito.",
      "Usar o frame de demo de produto, em vez de outro retrato, força o workflow onde identidade, props e movimento de mão costumam quebrar primeiro.",
    ],
    proofSectionAfterText:
      "Esta seção de prova fica mais próxima do trabalho real do que um par de stills estáticos. Ela mostra o frame de origem que carregou a identidade e o clipe de venda gerado que agora precisa manter essa identidade enquanto adiciona movimento.",
    quickAnswerLabel: "Resposta rápida",
    quickAnswerTitle: "O vídeo é um ramo que nasce de um frame",
    quickAnswerBody:
      "Um vídeo convincente de influenciador com IA depende de um still convincente. Expressão, roupa, enquadramento social e luz precisam funcionar antes de o movimento entrar na conversa. Quando o frame está forte, o briefing de movimento pode continuar pequeno e realista, em vez de tentar inventar tudo de uma vez.",
    quickTakeaways: [
      "O still é a decisão real de orçamento. Se o frame não funciona, o vídeo normalmente não vai salvá-lo.",
      "O melhor workflow é still-first, depois image-to-video e depois QA do clipe. Isso é mais controlável do que pular direto para um avatar em vídeo final.",
      "O AnyCap é útil aqui porque o agente pode gerar o still, animá-lo, inspecionar o clipe e manter o arquivo no mesmo workflow.",
    ],
    workflowLabel: "Workflow",
    workflowTitle: "Cinco passos do still ao clipe curto",
    stepLabelPrefix: "Passo",
    workflowSteps: [
      {
        title: "Gere primeiro um still realista",
        body: "Comece com um frame de creator que já pareça publicável como thumbnail ou still promocional antes de pedir movimento.",
      },
      {
        title: "Enquadre para o canal",
        body: "Decida se o alvo é short vertical, social quadrado ou um promo shot mais largo. O movimento se comporta melhor quando o crop é escolhido cedo.",
      },
      {
        title: "Anime via image-to-video",
        body: "Use um briefing de movimento curto: movimento natural de cabeça, gesto sutil com as mãos e entrega olhando para a câmera. O objetivo é movimento crível, não caos máximo.",
      },
      {
        title: "Revise o clipe com QA de vídeo",
        body: "Cheque se a identidade ainda parece estável, se surgiram artefatos visuais e se o enquadramento continua legível no tamanho social pretendido.",
      },
      {
        title: "Só ramifique se o primeiro clipe sobreviver",
        body: "Se o movimento funcionar, aí sim crie mais variações de cena, mais proporções ou mais clipes. Se falhar, volte ao still em vez de forçar mais rodadas de vídeo.",
      },
    ],
    validationLabel: "Validação em primeira mão",
    validationTitle: "O que verificamos antes de recomendar esse caminho",
    validationCards: [
      {
        title: "Superfície de capacidades confirmada",
        body: "O status do AnyCap foi checado novamente em 9 de abril de 2026. Geracao de imagem, geracao de video, leitura de imagem, leitura de video, Drive e Page estavam disponiveis.",
      },
      {
        title: "Schema conferido",
        body: "Nano Banana Pro, Nano Banana 2, Seedance 1.5 Pro e Kling 3.0 foram conferidos no schema ao vivo antes de redigir e enriquecer esta página.",
      },
      {
        title: "Recomendação still-first",
        body: "Esta página agora mostra o still de origem e um clipe demo de produto gerado para que a camada de movimento permaneça presa a um frame estável em vez de flutuar sem âncora de identidade.",
      },
      {
        title: "Direção realista escolhida",
        body: "A direção do asset de prova permanece em território realista de creator commerce, e não em arte de avatar estilizado, usando um passe curto de movimento de venda de produto em vez de outro retrato estático.",
      },
    ],
    modelChoiceLabel: "Escolha de modelo",
    modelChoiceTitle: "Atribua um modelo ao still e outro ao movimento",
    modelCards: [
      {
        title: "Nano Banana Pro",
        label: "Melhor primeiro still",
        body: "Use quando realismo e retenção de identidade importam mais do que velocidade bruta de iteração.",
        href: "/models/nano-banana-pro",
      },
      {
        title: "Nano Banana 2",
        label: "Melhor para explorar stills mais rápido",
        body: "Use quando quiser comparar várias direções realistas de creator antes de escolher a que realmente vale animar.",
        href: "/models/nano-banana-2",
      },
      {
        title: "Seedance 1.5 Pro",
        label: "Melhor etapa de movimento",
        body: "Use quando o still já funciona e a próxima pergunta é se ele aguenta um movimento sutil em estilo creator.",
        href: "/models/seedance-1-5-pro",
      },
    ],
    comparisonLabel: "Comparação",
    comparisonTitle: "Atalho genérico de avatar em vídeo vs workflow still-first",
    comparisonColumns: {
      lens: "Lente",
      generic: "Atalho genérico",
      workflow: "Workflow still-first",
    },
    comparisonRows: [
      {
        lens: "Ponto de partida",
        generic: "Você começa no gerador de vídeo e torce para a identidade se acertar depois.",
        workflow: "Você começa por um still que já funciona e anima apenas o frame que merece isso.",
      },
      {
        lens: "Controle de movimento",
        generic: "O pedido costuma ser amplo demais: talking head, gestos, cena e estilo ao mesmo tempo.",
        workflow: "O briefing de movimento fica estreito porque o still já carrega identidade, roupa e enquadramento.",
      },
      {
        lens: "Checagem de qualidade",
        generic: "O workflow termina quando o render acaba.",
        workflow: "O agente consegue ler o clipe e encontrar drift, artefatos ou overlays estranhos antes da entrega.",
      },
      {
        lens: "Reuso",
        generic: "Cada clipe começa do zero.",
        workflow: "Um bom still pode se ramificar em vários clipes, crops e direções de short-form.",
      },
    ],
    commandExamplesLabel: "Exemplos de comando",
    commandExamplesTitle: "O loop still-first em comandos",
    commandExamplesCta: "Ver Geracao de video",
    codeExamples: [
      {
        title: "Gere o still para animar",
        code: [
          "anycap image generate \\",
          "  --model nano-banana-pro \\",
          "  --prompt \"creator virtual fictícia, retrato realista para vídeo curto, creator falando para a câmera, setup de home studio, textura natural de pele, luz limpa, sem texto legível, sem marca d'água\" \\",
          "  --param aspect_ratio=9:16 \\",
          "  --param resolution=2k \\",
          "  -o influencer-video-still.png",
        ].join("\n"),
      },
      {
        title: "Anime o still via image-to-video",
        code: [
          "anycap video generate \\",
          "  --model seedance-1.5-pro \\",
          "  --mode image-to-video \\",
          '  --prompt "gesto sutil com a mão, movimento natural de cabeça, entrega olhando para a câmera, movimento realista para vídeo social, mantenha a identidade estável, sem overlays de texto" \\',
          "  --param images=./influencer-video-still.png \\",
          "  --param aspect_ratio=9:16 \\",
          "  --param duration=5 \\",
          "  --param resolution=720p \\",
          "  -o influencer-video-short.mp4",
        ].join("\n"),
      },
      {
        title: "Revise o clipe finalizado",
        code: [
          "anycap actions video-read \\",
          "  --file ./influencer-video-short.mp4 \\",
          '  --instruction "Descreva o clipe, diga se a identidade da creator permaneceu estável e mencione quaisquer overlays de texto ou artefatos de movimento visíveis."',
        ].join("\n"),
      },
    ],
    faqLabel: "FAQ",
    faqTitle: "Perguntas comuns antes de animar o still",
    faqItems: [
      {
        question: "Devo começar por text-to-video para clipes de influenciador com IA?",
        answer:
          "Normalmente não. O primeiro passo mais seguro é criar um still realista que já pareça publicável e depois animá-lo com image-to-video. Isso mantém a identidade mais estável.",
      },
      {
        question: "Qual modelo do AnyCap devo usar primeiro nesta página?",
        answer:
          "Use Nano Banana Pro quando quiser o still realista mais forte antes do movimento. Use Nano Banana 2 para explorar stills mais rápido. Depois passe para Seedance 1.5 Pro quando o frame já estiver bom o suficiente para animar.",
      },
      {
        question: "O AnyCap consegue verificar se o clipe final ainda parece certo?",
        answer:
          "Sim. Depois da geração, use video reading para revisar se a identidade derivou, se o enquadramento permaneceu utilizável e se apareceram overlays de texto ou artefatos visuais.",
      },
      {
        question: "Preciso de voz antes de o vídeo ficar útil?",
        answer:
          "Não necessariamente. O primeiro marco útil é um clipe curto limpo, com movimento e identidade estável. A voz pode ser adicionada depois se o conceito visual já estiver funcionando.",
      },
    ],
    nextStepLabel: "Próximo passo",
    nextStepTitle: "Mantenha o workflow avançando na mesma direção",
    nextMoveCards: [
      {
        title: "Como criar influenciadores com IA",
        href: "/learn/how-to-make-ai-influencers",
        body: "Volte para a página âncora se precisar da visão mais ampla do cluster still + movimento.",
      },
      {
        title: "Gerador de vídeo por IA a partir de imagem",
        href: "/learn/ai-video-generator-from-image",
        body: "Use esta página quando a dúvida sobre image-to-video for mais ampla do que o nicho de influencer.",
      },
      {
        title: "Criar influenciador com IA de graça",
        href: "/learn/create-ai-influencer-for-free",
        body: "Vá para lá se ainda precisar validar a persona com baixo custo antes de gastar em movimento.",
      },
      {
        title: "Geracao de video",
        href: "/capabilities/video-generation",
        body: "Veja a superfície pública de capacidades usada para a camada de movimento desta página.",
      },
      {
        title: "Instalar AnyCap",
        href: "/guides/install-anycap",
        body: "Use esta página quando quiser rodar o workflow still-first localmente.",
      },
      {
        title: "Drive",
        href: "/capabilities/drive",
        body: "Use o Drive quando o clipe final precisar de um link compartilhável para revisão humana.",
      },
    ],
  },
  id: {
    metadata: {
      title: "Cara membuat video AI influencer dengan agen AI",
      description:
        "Buat video AI influencer dengan memulai dari still yang realistis, hanya menaikkan frame terbaik ke image-to-video, lalu meninjau hasilnya sebelum dikirim.",
      openGraphTitle: "Cara membuat video AI influencer dengan agen AI",
      openGraphDescription:
        "Workflow still-first untuk video AI influencer dengan image generation AnyCap, image-to-video, dan QA video alih-alih shortcut avatar-video generik.",
      articleHeadline: "Cara membuat video AI influencer dengan agen AI",
      articleDescription:
        "Panduan praktis untuk membuat video AI influencer dengan mengunci still image terlebih dahulu, lalu menganimasikan frame terbaik melalui image-to-video dan meninjau hasilnya dalam workflow yang sama.",
      articleAbout: [
        "video AI influencer",
        "image-to-video",
        "video short-form",
        "video generation",
        "agen AI",
      ],
      articleKeywords: [
        "cara membuat video ai influencer",
        "video ai influencer",
        "generator video ai influencer",
        "video influencer virtual",
        "workflow image-to-video untuk influencer",
      ],
    },
    breadcrumbItems: [
      { name: "Beranda", href: "/" },
      { name: "Pelajari", href: "/learn" },
      { name: "Cara membuat video AI influencer", href: HOW_TO_MAKE_AI_INFLUENCER_VIDEOS_PATH },
    ],
    eyebrow: "Pelajari",
    lastUpdatedLabel: "Diperbarui 9 April 2026",
    heroTitleLine1: "Cara membuat video AI influencer",
    heroTitleLine2: "tanpa mulai dari layer yang salah",
    introBeforeLink:
      "Jawaban praktisnya bukan `cari tool avatar bicara lalu berharap hasilnya bagus.` Mulailah dari frame realistis yang sudah bekerja dengan baik. Lalu naikkan frame itu menjadi motion lewat",
    introLinkLabel: "AnyCap video generation",
    introAfterLink:
      ". Itulah rute yang lebih rapi ketika stabilitas identitas lebih penting daripada hal baru yang heboh.",
    answerSummaryLabel: "Ringkasan cepat",
    answerSummaryText:
      "Workflow AI influencer video yang paling kuat adalah still-first. Gunakan Nano Banana untuk membuat frame creator yang meyakinkan. Animasikan frame itu lewat image-to-video. Lalu review klipnya sebelum dibagikan. Ini lebih terkontrol daripada memperlakukan semuanya seperti satu prompt avatar-video.",
    generatedProofLabel: "Bukti hasil generasi",
    generatedProofTitle: "Satu source still plus satu selling clip adalah bukti yang lebih kuat",
    generatedProofBody:
      "Still talking-head dipindahkan ke halaman konsep. Di sini, objek bukti yang lebih tepat adalah source frame yang siap dipakai untuk channel plus motion pass Kling 3 singkat yang dihasilkan dari frame itu. Dengan begitu halaman ini menunjukkan cabang nyata dari still ke video, bukan berhenti satu langkah terlalu cepat.",
    sourceStillLabel: "Source still",
    sourceStillAlt:
      "Still vertikal fotorealistis dari AI beauty influencer fiktif yang memegang botol serum tanpa label di samping wajahnya dalam setup creator studio yang bersih.",
    generatedVideoLabel: "Video hasil generasi",
    productDemoVideoTitle: "Video demo produk Kling 3",
    productDemoVideoDescription:
      "Klip pendek penjualan produk di Kling 3 yang dihasilkan dari source still untuk menguji apakah identitas yang sama bertahan dalam motion bergaya creator.",
    motionPromptLabel: "Prompt motion Kling 3",
    proofPrompt:
      "gunakan identitas AI beauty influencer fiktif yang sama dari source still dan hasilkan klip vertikal pendek Kling 3 yang menjual skincare. Pertahankan wajah, rambut, sweater, perhiasan, dan botol amber yang sama. Tambahkan presentasi botol yang halus ke arah kamera, kedipan alami, sedikit gerakan kepala, dan energi creator-to-camera yang terasa meyakinkan. Jaga motion tetap realistis dan frame bebas dari overlay, teks yang terbaca, atau artefak watermark.",
    whyProofMattersLabel: "Mengapa bukti ini penting",
    whyProofSignals: [
      "Source still sudah terbaca sebagai frame creator-commerce yang bisa dipakai bahkan sebelum motion dimulai.",
      "Klip Kling 3 menguji persis cabang yang direkomendasikan halaman ini: still dulu, lalu motion pass yang sempit.",
      "Memakai frame demo produk, bukan potret lain, menekan workflow tepat di area yang biasanya paling cepat rusak: identitas, properti, dan gerakan tangan.",
    ],
    proofSectionAfterText:
      "Bagian bukti ini lebih dekat ke pekerjaan nyata daripada sepasang still statis. Bagian ini menunjukkan source frame yang membawa identitas dan selling clip hasil generasi yang sekarang harus menjaga identitas itu sambil menambahkan motion.",
    quickAnswerLabel: "Jawaban cepat",
    quickAnswerTitle: "Video adalah cabang yang tumbuh dari sebuah frame",
    quickAnswerBody:
      "Video AI influencer yang meyakinkan bergantung pada still yang meyakinkan. Ekspresi, outfit, framing sosial, dan pencahayaan semuanya harus sudah bekerja sebelum motion masuk ke pembahasan. Begitu frame-nya kuat, brief motion bisa tetap kecil dan realistis alih-alih mencoba menciptakan semuanya sekaligus.",
    quickTakeaways: [
      "Still adalah keputusan budget yang sesungguhnya. Jika frame tidak bekerja, video biasanya tidak akan menyelamatkannya.",
      "Workflow terbaik adalah still-first, lalu image-to-video, lalu QA klip. Ini lebih terkontrol daripada langsung melompat ke avatar-video final.",
      "AnyCap berguna di sini karena agen bisa membuat still, menganimasikannya, memeriksa klip, dan menyimpan file dalam workflow yang sama.",
    ],
    workflowLabel: "Workflow",
    workflowTitle: "Lima langkah dari still ke klip short-form",
    stepLabelPrefix: "Langkah",
    workflowSteps: [
      {
        title: "Buat still realistis terlebih dahulu",
        body: "Mulailah dari frame creator yang sudah terasa layak dipublikasikan sebagai thumbnail atau still promosi sebelum kamu memintanya bergerak.",
      },
      {
        title: "Tentukan framing untuk channel",
        body: "Putuskan apakah targetnya short vertikal, sosial persegi, atau promo shot yang lebih lebar. Motion bekerja lebih baik ketika crop dipilih lebih awal.",
      },
      {
        title: "Animasikan lewat image-to-video",
        body: "Gunakan brief motion yang kecil: gerakan kepala alami, gerakan tangan halus, dan delivery yang langsung ke kamera. Tujuannya adalah motion yang meyakinkan, bukan kekacauan maksimal.",
      },
      {
        title: "Tinjau klip dengan QA video",
        body: "Periksa apakah identitasnya masih terasa stabil, apakah muncul artefak visual, dan apakah shot-nya masih terbaca pada ukuran sosial yang dituju.",
      },
      {
        title: "Bercabang hanya jika klip pertama lolos",
        body: "Jika motion-nya berhasil, barulah buat lebih banyak variasi adegan, rasio, atau klip. Jika gagal, kembali ke still alih-alih memaksa lebih banyak run video.",
      },
    ],
    validationLabel: "Validasi langsung",
    validationTitle: "Yang kami cek sebelum merekomendasikan alur ini",
    validationCards: [
      {
        title: "Capability surface terkonfirmasi",
        body: "Status AnyCap dicek ulang pada 9 April 2026. Image generation, video generation, image reading, video reading, Drive, dan Page tersedia.",
      },
      {
        title: "Schema sudah dicek",
        body: "Nano Banana Pro, Nano Banana 2, Seedance 1.5 Pro, dan Kling 3.0 dicek ke schema live sebelum halaman ini ditulis dan diperkaya.",
      },
      {
        title: "Rekomendasi still-first",
        body: "Halaman ini sekarang menampilkan source still dan klip demo produk hasil generasi supaya layer motion tetap terikat ke frame yang stabil, bukan mengambang tanpa jangkar identitas.",
      },
      {
        title: "Arah realistis dipilih",
        body: "Arah asset bukti tetap berada di wilayah creator-commerce yang realistis, bukan seni avatar yang terlalu stylized, dengan motion pass penjualan produk yang singkat alih-alih sekadar potret statis lain.",
      },
    ],
    modelChoiceLabel: "Pilihan model",
    modelChoiceTitle: "Tetapkan satu model untuk still dan satu untuk motion",
    modelCards: [
      {
        title: "Nano Banana Pro",
        label: "Still awal terbaik",
        body: "Gunakan ketika realisme dan ketahanan identitas lebih penting daripada kecepatan iterasi mentah.",
        href: "/models/nano-banana-pro",
      },
      {
        title: "Nano Banana 2",
        label: "Terbaik untuk eksplorasi still yang lebih cepat",
        body: "Gunakan ketika kamu ingin membandingkan beberapa arah creator yang realistis sebelum memilih yang benar-benar layak dianimasikan.",
        href: "/models/nano-banana-2",
      },
      {
        title: "Seedance 1.5 Pro",
        label: "Tahap motion terbaik",
        body: "Gunakan ketika still-nya sudah bekerja dan pertanyaan berikutnya adalah apakah still itu bisa bertahan dalam motion halus bergaya creator.",
        href: "/models/seedance-1-5-pro",
      },
    ],
    comparisonLabel: "Perbandingan",
    comparisonTitle: "Shortcut avatar-video generik vs workflow still-first",
    comparisonColumns: {
      lens: "Sudut pandang",
      generic: "Shortcut generik",
      workflow: "Workflow still-first",
    },
    comparisonRows: [
      {
        lens: "Titik awal",
        generic: "Kamu mulai dari video generator dan berharap identitasnya beres belakangan.",
        workflow: "Kamu mulai dari still yang sudah bekerja, lalu hanya menganimasikan frame yang memang layak.",
      },
      {
        lens: "Kontrol motion",
        generic: "Permintaannya sering terlalu lebar: talking head, gesture, adegan, dan gaya sekaligus.",
        workflow: "Brief motion tetap sempit karena still sudah membawa identitas, outfit, dan framing-nya.",
      },
      {
        lens: "Pengecekan kualitas",
        generic: "Workflow berakhir saat render selesai.",
        workflow: "Agen bisa membaca klip dan menangkap drift, artefak, atau overlay yang canggung sebelum dikirim.",
      },
      {
        lens: "Reuse",
        generic: "Setiap klip mulai dari nol.",
        workflow: "Still yang bagus bisa bercabang menjadi beberapa klip, crop, dan arah short-form.",
      },
    ],
    commandExamplesLabel: "Contoh perintah",
    commandExamplesTitle: "Loop video still-first dalam bentuk command",
    commandExamplesCta: "Lihat Video Generation",
    codeExamples: [
      {
        title: "Buat still yang akan dianimasikan",
        code: [
          "anycap image generate \\",
          "  --model nano-banana-pro \\",
          '  --prompt "creator virtual fiktif, potret realistis untuk video short-form, creator berbicara ke kamera, setup home studio, tekstur kulit alami, pencahayaan bersih, tanpa teks yang terbaca, tanpa watermark" \\',
          "  --param aspect_ratio=9:16 \\",
          "  --param resolution=2k \\",
          "  -o influencer-video-still.png",
        ].join("\n"),
      },
      {
        title: "Animasikan still lewat image-to-video",
        code: [
          "anycap video generate \\",
          "  --model seedance-1.5-pro \\",
          "  --mode image-to-video \\",
          '  --prompt "gerakan tangan halus, gerakan kepala alami, delivery langsung ke kamera, motion realistis untuk video sosial, jaga identitas tetap stabil, tanpa overlay teks" \\',
          "  --param images=./influencer-video-still.png \\",
          "  --param aspect_ratio=9:16 \\",
          "  --param duration=5 \\",
          "  --param resolution=720p \\",
          "  -o influencer-video-short.mp4",
        ].join("\n"),
      },
      {
        title: "Tinjau klip yang sudah jadi",
        code: [
          "anycap actions video-read \\",
          "  --file ./influencer-video-short.mp4 \\",
          '  --instruction "Jelaskan klipnya, sebutkan apakah identitas creator tetap stabil, dan cantumkan overlay teks atau artefak motion yang terlihat."',
        ].join("\n"),
      },
    ],
    faqLabel: "FAQ",
    faqTitle: "Pertanyaan umum sebelum kamu menganimasikan still",
    faqItems: [
      {
        question: "Apakah saya sebaiknya mulai dari text-to-video untuk klip AI influencer?",
        answer:
          "Biasanya tidak. Langkah paling aman adalah membuat still realistis yang sudah tampak layak dipublikasikan, lalu menganimasikannya lewat image-to-video. Ini membuat identitas lebih stabil.",
      },
      {
        question: "Model AnyCap mana yang sebaiknya saya pakai dulu di halaman ini?",
        answer:
          "Gunakan Nano Banana Pro jika kamu ingin still realistis terkuat sebelum motion. Gunakan Nano Banana 2 untuk eksplorasi still yang lebih cepat. Lalu pindah ke Seedance 1.5 Pro ketika frame-nya sudah cukup bagus untuk dianimasikan.",
      },
      {
        question: "Bisakah AnyCap mengecek apakah klip final masih terlihat benar?",
        answer:
          "Ya. Setelah generasi selesai, gunakan video reading untuk meninjau apakah identitasnya melenceng, framing-nya masih bisa dipakai, dan apakah ada overlay teks atau artefak visual yang muncul.",
      },
      {
        question: "Apakah saya butuh voice sebelum videonya berguna?",
        answer:
          "Tidak harus. Milestone pertama yang benar-benar berguna adalah klip short-form yang bersih dengan motion dan identitas yang stabil. Voice bisa ditambahkan nanti jika konsep visualnya sudah bekerja.",
      },
    ],
    nextStepLabel: "Langkah berikutnya",
    nextStepTitle: "Jaga workflow tetap bergerak ke arah yang sama",
    nextMoveCards: [
      {
        title: "Cara membuat AI influencer",
        href: "/learn/how-to-make-ai-influencers",
        body: "Kembali ke halaman anchor jika kamu membutuhkan gambaran cluster still-plus-motion yang lebih luas.",
      },
      {
        title: "Generator video AI dari gambar",
        href: "/learn/ai-video-generator-from-image",
        body: "Gunakan ini ketika pertanyaan image-to-video kamu lebih luas daripada niche influencer saja.",
      },
      {
        title: "Buat AI influencer gratis",
        href: "/learn/create-ai-influencer-for-free",
        body: "Buka halaman ini jika kamu masih perlu memvalidasi persona dengan biaya rendah sebelum mengeluarkan budget untuk motion.",
      },
      {
        title: "Video Generation",
        href: "/capabilities/video-generation",
        body: "Lihat capability surface publik untuk layer motion yang dipakai di halaman ini.",
      },
      {
        title: "Install AnyCap",
        href: "/guides/install-anycap",
        body: "Gunakan halaman ini jika kamu ingin menjalankan workflow still-first secara lokal.",
      },
      {
        title: "Drive",
        href: "/capabilities/drive",
        body: "Gunakan Drive ketika klip final membutuhkan link yang bisa dibagikan untuk review manusia.",
      },
    ],
  },
  de: enContent,
} satisfies Record<SiteLocale, LocalizedPageContent>;

function getContent(locale: SiteLocale): LocalizedPageContent {
  return contentByLocale[locale] ?? contentByLocale[defaultLocale];
}

export function getHowToMakeAIInfluencerVideosMetadata(locale: SiteLocale): Metadata {
  const content = getContent(locale);

  return {
    title: content.metadata.title,
    description: content.metadata.description,
    alternates: { canonical: HOW_TO_MAKE_AI_INFLUENCER_VIDEOS_PATH },
    openGraph: {
      type: "website",
      locale: getLocaleConfig(locale).ogLocale,
      url: HOW_TO_MAKE_AI_INFLUENCER_VIDEOS_PATH,
      siteName: siteConfig.siteName,
      title: content.metadata.openGraphTitle,
      description: content.metadata.openGraphDescription,
    },
  };
}

export function getHowToMakeAIInfluencerVideosPageData(locale: SiteLocale) {
  const content = getContent(locale);

  return {
    ...content,
    articleJsonLd: createTechArticleJsonLd({
      headline: content.metadata.articleHeadline,
      description: content.metadata.articleDescription,
      path: HOW_TO_MAKE_AI_INFLUENCER_VIDEOS_PATH,
      locale,
      about: content.metadata.articleAbout,
      keywords: content.metadata.articleKeywords,
      datePublished: LAST_UPDATED_ISO,
      dateModified: LAST_UPDATED_ISO,
    }),
    faqJsonLd: createFaqPageJsonLd(content.faqItems),
    sourceStill: {
      src: SOURCE_STILL_SRC,
      alt: content.sourceStillAlt,
      width: 1536,
      height: 2752,
    },
    productDemoVideo: {
      src: PRODUCT_DEMO_VIDEO_SRC,
      title: content.productDemoVideoTitle,
      poster: SOURCE_STILL_SRC,
      description: content.productDemoVideoDescription,
    },
  };
}
