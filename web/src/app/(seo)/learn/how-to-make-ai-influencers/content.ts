import type { Metadata } from "next";
import { createFaqPageJsonLd, createTechArticleJsonLd } from "@/lib/schema";
import { getLocaleConfig, siteConfig, type SiteLocale } from "@/lib/site";

export const HOW_TO_MAKE_AI_INFLUENCERS_PATH = "/learn/how-to-make-ai-influencers";

const PAGE_RESOURCE_BASE = "https://cdn.anycap.ai/page_resource/learning";
const LAST_UPDATED_ISO = "2026-04-09";
const HERO_IMAGE = {
  src: `${PAGE_RESOURCE_BASE}/how-to-make-ai-influencers-hero.png`,
  width: 1792,
  height: 1024,
} as const;
const PERSONA_PACK_IMAGES = [
  {
    src: `${PAGE_RESOURCE_BASE}/how-to-make-ai-influencers-product-hold.jpg`,
    width: 1792,
    height: 2400,
  },
  {
    src: `${PAGE_RESOURCE_BASE}/how-to-make-ai-influencers-vanity-demo.png`,
    width: 1792,
    height: 2400,
  },
  {
    src: `${PAGE_RESOURCE_BASE}/how-to-make-ai-influencers-desk-unboxing.jpg`,
    width: 2752,
    height: 1536,
  },
] as const;

const enContent = {
    metadata: {
      title: "How to Make AI Influencers with an AI Agent",
      description:
        "Use AnyCap to generate a consistent virtual creator, branch into still and video variants, inspect the outputs, and keep the workflow reusable instead of relying on one-click influencer apps.",
      openGraphTitle: "How to Make AI Influencers with an AI Agent",
      openGraphDescription:
        "A workflow guide for building an AI influencer pipeline through AnyCap image generation, image editing, image reading, video generation, and delivery surfaces.",
      articleHeadline: "How to Make AI Influencers with an AI Agent",
      articleDescription:
        "A practical workflow for creating a consistent AI influencer persona, turning that identity into reusable stills and motion, and keeping QA inside the same agent workflow.",
      articleAbout: [
        "AI influencers",
        "Virtual creators",
        "Image generation",
        "Image understanding",
        "Video generation",
        "AI agents",
      ],
      articleKeywords: [
        "how to make ai influencers",
        "how to create an ai influencer",
        "ai influencer workflow",
        "create ai influencer",
        "virtual influencer pipeline",
      ],
    },
    breadcrumbItems: [
      { name: "Home", href: "/" },
      { name: "Learn", href: "/learn" },
      { name: "How to Make AI Influencers", href: HOW_TO_MAKE_AI_INFLUENCERS_PATH },
    ],
    eyebrow: "Learn",
    lastUpdatedLabel: "Last updated April 9, 2026",
    hero: {
      titleLine1: "How to make AI influencers",
      titleLine2: "without turning the workflow brittle",
      introBeforeFirstLink:
        "If you are searching for how to make AI influencers, the practical job is not to generate one attractive virtual face. It is to build a creator system that can hold together across stills, short videos, reviews, and handoff. That is where an agent plus",
      firstLinkLabel: "AnyCap image generation",
      betweenLinks: ",",
      secondLinkLabel: "video generation",
      afterSecondLink:
        ", and visual QA can do something more useful than a one-screen influencer app.",
      summaryLabel: "Answer-first summary",
      summaryText:
        "The strongest AI influencer workflow is a staged one. Generate a stable identity first. Turn that still into a persona pack. Promote only the best stills into image-to-video. Then inspect the results before you hand them off. AnyCap is useful here because the agent can keep those layers inside one capability surface instead of bouncing between disconnected generators and manual QA steps.",
      imageAlt:
        "Polished fictional beauty influencer with glossy dark waves, layered gold jewelry, and soft glam makeup seated at a marble table in a bright luxury apartment studio beside an unlabeled skincare bottle and phone.",
      imageCaption:
        "This hero image shows the page's core claim in one frame: the creator identity should already feel believable before the workflow branches into more scenes, more crops, or motion.",
    },
    proof: {
      eyebrow: "Generated proof",
      title: "The persona should survive real UGC actions",
      intro:
        "One polished portrait is not enough. We used the hero identity as the reference anchor and branched into product-hold, vanity, and unboxing actions to test whether the same creator still reads like the same person in commerce-style content.",
      promptLabel: "Persona-pack prompt shape",
      prompt:
        "preserve the same fictional beauty influencer identity from the hero image, then branch into believable UGC actions: product hold, vanity demo, and desk unboxing without losing the same face shape, warm tan complexion, espresso-brown waves, soft glam makeup, gold jewelry, or premium lifestyle styling. Keep the products unlabeled, the hands natural, and the lighting photoreal.",
      signalsLabel: "Why this proof matters",
      signals: [
        "The same face, hair, jewelry, and sweater styling hold together across three different creator-commerce actions.",
        "The images pressure-test the workflow where AI influencer projects usually break first: bottles, hands, props, and lived-in product context.",
        "This is closer to real UGC usage than a single hero portrait because the creator is interacting with objects instead of only posing.",
      ],
      caption:
        "These follow-up stills matter because influencer content rarely lives as one hero shot. If the face shifts, the hands break, or the products turn into gibberish as soon as a bottle enters frame, the workflow is not reusable yet.",
      images: [
        {
          ...PERSONA_PACK_IMAGES[0],
          alt: "The same fictional beauty influencer from the hero image holding an unlabeled frosted serum bottle near her face in a bright apartment interior.",
          label: "Product hold",
        },
        {
          ...PERSONA_PACK_IMAGES[1],
          alt: "The same fictional beauty influencer from the hero image reaching for an unlabeled pump bottle at a bright marble vanity.",
          label: "Vanity demo",
        },
        {
          ...PERSONA_PACK_IMAGES[2],
          alt: "The same fictional beauty influencer from the hero image unboxing a minimal skincare set on a white marble table.",
          label: "Desk unboxing",
        },
      ],
    },
    quickAnswer: {
      label: "Quick answer",
      title: "Build the persona system first",
      body:
        "When people say they want an AI influencer, they often mean four different jobs at once: identity design, content variation, short-form motion, and delivery. The cleanest workflow separates those layers so the agent can keep the strongest asset moving forward instead of constantly regenerating the whole concept from zero.",
      takeaways: [
        "The useful question is not how to generate one fake profile photo. It is how to build a reusable virtual creator system.",
        "The best AnyCap workflow starts with still-image identity work, then branches into scene packs, motion variants, and quality checks instead of treating every prompt like a fresh start.",
        "AnyCap matters here because the agent can generate, inspect, animate, and deliver assets without collapsing back into a pile of disconnected tools.",
      ],
    },
    workflow: {
      label: "Workflow",
      title: "Five steps from first still to reusable creator workflow",
      stepLabelPrefix: "Step",
      steps: [
        {
          title: "Define the persona before you chase scenes",
          body: "Lock the identity first: face, styling range, brand tone, and the kind of niche this creator represents. A weak identity multiplies drift later.",
        },
        {
          title: "Generate the first strong still",
          body: "Use a text-to-image pass when you are starting from zero, or an image-to-image pass when you already have a reference you want to preserve more tightly.",
        },
        {
          title: "Turn one still into a persona pack",
          body: "Branch the winning identity into several repeatable looks: a clean portrait, a casual selfie frame, and at least one campaign or product context.",
        },
        {
          title: "Animate only the stills that already work",
          body: "Treat image-to-video as a second step. The strongest influencer videos usually come from a still that already looks publishable before motion is added.",
        },
        {
          title: "Inspect and hand off the output",
          body: "Use image or video reading to catch visible text drift, weak framing, or wrong product context, then keep the file reusable for review, sharing, or page publishing.",
        },
      ],
    },
    systemCards: [
      {
        title: "Persona pack, not one prompt",
        body: "The output should hold together across multiple scenes and crop ratios. A one-off pretty image is not enough to support a creator identity.",
      },
      {
        title: "Motion is a branch, not the starting point",
        body: "If the still does not work, the video usually gets worse. Start with a frame that already feels usable for profile, thumbnail, or promo use.",
      },
      {
        title: "QA is part of the workflow",
        body: "The agent can inspect whether the image drifted, whether labels became readable gibberish, or whether a product shot no longer matches the page promise.",
      },
      {
        title: "Delivery matters after generation",
        body: "A workflow only becomes operational when the result is easy to review, reuse, and publish instead of living as one more random download on disk.",
      },
    ],
    validation: {
      label: "First-hand validation",
      title: "What we checked before recommending this workflow",
      cards: [
        {
          title: "Capability surface confirmed",
          body: "A live AnyCap status check on April 9, 2026 confirmed image generation, image editing, image reading, video generation, video reading, Drive, Page, and web retrieval were available in the current environment.",
        },
        {
          title: "Schema checked",
          body: "Nano Banana 2, Nano Banana Pro, and Seedance 1.5 Pro were checked against the live schema before drafting this page so the example commands use the current parameter shape.",
        },
        {
          title: "Hero image generated",
          body: "The lead visual for this page was regenerated through Nano Banana in a realistic direction rather than through a stylized board or illustration workflow.",
        },
        {
          title: "Hero image inspected",
          body: "Image reading confirmed the current hero image reads like a realistic creator workflow asset and does not contain visible text or a watermark.",
        },
      ],
    },
    modelChoice: {
      label: "Model choice",
      title: "Choose the model by role in the pipeline",
      cards: [
        {
          title: "Nano Banana Pro",
          label: "Best first realistic still",
          body: "Use this when the identity has to feel stable from the start and you want the strongest realistic creator portrait or reference-preserving branch.",
          href: "/models/nano-banana-pro",
        },
        {
          title: "Nano Banana 2",
          label: "Best for realistic iteration speed",
          body: "Use this when you want to test multiple realistic looks, angles, and scene directions quickly before promoting the winner into video.",
          href: "/models/nano-banana-2",
        },
        {
          title: "Seedance 1.5 Pro",
          label: "Best next motion step",
          body: "Use this when the persona still already works and you want a controlled image-to-video pass instead of jumping straight into text-to-video drift.",
          href: "/models/seedance-1-5-pro",
        },
      ],
    },
    comparison: {
      label: "Comparison",
      title: "One-click generator vs agent plus AnyCap",
      columns: {
        lens: "Lens",
        generic: "One-click generator",
        workflow: "Agent plus AnyCap",
      },
      rows: [
        {
          lens: "What gets optimized first",
          shallow: "You start with a flashy output and hope the identity survives later edits.",
          workflow: "You lock the persona system first, then branch into scenes, crops, and motion from the same identity anchor.",
        },
        {
          lens: "How video gets made",
          shallow: "You ask for a final video immediately and accept whatever identity drift shows up.",
          workflow: "You promote the strongest still into image-to-video so the motion layer starts from a stable visual reference.",
        },
        {
          lens: "Quality control",
          shallow: "The workflow ends when the render finishes.",
          workflow: "The agent inspects the output before handoff and can catch bad text, wrong products, or scene drift.",
        },
        {
          lens: "Reusability",
          shallow: "Every deliverable behaves like a new prompt from zero.",
          workflow: "The influencer becomes a reusable asset pack that can feed more content, more channels, and more reviews.",
        },
      ],
    },
    commands: {
      label: "Command examples",
      title: "The workflow in commands",
      ctaLabel: "Browse the capability details",
      examples: [
        {
          title: "Generate the first influencer still",
          code: [
            "anycap image generate \\",
            "  --model nano-banana-pro \\",
            '  --prompt "fictional virtual creator, realistic lifestyle-influencer portrait, premium soft lighting, natural skin texture, brand-safe styling, direct-to-camera confidence, realistic camera depth, no readable text, no watermark" \\',
            "  --param aspect_ratio=4:3 \\",
            "  --param resolution=2k \\",
            "  -o influencer-first-still.png",
          ].join("\n"),
        },
        {
          title: "Generate a second realistic variant fast",
          code: [
            "anycap image generate \\",
            "  --model nano-banana-2 \\",
            '  --prompt "same fictional creator archetype, realistic casual selfie-style portrait, warm indoor lighting, creator-home background, social-ready framing, natural facial detail, no readable text, no watermark" \\',
            "  --param aspect_ratio=4:3 \\",
            "  --param resolution=2k \\",
            "  -o influencer-selfie-variant.png",
          ].join("\n"),
        },
        {
          title: "Refine the winning still while preserving identity",
          code: [
            "anycap image generate \\",
            "  --model nano-banana-pro \\",
            "  --mode image-to-image \\",
            '  --prompt "preserve the same fictional creator identity, make the portrait more realistic, refine skin texture and lighting, keep the face stable, shift into a casual phone-selfie scene, no readable text, no watermark" \\',
            "  --param images=./influencer-first-still.png \\",
            "  --param aspect_ratio=4:3 \\",
            "  --param resolution=2k \\",
            "  -o influencer-refined-still.png",
          ].join("\n"),
        },
        {
          title: "Animate the still into a short video",
          code: [
            "anycap video generate \\",
            "  --model seedance-1.5-pro \\",
            "  --mode image-to-video \\",
            '  --prompt "subtle creator-style hand motion, direct-to-camera delivery, natural head movement, premium social-video energy, keep the identity stable, no text overlays" \\',
            "  --param images=./influencer-refined-still.png \\",
            "  --param aspect_ratio=9:16 \\",
            "  --param duration=5 \\",
            "  --param resolution=720p \\",
            "  -o influencer-short.mp4",
          ].join("\n"),
        },
        {
          title: "QA the still or video before handoff",
          code: [
            "anycap actions image-read \\",
            "  --file ./influencer-refined-still.png \\",
            '  --instruction "Describe the creator, say whether the identity still matches the original still, and mention any visible text or watermark."',
          ].join("\n"),
        },
      ],
    },
    faq: {
      label: "FAQ",
      title: "Common questions before you build the first creator",
      items: [
        {
          question: "What is the biggest mistake people make when they try to build an AI influencer?",
          answer:
            "They treat the job like a single image prompt. A usable AI influencer is a repeatable persona system: identity, scene variants, motion variants, quality checks, and delivery handoff.",
        },
        {
          question: "Do I need a dedicated AI influencer platform first?",
          answer:
            "Not always. If the real goal is to create the persona, test visual directions, animate the strongest stills, and keep the assets reusable, an agent plus AnyCap is often the cleaner starting workflow.",
        },
        {
          question: "Which AnyCap model should I try first?",
          answer:
            "Use Nano Banana Pro when you already have a source image or persona reference to preserve, Nano Banana 2 when you want to explore realistic still variants quickly, and Seedance 1.5 Pro only after one of those stills already works.",
        },
        {
          question: "Can AnyCap handle voice for AI influencer videos too?",
          answer:
            "The strongest public AnyCap workflow today is the visual layer: still creation, video generation, and output inspection. If narration matters, treat voice as a separate post-production layer instead of forcing it into the first visual pass.",
        },
      ],
    },
    nextStep: {
      label: "Next step",
      title: "Branch into the narrow workflow you actually need",
      cards: [
        {
          title: "Create AI Influencer for Free",
          href: "/learn/create-ai-influencer-for-free",
          body: "Use this supporting page when the main question is how to test persona directions cheaply before you commit to a bigger content loop.",
        },
        {
          title: "How to Make AI Influencer Videos",
          href: "/learn/how-to-make-ai-influencer-videos",
          body: "Move here when the still is already working and the next job is short-form motion, not another static portrait.",
        },
        {
          title: "AI Video Generator from Image",
          href: "/learn/ai-video-generator-from-image",
          body: "Use this workflow page when the broader task is image-to-video consistency beyond the influencer niche alone.",
        },
        {
          title: "What Is an AI Influencer?",
          href: "/learn/what-is-an-ai-influencer",
          body: "Read the explainer when you want the operational definition before you decide which workflow branch to build first.",
        },
        {
          title: "Install AnyCap",
          href: "/start",
          body: "Go here when you want the shortest path from this article into a working CLI setup.",
        },
        {
          title: "Image Generation",
          href: "/capabilities/image-generation",
          body: "See the capability surface that handles the first stills, persona variants, and scene branching in this workflow.",
        },
      ],
    },
} as const;

const contentByLocale = {
  en: enContent,
  "pt-br": {
    metadata: {
      title: "Como criar influencers de IA com um agente de IA",
      description:
        "Use o AnyCap para gerar uma criadora virtual consistente, abrir variações de still e vídeo, inspecionar os resultados e manter o workflow reutilizável em vez de depender de apps de influencer de um clique.",
      openGraphTitle: "Como criar influencers de IA com um agente de IA",
      openGraphDescription:
        "Um guia de workflow para montar um pipeline de AI influencer com image generation, image editing, image reading, video generation e superfícies de entrega do AnyCap.",
      articleHeadline: "Como criar influencers de IA com um agente de IA",
      articleDescription:
        "Um workflow prático para criar uma persona consistente de AI influencer, transformar essa identidade em stills e motion reutilizáveis e manter o QA dentro do mesmo workflow do agente.",
      articleAbout: [
        "influencers de IA",
        "criadores virtuais",
        "geração de imagem",
        "entendimento de imagem",
        "geração de vídeo",
        "agentes de IA",
      ],
      articleKeywords: [
        "como criar influencers de ia",
        "como criar um influencer de ia",
        "workflow de ai influencer",
        "criar influencer de ia",
        "pipeline de influencer virtual",
      ],
    },
    breadcrumbItems: [
      { name: "Início", href: "/" },
      { name: "Aprender", href: "/learn" },
      { name: "Como criar influencers de IA", href: HOW_TO_MAKE_AI_INFLUENCERS_PATH },
    ],
    eyebrow: "Aprender",
    lastUpdatedLabel: "Atualizado em 9 de abril de 2026",
    hero: {
      titleLine1: "Como criar influencers de IA",
      titleLine2: "sem deixar o workflow frágil",
      introBeforeFirstLink:
        "Se você está pesquisando como criar influencers de IA, o trabalho prático não é gerar um rosto virtual atraente. É montar um sistema de creator que se sustente em stills, vídeos curtos, revisão e handoff. É aí que um agente mais",
      firstLinkLabel: "AnyCap image generation",
      betweenLinks: ",",
      secondLinkLabel: "video generation",
      afterSecondLink:
        " e QA visual podem entregar algo mais útil do que um app de influencer de uma tela só.",
      summaryLabel: "Resumo direto",
      summaryText:
        "O workflow mais forte para AI influencer é em etapas. Gere primeiro uma identidade estável. Transforme esse still em um persona pack. Promova apenas os melhores stills para image-to-video. Depois inspecione o resultado antes do handoff. O AnyCap é útil aqui porque o agente consegue manter essas camadas dentro da mesma superfície de capacidades em vez de saltar entre geradores desconectados e QA manual.",
      imageAlt:
        "Influenciadora de beleza fictícia e refinada com ondas escuras brilhantes, joias douradas em camadas e maquiagem soft glam sentada a uma mesa de mármore em um estúdio-apartamento claro e luxuoso ao lado de um frasco de skincare sem rótulo e um telefone.",
      imageCaption:
        "Esta imagem hero mostra a tese central da página em um único frame: a identidade da creator já deve parecer crível antes de o workflow se ramificar em mais cenas, mais crops ou motion.",
    },
    proof: {
      eyebrow: "Prova gerada",
      title: "A persona precisa sobreviver a ações reais de UGC",
      intro:
        "Um retrato polido não basta. Usamos a identidade hero como âncora de referência e abrimos ações de product hold, vanity e unboxing para testar se a mesma creator ainda é percebida como a mesma pessoa em conteúdo de estilo commerce.",
      promptLabel: "Formato do prompt de persona pack",
      prompt:
        "preserve a mesma identidade fictícia de influenciadora de beleza da imagem hero e depois abra ações críveis de UGC: segurar produto, demonstração no vanity e unboxing na mesa sem perder o mesmo formato de rosto, pele morena quente, ondas castanho-espresso, maquiagem soft glam, joias douradas ou styling premium de lifestyle. Mantenha os produtos sem rótulo, as mãos naturais e a luz fotorealista.",
      signalsLabel: "Por que essa prova importa",
      signals: [
        "O mesmo rosto, cabelo, joias e styling de suéter se mantêm em três ações diferentes de creator-commerce.",
        "As imagens pressionam exatamente o ponto em que projetos de AI influencer costumam quebrar primeiro: frascos, mãos, props e contexto de produto vivido.",
        "Isto fica mais perto do uso real de UGC do que um único retrato hero porque a creator interage com objetos em vez de apenas posar.",
      ],
      caption:
        "Esses stills de continuação importam porque conteúdo de influencer raramente vive em apenas um hero shot. Se o rosto muda, as mãos quebram ou os produtos viram ruído assim que um frasco entra em cena, o workflow ainda não é reutilizável.",
      images: [
        {
          ...PERSONA_PACK_IMAGES[0],
          alt: "A mesma influenciadora fictícia de beleza da imagem hero segurando um frasco fosco de sérum sem rótulo perto do rosto em um interior de apartamento claro.",
          label: "Segurando o produto",
        },
        {
          ...PERSONA_PACK_IMAGES[1],
          alt: "A mesma influenciadora fictícia de beleza da imagem hero alcançando um frasco pump sem rótulo em um vanity de mármore claro.",
          label: "Demonstração no vanity",
        },
        {
          ...PERSONA_PACK_IMAGES[2],
          alt: "A mesma influenciadora fictícia de beleza da imagem hero abrindo uma caixa minimalista de skincare sobre uma mesa de mármore branco.",
          label: "Unboxing na mesa",
        },
      ],
    },
    quickAnswer: {
      label: "Resposta rápida",
      title: "Construa primeiro o sistema da persona",
      body:
        "Quando as pessoas dizem que querem um AI influencer, muitas vezes estão pedindo quatro trabalhos ao mesmo tempo: design de identidade, variação de conteúdo, motion short-form e entrega. O workflow mais limpo separa essas camadas para que o agente mantenha o ativo mais forte avançando, em vez de regenerar o conceito inteiro do zero o tempo todo.",
      takeaways: [
        "A pergunta útil não é como gerar uma única foto falsa de perfil. É como montar um sistema reutilizável de creator virtual.",
        "O melhor workflow com AnyCap começa pelo trabalho de identidade em still image, depois se ramifica em packs de cena, variações de motion e quality checks em vez de tratar cada prompt como um recomeço.",
        "O AnyCap importa aqui porque o agente consegue gerar, inspecionar, animar e entregar assets sem cair de volta em uma pilha de ferramentas desconectadas.",
      ],
    },
    workflow: {
      label: "Workflow",
      title: "Cinco passos do primeiro still até um workflow reutilizável de creator",
      stepLabelPrefix: "Passo",
      steps: [
        {
          title: "Defina a persona antes de correr atrás de cenas",
          body: "Trave primeiro a identidade: rosto, faixa de styling, tom de marca e o tipo de nicho que essa creator representa. Uma identidade fraca multiplica o drift depois.",
        },
        {
          title: "Gere o primeiro still forte",
          body: "Use text-to-image quando estiver começando do zero, ou image-to-image quando já houver uma referência que você queira preservar de forma mais rígida.",
        },
        {
          title: "Transforme um still em um persona pack",
          body: "Abra a identidade vencedora em alguns looks repetíveis: um retrato limpo, um frame casual de selfie e pelo menos um contexto de campanha ou produto.",
        },
        {
          title: "Anime apenas os stills que já funcionam",
          body: "Trate image-to-video como uma segunda etapa. Os vídeos de influencer mais fortes normalmente nascem de um still que já parece publicável antes de o motion ser adicionado.",
        },
        {
          title: "Inspecione e faça o handoff do resultado",
          body: "Use image reading ou video reading para detectar drift de texto visível, framing fraco ou contexto de produto errado e mantenha o arquivo reutilizável para revisão, compartilhamento ou publicação de página.",
        },
      ],
    },
    systemCards: [
      {
        title: "Persona pack, não um único prompt",
        body: "O resultado precisa se sustentar em várias cenas e proporções de crop. Uma imagem isolada e bonita não basta para sustentar uma identidade de creator.",
      },
      {
        title: "Motion é um ramo, não o ponto de partida",
        body: "Se o still não funciona, o vídeo normalmente piora. Comece com um frame que já pareça utilizável para perfil, thumbnail ou uso promocional.",
      },
      {
        title: "QA faz parte do workflow",
        body: "O agente consegue inspecionar se a imagem derivou, se rótulos viraram texto ilegível ou se um product shot já não bate mais com a promessa da página.",
      },
      {
        title: "Entrega importa depois da geração",
        body: "Um workflow só vira operação quando o resultado é fácil de revisar, reutilizar e publicar, em vez de virar mais um download aleatório no disco.",
      },
    ],
    validation: {
      label: "Validação em primeira mão",
      title: "O que verificamos antes de recomendar este workflow",
      cards: [
        {
          title: "Superfície de capacidades confirmada",
          body: "Uma checagem ao vivo do status do AnyCap em 9 de abril de 2026 confirmou que geracao de imagem, edicao de imagem, leitura de imagem, geracao de video, leitura de video, Drive, Page e recuperacao na web estavam disponiveis no ambiente atual.",
        },
        {
          title: "Schema conferido",
          body: "Nano Banana 2, Nano Banana Pro e Seedance 1.5 Pro foram conferidos no schema ao vivo antes de redigir esta página, para que os comandos de exemplo usem o formato atual de parâmetros.",
        },
        {
          title: "Imagem hero gerada",
          body: "O visual principal desta página foi regenerado via Nano Banana em uma direção realista, e não por um workflow estilizado de moodboard ou ilustração.",
        },
        {
          title: "Imagem hero inspecionada",
          body: "Image reading confirmou que a hero image atual se comporta como um asset realista de workflow de creator e não contém texto visível nem marca d'água.",
        },
      ],
    },
    modelChoice: {
      label: "Escolha de modelo",
      title: "Escolha o modelo pelo papel dentro do pipeline",
      cards: [
        {
          title: "Nano Banana Pro",
          label: "Melhor primeiro still realista",
          body: "Use quando a identidade precisa parecer estável desde o começo e você quer o retrato mais forte de creator realista ou uma ramificação que preserve melhor a referência.",
          href: "/models/nano-banana-pro",
        },
        {
          title: "Nano Banana 2",
          label: "Melhor para velocidade de iteração realista",
          body: "Use quando quiser testar rapidamente vários looks, ângulos e direções de cena realistas antes de promover o vencedor para vídeo.",
          href: "/models/nano-banana-2",
        },
        {
          title: "Seedance 1.5 Pro",
          label: "Melhor próximo passo de motion",
          body: "Use quando o still da persona já funciona e você quer um passe controlado de image-to-video em vez de saltar direto para o drift de text-to-video.",
          href: "/models/seedance-1-5-pro",
        },
      ],
    },
    comparison: {
      label: "Comparação",
      title: "Gerador de um clique vs agente com AnyCap",
      columns: {
        lens: "Lente",
        generic: "Gerador de um clique",
        workflow: "Agente com AnyCap",
      },
      rows: [
        {
          lens: "O que é otimizado primeiro",
          shallow: "Você começa por um resultado chamativo e torce para a identidade sobreviver às edições seguintes.",
          workflow: "Você trava primeiro o sistema da persona e depois se ramifica em cenas, crops e motion a partir da mesma âncora de identidade.",
        },
        {
          lens: "Como o vídeo é feito",
          shallow: "Você pede logo um vídeo final e aceita o drift de identidade que vier.",
          workflow: "Você promove o still mais forte para image-to-video, então a camada de motion começa com uma referência visual estável.",
        },
        {
          lens: "Controle de qualidade",
          shallow: "O workflow termina quando o render acaba.",
          workflow: "O agente inspeciona a saída antes do handoff e consegue detectar texto ruim, produto errado ou drift de cena.",
        },
        {
          lens: "Reutilização",
          shallow: "Cada entrega se comporta como um prompt novo a partir do zero.",
          workflow: "O influencer vira um asset pack reutilizável que pode alimentar mais conteúdo, mais canais e mais revisões.",
        },
      ],
    },
    commands: {
      label: "Exemplos de comando",
      title: "O workflow em comandos",
      ctaLabel: "Ver os detalhes da capability",
      examples: [
        {
          title: "Gere o primeiro still do influencer",
          code: [
            "anycap image generate \\",
            "  --model nano-banana-pro \\",
            '  --prompt "creator virtual fictícia, retrato realista de lifestyle influencer, iluminação suave premium, textura natural de pele, styling alinhado à marca, confiança olhando direto para a câmera, profundidade de câmera realista, sem texto legível, sem marca d\'água" \\',
            "  --param aspect_ratio=4:3 \\",
            "  --param resolution=2k \\",
            "  -o influencer-first-still.png",
          ].join("\n"),
        },
        {
          title: "Gere rápido uma segunda variante realista",
          code: [
            "anycap image generate \\",
            "  --model nano-banana-2 \\",
            '  --prompt "mesmo arquétipo fictício de creator, retrato realista em estilo selfie casual, iluminação interna quente, fundo de casa de creator, enquadramento social-ready, detalhe facial natural, sem texto legível, sem marca d\'água" \\',
            "  --param aspect_ratio=4:3 \\",
            "  --param resolution=2k \\",
            "  -o influencer-selfie-variant.png",
          ].join("\n"),
        },
        {
          title: "Refine o still vencedor preservando a identidade",
          code: [
            "anycap image generate \\",
            "  --model nano-banana-pro \\",
            "  --mode image-to-image \\",
            '  --prompt "preserve a mesma identidade fictícia da creator, deixe o retrato mais realista, refine textura de pele e iluminação, mantenha o rosto estável, mude para uma cena casual de selfie com telefone, sem texto legível, sem marca d\'água" \\',
            "  --param images=./influencer-first-still.png \\",
            "  --param aspect_ratio=4:3 \\",
            "  --param resolution=2k \\",
            "  -o influencer-refined-still.png",
          ].join("\n"),
        },
        {
          title: "Anime o still em um vídeo curto",
          code: [
            "anycap video generate \\",
            "  --model seedance-1.5-pro \\",
            "  --mode image-to-video \\",
            '  --prompt "gesto de mão sutil em estilo creator, delivery olhando para a câmera, movimento natural de cabeça, energia premium de social video, mantenha a identidade estável, sem overlays de texto" \\',
            "  --param images=./influencer-refined-still.png \\",
            "  --param aspect_ratio=9:16 \\",
            "  --param duration=5 \\",
            "  --param resolution=720p \\",
            "  -o influencer-short.mp4",
          ].join("\n"),
        },
        {
          title: "Faça QA do still ou do vídeo antes do handoff",
          code: [
            "anycap actions image-read \\",
            "  --file ./influencer-refined-still.png \\",
            '  --instruction "Descreva a creator, diga se a identidade ainda corresponde ao still original e mencione qualquer texto visível ou marca d\'água."',
          ].join("\n"),
        },
      ],
    },
    faq: {
      label: "FAQ",
      title: "Perguntas comuns antes de criar a primeira creator",
      items: [
        {
          question: "Qual é o maior erro que as pessoas cometem quando tentam criar um AI influencer?",
          answer:
            "Elas tratam o trabalho como um único prompt de imagem. Um AI influencer utilizável é um sistema repetível de persona: identidade, variações de cena, variações de motion, quality checks e handoff de entrega.",
        },
        {
          question: "Eu preciso primeiro de uma plataforma dedicada de AI influencer?",
          answer:
            "Nem sempre. Se o objetivo real é criar a persona, testar direções visuais, animar os stills mais fortes e manter os assets reutilizáveis, um agente com AnyCap geralmente é o workflow inicial mais limpo.",
        },
        {
          question: "Qual modelo do AnyCap devo testar primeiro?",
          answer:
            "Use Nano Banana Pro quando você já tiver uma imagem-fonte ou referência de persona para preservar; Nano Banana 2 quando quiser explorar rapidamente variações realistas de still; e Seedance 1.5 Pro apenas depois que um desses stills já estiver funcionando.",
        },
        {
          question: "O AnyCap também consegue lidar com voz para vídeos de AI influencer?",
          answer:
            "Hoje, o workflow público mais forte do AnyCap está na camada visual: criação de still, geração de vídeo e inspeção da saída. Se a narração for importante, trate a voz como uma camada separada de pós-produção em vez de forçá-la na primeira etapa visual.",
        },
      ],
    },
    nextStep: {
      label: "Próximo passo",
      title: "Ramifique para o workflow estreito de que você realmente precisa",
      cards: [
        {
          title: "Criar AI Influencer de Graça",
          href: "/learn/create-ai-influencer-for-free",
          body: "Use esta página de apoio quando a pergunta principal for como testar direções de persona com pouco custo antes de se comprometer com um loop maior de conteúdo.",
        },
        {
          title: "Como fazer vídeos de AI influencer",
          href: "/learn/how-to-make-ai-influencer-videos",
          body: "Vá para lá quando o still já estiver funcionando e o próximo trabalho for motion short-form, e não mais um retrato estático.",
        },
        {
          title: "Gerador de vídeo por IA a partir de imagem",
          href: "/learn/ai-video-generator-from-image",
          body: "Use esta página quando a tarefa for image-to-video de forma mais ampla, para além do nicho de influencer.",
        },
        {
          title: "O que é um AI influencer?",
          href: "/learn/what-is-an-ai-influencer",
          body: "Leia o explicador quando quiser a definição operacional antes de decidir qual ramo do workflow montar primeiro.",
        },
        {
          title: "Instalar AnyCap",
          href: "/start",
          body: "Vá para lá quando quiser o caminho mais curto deste artigo até um setup funcional de CLI.",
        },
        {
          title: "Geracao de imagem",
          href: "/capabilities/image-generation",
          body: "Veja a capability que cuida dos primeiros stills, das variações de persona e da ramificação de cenas neste workflow.",
        },
      ],
    },
  },
  id: {
    metadata: {
      title: "Cara membuat AI influencer dengan agen AI",
      description:
        "Gunakan AnyCap untuk menghasilkan creator virtual yang konsisten, bercabang ke still dan video variant, memeriksa output, dan menjaga workflow tetap reusable alih-alih bergantung pada aplikasi influencer satu klik.",
      openGraphTitle: "Cara membuat AI influencer dengan agen AI",
      openGraphDescription:
        "Panduan workflow untuk membangun pipeline AI influencer melalui image generation, image editing, image reading, video generation, dan surface delivery di AnyCap.",
      articleHeadline: "Cara membuat AI influencer dengan agen AI",
      articleDescription:
        "Workflow praktis untuk menciptakan persona AI influencer yang konsisten, mengubah identitas itu menjadi still dan motion yang bisa dipakai ulang, serta menjaga QA tetap berada di workflow agen yang sama.",
      articleAbout: [
        "AI influencer",
        "creator virtual",
        "image generation",
        "image understanding",
        "video generation",
        "agen AI",
      ],
      articleKeywords: [
        "cara membuat ai influencer",
        "cara membuat influencer ai",
        "workflow ai influencer",
        "buat ai influencer",
        "pipeline influencer virtual",
      ],
    },
    breadcrumbItems: [
      { name: "Beranda", href: "/" },
      { name: "Pelajari", href: "/learn" },
      { name: "Cara membuat AI influencer", href: HOW_TO_MAKE_AI_INFLUENCERS_PATH },
    ],
    eyebrow: "Pelajari",
    lastUpdatedLabel: "Diperbarui 9 April 2026",
    hero: {
      titleLine1: "Cara membuat AI influencer",
      titleLine2: "tanpa membuat workflow rapuh",
      introBeforeFirstLink:
        "Jika kamu mencari cara membuat AI influencer, pekerjaan praktisnya bukan menghasilkan satu wajah virtual yang menarik. Tugasnya adalah membangun sistem creator yang bisa tetap utuh di still, video pendek, review, dan handoff. Di situlah agen ditambah",
      firstLinkLabel: "AnyCap image generation",
      betweenLinks: ",",
      secondLinkLabel: "video generation",
      afterSecondLink:
        ", dan QA visual bisa memberi sesuatu yang lebih berguna daripada aplikasi influencer satu layar.",
      summaryLabel: "Ringkasan cepat",
      summaryText:
        "Workflow AI influencer yang paling kuat adalah workflow bertahap. Hasilkan identitas yang stabil terlebih dahulu. Ubah still itu menjadi persona pack. Naikkan hanya still terbaik ke image-to-video. Lalu periksa hasilnya sebelum handoff. AnyCap berguna di sini karena agen bisa menjaga semua layer itu tetap berada di satu capability surface alih-alih berpindah-pindah antara generator yang terpisah dan langkah QA manual.",
      imageAlt:
        "AI beauty influencer fiktif yang polished dengan gelombang rambut gelap mengilap, perhiasan emas berlapis, dan riasan soft glam duduk di meja marmer dalam studio-apartemen mewah yang terang di samping botol skincare tanpa label dan sebuah ponsel.",
      imageCaption:
        "Hero image ini menunjukkan klaim inti halaman dalam satu frame: identitas creator seharusnya sudah terasa meyakinkan sebelum workflow bercabang ke lebih banyak adegan, crop, atau motion.",
    },
    proof: {
      eyebrow: "Bukti hasil generasi",
      title: "Persona harus bertahan dalam aksi UGC yang nyata",
      intro:
        "Satu potret yang rapi saja tidak cukup. Kami memakai identitas hero sebagai reference anchor lalu bercabang ke aksi product-hold, vanity, dan unboxing untuk menguji apakah creator yang sama masih terasa seperti orang yang sama dalam konten bergaya commerce.",
      promptLabel: "Bentuk prompt persona pack",
      prompt:
        "pertahankan identitas AI beauty influencer fiktif yang sama dari hero image, lalu bercabang ke aksi UGC yang meyakinkan: memegang produk, demo di vanity, dan desk unboxing tanpa kehilangan bentuk wajah yang sama, warna kulit tan hangat, gelombang rambut cokelat espresso, makeup soft glam, perhiasan emas, atau styling lifestyle premium. Jaga produk tetap tanpa label, tangan tetap alami, dan pencahayaan tetap fotorealistis.",
      signalsLabel: "Mengapa bukti ini penting",
      signals: [
        "Wajah, rambut, perhiasan, dan styling sweater yang sama tetap konsisten di tiga aksi creator-commerce yang berbeda.",
        "Gambar-gambar ini menekan titik di mana proyek AI influencer biasanya pertama kali rusak: botol, tangan, properti, dan konteks produk yang lived-in.",
        "Ini lebih dekat ke penggunaan UGC nyata daripada satu hero portrait karena creator berinteraksi dengan objek, bukan hanya berpose.",
      ],
      caption:
        "Stills lanjutan seperti ini penting karena konten influencer jarang hidup sebagai satu hero shot saja. Jika wajah berubah, tangan rusak, atau produk berubah jadi gibberish begitu botol masuk ke frame, workflow itu belum reusable.",
      images: [
        {
          ...PERSONA_PACK_IMAGES[0],
          alt: "AI beauty influencer fiktif yang sama dari hero image memegang botol serum buram tanpa label di dekat wajahnya di interior apartemen yang terang.",
          label: "Memegang produk",
        },
        {
          ...PERSONA_PACK_IMAGES[1],
          alt: "AI beauty influencer fiktif yang sama dari hero image meraih botol pump tanpa label di vanity marmer yang terang.",
          label: "Demo di vanity",
        },
        {
          ...PERSONA_PACK_IMAGES[2],
          alt: "AI beauty influencer fiktif yang sama dari hero image sedang membuka paket skincare minimalis di meja marmer putih.",
          label: "Desk unboxing",
        },
      ],
    },
    quickAnswer: {
      label: "Jawaban cepat",
      title: "Bangun sistem personanya terlebih dahulu",
      body:
        "Ketika orang mengatakan mereka ingin AI influencer, sering kali mereka sebenarnya menginginkan empat pekerjaan sekaligus: desain identitas, variasi konten, motion short-form, dan delivery. Workflow yang paling bersih memisahkan layer-layer itu agar agen bisa terus membawa aset terbaik ke depan, bukan terus-menerus membuat ulang seluruh konsep dari nol.",
      takeaways: [
        "Pertanyaan yang berguna bukan bagaimana menghasilkan satu foto profil palsu. Pertanyaannya adalah bagaimana membangun sistem creator virtual yang reusable.",
        "Workflow AnyCap terbaik dimulai dari pekerjaan identitas pada still image, lalu bercabang ke scene pack, motion variant, dan quality check, alih-alih memperlakukan setiap prompt sebagai awal yang benar-benar baru.",
        "AnyCap penting di sini karena agen bisa menghasilkan, memeriksa, menganimasikan, dan menyerahkan asset tanpa runtuh kembali ke tumpukan tool yang terpisah-pisah.",
      ],
    },
    workflow: {
      label: "Workflow",
      title: "Lima langkah dari still pertama ke workflow creator yang reusable",
      stepLabelPrefix: "Langkah",
      steps: [
        {
          title: "Tentukan persona sebelum mengejar adegan",
          body: "Kunci identitas terlebih dahulu: wajah, rentang styling, tone brand, dan jenis niche yang diwakili creator ini. Identitas yang lemah akan memperbesar drift di tahap berikutnya.",
        },
        {
          title: "Hasilkan still pertama yang kuat",
          body: "Gunakan text-to-image ketika mulai dari nol, atau image-to-image ketika kamu sudah punya referensi yang ingin dipertahankan dengan lebih ketat.",
        },
        {
          title: "Ubah satu still menjadi persona pack",
          body: "Cabangkan identitas pemenang ke beberapa look yang bisa diulang: potret bersih, frame selfie kasual, dan setidaknya satu konteks campaign atau produk.",
        },
        {
          title: "Animasikan hanya still yang memang sudah bekerja",
          body: "Perlakukan image-to-video sebagai langkah kedua. Video influencer yang paling kuat biasanya berasal dari still yang sudah tampak publishable bahkan sebelum motion ditambahkan.",
        },
        {
          title: "Periksa dan lakukan handoff output",
          body: "Gunakan image reading atau video reading untuk menangkap text drift yang terlihat, framing yang lemah, atau konteks produk yang salah, lalu jaga file tetap reusable untuk review, sharing, atau page publishing.",
        },
      ],
    },
    systemCards: [
      {
        title: "Persona pack, bukan satu prompt",
        body: "Output-nya harus tetap menyatu di banyak adegan dan rasio crop. Satu gambar cantik yang berdiri sendiri tidak cukup untuk menopang identitas creator.",
      },
      {
        title: "Motion adalah cabang, bukan titik awal",
        body: "Jika still-nya tidak bekerja, video biasanya justru jadi lebih buruk. Mulailah dari frame yang sudah terasa layak untuk profil, thumbnail, atau penggunaan promo.",
      },
      {
        title: "QA adalah bagian dari workflow",
        body: "Agen bisa memeriksa apakah gambar mengalami drift, apakah label berubah menjadi teks yang tidak masuk akal, atau apakah product shot tidak lagi sesuai dengan janji halaman.",
      },
      {
        title: "Delivery penting setelah generasi",
        body: "Workflow baru benar-benar operasional ketika hasilnya mudah ditinjau, dipakai ulang, dan dipublikasikan, alih-alih hidup sebagai satu file acak lagi di folder download.",
      },
    ],
    validation: {
      label: "Validasi langsung",
      title: "Yang kami cek sebelum merekomendasikan workflow ini",
      cards: [
        {
          title: "Capability surface terkonfirmasi",
          body: "Pemeriksaan status AnyCap secara live pada 9 April 2026 mengonfirmasi bahwa image generation, image editing, image reading, video generation, video reading, Drive, Page, dan web retrieval tersedia di environment saat ini.",
        },
        {
          title: "Schema sudah dicek",
          body: "Nano Banana 2, Nano Banana Pro, dan Seedance 1.5 Pro dicek ke schema live sebelum halaman ini ditulis agar contoh command memakai bentuk parameter yang berlaku sekarang.",
        },
        {
          title: "Hero image dihasilkan",
          body: "Visual utama halaman ini digenerasikan ulang melalui Nano Banana dengan arah yang realistis, bukan melalui workflow ilustrasi atau board yang terlalu stylized.",
        },
        {
          title: "Hero image diperiksa",
          body: "Image reading mengonfirmasi bahwa hero image saat ini terbaca seperti asset workflow creator yang realistis dan tidak mengandung teks yang terlihat atau watermark.",
        },
      ],
    },
    modelChoice: {
      label: "Pilihan model",
      title: "Pilih model berdasarkan perannya di pipeline",
      cards: [
        {
          title: "Nano Banana Pro",
          label: "Still realistis pertama terbaik",
          body: "Gunakan ketika identitas harus terasa stabil sejak awal dan kamu ingin potret creator realistis yang paling kuat atau cabang yang lebih baik dalam mempertahankan referensi.",
          href: "/models/nano-banana-pro",
        },
        {
          title: "Nano Banana 2",
          label: "Terbaik untuk kecepatan iterasi realistis",
          body: "Gunakan ketika kamu ingin menguji beberapa look, sudut, dan arah adegan realistis dengan cepat sebelum menaikkan pemenangnya ke video.",
          href: "/models/nano-banana-2",
        },
        {
          title: "Seedance 1.5 Pro",
          label: "Langkah motion berikutnya terbaik",
          body: "Gunakan ketika persona still-nya sudah bekerja dan kamu ingin image-to-video pass yang terkontrol daripada langsung melompat ke drift text-to-video.",
          href: "/models/seedance-1-5-pro",
        },
      ],
    },
    comparison: {
      label: "Perbandingan",
      title: "Generator satu klik vs agen plus AnyCap",
      columns: {
        lens: "Sudut pandang",
        generic: "Generator satu klik",
        workflow: "Agen plus AnyCap",
      },
      rows: [
        {
          lens: "Apa yang dioptimalkan lebih dulu",
          shallow: "Kamu memulai dari output yang flashy dan berharap identitasnya tetap bertahan setelah edit berikutnya.",
          workflow: "Kamu mengunci sistem persona lebih dulu, lalu bercabang ke adegan, crop, dan motion dari anchor identitas yang sama.",
        },
        {
          lens: "Bagaimana video dibuat",
          shallow: "Kamu langsung meminta video final dan menerima drift identitas apa pun yang muncul.",
          workflow: "Kamu menaikkan still terkuat ke image-to-video sehingga layer motion dimulai dari referensi visual yang stabil.",
        },
        {
          lens: "Kontrol kualitas",
          shallow: "Workflow selesai saat render selesai.",
          workflow: "Agen memeriksa output sebelum handoff dan bisa menangkap teks yang buruk, produk yang salah, atau drift adegan.",
        },
        {
          lens: "Reuse",
          shallow: "Setiap deliverable berperilaku seperti prompt baru dari nol.",
          workflow: "Influencer itu menjadi asset pack reusable yang bisa memberi makan lebih banyak konten, lebih banyak channel, dan lebih banyak review.",
        },
      ],
    },
    commands: {
      label: "Contoh perintah",
      title: "Workflow dalam bentuk command",
      ctaLabel: "Lihat detail capability",
      examples: [
        {
          title: "Hasilkan still influencer pertama",
          code: [
            "anycap image generate \\",
            "  --model nano-banana-pro \\",
            '  --prompt "creator virtual fiktif, potret lifestyle-influencer realistis, pencahayaan lembut premium, tekstur kulit alami, styling yang aman untuk brand, rasa percaya diri langsung ke kamera, depth kamera realistis, tanpa teks yang terbaca, tanpa watermark" \\',
            "  --param aspect_ratio=4:3 \\",
            "  --param resolution=2k \\",
            "  -o influencer-first-still.png",
          ].join("\n"),
        },
        {
          title: "Hasilkan cepat varian realistis kedua",
          code: [
            "anycap image generate \\",
            "  --model nano-banana-2 \\",
            '  --prompt "arketype creator fiktif yang sama, potret realistis bergaya selfie kasual, pencahayaan indoor hangat, background rumah creator, framing yang siap untuk sosial, detail wajah alami, tanpa teks yang terbaca, tanpa watermark" \\',
            "  --param aspect_ratio=4:3 \\",
            "  --param resolution=2k \\",
            "  -o influencer-selfie-variant.png",
          ].join("\n"),
        },
        {
          title: "Refine still pemenang sambil menjaga identitas",
          code: [
            "anycap image generate \\",
            "  --model nano-banana-pro \\",
            "  --mode image-to-image \\",
            '  --prompt "pertahankan identitas creator fiktif yang sama, buat potret lebih realistis, perbaiki tekstur kulit dan pencahayaan, jaga wajah tetap stabil, ubah menjadi adegan selfie ponsel yang kasual, tanpa teks yang terbaca, tanpa watermark" \\',
            "  --param images=./influencer-first-still.png \\",
            "  --param aspect_ratio=4:3 \\",
            "  --param resolution=2k \\",
            "  -o influencer-refined-still.png",
          ].join("\n"),
        },
        {
          title: "Animasikan still menjadi video pendek",
          code: [
            "anycap video generate \\",
            "  --model seedance-1.5-pro \\",
            "  --mode image-to-video \\",
            '  --prompt "gerakan tangan halus bergaya creator, delivery langsung ke kamera, gerakan kepala alami, energi social-video premium, jaga identitas tetap stabil, tanpa overlay teks" \\',
            "  --param images=./influencer-refined-still.png \\",
            "  --param aspect_ratio=9:16 \\",
            "  --param duration=5 \\",
            "  --param resolution=720p \\",
            "  -o influencer-short.mp4",
          ].join("\n"),
        },
        {
          title: "Lakukan QA pada still atau video sebelum handoff",
          code: [
            "anycap actions image-read \\",
            "  --file ./influencer-refined-still.png \\",
            '  --instruction "Jelaskan creator-nya, sebutkan apakah identitasnya masih cocok dengan still asli, dan sebutkan teks yang terlihat atau watermark jika ada."',
          ].join("\n"),
        },
      ],
    },
    faq: {
      label: "FAQ",
      title: "Pertanyaan umum sebelum kamu membangun creator pertama",
      items: [
        {
          question: "Apa kesalahan terbesar yang dilakukan orang saat mencoba membangun AI influencer?",
          answer:
            "Mereka memperlakukan pekerjaan ini seperti satu image prompt saja. AI influencer yang bisa dipakai adalah sistem persona yang repeatable: identitas, scene variant, motion variant, quality check, dan delivery handoff.",
        },
        {
          question: "Apakah saya perlu platform AI influencer khusus terlebih dahulu?",
          answer:
            "Tidak selalu. Jika tujuan sebenarnya adalah membuat persona, menguji arah visual, menganimasikan still terkuat, dan menjaga asset tetap reusable, agen plus AnyCap sering kali menjadi workflow awal yang lebih bersih.",
        },
        {
          question: "Model AnyCap mana yang sebaiknya saya coba lebih dulu?",
          answer:
            "Gunakan Nano Banana Pro ketika kamu sudah punya source image atau referensi persona yang perlu dipertahankan, Nano Banana 2 ketika ingin mengeksplorasi still variant realistis dengan cepat, dan Seedance 1.5 Pro hanya setelah salah satu still itu benar-benar bekerja.",
        },
        {
          question: "Bisakah AnyCap juga menangani voice untuk video AI influencer?",
          answer:
            "Workflow publik AnyCap yang paling kuat saat ini ada di layer visual: pembuatan still, video generation, dan pemeriksaan output. Jika narasi penting, perlakukan voice sebagai layer post-production terpisah daripada memaksakannya ke visual pass pertama.",
        },
      ],
    },
    nextStep: {
      label: "Langkah berikutnya",
      title: "Bercabang ke workflow sempit yang benar-benar kamu butuhkan",
      cards: [
        {
          title: "Buat AI Influencer Gratis",
          href: "/learn/create-ai-influencer-for-free",
          body: "Gunakan halaman pendukung ini ketika pertanyaan utamanya adalah bagaimana menguji arah persona dengan biaya rendah sebelum berkomitmen pada loop konten yang lebih besar.",
        },
        {
          title: "Cara membuat video AI influencer",
          href: "/learn/how-to-make-ai-influencer-videos",
          body: "Pindah ke sana ketika still-nya sudah bekerja dan pekerjaan berikutnya adalah motion short-form, bukan potret statis lain.",
        },
        {
          title: "Generator video AI dari gambar",
          href: "/learn/ai-video-generator-from-image",
          body: "Gunakan halaman workflow ini ketika tugas yang lebih luas adalah konsistensi image-to-video di luar niche influencer saja.",
        },
        {
          title: "Apa itu AI influencer?",
          href: "/learn/what-is-an-ai-influencer",
          body: "Baca halaman penjelas ini jika kamu ingin definisi operasionalnya sebelum memutuskan cabang workflow mana yang sebaiknya dibangun terlebih dahulu.",
        },
        {
          title: "Install AnyCap",
          href: "/start",
          body: "Masuk ke sini jika kamu ingin jalur paling singkat dari artikel ini ke setup CLI yang berfungsi.",
        },
        {
          title: "Image Generation",
          href: "/capabilities/image-generation",
          body: "Lihat capability surface yang menangani still pertama, persona variant, dan branching adegan pada workflow ini.",
        },
      ],
    },
  },
} as const;

export function getHowToMakeAIInfluencersMetadata(locale: SiteLocale): Metadata {
  const content = contentByLocale[locale as keyof typeof contentByLocale] ?? enContent;

  return {
    title: content.metadata.title,
    description: content.metadata.description,
    alternates: { canonical: HOW_TO_MAKE_AI_INFLUENCERS_PATH },
    openGraph: {
      type: "website",
      locale: getLocaleConfig(locale).ogLocale,
      url: HOW_TO_MAKE_AI_INFLUENCERS_PATH,
      siteName: siteConfig.siteName,
      title: content.metadata.openGraphTitle,
      description: content.metadata.openGraphDescription,
    },
  };
}

export function getHowToMakeAIInfluencersPageData(locale: SiteLocale) {
  const content = contentByLocale[locale as keyof typeof contentByLocale] ?? enContent;

  return {
    ...content,
    articleJsonLd: createTechArticleJsonLd({
      headline: content.metadata.articleHeadline,
      description: content.metadata.articleDescription,
      path: HOW_TO_MAKE_AI_INFLUENCERS_PATH,
      locale,
      about: [...content.metadata.articleAbout],
      keywords: [...content.metadata.articleKeywords],
      datePublished: LAST_UPDATED_ISO,
      dateModified: LAST_UPDATED_ISO,
    }),
    faqJsonLd: createFaqPageJsonLd(content.faq.items),
    heroImage: HERO_IMAGE,
  };
}
