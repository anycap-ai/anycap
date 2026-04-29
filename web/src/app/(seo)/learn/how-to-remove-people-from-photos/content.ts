import type { Metadata } from "next";
import type { LearnProofImage } from "@/components/seo/LearnProofShowcase";
import { createFaqPageJsonLd, createTechArticleJsonLd } from "@/lib/schema";
import { getLocaleConfig, siteConfig, type SiteLocale } from "@/lib/site";

export const HOW_TO_REMOVE_PEOPLE_FROM_PHOTOS_PATH = "/learn/how-to-remove-people-from-photos";

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

type RemovePeoplePageContent = {
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

const enContent: RemovePeoplePageContent = {
  metadata: {
    title: "How to Remove People from Photos with an AI Agent",
    description:
      "Use AnyCap to remove an unwanted person from a photo, inspect the reconstructed scene, and keep the result usable instead of settling for a blurry patch.",
    openGraphTitle: "How to Remove People from Photos with an AI Agent",
    openGraphDescription:
      "A workflow guide for removing one person from a photo through AnyCap image editing and image understanding while keeping the rest of the scene coherent.",
    articleHeadline: "How to Remove People from Photos with an AI Agent",
    articleDescription:
      "A practical workflow for removing people from photos through AnyCap image editing plus image QA.",
    articleAbout: [
      "Person removal",
      "Object removal",
      "Travel photo cleanup",
      "Image editing",
      "Image understanding",
      "AI agents",
    ],
    articleKeywords: [
      "remove people from photos",
      "remove person from photo",
      "erase person from picture",
      "photo cleanup ai",
      "remove unwanted person from photo",
    ],
  },
  breadcrumbItems: [
    { name: "Home", href: "/" },
    { name: "Learn", href: "/learn" },
    {
      name: "How to Remove People from Photos",
      href: HOW_TO_REMOVE_PEOPLE_FROM_PHOTOS_PATH,
    },
  ],
  eyebrow: "Learn",
  lastUpdatedLabel: "Last updated April 10, 2026",
  hero: {
    titleLine1: "How to remove people from photos",
    titleLine2: "without turning the background into mush",
    introBeforeFirstLink:
      "If you want to remove someone from a photo, the useful job is not only to delete a body-shaped area. It is to reconstruct the scene so the image still feels like one believable photo. That is where",
    firstLinkLabel: "AnyCap image generation",
    introBetweenLinks: "plus",
    secondLinkLabel: "image understanding",
    introAfterSecondLink: "gives the agent a stronger workflow than a one-click magic eraser.",
    summaryLabel: "Answer-first summary",
    summaryText:
      "A useful people-removal workflow is reconstruction plus QA. AnyCap lets the agent remove the unwanted person, inspect the repaired background, and decide whether the frame is actually ready to reuse in a listing, a blog post, or a travel photo set.",
  },
  proof: {
    eyebrow: "Generated proof",
    title: "A real tourist-overlook cleanup, not a mockup",
    intro:
      "This page uses a real proof pair generated with AnyCap. The left frame is the original overlook photo with two foreground subjects. The right frame removes the woman in the red jacket while keeping the remaining traveler, the stone railing, and the ocean scene coherent.",
    promptLabel: "Edit prompt used with AnyCap",
    prompt:
      "remove the woman in the red jacket completely, keep the man in the white shirt exactly where he is, reconstruct the stone railing naturally behind her, preserve the ocean cliff overlook and sunset lighting, no extra people, no text, no watermark",
    signalsLabel: "Why this proof matters",
    signals: [
      "It shows a real reconstruction problem instead of a trivial crop or full regeneration.",
      "The repaired railing and coastline make the cleanup legible at a glance.",
      "It demonstrates the stronger claim AnyCap can honestly support: removal plus inspection, not blind erasing.",
    ],
    caption:
      "The left image is the original photo. The right image is the AnyCap result with one person removed and the scene reconstructed from that same source image.",
    images: [
      {
        src: `${PAGE_RESOURCE_BASE}/pt-br-remove-people-source-2026-04-10.png`,
        alt: "Sunset coastal overlook photo with a woman in a red jacket and a man in a white shirt standing by a stone railing.",
        width: 1200,
        height: 896,
        label: "Source photo",
        frameVariant: "plain",
      },
      {
        src: `${PAGE_RESOURCE_BASE}/pt-br-remove-people-result-2026-04-10.png`,
        alt: "The same sunset overlook photo after the woman in the red jacket was removed and the stone railing was reconstructed.",
        width: 1200,
        height: 896,
        label: "Edited result",
        frameVariant: "plain",
      },
    ],
  },
  quickAnswer: {
    eyebrow: "Quick answer",
    title: "The hard part is scene repair, not deletion alone",
    intro:
      "Most people-removal tools are judged by whether the unwanted person disappears. In practice, the useful question is whether the frame still looks intact after the removal. That is why the stronger workflow is erase plus reconstruction plus QA.",
    takeaways: [
      "The prompt should say who must disappear and what parts of the photo must stay exactly the same.",
      "The repaired area matters more than the removal action itself because bad fill makes the edit obvious.",
      "A good workflow branches into a second cleanup pass when railings, horizon lines, or repeating textures still look off.",
    ],
    cards: [
      {
        title: "Travel photos",
        body: "Best when one extra tourist or passerby ruins an otherwise useful scenic photo.",
      },
      {
        title: "Listings and property shots",
        body: "Useful when the scene is right but one person makes the image feel staged, distracting, or unusable.",
      },
      {
        title: "Social and editorial reuse",
        body: "Strong when you want to keep the original photo composition but clean a single distracting subject before publishing.",
      },
    ],
  },
  workflow: {
    eyebrow: "Workflow",
    title: "Five steps from crowded frame to cleaner photo",
    stepLabel: "Step",
    steps: [
      {
        title: "Start with the photo that already works",
        body: "Use the image you actually want to keep. This workflow is strongest when the composition and lighting are already good and only one subject needs to go.",
      },
      {
        title: "Name the person to remove precisely",
        body: "Describe clothing, position, and relative location so the edit does not drift toward the wrong subject.",
      },
      {
        title: "Protect the parts that must stay",
        body: "Say what should remain intact, such as the horizon, railing, main subject, or camera framing.",
      },
      {
        title: "Inspect the repaired zone carefully",
        body: "Look for broken edges, cloned textures, warped railings, or lighting mismatches where the person used to be.",
      },
      {
        title: "Run a second pass only if needed",
        body: "If a small artifact remains, do a tighter cleanup prompt instead of regenerating the whole photo from scratch.",
      },
    ],
  },
  comparison: {
    eyebrow: "Why the workflow matters",
    title: "Button-click removal versus an agent workflow",
    shallowLabel: "One-click eraser",
    workflowLabel: "AnyCap workflow",
    rows: [
      {
        lens: "Main objective",
        shallow: "Make the unwanted person disappear fast, even if the repaired area looks obviously synthetic.",
        workflow: "Remove the person and keep the scene believable enough to reuse without embarrassment.",
      },
      {
        lens: "What stays protected",
        shallow: "Usually under-specified, so nearby subjects or background structure can drift.",
        workflow: "The prompt names the person to remove and the scene details that must remain unchanged.",
      },
      {
        lens: "Quality control",
        shallow: "The user visually checks the final frame and hopes nothing subtle broke.",
        workflow: "The agent can inspect the result with image reading and decide whether a tighter cleanup pass is needed.",
      },
    ],
  },
  modelChoice: {
    eyebrow: "Model choice",
    title: "The current AnyCap stack for people-removal workflows",
    cards: [
      {
        label: "Best first pass",
        title: "Nano Banana Pro",
        href: "/models/nano-banana-pro",
        body: "The best first choice when you already have the source photo and want a stronger person-removal edit without losing the surrounding scene.",
      },
      {
        label: "Fast iteration",
        title: "Nano Banana 2",
        href: "/models/nano-banana-2",
        body: "Useful when you want several cleanup variations quickly and can trade a little fidelity for faster branching.",
      },
      {
        label: "QA layer",
        title: "Image Understanding",
        href: "/capabilities/image-understanding",
        body: "Use AnyCap image reading after the edit to check whether the remaining frame still looks coherent and artifact-free.",
      },
    ],
  },
  validation: {
    eyebrow: "What to validate",
    title: "Four checks before you call the photo done",
    cards: [
      {
        title: "Background continuity",
        body: "Look at the exact area where the removed person stood and confirm the fill matches nearby stone, path, sky, or water patterns.",
      },
      {
        title: "Protected subject still intact",
        body: "If one person stays in frame, confirm pose, clothing, scale, and edge detail were not warped by the edit.",
      },
      {
        title: "Lighting remains consistent",
        body: "The repaired area should follow the same sunset, shade, or indoor light direction as the original photo.",
      },
      {
        title: "No visible AI residue",
        body: "Check for duplicated textures, broken railings, invented limbs, random text, or watermark artifacts before export.",
      },
    ],
  },
  cli: {
    eyebrow: "CLI examples",
    title: "Example commands aligned with the current schema",
    examples: [
      {
        title: "Remove one person from a photo",
        code: `anycap image generate \\
  --model nano-banana-pro \\
  --mode image-to-image \\
  --prompt "remove the woman in the red jacket completely, keep the man in the white shirt exactly where he is, reconstruct the stone railing naturally behind her, preserve the ocean overlook and sunset light, no text, no watermark" \\
  --param images=./source-overlook.png \\
  --param aspect_ratio=4:3 \\
  --param resolution=2k \\
  -o cleaned-overlook.png`,
      },
      {
        title: "Run a tighter repair pass if artifacts remain",
        code: `anycap image generate \\
  --model nano-banana-2 \\
  --mode image-to-image \\
  --prompt "keep the same man and the same coastline, refine only the stone railing and path where the removed person stood, remove any duplicated texture or broken edge, no text, no watermark" \\
  --param images=./cleaned-overlook.png \\
  --param aspect_ratio=4:3 \\
  --param resolution=2k \\
  -o cleaned-overlook-pass-2.png`,
      },
      {
        title: "QA the repaired frame",
        code: `anycap actions image-read \\
  --file ./cleaned-overlook.png \\
  --instruction "Describe the image, confirm whether only one foreground traveler remains, and mention any visible artifact in the repaired railing, path, or coastline. Also call out any visible text or watermark."`,
      },
    ],
  },
  faq: {
    eyebrow: "FAQ",
    title: "Questions that usually come next",
    items: [
      {
        question: "Can AnyCap remove one person but keep another in the same photo?",
        answer:
          "Yes. The prompt should clearly identify the person to remove and the subject who must remain. The workflow works best when the protected person is described explicitly by position, clothing, or role in the frame.",
      },
      {
        question: "Is this better than a phone magic eraser?",
        answer:
          "It is better when the edit matters enough to inspect. A phone eraser may be enough for a casual draft, but AnyCap is stronger when you want a cleaner reconstruction and a QA pass before you reuse the image.",
      },
      {
        question: "What kind of photos are hardest for person removal?",
        answer:
          "Tight crowds, repeated patterns, and scenes where the removed person blocks important structure are harder. Railings, text, faces, and strong perspective lines are the places where you should inspect the result most carefully.",
      },
      {
        question: "Can I use the same workflow for removing emojis or objects too?",
        answer:
          "Usually yes. The same image-to-image plus QA workflow can be adapted to remove an emoji, sign, bag, or another unwanted object as long as the prompt clearly protects the parts of the scene that should stay.",
      },
    ],
  },
  nextMove: {
    eyebrow: "Next move",
    title: "Continue from the workflow that matches the next edit",
    cards: [
      {
        title: "How to Brighten a Photo Online",
        href: "/learn/how-to-brighten-a-photo-online",
        body: "Go here when the composition is already right and the next problem is harsh shadow or underexposure rather than a distracting person.",
      },
      {
        title: "How to Change a Photo Background",
        href: "/learn/how-to-change-photo-background",
        body: "Use this when the person stays but the environment around the subject needs to change.",
      },
      {
        title: "Nano Banana Pro",
        href: "/models/nano-banana-pro",
        body: "Read the model page when you want the current best-fit edit model for source-photo cleanup workflows.",
      },
      {
        title: "Install AnyCap",
        href: "/guides/install-anycap",
        body: "Start here when you want the CLI ready before trying the same workflow on your own images.",
      },
    ],
  },
};

const ptBrContent: RemovePeoplePageContent = {
  metadata: {
    title: "Como Remover Pessoas da Foto com um Agente de IA",
    description:
      "Use AnyCap para remover uma pessoa indesejada da foto, revisar a reconstrução do cenário e manter a imagem utilizável em vez de aceitar um borrão mal preenchido.",
    openGraphTitle: "Como Remover Pessoas da Foto com um Agente de IA",
    openGraphDescription:
      "Um guia prático para remover uma pessoa da foto com AnyCap, revisar a área reconstruída e preservar o resto da cena com aparência natural.",
    articleHeadline: "Como Remover Pessoas da Foto com um Agente de IA",
    articleDescription:
      "Um fluxo prático para remover pessoas de fotos com edição image-to-image no AnyCap e uma camada de QA com leitura de imagem.",
    articleAbout: [
      "Remover pessoas da foto",
      "Remover objeto de imagem",
      "Limpeza de foto de viagem",
      "Edição de imagem",
      "Leitura de imagem",
      "Agentes de IA",
    ],
    articleKeywords: [
      "remover pessoas da foto",
      "como apagar pessoa da foto",
      "remover pessoa da imagem",
      "tirar pessoa da foto com ia",
      "apagar pessoa da foto iphone",
    ],
  },
  breadcrumbItems: [
    { name: "Home", href: "/" },
    { name: "Learn", href: "/learn" },
    {
      name: "Como remover pessoas da foto",
      href: HOW_TO_REMOVE_PEOPLE_FROM_PHOTOS_PATH,
    },
  ],
  eyebrow: "Learn",
  lastUpdatedLabel: "Atualizado em 10 de abril de 2026",
  hero: {
    titleLine1: "Como remover pessoas da foto",
    titleLine2: "sem destruir o resto da cena",
    introBeforeFirstLink:
      "Quando alguém busca remover pessoas da foto, o trabalho útil não é só apagar uma silhueta. O que realmente importa é reconstruir o cenário de um jeito que a imagem continue parecendo uma foto só. É aí que",
    firstLinkLabel: "a geração de imagem do AnyCap",
    introBetweenLinks: "junto com",
    secondLinkLabel: "a leitura de imagem",
    introAfterSecondLink: "dá ao agente um fluxo melhor do que um borracha mágica genérica.",
    summaryLabel: "Resumo direto",
    summaryText:
      "Um fluxo útil para remover pessoas da foto é reconstrução mais QA. O AnyCap permite que o agente remova a pessoa indesejada, revise se a área reparada ficou coerente e decida se a imagem já está pronta para reuse em blog, listing, landing page ou álbum de viagem.",
  },
  proof: {
    eyebrow: "Proof gerado",
    title: "Um cleanup real em foto de mirante, não uma demo vazia",
    intro:
      "Esta página usa uma prova real gerada com AnyCap. O quadro da esquerda mostra a foto original com duas pessoas em primeiro plano. O quadro da direita remove a mulher de jaqueta vermelha e preserva o homem, o corrimão de pedra e a paisagem do mar de forma coerente.",
    promptLabel: "Prompt de edição usado com AnyCap",
    prompt:
      "remova completamente a mulher de jaqueta vermelha, mantenha o homem de camisa branca exatamente onde está, reconstrua o corrimão de pedra naturalmente atrás dela, preserve o mirante costeiro e a luz de pôr do sol, sem pessoas extras, sem texto, sem watermark",
    signalsLabel: "Por que esta prova importa",
    signals: [
      "Ela mostra um problema real de reconstrução, não só um crop ou uma geração do zero.",
      "O corrimão reparado e o cenário do mar deixam a qualidade da limpeza visível de imediato.",
      "Ela sustenta a promessa honesta do AnyCap: remoção com revisão, não apagamento cego.",
    ],
    caption:
      "A imagem da esquerda é a foto original. A da direita é o resultado gerado com AnyCap removendo uma das pessoas e reconstruindo a cena a partir do mesmo arquivo fonte.",
    images: [
      {
        src: `${PAGE_RESOURCE_BASE}/pt-br-remove-people-source-2026-04-10.png`,
        alt: "Foto de um mirante ao pôr do sol com uma mulher de jaqueta vermelha e um homem de camisa branca apoiados em um corrimão de pedra.",
        width: 1200,
        height: 896,
        label: "Foto original",
        frameVariant: "plain",
      },
      {
        src: `${PAGE_RESOURCE_BASE}/pt-br-remove-people-result-2026-04-10.png`,
        alt: "A mesma foto do mirante depois que a mulher de jaqueta vermelha foi removida e o corrimão de pedra foi reconstruído.",
        width: 1200,
        height: 896,
        label: "Resultado editado",
        frameVariant: "plain",
      },
    ],
  },
  quickAnswer: {
    eyebrow: "Resposta rápida",
    title: "O trabalho difícil é reparar a cena, não só apagar alguém",
    intro:
      "Ferramentas de remover pessoas costumam ser julgadas só pelo desaparecimento da pessoa. Na prática, o que decide se a edição serve é a qualidade da área reconstruída. Por isso o fluxo melhor é apagar, reconstruir e revisar.",
    takeaways: [
      "O prompt deve dizer quem sai e quais partes da foto precisam continuar exatamente iguais.",
      "A região reparada importa mais do que o clique de remoção, porque um preenchimento ruim denuncia a edição.",
      "Um bom fluxo prevê uma segunda passada quando corrimões, horizonte, texturas repetidas ou sombras ainda parecem artificiais.",
    ],
    cards: [
      {
        title: "Fotos de viagem",
        body: "Perfeito quando um turista extra atrapalha uma paisagem que você realmente quer reaproveitar.",
      },
      {
        title: "Listings e fotos de imóvel",
        body: "Útil quando a cena está boa, mas uma pessoa deixa a imagem com cara de staging ou distrai do que deveria aparecer.",
      },
      {
        title: "Reuso editorial e social",
        body: "Forte quando você quer manter o enquadramento original e só limpar um sujeito indesejado antes de publicar.",
      },
    ],
  },
  workflow: {
    eyebrow: "Workflow",
    title: "Cinco passos para sair de um frame poluído para uma foto limpa",
    stepLabel: "Passo",
    steps: [
      {
        title: "Comece com a foto que já funciona",
        body: "Use a imagem que você realmente quer salvar. Este fluxo é mais forte quando composição e luz já estão boas e só uma pessoa precisa sair.",
      },
      {
        title: "Identifique a pessoa com precisão",
        body: "Descreva roupa, posição e contexto para que a edição não remova o sujeito errado.",
      },
      {
        title: "Proteja o que deve permanecer",
        body: "Diga explicitamente o que precisa continuar intacto, como horizonte, corrimão, assunto principal ou enquadramento.",
      },
      {
        title: "Revise a zona reconstruída com cuidado",
        body: "Procure bordas quebradas, texturas clonadas, pedra deformada, sombras estranhas ou perspectiva ruim onde a pessoa estava.",
      },
      {
        title: "Faça uma segunda passada só se necessário",
        body: "Se sobrar um artefato pequeno, vale mais rodar uma limpeza pontual do que regenerar tudo do zero.",
      },
    ],
  },
  comparison: {
    eyebrow: "Por que o fluxo importa",
    title: "Removedor rápido versus workflow com agente",
    shallowLabel: "Borracha de um clique",
    workflowLabel: "Workflow com AnyCap",
    rows: [
      {
        lens: "Objetivo principal",
        shallow: "Fazer a pessoa sumir rápido, mesmo que a área reparada fique obviamente sintética.",
        workflow: "Remover a pessoa e manter a cena crível o bastante para ser reutilizada sem constrangimento.",
      },
      {
        lens: "O que fica protegido",
        shallow: "Quase sempre pouco especificado, então sujeito vizinho ou estrutura de fundo podem sofrer drift.",
        workflow: "O prompt nomeia a pessoa que sai e também os elementos que precisam permanecer idênticos.",
      },
      {
        lens: "Controle de qualidade",
        shallow: "A pessoa olha rápido para o frame final e torce para nada ter quebrado.",
        workflow: "O agente pode revisar com leitura de imagem e decidir se ainda precisa de uma segunda passada mais apertada.",
      },
    ],
  },
  modelChoice: {
    eyebrow: "Escolha de modelo",
    title: "A stack atual do AnyCap para remover pessoas da foto",
    cards: [
      {
        label: "Primeira passada",
        title: "Nano Banana Pro",
        href: "/models/nano-banana-pro",
        body: "A melhor primeira opção quando a foto fonte já existe e você quer uma edição mais forte sem perder a coerência do cenário ao redor.",
      },
      {
        label: "Iteração rápida",
        title: "Nano Banana 2",
        href: "/models/nano-banana-2",
        body: "Útil quando você quer testar mais de uma variação de limpeza rapidamente e aceita trocar um pouco de fidelidade por velocidade.",
      },
      {
        label: "Camada de QA",
        title: "Image Understanding",
        href: "/capabilities/image-understanding",
        body: "Use leitura de imagem no AnyCap depois da edição para confirmar se o frame final realmente ficou coerente e sem artefatos visíveis.",
      },
    ],
  },
  validation: {
    eyebrow: "O que validar",
    title: "Quatro checagens antes de considerar a foto pronta",
    cards: [
      {
        title: "Continuidade do fundo",
        body: "Olhe exatamente a área onde a pessoa removida estava e confirme que pedra, caminho, céu ou mar continuam consistentes.",
      },
      {
        title: "Sujeito preservado continua íntegro",
        body: "Se outra pessoa permanece no frame, verifique pose, roupa, escala e bordas para garantir que a edição não deformou esse sujeito.",
      },
      {
        title: "Iluminação continua natural",
        body: "A zona reparada precisa seguir a mesma direção de luz e a mesma atmosfera do resto da foto.",
      },
      {
        title: "Sem resíduo visível de IA",
        body: "Procure texturas duplicadas, corrimão quebrado, membros inventados, texto aleatório ou watermark antes de exportar.",
      },
    ],
  },
  cli: {
    eyebrow: "Exemplos de CLI",
    title: "Comandos de exemplo alinhados à schema atual",
    examples: [
      {
        title: "Remover uma pessoa da foto",
        code: `anycap image generate \\
  --model nano-banana-pro \\
  --mode image-to-image \\
  --prompt "remova completamente a mulher de jaqueta vermelha, mantenha o homem de camisa branca exatamente onde está, reconstrua o corrimão de pedra naturalmente atrás dela, preserve o mirante e a luz de pôr do sol, sem texto, sem watermark" \\
  --param images=./source-overlook.png \\
  --param aspect_ratio=4:3 \\
  --param resolution=2k \\
  -o overlook-limpo.png`,
      },
      {
        title: "Rodar uma limpeza mais pontual se sobrar artefato",
        code: `anycap image generate \\
  --model nano-banana-2 \\
  --mode image-to-image \\
  --prompt "mantenha o mesmo homem e a mesma paisagem costeira, refine apenas o corrimão e o caminho onde a pessoa removida estava, elimine qualquer textura duplicada ou borda quebrada, sem texto, sem watermark" \\
  --param images=./overlook-limpo.png \\
  --param aspect_ratio=4:3 \\
  --param resolution=2k \\
  -o overlook-limpo-pass-2.png`,
      },
      {
        title: "Fazer QA da área reconstruída",
        code: `anycap actions image-read \\
  --file ./overlook-limpo.png \\
  --instruction "Descreva a imagem, confirme se resta apenas um viajante em primeiro plano e mencione qualquer artefato visível no corrimão, no caminho ou na paisagem. Também avise se houver texto ou watermark."`,
      },
    ],
  },
  faq: {
    eyebrow: "FAQ",
    title: "Perguntas que normalmente vêm em seguida",
    items: [
      {
        question: "O AnyCap consegue remover uma pessoa e manter outra na mesma foto?",
        answer:
          "Sim. O prompt precisa identificar claramente quem sai e quem fica. O fluxo funciona melhor quando o sujeito preservado é descrito por roupa, posição ou papel dentro do frame.",
      },
      {
        question: "Isso é melhor do que a borracha mágica do celular?",
        answer:
          "É melhor quando a edição importa o suficiente para ser revisada. A borracha do celular pode bastar para um rascunho casual, mas o AnyCap é mais forte quando você quer uma reconstrução melhor e um QA antes de reaproveitar a imagem.",
      },
      {
        question: "Que tipo de foto é mais difícil para remover pessoas?",
        answer:
          "Multidões apertadas, padrões repetidos e cenas em que a pessoa cobre uma estrutura importante são mais difíceis. Corrimões, texto, rostos e linhas fortes de perspectiva são os pontos que merecem revisão mais cuidadosa.",
      },
      {
        question: "Posso adaptar o mesmo fluxo para remover emoji ou objetos?",
        answer:
          "Na maioria dos casos, sim. O mesmo fluxo image-to-image com QA pode ser usado para tirar emoji, placa, bolsa ou outro elemento indesejado, desde que o prompt proteja bem o resto da cena.",
      },
    ],
  },
  nextMove: {
    eyebrow: "Próximo passo",
    title: "Continue pelo fluxo que melhor encaixa na próxima edição",
    cards: [
      {
        title: "Como clarear foto online",
        href: "/learn/how-to-brighten-a-photo-online",
        body: "Vá para cá quando o enquadramento já está certo e o próximo problema é sombra dura ou subexposição, não uma pessoa indesejada.",
      },
      {
        title: "Como trocar o fundo de uma foto",
        href: "/learn/how-to-change-photo-background",
        body: "Use este fluxo quando a pessoa fica, mas o ambiente ao redor do assunto precisa mudar.",
      },
      {
        title: "Nano Banana Pro",
        href: "/models/nano-banana-pro",
        body: "Aprofunde no modelo que hoje encaixa melhor em workflows de limpeza de foto com fonte existente.",
      },
      {
        title: "Instalar AnyCap",
        href: "/guides/install-anycap",
        body: "Siga por aqui quando quiser preparar o CLI antes de rodar o mesmo workflow nas suas imagens.",
      },
    ],
  },
};

const idContent: RemovePeoplePageContent = {
  metadata: {
    title: "Cara Menghapus Orang dari Foto dengan Agen AI",
    description:
      "Gunakan AnyCap untuk menghapus orang yang tidak diinginkan dari foto, memeriksa adegan yang direkonstruksi, dan menjaga hasil tetap dipakai alih-alih menerima bercak buram.",
    openGraphTitle: "Cara Menghapus Orang dari Foto dengan Agen AI",
    openGraphDescription:
      "Panduan alur kerja untuk menghapus satu orang dari foto lewat pengeditan gambar AnyCap dan pemahaman gambar sambil menjaga sisanya tetap koheren.",
    articleHeadline: "Cara Menghapus Orang dari Foto dengan Agen AI",
    articleDescription:
      "Alur praktis untuk menghapus orang dari foto melalui pengeditan gambar AnyCap ditambah QA gambar.",
    articleAbout: [
      "Menghapus orang",
      "Menghapus objek",
      "Pembersihan foto perjalanan",
      "Pengeditan gambar",
      "Pemahaman gambar",
      "Agen AI",
    ],
    articleKeywords: [
      "menghapus orang dari foto",
      "hapus orang dari foto",
      "hapus orang dari gambar",
      "pembersihan foto ai",
      "hapus orang tidak diinginkan dari foto",
    ],
  },
  breadcrumbItems: [
    { name: "Beranda", href: "/" },
    { name: "Belajar", href: "/learn" },
    {
      name: "Cara menghapus orang dari foto",
      href: HOW_TO_REMOVE_PEOPLE_FROM_PHOTOS_PATH,
    },
  ],
  eyebrow: "Belajar",
  lastUpdatedLabel: "Terakhir diperbarui 10 April 2026",
  hero: {
    titleLine1: "Cara menghapus orang dari foto",
    titleLine2: "tanpa merusak latar menjadi buram",
    introBeforeFirstLink:
      "Jika Anda ingin menghapus seseorang dari foto, pekerjaan yang berguna bukan sekadar menghapus area berbentuk tubuh. Yang penting adalah merekonstruksi adegan agar gambar masih terasa seperti satu foto yang meyakinkan. Di situlah",
    firstLinkLabel: "generasi gambar AnyCap",
    introBetweenLinks: "ditambah",
    secondLinkLabel: "pemahaman gambar",
    introAfterSecondLink:
      "memberi agen alur kerja yang lebih kuat daripada penghapus ajaib sekali klik.",
    summaryLabel: "Ringkasan jawaban dulu",
    summaryText:
      "Alur menghapus orang yang berguna adalah rekonstruksi ditambah QA. AnyCap memungkinkan agen menghapus orang yang tidak diinginkan, memeriksa latar yang diperbaiki, dan memutuskan apakah bingkai siap dipakai ulang untuk listing, posting blog, atau set foto perjalanan.",
  },
  proof: {
    eyebrow: "Bukti yang dihasilkan",
    title: "Pembersihan mirador wisata nyata, bukan mockup",
    intro:
      "Halaman ini memakai pasangan bukti nyata yang dihasilkan dengan AnyCap. Bingkai kiri adalah foto mirador asli dengan dua subjek latar depan. Bingkai kanan menghapus wanita berjaket merah sambil mempertahankan wisatawan yang tersisa, pagar batu, dan pemandangan laut agar tetap koheren.",
    promptLabel: "Prompt edit yang dipakai dengan AnyCap",
    prompt:
      "hapus sepenuhnya wanita berjaket merah, biarkan pria berkemeja putih persis di posisinya, rekonstruksi pagar batu secara alami di belakangnya, pertahankan tebing laut dan pencahayaan matahari terbenam, tanpa orang tambahan, tanpa teks, tanpa watermark",
    signalsLabel: "Mengapa bukti ini penting",
    signals: [
      "Ini menunjukkan masalah rekonstruksi nyata, bukan crop sepele atau regenerasi penuh.",
      "Pagar yang diperbaiki dan garis pantai membuat pembersihan terbaca sekilas.",
      "Ini mendemonstrasikan klaim AnyCap yang jujur: penghapusan ditambah inspeksi, bukan penghapusan buta.",
    ],
    caption:
      "Gambar kiri adalah foto asli. Gambar kanan adalah hasil AnyCap dengan satu orang dihapus dan adegan direkonstruksi dari sumber gambar yang sama.",
    images: [
      {
        src: `${PAGE_RESOURCE_BASE}/pt-br-remove-people-source-2026-04-10.png`,
        alt: "Foto mirador pesisir saat matahari terbenam dengan wanita berjaket merah dan pria berkemeja putih di pagar batu.",
        width: 1200,
        height: 896,
        label: "Foto sumber",
        frameVariant: "plain",
      },
      {
        src: `${PAGE_RESOURCE_BASE}/pt-br-remove-people-result-2026-04-10.png`,
        alt: "Foto mirador yang sama setelah wanita berjaket merah dihapus dan pagar batu direkonstruksi.",
        width: 1200,
        height: 896,
        label: "Hasil edit",
        frameVariant: "plain",
      },
    ],
  },
  quickAnswer: {
    eyebrow: "Jawaban singkat",
    title: "Bagian sulitnya adalah perbaikan adegan, bukan sekadar penghapusan",
    intro:
      "Alat penghapus orang dinilai dari apakah orang yang tidak diinginkan hilang. Dalam praktik, pertanyaan berguna adalah apakah bingkai masih terlihat utuh setelah penghapusan. Itulah sebabnya alur yang lebih kuat adalah hapus ditambah rekonstruksi ditambah QA.",
    takeaways: [
      "Prompt harus menyebutkan siapa yang harus hilang dan bagian foto mana yang harus tetap sama persis.",
      "Area yang diperbaiki lebih penting daripada tindakan hapus sendiri karena isian buruk membuat edit terlihat jelas.",
      "Alur yang baik bercabang ke pembersihan kedua ketika pagar, garis horizon, atau tekstur berulang masih terlihat aneh.",
    ],
    cards: [
      {
        title: "Foto perjalanan",
        body: "Terbaik ketika satu turis atau pejalan kaki tambahan merusak foto pemandang yang sebenarnya berguna.",
      },
      {
        title: "Listing dan foto properti",
        body: "Berguna ketika adegan sudah tepat tetapi satu orang membuat gambar terasa berlebihan, mengganggu, atau tidak bisa dipakai.",
      },
      {
        title: "Pemakaian ulang sosial dan editorial",
        body: "Kuat ketika Anda ingin mempertahankan komposisi foto asli tetapi membersihkan satu subjek yang mengganggu sebelum menerbitkan.",
      },
    ],
  },
  workflow: {
    eyebrow: "Alur kerja",
    title: "Lima langkah dari bingkai ramai ke foto yang lebih bersih",
    stepLabel: "Langkah",
    steps: [
      {
        title: "Mulai dari foto yang sudah berfungsi",
        body: "Gunakan gambar yang benar-benar ingin Anda simpan. Alur ini terkuat ketika komposisi dan pencahayaan sudah baik dan hanya satu subjek yang perlu pergi.",
      },
      {
        title: "Sebutkan orang yang akan dihapus dengan tepat",
        body: "Deskripsikan pakaian, posisi, dan lokasi relatif agar edit tidak bergeser ke subjek yang salah.",
      },
      {
        title: "Lindungi bagian yang harus tetap",
        body: "Sebutkan apa yang harus tetap utuh, seperti horizon, pagar, subjek utama, atau pembingkaian kamera.",
      },
      {
        title: "Periksa zona yang diperbaiki dengan teliti",
        body: "Cari tepi rusak, tekstur kloning, pagar melengkung, atau ketidakcocokan cahaya di tempat orang itu berdiri.",
      },
      {
        title: "Jalankan pass kedua hanya jika perlu",
        body: "Jika artefak kecil tersisa, gunakan prompt pembersihan yang lebih ketat alih-alih menghasilkan ulang seluruh foto dari awal.",
      },
    ],
  },
  comparison: {
    eyebrow: "Mengapa alur kerja penting",
    title: "Penghapusan sekali klik versus alur kerja agen",
    shallowLabel: "Penghapus sekali klik",
    workflowLabel: "Alur kerja AnyCap",
    rows: [
      {
        lens: "Tujuan utama",
        shallow:
          "Membuat orang yang tidak diinginkan hilang cepat, meskipun area yang diperbaiki terlihat jelas sintetis.",
        workflow: "Menghapus orang dan menjaga adegan cukup meyakinkan untuk dipakai ulang tanpa malu.",
      },
      {
        lens: "Apa yang tetap dilindungi",
        shallow: "Biasanya kurang dispesifikasi, sehingga subjek di dekatnya atau struktur latar bisa bergeser.",
        workflow: "Prompt menyebut orang yang dihapus dan detail adegan yang harus tetap tidak berubah.",
      },
      {
        lens: "Kendali mutu",
        shallow: "Pengguna memeriksa bingkai akhir secara visual dan berharap tidak ada yang rusak halus.",
        workflow:
          "Agen dapat memeriksa hasil dengan pembacaan gambar dan memutuskan apakah pass pembersihan yang lebih ketat diperlukan.",
      },
    ],
  },
  modelChoice: {
    eyebrow: "Pilihan model",
    title: "Stack AnyCap saat ini untuk alur penghapusan orang",
    cards: [
      {
        label: "Pass pertama terbaik",
        title: "Nano Banana Pro",
        href: "/models/nano-banana-pro",
        body: "Pilihan pertama terbaik ketika Anda sudah punya foto sumber dan ingin edit penghapusan orang yang lebih kuat tanpa kehilangan adegan sekitarnya.",
      },
      {
        label: "Iterasi cepat",
        title: "Nano Banana 2",
        href: "/models/nano-banana-2",
        body: "Berguna ketika Anda ingin beberapa variasi pembersihan dengan cepat dan bisa menukar sedikit kesetiaan untuk percabangan lebih cepat.",
      },
      {
        label: "Lapisan QA",
        title: "Image Understanding",
        href: "/capabilities/image-understanding",
        body: "Gunakan pembacaan gambar AnyCap setelah edit untuk memeriksa apakah bingkai yang tersisa masih koheren dan bebas artefak.",
      },
    ],
  },
  validation: {
    eyebrow: "Apa yang divalidasi",
    title: "Empat pemeriksaan sebelum Anda menyebut foto selesai",
    cards: [
      {
        title: "Kesinambungan latar",
        body: "Lihat persis area di mana orang yang dihapus berdiri dan pastikan isian cocok dengan pola batu, jalan, langit, atau air di sekitarnya.",
      },
      {
        title: "Subjek yang dilindungi masih utuh",
        body: "Jika satu orang tetap dalam bingkai, pastikan pose, pakaian, skala, dan detail tepi tidak melengkung oleh edit.",
      },
      {
        title: "Pencahayaan tetap konsisten",
        body: "Area yang diperbaiki harus mengikuti arah matahari terbenam, bayangan, atau cahaya dalam ruangan yang sama seperti foto asli.",
      },
      {
        title: "Tanpa sisa AI yang terlihat",
        body: "Periksa tekstur duplikat, pagar patah, anggota tubuh yang diciptakan, teks acak, atau artefak watermark sebelum ekspor.",
      },
    ],
  },
  cli: {
    eyebrow: "Contoh CLI",
    title: "Perintah contoh yang selaras dengan skema saat ini",
    examples: [
      {
        title: "Menghapus satu orang dari foto",
        code: `anycap image generate \\
  --model nano-banana-pro \\
  --mode image-to-image \\
  --prompt "remove the woman in the red jacket completely, keep the man in the white shirt exactly where he is, reconstruct the stone railing naturally behind her, preserve the ocean overlook and sunset light, no text, no watermark" \\
  --param images=./source-overlook.png \\
  --param aspect_ratio=4:3 \\
  --param resolution=2k \\
  -o cleaned-overlook.png`,
      },
      {
        title: "Menjalankan pass perbaikan lebih ketat jika artefak tersisa",
        code: `anycap image generate \\
  --model nano-banana-2 \\
  --mode image-to-image \\
  --prompt "keep the same man and the same coastline, refine only the stone railing and path where the removed person stood, remove any duplicated texture or broken edge, no text, no watermark" \\
  --param images=./cleaned-overlook.png \\
  --param aspect_ratio=4:3 \\
  --param resolution=2k \\
  -o cleaned-overlook-pass-2.png`,
      },
      {
        title: "QA bingkai yang diperbaiki",
        code: `anycap actions image-read \\
  --file ./cleaned-overlook.png \\
  --instruction "Describe the image, confirm whether only one foreground traveler remains, and mention any visible artifact in the repaired railing, path, or coastline. Also call out any visible text or watermark."`,
      },
    ],
  },
  faq: {
    eyebrow: "FAQ",
    title: "Pertanyaan yang biasanya menyusul",
    items: [
      {
        question: "Bisakah AnyCap menghapus satu orang tetapi mempertahankan orang lain dalam foto yang sama?",
        answer:
          "Ya. Prompt harus mengidentifikasi dengan jelas orang yang dihapus dan subjek yang harus tetap. Alur kerja paling baik ketika orang yang dilindungi dideskripsikan eksplisit dengan posisi, pakaian, atau peran dalam bingkai.",
      },
      {
        question: "Apakah ini lebih baik dari penghapus ajaib di ponsel?",
        answer:
          "Lebih baik ketika edit cukup penting untuk diperiksa. Penghapus ponsel mungkin cukup untuk draf santai, tetapi AnyCap lebih kuat ketika Anda ingin rekonstruksi yang lebih bersih dan pass QA sebelum memakai ulang gambar.",
      },
      {
        question: "Foto seperti apa yang paling sulit untuk penghapusan orang?",
        answer:
          "Kerumunan padat, pola berulang, dan adegan di mana orang yang dihapus menutup struktur penting lebih sulit. Pagar, teks, wajah, dan garis perspektif kuat adalah tempat Anda harus paling hati-hati memeriksa hasilnya.",
      },
      {
        question: "Bisakah saya memakai alur yang sama untuk menghapus emoji atau objek juga?",
        answer:
          "Biasanya ya. Alur image-to-image yang sama ditambah QA dapat disesuaikan untuk menghapus emoji, tanda, tas, atau objek tidak diinginkan lainnya selama prompt dengan jelas melindungi bagian adegan yang harus tetap.",
      },
    ],
  },
  nextMove: {
    eyebrow: "Langkah berikutnya",
    title: "Lanjutkan dari alur kerja yang cocok dengan edit berikutnya",
    cards: [
      {
        title: "Cara mencerahkan foto secara daring",
        href: "/learn/how-to-brighten-a-photo-online",
        body: "Ke sini ketika komposisi sudah benar dan masalah berikutnya adalah bayangan keras atau underexposure, bukan orang yang mengganggu.",
      },
      {
        title: "Cara mengubah latar belakang foto",
        href: "/learn/how-to-change-photo-background",
        body: "Gunakan ini ketika orang tetap tetapi lingkungan di sekitar subjek perlu berubah.",
      },
      {
        title: "Nano Banana Pro",
        href: "/models/nano-banana-pro",
        body: "Baca halaman model ketika Anda ingin model edit terbaik saat ini untuk alur pembersihan dari foto sumber.",
      },
      {
        title: "Instal AnyCap",
        href: "/guides/install-anycap",
        body: "Mulai di sini ketika Anda ingin CLI siap sebelum mencoba alur yang sama pada gambar Anda sendiri.",
      },
    ],
  },
};

const contentByLocale = {
  en: enContent,
  "pt-br": ptBrContent,
  id: idContent,
} satisfies Partial<Record<SiteLocale, RemovePeoplePageContent>>;

function getContent(locale: SiteLocale): RemovePeoplePageContent {
  return contentByLocale[locale as keyof typeof contentByLocale] ?? enContent;
}

export function getHowToRemovePeopleFromPhotosMetadata(locale: SiteLocale): Metadata {
  const content = getContent(locale);

  return {
    title: content.metadata.title,
    description: content.metadata.description,
    alternates: { canonical: HOW_TO_REMOVE_PEOPLE_FROM_PHOTOS_PATH },
    openGraph: {
      type: "website",
      locale: getLocaleConfig(locale).ogLocale,
      url: HOW_TO_REMOVE_PEOPLE_FROM_PHOTOS_PATH,
      siteName: siteConfig.siteName,
      title: content.metadata.openGraphTitle,
      description: content.metadata.openGraphDescription,
    },
  };
}

export function getHowToRemovePeopleFromPhotosPageData(locale: SiteLocale) {
  const content = getContent(locale);

  return {
    ...content,
    articleJsonLd: createTechArticleJsonLd({
      headline: content.metadata.articleHeadline,
      description: content.metadata.articleDescription,
      path: HOW_TO_REMOVE_PEOPLE_FROM_PHOTOS_PATH,
      locale,
      about: [...content.metadata.articleAbout],
      keywords: [...content.metadata.articleKeywords],
      datePublished: LAST_UPDATED_ISO,
      dateModified: LAST_UPDATED_ISO,
    }),
    faqJsonLd: createFaqPageJsonLd(content.faq.items),
  };
}
