import type { Metadata } from "next";
import { createFaqPageJsonLd, createTechArticleJsonLd } from "@/lib/schema";
import { getLocaleConfig, siteConfig, type SiteLocale } from "@/lib/site";

export const WHAT_IS_AN_AI_INFLUENCER_PATH = "/learn/what-is-an-ai-influencer";

const PAGE_RESOURCE_BASE = "https://cdn.anycap.ai/page_resource/learning";
const LAST_UPDATED_ISO = "2026-04-09";
const ROLE_EXAMPLE_IMAGES = {
  host: `${PAGE_RESOURCE_BASE}/what-is-an-ai-influencer-hero.png`,
  lifestyle: `${PAGE_RESOURCE_BASE}/create-ai-influencer-for-free-hero.png`,
  reviewer: `${PAGE_RESOURCE_BASE}/how-to-make-ai-influencer-videos-product-demo.png`,
} as const;

const enContent = {
    metadata: {
      title: "What Is an AI Influencer?",
      description:
        "An AI influencer is not just an avatar. It can be one reusable creator persona or a small roster of influencer characters, each with stills, motion variants, distribution formats, and quality control loops.",
      openGraphTitle: "What Is an AI Influencer?",
      openGraphDescription:
        "A practical explainer on what an AI influencer actually is, how it differs from adjacent concepts, and where an AnyCap-style workflow fits.",
      articleHeadline: "What Is an AI Influencer?",
      articleDescription:
        "A workflow-aware definition of AI influencers that separates the persona layer, motion layer, distribution layer, and QA layer, whether you are shaping one creator or a small roster of influencer personas.",
      articleAbout: [
        "AI influencer",
        "Virtual creator",
        "Creator workflows",
        "Image generation",
        "Video generation",
      ],
      articleKeywords: [
        "what is an ai influencer",
        "ai influencer meaning",
        "virtual influencer definition",
        "ai influencer explained",
        "how ai influencers work",
      ],
    },
    breadcrumbItems: [
      { name: "Home", href: "/" },
      { name: "Learn", href: "/learn" },
      { name: "What Is an AI Influencer?", href: WHAT_IS_AN_AI_INFLUENCER_PATH },
    ],
    eyebrow: "Learn",
    lastUpdatedLabel: "Last updated April 9, 2026",
    hero: {
      titleLine1: "What is an AI influencer?",
      titleLine2: "It is more than an avatar",
      intro:
        "An AI influencer is not just a pretty generated face. It is a repeatable creator system with still-image identity, motion options, channel-ready outputs, and a review loop. That system can support one creator or several influencer personas, but each role still needs its own stable identity. That is the difference between a gimmick and a workflow an agent can actually support.",
      summaryLabel: "Answer-first summary",
      summaryText:
        "The useful definition of an AI influencer has four layers: persona, motion, distribution, and QA. AnyCap is most relevant when you want the agent to work across those layers for one creator or a small roster instead of stopping at one generated image.",
    },
    roleDirections: {
      label: "Role directions",
      title: "One page should show more than one influencer look",
      intro:
        "An AI influencer workflow does not stop at one face. You can generate several influencer-style role directions in parallel, compare which one feels most usable, then promote the winner into a cleaner hero still. A practical pattern is `nano-banana-2` for faster role exploration and `nano-banana-pro` for the selected refinement pass.",
      modelPathLabel: "Suggested model path",
      cards: [
        {
          title: "Talk-to-camera host",
          label: "Influencer role example",
          modelPath: "Nano Banana 2 -> Nano Banana Pro",
          body: "A warm editorial creator direction for explainers, daily updates, and direct-to-camera social content.",
          src: ROLE_EXAMPLE_IMAGES.host,
          alt: "Photoreal portrait of a fictional talk-to-camera creator in a champagne blouse inside a soft neutral studio apartment.",
        },
        {
          title: "Lifestyle creator",
          label: "Influencer role example",
          modelPath: "Nano Banana 2 -> Nano Banana Pro",
          body: "A lighter lifestyle persona for routine content, apartment vlogs, and general creator-brand positioning.",
          src: ROLE_EXAMPLE_IMAGES.lifestyle,
          alt: "Photoreal portrait of a fictional lifestyle influencer smiling in a bright neutral apartment with a soft creator aesthetic.",
        },
        {
          title: "Product reviewer",
          label: "Influencer role example",
          modelPath: "Nano Banana 2 -> Nano Banana Pro",
          body: "A creator-commerce direction for product demos, skincare reviews, and sponsor-style recommendation content.",
          src: ROLE_EXAMPLE_IMAGES.reviewer,
          alt: "Photoreal portrait of a fictional product-review influencer holding an unlabeled amber bottle in a clean creator setup.",
        },
      ],
    },
    quickAnswer: {
      label: "Quick answer",
      title: "The creator system matters more than the face",
      body:
        "A face generator can make a portrait. An AI influencer has to survive more than that. One workflow can support a single virtual creator or a small roster of influencer roles, but each identity has to stay coherent across several frames. The outputs have to fit channels that humans actually use. The review loop has to catch drift before the work ships. Those are workflow problems, not only image problems.",
      takeaways: [
        "An AI influencer is a workflow system, not just a face generator.",
        "The four practical layers are persona stills, motion, distribution, and QA.",
        "You can generate several influencer-style character stills first, but each role still needs its own identity pack and review loop.",
        "AnyCap is most relevant once the question shifts from `can I generate one image?` to `how do I keep the creator reusable across outputs?`",
      ],
    },
    definitionLayers: {
      label: "Definition layers",
      title: "Four layers define whether the creator is usable",
      cards: [
        {
          title: "Persona layer",
          body: "This is the still-image identity system: face, niche, wardrobe range, and brand tone. It can cover one creator or a small roster of influencer roles, but each persona still needs a stable spec.",
        },
        {
          title: "Motion layer",
          body: "This is where stills become clips. It can be subtle social motion, creator-to-camera delivery, or campaign-style video branches.",
        },
        {
          title: "Distribution layer",
          body: "This is where the creator stops being a concept and starts fitting a channel: profile image, reel cover, short-form clip, landing-page asset, or promo gallery.",
        },
        {
          title: "QA layer",
          body: "This is where teams catch drift, bad text, weak crops, and awkward scene details before the output reaches humans.",
        },
      ],
    },
    comparison: {
      label: "Comparison",
      title: "AI influencer vs adjacent concepts",
      columns: {
        concept: "Concept",
        meaning: "What it means",
        question: "Strongest question",
      },
      rows: [
        {
          concept: "AI influencer",
          definition: "A reusable creator system with identity, content variants, and channel-ready outputs.",
          strongestQuestion:
            "How do I keep this creator usable across stills, clips, and reviews?",
        },
        {
          concept: "Avatar generator",
          definition: "A tool that creates one avatar or profile-style representation.",
          strongestQuestion: "How do I make one face or icon quickly?",
        },
        {
          concept: "Faceless content workflow",
          definition: "A content system where the creator identity is intentionally not front-and-center.",
          strongestQuestion:
            "How do I publish repeatable short-form content without an on-screen person?",
        },
        {
          concept: "AI UGC actor",
          definition:
            "A generated spokesperson or ad-style performer, often closer to campaign production than influencer identity-building.",
          strongestQuestion:
            "How do I make a believable promo actor for one campaign or ad format?",
        },
      ],
    },
    workflow: {
      label: "Workflow",
      title: "The shortest path from concept to workflow",
      stepLabelPrefix: "Step",
      steps: [
        {
          title: "Define the creator identity",
          body: "Start with the niche, audience, and still-image tone before you decide whether this creator even needs video.",
        },
        {
          title: "Generate a small still pack",
          body: "Create a few realistic images that test whether the identity can survive different scenes or crops. If you want multiple influencer roles such as beauty, fashion, or product-review personas, make a separate pack for each one instead of blending them together.",
        },
        {
          title: "Choose where the creator actually lives",
          body: "Decide whether the output is a profile, a campaign image, a short-form clip, or a repeatable channel asset.",
        },
        {
          title: "Add motion only if the stills already work",
          body: "If the creator identity is weak, motion usually makes the problem more obvious rather than more believable.",
        },
        {
          title: "Keep QA inside the system",
          body: "A creator becomes operational only when there is a clear review loop before human delivery.",
        },
      ],
    },
    modelChoice: {
      label: "Model choice",
      title: "Use Nano Banana 2 or Pro by role",
      cards: [
        {
          title: "Nano Banana 2",
          label: "Best for faster role exploration",
          body: "Use this when you want to generate several different influencer-style role images quickly and compare which persona direction deserves more work.",
          href: "/models/nano-banana-2",
        },
        {
          title: "Nano Banana Pro",
          label: "Best for cleaner hero stills",
          body: "Use this when one role already works and you want a stronger realistic hero portrait or a tighter image-to-image refinement pass for that influencer identity.",
          href: "/models/nano-banana-pro",
        },
      ],
    },
    validation: {
      label: "First-hand validation",
      title: "What we checked before defining the term this way",
      cards: [
        {
          title: "Capability surface confirmed",
          body: "AnyCap status was rechecked on April 9, 2026 before this explainer was written. Image generation, video generation, image reading, video reading, Drive, and Page were available.",
        },
        {
          title: "Definition kept operational",
          body: "This page does not define AI influencers as a social trend only. It defines them by the workflow layers needed to keep one creator or a small roster usable.",
        },
        {
          title: "Product fit kept clear",
          body: "The page explains where AnyCap fits in the stack instead of implying that AnyCap is a dedicated social scheduling or voice-cloning platform.",
        },
        {
          title: "Cluster support confirmed",
          body: "The explainer was written to support the still, video, and low-cost workflow pages without duplicating their command-level details.",
        },
      ],
    },
    commands: {
      label: "Command examples",
      title: "Build a small influencer roster in commands",
      ctaLabel: "Browse Image Generation",
      examples: [
        {
          title: "Generate several influencer-style roles fast",
          code: [
            "anycap image generate \\",
            "  --model nano-banana-2 \\",
            '  --prompt "fictional beauty influencer, realistic creator portrait, premium skincare niche, soft daylight, natural skin texture, brand-safe styling, no readable text, no watermark" \\',
            "  --param aspect_ratio=4:3 \\",
            "  --param resolution=2k \\",
            "  -o influencer-beauty-role.png",
            "",
            "anycap image generate \\",
            "  --model nano-banana-2 \\",
            '  --prompt "fictional fashion influencer, realistic street-style creator portrait, editorial pose, clean urban backdrop, natural facial detail, no readable text, no watermark" \\',
            "  --param aspect_ratio=4:3 \\",
            "  --param resolution=2k \\",
            "  -o influencer-fashion-role.png",
            "",
            "anycap image generate \\",
            "  --model nano-banana-2 \\",
            '  --prompt "fictional product-review influencer, realistic creator portrait, direct-to-camera confidence, home-studio lighting, ecommerce-friendly styling, no readable text, no watermark" \\',
            "  --param aspect_ratio=4:3 \\",
            "  --param resolution=2k \\",
            "  -o influencer-review-role.png",
          ].join("\n"),
        },
        {
          title: "Polish the winning role with Nano Banana Pro",
          code: [
            "anycap image generate \\",
            "  --model nano-banana-pro \\",
            "  --mode image-to-image \\",
            '  --prompt "preserve the same fictional beauty influencer identity, make the portrait more realistic and polished, stronger hero framing, cleaner lighting, premium campaign-ready finish, no readable text, no watermark" \\',
            "  --param images=./influencer-beauty-role.png \\",
            "  --param aspect_ratio=4:3 \\",
            "  --param resolution=2k \\",
            "  -o influencer-beauty-role-pro.png",
          ].join("\n"),
        },
      ],
    },
    faq: {
      label: "FAQ",
      title: "Common questions about the definition",
      items: [
        {
          question: "Is an AI influencer the same as an avatar generator?",
          answer:
            "No. An avatar generator can make one face or one profile image. An AI influencer is broader: it is the repeatable creator system around that identity.",
        },
        {
          question: "Does an AI influencer have to be a talking video character?",
          answer:
            "Not always. Some AI influencers live mostly as still-image creators, product-campaign personas, or short-form visual brands. Motion is only one layer.",
        },
        {
          question: "What makes an AI influencer operational instead of just interesting?",
          answer:
            "The identity has to hold across scenes, the outputs need to fit real channels, and the team needs a QA and delivery path instead of a pile of one-off assets.",
        },
        {
          question: "Can one workflow generate multiple AI influencer characters?",
          answer:
            "Yes. One workflow can support a small roster of influencer personas such as a beauty creator, product reviewer, or lifestyle host. The important part is treating each role as its own stable creator identity with its own still pack, niche, and QA pass.",
        },
        {
          question: "Where does AnyCap fit in that stack?",
          answer:
            "AnyCap fits around the generation, QA, and delivery layers. The agent can create the persona stills, animate them, inspect the output, and hand the result to humans through the same workflow.",
        },
      ],
    },
    nextStep: {
      label: "Next step",
      title: "Move from definition into an actual workflow",
      cards: [
        {
          title: "How to Make AI Influencers",
          href: "/learn/how-to-make-ai-influencers",
          body: "Go to the anchor page when you want the full workflow instead of the concept definition.",
        },
        {
          title: "Create AI Influencer for Free",
          href: "/learn/create-ai-influencer-for-free",
          body: "Use this when the next question is how to test the concept cheaply before committing to a bigger stack.",
        },
        {
          title: "How to Make AI Influencer Videos",
          href: "/learn/how-to-make-ai-influencer-videos",
          body: "Go here when the concept already makes sense and the next step is image-to-video motion.",
        },
        {
          title: "Image Generation",
          href: "/capabilities/image-generation",
          body: "Browse the capability surface that powers the persona layer described on this page.",
        },
        {
          title: "Video Generation",
          href: "/capabilities/video-generation",
          body: "Browse the capability surface that powers the motion layer described on this page.",
        },
        {
          title: "Install AnyCap",
          href: "/guides/install-anycap",
          body: "Use this when you want to move from the definition into a working CLI workflow.",
        },
      ],
    },
} as const;

const contentByLocale = {
  en: enContent,
  "pt-br": {
    metadata: {
      title: "O que é um AI influencer?",
      description:
        "Um AI influencer não é só um avatar. Ele pode ser uma persona de creator reutilizável ou uma pequena linha de personagens influencer, cada um com stills, variantes de motion, formatos de distribuição e loops de controle de qualidade.",
      openGraphTitle: "O que é um AI influencer?",
      openGraphDescription:
        "Um explicador prático sobre o que um AI influencer realmente é, como ele difere de conceitos vizinhos e onde entra um workflow ao estilo AnyCap.",
      articleHeadline: "O que é um AI influencer?",
      articleDescription:
        "Uma definição de AI influencer orientada a workflow que separa camada de persona, camada de motion, camada de distribuição e camada de QA, seja para uma creator ou para uma pequena linha de personas.",
      articleAbout: [
        "AI influencer",
        "creator virtual",
        "workflows de creator",
        "geração de imagem",
        "geração de vídeo",
      ],
      articleKeywords: [
        "o que é ai influencer",
        "significado de ai influencer",
        "definição de influencer virtual",
        "ai influencer explicado",
        "como ai influencers funcionam",
      ],
    },
    breadcrumbItems: [
      { name: "Início", href: "/" },
      { name: "Aprender", href: "/learn" },
      { name: "O que é um AI influencer?", href: WHAT_IS_AN_AI_INFLUENCER_PATH },
    ],
    eyebrow: "Aprender",
    lastUpdatedLabel: "Atualizado em 9 de abril de 2026",
    hero: {
      titleLine1: "O que é um AI influencer?",
      titleLine2: "É mais do que um avatar",
      intro:
        "Um AI influencer não é apenas um rosto bonito gerado por IA. É um sistema repetível de creator com identidade em still image, opções de motion, saídas prontas para canal e um loop de revisão. Esse sistema pode sustentar uma creator ou várias personas de influencer, mas cada papel ainda precisa da sua própria identidade estável. Essa é a diferença entre um truque e um workflow que um agente realmente consegue apoiar.",
      summaryLabel: "Resumo direto",
      summaryText:
        "A definição útil de AI influencer tem quatro camadas: persona, motion, distribuição e QA. O AnyCap se torna mais relevante quando você quer que o agente atravesse essas camadas para uma creator ou para uma pequena linha de personas, em vez de parar em uma única imagem gerada.",
    },
    roleDirections: {
      label: "Direções de papel",
      title: "Uma página deve mostrar mais de um visual de influencer",
      intro:
        "Um workflow de AI influencer não para em um único rosto. Você pode gerar várias direções de papel em paralelo, comparar qual parece mais utilizável e depois promover o vencedor para um hero still mais limpo. Um padrão prático é `nano-banana-2` para explorar papéis com mais velocidade e `nano-banana-pro` para o passe de refinamento escolhido.",
      modelPathLabel: "Trilha sugerida de modelo",
      cards: [
        {
          title: "Host falando para a câmera",
          label: "Exemplo de papel de influencer",
          modelPath: "Nano Banana 2 -> Nano Banana Pro",
          body: "Uma direção editorial e acolhedora para explicações, atualizações diárias e conteúdo social falando direto para a câmera.",
          src: ROLE_EXAMPLE_IMAGES.host,
          alt: "Retrato fotorrealista de uma creator fictícia falando para a câmera com blusa champagne em um estúdio-apartamento neutro e suave.",
        },
        {
          title: "Creator de lifestyle",
          label: "Exemplo de papel de influencer",
          modelPath: "Nano Banana 2 -> Nano Banana Pro",
          body: "Uma persona de lifestyle mais leve para conteúdo de rotina, vlogs de apartamento e posicionamento geral de creator-brand.",
          src: ROLE_EXAMPLE_IMAGES.lifestyle,
          alt: "Retrato fotorrealista de uma influenciadora fictícia de lifestyle sorrindo em um apartamento neutro e iluminado com estética suave de creator.",
        },
        {
          title: "Reviewer de produto",
          label: "Exemplo de papel de influencer",
          modelPath: "Nano Banana 2 -> Nano Banana Pro",
          body: "Uma direção creator-commerce para demos de produto, reviews de skincare e conteúdo em estilo recomendação patrocinada.",
          src: ROLE_EXAMPLE_IMAGES.reviewer,
          alt: "Retrato fotorrealista de uma influenciadora fictícia de review segurando um frasco âmbar sem rótulo em um setup limpo de creator.",
        },
      ],
    },
    quickAnswer: {
      label: "Resposta rápida",
      title: "O sistema da creator importa mais do que o rosto",
      body:
        "Um gerador de rostos consegue criar um retrato. Um AI influencer precisa sobreviver a mais do que isso. Um workflow pode apoiar uma única creator virtual ou uma pequena linha de papéis de influencer, mas cada identidade precisa permanecer coerente em vários frames. As saídas precisam se encaixar nos canais que humanos realmente usam. O loop de revisão precisa capturar drift antes de o trabalho ir ao ar. Esses são problemas de workflow, não apenas de imagem.",
      takeaways: [
        "Um AI influencer é um sistema de workflow, não apenas um gerador de rostos.",
        "As quatro camadas práticas são persona em still, motion, distribuição e QA.",
        "Você pode gerar primeiro vários stills de personagens em estilo influencer, mas cada papel ainda precisa do seu próprio identity pack e do seu próprio loop de revisão.",
        "O AnyCap fica mais relevante quando a pergunta muda de `consigo gerar uma imagem?` para `como mantenho essa creator reutilizável em várias saídas?`",
      ],
    },
    definitionLayers: {
      label: "Camadas da definição",
      title: "Quatro camadas definem se a creator é utilizável",
      cards: [
        {
          title: "Camada de persona",
          body: "Esse é o sistema de identidade em still image: rosto, nicho, faixa de guarda-roupa e tom de marca. Ele pode cobrir uma creator ou uma pequena linha de papéis de influencer, mas cada persona ainda precisa de uma especificação estável.",
        },
        {
          title: "Camada de motion",
          body: "É aqui que stills viram clipes. Pode ser motion social sutil, delivery falando para a câmera ou ramificações de vídeo em estilo campanha.",
        },
        {
          title: "Camada de distribuição",
          body: "É aqui que a creator deixa de ser apenas conceito e começa a se encaixar em um canal: imagem de perfil, capa de reel, clipe short-form, asset de landing page ou galeria promocional.",
        },
        {
          title: "Camada de QA",
          body: "É aqui que times capturam drift, texto ruim, crops fracos e detalhes estranhos de cena antes que a saída chegue aos humanos.",
        },
      ],
    },
    comparison: {
      label: "Comparação",
      title: "AI influencer vs conceitos adjacentes",
      columns: {
        concept: "Conceito",
        meaning: "O que significa",
        question: "Pergunta mais forte",
      },
      rows: [
        {
          concept: "AI influencer",
          definition: "Um sistema reutilizável de creator com identidade, variantes de conteúdo e saídas prontas para canal.",
          strongestQuestion:
            "Como mantenho essa creator utilizável em stills, clipes e revisões?",
        },
        {
          concept: "Gerador de avatar",
          definition: "Uma ferramenta que cria um avatar ou uma representação em estilo perfil.",
          strongestQuestion: "Como faço rapidamente um rosto ou ícone?",
        },
        {
          concept: "Workflow de conteúdo sem rosto",
          definition: "Um sistema de conteúdo em que a identidade da creator intencionalmente não fica em primeiro plano.",
          strongestQuestion:
            "Como publico conteúdo short-form repetível sem uma pessoa em cena?",
        },
        {
          concept: "Ator de AI UGC",
          definition:
            "Um porta-voz gerado ou performer em estilo anúncio, muitas vezes mais próximo da produção de campanha do que da construção de identidade de influencer.",
          strongestQuestion:
            "Como faço um ator promocional crível para uma campanha ou formato de anúncio?",
        },
      ],
    },
    workflow: {
      label: "Workflow",
      title: "O caminho mais curto do conceito ao workflow",
      stepLabelPrefix: "Passo",
      steps: [
        {
          title: "Defina a identidade da creator",
          body: "Comece pelo nicho, pelo público e pelo tom visual em still antes de decidir se essa creator sequer precisa de vídeo.",
        },
        {
          title: "Gere um pequeno pack de stills",
          body: "Crie algumas imagens realistas que testem se a identidade sobrevive a cenas ou crops diferentes. Se você quiser vários papéis de influencer, como beleza, moda ou review de produto, faça um pack separado para cada um em vez de misturá-los.",
        },
        {
          title: "Escolha onde a creator realmente vive",
          body: "Decida se a saída é um perfil, uma imagem de campanha, um clipe short-form ou um asset repetível de canal.",
        },
        {
          title: "Adicione motion apenas se os stills já funcionarem",
          body: "Se a identidade da creator for fraca, o motion normalmente deixa o problema mais evidente em vez de mais crível.",
        },
        {
          title: "Mantenha o QA dentro do sistema",
          body: "Uma creator só se torna operacional quando existe um loop claro de revisão antes da entrega para humanos.",
        },
      ],
    },
    modelChoice: {
      label: "Escolha de modelo",
      title: "Use Nano Banana 2 ou Pro por papel",
      cards: [
        {
          title: "Nano Banana 2",
          label: "Melhor para explorar papéis com mais velocidade",
          body: "Use quando quiser gerar rapidamente várias imagens de papel em estilo influencer e comparar qual direção de persona merece mais trabalho.",
          href: "/models/nano-banana-2",
        },
        {
          title: "Nano Banana Pro",
          label: "Melhor para hero stills mais limpos",
          body: "Use quando um papel já estiver funcionando e você quiser um retrato hero realista mais forte ou um passe mais rígido de refinamento image-to-image para essa identidade.",
          href: "/models/nano-banana-pro",
        },
      ],
    },
    validation: {
      label: "Validação em primeira mão",
      title: "O que verificamos antes de definir o termo desse jeito",
      cards: [
        {
          title: "Superfície de capacidades confirmada",
          body: "O status do AnyCap foi revisto em 9 de abril de 2026 antes de este explicador ser escrito. Geracao de imagem, geracao de video, leitura de imagem, leitura de video, Drive e Page estavam disponiveis.",
        },
        {
          title: "Definição mantida operacional",
          body: "Esta página não define AI influencers apenas como tendência social. Ela os define pelas camadas de workflow necessárias para manter uma creator ou uma pequena linha utilizável.",
        },
        {
          title: "Product fit mantido claro",
          body: "A página explica onde o AnyCap entra na stack em vez de sugerir que o AnyCap seja uma plataforma dedicada de agendamento social ou clonagem de voz.",
        },
        {
          title: "Suporte ao cluster confirmado",
          body: "O explicador foi escrito para apoiar as páginas de still, vídeo e workflow de baixo custo sem duplicar os detalhes em nível de comando dessas páginas.",
        },
      ],
    },
    commands: {
      label: "Exemplos de comando",
      title: "Monte uma pequena linha de influencers em comandos",
      ctaLabel: "Ver Geracao de imagem",
      examples: [
        {
          title: "Gere rapidamente vários papéis em estilo influencer",
          code: [
            "anycap image generate \\",
            "  --model nano-banana-2 \\",
            '  --prompt "influenciadora fictícia de beleza, retrato realista de creator, nicho premium de skincare, luz suave de dia, textura natural de pele, styling seguro para marca, sem texto legível, sem marca d\'água" \\',
            "  --param aspect_ratio=4:3 \\",
            "  --param resolution=2k \\",
            "  -o influencer-beauty-role.png",
            "",
            "anycap image generate \\",
            "  --model nano-banana-2 \\",
            '  --prompt "influenciadora fictícia de moda, retrato realista de creator em street style, pose editorial, fundo urbano limpo, detalhe facial natural, sem texto legível, sem marca d\'água" \\',
            "  --param aspect_ratio=4:3 \\",
            "  --param resolution=2k \\",
            "  -o influencer-fashion-role.png",
            "",
            "anycap image generate \\",
            "  --model nano-banana-2 \\",
            '  --prompt "influenciadora fictícia de review de produto, retrato realista de creator, confiança olhando para a câmera, iluminação de home studio, styling amigável para ecommerce, sem texto legível, sem marca d\'água" \\',
            "  --param aspect_ratio=4:3 \\",
            "  --param resolution=2k \\",
            "  -o influencer-review-role.png",
          ].join("\n"),
        },
        {
          title: "Polir o papel vencedor com Nano Banana Pro",
          code: [
            "anycap image generate \\",
            "  --model nano-banana-pro \\",
            "  --mode image-to-image \\",
            '  --prompt "preserve a mesma identidade fictícia da influenciadora de beleza, deixe o retrato mais realista e polido, com enquadramento hero mais forte, iluminação mais limpa e acabamento premium pronto para campanha, sem texto legível, sem marca d\'água" \\',
            "  --param images=./influencer-beauty-role.png \\",
            "  --param aspect_ratio=4:3 \\",
            "  --param resolution=2k \\",
            "  -o influencer-beauty-role-pro.png",
          ].join("\n"),
        },
      ],
    },
    faq: {
      label: "FAQ",
      title: "Perguntas comuns sobre a definição",
      items: [
        {
          question: "Um AI influencer é a mesma coisa que um gerador de avatar?",
          answer:
            "Não. Um gerador de avatar consegue fazer um rosto ou uma imagem de perfil. Um AI influencer é mais amplo: é o sistema repetível de creator ao redor dessa identidade.",
        },
        {
          question: "Um AI influencer precisa ser um personagem em vídeo falando?",
          answer:
            "Nem sempre. Alguns AI influencers vivem mais como creators de still image, personas de campanha de produto ou marcas visuais short-form. Motion é apenas uma camada.",
        },
        {
          question: "O que faz um AI influencer ser operacional, e não só interessante?",
          answer:
            "A identidade precisa se sustentar em várias cenas, as saídas precisam caber em canais reais e o time precisa de um caminho de QA e entrega em vez de uma pilha de assets isolados.",
        },
        {
          question: "Um único workflow consegue gerar vários personagens de AI influencer?",
          answer:
            "Sim. Um único workflow pode apoiar uma pequena linha de personas, como creator de beleza, reviewer de produto ou host de lifestyle. O importante é tratar cada papel como sua própria identidade estável, com seu próprio pack de stills, nicho e passe de QA.",
        },
        {
          question: "Onde o AnyCap entra nessa stack?",
          answer:
            "O AnyCap entra ao redor das camadas de geração, QA e entrega. O agente consegue criar os stills da persona, animá-los, inspecionar a saída e entregar o resultado a humanos dentro do mesmo workflow.",
        },
      ],
    },
    nextStep: {
      label: "Próximo passo",
      title: "Saia da definição e entre em um workflow real",
      cards: [
        {
          title: "Como criar AI influencers",
          href: "/learn/how-to-make-ai-influencers",
          body: "Vá para a página âncora quando quiser o workflow completo em vez da definição conceitual.",
        },
        {
          title: "Criar AI influencer de graça",
          href: "/learn/create-ai-influencer-for-free",
          body: "Use isto quando a próxima pergunta for como testar o conceito com baixo custo antes de se comprometer com uma stack maior.",
        },
        {
          title: "Como fazer vídeos de AI influencer",
          href: "/learn/how-to-make-ai-influencer-videos",
          body: "Vá para lá quando o conceito já estiver claro e o próximo passo for motion image-to-video.",
        },
        {
          title: "Geracao de imagem",
          href: "/capabilities/image-generation",
          body: "Explore a capability que sustenta a camada de persona descrita nesta página.",
        },
        {
          title: "Geracao de video",
          href: "/capabilities/video-generation",
          body: "Explore a capability que sustenta a camada de motion descrita nesta página.",
        },
        {
          title: "Instalar AnyCap",
          href: "/guides/install-anycap",
          body: "Use isto quando quiser sair da definição e entrar em um workflow funcional de CLI.",
        },
      ],
    },
  },
  id: {
    metadata: {
      title: "Apa itu AI influencer?",
      description:
        "AI influencer bukan sekadar avatar. Ia bisa berupa satu persona creator yang reusable atau roster kecil karakter influencer, masing-masing dengan still, motion variant, format distribusi, dan loop quality control.",
      openGraphTitle: "Apa itu AI influencer?",
      openGraphDescription:
        "Penjelasan praktis tentang apa sebenarnya AI influencer, bagaimana bedanya dengan konsep yang berdekatan, dan di mana workflow bergaya AnyCap masuk.",
      articleHeadline: "Apa itu AI influencer?",
      articleDescription:
        "Definisi AI influencer yang sadar workflow dan memisahkan layer persona, layer motion, layer distribusi, dan layer QA, baik kamu membangun satu creator maupun roster kecil persona influencer.",
      articleAbout: [
        "AI influencer",
        "creator virtual",
        "workflow creator",
        "image generation",
        "video generation",
      ],
      articleKeywords: [
        "apa itu ai influencer",
        "arti ai influencer",
        "definisi influencer virtual",
        "penjelasan ai influencer",
        "cara kerja ai influencer",
      ],
    },
    breadcrumbItems: [
      { name: "Beranda", href: "/" },
      { name: "Pelajari", href: "/learn" },
      { name: "Apa itu AI influencer?", href: WHAT_IS_AN_AI_INFLUENCER_PATH },
    ],
    eyebrow: "Pelajari",
    lastUpdatedLabel: "Diperbarui 9 April 2026",
    hero: {
      titleLine1: "Apa itu AI influencer?",
      titleLine2: "Ia lebih dari sekadar avatar",
      intro:
        "AI influencer bukan hanya wajah hasil generasi yang terlihat menarik. Ia adalah sistem creator yang repeatable dengan identitas still-image, opsi motion, output yang siap dipakai di channel, dan loop review. Sistem itu bisa mendukung satu creator atau beberapa persona influencer, tetapi setiap peran tetap membutuhkan identitas stabilnya sendiri. Itulah perbedaan antara gimmick dan workflow yang benar-benar bisa didukung oleh agen.",
      summaryLabel: "Ringkasan cepat",
      summaryText:
        "Definisi AI influencer yang berguna memiliki empat layer: persona, motion, distribusi, dan QA. AnyCap paling relevan ketika kamu ingin agen bekerja lintas layer itu untuk satu creator atau roster kecil, bukan berhenti pada satu gambar yang dihasilkan saja.",
    },
    roleDirections: {
      label: "Arah peran",
      title: "Satu halaman seharusnya menunjukkan lebih dari satu tampilan influencer",
      intro:
        "Workflow AI influencer tidak berhenti pada satu wajah saja. Kamu bisa menghasilkan beberapa arah peran influencer secara paralel, membandingkan mana yang terasa paling usable, lalu menaikkan pemenangnya menjadi hero still yang lebih bersih. Pola praktisnya adalah `nano-banana-2` untuk eksplorasi peran yang lebih cepat dan `nano-banana-pro` untuk refinement pass yang dipilih.",
      modelPathLabel: "Jalur model yang disarankan",
      cards: [
        {
          title: "Host berbicara ke kamera",
          label: "Contoh peran influencer",
          modelPath: "Nano Banana 2 -> Nano Banana Pro",
          body: "Arah creator editorial yang hangat untuk explainer, update harian, dan konten sosial yang berbicara langsung ke kamera.",
          src: ROLE_EXAMPLE_IMAGES.host,
          alt: "Potret fotorealistis dari creator fiktif yang berbicara ke kamera dengan blus warna sampanye di apartemen-studio netral yang lembut.",
        },
        {
          title: "Creator lifestyle",
          label: "Contoh peran influencer",
          modelPath: "Nano Banana 2 -> Nano Banana Pro",
          body: "Persona lifestyle yang lebih ringan untuk konten rutinitas, vlog apartemen, dan positioning creator-brand secara umum.",
          src: ROLE_EXAMPLE_IMAGES.lifestyle,
          alt: "Potret fotorealistis dari influencer lifestyle fiktif yang tersenyum di apartemen netral yang terang dengan estetika creator yang lembut.",
        },
        {
          title: "Reviewer produk",
          label: "Contoh peran influencer",
          modelPath: "Nano Banana 2 -> Nano Banana Pro",
          body: "Arah creator-commerce untuk demo produk, review skincare, dan konten rekomendasi bergaya sponsor.",
          src: ROLE_EXAMPLE_IMAGES.reviewer,
          alt: "Potret fotorealistis dari influencer review produk fiktif yang memegang botol amber tanpa label dalam setup creator yang bersih.",
        },
      ],
    },
    quickAnswer: {
      label: "Jawaban cepat",
      title: "Sistem creator lebih penting daripada wajahnya",
      body:
        "Generator wajah bisa membuat satu potret. AI influencer harus mampu bertahan lebih jauh dari itu. Satu workflow bisa mendukung satu creator virtual atau roster kecil peran influencer, tetapi setiap identitas harus tetap koheren di beberapa frame. Output-nya harus cocok dengan channel yang benar-benar dipakai manusia. Loop review harus menangkap drift sebelum hasilnya dipublikasikan. Itu adalah masalah workflow, bukan cuma masalah gambar.",
      takeaways: [
        "AI influencer adalah sistem workflow, bukan sekadar generator wajah.",
        "Empat layer praktisnya adalah persona still, motion, distribusi, dan QA.",
        "Kamu bisa lebih dulu menghasilkan beberapa still karakter bergaya influencer, tetapi setiap peran tetap membutuhkan identity pack dan review loop-nya sendiri.",
        "AnyCap paling relevan ketika pertanyaannya bergeser dari `bisakah saya menghasilkan satu gambar?` menjadi `bagaimana cara menjaga creator ini tetap reusable di berbagai output?`",
      ],
    },
    definitionLayers: {
      label: "Layer definisi",
      title: "Empat layer menentukan apakah creator itu usable",
      cards: [
        {
          title: "Layer persona",
          body: "Inilah sistem identitas still-image: wajah, niche, rentang wardrobe, dan tone brand. Ia bisa mencakup satu creator atau roster kecil peran influencer, tetapi setiap persona tetap memerlukan spesifikasi yang stabil.",
        },
        {
          title: "Layer motion",
          body: "Di sinilah still berubah menjadi clip. Bentuknya bisa motion sosial yang halus, delivery creator ke kamera, atau percabangan video bergaya campaign.",
        },
        {
          title: "Layer distribusi",
          body: "Di sinilah creator berhenti menjadi konsep dan mulai cocok untuk sebuah channel: foto profil, cover reel, clip short-form, asset landing page, atau galeri promo.",
        },
        {
          title: "Layer QA",
          body: "Di sinilah tim menangkap drift, teks yang buruk, crop yang lemah, dan detail adegan yang canggung sebelum output sampai ke manusia.",
        },
      ],
    },
    comparison: {
      label: "Perbandingan",
      title: "AI influencer vs konsep yang berdekatan",
      columns: {
        concept: "Konsep",
        meaning: "Artinya",
        question: "Pertanyaan terkuat",
      },
      rows: [
        {
          concept: "AI influencer",
          definition: "Sistem creator yang reusable dengan identitas, varian konten, dan output yang siap dipakai di channel.",
          strongestQuestion:
            "Bagaimana saya menjaga creator ini tetap usable di still, clip, dan proses review?",
        },
        {
          concept: "Generator avatar",
          definition: "Tool yang membuat satu avatar atau representasi bergaya profil.",
          strongestQuestion: "Bagaimana saya membuat satu wajah atau ikon dengan cepat?",
        },
        {
          concept: "Workflow konten tanpa wajah",
          definition: "Sistem konten di mana identitas creator sengaja tidak dijadikan pusat perhatian.",
          strongestQuestion:
            "Bagaimana saya menerbitkan konten short-form yang repeatable tanpa sosok manusia di layar?",
        },
        {
          concept: "Aktor AI UGC",
          definition:
            "Spokesperson atau performer bergaya iklan yang dihasilkan, biasanya lebih dekat ke produksi campaign daripada pembangunan identitas influencer.",
          strongestQuestion:
            "Bagaimana saya membuat aktor promo yang meyakinkan untuk satu campaign atau format iklan?",
        },
      ],
    },
    workflow: {
      label: "Workflow",
      title: "Jalur terpendek dari konsep ke workflow",
      stepLabelPrefix: "Langkah",
      steps: [
        {
          title: "Tentukan identitas creator",
          body: "Mulailah dari niche, audiens, dan tone still-image sebelum memutuskan apakah creator ini bahkan membutuhkan video.",
        },
        {
          title: "Hasilkan still pack kecil",
          body: "Buat beberapa gambar realistis yang menguji apakah identitasnya bisa bertahan di adegan atau crop yang berbeda. Jika kamu ingin beberapa peran influencer seperti beauty, fashion, atau product-review persona, buat pack terpisah untuk masing-masing alih-alih mencampurnya.",
        },
        {
          title: "Pilih tempat creator itu benar-benar hidup",
          body: "Tentukan apakah output-nya adalah profil, gambar campaign, clip short-form, atau asset channel yang repeatable.",
        },
        {
          title: "Tambahkan motion hanya jika still-nya sudah bekerja",
          body: "Jika identitas creator lemah, motion biasanya membuat masalahnya justru lebih jelas, bukan lebih meyakinkan.",
        },
        {
          title: "Simpan QA di dalam sistem",
          body: "Creator baru menjadi operasional ketika ada loop review yang jelas sebelum hasilnya diserahkan ke manusia.",
        },
      ],
    },
    modelChoice: {
      label: "Pilihan model",
      title: "Gunakan Nano Banana 2 atau Pro berdasarkan peran",
      cards: [
        {
          title: "Nano Banana 2",
          label: "Terbaik untuk eksplorasi peran yang lebih cepat",
          body: "Gunakan ketika kamu ingin menghasilkan beberapa gambar peran bergaya influencer dengan cepat lalu membandingkan arah persona mana yang layak dikerjakan lebih lanjut.",
          href: "/models/nano-banana-2",
        },
        {
          title: "Nano Banana Pro",
          label: "Terbaik untuk hero still yang lebih rapi",
          body: "Gunakan ketika satu peran sudah bekerja dan kamu menginginkan potret hero realistis yang lebih kuat atau refinement pass image-to-image yang lebih ketat untuk identitas influencer tersebut.",
          href: "/models/nano-banana-pro",
        },
      ],
    },
    validation: {
      label: "Validasi langsung",
      title: "Yang kami cek sebelum mendefinisikan istilah ini dengan cara seperti ini",
      cards: [
        {
          title: "Capability surface terkonfirmasi",
          body: "Status AnyCap dicek ulang pada 9 April 2026 sebelum explainer ini ditulis. Image generation, video generation, image reading, video reading, Drive, dan Page tersedia.",
        },
        {
          title: "Definisi dijaga tetap operasional",
          body: "Halaman ini tidak mendefinisikan AI influencer hanya sebagai tren sosial. Halaman ini mendefinisikannya berdasarkan layer workflow yang dibutuhkan agar satu creator atau roster kecil tetap usable.",
        },
        {
          title: "Kecocokan produk dijaga jelas",
          body: "Halaman ini menjelaskan di mana AnyCap masuk ke dalam stack, alih-alih menyiratkan bahwa AnyCap adalah platform penjadwalan sosial atau voice cloning khusus.",
        },
        {
          title: "Dukungan cluster terkonfirmasi",
          body: "Explainer ini ditulis untuk mendukung halaman workflow still, video, dan low-cost tanpa menduplikasi detail level command dari halaman-halaman itu.",
        },
      ],
    },
    commands: {
      label: "Contoh command",
      title: "Bangun roster influencer kecil dalam bentuk command",
      ctaLabel: "Lihat Image Generation",
      examples: [
        {
          title: "Hasilkan beberapa peran influencer dengan cepat",
          code: [
            "anycap image generate \\",
            "  --model nano-banana-2 \\",
            '  --prompt "influencer kecantikan fiktif, potret creator yang realistis, niche skincare premium, cahaya siang yang lembut, tekstur kulit alami, styling yang aman untuk brand, tanpa teks yang terbaca, tanpa watermark" \\',
            "  --param aspect_ratio=4:3 \\",
            "  --param resolution=2k \\",
            "  -o influencer-beauty-role.png",
            "",
            "anycap image generate \\",
            "  --model nano-banana-2 \\",
            '  --prompt "influencer fashion fiktif, potret creator street-style yang realistis, pose editorial, latar urban yang bersih, detail wajah alami, tanpa teks yang terbaca, tanpa watermark" \\',
            "  --param aspect_ratio=4:3 \\",
            "  --param resolution=2k \\",
            "  -o influencer-fashion-role.png",
            "",
            "anycap image generate \\",
            "  --model nano-banana-2 \\",
            '  --prompt "influencer review produk fiktif, potret creator yang realistis, percaya diri menatap kamera, pencahayaan home-studio, styling ramah ecommerce, tanpa teks yang terbaca, tanpa watermark" \\',
            "  --param aspect_ratio=4:3 \\",
            "  --param resolution=2k \\",
            "  -o influencer-review-role.png",
          ].join("\n"),
        },
        {
          title: "Poles peran yang menang dengan Nano Banana Pro",
          code: [
            "anycap image generate \\",
            "  --model nano-banana-pro \\",
            "  --mode image-to-image \\",
            '  --prompt "pertahankan identitas influencer kecantikan fiktif yang sama, buat potret lebih realistis dan polished, framing hero lebih kuat, pencahayaan lebih bersih, hasil akhir premium yang siap campaign, tanpa teks yang terbaca, tanpa watermark" \\',
            "  --param images=./influencer-beauty-role.png \\",
            "  --param aspect_ratio=4:3 \\",
            "  --param resolution=2k \\",
            "  -o influencer-beauty-role-pro.png",
          ].join("\n"),
        },
      ],
    },
    faq: {
      label: "FAQ",
      title: "Pertanyaan umum tentang definisinya",
      items: [
        {
          question: "Apakah AI influencer sama dengan generator avatar?",
          answer:
            "Tidak. Generator avatar bisa membuat satu wajah atau satu gambar profil. AI influencer lebih luas: ia adalah sistem creator yang repeatable di sekitar identitas tersebut.",
        },
        {
          question: "Apakah AI influencer harus berupa karakter video yang berbicara?",
          answer:
            "Tidak selalu. Sebagian AI influencer hidup terutama sebagai creator still-image, persona campaign produk, atau brand visual short-form. Motion hanyalah salah satu layer.",
        },
        {
          question: "Apa yang membuat AI influencer menjadi operasional, bukan sekadar menarik?",
          answer:
            "Identitasnya harus bertahan di berbagai adegan, output-nya harus cocok dengan channel yang nyata, dan tim membutuhkan jalur QA serta delivery alih-alih tumpukan asset satu kali pakai.",
        },
        {
          question: "Bisakah satu workflow menghasilkan beberapa karakter AI influencer?",
          answer:
            "Ya. Satu workflow bisa mendukung roster kecil persona influencer seperti creator kecantikan, reviewer produk, atau host lifestyle. Yang penting adalah memperlakukan setiap peran sebagai identitas creator yang stabil dengan still pack, niche, dan QA pass-nya sendiri.",
        },
        {
          question: "Di mana posisi AnyCap dalam stack tersebut?",
          answer:
            "AnyCap berada di sekitar layer generation, QA, dan delivery. Agen bisa membuat still persona, menganimasikannya, memeriksa output, dan menyerahkan hasilnya ke manusia melalui workflow yang sama.",
        },
      ],
    },
    nextStep: {
      label: "Langkah berikutnya",
      title: "Bergerak dari definisi ke workflow yang nyata",
      cards: [
        {
          title: "Cara membuat AI influencer",
          href: "/learn/how-to-make-ai-influencers",
          body: "Masuk ke halaman anchor ketika kamu menginginkan workflow lengkap, bukan sekadar definisi konsep.",
        },
        {
          title: "Buat AI influencer gratis",
          href: "/learn/create-ai-influencer-for-free",
          body: "Gunakan ini ketika pertanyaan berikutnya adalah bagaimana menguji konsep tersebut dengan biaya rendah sebelum berkomitmen ke stack yang lebih besar.",
        },
        {
          title: "Cara membuat video AI influencer",
          href: "/learn/how-to-make-ai-influencer-videos",
          body: "Masuk ke sini ketika konsepnya sudah jelas dan langkah berikutnya adalah motion image-to-video.",
        },
        {
          title: "Image Generation",
          href: "/capabilities/image-generation",
          body: "Lihat capability surface yang menjalankan layer persona yang dijelaskan pada halaman ini.",
        },
        {
          title: "Video Generation",
          href: "/capabilities/video-generation",
          body: "Lihat capability surface yang menjalankan layer motion yang dijelaskan pada halaman ini.",
        },
        {
          title: "Install AnyCap",
          href: "/guides/install-anycap",
          body: "Gunakan ini ketika kamu ingin berpindah dari definisi menuju workflow CLI yang benar-benar bekerja.",
        },
      ],
    },
  },
  de: enContent,
} as const;

export function getWhatIsAnAIInfluencerMetadata(locale: SiteLocale): Metadata {
  const content = contentByLocale[locale] ?? contentByLocale.en;

  return {
    title: content.metadata.title,
    description: content.metadata.description,
    alternates: { canonical: WHAT_IS_AN_AI_INFLUENCER_PATH },
    openGraph: {
      type: "website",
      locale: getLocaleConfig(locale).ogLocale,
      url: WHAT_IS_AN_AI_INFLUENCER_PATH,
      siteName: siteConfig.siteName,
      title: content.metadata.openGraphTitle,
      description: content.metadata.openGraphDescription,
    },
  };
}

export function getWhatIsAnAIInfluencerPageData(locale: SiteLocale) {
  const content = contentByLocale[locale] ?? contentByLocale.en;

  return {
    ...content,
    articleJsonLd: createTechArticleJsonLd({
      headline: content.metadata.articleHeadline,
      description: content.metadata.articleDescription,
      path: WHAT_IS_AN_AI_INFLUENCER_PATH,
      locale,
      about: [...content.metadata.articleAbout],
      keywords: [...content.metadata.articleKeywords],
      datePublished: LAST_UPDATED_ISO,
      dateModified: LAST_UPDATED_ISO,
    }),
    faqJsonLd: createFaqPageJsonLd(content.faq.items),
  };
}
