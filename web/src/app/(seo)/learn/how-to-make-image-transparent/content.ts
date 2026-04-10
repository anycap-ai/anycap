import type { Metadata } from "next";
import type { LearnProofImage } from "@/components/seo/LearnProofShowcase";
import { createFaqPageJsonLd, createTechArticleJsonLd } from "@/lib/schema";
import { defaultLocale, getLocaleConfig, siteConfig, type SiteLocale } from "@/lib/site";

export const HOW_TO_MAKE_IMAGE_TRANSPARENT_PATH = "/learn/how-to-make-image-transparent";

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

type TransparentImagePageContent = {
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

const enContent: TransparentImagePageContent = {
  metadata: {
    title: "How to Make an Image Transparent with an AI Agent",
    description:
      "Use AnyCap to turn an existing image into a transparent PNG-ready cutout, inspect the edges with image reading, and keep the asset reusable for product, docs, and content workflows.",
    openGraphTitle: "How to Make an Image Transparent with an AI Agent",
    openGraphDescription:
      "A workflow guide for using AnyCap to remove a background, inspect the cutout, and keep the final asset reusable instead of stopping at a one-click remover.",
    articleHeadline: "How to Make an Image Transparent with an AI Agent",
    articleDescription:
      "A practical workflow for turning an existing image into a transparent-background cutout through AnyCap image editing and image understanding.",
    articleAbout: [
      "Transparent background",
      "Background removal",
      "Image editing",
      "Image understanding",
      "AI agents",
      "Product cutouts",
    ],
    articleKeywords: [
      "make image transparent",
      "make background transparent",
      "transparent png",
      "remove background from image",
      "background remover workflow",
    ],
  },
  breadcrumbItems: [
    { name: "Home", href: "/" },
    { name: "Learn", href: "/learn" },
    {
      name: "How to Make an Image Transparent",
      href: HOW_TO_MAKE_IMAGE_TRANSPARENT_PATH,
    },
  ],
  eyebrow: "Learn",
  lastUpdatedLabel: "Last updated April 10, 2026",
  hero: {
    titleLine1: "How to make an image transparent",
    titleLine2: "without treating it like a dead-end export",
    introBeforeFirstLink:
      "If you are trying to make an image transparent, the useful question is not whether another background remover exists. It is whether your agent can isolate the subject, inspect the edges, and keep the final asset reusable for docs, product pages, and content workflows. That is where",
    firstLinkLabel: "AnyCap image generation",
    introBetweenLinks: "plus",
    secondLinkLabel: "image understanding",
    introAfterSecondLink: "changes the workflow.",
    summaryLabel: "Answer-first summary",
    summaryText:
      "A useful transparent-image workflow is not only background removal. It is subject extraction, edge inspection, and output reuse. AnyCap helps the agent run that loop in one place: edit the image, inspect the result, and branch into the exact version the destination needs, whether that is a transparent cutout or a white background variant.",
  },
  proof: {
    eyebrow: "Generated proof",
    title: "Source image in, transparent cutout out",
    intro:
      "This page uses a real before-and-after proof block instead of stock art. The left frame is the source image. The right frame is a real transparent PNG generated from that same source asset so the isolation step is visible at a glance.",
    promptLabel: "Edit prompt used with AnyCap",
    prompt:
      "remove the entire desk background and return only the same running shoe as a clean product cutout on a transparent background, preserve the exact shoe shape, laces, sole texture, and stitching, remove the mug and plant completely, no floor shadow, no extra objects, blank label, no text, no watermark",
    signalsLabel: "Why this proof matters",
    signals: [
      "It turns the page's main claim into something visual: background removal is more useful when the subject still looks clean enough to reuse.",
      "The checkerboard preview makes the subject-isolation step legible instead of forcing the reader to imagine what changed.",
      "It shows why the AnyCap workflow is not only one export step, but also a QA and reuse step.",
    ],
    caption:
      "The left image is the source draft. The right image is the final transparent PNG cutout generated from that same source asset for this page.",
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
        src: `${PAGE_RESOURCE_BASE}/how-to-make-image-transparent-cutout-true-final.png`,
        alt: "Transparent PNG cutout of the same off-white running shoe with the background fully removed.",
        width: 2400,
        height: 1792,
        label: "Transparent PNG cutout",
        frameVariant: "checkerboard",
      },
    ],
  },
  quickAnswer: {
    eyebrow: "Quick answer",
    title: "The practical answer is extraction plus QA",
    intro:
      "Making an image transparent is usually framed as a button click. In practice, the useful part is whether the subject survives the cleanup well enough to be reused in the next step. That is why the better workflow is extraction plus inspection, not export alone.",
    takeaways: [
      "Most 'make image transparent' jobs are really subject extraction plus edge QA, not just one click on a remover site.",
      "The strongest AnyCap workflow is to revise the source image, inspect the output with image reading, and keep the final file reusable as a PNG-ready cutout.",
      "The same workflow can branch into a white-background version, a replacement-background version, or a clean product asset for docs and listings.",
    ],
    cards: [
      {
        title: "Transparent background",
        body: "Best when the same asset needs to land on multiple surfaces later, such as docs, decks, product listings, or page layouts with their own background treatment.",
      },
      {
        title: "White background",
        body: "Best when the destination wants a marketplace-style image, a catalog look, or a clean studio result where transparency adds no extra value.",
      },
    ],
  },
  workflow: {
    eyebrow: "Workflow",
    title: "Five steps from source image to reusable asset",
    stepLabel: "Step",
    steps: [
      {
        title: "Start with the real source image",
        body: "Use the product photo, screenshot, or visual draft you actually want to reuse. The higher-fit job here is cutout cleanup, not generating a random replacement subject.",
      },
      {
        title: "Ask for a transparent-background cutout",
        body: "Run an image-to-image edit that preserves the subject but removes the surrounding desk, room, or scene. The prompt should say what must stay, not only what should disappear.",
      },
      {
        title: "Inspect the edges with image reading",
        body: "Check for leftover fragments around hair, laces, fingers, glass, or packaging edges. The point is not only that the background is gone, but that the subject still looks usable.",
      },
      {
        title: "Branch into the version the destination needs",
        body: "From the same source, you can keep the transparent cutout, make a white-background marketplace image, or replace the background entirely for a new context.",
      },
      {
        title: "Reuse the asset in the next workflow",
        body: "Keep the output local for docs and page work, or hand it off to another AnyCap step when you need storage, page publishing, or a follow-on image revision.",
      },
    ],
  },
  comparison: {
    eyebrow: "Comparison",
    title: "Why this is stronger than a one-click remover mindset",
    shallowLabel: "Shallow default",
    workflowLabel: "AnyCap workflow",
    rows: [
      {
        lens: "What counts as success",
        shallow: "The export button worked.",
        workflow: "The subject is isolated cleanly, the edges still hold up, and the asset is usable in the next step.",
      },
      {
        lens: "Quality control",
        shallow: "You eyeball it once and hope the crop is good enough.",
        workflow: "The agent can inspect the cutout and catch leftover background fragments or awkward edge damage.",
      },
      {
        lens: "Follow-on edits",
        shallow: "You often need to restart in another tool for a white background or a new scene.",
        workflow: "The same AnyCap image-edit loop can branch into transparent, white-background, or replacement-background versions.",
      },
      {
        lens: "Reusability",
        shallow: "The output is treated like a final download.",
        workflow: "The asset stays inside a broader agent workflow for docs, listings, publishing, and later revisions.",
      },
    ],
  },
  modelChoice: {
    eyebrow: "Model choice",
    title: "Pick the model based on where the job starts",
    cards: [
      {
        title: "Nano Banana Pro",
        label: "Best first choice for cutouts",
        body: "Use this when the source image already exists and the real job is to preserve the subject while cleaning or removing the background.",
        href: "/models/nano-banana-pro",
      },
      {
        title: "Nano Banana 2",
        label: "Best for faster iteration",
        body: "Use this when you want multiple cleanup passes quickly or when the workflow may branch into several product or content variants.",
        href: "/models/nano-banana-2",
      },
      {
        title: "Seedream 5",
        label: "Best when you still need the source image",
        body: "Use this when there is no starting asset yet and you want a stronger first-pass product image before the cutout workflow begins.",
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
        body: "Nano Banana Pro and Nano Banana 2 were checked against the live schema, and the current image-to-image flow uses the `images` parameter instead of older prompt guesses.",
      },
      {
        title: "Proof images generated",
        body: "The source image and cutout shown on this page were generated during the live workflow through AnyCap rather than mocked after the fact in a separate design tool.",
      },
      {
        title: "Output inspected",
        body: "The final cutout file was verified as an RGBA PNG with a real alpha channel, then composited onto a light background and checked through image reading to confirm the edge looked clean without a visible green halo.",
      },
    ],
  },
  cli: {
    eyebrow: "CLI examples",
    title: "Example commands that match the current schema",
    examples: [
      {
        title: "Create a transparent cutout",
        code: `anycap image generate \\
  --model nano-banana-pro \\
  --mode image-to-image \\
  --prompt "remove the background and return only the same subject on a transparent background, preserve the exact shape and edges, no extra objects, no text, no watermark" \\
  --param images=./source-product.png \\
  --param aspect_ratio=4:3 \\
  --param resolution=2k \\
  -o transparent-cutout.png`,
      },
      {
        title: "Create a white-background version from the same source",
        code: `anycap image generate \\
  --model nano-banana-pro \\
  --mode image-to-image \\
  --prompt "replace the background with a clean white studio backdrop, preserve the exact subject and edges, centered marketplace-ready product photo, no text, no watermark" \\
  --param images=./source-product.png \\
  --param aspect_ratio=4:3 \\
  --param resolution=2k \\
  -o white-background-product.png`,
      },
      {
        title: "QA the cutout with image reading",
        code: `anycap actions image-read \\
  --file ./transparent-cutout.png \\
  --instruction "Describe the image, say whether the subject edges look clean, and mention any leftover background fragments, visible text, or watermark."`,
      },
    ],
  },
  faq: {
    eyebrow: "FAQ",
    title: "Questions that usually come up next",
    items: [
      {
        question: "Is making an image transparent the same as making the background white?",
        answer:
          "No. A transparent image keeps the background removed so the asset can sit on different surfaces later. A white background version is better when the destination needs a clean catalog or marketplace photo.",
      },
      {
        question: "Which AnyCap model should I use first for background removal?",
        answer:
          "Use Nano Banana Pro first when you already have a source image and want the subject preserved through an image-to-image edit. Use Nano Banana 2 when speed and multiple cleanup passes matter more than the strongest single revision. Use Seedream 5 only when you still need to create the source image itself.",
      },
      {
        question: "Why use an agent workflow instead of a one-click remover?",
        answer:
          "Because the job usually does not end at 'background removed.' You often need to inspect the edges, confirm there is no leftover clutter, make a white-background version for another channel, and reuse the asset across docs, pages, or product listings.",
      },
      {
        question: "Can AnyCap check whether the cutout actually looks clean?",
        answer:
          "Yes. After generation, you can use AnyCap image reading to inspect the result and ask whether the subject edges are intact, whether stray background fragments remain, and whether there is any visible text or watermark.",
      },
    ],
  },
  nextMove: {
    eyebrow: "Next move",
    title: "Go deeper from the workflow that fits",
    cards: [
      {
        title: "How to Change a Photo Background",
        href: "/learn/how-to-change-photo-background",
        body: "Move here when the next step is replacing the removed background with a studio, pedestal, or contextual scene.",
      },
      {
        title: "How to Make Background White for Product Photos",
        href: "/learn/how-to-make-background-white-for-product-photos",
        body: "Use this follow-on workflow when the transparent cutout needs to become a marketplace or catalog-style white-background asset.",
      },
      {
        title: "Nano Banana Pro",
        href: "/models/nano-banana-pro",
        body: "Go deeper on the model that currently fits the strongest subject-preserving cutout workflow.",
      },
      {
        title: "Install AnyCap",
        href: "/guides/install-anycap",
        body: "Move here when you want the shortest path from this page to a working CLI setup.",
      },
    ],
  },
};

const ptBrContent: TransparentImagePageContent = {
  metadata: {
    title: "Como deixar uma imagem transparente com IA",
    description:
      "Use o AnyCap para transformar uma imagem existente em um recorte com fundo transparente, revisar as bordas com leitura de imagem e manter o asset reutilizável para produto, docs e conteúdo.",
    openGraphTitle: "Como deixar uma imagem transparente com IA",
    openGraphDescription:
      "Um guia prático para remover o fundo de uma imagem com AnyCap, revisar o recorte e manter o resultado reutilizável em vez de parar em um botão de exportar.",
    articleHeadline: "Como deixar uma imagem transparente com IA",
    articleDescription:
      "Um fluxo prático para transformar uma imagem existente em um recorte com fundo transparente usando edição e leitura de imagem com AnyCap.",
    articleAbout: [
      "Fundo transparente",
      "Remoção de fundo",
      "Edição de imagem",
      "Leitura de imagem",
      "Agentes de IA",
      "Recortes de produto",
    ],
    articleKeywords: [
      "como deixar imagem transparente",
      "remover fundo de imagem",
      "png transparente",
      "como remover fundo de foto no iphone",
      "recorte com fundo transparente",
    ],
  },
  breadcrumbItems: [
    { name: "Início", href: "/" },
    { name: "Learn", href: "/learn" },
    {
      name: "Como deixar uma imagem transparente",
      href: HOW_TO_MAKE_IMAGE_TRANSPARENT_PATH,
    },
  ],
  eyebrow: "Learn",
  lastUpdatedLabel: "Atualizado em 10 de abril de 2026",
  hero: {
    titleLine1: "Como deixar uma imagem transparente",
    titleLine2: "sem tratar isso como um export final",
    introBeforeFirstLink:
      "Se você quer deixar uma imagem transparente, a pergunta útil não é só se existe mais um removedor de fundo. A pergunta é se o agente consegue isolar o assunto, revisar as bordas e manter o asset reutilizável em docs, páginas de produto e fluxos de conteúdo. É aí que",
    firstLinkLabel: "a geração de imagem do AnyCap",
    introBetweenLinks: "junto com",
    secondLinkLabel: "a leitura de imagem",
    introAfterSecondLink: "muda o fluxo.",
    summaryLabel: "Resposta curta",
    summaryText:
      "Um bom fluxo para imagem transparente não é apenas remover o fundo. É extrair o assunto, revisar as bordas e manter o arquivo reutilizável. Com AnyCap, o agente pode editar a imagem, revisar o resultado e ramificar para a versão exata que o destino precisa, seja um recorte transparente ou uma variação com fundo branco.",
  },
  proof: {
    eyebrow: "Prova gerada",
    title: "A imagem fonte entra, o recorte transparente sai",
    intro:
      "Esta página usa um bloco real de antes e depois, não arte genérica. À esquerda está a imagem fonte. À direita está um PNG transparente gerado a partir dessa mesma imagem, para que a etapa de isolamento fique legível de imediato.",
    promptLabel: "Prompt de edição usado com AnyCap",
    prompt:
      "remove the entire desk background and return only the same running shoe as a clean product cutout on a transparent background, preserve the exact shoe shape, laces, sole texture, and stitching, remove the mug and plant completely, no floor shadow, no extra objects, blank label, no text, no watermark",
    signalsLabel: "Por que esta prova importa",
    signals: [
      "Transforma a tese principal da página em algo visível: remover fundo fica mais útil quando o assunto ainda parece limpo o suficiente para ser reutilizado.",
      "O preview com checkerboard deixa a etapa de isolamento legível sem obrigar o leitor a imaginar o que mudou.",
      "Mostra por que o fluxo com AnyCap não é só uma exportação, mas também um passo de QA e reuso.",
    ],
    caption:
      "À esquerda está a imagem fonte. À direita está o PNG transparente final gerado a partir desse mesmo asset para esta página.",
    images: [
      {
        src: `${PAGE_RESOURCE_BASE}/how-to-make-image-transparent-source.webp`,
        alt: "Foto fonte de um tênis off-white sobre uma mesa de madeira com caneca e planta ao fundo.",
        width: 2304,
        height: 1728,
        label: "Imagem fonte",
        frameVariant: "plain",
      },
      {
        src: `${PAGE_RESOURCE_BASE}/how-to-make-image-transparent-cutout-true-final.png`,
        alt: "Recorte PNG transparente do mesmo tênis off-white com o fundo completamente removido.",
        width: 2400,
        height: 1792,
        label: "PNG transparente",
        frameVariant: "checkerboard",
      },
    ],
  },
  quickAnswer: {
    eyebrow: "Resposta rápida",
    title: "Na prática, a resposta é extração mais QA",
    intro:
      "Muitas vezes, deixar uma imagem transparente é tratado como clique de botão. Na prática, o que importa é se o assunto sobrevive à limpeza com qualidade suficiente para ser reutilizado na próxima etapa. Por isso o melhor fluxo é extração mais revisão, e não exportar por exportar.",
    takeaways: [
      "Boa parte das buscas por `imagem transparente` são, na prática, extração do assunto mais QA de borda.",
      "O fluxo mais forte com AnyCap é editar a imagem fonte, revisar a saída com leitura de imagem e manter o arquivo final reutilizável como recorte em PNG.",
      "O mesmo fluxo ainda pode se ramificar para uma versão com fundo branco ou para uma troca completa de fundo, se o destino pedir.",
    ],
    cards: [
      {
        title: "Fundo transparente",
        body: "Melhor quando o mesmo asset precisa pousar em várias superfícies depois, como docs, decks, listings de produto ou layouts de página com tratamento próprio de fundo.",
      },
      {
        title: "Fundo branco",
        body: "Melhor quando o destino pede imagem de marketplace, visual de catálogo ou um resultado de estúdio limpo em que transparência não traz valor extra.",
      },
    ],
  },
  workflow: {
    eyebrow: "Fluxo",
    title: "Cinco passos da imagem fonte ao asset reutilizável",
    stepLabel: "Passo",
    steps: [
      {
        title: "Comece com a imagem fonte real",
        body: "Use a foto de produto, screenshot ou rascunho visual que você realmente quer reutilizar. Aqui o trabalho de melhor encaixe é limpar e recortar, não gerar um assunto aleatório do zero.",
      },
      {
        title: "Peça um recorte com fundo transparente",
        body: "Rode uma edição image-to-image que preserve o assunto e remova a mesa, o ambiente ou a cena ao redor. O prompt precisa dizer o que deve ficar, não só o que deve sumir.",
      },
      {
        title: "Revise as bordas com leitura de imagem",
        body: "Cheque se restaram fragmentos em cabelo, cadarço, dedos, vidro ou bordas de embalagem. O ponto não é só que o fundo sumiu, mas que o assunto continua utilizável.",
      },
      {
        title: "Ramifique para a versão que o destino precisa",
        body: "A partir da mesma fonte, você pode manter o recorte transparente, criar uma versão com fundo branco para marketplace ou trocar o fundo por outro contexto.",
      },
      {
        title: "Reuse o asset na próxima etapa",
        body: "Mantenha a saída local para docs e páginas, ou passe o arquivo para outra etapa do AnyCap quando precisar de storage, publishing ou uma nova revisão.",
      },
    ],
  },
  comparison: {
    eyebrow: "Comparação",
    title: "Por que isso é mais forte do que pensar em um removedor de um clique",
    shallowLabel: "Atalho superficial",
    workflowLabel: "Fluxo com AnyCap",
    rows: [
      {
        lens: "O que conta como sucesso",
        shallow: "O botão de exportar funcionou.",
        workflow: "O assunto foi isolado com limpeza, as bordas continuam boas e o asset segue utilizável na próxima etapa.",
      },
      {
        lens: "Controle de qualidade",
        shallow: "Você olha rapidamente e torce para o recorte estar bom o suficiente.",
        workflow: "O agente pode revisar o recorte e identificar fragmentos restantes de fundo ou danos estranhos nas bordas.",
      },
      {
        lens: "Edições seguintes",
        shallow: "Você costuma recomeçar em outra ferramenta para fazer uma versão branca ou uma nova cena.",
        workflow: "O mesmo loop de edição de imagem com AnyCap pode se ramificar para transparente, fundo branco ou troca completa de fundo.",
      },
      {
        lens: "Reusabilidade",
        shallow: "A saída é tratada como um download final.",
        workflow: "O asset continua dentro de um fluxo maior para docs, listings, publicação e revisões futuras.",
      },
    ],
  },
  modelChoice: {
    eyebrow: "Escolha do modelo",
    title: "Escolha o modelo de acordo com o ponto de partida do trabalho",
    cards: [
      {
        title: "Nano Banana Pro",
        label: "Melhor primeira escolha para recortes",
        body: "Use quando a imagem fonte já existe e o trabalho real é preservar o assunto enquanto o fundo é limpo ou removido.",
        href: "/models/nano-banana-pro",
      },
      {
        title: "Nano Banana 2",
        label: "Melhor para iteração mais rápida",
        body: "Use quando você quer várias passadas de cleanup com mais velocidade ou quando o fluxo pode se ramificar para várias versões de produto e conteúdo.",
        href: "/models/nano-banana-2",
      },
      {
        title: "Seedream 5",
        label: "Melhor quando a imagem fonte ainda não existe",
        body: "Use quando ainda não há um asset inicial e você quer gerar uma primeira imagem melhor antes de começar o fluxo de recorte.",
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
        body: "Nano Banana Pro e Nano Banana 2 foram checados contra a schema ao vivo, e o fluxo atual de image-to-image usa `images` em vez de suposições antigas de prompt.",
      },
      {
        title: "Imagens de prova geradas",
        body: "A imagem fonte e o recorte mostrados nesta página foram gerados no fluxo ao vivo com AnyCap, e não montados depois em outra ferramenta de design.",
      },
      {
        title: "Saída revisada",
        body: "O arquivo final foi verificado como PNG RGBA com canal alpha real, depois composto sobre um fundo claro e revisado com leitura de imagem para confirmar que a borda parecia limpa sem halo visível.",
      },
    ],
  },
  cli: {
    eyebrow: "Exemplos de CLI",
    title: "Comandos de exemplo alinhados à schema atual",
    examples: [
      {
        title: "Criar um recorte transparente",
        code: `anycap image generate \\
  --model nano-banana-pro \\
  --mode image-to-image \\
  --prompt "remova o fundo e devolva apenas o mesmo assunto em um fundo transparente, preserve a forma exata e as bordas, sem objetos extras, sem texto, sem watermark" \\
  --param images=./source-product.png \\
  --param aspect_ratio=4:3 \\
  --param resolution=2k \\
  -o recorte-transparente.png`,
      },
      {
        title: "Criar uma versão com fundo branco a partir da mesma fonte",
        code: `anycap image generate \\
  --model nano-banana-pro \\
  --mode image-to-image \\
  --prompt "troque o fundo por um estúdio branco limpo, preserve o mesmo assunto e as bordas, foto centralizada pronta para marketplace, sem texto, sem watermark" \\
  --param images=./source-product.png \\
  --param aspect_ratio=4:3 \\
  --param resolution=2k \\
  -o produto-fundo-branco.png`,
      },
      {
        title: "Fazer QA do recorte com leitura de imagem",
        code: `anycap actions image-read \\
  --file ./recorte-transparente.png \\
  --instruction "Descreva a imagem, diga se as bordas do assunto parecem limpas e mencione qualquer fragmento restante de fundo, texto visível ou watermark."`,
      },
    ],
  },
  faq: {
    eyebrow: "FAQ",
    title: "Perguntas que normalmente aparecem em seguida",
    items: [
      {
        question: "Deixar uma imagem transparente é a mesma coisa que colocar fundo branco?",
        answer:
          "Não. Uma imagem transparente mantém o fundo removido para que o asset possa pousar em superfícies diferentes depois. A versão com fundo branco é melhor quando o destino quer uma foto limpa de catálogo ou marketplace.",
      },
      {
        question: "Qual modelo do AnyCap devo usar primeiro para remover fundo?",
        answer:
          "Comece com Nano Banana Pro quando você já tem a imagem fonte e quer preservar o assunto em uma edição image-to-image. Use Nano Banana 2 quando velocidade e várias passadas de cleanup importam mais do que maximizar a primeira revisão. Use Seedream 5 apenas quando a imagem fonte ainda precisa ser criada.",
      },
      {
        question: "Por que usar um fluxo com agente em vez de um removedor de fundo de um clique?",
        answer:
          "Porque o trabalho normalmente não termina em `fundo removido`. Muitas vezes você ainda precisa revisar bordas, confirmar que não restou sujeira, gerar uma versão com fundo branco para outro canal e manter o asset reutilizável em docs, páginas ou listings.",
      },
      {
        question: "O AnyCap consegue revisar se o recorte ficou realmente limpo?",
        answer:
          "Sim. Depois da geração, você pode usar leitura de imagem no AnyCap para revisar se as bordas do assunto continuam intactas, se restaram fragmentos de fundo e se há texto visível ou watermark.",
      },
    ],
  },
  nextMove: {
    eyebrow: "Próximo passo",
    title: "Aprofunde a partir do fluxo que mais encaixa",
    cards: [
      {
        title: "Como trocar o fundo de uma foto",
        href: "/learn/how-to-change-photo-background",
        body: "Vá para cá quando o próximo passo for substituir o fundo removido por um estúdio, pedestal ou cena contextual.",
      },
      {
        title: "Como deixar fundo branco em fotos de produto",
        href: "/learn/how-to-make-background-white-for-product-photos",
        body: "Use este fluxo complementar quando o recorte transparente precisar virar um asset com fundo branco para marketplace ou catálogo.",
      },
      {
        title: "Nano Banana Pro",
        href: "/models/nano-banana-pro",
        body: "Aprofunde no modelo que hoje encaixa melhor no fluxo de recorte com preservação do assunto.",
      },
      {
        title: "Instalar AnyCap",
        href: "/guides/install-anycap",
        body: "Siga por aqui quando quiser sair desta página com um CLI funcionando no seu ambiente.",
      },
    ],
  },
};

const contentByLocale = {
  en: enContent,
  "pt-br": ptBrContent,
  id: enContent,
} satisfies Record<SiteLocale, TransparentImagePageContent>;

function getContent(locale: SiteLocale): TransparentImagePageContent {
  return contentByLocale[locale] ?? contentByLocale[defaultLocale];
}

export function getHowToMakeImageTransparentMetadata(locale: SiteLocale): Metadata {
  const content = getContent(locale);

  return {
    title: content.metadata.title,
    description: content.metadata.description,
    alternates: { canonical: HOW_TO_MAKE_IMAGE_TRANSPARENT_PATH },
    openGraph: {
      type: "website",
      locale: getLocaleConfig(locale).ogLocale,
      url: HOW_TO_MAKE_IMAGE_TRANSPARENT_PATH,
      siteName: siteConfig.siteName,
      title: content.metadata.openGraphTitle,
      description: content.metadata.openGraphDescription,
    },
  };
}

export function getHowToMakeImageTransparentPageData(locale: SiteLocale) {
  const content = getContent(locale);

  return {
    ...content,
    articleJsonLd: createTechArticleJsonLd({
      headline: content.metadata.articleHeadline,
      description: content.metadata.articleDescription,
      path: HOW_TO_MAKE_IMAGE_TRANSPARENT_PATH,
      locale,
      about: [...content.metadata.articleAbout],
      keywords: [...content.metadata.articleKeywords],
      datePublished: LAST_UPDATED_ISO,
      dateModified: LAST_UPDATED_ISO,
    }),
    faqJsonLd: createFaqPageJsonLd(content.faq.items),
  };
}
