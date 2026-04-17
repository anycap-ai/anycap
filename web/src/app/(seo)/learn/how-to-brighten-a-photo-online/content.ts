import type { Metadata } from "next";
import type { LearnProofImage } from "@/components/seo/LearnProofShowcase";
import { createFaqPageJsonLd, createTechArticleJsonLd } from "@/lib/schema";
import { defaultLocale, getLocaleConfig, siteConfig, type SiteLocale } from "@/lib/site";

export const HOW_TO_BRIGHTEN_A_PHOTO_ONLINE_PATH = "/learn/how-to-brighten-a-photo-online";

const LAST_UPDATED_ISO = "2026-04-10";
const PAGE_RESOURCE_BASE = "https://cdn.anycap.ai/page_resource/learning";

type BreadcrumbItem = {
  name: string;
  href?: string;
};

type FaqItem = {
  question: string;
  answer: string;
};

type Card = {
  title: string;
  body: string;
};

type ComparisonRow = {
  lens: string;
  shallow: string;
  workflow: string;
};

type ModelCard = Card & {
  label: string;
  href: string;
};

type CodeExample = {
  title: string;
  code: string;
};

type NextMoveCard = Card & {
  href: string;
};

type BrightenPhotoPageContent = {
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
  breadcrumbItems: readonly BreadcrumbItem[];
  eyebrow: string;
  lastUpdatedLabel: string;
  hero: {
    titleLine1: string;
    titleLine2: string;
    introBeforeFirstLink: string;
    firstLinkLabel: string;
    introBetweenLinks: string;
    secondLinkLabel: string;
    introAfterSecondLink: string;
    summaryLabel: string;
    summaryText: string;
  };
  proof: {
    eyebrow: string;
    title: string;
    intro: string;
    promptLabel: string;
    prompt: string;
    signalsLabel: string;
    signals: readonly string[];
    caption: string;
    images: readonly LearnProofImage[];
  };
  quickAnswer: {
    eyebrow: string;
    title: string;
    intro: string;
    takeaways: readonly string[];
    cards: readonly Card[];
  };
  workflow: {
    eyebrow: string;
    title: string;
    stepLabel: string;
    steps: readonly Card[];
  };
  comparison: {
    eyebrow: string;
    title: string;
    shallowLabel: string;
    workflowLabel: string;
    rows: readonly ComparisonRow[];
  };
  modelChoice: {
    eyebrow: string;
    title: string;
    cards: readonly ModelCard[];
  };
  validation: {
    eyebrow: string;
    title: string;
    cards: readonly Card[];
  };
  cli: {
    eyebrow: string;
    title: string;
    examples: readonly CodeExample[];
  };
  faq: {
    eyebrow: string;
    title: string;
    items: readonly FaqItem[];
  };
  nextMove: {
    eyebrow: string;
    title: string;
    cards: readonly NextMoveCard[];
  };
};

const enContent: BrightenPhotoPageContent = {
  metadata: {
    title: "How to Brighten a Photo Online with an AI Agent",
    description:
      "Use AnyCap to brighten an underexposed photo, soften harsh shadow, and inspect whether the subject still looks natural before you publish the result.",
    openGraphTitle: "How to Brighten a Photo Online with an AI Agent",
    openGraphDescription:
      "A workflow guide for brightening a photo online through AnyCap image editing and image understanding while preserving the same subject and composition.",
    articleHeadline: "How to Brighten a Photo Online with an AI Agent",
    articleDescription:
      "A practical workflow for brightening a photo online through AnyCap with natural-light preservation and QA.",
    articleAbout: [
      "Brighten photo online",
      "Photo enhancement",
      "Shadow cleanup",
      "Portrait editing",
      "Image understanding",
      "AI agents",
    ],
    articleKeywords: [
      "brighten a photo online",
      "fix dark photo ai",
      "lighten image online",
      "improve underexposed photo",
      "photo brightener workflow",
    ],
  },
  breadcrumbItems: [
    { name: "Home", href: "/" },
    { name: "Learn", href: "/learn" },
    {
      name: "How to Brighten a Photo Online",
      href: HOW_TO_BRIGHTEN_A_PHOTO_ONLINE_PATH,
    },
  ],
  eyebrow: "Learn",
  lastUpdatedLabel: "Last updated April 10, 2026",
  hero: {
    titleLine1: "How to brighten a photo online",
    titleLine2: "without washing out the subject",
    introBeforeFirstLink:
      "If you want to brighten a photo online, the useful job is not just pushing exposure upward. The real goal is to recover a darker image while keeping skin, background, and overall mood believable. That is where",
    firstLinkLabel: "AnyCap image generation",
    introBetweenLinks: "plus",
    secondLinkLabel: "image understanding",
    introAfterSecondLink: "creates a stronger workflow than a generic brightness slider.",
    summaryLabel: "Answer-first summary",
    summaryText:
      "A useful brightening workflow means controlled enhancement plus QA. AnyCap helps the agent brighten a dark photo, soften harsh shadow, and inspect whether the result still feels like the same person in the same scene rather than an overprocessed edit.",
  },
  proof: {
    eyebrow: "Generated proof",
    title: "A real low-light portrait correction",
    intro:
      "This page uses a real before-and-after proof pair generated with AnyCap. The left frame is the darker portrait with a strong strip of light and shadow across the face. The right frame brightens the photo and softens the harsh contrast while preserving the same subject, pose, and room.",
    promptLabel: "Edit prompt used with AnyCap",
    prompt:
      "brighten this indoor portrait naturally, lift the midtones and face exposure, soften the harsh shadow across the face, preserve the same woman, pose, window framing, sweater texture, and room details, realistic daylight, no text, no watermark",
    signalsLabel: "Why this proof matters",
    signals: [
      "It shows an actual correction workflow instead of a synthetic stock slider demo.",
      "The result keeps the same portrait framing, which makes the lighting fix easy to judge.",
      "It supports the more honest claim AnyCap can make first: brighten the photo while preserving realism, then inspect the result.",
    ],
    caption:
      "The left image is the darker source portrait. The right image is the AnyCap brightened result generated from that same file.",
    images: [
      {
        src: `${PAGE_RESOURCE_BASE}/pt-br-brighten-photo-source-2026-04-10.png`,
        alt: "Indoor portrait of a woman by a window with a harsh diagonal strip of light and shadow across her face.",
        width: 1200,
        height: 896,
        label: "Source photo",
        frameVariant: "plain",
      },
      {
        src: `${PAGE_RESOURCE_BASE}/pt-br-brighten-photo-result-2026-04-10.png`,
        alt: "The same indoor portrait after the photo was brightened and the facial shadow was softened.",
        width: 1200,
        height: 896,
        label: "Brightened result",
        frameVariant: "plain",
      },
    ],
  },
  quickAnswer: {
    eyebrow: "Quick answer",
    title: "Brightening is useful only when the photo still feels real",
    intro:
      "A quick exposure slider can make a photo brighter and worse at the same time. The useful question is whether the edit recovers visibility without flattening skin, clipping highlights, or making the room look fake. That is why the better workflow is brighten plus inspect.",
    takeaways: [
      "The prompt should say what kind of brightness change you want and what should remain stable in the frame.",
      "Midtone recovery and shadow softening are usually more important than simply increasing global brightness.",
      "A good workflow checks that the brighter result still looks like the same person in the same light, not a different generated portrait.",
    ],
    cards: [
      {
        title: "Portrait rescue",
        body: "Best when a face is underexposed or partially shadowed but the expression and composition are already worth keeping.",
      },
      {
        title: "Window-light correction",
        body: "Useful when a strong beam of light creates a harsh stripe that makes the photo harder to reuse.",
      },
      {
        title: "Content and profile reuse",
        body: "Strong when the image needs to look cleaner for docs, bios, social profiles, or landing-page blocks without becoming overedited.",
      },
    ],
  },
  workflow: {
    eyebrow: "Workflow",
    title: "Five steps from dark source to publishable image",
    stepLabel: "Step",
    steps: [
      {
        title: "Keep the image that already has the right moment",
        body: "Start from the photo whose expression, pose, and framing you want to preserve. This workflow is about correction, not replacement.",
      },
      {
        title: "Describe the lighting problem precisely",
        body: "Call out underexposure, harsh facial shadow, backlighting, or dim indoor light so the edit solves the right issue.",
      },
      {
        title: "Protect the subject identity",
        body: "Repeat that the same person, pose, outfit, and room should stay stable while brightness changes.",
      },
      {
        title: "Inspect realism after the edit",
        body: "Check that skin tone, window light, and room depth still feel natural and were not flattened into a washed-out look.",
      },
      {
        title: "Branch into a second pass if needed",
        body: "If the first brightening fix is too soft or too aggressive, run a narrower follow-up prompt instead of starting from zero.",
      },
    ],
  },
  comparison: {
    eyebrow: "Why the workflow matters",
    title: "Brightness slider versus agent workflow",
    shallowLabel: "Generic slider",
    workflowLabel: "AnyCap workflow",
    rows: [
      {
        lens: "Primary goal",
        shallow: "Make the whole image brighter, even if highlights clip and skin loses nuance.",
        workflow: "Recover visibility while keeping the photo recognizable, believable, and channel-ready.",
      },
      {
        lens: "How the fix is described",
        shallow: "Mostly numeric, with little control over what should stay unchanged.",
        workflow: "The prompt can describe the exact lighting issue and the scene details that must remain stable.",
      },
      {
        lens: "Quality control",
        shallow: "The user eyeballs the slider result and stops there.",
        workflow: "The agent can inspect the result with image reading and decide whether a tighter shadow-softening pass is needed.",
      },
    ],
  },
  modelChoice: {
    eyebrow: "Model choice",
    title: "The current AnyCap stack for brightening photo workflows",
    cards: [
      {
        label: "Best first pass",
        title: "Nano Banana Pro",
        href: "/models/nano-banana-pro",
        body: "The strongest first option when you already have the source photo and want a natural-looking correction with better preservation of identity and composition.",
      },
      {
        label: "Fast iteration",
        title: "Nano Banana 2",
        href: "/models/nano-banana-2",
        body: "Useful when you want quick alternate passes for slightly brighter, softer, or more contrast-balanced versions.",
      },
      {
        label: "QA layer",
        title: "Image Understanding",
        href: "/capabilities/image-understanding",
        body: "Use image reading after generation to confirm that the brighter photo still looks natural and artifact-free.",
      },
    ],
  },
  validation: {
    eyebrow: "What to validate",
    title: "Four checks before you export the brighter version",
    cards: [
      {
        title: "The same subject remains",
        body: "Confirm the edit kept the same face, hairstyle, pose, and expression instead of drifting into a subtly different portrait.",
      },
      {
        title: "Shadows were softened, not erased unrealistically",
        body: "The goal is usually better visibility, not a flat face with no light direction left at all.",
      },
      {
        title: "Highlights still feel controlled",
        body: "Check the window area, skin reflections, and bright fabric so the correction does not clip into a washed-out mess.",
      },
      {
        title: "No visible AI residue",
        body: "Look for distorted eyes, smeared skin, broken fingers, random text, or watermark artifacts before you reuse the image.",
      },
    ],
  },
  cli: {
    eyebrow: "CLI examples",
    title: "Example commands aligned with the current schema",
    examples: [
      {
        title: "Brighten a dark portrait naturally",
        code: `anycap image generate \\
  --model nano-banana-pro \\
  --mode image-to-image \\
  --prompt "brighten this indoor portrait naturally, lift the midtones and face exposure, soften the harsh shadow across the face, preserve the same woman, pose, window framing, sweater texture, and room details, realistic daylight, no text, no watermark" \\
  --param images=./portrait-dark.png \\
  --param aspect_ratio=4:3 \\
  --param resolution=2k \\
  -o portrait-brightened.png`,
      },
      {
        title: "Run a softer shadow pass if needed",
        code: `anycap image generate \\
  --model nano-banana-2 \\
  --mode image-to-image \\
  --prompt "keep the same portrait and composition, reduce only the remaining hard facial shadow and gently brighten the cheek and eye area, preserve realistic skin tone and window light, no text, no watermark" \\
  --param images=./portrait-brightened.png \\
  --param aspect_ratio=4:3 \\
  --param resolution=2k \\
  -o portrait-brightened-pass-2.png`,
      },
      {
        title: "QA the corrected image",
        code: `anycap actions image-read \\
  --file ./portrait-brightened.png \\
  --instruction "Describe the portrait, confirm whether the same person and framing were preserved, and mention any sign of washed-out highlights, distorted facial detail, visible text, or watermark."`,
      },
    ],
  },
  faq: {
    eyebrow: "FAQ",
    title: "Questions that usually come next",
    items: [
      {
        question: "Is brightening a photo the same as removing shadows?",
        answer:
          "Not exactly. Brightening a photo is a broader correction goal that may include lifting exposure, opening shadows, and recovering visibility. Full shadow removal is narrower and often needs a more specific workflow.",
      },
      {
        question: "Why use an agent workflow instead of a brightness slider?",
        answer:
          "Because the useful outcome is not just a brighter file. It is a brighter file that still looks like the same subject in the same room. The AnyCap workflow lets you define the correction in words, then inspect whether the result stayed believable.",
      },
      {
        question: "What kind of photos are good candidates for this workflow?",
        answer:
          "Portraits near windows, indoor photos with harsh directional light, and underexposed content images are strong candidates. It works best when the original composition is already worth saving.",
      },
      {
        question: "Can AnyCap tell me whether the result looks overprocessed?",
        answer:
          "Yes. After generation, you can use image reading to describe the corrected photo and call out highlight clipping, strange skin texture, visible artifacts, or other signs that the edit should be refined.",
      },
    ],
  },
  nextMove: {
    eyebrow: "Next move",
    title: "Keep going from the edit you need next",
    cards: [
      {
        title: "How to Remove People from Photos",
        href: "/learn/how-to-remove-people-from-photos",
        body: "Go here when the main problem is a distracting person in the frame rather than underexposure or harsh light.",
      },
      {
        title: "How to Change a Photo Background",
        href: "/learn/how-to-change-photo-background",
        body: "Use this when the subject and exposure are fine but the environment around the photo needs to change.",
      },
      {
        title: "Nano Banana Pro",
        href: "/models/nano-banana-pro",
        body: "Read the model page when you want the strongest current fit for source-photo enhancement and cleanup.",
      },
      {
        title: "Install AnyCap",
        href: "/guides/install-anycap",
        body: "Start here if you want the CLI ready before testing the same correction workflow on your own photo.",
      },
    ],
  },
};

const ptBrContent: BrightenPhotoPageContent = {
  metadata: {
    title: "Como Clarear Foto Online com um Agente de IA",
    description:
      "Use AnyCap para clarear uma foto escura, suavizar sombra dura e revisar se o resultado ainda parece natural antes de publicar.",
    openGraphTitle: "Como Clarear Foto Online com um Agente de IA",
    openGraphDescription:
      "Um guia prático para clarear foto online com AnyCap, recuperar visibilidade e preservar o mesmo assunto e enquadramento.",
    articleHeadline: "Como Clarear Foto Online com um Agente de IA",
    articleDescription:
      "Um fluxo prático para clarear foto online com AnyCap, preservando a aparência natural da pessoa e do ambiente.",
    articleAbout: [
      "Clarear foto online",
      "Melhorar foto escura",
      "Suavizar sombra",
      "Edição de retrato",
      "Leitura de imagem",
      "Agentes de IA",
    ],
    articleKeywords: [
      "clarear foto online",
      "melhorar foto escura",
      "iluminar imagem com ia",
      "como clarear foto",
      "corrigir foto subexposta",
    ],
  },
  breadcrumbItems: [
    { name: "Home", href: "/" },
    { name: "Learn", href: "/learn" },
    {
      name: "Como clarear foto online",
      href: HOW_TO_BRIGHTEN_A_PHOTO_ONLINE_PATH,
    },
  ],
  eyebrow: "Learn",
  lastUpdatedLabel: "Atualizado em 10 de abril de 2026",
  hero: {
    titleLine1: "Como clarear foto online",
    titleLine2: "sem estourar a imagem",
    introBeforeFirstLink:
      "Quando alguém procura clarear foto online, o trabalho útil não é só empurrar a exposição para cima. O objetivo real é recuperar uma imagem escura sem matar a pele, o fundo e a sensação de luz do ambiente. É aí que",
    firstLinkLabel: "a geração de imagem do AnyCap",
    introBetweenLinks: "junto com",
    secondLinkLabel: "a leitura de imagem",
    introAfterSecondLink: "cria um fluxo melhor do que um slider genérico de brilho.",
    summaryLabel: "Resumo direto",
    summaryText:
      "Um fluxo útil para clarear foto online é correção controlada mais QA. O AnyCap ajuda o agente a iluminar uma foto escura, suavizar sombra dura e revisar se o resultado ainda parece a mesma pessoa na mesma cena, em vez de virar uma edição lavada.",
  },
  proof: {
    eyebrow: "Proof gerado",
    title: "Uma correção real de retrato com luz difícil",
    intro:
      "Esta página usa uma prova real gerada com AnyCap. O quadro da esquerda mostra um retrato mais escuro com uma faixa forte de luz e sombra cruzando o rosto. O quadro da direita clareia a foto e suaviza esse contraste, preservando a mesma pessoa, a mesma pose e o mesmo ambiente.",
    promptLabel: "Prompt de edição usado com AnyCap",
    prompt:
      "clareie este retrato interno de forma natural, levante os médios e a exposição do rosto, suavize a sombra dura atravessando o rosto, preserve a mesma mulher, a mesma pose, o enquadramento da janela, a textura do suéter e os detalhes do ambiente, luz do dia realista, sem texto, sem watermark",
    signalsLabel: "Por que esta prova importa",
    signals: [
      "Ela mostra uma correção real, não uma demo vazia de slider.",
      "O enquadramento permanece igual, então a melhoria de luz fica fácil de julgar.",
      "Ela sustenta a promessa mais honesta para lançamento: clarear a foto mantendo realismo e depois revisar o resultado.",
    ],
    caption:
      "A imagem da esquerda é o retrato mais escuro. A da direita é o resultado clareado com AnyCap a partir do mesmo arquivo fonte.",
    images: [
      {
        src: `${PAGE_RESOURCE_BASE}/pt-br-brighten-photo-source-2026-04-10.png`,
        alt: "Retrato interno de uma mulher perto da janela com uma faixa diagonal forte de luz e sombra sobre o rosto.",
        width: 1200,
        height: 896,
        label: "Foto original",
        frameVariant: "plain",
      },
      {
        src: `${PAGE_RESOURCE_BASE}/pt-br-brighten-photo-result-2026-04-10.png`,
        alt: "O mesmo retrato interno depois que a foto foi clareada e a sombra no rosto foi suavizada.",
        width: 1200,
        height: 896,
        label: "Resultado clareado",
        frameVariant: "plain",
      },
    ],
  },
  quickAnswer: {
    eyebrow: "Resposta rápida",
    title: "Clarear só vale quando a foto continua parecendo real",
    intro:
      "Um slider de exposição pode deixar a foto mais clara e pior ao mesmo tempo. O que importa é recuperar visibilidade sem achatar pele, estourar highlights ou deixar o ambiente com cara de falso. Por isso o fluxo melhor é clarear e revisar.",
    takeaways: [
      "O prompt deve dizer que tipo de correção de luz você quer e o que precisa permanecer estável no frame.",
      "Recuperar médios e suavizar sombra costuma ser mais importante do que aumentar brilho global de qualquer jeito.",
      "Um bom workflow checa se o resultado ainda parece a mesma pessoa na mesma luz, não um retrato diferente gerado do zero.",
    ],
    cards: [
      {
        title: "Resgate de retrato",
        body: "Melhor quando o rosto está subexposto ou com sombra forte, mas a expressão e a composição já valem a pena.",
      },
      {
        title: "Correção de luz de janela",
        body: "Útil quando um feixe forte de luz cria uma faixa dura que dificulta o reuso da imagem.",
      },
      {
        title: "Reuso em conteúdo e perfil",
        body: "Forte quando a foto precisa parecer mais limpa para docs, bios, perfis sociais ou blocos de landing page sem ficar artificial.",
      },
    ],
  },
  workflow: {
    eyebrow: "Workflow",
    title: "Cinco passos para sair de uma foto escura para uma imagem publicável",
    stepLabel: "Passo",
    steps: [
      {
        title: "Mantenha a imagem que já capturou o momento certo",
        body: "Comece pela foto cuja expressão, pose e enquadramento você quer preservar. Este fluxo é correção, não substituição.",
      },
      {
        title: "Descreva o problema de luz com precisão",
        body: "Fale se o problema é subexposição, sombra dura no rosto, contraluz ou pouca luz interna para a edição atacar o ponto certo.",
      },
      {
        title: "Proteja a identidade do assunto",
        body: "Repita que a mesma pessoa, a mesma pose, a mesma roupa e o mesmo ambiente devem continuar estáveis enquanto a luz melhora.",
      },
      {
        title: "Revise o realismo depois da edição",
        body: "Cheque se pele, luz de janela e profundidade do ambiente continuam naturais, sem virar um retrato lavado.",
      },
      {
        title: "Faça uma segunda passada se necessário",
        body: "Se a primeira correção ficou fraca ou agressiva demais, rode um prompt mais estreito em cima do resultado em vez de reiniciar tudo.",
      },
    ],
  },
  comparison: {
    eyebrow: "Por que o fluxo importa",
    title: "Slider de brilho versus workflow com agente",
    shallowLabel: "Slider genérico",
    workflowLabel: "Workflow com AnyCap",
    rows: [
      {
        lens: "Objetivo principal",
        shallow: "Deixar a imagem inteira mais clara, mesmo que highlights estourem e a pele perca nuance.",
        workflow: "Recuperar visibilidade preservando identidade, textura e sensação de luz real.",
      },
      {
        lens: "Como a correção é descrita",
        shallow: "Quase sempre só em números, com pouco controle sobre o que deve permanecer igual.",
        workflow: "O prompt pode descrever o problema exato de luz e os detalhes da cena que precisam continuar estáveis.",
      },
      {
        lens: "Controle de qualidade",
        shallow: "A pessoa olha rapidamente o resultado do slider e para por aí.",
        workflow: "O agente pode revisar com leitura de imagem e decidir se ainda precisa de uma segunda passada para sombra ou médios.",
      },
    ],
  },
  modelChoice: {
    eyebrow: "Escolha de modelo",
    title: "A stack atual do AnyCap para clarear foto online",
    cards: [
      {
        label: "Primeira passada",
        title: "Nano Banana Pro",
        href: "/models/nano-banana-pro",
        body: "A opção mais forte quando a foto fonte já existe e você quer uma correção natural com melhor preservação de identidade e composição.",
      },
      {
        label: "Iteração rápida",
        title: "Nano Banana 2",
        href: "/models/nano-banana-2",
        body: "Útil para testar rapidamente versões um pouco mais claras, mais suaves ou com contraste melhor equilibrado.",
      },
      {
        label: "Camada de QA",
        title: "Image Understanding",
        href: "/capabilities/image-understanding",
        body: "Use leitura de imagem depois da geração para confirmar que a foto clareada ainda parece natural e sem artefatos visíveis.",
      },
    ],
  },
  validation: {
    eyebrow: "O que validar",
    title: "Quatro checagens antes de exportar a versão clareada",
    cards: [
      {
        title: "A mesma pessoa continua presente",
        body: "Confirme que a edição preservou o mesmo rosto, cabelo, pose e expressão, sem drift para um retrato sutilmente diferente.",
      },
      {
        title: "A sombra foi suavizada, não apagada de forma falsa",
        body: "O objetivo costuma ser melhorar visibilidade, não deixar o rosto completamente plano e sem direção de luz.",
      },
      {
        title: "Highlights continuam controlados",
        body: "Revise a janela, reflexos de pele e tecido claro para garantir que a correção não estourou a imagem.",
      },
      {
        title: "Sem resíduo visível de IA",
        body: "Procure olhos distorcidos, pele borrada, dedos estranhos, texto aleatório ou watermark antes de reutilizar a foto.",
      },
    ],
  },
  cli: {
    eyebrow: "Exemplos de CLI",
    title: "Comandos de exemplo alinhados à schema atual",
    examples: [
      {
        title: "Clarear um retrato escuro com naturalidade",
        code: `anycap image generate \\
  --model nano-banana-pro \\
  --mode image-to-image \\
  --prompt "clareie este retrato interno de forma natural, levante os médios e a exposição do rosto, suavize a sombra dura atravessando o rosto, preserve a mesma mulher, a mesma pose, o enquadramento da janela, a textura do suéter e os detalhes do ambiente, luz do dia realista, sem texto, sem watermark" \\
  --param images=./portrait-dark.png \\
  --param aspect_ratio=4:3 \\
  --param resolution=2k \\
  -o portrait-clareado.png`,
      },
      {
        title: "Rodar uma segunda passada mais suave",
        code: `anycap image generate \\
  --model nano-banana-2 \\
  --mode image-to-image \\
  --prompt "mantenha o mesmo retrato e a mesma composição, reduza apenas a sombra dura restante no rosto e clareie levemente a região dos olhos e da bochecha, preserve tom de pele realista e luz de janela, sem texto, sem watermark" \\
  --param images=./portrait-clareado.png \\
  --param aspect_ratio=4:3 \\
  --param resolution=2k \\
  -o portrait-clareado-pass-2.png`,
      },
      {
        title: "Fazer QA da correção",
        code: `anycap actions image-read \\
  --file ./portrait-clareado.png \\
  --instruction "Descreva o retrato, confirme se a mesma pessoa e o mesmo enquadramento foram preservados e mencione qualquer highlight estourado, detalhe facial distorcido, texto visível ou watermark."`,
      },
    ],
  },
  faq: {
    eyebrow: "FAQ",
    title: "Perguntas que normalmente aparecem depois",
    items: [
      {
        question: "Clarear foto é a mesma coisa que remover sombra?",
        answer:
          "Não exatamente. Clarear foto é um objetivo mais amplo que pode incluir levantar exposição, abrir sombras e recuperar visibilidade. Remover sombra por completo é um caso mais estreito e costuma exigir um fluxo mais específico.",
      },
      {
        question: "Por que usar um workflow com agente em vez de um slider de brilho?",
        answer:
          "Porque o resultado útil não é só um arquivo mais claro. É um arquivo mais claro que ainda parece a mesma pessoa no mesmo ambiente. Com AnyCap você descreve a correção em palavras e depois revisa se o resultado continua crível.",
      },
      {
        question: "Que tipo de foto combina melhor com este fluxo?",
        answer:
          "Retratos perto da janela, fotos internas com luz direcional forte e imagens subexpostas para conteúdo combinam bem. Ele funciona melhor quando a composição original já vale a pena ser salva.",
      },
      {
        question: "O AnyCap consegue dizer se a imagem ficou artificial demais?",
        answer:
          "Sim. Depois da geração, você pode usar leitura de imagem para descrever a foto corrigida e apontar highlight estourado, textura estranha na pele, artefatos visíveis ou outros sinais de excesso na edição.",
      },
    ],
  },
  nextMove: {
    eyebrow: "Próximo passo",
    title: "Siga pelo ajuste que você precisa depois da luz",
    cards: [
      {
        title: "Como remover pessoas da foto",
        href: "/learn/how-to-remove-people-from-photos",
        body: "Vá para cá quando o principal problema do frame for uma pessoa distraindo a cena, não subexposição ou luz dura.",
      },
      {
        title: "Como trocar o fundo de uma foto",
        href: "/learn/how-to-change-photo-background",
        body: "Use este fluxo quando sujeito e luz já estão bons, mas o ambiente ao redor precisa mudar.",
      },
      {
        title: "Nano Banana Pro",
        href: "/models/nano-banana-pro",
        body: "Aprofunde no modelo que hoje encaixa melhor em workflows de enhancement e cleanup com foto fonte existente.",
      },
      {
        title: "Instalar AnyCap",
        href: "/guides/install-anycap",
        body: "Siga por aqui se quiser preparar o CLI antes de testar a mesma correção na sua própria foto.",
      },
    ],
  },
};

const idContent: BrightenPhotoPageContent = {
  metadata: {
    title: "Cara Mencerahkan Foto secara Daring dengan Agen AI",
    description:
      "Gunakan AnyCap untuk mencerahkan foto underexposure, melembutkan bayangan keras, dan memeriksa apakah subjek masih terlihat alami sebelum Anda menerbitkan hasilnya.",
    openGraphTitle: "Cara Mencerahkan Foto secara Daring dengan Agen AI",
    openGraphDescription:
      "Panduan alur kerja untuk mencerahkan foto secara daring melalui pengeditan gambar AnyCap dan pemahaman gambar sambil mempertahankan subjek dan komposisi yang sama.",
    articleHeadline: "Cara Mencerahkan Foto secara Daring dengan Agen AI",
    articleDescription:
      "Alur praktis untuk mencerahkan foto secara daring melalui AnyCap dengan pelestarian cahaya alami dan QA.",
    articleAbout: [
      "Mencerahkan foto daring",
      "Peningkatan foto",
      "Pembersihan bayangan",
      "Pengeditan potret",
      "Pemahaman gambar",
      "Agen AI",
    ],
    articleKeywords: [
      "mencerahkan foto online",
      "perbaiki foto gelap ai",
      "terangkan gambar online",
      "perbaiki foto underexposure",
      "alur pencerah foto",
    ],
  },
  breadcrumbItems: [
    { name: "Beranda", href: "/" },
    { name: "Belajar", href: "/learn" },
    {
      name: "Cara mencerahkan foto secara daring",
      href: HOW_TO_BRIGHTEN_A_PHOTO_ONLINE_PATH,
    },
  ],
  eyebrow: "Belajar",
  lastUpdatedLabel: "Terakhir diperbarui 10 April 2026",
  hero: {
    titleLine1: "Cara mencerahkan foto secara daring",
    titleLine2: "tanpa membuat subjek terlihat kusam",
    introBeforeFirstLink:
      "Jika Anda ingin mencerahkan foto secara daring, pekerjaan yang berguna bukan sekadar menaikkan eksposur. Tujuan sebenarnya adalah memulihkan gambar yang lebih gelap sambil menjaga kulit, latar, dan suasana keseluruhan tetap meyakinkan. Di situlah",
    firstLinkLabel: "generasi gambar AnyCap",
    introBetweenLinks: "ditambah",
    secondLinkLabel: "pemahaman gambar",
    introAfterSecondLink:
      "membentuk alur kerja yang lebih kuat daripada penggeser kecerahan generik.",
    summaryLabel: "Ringkasan jawaban dulu",
    summaryText:
      "Alur pencerahan yang berguna berarti peningkatan terkendali ditambah QA. AnyCap membantu agen mencerahkan foto gelap, melembutkan bayangan keras, dan memeriksa apakah hasilnya masih terasa seperti orang yang sama dalam adegan yang sama, bukan edit yang berlebihan.",
  },
  proof: {
    eyebrow: "Bukti yang dihasilkan",
    title: "Koreksi potret cahaya rendah nyata",
    intro:
      "Halaman ini memakai pasangan bukti sebelum-sesudah nyata yang dihasilkan dengan AnyCap. Bingkai kiri adalah potret yang lebih gelap dengan strip cahaya dan bayangan keras di wajah. Bingkai kanan mencerahkan foto dan melembutkan kontras keras sambil mempertahankan subjek, pose, dan ruangan yang sama.",
    promptLabel: "Prompt edit yang dipakai dengan AnyCap",
    prompt:
      "terangkan potret dalam ruangan ini secara alami, angkat midtone dan eksposur wajah, redam bayangan keras di wajah, pertahankan wanita yang sama, pose, pembingkaian jendela, tekstur sweter, dan detail ruangan, cahaya siang yang realistis, tanpa teks, tanpa watermark",
    signalsLabel: "Mengapa bukti ini penting",
    signals: [
      "Ini menunjukkan alur koreksi nyata, bukan demo penggeser stok sintetis.",
      "Hasil mempertahankan pembingkaian potret yang sama, sehingga perbaikan pencahayaan mudah dinilai.",
      "Ini mendukung klaim AnyCap yang lebih jujur di awal: mencerahkan foto sambil menjaga realisme, lalu memeriksa hasilnya.",
    ],
    caption:
      "Gambar kiri adalah potret sumber yang lebih gelap. Gambar kanan adalah hasil pencerahan AnyCap yang dihasilkan dari file yang sama.",
    images: [
      {
        src: `${PAGE_RESOURCE_BASE}/pt-br-brighten-photo-source-2026-04-10.png`,
        alt: "Potret dalam ruangan seorang wanita di dekat jendela dengan strip diagonal keras cahaya dan bayangan di wajahnya.",
        width: 1200,
        height: 896,
        label: "Foto sumber",
        frameVariant: "plain",
      },
      {
        src: `${PAGE_RESOURCE_BASE}/pt-br-brighten-photo-result-2026-04-10.png`,
        alt: "Potret dalam ruangan yang sama setelah foto diterangkan dan bayangan wajah dilembutkan.",
        width: 1200,
        height: 896,
        label: "Hasil yang diterangkan",
        frameVariant: "plain",
      },
    ],
  },
  quickAnswer: {
    eyebrow: "Jawaban singkat",
    title: "Pencerahan hanya berguna ketika foto masih terasa nyata",
    intro:
      "Penggeser eksposur cepat bisa membuat foto lebih terang sekaligus lebih buruk. Pertanyaan berguna adalah apakah edit memulihkan visibilitas tanpa meratakan kulit, memotong highlight, atau membuat ruangan tampak palsu. Itulah sebabnya alur yang lebih baik adalah mencerahkan ditambah memeriksa.",
    takeaways: [
      "Prompt harus menyebutkan jenis perubahan kecerahan yang Anda inginkan dan apa yang harus tetap stabil dalam bingkai.",
      "Pemulihan midtone dan pelembutan bayangan biasanya lebih penting daripada sekadar menaikkan kecerahan global.",
      "Alur yang baik memeriksa apakah hasil yang lebih terang masih terlihat seperti orang yang sama dalam cahaya yang sama, bukan potret generasi yang berbeda.",
    ],
    cards: [
      {
        title: "Penyelamatan potret",
        body: "Terbaik ketika wajah underexposure atau sebagian dalam bayangan tetapi ekspresi dan komposisi sudah layak dipertahankan.",
      },
      {
        title: "Koreksi cahaya jendela",
        body: "Berguna ketika sinar cahaya kuat membuat strip keras yang menyulitkan pemakaian ulang foto.",
      },
      {
        title: "Pemakaian ulang konten dan profil",
        body: "Kuat ketika gambar perlu terlihat lebih bersih untuk dokumen, bio, profil sosial, atau blok landing page tanpa terlihat berlebihan diedit.",
      },
    ],
  },
  workflow: {
    eyebrow: "Alur kerja",
    title: "Lima langkah dari sumber gelap ke gambar yang siap dipublikasikan",
    stepLabel: "Langkah",
    steps: [
      {
        title: "Pertahankan gambar yang sudah punya momen yang tepat",
        body: "Mulai dari foto yang ekspresi, pose, dan pembingkaiannya ingin Anda pertahankan. Alur ini tentang koreksi, bukan penggantian.",
      },
      {
        title: "Jelaskan masalah pencahayaan secara tepat",
        body: "Sebutkan underexposure, bayangan wajah keras, backlight, atau cahaya dalam ruangan redup agar edit menyelesaikan masalah yang benar.",
      },
      {
        title: "Lindungi identitas subjek",
        body: "Ulangi bahwa orang yang sama, pose, pakaian, dan ruangan harus tetap stabil sementara kecerahan berubah.",
      },
      {
        title: "Periksa realisme setelah edit",
        body: "Pastikan warna kulit, cahaya jendela, dan kedalaman ruangan masih terasa alami dan tidak diratakan menjadi tampilan kusam.",
      },
      {
        title: "Cabangkan ke pass kedua jika perlu",
        body: "Jika perbaikan pencerahan pertama terlalu lembut atau terlalu agresif, jalankan prompt susulan yang lebih sempit alih-alih mulai dari nol.",
      },
    ],
  },
  comparison: {
    eyebrow: "Mengapa alur kerja penting",
    title: "Penggeser kecerahan versus alur kerja agen",
    shallowLabel: "Penggeser generik",
    workflowLabel: "Alur kerja AnyCap",
    rows: [
      {
        lens: "Tujuan utama",
        shallow:
          "Membuat seluruh gambar lebih terang, meskipun highlight terpotong dan kulit kehilangan nuansa.",
        workflow:
          "Memulihkan visibilitas sambil menjaga foto tetap dikenali, meyakinkan, dan siap dipakai di saluran.",
      },
      {
        lens: "Cara perbaikan dijelaskan",
        shallow: "Sebagian besar numerik, dengan sedikit kontrol atas apa yang harus tetap tidak berubah.",
        workflow:
          "Prompt dapat menjelaskan masalah pencahayaan yang tepat dan detail adegan yang harus tetap stabil.",
      },
      {
        lens: "Kendali mutu",
        shallow: "Pengguna menilai hasil penggeser secara visual dan berhenti di situ.",
        workflow:
          "Agen dapat memeriksa hasil dengan pembacaan gambar dan memutuskan apakah pass pelembutan bayangan yang lebih ketat diperlukan.",
      },
    ],
  },
  modelChoice: {
    eyebrow: "Pilihan model",
    title: "Stack AnyCap saat ini untuk alur pencerahan foto",
    cards: [
      {
        label: "Pass pertama terbaik",
        title: "Nano Banana Pro",
        href: "/models/nano-banana-pro",
        body: "Opsi pertama terkuat ketika Anda sudah punya foto sumber dan ingin koreksi alami dengan pelestarian identitas dan komposisi yang lebih baik.",
      },
      {
        label: "Iterasi cepat",
        title: "Nano Banana 2",
        href: "/models/nano-banana-2",
        body: "Berguna ketika Anda ingin variasi pass cepat untuk versi sedikit lebih terang, lebih lembut, atau lebih seimbang kontrasnya.",
      },
      {
        label: "Lapisan QA",
        title: "Image Understanding",
        href: "/capabilities/image-understanding",
        body: "Gunakan pembacaan gambar setelah generasi untuk memastikan foto yang lebih terang masih terlihat alami dan bebas artefak.",
      },
    ],
  },
  validation: {
    eyebrow: "Apa yang divalidasi",
    title: "Empat pemeriksaan sebelum Anda mengekspor versi yang lebih terang",
    cards: [
      {
        title: "Subjek yang sama tetap ada",
        body: "Pastikan edit mempertahankan wajah, gaya rambut, pose, dan ekspresi yang sama alih-alih bergeser ke potret yang sedikit berbeda.",
      },
      {
        title: "Bayangan dilembutkan, bukan dihapus secara tidak realistis",
        body: "Tujuannya biasanya visibilitas yang lebih baik, bukan wajah datar tanpa arah cahaya sama sekali.",
      },
      {
        title: "Highlight masih terasa terkendali",
        body: "Periksa area jendela, pantulan kulit, dan kain terang agar koreksi tidak terpotong menjadi kusam berlebihan.",
      },
      {
        title: "Tanpa sisa AI yang terlihat",
        body: "Cari mata terdistorsi, kulit kusam, jari rusak, teks acak, atau artefak watermark sebelum memakai ulang gambar.",
      },
    ],
  },
  cli: {
    eyebrow: "Contoh CLI",
    title: "Perintah contoh yang selaras dengan skema saat ini",
    examples: [
      {
        title: "Mencerahkan potret gelap secara alami",
        code: `anycap image generate \\
  --model nano-banana-pro \\
  --mode image-to-image \\
  --prompt "terangkan potret dalam ruangan ini secara alami, angkat midtone dan eksposur wajah, redam bayangan keras di wajah, pertahankan wanita yang sama, pose, pembingkaian jendela, tekstur sweter, dan detail ruangan, cahaya siang yang realistis, tanpa teks, tanpa watermark" \\
  --param images=./portrait-dark.png \\
  --param aspect_ratio=4:3 \\
  --param resolution=2k \\
  -o portrait-brightened.png`,
      },
      {
        title: "Jalankan pass bayangan lebih lembut jika perlu",
        code: `anycap image generate \\
  --model nano-banana-2 \\
  --mode image-to-image \\
  --prompt "pertahankan potret dan komposisi yang sama, hanya kurangi bayangan wajah keras yang tersisa dan terangkan lembut area pipi dan mata, pertahankan warna kulit realistis dan cahaya jendela, tanpa teks, tanpa watermark" \\
  --param images=./portrait-brightened.png \\
  --param aspect_ratio=4:3 \\
  --param resolution=2k \\
  -o portrait-brightened-pass-2.png`,
      },
      {
        title: "QA gambar yang dikoreksi",
        code: `anycap actions image-read \\
  --file ./portrait-brightened.png \\
  --instruction "Deskripsikan potret tersebut, konfirmasi apakah orang dan pembingkaian yang sama dipertahankan, dan sebutkan adanya highlight yang kelebihan paparan, detail wajah yang rusak, teks terlihat, atau watermark."`,
      },
    ],
  },
  faq: {
    eyebrow: "FAQ",
    title: "Pertanyaan yang biasanya menyusul",
    items: [
      {
        question: "Apakah mencerahkan foto sama dengan menghapus bayangan?",
        answer:
          "Tidak persis. Mencerahkan foto adalah tujuan koreksi yang lebih luas yang dapat mencakup menaikkan eksposur, membuka bayangan, dan memulihkan visibilitas. Menghapus bayangan sepenuhnya lebih sempit dan sering memerlukan alur kerja yang lebih spesifik.",
      },
      {
        question: "Mengapa memakai alur kerja agen alih-alih penggeser kecerahan?",
        answer:
          "Karena hasil yang berguna bukan sekadar file yang lebih terang. Ini file yang lebih terang yang masih terlihat seperti subjek yang sama di ruangan yang sama. Alur AnyCap memungkinkan Anda mendefinisikan koreksi dengan kata-kata, lalu memeriksa apakah hasilnya tetap meyakinkan.",
      },
      {
        question: "Foto seperti apa yang cocok untuk alur ini?",
        answer:
          "Potret di dekat jendela, foto dalam ruangan dengan cahaya arah keras, dan gambar konten underexposure adalah kandidat kuat. Ini paling baik ketika komposisi asli sudah layak diselamatkan.",
      },
      {
        question: "Bisakah AnyCap memberi tahu saya apakah hasilnya terlihat berlebihan diedit?",
        answer:
          "Ya. Setelah generasi, Anda dapat memakai pembacaan gambar untuk mendeskripsikan foto yang dikoreksi dan menunjukkan highlight terpotong, tekstur kulit aneh, artefak terlihat, atau tanda lain bahwa edit perlu diperhalus.",
      },
    ],
  },
  nextMove: {
    eyebrow: "Langkah berikutnya",
    title: "Lanjutkan dari edit berikutnya yang Anda butuhkan",
    cards: [
      {
        title: "Cara menghapus orang dari foto",
        href: "/learn/how-to-remove-people-from-photos",
        body: "Ke sini ketika masalah utama adalah orang yang mengganggu dalam bingkai, bukan underexposure atau cahaya keras.",
      },
      {
        title: "Cara mengubah latar belakang foto",
        href: "/learn/how-to-change-photo-background",
        body: "Gunakan ini ketika subjek dan eksposur sudah baik tetapi lingkungan di sekitar foto perlu berubah.",
      },
      {
        title: "Nano Banana Pro",
        href: "/models/nano-banana-pro",
        body: "Baca halaman model ketika Anda ingin model terkuat saat ini untuk peningkatan dan pembersihan dari foto sumber.",
      },
      {
        title: "Instal AnyCap",
        href: "/guides/install-anycap",
        body: "Mulai di sini jika Anda ingin CLI siap sebelum menguji alur koreksi yang sama pada foto Anda sendiri.",
      },
    ],
  },
};

const contentByLocale = {
  en: enContent,
  "pt-br": ptBrContent,
  id: idContent,
} satisfies Record<SiteLocale, BrightenPhotoPageContent>;

function getContent(locale: SiteLocale): BrightenPhotoPageContent {
  return contentByLocale[locale] ?? contentByLocale[defaultLocale];
}

export function getHowToBrightenAPhotoOnlineMetadata(locale: SiteLocale): Metadata {
  const content = getContent(locale);

  return {
    title: content.metadata.title,
    description: content.metadata.description,
    alternates: { canonical: HOW_TO_BRIGHTEN_A_PHOTO_ONLINE_PATH },
    openGraph: {
      type: "website",
      locale: getLocaleConfig(locale).ogLocale,
      url: HOW_TO_BRIGHTEN_A_PHOTO_ONLINE_PATH,
      siteName: siteConfig.siteName,
      title: content.metadata.openGraphTitle,
      description: content.metadata.openGraphDescription,
    },
  };
}

export function getHowToBrightenAPhotoOnlinePageData(locale: SiteLocale) {
  const content = getContent(locale);

  return {
    ...content,
    articleJsonLd: createTechArticleJsonLd({
      headline: content.metadata.articleHeadline,
      description: content.metadata.articleDescription,
      path: HOW_TO_BRIGHTEN_A_PHOTO_ONLINE_PATH,
      locale,
      about: [...content.metadata.articleAbout],
      keywords: [...content.metadata.articleKeywords],
      datePublished: LAST_UPDATED_ISO,
      dateModified: LAST_UPDATED_ISO,
    }),
    faqJsonLd: createFaqPageJsonLd(content.faq.items),
  };
}
