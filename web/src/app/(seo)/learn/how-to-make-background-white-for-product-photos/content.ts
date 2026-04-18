import type { Metadata } from "next";
import type { LearnProofImage } from "@/components/seo/LearnProofShowcase";
import { createFaqPageJsonLd, createTechArticleJsonLd } from "@/lib/schema";
import { defaultLocale, getLocaleConfig, siteConfig, type SiteLocale } from "@/lib/site";

export const HOW_TO_MAKE_BACKGROUND_WHITE_FOR_PRODUCT_PHOTOS_PATH =
  "/learn/how-to-make-background-white-for-product-photos";

const LAST_UPDATED_ISO = "2026-04-10";
const CDN_BASE = "https://cdn.anycap.ai/page_resource/learning";

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

type WhiteBackgroundPageContent = {
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
    introBeforeLink: string;
    introLinkLabel: string;
    introAfterLink: string;
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
    options: readonly Card[];
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

const enContent: WhiteBackgroundPageContent = {
  metadata: {
    title: "How to Make Background White for Product Photos with an AI Agent",
    description:
      "Use AnyCap to turn a cluttered product photo into a white-background listing image while preserving the original subject and checking the result before export.",
    openGraphTitle: "How to Make Background White for Product Photos with an AI Agent",
    openGraphDescription:
      "A workflow guide for turning an existing product photo into a white-background listing image through AnyCap without losing the original subject.",
    articleHeadline: "How to Make Background White for Product Photos with an AI Agent",
    articleDescription:
      "A practical workflow for converting an existing product photo into a white-background catalog image through AnyCap image editing.",
    articleAbout: [
      "White background",
      "Product photos",
      "Catalog images",
      "Ecommerce editing",
      "AI agents",
    ],
    articleKeywords: [
      "make background white for product photos",
      "white background product photo",
      "product photo white background",
      "ecommerce product image background",
      "marketplace-ready product photo",
    ],
  },
  breadcrumbItems: [
    { name: "Home", href: "/" },
    { name: "Learn", href: "/learn" },
    {
      name: "How to Make Background White for Product Photos",
      href: HOW_TO_MAKE_BACKGROUND_WHITE_FOR_PRODUCT_PHOTOS_PATH,
    },
  ],
  eyebrow: "Learn",
  lastUpdatedLabel: "Last updated April 10, 2026",
  hero: {
    titleLine1: "How to make background white",
    titleLine2: "for product photos",
    introBeforeLink:
      "If the destination is marketplace, catalog, or another compliance-style image slot, the question is usually not whether the photo can be made prettier. It is whether the product can be preserved while the surrounding lifestyle clutter is replaced by a neutral white setup. That is where",
    introLinkLabel: "AnyCap image generation",
    introAfterLink: "gives the agent a cleaner product-photo workflow.",
    summaryLabel: "Answer-first summary",
    summaryText:
      "A useful white-background workflow keeps the original product and simplifies only the environment around it. AnyCap helps the agent edit from the source photo, inspect the result, and keep the output aligned with channels that expect a neutral product image instead of an editorial scene.",
  },
  proof: {
    eyebrow: "Generated proof",
    title: "One source product photo, one white-background listing version",
    intro:
      "This page uses a real before-and-after proof pair. The left frame is the cluttered desk photo. The right frame is the AnyCap revision that keeps the same shoe but converts the environment into a white-background listing image.",
    promptLabel: "Edit prompt used with AnyCap",
    prompt:
      "preserve the same off-white running shoe, replace the desk, notebook, mug, plant, and window with a seamless pure white studio background, centered ecommerce product photo, soft grounded shadow, clean edge separation, realistic materials, no text, no watermark",
    signalsLabel: "Why this proof matters",
    signals: [
      "It shows why white-background cleanup is a narrower job than generic background replacement.",
      "The proof pair makes the marketplace-style use case concrete instead of leaving the page at the level of abstract advice.",
      "It demonstrates that the agent can move from a lived-in source photo to a cleaner catalog-style result without swapping the product identity.",
    ],
    caption:
      "The left image is the source product photo. The right image is the AnyCap white-background revision generated from that same source asset for this page.",
    images: [
      {
        src: `${CDN_BASE}/how-to-make-image-transparent-source.webp`,
        alt: "Source product photo of an off-white running shoe sitting on a cluttered wooden desk near a plant and a coffee mug.",
        width: 2304,
        height: 1728,
        label: "Source image",
        frameVariant: "plain",
      },
      {
        src: `${CDN_BASE}/how-to-make-background-white-product-result-1600.png`,
        alt: "The same off-white running shoe centered on a seamless white studio background with a soft shadow for a catalog-style product photo.",
        width: 1600,
        height: 1195,
        label: "White-background result",
        frameVariant: "plain",
      },
    ],
  },
  quickAnswer: {
    eyebrow: "Quick answer",
    title: "White background is a channel decision",
    intro:
      "A white-background product image is usually not about making the photo more dramatic. It is about meeting the expectations of a channel that wants neutral, repeatable, easy-to-compare product visuals. That is why this workflow is narrower than a general background changer.",
    takeaways: [
      "White-background product photos are usually about channel fit, not aesthetics alone.",
      "The strong workflow is to preserve the original product while removing the desk, room, and lifestyle clutter around it.",
      "The same source image can still branch into white-background, transparent, or styled-scene versions depending on the destination.",
    ],
    options: [
      {
        title: "Marketplace slots",
        body: "Best when the destination wants simple, consistent product images that minimize styling differences across a catalog.",
      },
      {
        title: "Internal product docs",
        body: "Best when the image should stay neutral and easy to reuse in docs, specs, or other operational material.",
      },
      {
        title: "Comparison pages",
        body: "Best when the image needs to sit beside several other products without one of them carrying a much more styled background treatment.",
      },
    ],
  },
  workflow: {
    eyebrow: "Workflow",
    title: "Five steps from lifestyle source to listing image",
    stepLabel: "Step",
    steps: [
      {
        title: "Start with the real product image",
        body: "Use the product photo that already matters to your listing, doc, or catalog flow. This is not the best place to regenerate the subject from scratch.",
      },
      {
        title: "Ask for white background specifically",
        body: "Say `white studio background` or `marketplace-ready product photo` directly. White should be an explicit requirement, not a vague cleanup guess.",
      },
      {
        title: "Keep the product identity stable",
        body: "Repeat the subject-preservation constraint so the model treats the item as fixed while simplifying only the surroundings around it.",
      },
      {
        title: "Check edges and shadow behavior",
        body: "The result should feel clean without looking cut out badly. Keep an eye on laces, soles, packaging edges, and whether the grounded shadow still feels plausible.",
      },
      {
        title: "Export the version the channel expects",
        body: "From the same source, you can still branch into transparent or styled versions later, but the white-background listing image should stay the most neutral output in the set.",
      },
    ],
  },
  comparison: {
    eyebrow: "Comparison",
    title: "Why this is different from generic cleanup",
    shallowLabel: "Shallow default",
    workflowLabel: "AnyCap workflow",
    rows: [
      {
        lens: "Destination fit",
        shallow: "The product looks cleaner, but the page does not say why white matters.",
        workflow:
          "The page explains that white is usually the right lane for catalog, marketplace, and compliance-style image slots.",
      },
      {
        lens: "What changes",
        shallow: "The tool edits the image without a strong constraint on preserving the product.",
        workflow:
          "The subject stays anchored while the cluttered environment is replaced by a neutral white setup.",
      },
      {
        lens: "Asset reuse",
        shallow: "The edited photo becomes a one-off export.",
        workflow:
          "The same source can branch into white, transparent, or styled-scene variants depending on the next channel.",
      },
      {
        lens: "QA standard",
        shallow: "The background is white, so the job feels done.",
        workflow:
          "The agent also checks subject consistency, edge quality, and whether the result still looks product-grade.",
      },
    ],
  },
  modelChoice: {
    eyebrow: "Model choice",
    title: "Pick the model based on where the cleanup starts",
    cards: [
      {
        title: "Nano Banana Pro",
        label: "Best first choice for listing cleanup",
        body: "Use this when the source photo already exists and the main job is to preserve the product while converting the scene into a neutral white setup.",
        href: "/models/nano-banana-pro",
      },
      {
        title: "Nano Banana 2",
        label: "Best for faster listing variants",
        body: "Use this when you want a quicker loop across several white-background directions or slightly different product framings.",
        href: "/models/nano-banana-2",
      },
      {
        title: "Seedream 5",
        label: "Best when the source photo is still missing",
        body: "Use this when you need the original product image first and only then want to branch into white-background cleanup.",
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
        body: "During page production on April 10, 2026, a live AnyCap status check confirmed image generation, image editing, and image reading were available in the current environment.",
      },
      {
        title: "Schema confirmed",
        body: "Nano Banana Pro's live image-to-image schema was checked and the current source-asset parameter is `images`.",
      },
      {
        title: "Proof pair generated",
        body: "The before-and-after images on this page were generated through AnyCap from the same source product photo rather than assembled from unrelated examples.",
      },
      {
        title: "Result inspected",
        body: "Image reading was used to confirm the white-background result preserved the same shoe and did not introduce visible text or watermark artifacts.",
      },
    ],
  },
  cli: {
    eyebrow: "CLI examples",
    title: "Example commands for white-background product cleanup",
    examples: [
      {
        title: "Convert a source photo into a white-background listing image",
        code: `anycap image generate \\
  --model nano-banana-pro \\
  --mode image-to-image \\
  --prompt "preserve the same product, replace the room with a pure white studio background, centered ecommerce product photo, soft grounded shadow, no text, no watermark" \\
  --param images=./source-product.png \\
  --param aspect_ratio=4:3 \\
  --param resolution=2k \\
  -o white-background-product.png`,
      },
      {
        title: "Branch from the same source into a transparent version",
        code: `anycap image generate \\
  --model nano-banana-pro \\
  --mode image-to-image \\
  --prompt "remove the background and keep only the same product as a clean cutout preview, preserve edges and materials, no text, no watermark" \\
  --param images=./source-product.png \\
  --param aspect_ratio=4:3 \\
  --param resolution=2k \\
  -o transparent-product-cutout.png`,
      },
      {
        title: "QA the white-background result",
        code: `anycap actions image-read \\
  --file ./white-background-product.png \\
  --instruction "Describe the image, confirm whether the same product is preserved, and mention any visible text, watermark, or edge problems."`,
      },
    ],
  },
  faq: {
    eyebrow: "FAQ",
    title: "Questions that usually come next",
    items: [
      {
        question: "When is a white background better than transparency?",
        answer:
          "Use white when the destination is catalog, marketplace, or another channel that expects a clean product image with no styling decisions left open. Use transparency when the asset still needs to sit on several different surfaces later.",
      },
      {
        question: "When is a white background better than a styled studio scene?",
        answer:
          "Use white when consistency, compliance, or visual neutrality matters more than mood. Use a styled scene when the page needs more editorial framing or a stronger product-story signal.",
      },
      {
        question: "Which AnyCap model should I use first for white-background product edits?",
        answer:
          "Use Nano Banana Pro first when the source product photo already exists and the job is to preserve the original item while simplifying the environment. Use Nano Banana 2 when you want faster iteration or several listing variants. Use Seedream 5 when you still need the original product photo before cleanup starts.",
      },
      {
        question: "Can AnyCap help inspect whether the result still looks marketplace-ready?",
        answer:
          "Yes. After generation, you can use AnyCap image reading to check whether the same product is preserved, whether the edges still look clean, and whether any visible text or watermark was introduced.",
      },
    ],
  },
  nextMove: {
    eyebrow: "Next move",
    title: "Move into the workflow the channel actually needs",
    cards: [
      {
        title: "How to Change a Photo Background",
        href: "/learn/how-to-change-photo-background",
        body: "Use this broader workflow when the target is a studio scene or a contextual replacement instead of pure white.",
      },
      {
        title: "How to Make an Image Transparent",
        href: "/learn/how-to-make-image-transparent",
        body: "Use this when the destination wants the product isolated for reuse across several different layouts later.",
      },
      {
        title: "Nano Banana Pro",
        href: "/models/nano-banana-pro",
        body: "Go deeper on the model that currently fits the strongest source-preserving revision loop for product cleanup.",
      },
      {
        title: "Install AnyCap",
        href: "/guides/install-anycap",
        body: "Move here when you want the shortest path from this page to a working CLI setup.",
      },
    ],
  },
};

const ptBrContent: WhiteBackgroundPageContent = {
  metadata: {
    title: "Como deixar o fundo branco em fotos de produto com IA",
    description:
      "Use o AnyCap para transformar uma foto de produto com fundo poluído em uma imagem com fundo branco, preservando o item original e conferindo o resultado antes de exportar.",
    openGraphTitle: "Como deixar o fundo branco em fotos de produto com IA",
    openGraphDescription:
      "Um guia prático para transformar uma foto de produto existente em uma imagem com fundo branco usando o fluxo de edição e revisão do AnyCap.",
    articleHeadline: "Como deixar o fundo branco em fotos de produto com IA",
    articleDescription:
      "Um fluxo prático para converter uma foto de produto existente em uma imagem de catálogo com fundo branco usando edição de imagem com AnyCap.",
    articleAbout: [
      "Fundo branco",
      "Fotos de produto",
      "Imagens de catálogo",
      "Edição para ecommerce",
      "Agentes de IA",
    ],
    articleKeywords: [
      "fundo branco",
      "como deixar fundo branco em foto de produto",
      "foto de produto fundo branco",
      "imagem de produto para ecommerce",
      "fundo branco para catálogo",
    ],
  },
  breadcrumbItems: [
    { name: "Início", href: "/" },
    { name: "Learn", href: "/learn" },
    {
      name: "Como deixar o fundo branco em fotos de produto",
      href: HOW_TO_MAKE_BACKGROUND_WHITE_FOR_PRODUCT_PHOTOS_PATH,
    },
  ],
  eyebrow: "Learn",
  lastUpdatedLabel: "Atualizado em 10 de abril de 2026",
  hero: {
    titleLine1: "Como deixar o fundo branco",
    titleLine2: "em fotos de produto",
    introBeforeLink:
      "Quando o destino é marketplace, catálogo ou outro slot que pede neutralidade, a pergunta não é só se a foto pode ficar mais bonita. A pergunta é se o produto pode ser preservado enquanto a bagunça ao redor é substituída por um fundo branco limpo. É aí que",
    introLinkLabel: "a geração de imagem do AnyCap",
    introAfterLink:
      "dá ao agente um fluxo mais confiável para preparar fotos de produto.",
    summaryLabel: "Resposta curta",
    summaryText:
      "Um bom fluxo para fundo branco preserva o produto original e simplifica apenas o ambiente. Com AnyCap, o agente pode editar a partir da foto fonte, revisar o resultado com leitura de imagem e manter a saída alinhada aos canais que exigem uma foto neutra de produto.",
  },
  proof: {
    eyebrow: "Prova gerada",
    title: "Uma foto fonte, uma versão pronta para catálogo",
    intro:
      "Esta página usa um par real de antes e depois. À esquerda está a foto fonte em uma mesa de trabalho. À direita está a edição feita com AnyCap, mantendo o mesmo tênis e trocando o ambiente por um fundo branco de catálogo.",
    promptLabel: "Prompt de edição usado com AnyCap",
    prompt:
      "preserve the exact same cream running shoe, remove the desk, notebook, mug, plant, and room, place the shoe centered on a seamless pure white studio background with a soft grounded shadow, clean ecommerce catalog photo, realistic materials, no text, no watermark",
    signalsLabel: "Por que esta prova importa",
    signals: [
      "Mostra que a tarefa é mais específica do que um trocador de fundo genérico.",
      "Transforma a intenção de `fundo branco` em um caso de uso concreto para ecommerce e catálogo.",
      "Demonstra que o agente pode sair de uma foto real de mesa para uma imagem neutra sem trocar a identidade do produto.",
    ],
    caption:
      "À esquerda está a foto fonte gerada para este fluxo. À direita está a versão com fundo branco gerada pelo AnyCap a partir dessa mesma imagem.",
    images: [
      {
        src: `${CDN_BASE}/pt-br-background-white-source-2026-04-10.png`,
        alt: "Foto fonte de um tênis creme sobre uma mesa de madeira com caderno, caneca, planta e outros objetos de escritório ao redor.",
        width: 1200,
        height: 896,
        label: "Imagem fonte",
        frameVariant: "plain",
      },
      {
        src: `${CDN_BASE}/pt-br-background-white-result-2026-04-10.png`,
        alt: "O mesmo tênis creme centralizado em um fundo branco contínuo com sombra suave, em estilo de foto de catálogo.",
        width: 1200,
        height: 896,
        label: "Resultado com fundo branco",
        frameVariant: "plain",
      },
    ],
  },
  quickAnswer: {
    eyebrow: "Resposta rápida",
    title: "Fundo branco é uma decisão de canal",
    intro:
      "Na maioria dos casos, uma foto com fundo branco não existe para ficar mais dramática. Ela existe para atender um canal que quer imagens neutras, consistentes e fáceis de comparar. Por isso este fluxo é mais estreito do que um simples trocador de fundo.",
    takeaways: [
      "Fotos de produto com fundo branco geralmente têm mais a ver com adequação ao canal do que com estética.",
      "O fluxo forte preserva o produto original enquanto remove a mesa, o ambiente e os elementos de estilo de vida ao redor.",
      "A mesma imagem fonte ainda pode virar uma versão transparente ou uma cena mais editorial depois, se o destino mudar.",
    ],
    options: [
      {
        title: "Marketplaces",
        body: "Melhor quando o destino quer imagens simples e consistentes, com o mínimo de diferença visual entre produtos do catálogo.",
      },
      {
        title: "Documentação interna",
        body: "Melhor quando a imagem precisa continuar neutra e reutilizável em docs, fichas técnicas ou materiais operacionais.",
      },
      {
        title: "Páginas comparativas",
        body: "Melhor quando a foto vai ficar ao lado de vários outros produtos sem que um deles carregue um fundo muito mais estilizado.",
      },
    ],
  },
  workflow: {
    eyebrow: "Fluxo",
    title: "Cinco passos da foto real até a imagem de catálogo",
    stepLabel: "Passo",
    steps: [
      {
        title: "Comece com a foto que realmente importa",
        body: "Use a foto de produto que já faz parte do seu fluxo de catálogo, doc ou listing. Este não é o melhor lugar para regenerar o item do zero.",
      },
      {
        title: "Peça fundo branco de forma explícita",
        body: "Diga `fundo branco de estúdio` ou `foto de produto pronta para marketplace`. Branco precisa ser um requisito claro, não um palpite vago de limpeza.",
      },
      {
        title: "Mantenha a identidade do produto estável",
        body: "Repita a restrição de preservação do objeto para que o modelo trate o item como fixo e simplifique apenas o ambiente ao redor.",
      },
      {
        title: "Revise bordas e sombra",
        body: "O resultado precisa parecer limpo sem parecer um recorte ruim. Vale checar cadarços, sola, textura do tecido e se a sombra suave ainda faz sentido.",
      },
      {
        title: "Exporte a versão que o canal espera",
        body: "A partir da mesma fonte, você ainda pode gerar uma versão transparente ou mais editorial depois, mas a imagem com fundo branco deve continuar sendo a saída mais neutra do conjunto.",
      },
    ],
  },
  comparison: {
    eyebrow: "Comparação",
    title: "Por que isso é diferente de uma limpeza genérica",
    shallowLabel: "Atalho superficial",
    workflowLabel: "Fluxo com AnyCap",
    rows: [
      {
        lens: "Adequação ao destino",
        shallow: "A foto parece mais limpa, mas a página não explica por que branco importa.",
        workflow:
          "A página deixa claro que branco costuma ser a melhor escolha para catálogo, marketplace e outros slots guiados por consistência.",
      },
      {
        lens: "O que muda",
        shallow: "A ferramenta edita a imagem sem uma restrição forte de preservação do produto.",
        workflow:
          "O produto permanece ancorado enquanto o ambiente poluído é substituído por um setup branco e neutro.",
      },
      {
        lens: "Reuso do asset",
        shallow: "A imagem editada vira uma exportação isolada.",
        workflow:
          "A mesma fonte pode se ramificar para branco, transparente ou cena estilizada conforme o próximo canal.",
      },
      {
        lens: "Padrão de QA",
        shallow: "O fundo ficou branco, então parece que o trabalho acabou.",
        workflow:
          "O agente também verifica consistência do produto, qualidade das bordas e se o resultado continua com cara de foto de produto.",
      },
    ],
  },
  modelChoice: {
    eyebrow: "Escolha do modelo",
    title: "Escolha o modelo de acordo com o ponto de partida",
    cards: [
      {
        title: "Nano Banana Pro",
        label: "Melhor primeira escolha para cleanup de listing",
        body: "Use quando a foto fonte já existe e o principal objetivo é preservar o produto enquanto a cena é convertida em um fundo branco neutro.",
        href: "/models/nano-banana-pro",
      },
      {
        title: "Nano Banana 2",
        label: "Melhor para variantes mais rápidas",
        body: "Use quando você quer testar direções diferentes com mais velocidade ou comparar alguns enquadramentos de listing.",
        href: "/models/nano-banana-2",
      },
      {
        title: "Seedream 5",
        label: "Melhor quando a foto fonte ainda não existe",
        body: "Use quando você ainda precisa gerar a imagem original do produto antes de entrar no fluxo de fundo branco.",
        href: "/models/seedream-5",
      },
    ],
  },
  validation: {
    eyebrow: "Validação de primeira mão",
    title: "O que foi verificado no fluxo real",
    cards: [
      {
        title: "Capability surface confirmada",
        body: "Durante a produção desta página em 10 de abril de 2026, uma checagem ao vivo com `anycap status` confirmou disponibilidade de geração, edição e leitura de imagem.",
      },
      {
        title: "Schema confirmada",
        body: "A schema ao vivo de image-to-image do Nano Banana Pro foi conferida e o parâmetro atual para o asset de referência é `images`.",
      },
      {
        title: "Par de prova gerado",
        body: "As imagens de antes e depois desta página foram geradas com AnyCap a partir da mesma foto fonte, sem montagem com exemplos de origens diferentes.",
      },
      {
        title: "Resultado revisado",
        body: "A leitura de imagem foi usada para confirmar que o resultado com fundo branco preservou o mesmo tênis e não introduziu texto visível nem watermark.",
      },
    ],
  },
  cli: {
    eyebrow: "Exemplos de CLI",
    title: "Comandos para preparar fotos de produto com fundo branco",
    examples: [
      {
        title: "Transformar a foto fonte em uma imagem pronta para listing",
        code: `anycap image generate \\
  --model nano-banana-pro \\
  --mode image-to-image \\
  --prompt "preserve o mesmo produto, troque o ambiente por um fundo branco de estúdio, foto centralizada para ecommerce, sombra suave, sem texto, sem watermark" \\
  --param images=./source-product.png \\
  --param aspect_ratio=4:3 \\
  --param resolution=2k \\
  -o produto-fundo-branco.png`,
      },
      {
        title: "Gerar uma versão transparente a partir da mesma fonte",
        code: `anycap image generate \\
  --model nano-banana-pro \\
  --mode image-to-image \\
  --prompt "remova o fundo e mantenha apenas o mesmo produto como recorte limpo, preserve bordas e materiais, sem texto, sem watermark" \\
  --param images=./source-product.png \\
  --param aspect_ratio=4:3 \\
  --param resolution=2k \\
  -o produto-transparente.png`,
      },
      {
        title: "Fazer QA do resultado com fundo branco",
        code: `anycap actions image-read \\
  --file ./produto-fundo-branco.png \\
  --instruction "Descreva a imagem, confirme se o mesmo produto foi preservado e mencione qualquer problema visível de texto, watermark ou borda."`,
      },
    ],
  },
  faq: {
    eyebrow: "FAQ",
    title: "Perguntas que normalmente vêm depois",
    items: [
      {
        question: "Quando fundo branco é melhor do que transparência?",
        answer:
          "Use fundo branco quando o destino for catálogo, marketplace ou outro canal que espera uma foto limpa de produto, sem deixar decisões de styling em aberto. Use transparência quando o asset ainda precisa pousar em várias superfícies depois.",
      },
      {
        question: "Quando fundo branco é melhor do que uma cena de estúdio estilizada?",
        answer:
          "Use branco quando consistência, compliance ou neutralidade visual importam mais do que clima. Use uma cena estilizada quando a página precisa de mais contexto editorial ou de um sinal visual mais forte de narrativa do produto.",
      },
      {
        question: "Qual modelo do AnyCap eu devo usar primeiro para esse tipo de edição?",
        answer:
          "Comece com Nano Banana Pro quando a foto fonte já existe e o trabalho é preservar o item original enquanto o ambiente é simplificado. Use Nano Banana 2 quando velocidade e variação importam mais. Use Seedream 5 quando a imagem original ainda não existe.",
      },
      {
        question: "O AnyCap pode ajudar a revisar se o resultado ainda parece pronto para marketplace?",
        answer:
          "Sim. Depois da geração, você pode usar leitura de imagem no AnyCap para conferir se o mesmo produto foi preservado, se as bordas continuam limpas e se apareceu algum texto visível ou watermark.",
      },
    ],
  },
  nextMove: {
    eyebrow: "Próximo passo",
    title: "Avance para o fluxo que o canal realmente precisa",
    cards: [
      {
        title: "Geração de imagem",
        href: "/capabilities/image-generation",
        body: "Veja como o AnyCap entrega geração e edição de imagem para agentes em um único fluxo.",
      },
      {
        title: "Nano Banana Pro",
        href: "/models/nano-banana-pro",
        body: "Aprofunde no modelo que hoje encaixa melhor em revisões que preservam o asset original.",
      },
      {
        title: "Nano Banana 2",
        href: "/models/nano-banana-2",
        body: "Use este caminho quando você quiser mais velocidade para testar variantes do mesmo produto.",
      },
      {
        title: "Instalar AnyCap",
        href: "/guides/install-anycap",
        body: "Siga por aqui quando quiser sair desta página com um CLI funcionando no seu ambiente.",
      },
    ],
  },
};

const idContent: WhiteBackgroundPageContent = {
  metadata: {
    title: "Cara membuat latar belakang putih untuk foto produk dengan agen AI",
    description:
      "Gunakan AnyCap untuk mengubah foto produk yang ramai menjadi gambar listing dengan latar putih sambil mempertahankan subjek asli dan memeriksa hasil sebelum diekspor.",
    openGraphTitle: "Cara membuat latar belakang putih untuk foto produk dengan agen AI",
    openGraphDescription:
      "Panduan alur kerja untuk mengubah foto produk yang ada menjadi gambar listing dengan latar putih melalui AnyCap tanpa kehilangan subjek asli.",
    articleHeadline: "Cara membuat latar belakang putih untuk foto produk dengan agen AI",
    articleDescription:
      "Alur kerja praktis untuk mengonversi foto produk yang ada menjadi gambar katalog dengan latar putih melalui pengeditan gambar AnyCap.",
    articleAbout: [
      "Latar belakang putih",
      "Foto produk",
      "Gambar katalog",
      "Pengeditan e-commerce",
      "Agen AI",
    ],
    articleKeywords: [
      "cara membuat latar belakang putih foto produk",
      "foto produk latar belakang putih",
      "gambar produk e-commerce latar putih",
      "foto listing marketplace",
      "edit foto produk latar putih",
    ],
  },
  breadcrumbItems: [
    { name: "Beranda", href: "/" },
    { name: "Learn", href: "/learn" },
    {
      name: "Cara membuat latar belakang putih untuk foto produk",
      href: HOW_TO_MAKE_BACKGROUND_WHITE_FOR_PRODUCT_PHOTOS_PATH,
    },
  ],
  eyebrow: "Learn",
  lastUpdatedLabel: "Terakhir diperbarui 10 April 2026",
  hero: {
    titleLine1: "Cara membuat latar belakang putih",
    titleLine2: "untuk foto produk",
    introBeforeLink:
      "Jika tujuannya adalah marketplace, katalog, atau slot gambar bergaya kepatuhan lainnya, pertanyaannya biasanya bukan apakah foto bisa dibuat lebih menarik. Melainkan apakah produk dapat dipertahankan sementara kekacauan gaya hidup di sekitarnya diganti dengan setup putih netral. Di situlah",
    introLinkLabel: "pembuatan gambar AnyCap",
    introAfterLink: "memberi agen alur kerja foto produk yang lebih bersih.",
    summaryLabel: "Ringkasan jawaban dulu",
    summaryText:
      "Alur kerja latar putih yang berguna mempertahankan produk asli dan hanya menyederhanakan lingkungan di sekitarnya. AnyCap membantu agen mengedit dari foto sumber, memeriksa hasilnya, dan menjaga output selaras dengan saluran yang mengharapkan gambar produk netral, bukan adegan editorial.",
  },
  proof: {
    eyebrow: "Bukti yang dihasilkan",
    title: "Satu foto produk sumber, satu versi listing dengan latar putih",
    intro:
      "Halaman ini memakai pasangan bukti before-after nyata. Bingkai kiri adalah foto meja yang ramai. Bingkai kanan adalah revisi AnyCap yang mempertahankan sepatu yang sama tetapi mengubah lingkungan menjadi gambar listing dengan latar putih.",
    promptLabel: "Prompt edit yang dipakai dengan AnyCap",
    prompt:
      "preserve the same off-white running shoe, replace the desk, notebook, mug, plant, and window with a seamless pure white studio background, centered ecommerce product photo, soft grounded shadow, clean edge separation, realistic materials, no text, no watermark",
    signalsLabel: "Mengapa bukti ini penting",
    signals: [
      "Ini menunjukkan mengapa pembersihan latar putih adalah pekerjaan yang lebih sempit daripada penggantian latar generik.",
      "Pasangan bukti membuat kasus penggunaan bergaya marketplace konkret alih-alih hanya nasihat abstrak.",
      "Ini menunjukkan bahwa agen dapat berpindah dari foto sumber kehidupan sehari-hari ke hasil bergaya katalog yang lebih bersih tanpa menukar identitas produk.",
    ],
    caption:
      "Gambar kiri adalah foto produk sumber. Gambar kanan adalah revisi latar putih AnyCap yang dihasilkan dari aset sumber yang sama untuk halaman ini.",
    images: [
      {
        src: `${CDN_BASE}/how-to-make-image-transparent-source.webp`,
        alt: "Foto produk sumber sepatu lari warna krem di atas meja kayu yang ramai dekat tanaman dan mug kopi.",
        width: 2304,
        height: 1728,
        label: "Gambar sumber",
        frameVariant: "plain",
      },
      {
        src: `${CDN_BASE}/how-to-make-background-white-product-result-1600.png`,
        alt: "Sepatu lari warna krem yang sama di tengah latar studio putih mulus dengan bayangan lembut untuk foto produk bergaya katalog.",
        width: 1600,
        height: 1195,
        label: "Hasil latar putih",
        frameVariant: "plain",
      },
    ],
  },
  quickAnswer: {
    eyebrow: "Jawaban singkat",
    title: "Latar putih adalah keputusan saluran",
    intro:
      "Gambar produk dengan latar putih biasanya bukan tentang membuat foto lebih dramatis. Ini tentang memenuhi ekspektasi saluran yang menginginkan visual produk netral, berulang, dan mudah dibandingkan. Itulah sebabnya alur kerja ini lebih sempit daripada pengganti latar umum.",
    takeaways: [
      "Foto produk dengan latar putih biasanya tentang kesesuaian saluran, bukan sekadar estetika.",
      "Alur kerja yang kuat adalah mempertahankan produk asli sambil menghapus meja, ruangan, dan kekacauan gaya hidup di sekitarnya.",
      "Gambar sumber yang sama masih bisa bercabang ke versi latar putih, transparan, atau adegan bergaya tergantung tujuan akhir.",
    ],
    options: [
      {
        title: "Slot marketplace",
        body: "Terbaik ketika tujuan menginginkan gambar produk sederhana dan konsisten yang meminimalkan perbedaan styling antar katalog.",
      },
      {
        title: "Dokumen produk internal",
        body: "Terbaik ketika gambar harus tetap netral dan mudah dipakai ulang di dokumen, spesifikasi, atau materi operasional lainnya.",
      },
      {
        title: "Halaman perbandingan",
        body: "Terbaik ketika gambar perlu berdampingan dengan beberapa produk lain tanpa salah satunya membawa perlakuan latar yang jauh lebih bergaya.",
      },
    ],
  },
  workflow: {
    eyebrow: "Alur kerja",
    title: "Lima langkah dari sumber gaya hidup ke gambar listing",
    stepLabel: "Langkah",
    steps: [
      {
        title: "Mulai dengan gambar produk nyata",
        body: "Gunakan foto produk yang sudah penting untuk listing, dokumen, atau alur katalog Anda. Ini bukan tempat terbaik untuk menghasilkan ulang subjek dari nol.",
      },
      {
        title: "Minta latar putih secara eksplisit",
        body: "Katakan `white studio background` atau `marketplace-ready product photo` secara langsung. Putih harus menjadi persyaratan eksplisit, bukan tebakan pembersihan yang samar.",
      },
      {
        title: "Jaga identitas produk tetap stabil",
        body: "Ulangi batasan pelestarian subjek agar model memperlakukan barang sebagai tetap sambil hanya menyederhanakan lingkungan di sekitarnya.",
      },
      {
        title: "Periksa tepi dan perilaku bayangan",
        body: "Hasilnya harus terasa bersih tanpa terlihat terpotong buruk. Perhatikan tali sepatu, sol, tepi kemasan, dan apakah bayangan di dasar masih terasa masuk akal.",
      },
      {
        title: "Ekspor versi yang diharapkan saluran",
        body: "Dari sumber yang sama, Anda masih bisa bercabang ke versi transparan atau bergaya nanti, tetapi gambar listing dengan latar putih harus tetap output paling netral dalam set tersebut.",
      },
    ],
  },
  comparison: {
    eyebrow: "Perbandingan",
    title: "Mengapa ini berbeda dari pembersihan generik",
    shallowLabel: "Default dangkal",
    workflowLabel: "Alur kerja AnyCap",
    rows: [
      {
        lens: "Kesesuaian tujuan",
        shallow: "Produk terlihat lebih bersih, tetapi halaman tidak menjelaskan mengapa putih penting.",
        workflow:
          "Halaman menjelaskan bahwa putih biasanya jalur yang tepat untuk slot gambar katalog, marketplace, dan bergaya kepatuhan.",
      },
      {
        lens: "Apa yang berubah",
        shallow: "Alat mengedit gambar tanpa batasan kuat untuk mempertahankan produk.",
        workflow:
          "Subjek tetap terjangkar sementara lingkungan yang ramai diganti dengan setup putih netral.",
      },
      {
        lens: "Pemakaian ulang aset",
        shallow: "Foto yang diedit menjadi ekspor satu kali.",
        workflow:
          "Sumber yang sama dapat bercabang ke varian putih, transparan, atau adegan bergaya tergantung saluran berikutnya.",
      },
      {
        lens: "Standar QA",
        shallow: "Latar belakang putih, jadi pekerjaan terasa selesai.",
        workflow:
          "Agen juga memeriksa konsistensi subjek, kualitas tepi, dan apakah hasilnya masih terlihat setingkat foto produk.",
      },
    ],
  },
  modelChoice: {
    eyebrow: "Pilihan model",
    title: "Pilih model berdasarkan titik awal pembersihan",
    cards: [
      {
        title: "Nano Banana Pro",
        label: "Pilihan pertama terbaik untuk pembersihan listing",
        body: "Gunakan ini ketika foto sumber sudah ada dan tugas utamanya adalah mempertahankan produk sambil mengonversi adegan menjadi setup putih netral.",
        href: "/models/nano-banana-pro",
      },
      {
        title: "Nano Banana 2",
        label: "Terbaik untuk varian listing yang lebih cepat",
        body: "Gunakan ini ketika Anda ingin loop lebih cepat di beberapa arah latar putih atau pembingkaian produk yang sedikit berbeda.",
        href: "/models/nano-banana-2",
      },
      {
        title: "Seedream 5",
        label: "Terbaik ketika foto sumber masih belum ada",
        body: "Gunakan ini ketika Anda memerlukan gambar produk asli terlebih dahulu dan baru kemudian ingin bercabang ke pembersihan latar putih.",
        href: "/models/seedream-5",
      },
    ],
  },
  validation: {
    eyebrow: "Validasi langsung",
    title: "Apa yang kami periksa pada alur kerja live",
    cards: [
      {
        title: "Permukaan kemampuan dikonfirmasi",
        body: "Selama produksi halaman pada 10 April 2026, pemeriksaan status AnyCap live mengonfirmasi pembuatan gambar, pengeditan gambar, dan pembacaan gambar tersedia di lingkungan saat ini.",
      },
      {
        title: "Skema dikonfirmasi",
        body: "Skema image-to-image live Nano Banana Pro diperiksa dan parameter aset sumber saat ini adalah `images`.",
      },
      {
        title: "Pasangan bukti dihasilkan",
        body: "Gambar before-after di halaman ini dihasilkan melalui AnyCap dari foto produk sumber yang sama alih-alih dirakit dari contoh yang tidak terkait.",
      },
      {
        title: "Hasil diperiksa",
        body: "Pembacaan gambar dipakai untuk mengonfirmasi bahwa hasil latar putih mempertahankan sepatu yang sama dan tidak memperkenalkan teks atau artefak watermark yang terlihat.",
      },
    ],
  },
  cli: {
    eyebrow: "Contoh CLI",
    title: "Contoh perintah untuk pembersihan produk dengan latar putih",
    examples: [
      {
        title: "Ubah foto sumber menjadi gambar listing dengan latar putih",
        code: `anycap image generate \\
  --model nano-banana-pro \\
  --mode image-to-image \\
  --prompt "preserve the same product, replace the room with a pure white studio background, centered ecommerce product photo, soft grounded shadow, no text, no watermark" \\
  --param images=./source-product.png \\
  --param aspect_ratio=4:3 \\
  --param resolution=2k \\
  -o white-background-product.png`,
      },
      {
        title: "Cabang dari sumber yang sama ke versi transparan",
        code: `anycap image generate \\
  --model nano-banana-pro \\
  --mode image-to-image \\
  --prompt "remove the background and keep only the same product as a clean cutout preview, preserve edges and materials, no text, no watermark" \\
  --param images=./source-product.png \\
  --param aspect_ratio=4:3 \\
  --param resolution=2k \\
  -o transparent-product-cutout.png`,
      },
      {
        title: "QA hasil latar putih",
        code: `anycap actions image-read \\
  --file ./white-background-product.png \\
  --instruction "Describe the image, confirm whether the same product is preserved, and mention any visible text, watermark, or edge problems."`,
      },
    ],
  },
  faq: {
    eyebrow: "FAQ",
    title: "Pertanyaan yang biasanya menyusul",
    items: [
      {
        question: "Kapan latar putih lebih baik daripada transparansi?",
        answer:
          "Gunakan putih ketika tujuannya adalah katalog, marketplace, atau saluran lain yang mengharapkan gambar produk bersih tanpa keputusan styling yang masih terbuka. Gunakan transparansi ketika aset masih perlu ditempatkan di beberapa permukaan berbeda nanti.",
      },
      {
        question: "Kapan latar putih lebih baik daripada adegan studio bergaya?",
        answer:
          "Gunakan putih ketika konsistensi, kepatuhan, atau netralitas visual lebih penting daripada suasana. Gunakan adegan bergaya ketika halaman membutuhkan pembingkaian editorial lebih kuat atau sinyal cerita produk yang lebih kuat.",
      },
      {
        question: "Model AnyCap mana yang harus saya pakai dulu untuk edit produk latar putih?",
        answer:
          "Gunakan Nano Banana Pro terlebih dahulu ketika foto produk sumber sudah ada dan tugasnya adalah mempertahankan barang asli sambil menyederhanakan lingkungan. Gunakan Nano Banana 2 ketika Anda ingin iterasi lebih cepat atau beberapa varian listing. Gunakan Seedream 5 ketika Anda masih memerlukan foto produk asli sebelum pembersihan dimulai.",
      },
      {
        question: "Bisakah AnyCap membantu memeriksa apakah hasilnya masih terlihat siap marketplace?",
        answer:
          "Ya. Setelah pembuatan, Anda dapat memakai pembacaan gambar AnyCap untuk memeriksa apakah produk yang sama dipertahankan, apakah tepi masih terlihat bersih, dan apakah ada teks atau watermark terlihat yang diperkenalkan.",
      },
    ],
  },
  nextMove: {
    eyebrow: "Langkah berikutnya",
    title: "Lanjut ke alur kerja yang benar-benar dibutuhkan saluran",
    cards: [
      {
        title: "Cara mengubah latar foto",
        href: "/learn/how-to-change-photo-background",
        body: "Gunakan alur kerja yang lebih luas ini ketika targetnya adalah adegan studio atau penggantian kontekstual alih-alih putih murni.",
      },
      {
        title: "Cara membuat gambar transparan",
        href: "/learn/how-to-make-image-transparent",
        body: "Gunakan ini ketika tujuan menginginkan produk diisolasi untuk dipakai ulang di beberapa tata letak berbeda nanti.",
      },
      {
        title: "Nano Banana Pro",
        href: "/models/nano-banana-pro",
        body: "Pelajari lebih dalam model yang saat ini cocok untuk loop revisi pelestarian sumber terkuat untuk pembersihan produk.",
      },
      {
        title: "Instal AnyCap",
        href: "/guides/install-anycap",
        body: "Pindah ke sini ketika Anda ingin jalur terpendek dari halaman ini ke pengaturan CLI yang berfungsi.",
      },
    ],
  },
};

const contentByLocale = {
  en: enContent,
  "pt-br": ptBrContent,
  id: idContent,
  de: enContent,
} satisfies Record<SiteLocale, WhiteBackgroundPageContent>;

function getContent(locale: SiteLocale): WhiteBackgroundPageContent {
  return contentByLocale[locale] ?? contentByLocale[defaultLocale];
}

export function getHowToMakeBackgroundWhiteForProductPhotosMetadata(
  locale: SiteLocale
): Metadata {
  const content = getContent(locale);

  return {
    title: content.metadata.title,
    description: content.metadata.description,
    alternates: { canonical: HOW_TO_MAKE_BACKGROUND_WHITE_FOR_PRODUCT_PHOTOS_PATH },
    openGraph: {
      type: "website",
      locale: getLocaleConfig(locale).ogLocale,
      url: HOW_TO_MAKE_BACKGROUND_WHITE_FOR_PRODUCT_PHOTOS_PATH,
      siteName: siteConfig.siteName,
      title: content.metadata.openGraphTitle,
      description: content.metadata.openGraphDescription,
    },
  };
}

export function getHowToMakeBackgroundWhiteForProductPhotosPageData(locale: SiteLocale) {
  const content = getContent(locale);

  return {
    ...content,
    articleJsonLd: createTechArticleJsonLd({
      headline: content.metadata.articleHeadline,
      description: content.metadata.articleDescription,
      path: HOW_TO_MAKE_BACKGROUND_WHITE_FOR_PRODUCT_PHOTOS_PATH,
      locale,
      about: [...content.metadata.articleAbout],
      keywords: [...content.metadata.articleKeywords],
      datePublished: LAST_UPDATED_ISO,
      dateModified: LAST_UPDATED_ISO,
    }),
    faqJsonLd: createFaqPageJsonLd(content.faq.items),
  };
}
