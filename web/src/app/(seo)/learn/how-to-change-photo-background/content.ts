import type { Metadata } from "next";
import type { LearnProofImage } from "@/components/seo/LearnProofShowcase";
import { createFaqPageJsonLd, createTechArticleJsonLd } from "@/lib/schema";
import { getLocaleConfig, siteConfig, type SiteLocale } from "@/lib/site";

export const HOW_TO_CHANGE_PHOTO_BACKGROUND_PATH = "/learn/how-to-change-photo-background";

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

type ChangePhotoBackgroundPageContent = {
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

const enContent: ChangePhotoBackgroundPageContent = {
  metadata: {
    title: "How to Change a Photo Background with an AI Agent",
    description:
      "Use AnyCap to replace a photo background without losing the subject, inspect the revision, and branch into white, studio, or scene-specific versions from the same source image.",
    openGraphTitle: "How to Change a Photo Background with an AI Agent",
    openGraphDescription:
      "A workflow guide for replacing a photo background through AnyCap while keeping the subject consistent enough for product, docs, and content workflows.",
    articleHeadline: "How to Change a Photo Background with an AI Agent",
    articleDescription:
      "A practical workflow for replacing a photo background through AnyCap image editing while preserving the original subject.",
    articleAbout: [
      "Background replacement",
      "Photo editing",
      "Image-to-image editing",
      "AI agents",
      "Product photos",
    ],
    articleKeywords: [
      "change photo background",
      "replace image background",
      "change background of a picture",
      "photo background changer",
      "background replacement workflow",
    ],
  },
  breadcrumbItems: [
    { name: "Home", href: "/" },
    { name: "Learn", href: "/learn" },
    {
      name: "How to Change a Photo Background",
      href: HOW_TO_CHANGE_PHOTO_BACKGROUND_PATH,
    },
  ],
  eyebrow: "Learn",
  lastUpdatedLabel: "Last updated April 10, 2026",
  hero: {
    titleLine1: "How to change a photo background",
    titleLine2: "without losing the original subject",
    introBeforeFirstLink:
      "If you are trying to change a photo background, the real job is not only to make the old scene disappear. It is to preserve the same subject while moving it into a new environment that still looks believable. That is where",
    firstLinkLabel: "AnyCap image generation",
    introBetweenLinks: "plus",
    secondLinkLabel: "image understanding",
    introAfterSecondLink: "gives the agent a stronger workflow than a generic one-click changer.",
    summaryLabel: "Answer-first summary",
    summaryText:
      "A useful photo-background replacement workflow keeps the subject stable and changes only the environment around it. AnyCap helps the agent run that loop in one place: edit from the source photo, inspect whether the revision still looks like the same asset, and branch into the exact background style the destination needs.",
  },
  proof: {
    eyebrow: "Generated proof",
    title: "One source photo, one cleaner replacement scene",
    intro:
      "This page uses a real before-and-after proof pair. The left frame is the original desk photo. The right frame is the AnyCap revision that keeps the same shoe but moves it into a cleaner studio setting.",
    promptLabel: "Edit prompt used with AnyCap",
    prompt:
      "preserve the same off-white running shoe, replace the entire desk, notebook, mug, plant, and window scene with a clean warm cream studio backdrop and a minimal low pedestal, keep the shoe realistic and centered, add soft editorial side light and a subtle grounded shadow, premium product photo, no text, no watermark",
    signalsLabel: "Why this proof matters",
    signals: [
      "It makes the page's main promise concrete: the useful job is replacing the environment without drifting away from the source subject.",
      "The proof pair shows why background replacement is different from simple cutout export or full regeneration.",
      "It gives the page first-party evidence that the edit workflow can move from a cluttered source photo into a cleaner product-style result.",
    ],
    caption:
      "The left image is the original source photo. The right image is the AnyCap background-replacement revision generated from that same source asset for this page.",
    images: [
      {
        src: `${PAGE_RESOURCE_BASE}/how-to-make-image-transparent-source.webp`,
        alt: "Source product photo of an off-white running shoe sitting on a cluttered wooden desk near a plant and a coffee mug.",
        width: 2304,
        height: 1728,
        label: "Source image",
        frameVariant: "plain",
      },
      {
        src: `${PAGE_RESOURCE_BASE}/how-to-change-photo-background-result.webp`,
        alt: "The same off-white running shoe placed on a minimal cream pedestal with a warm studio background after the photo background was replaced.",
        width: 2304,
        height: 1728,
        label: "Background-replaced result",
        frameVariant: "plain",
      },
    ],
  },
  quickAnswer: {
    eyebrow: "Quick answer",
    title: "Preserve the subject, replace only the environment",
    intro:
      "Many background changer tools treat the image like a disposable draft. That is not the best fit when the original product, person, or screenshot already matters. The stronger workflow is to keep the same subject and revise the surroundings around it.",
    takeaways: [
      "Changing a photo background is strongest when the prompt says what must stay, not only what should be removed.",
      "The useful workflow is subject preservation plus environment replacement, then a QA pass for lighting, scale, and edge consistency.",
      "The same source image can branch into a white studio version, a styled pedestal shot, or a more contextual scene depending on where the asset will be used.",
    ],
    cards: [
      {
        title: "White studio",
        body: "Best for catalog, marketplace, and compliance-heavy photo slots where the background should disappear as a decision.",
      },
      {
        title: "Pedestal or gradient setup",
        body: "Best for product pages, docs, and editorial-style content where the image should look cleaner than the raw source but still feel premium.",
      },
      {
        title: "Context scene",
        body: "Best when the background should help sell mood, use case, or campaign framing rather than simply getting out of the way.",
      },
    ],
  },
  workflow: {
    eyebrow: "Workflow",
    title: "Five steps from cluttered photo to cleaner setting",
    stepLabel: "Step",
    steps: [
      {
        title: "Choose the image that already matters",
        body: "Start with the photo you actually want to reuse. This workflow is better when the subject is already right and only the surrounding environment needs to change.",
      },
      {
        title: "Specify the target environment clearly",
        body: "Tell the model whether the destination is a white marketplace photo, a soft studio pedestal, or a more contextual scene. The background target should be concrete.",
      },
      {
        title: "Preserve the subject while replacing the scene",
        body: "Use image-to-image editing and repeat the subject-preservation constraints. The job is not to redesign the product. It is to change the setting around it.",
      },
      {
        title: "Inspect coherence, not only cleanliness",
        body: "Check that the scale, shadow, and perspective still feel believable. A clean replacement can still fail if the new environment looks detached from the subject.",
      },
      {
        title: "Branch into the version the channel needs",
        body: "From the same source, you can create a white-background listing image, a softer studio page visual, or a more expressive campaign direction.",
      },
    ],
  },
  comparison: {
    eyebrow: "Comparison",
    title: "Why replacement is not the same as regeneration",
    shallowLabel: "Shallow default",
    workflowLabel: "AnyCap workflow",
    rows: [
      {
        lens: "What changes",
        shallow: "Everything gets regenerated and the product may drift with it.",
        workflow: "Only the environment changes while the subject is kept as close to the source as possible.",
      },
      {
        lens: "Output quality",
        shallow: "The background is different, but the image no longer feels like the same photo.",
        workflow: "The result still reads as the same asset, just placed in a setting that better matches the channel.",
      },
      {
        lens: "Reuse path",
        shallow: "You solve one image, then restart from scratch for every new context.",
        workflow: "One source image can branch into white, studio, or context-specific variations as needed.",
      },
      {
        lens: "QA standard",
        shallow: "The new background looks nicer, so the job seems done.",
        workflow: "The agent also checks whether the subject, scale, and lighting still feel coherent after the edit.",
      },
    ],
  },
  modelChoice: {
    eyebrow: "Model choice",
    title: "Pick the model based on whether the source already exists",
    cards: [
      {
        title: "Nano Banana Pro",
        label: "Best first choice for background replacement",
        body: "Use this when the source photo already exists and the main job is to preserve the same subject while changing only the surrounding scene.",
        href: "/models/nano-banana-pro",
      },
      {
        title: "Nano Banana 2",
        label: "Best for faster variant loops",
        body: "Use this when you want to test several background directions quickly before deciding which visual lane the page or listing should take.",
        href: "/models/nano-banana-2",
      },
      {
        title: "Seedream 5",
        label: "Best when the source photo does not exist yet",
        body: "Use this when you still need a stronger first-pass product image before any background replacement or cleanup begins.",
        href: "/models/seedream-5",
      },
    ],
  },
  validation: {
    eyebrow: "First-hand validation",
    title: "What we checked on the live workflow",
    cards: [
      {
        title: "Capability surface confirmed",
        body: "During page production on April 9, 2026, a live AnyCap status check confirmed image generation, image editing, image reading, Drive, Page, and web retrieval were available in the current environment.",
      },
      {
        title: "Schema confirmed",
        body: "The current image-to-image schema for Nano Banana Pro was checked live and uses the `images` parameter for source assets.",
      },
      {
        title: "Proof pair generated",
        body: "The before-and-after proof on this page was generated through AnyCap from the same source asset instead of being assembled from unrelated images.",
      },
      {
        title: "Replacement QA checked",
        body: "Image reading was used to confirm the studio-background replacement still preserved the same shoe and did not introduce visible text or watermark artifacts.",
      },
    ],
  },
  cli: {
    eyebrow: "CLI examples",
    title: "Example commands for replacement workflows",
    examples: [
      {
        title: "Replace the background with a warm studio setup",
        code: `anycap image generate \\
  --model nano-banana-pro \\
  --mode image-to-image \\
  --prompt "preserve the same subject, replace the desk and room with a warm cream studio backdrop and a simple pedestal, keep realistic lighting and grounded shadow, no text, no watermark" \\
  --param images=./source-photo.png \\
  --param aspect_ratio=4:3 \\
  --param resolution=2k \\
  -o studio-background-replacement.png`,
      },
      {
        title: "Branch into a white-background version",
        code: `anycap image generate \\
  --model nano-banana-pro \\
  --mode image-to-image \\
  --prompt "preserve the same subject, replace the environment with a clean white studio background, centered marketplace-ready product photo, no text, no watermark" \\
  --param images=./source-photo.png \\
  --param aspect_ratio=4:3 \\
  --param resolution=2k \\
  -o white-background-version.png`,
      },
      {
        title: "QA the replacement result",
        code: `anycap actions image-read \\
  --file ./studio-background-replacement.png \\
  --instruction "Describe the image, confirm whether the same subject is preserved, and mention any visible text, watermark, or awkward background mismatch."`,
      },
    ],
  },
  faq: {
    eyebrow: "FAQ",
    title: "Questions that usually come next",
    items: [
      {
        question: "Is changing a photo background the same as making it transparent?",
        answer:
          "No. A transparent version removes the environment so you can place the subject elsewhere later. A background-replaced version already chooses the new environment, such as a white studio, a pedestal setup, or a scene that better matches the page or listing.",
      },
      {
        question: "When should I use a white background instead of a styled replacement?",
        answer:
          "Use white when the destination is marketplace, catalog, or compliance-driven. Use a styled replacement when the image needs to feel more editorial, product-led, or context-aware on a landing page, doc, or content asset.",
      },
      {
        question: "Which AnyCap model should I use first for background replacement?",
        answer:
          "Use Nano Banana Pro first when you already have the source image and the job is to preserve the subject while replacing only the environment. Use Nano Banana 2 when you want faster iteration across several background directions. Use Seedream 5 when you still need the original product image before editing begins.",
      },
      {
        question: "Can AnyCap help inspect whether the replacement still looks believable?",
        answer:
          "Yes. After generation, you can use AnyCap image reading to check whether the same subject identity is preserved, whether the new setting feels coherent, and whether there is any visible text, watermark, or prompt drift.",
      },
    ],
  },
  nextMove: {
    eyebrow: "Next move",
    title: "Move into the workflow that fits the destination",
    cards: [
      {
        title: "How to Make an Image Transparent",
        href: "/learn/how-to-make-image-transparent",
        body: "Start here when the background should be removed first instead of replaced immediately.",
      },
      {
        title: "Image Generation",
        href: "/capabilities/image-generation",
        body: "See the exact AnyCap image surface that powers background replacement and other image-to-image workflows.",
      },
      {
        title: "Nano Banana Pro",
        href: "/models/nano-banana-pro",
        body: "Go deeper on the model that currently fits the strongest subject-preserving revision loop.",
      },
      {
        title: "Install AnyCap",
        href: "/guides/install-anycap",
        body: "Move here when you want the shortest path from this page to a working CLI setup.",
      },
    ],
  },
};

const ptBrContent: ChangePhotoBackgroundPageContent = {
  metadata: {
    title: "Como trocar o fundo de uma foto com IA",
    description:
      "Use o AnyCap para trocar o fundo de uma foto sem perder o assunto principal, revisar a edição e ramificar para versões com fundo branco, estúdio ou cena contextual a partir da mesma imagem fonte.",
    openGraphTitle: "Como trocar o fundo de uma foto com IA",
    openGraphDescription:
      "Um guia prático para substituir o fundo de uma foto com AnyCap enquanto o produto, pessoa ou objeto continua reconhecível e coerente.",
    articleHeadline: "Como trocar o fundo de uma foto com IA",
    articleDescription:
      "Um fluxo prático para trocar o fundo de uma foto com edição de imagem do AnyCap, preservando o assunto original.",
    articleAbout: [
      "Troca de fundo",
      "Edição de foto",
      "Image-to-image",
      "Agentes de IA",
      "Fotos de produto",
    ],
    articleKeywords: [
      "como trocar o fundo de uma foto",
      "mudar fundo de foto",
      "trocar fundo da imagem",
      "change photo background",
      "trocar fundo com ia",
    ],
  },
  breadcrumbItems: [
    { name: "Início", href: "/" },
    { name: "Learn", href: "/learn" },
    {
      name: "Como trocar o fundo de uma foto",
      href: HOW_TO_CHANGE_PHOTO_BACKGROUND_PATH,
    },
  ],
  eyebrow: "Learn",
  lastUpdatedLabel: "Atualizado em 10 de abril de 2026",
  hero: {
    titleLine1: "Como trocar o fundo de uma foto",
    titleLine2: "sem perder o assunto original",
    introBeforeFirstLink:
      "Se você quer trocar o fundo de uma foto, o trabalho real não é só fazer a cena antiga desaparecer. É preservar o mesmo assunto enquanto ele é movido para um novo ambiente que ainda pareça crível. É aí que",
    firstLinkLabel: "a geração de imagem do AnyCap",
    introBetweenLinks: "junto com",
    secondLinkLabel: "a leitura de imagem",
    introAfterSecondLink: "dá ao agente um fluxo mais forte do que um trocador genérico de um clique.",
    summaryLabel: "Resposta curta",
    summaryText:
      "Um bom fluxo de troca de fundo mantém o assunto estável e muda apenas o ambiente ao redor. Com AnyCap, o agente consegue editar a partir da foto fonte, revisar se a nova versão continua parecendo o mesmo asset e ramificar para o estilo de fundo que o destino realmente precisa.",
  },
  proof: {
    eyebrow: "Prova gerada",
    title: "Uma foto fonte, uma cena substituída com mais controle",
    intro:
      "Esta página usa um par real de antes e depois. À esquerda está a foto original na mesa. À direita está a revisão com AnyCap, mantendo o mesmo tênis, mas movendo-o para um ambiente de estúdio mais limpo.",
    promptLabel: "Prompt de edição usado com AnyCap",
    prompt:
      "preserve the same off-white running shoe, replace the entire desk, notebook, mug, plant, and window scene with a clean warm cream studio backdrop and a minimal low pedestal, keep the shoe realistic and centered, add soft editorial side light and a subtle grounded shadow, premium product photo, no text, no watermark",
    signalsLabel: "Por que esta prova importa",
    signals: [
      "Deixa concreta a promessa principal da página: substituir o ambiente sem se afastar do assunto original.",
      "Mostra por que trocar fundo é diferente de exportar um recorte ou regenerar a imagem inteira.",
      "Dá à página evidência de primeira mão de que o fluxo pode sair de uma foto poluída para um resultado mais limpo e coerente.",
    ],
    caption:
      "À esquerda está a foto fonte original. À direita está a revisão de troca de fundo gerada com AnyCap a partir do mesmo asset.",
    images: [
      {
        src: `${PAGE_RESOURCE_BASE}/how-to-make-image-transparent-source.webp`,
        alt: "Foto fonte de um tênis off-white em uma mesa de madeira com caneca e planta ao redor.",
        width: 2304,
        height: 1728,
        label: "Imagem fonte",
        frameVariant: "plain",
      },
      {
        src: `${PAGE_RESOURCE_BASE}/how-to-change-photo-background-result.webp`,
        alt: "O mesmo tênis off-white sobre um pedestal minimalista com fundo de estúdio creme após a troca de fundo.",
        width: 2304,
        height: 1728,
        label: "Resultado com fundo trocado",
        frameVariant: "plain",
      },
    ],
  },
  quickAnswer: {
    eyebrow: "Resposta rápida",
    title: "Preserve o assunto, troque só o ambiente",
    intro:
      "Muitos trocadores de fundo tratam a imagem como um rascunho descartável. Isso não é o melhor encaixe quando o produto, a pessoa ou o screenshot original já importam. O fluxo mais forte é manter o mesmo assunto e revisar apenas o entorno.",
    takeaways: [
      "Trocar o fundo de uma foto funciona melhor quando o prompt diz o que precisa continuar igual, e não só o que deve sumir.",
      "O fluxo útil é preservação do assunto mais substituição do ambiente, seguido de uma revisão de luz, escala e coerência nas bordas.",
      "A mesma foto fonte pode virar uma versão com fundo branco, uma cena de estúdio ou um contexto mais expressivo, dependendo do uso final.",
    ],
    cards: [
      {
        title: "Estúdio branco",
        body: "Melhor para catálogo, marketplace e outros slots em que o fundo precisa desaparecer como uma decisão.",
      },
      {
        title: "Pedestal ou gradiente",
        body: "Melhor para páginas de produto, docs e conteúdos mais editoriais em que a imagem precisa parecer mais premium do que a fonte bruta.",
      },
      {
        title: "Cena contextual",
        body: "Melhor quando o fundo precisa vender clima, uso ou framing de campanha, e não apenas sair do caminho.",
      },
    ],
  },
  workflow: {
    eyebrow: "Fluxo",
    title: "Cinco passos da foto poluída para um cenário melhor",
    stepLabel: "Passo",
    steps: [
      {
        title: "Escolha a imagem que já importa",
        body: "Comece com a foto que você realmente quer reaproveitar. Este fluxo funciona melhor quando o assunto já está certo e só o ambiente ao redor precisa mudar.",
      },
      {
        title: "Defina com clareza o ambiente de destino",
        body: "Diga ao modelo se o destino é uma foto branca para marketplace, um pedestal suave de estúdio ou uma cena mais contextual. O alvo de fundo precisa ser concreto.",
      },
      {
        title: "Preserve o assunto enquanto troca a cena",
        body: "Use image-to-image e repita as restrições de preservação do assunto. O trabalho não é redesenhar o produto. É mudar o contexto ao redor dele.",
      },
      {
        title: "Revise coerência, não só limpeza",
        body: "Cheque se escala, sombra e perspectiva continuam críveis. Um fundo mais bonito ainda pode falhar se o novo ambiente parecer desconectado do assunto.",
      },
      {
        title: "Ramifique para a versão que o canal precisa",
        body: "A partir da mesma fonte, você pode criar uma imagem branca de listing, um visual de estúdio mais suave ou uma direção mais expressiva para campanha.",
      },
    ],
  },
  comparison: {
    eyebrow: "Comparação",
    title: "Por que troca de fundo não é a mesma coisa que regenerar",
    shallowLabel: "Atalho superficial",
    workflowLabel: "Fluxo com AnyCap",
    rows: [
      {
        lens: "O que muda",
        shallow: "Tudo é regenerado e o produto pode perder aderência à imagem original.",
        workflow: "Só o ambiente muda, enquanto o assunto é mantido o mais perto possível da foto fonte.",
      },
      {
        lens: "Qualidade final",
        shallow: "O fundo é outro, mas a imagem deixa de parecer a mesma foto.",
        workflow: "O resultado ainda é percebido como o mesmo asset, agora colocado em um cenário mais adequado ao canal.",
      },
      {
        lens: "Caminho de reuso",
        shallow: "Você resolve uma imagem e depois recomeça do zero para cada novo contexto.",
        workflow: "Uma mesma foto fonte pode se ramificar para branco, estúdio ou contexto específico conforme o próximo uso.",
      },
      {
        lens: "Padrão de QA",
        shallow: "O novo fundo ficou bonito, então parece que o trabalho acabou.",
        workflow: "O agente também revisa se o assunto, a escala e a iluminação continuam coerentes depois da edição.",
      },
    ],
  },
  modelChoice: {
    eyebrow: "Escolha do modelo",
    title: "Escolha o modelo com base em já existir ou não uma foto fonte",
    cards: [
      {
        title: "Nano Banana Pro",
        label: "Melhor primeira escolha para troca de fundo",
        body: "Use quando a foto fonte já existe e o trabalho principal é preservar o mesmo assunto enquanto só a cena ao redor muda.",
        href: "/models/nano-banana-pro",
      },
      {
        title: "Nano Banana 2",
        label: "Melhor para variantes mais rápidas",
        body: "Use quando você quer testar vários caminhos de fundo antes de decidir qual direção visual a página ou o listing deve seguir.",
        href: "/models/nano-banana-2",
      },
      {
        title: "Seedream 5",
        label: "Melhor quando a foto fonte ainda não existe",
        body: "Use quando você ainda precisa de uma primeira imagem de produto mais forte antes de começar a trocar ou limpar o fundo.",
        href: "/models/seedream-5",
      },
    ],
  },
  validation: {
    eyebrow: "Validação de primeira mão",
    title: "O que foi conferido no fluxo real",
    cards: [
      {
        title: "Capability surface confirmada",
        body: "Durante a produção da página em 9 de abril de 2026, uma checagem ao vivo com AnyCap confirmou geração, edição e leitura de imagem, além de Drive, Page e web retrieval.",
      },
      {
        title: "Schema confirmada",
        body: "A schema atual de image-to-image do Nano Banana Pro foi conferida ao vivo e usa `images` para os assets de referência.",
      },
      {
        title: "Par de prova gerado",
        body: "O before-and-after desta página foi gerado com AnyCap a partir do mesmo asset fonte, e não montado com imagens de origens diferentes.",
      },
      {
        title: "QA da substituição feito",
        body: "A leitura de imagem foi usada para confirmar que a troca de fundo manteve o mesmo tênis e não introduziu texto visível, watermark ou drift de prompt evidente.",
      },
    ],
  },
  cli: {
    eyebrow: "Exemplos de CLI",
    title: "Comandos de exemplo para fluxos de troca de fundo",
    examples: [
      {
        title: "Trocar o fundo por um estúdio quente",
        code: `anycap image generate \\
  --model nano-banana-pro \\
  --mode image-to-image \\
  --prompt "preserve o mesmo assunto, troque a mesa e o ambiente por um fundo de estúdio creme com pedestal simples, mantenha luz realista e sombra suave, sem texto, sem watermark" \\
  --param images=./source-photo.png \\
  --param aspect_ratio=4:3 \\
  --param resolution=2k \\
  -o substituicao-estudio.png`,
      },
      {
        title: "Ramificar para uma versão com fundo branco",
        code: `anycap image generate \\
  --model nano-banana-pro \\
  --mode image-to-image \\
  --prompt "preserve o mesmo assunto, troque o ambiente por um fundo branco de estúdio, foto centralizada pronta para marketplace, sem texto, sem watermark" \\
  --param images=./source-photo.png \\
  --param aspect_ratio=4:3 \\
  --param resolution=2k \\
  -o versao-fundo-branco.png`,
      },
      {
        title: "Fazer QA do resultado",
        code: `anycap actions image-read \\
  --file ./substituicao-estudio.png \\
  --instruction "Descreva a imagem, confirme se o mesmo assunto foi preservado e mencione qualquer mismatch visível de fundo, texto ou watermark."`,
      },
    ],
  },
  faq: {
    eyebrow: "FAQ",
    title: "Perguntas que normalmente vêm depois",
    items: [
      {
        question: "Trocar o fundo de uma foto é a mesma coisa que deixá-la transparente?",
        answer:
          "Não. A versão transparente remove o ambiente para que o assunto possa ser colocado em outro lugar depois. A versão com fundo trocado já escolhe o novo ambiente, como um estúdio branco, um pedestal ou uma cena mais adequada à página ou ao listing.",
      },
      {
        question: "Quando devo usar fundo branco em vez de uma substituição mais estilizada?",
        answer:
          "Use branco quando o destino for marketplace, catálogo ou outro canal mais guiado por compliance e consistência. Use uma substituição estilizada quando a imagem precisar parecer mais editorial, mais ligada ao produto ou mais contextual em uma landing page, doc ou asset de conteúdo.",
      },
      {
        question: "Qual modelo do AnyCap devo usar primeiro para troca de fundo?",
        answer:
          "Comece com Nano Banana Pro quando a imagem fonte já existe e o trabalho é preservar o assunto enquanto só o ambiente muda. Use Nano Banana 2 quando quiser mais velocidade para testar várias direções de fundo. Use Seedream 5 quando a foto original ainda não existe.",
      },
      {
        question: "O AnyCap consegue revisar se a troca continua parecendo crível?",
        answer:
          "Sim. Depois da geração, você pode usar leitura de imagem no AnyCap para conferir se a identidade do assunto foi preservada, se o novo cenário parece coerente e se não apareceu texto visível, watermark ou drift evidente.",
      },
    ],
  },
  nextMove: {
    eyebrow: "Próximo passo",
    title: "Siga para o fluxo que melhor encaixa no destino",
    cards: [
      {
        title: "Como deixar uma imagem transparente",
        href: "/learn/how-to-make-image-transparent",
        body: "Comece por aqui quando o fundo precisa ser removido primeiro, em vez de substituído imediatamente.",
      },
      {
        title: "Geração de imagem",
        href: "/capabilities/image-generation",
        body: "Veja a superfície exata do AnyCap que alimenta troca de fundo e outros fluxos image-to-image.",
      },
      {
        title: "Nano Banana Pro",
        href: "/models/nano-banana-pro",
        body: "Aprofunde no modelo que hoje encaixa melhor nas revisões com preservação do assunto.",
      },
      {
        title: "Instalar AnyCap",
        href: "/guides/install-anycap",
        body: "Vá por aqui quando quiser sair desta página com um CLI funcionando no seu ambiente.",
      },
    ],
  },
};

const idContent: ChangePhotoBackgroundPageContent = {
  metadata: {
    title: "Cara Mengganti Latar Foto dengan Agen AI",
    description:
      "Gunakan AnyCap untuk mengganti latar foto tanpa kehilangan subjek, memeriksa revisi, dan bercabang ke versi putih, studio, atau adegan kontekstual dari gambar sumber yang sama.",
    openGraphTitle: "Cara Mengganti Latar Foto dengan Agen AI",
    openGraphDescription:
      "Panduan alur kerja mengganti latar foto melalui AnyCap sambil menjaga subjek cukup konsisten untuk alur produk, dokumentasi, dan konten.",
    articleHeadline: "Cara Mengganti Latar Foto dengan Agen AI",
    articleDescription:
      "Alur praktis mengganti latar foto melalui pengeditan gambar AnyCap sambil mempertahankan subjek asli.",
    articleAbout: [
      "Penggantian latar",
      "Pengeditan foto",
      "Pengeditan gambar-ke-gambar",
      "Agen AI",
      "Foto produk",
    ],
    articleKeywords: [
      "cara mengganti background foto",
      "ganti latar gambar",
      "ubah background foto",
      "pengganti latar foto",
      "alur penggantian latar belakang",
    ],
  },
  breadcrumbItems: [
    { name: "Beranda", href: "/" },
    { name: "Learn", href: "/learn" },
    {
      name: "Cara Mengganti Latar Foto",
      href: HOW_TO_CHANGE_PHOTO_BACKGROUND_PATH,
    },
  ],
  eyebrow: "Learn",
  lastUpdatedLabel: "Terakhir diperbarui 10 April 2026",
  hero: {
    titleLine1: "Cara mengganti latar foto",
    titleLine2: "tanpa kehilangan subjek asli",
    introBeforeFirstLink:
      "Jika Anda ingin mengganti latar foto, pekerjaan sebenarnya bukan hanya membuat adegan lama hilang. Yang penting adalah mempertahankan subjek yang sama sambil memindahkannya ke lingkungan baru yang tetap terlihat masuk akal. Di situlah",
    firstLinkLabel: "pembuatan gambar AnyCap",
    introBetweenLinks: "ditambah",
    secondLinkLabel: "pemahaman gambar",
    introAfterSecondLink:
      "memberi agen alur kerja yang lebih kuat daripada pengganti satu klik generik.",
    summaryLabel: "Ringkasan jawaban dulu",
    summaryText:
      "Alur penggantian latar foto yang berguna menjaga subjek stabil dan hanya mengubah lingkungan di sekelilingnya. AnyCap membantu agen menjalankan siklus itu di satu tempat: edit dari foto sumber, periksa apakah revisi masih terlihat seperti aset yang sama, dan bercabang ke gaya latar yang tepat dibutuhkan tujuan akhir.",
  },
  proof: {
    eyebrow: "Bukti yang dihasilkan",
    title: "Satu foto sumber, satu adegan penggantian yang lebih bersih",
    intro:
      "Halaman ini memakai pasangan bukti before-and-after nyata. Bingkai kiri adalah foto meja asli. Bingkai kanan adalah revisi AnyCap yang mempertahankan sepatu yang sama tetapi memindahkannya ke suasana studio yang lebih bersih.",
    promptLabel: "Prompt edit yang dipakai dengan AnyCap",
    prompt:
      "preserve the same off-white running shoe, replace the entire desk, notebook, mug, plant, and window scene with a clean warm cream studio backdrop and a minimal low pedestal, keep the shoe realistic and centered, add soft editorial side light and a subtle grounded shadow, premium product photo, no text, no watermark",
    signalsLabel: "Mengapa bukti ini penting",
    signals: [
      "Mengubah janji utama halaman menjadi konkret: pekerjaan berguna adalah mengganti lingkungan tanpa menyimpang jauh dari subjek sumber.",
      "Pasangan bukti menunjukkan mengapa penggantian latar berbeda dari ekspor potongan sederhana atau regenerasi penuh.",
      "Memberi halaman bukti first-party bahwa alur edit bisa berpindah dari foto sumber yang ramai ke hasil bergaya produk yang lebih bersih.",
    ],
    caption:
      "Gambar kiri adalah foto sumber asli. Gambar kanan adalah revisi penggantian latar AnyCap yang dihasilkan dari aset sumber yang sama untuk halaman ini.",
    images: [
      {
        src: `${PAGE_RESOURCE_BASE}/how-to-make-image-transparent-source.webp`,
        alt: "Foto produk sumber sepatu lari warna off-white di atas meja kayu berantakan dekat tanaman dan mug kopi.",
        width: 2304,
        height: 1728,
        label: "Gambar sumber",
        frameVariant: "plain",
      },
      {
        src: `${PAGE_RESOURCE_BASE}/how-to-change-photo-background-result.webp`,
        alt: "Sepatu lari off-white yang sama diletakkan di pedestal krem minimal dengan latar studio hangat setelah latar foto diganti.",
        width: 2304,
        height: 1728,
        label: "Hasil penggantian latar",
        frameVariant: "plain",
      },
    ],
  },
  quickAnswer: {
    eyebrow: "Jawaban singkat",
    title: "Pertahankan subjek, ganti hanya lingkungan",
    intro:
      "Banyak alat pengganti latar memperlakukan gambar seperti draf sekali pakai. Itu bukan pilihan terbaik ketika produk, orang, atau tangkapan layar asli sudah penting. Alur yang lebih kuat adalah mempertahankan subjek yang sama dan merevisi sekelilingnya.",
    takeaways: [
      "Mengganti latar foto paling kuat ketika prompt menyebutkan apa yang harus tetap, bukan hanya apa yang harus dihapus.",
      "Alur yang berguna adalah pelestarian subjek ditambah penggantian lingkungan, lalu QA pencahayaan, skala, dan konsistensi tepi.",
      "Gambar sumber yang sama bisa bercabang ke versi studio putih, bidikan pedestal bergaya, atau adegan kontekstual tergantung di mana aset akan dipakai.",
    ],
    cards: [
      {
        title: "Studio putih",
        body: "Terbaik untuk katalog, marketplace, dan slot foto dengan persyaratan kepatuhan di mana latar seharusnya hilang sebagai keputusan.",
      },
      {
        title: "Pedestal atau gradien",
        body: "Terbaik untuk halaman produk, dokumentasi, dan konten bergaya editorial di mana gambar harus terlihat lebih bersih dari sumber mentah tetapi tetap premium.",
      },
      {
        title: "Adegan kontekstual",
        body: "Terbaik ketika latar harus membantu menjual suasana, kasus penggunaan, atau bingkai kampanye alih-alih sekadar minggir.",
      },
    ],
  },
  workflow: {
    eyebrow: "Alur kerja",
    title: "Lima langkah dari foto ramai ke suasana yang lebih bersih",
    stepLabel: "Langkah",
    steps: [
      {
        title: "Pilih gambar yang memang penting",
        body: "Mulai dari foto yang benar-benar ingin Anda pakai ulang. Alur ini lebih baik ketika subjek sudah tepat dan hanya lingkungan sekelilingnya yang perlu berubah.",
      },
      {
        title: "Jelaskan lingkungan target dengan jelas",
        body: "Beri tahu model apakah tujuannya foto marketplace putih, pedestal studio lembut, atau adegan kontekstual. Sasaran latar harus konkret.",
      },
      {
        title: "Pertahankan subjek sambil mengganti adegan",
        body: "Gunakan pengeditan gambar-ke-gambar dan ulangi batasan pelestarian subjek. Pekerjaannya bukan mendesain ulang produk, melainkan mengubah suasana di sekelilingnya.",
      },
      {
        title: "Periksa koherensi, bukan hanya kebersihan",
        body: "Periksa apakah skala, bayangan, dan perspektif masih terasa masuk akal. Penggantian yang bersih tetap bisa gagal jika lingkungan baru terlihat lepas dari subjek.",
      },
      {
        title: "Bercabang ke versi yang dibutuhkan saluran",
        body: "Dari sumber yang sama, Anda bisa membuat gambar listing latar putih, visual halaman studio yang lebih lembut, atau arah kampanye yang lebih ekspresif.",
      },
    ],
  },
  comparison: {
    eyebrow: "Perbandingan",
    title: "Mengapa penggantian bukan sama dengan regenerasi",
    shallowLabel: "Default dangkal",
    workflowLabel: "Alur kerja AnyCap",
    rows: [
      {
        lens: "Apa yang berubah",
        shallow: "Semuanya diregenerasi dan produk bisa ikut bergeser.",
        workflow: "Hanya lingkungan yang berubah sementara subjek dijaga sedekat mungkin dengan sumber.",
      },
      {
        lens: "Kualitas output",
        shallow: "Latar berbeda, tetapi gambar tidak lagi terasa seperti foto yang sama.",
        workflow: "Hasilnya masih terbaca sebagai aset yang sama, hanya ditempatkan di suasana yang lebih cocok dengan saluran.",
      },
      {
        lens: "Jalur pakai ulang",
        shallow: "Anda menyelesaikan satu gambar, lalu memulai dari awal untuk setiap konteks baru.",
        workflow: "Satu gambar sumber bisa bercabang ke varian putih, studio, atau kontekstual sesuai kebutuhan.",
      },
      {
        lens: "Standar QA",
        shallow: "Latar baru terlihat lebih bagus, jadi pekerjaan dianggap selesai.",
        workflow: "Agen juga memeriksa apakah subjek, skala, dan pencahayaan masih terasa koheren setelah edit.",
      },
    ],
  },
  modelChoice: {
    eyebrow: "Pilihan model",
    title: "Pilih model berdasarkan apakah sumber sudah ada",
    cards: [
      {
        title: "Nano Banana Pro",
        label: "Pilihan pertama terbaik untuk penggantian latar",
        body: "Gunakan ini ketika foto sumber sudah ada dan pekerjaan utamanya adalah mempertahankan subjek yang sama sambil hanya mengubah adegan sekelilingnya.",
        href: "/models/nano-banana-pro",
      },
      {
        title: "Nano Banana 2",
        label: "Terbaik untuk loop varian lebih cepat",
        body: "Gunakan ini ketika Anda ingin menguji beberapa arah latar dengan cepat sebelum memutuskan jalur visual halaman atau listing.",
        href: "/models/nano-banana-2",
      },
      {
        title: "Seedream 5",
        label: "Terbaik ketika foto sumber belum ada",
        body: "Gunakan ini ketika Anda masih membutuhkan gambar produk first-pass yang lebih kuat sebelum penggantian atau pembersihan latar dimulai.",
        href: "/models/seedream-5",
      },
    ],
  },
  validation: {
    eyebrow: "Validasi langsung",
    title: "Apa yang kami periksa pada alur langsung",
    cards: [
      {
        title: "Permukaan kemampuan dikonfirmasi",
        body: "Selama produksi halaman pada 9 April 2026, pemeriksaan status AnyCap langsung mengonfirmasi pembuatan gambar, pengeditan gambar, pemahaman gambar, Drive, Page, dan pengambilan web tersedia di lingkungan saat ini.",
      },
      {
        title: "Skema dikonfirmasi",
        body: "Skema gambar-ke-gambar saat ini untuk Nano Banana Pro diperiksa langsung dan memakai parameter `images` untuk aset sumber.",
      },
      {
        title: "Pasangan bukti dihasilkan",
        body: "Bukti before-and-after di halaman ini dihasilkan melalui AnyCap dari aset sumber yang sama, bukan dirakit dari gambar yang tidak berhubungan.",
      },
      {
        title: "QA penggantian diperiksa",
        body: "Pemahaman gambar dipakai untuk memastikan penggantian latar studio masih mempertahankan sepatu yang sama dan tidak memperkenalkan teks atau artefak watermark yang terlihat.",
      },
    ],
  },
  cli: {
    eyebrow: "Contoh CLI",
    title: "Contoh perintah untuk alur penggantian",
    examples: [
      {
        title: "Ganti latar dengan suasana studio hangat",
        code: `anycap image generate \\
  --model nano-banana-pro \\
  --mode image-to-image \\
  --prompt "pertahankan subjek yang sama, ganti meja dan ruangan dengan backdrop studio krem hangat dan pedestal sederhana, pertahankan pencahayaan realistis dan bayangan lekat tanah, tanpa teks, tanpa watermark" \\
  --param images=./source-photo.png \\
  --param aspect_ratio=4:3 \\
  --param resolution=2k \\
  -o pengganti-latar-studio.png`,
      },
      {
        title: "Bercabang ke versi latar putih",
        code: `anycap image generate \\
  --model nano-banana-pro \\
  --mode image-to-image \\
  --prompt "pertahankan subjek yang sama, ganti lingkungan dengan latar studio putih bersih, foto produk siap-marketplace di tengah, tanpa teks, tanpa watermark" \\
  --param images=./source-photo.png \\
  --param aspect_ratio=4:3 \\
  --param resolution=2k \\
  -o versi-latar-putih.png`,
      },
      {
        title: "QA hasil penggantian",
        code: `anycap actions image-read \\
  --file ./pengganti-latar-studio.png \\
  --instruction "Jelaskan gambar, konfirmasi apakah subjek yang sama dipertahankan, dan sebutkan teks terlihat, watermark, atau ketidakcocokan latar yang aneh."`,
      },
    ],
  },
  faq: {
    eyebrow: "FAQ",
    title: "Pertanyaan yang biasanya muncul berikutnya",
    items: [
      {
        question: "Apakah mengganti latar foto sama dengan membuatnya transparan?",
        answer:
          "Tidak. Versi transparan menghapus lingkungan agar subjek bisa ditempatkan di tempat lain nanti. Versi dengan latar terganti sudah memilih lingkungan baru, seperti studio putih, setup pedestal, atau adegan yang lebih cocok dengan halaman atau listing.",
      },
      {
        question: "Kapan saya harus memakai latar putih alih-alih penggantian bergaya?",
        answer:
          "Pakai putih ketika tujuannya marketplace, katalog, atau didorong kepatuhan. Pakai penggantian bergaya ketika gambar perlu terasa lebih editorial, dipimpin produk, atau sadar konteks di halaman arahan, dokumen, atau aset konten.",
      },
      {
        question: "Model AnyCap mana yang harus saya pakai dulu untuk penggantian latar?",
        answer:
          "Gunakan Nano Banana Pro dulu ketika Anda sudah punya gambar sumber dan pekerjaannya adalah mempertahankan subjek sambil hanya mengganti lingkungan. Gunakan Nano Banana 2 ketika Anda ingin iterasi lebih cepat ke beberapa arah latar. Gunakan Seedream 5 ketika Anda masih membutuhkan gambar produk asli sebelum edit dimulai.",
      },
      {
        question: "Bisakah AnyCap membantu memeriksa apakah penggantian masih terlihat masuk akal?",
        answer:
          "Ya. Setelah pembuatan, Anda bisa memakai pemahaman gambar AnyCap untuk memeriksa apakah identitas subjek yang sama dipertahankan, apakah suasana baru terasa koheren, dan apakah ada teks terlihat, watermark, atau geseran prompt.",
      },
    ],
  },
  nextMove: {
    eyebrow: "Langkah berikutnya",
    title: "Lanjut ke alur yang cocok dengan tujuan",
    cards: [
      {
        title: "Cara Membuat Gambar Transparan",
        href: "/learn/how-to-make-image-transparent",
        body: "Mulai di sini ketika latar harus dihapus dulu alih-alih langsung diganti.",
      },
      {
        title: "Pembuatan Gambar",
        href: "/capabilities/image-generation",
        body: "Lihat permukaan gambar AnyCap persis yang mendukung penggantian latar dan alur gambar-ke-gambar lainnya.",
      },
      {
        title: "Nano Banana Pro",
        href: "/models/nano-banana-pro",
        body: "Pelajari lebih dalam model yang saat ini paling cocok untuk siklus revisi dengan pelestarian subjek terkuat.",
      },
      {
        title: "Instal AnyCap",
        href: "/guides/install-anycap",
        body: "Lanjut ke sini ketika Anda ingin jalur terpendek dari halaman ini ke pengaturan CLI yang berfungsi.",
      },
    ],
  },
};

const contentByLocale = {
  en: enContent,
  "pt-br": ptBrContent,
  id: idContent,
} satisfies Partial<Record<SiteLocale, ChangePhotoBackgroundPageContent>>;

function getContent(locale: SiteLocale): ChangePhotoBackgroundPageContent {
  return contentByLocale[locale as keyof typeof contentByLocale] ?? enContent;
}

export function getHowToChangePhotoBackgroundMetadata(locale: SiteLocale): Metadata {
  const content = getContent(locale);

  return {
    title: content.metadata.title,
    description: content.metadata.description,
    alternates: { canonical: HOW_TO_CHANGE_PHOTO_BACKGROUND_PATH },
    openGraph: {
      type: "website",
      locale: getLocaleConfig(locale).ogLocale,
      url: HOW_TO_CHANGE_PHOTO_BACKGROUND_PATH,
      siteName: siteConfig.siteName,
      title: content.metadata.openGraphTitle,
      description: content.metadata.openGraphDescription,
    },
  };
}

export function getHowToChangePhotoBackgroundPageData(locale: SiteLocale) {
  const content = getContent(locale);

  return {
    ...content,
    articleJsonLd: createTechArticleJsonLd({
      headline: content.metadata.articleHeadline,
      description: content.metadata.articleDescription,
      path: HOW_TO_CHANGE_PHOTO_BACKGROUND_PATH,
      locale,
      about: [...content.metadata.articleAbout],
      keywords: [...content.metadata.articleKeywords],
      datePublished: LAST_UPDATED_ISO,
      dateModified: LAST_UPDATED_ISO,
    }),
    faqJsonLd: createFaqPageJsonLd(content.faq.items),
  };
}
