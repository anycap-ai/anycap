import type { Metadata } from "next";
import { createFaqPageJsonLd, createTechArticleJsonLd } from "@/lib/schema";
import { getLocaleConfig, siteConfig, type SiteLocale } from "@/lib/site";

export const CREATE_AI_INFLUENCER_FOR_FREE_PATH = "/learn/create-ai-influencer-for-free";

const PAGE_RESOURCE_BASE = "https://cdn.anycap.ai/page_resource/learning";
const LAST_UPDATED_ISO = "2026-04-09";
const HERO_IMAGE = {
  src: `${PAGE_RESOURCE_BASE}/create-ai-influencer-for-free-hero.png`,
  width: 1792,
  height: 1344,
} as const;
const VALIDATION_IMAGE = {
  src: `${PAGE_RESOURCE_BASE}/how-to-make-ai-influencers-product-hold.jpg`,
  width: 1792,
  height: 2400,
} as const;

const contentByLocale = {
  en: {
    metadata: {
      title: "Create AI Influencer for Free with an AI Agent",
      description:
        "Prototype a realistic AI influencer without paying for a dedicated platform first: generate a few stills, refine the winner, and only branch into motion after the persona actually works.",
      openGraphTitle: "Create AI Influencer for Free with an AI Agent",
      openGraphDescription:
        "A low-cost workflow for testing realistic AI influencer directions through AnyCap before you commit to a dedicated avatar or influencer platform.",
      articleHeadline: "Create AI Influencer for Free with an AI Agent",
      articleDescription:
        "A practical guide for testing AI influencer persona directions cheaply by starting with still images, limiting iteration scope, and only promoting the strongest result into motion.",
      articleAbout: [
        "AI influencer",
        "Virtual creator",
        "Image generation",
        "Image editing",
        "Low-cost validation",
      ],
      articleKeywords: [
        "create ai influencer for free",
        "ai influencer generator free",
        "create ai influencer",
        "how to create ai influencer free",
        "realistic ai influencer workflow",
      ],
    },
    breadcrumbItems: [
      { name: "Home", href: "/" },
      { name: "Learn", href: "/learn" },
      { name: "Create AI Influencer for Free", href: CREATE_AI_INFLUENCER_FOR_FREE_PATH },
    ],
    eyebrow: "Learn",
    lastUpdatedLabel: "Last updated April 9, 2026",
    hero: {
      titleLine1: "Create AI influencer for free",
      titleLine2: "by validating the still first",
      introBeforeLink:
        "If you want to create an AI influencer for free, the practical move is not to buy a full influencer stack first. It is to use a small realistic still-image loop to prove the persona, then spend more only if the identity actually holds up. That is the cheapest useful workflow",
      linkLabel: "AnyCap image generation",
      afterLink: "can support.",
      summaryLabel: "Answer-first summary",
      summaryText:
        "The right reading of `free` is `do not pay for more complexity before the still works.` Start with a few realistic portraits. Keep one winner. Refine only that winner. Then decide whether it deserves video, publishing, or more iteration. This approach is more useful than pretending the entire creator pipeline should be free forever. Right now, the limited-time 250 free credits for new sign-ups also make that first validation loop easier to test.",
      imageAlt:
        "Profile-ready portrait of a fictional beauty influencer with glossy shoulder-length waves, soft glam makeup, and a cream knit top in a bright neutral apartment interior.",
      imageCaption:
        "This image exists to show the page's real recommendation: start with one realistic still that could plausibly work as a profile or promo image before you pay for motion, narration, or a larger creator stack.",
    },
    creditNote: {
      eyebrow: "Limited-time start credit",
      title: "250 free credits for new sign-ups",
      body: "As of this page update, new sign-ups receive 250 free credits ($5 value) through Apr 10. That is enough room for a small still-first validation loop before you decide whether the persona deserves more spend.",
      href: "/pricing",
      ctaLabel: "See pricing",
    },
    proof: {
      eyebrow: "Generated proof",
      title: "One action shot is a better cheap test",
      intro:
        "A second image where the same person has to hold a product tells you more than another plain portrait. It tests whether the identity survives object interaction before you spend on more variants, more scenes, or motion.",
      promptLabel: "Low-cost validation prompt",
      prompt:
        "preserve the same fictional beauty influencer identity from the reference hero shot, then create one believable UGC product-hold variant without losing the same warm complexion, espresso-brown waves, soft glam makeup, gold jewelry, or cream knit styling. Keep the product unlabeled, the hand natural, and the lighting photoreal.",
      signalsLabel: "Why this proof matters",
      signals: [
        "The same face, hair, sweater, and jewelry still read as one creator instead of a fresh random render.",
        "Adding one bottle to the scene pressure-tests the workflow at a much cheaper stage than video or a full brand shoot.",
        "If this shot breaks, you stop early instead of buying more complexity.",
      ],
      caption:
        "This is the kind of follow-up still worth paying for first. It is simple, commercial enough to be useful, and strong enough to reveal whether the persona can survive beyond a profile photo.",
      images: [
        {
          ...VALIDATION_IMAGE,
          alt: "The same fictional beauty influencer from the hero shot holding an unlabeled skincare bottle near her face in a bright apartment interior.",
          label: "Validation shot",
        },
      ],
    },
    quickAnswer: {
      label: "Quick answer",
      title: "Free should mean cheap validation",
      body:
        "A realistic AI influencer still can tell you almost everything you need to know about whether the direction is worth continuing. The face will either feel usable or not. The niche will either read clearly or not. The brand tone will either fit or not. Those are cheap decisions at the still stage and expensive ones after you add video, voice, or distribution.",
      takeaways: [
        "The low-cost move is not to chase a full influencer platform immediately. It is to prove the persona first.",
        "Still-image validation is the cheapest useful step because it reveals whether the face, niche, and framing are worth carrying into video.",
        "Nano Banana 2 is the best first pass when you need several realistic options quickly. Nano Banana Pro is the cleanup step when one option already looks promising.",
        "As of this update, new sign-ups receive 250 free credits ($5 value) through Apr 10, which makes the first still-validation loop easier to test without upfront spend.",
      ],
    },
    workflow: {
      label: "Workflow",
      title: "Five steps to keep the test cheap and useful",
      stepLabelPrefix: "Step",
      steps: [
        {
          title: "Define one persona brief, not ten aesthetics",
          body: "Pick the niche, age range, creator tone, and scene type first. The smaller the brief, the less money you waste on unfocused generation.",
        },
        {
          title: "Generate two to four realistic stills",
          body: "Use a small Nano Banana 2 batch to compare realistic directions instead of trying to perfect the first result.",
        },
        {
          title: "Choose one winner and stop branching",
          body: "The low-cost discipline is to kill weak directions early. Keep one still that already looks believable and discard the rest.",
        },
        {
          title: "Refine only the winner",
          body: "If the face or framing is close, run a Nano Banana Pro refinement pass rather than paying for more broad exploration.",
        },
        {
          title: "Use QA before motion or publishing",
          body: "Check the final still for readable text, awkward product details, or off-brand composition before you spend more on animation or sharing.",
        },
      ],
    },
    costDiscipline: {
      label: "Cost discipline",
      titleLine1: "Spend more only",
      titleLine2: "when the still survives QA",
      rules: [
        "Treat `free` like a prototype budget, not a promise that the entire creator pipeline will cost nothing.",
        "Limit the first pass to still images. Video becomes the second purchase, not the first.",
        "Keep the persona brief narrow enough that one winning still can actually represent the direction.",
        "Use image reading as a filter so you do not keep spending on a still that already has obvious issues.",
      ],
    },
    validation: {
      label: "First-hand validation",
      title: "What we checked before recommending this route",
      cards: [
        {
          title: "Capability surface confirmed",
          body: "AnyCap status was rechecked on April 9, 2026 before building this page. Image generation, image editing, image reading, video generation, Drive, and Page were available.",
        },
        {
          title: "Schema checked",
          body: "Nano Banana 2 and Nano Banana Pro were checked against the live schema so the command examples use the current text-to-image and image-to-image parameter shape.",
        },
        {
          title: "Workflow claim kept narrow",
          body: "This page does not treat `free` as a universal pricing claim. It treats free as the strategy of validating the persona before you buy more complexity.",
        },
        {
          title: "Realistic image direction selected",
          body: "The hero asset direction for this page was intentionally constrained to realistic Nano Banana output instead of stylized or fantasy avatar aesthetics.",
        },
      ],
    },
    modelChoice: {
      label: "Model choice",
      title: "Pick the cheapest model that still answers the question",
      cards: [
        {
          title: "Nano Banana 2",
          label: "Best first pass",
          body: "Use this for fast realistic exploration when you want to compare a few creator directions before you spend more effort on one winner.",
          href: "/models/nano-banana-2",
        },
        {
          title: "Nano Banana Pro",
          label: "Best refinement pass",
          body: "Use this when a realistic still is already close and you want better identity hold, stronger scene polish, or an image-to-image cleanup loop.",
          href: "/models/nano-banana-pro",
        },
        {
          title: "Pricing",
          label: "Know the budget surface",
          body: "Check the credit model before you scale beyond prototype stills into motion, delivery, or repeated content production.",
          href: "/pricing",
        },
      ],
    },
    comparison: {
      label: "Comparison",
      title: "Full platform first vs low-cost validation first",
      columns: {
        lens: "Lens",
        generic: "Full platform first",
        workflow: "Low-cost validation first",
      },
      rows: [
        {
          lens: "First spend",
          generic: "You pay for a full avatar or influencer stack immediately.",
          workflow: "You spend the first budget on a few realistic stills and validate whether the persona deserves more work.",
        },
        {
          lens: "Failure cost",
          generic: "You discover the identity problem only after you already tried voice, lip-sync, or publishing.",
          workflow: "You kill weak persona directions at the still stage when they are cheapest to discard.",
        },
        {
          lens: "Model choice",
          generic: "The tool hides the trade-off between fast iteration and tighter identity preservation.",
          workflow: "You can use Nano Banana 2 for exploration and Nano Banana Pro for the cleanup pass that actually matters.",
        },
        {
          lens: "Next move",
          generic: "The workflow tries to keep you inside one destination whether the persona works or not.",
          workflow: "If the still fails, you stop. If it works, you branch naturally into video or delivery.",
        },
      ],
    },
    commands: {
      label: "Command examples",
      title: "The low-cost loop in commands",
      ctaLabel: "Browse Image Generation",
      examples: [
        {
          title: "Generate the first low-cost stills",
          code: [
            "anycap image generate \\",
            "  --model nano-banana-2 \\",
            '  --prompt "fictional virtual creator, realistic lifestyle influencer portrait, soft indoor lighting, natural skin texture, believable casual styling, creator-home setting, no readable text, no watermark" \\',
            "  --param aspect_ratio=4:3 \\",
            "  --param resolution=2k \\",
            "  -o influencer-free-first-pass.png",
          ].join("\n"),
        },
        {
          title: "Refine the winning direction",
          code: [
            "anycap image generate \\",
            "  --model nano-banana-pro \\",
            "  --mode image-to-image \\",
            '  --prompt "preserve the same fictional creator identity, make the portrait more realistic and polished, cleaner lighting, stronger profile-photo framing, no readable text, no watermark" \\',
            "  --param images=./influencer-free-first-pass.png \\",
            "  --param aspect_ratio=4:3 \\",
            "  --param resolution=2k \\",
            "  -o influencer-free-refined.png",
          ].join("\n"),
        },
        {
          title: "QA before you spend more",
          code: [
            "anycap actions image-read \\",
            "  --file ./influencer-free-refined.png \\",
            '  --instruction "Describe the creator, say whether the image feels realistic enough for a profile or promo use, and mention any visible text or watermark."',
          ].join("\n"),
        },
      ],
    },
    faq: {
      label: "FAQ",
      title: "Common questions about the `free` query",
      items: [
        {
          question: "Does free mean I can build an unlimited AI influencer account with no spend at all?",
          answer:
            "No. The useful reading of `free` here is that you can validate the persona direction without committing to a dedicated influencer platform first. Start with a small still-image loop, then decide whether the winner deserves more generation, motion, or distribution.",
        },
        {
          question: "Why start with stills instead of an AI influencer video?",
          answer:
            "Because the cheapest failure point is the identity itself. If the face, styling, and niche do not work in a still image, video usually magnifies the problem instead of fixing it.",
        },
        {
          question: "Which AnyCap image model is the best fit for this page?",
          answer:
            "Use Nano Banana 2 for fast realistic exploration when you want several directions quickly. Use Nano Banana Pro when you need the winning still to hold together more tightly or when you want to refine an existing draft through image-to-image.",
        },
        {
          question: "Can I use my own source photo instead of starting from zero?",
          answer:
            "Yes. That is often the cheapest route. If you already have a usable draft or reference image, switch into a Nano Banana Pro image-to-image pass and preserve the identity while improving the scene, lighting, and framing.",
        },
        {
          question: "Is there a limited-time free-credit offer right now?",
          answer:
            "At the time this page was updated, new sign-ups received 250 free credits ($5 value) through Apr 10. The best use of that bonus is to test the still-first workflow early rather than spending it all on a bigger end-to-end creator stack immediately.",
        },
      ],
    },
    nextStep: {
      label: "Next step",
      title: "Move into the branch that justifies more spend",
      cards: [
        {
          title: "How to Make AI Influencers",
          href: "/learn/how-to-make-ai-influencers",
          body: "Go back to the anchor workflow if you want the full persona-pack, motion, QA, and delivery view.",
        },
        {
          title: "How to Make AI Influencer Videos",
          href: "/learn/how-to-make-ai-influencer-videos",
          body: "Move here when the still is working and the next decision is how to animate it without losing identity.",
        },
        {
          title: "What Is an AI Influencer?",
          href: "/learn/what-is-an-ai-influencer",
          body: "Read the explainer when you need the concept definition before deciding whether the workflow is worth building.",
        },
        {
          title: "Install AnyCap",
          href: "/guides/install-anycap",
          body: "Use this when you want the shortest path from this page into a working CLI setup.",
        },
        {
          title: "Pricing",
          href: "/pricing",
          body: "Check the credit model before you move from prototype stills into a higher-frequency content loop.",
        },
        {
          title: "Image Generation",
          href: "/capabilities/image-generation",
          body: "Browse the capability surface that powers the realistic still generation and refinement loop on this page.",
        },
      ],
    },
  },
  "pt-br": {
    metadata: {
      title: "Crie um AI influencer de graça com um agente de IA",
      description:
        "Prototipe um AI influencer realista sem pagar primeiro por uma plataforma dedicada: gere alguns stills, refine o vencedor e só avance para motion depois que a persona realmente funcionar.",
      openGraphTitle: "Crie um AI influencer de graça com um agente de IA",
      openGraphDescription:
        "Um workflow de baixo custo para testar direções realistas de AI influencer com AnyCap antes de se comprometer com uma plataforma dedicada de avatar ou influencer.",
      articleHeadline: "Crie um AI influencer de graça com um agente de IA",
      articleDescription:
        "Um guia prático para testar direções de persona de AI influencer com baixo custo, começando por still images, limitando o escopo de iteração e levando para motion apenas o resultado mais forte.",
      articleAbout: [
        "AI influencer",
        "creator virtual",
        "geração de imagem",
        "edição de imagem",
        "validação de baixo custo",
      ],
      articleKeywords: [
        "criar ai influencer de graça",
        "gerador de ai influencer grátis",
        "criar ai influencer",
        "como criar ai influencer grátis",
        "workflow realista de ai influencer",
      ],
    },
    breadcrumbItems: [
      { name: "Início", href: "/" },
      { name: "Aprender", href: "/learn" },
      { name: "Criar AI influencer de graça", href: CREATE_AI_INFLUENCER_FOR_FREE_PATH },
    ],
    eyebrow: "Aprender",
    lastUpdatedLabel: "Atualizado em 9 de abril de 2026",
    hero: {
      titleLine1: "Crie um AI influencer de graça",
      titleLine2: "validando o still primeiro",
      introBeforeLink:
        "Se você quer criar um AI influencer de graça, o movimento prático não é comprar primeiro uma stack completa de influencer. É usar um pequeno loop realista de still image para provar a persona e só gastar mais se a identidade realmente se sustentar. Esse é o workflow útil mais barato que",
      linkLabel: "AnyCap image generation",
      afterLink: "consegue apoiar.",
      summaryLabel: "Resumo direto",
      summaryText:
        "A leitura correta de `grátis` é `não pague por mais complexidade antes de o still funcionar.` Comece com alguns retratos realistas. Guarde um vencedor. Refine só esse vencedor. Depois decida se ele merece vídeo, publicação ou mais iteração. Essa abordagem é mais útil do que fingir que todo o pipeline de creator deveria ser gratuito para sempre. No momento, os 250 créditos grátis por tempo limitado para novos cadastros também deixam esse primeiro loop de validação mais fácil de testar.",
      imageAlt:
        "Retrato pronto para perfil de uma influenciadora de beleza fictícia com ondas na altura dos ombros, maquiagem soft glam e um top de tricô creme em um interior de apartamento neutro e iluminado.",
      imageCaption:
        "Esta imagem existe para mostrar a recomendação real da página: comece com um still realista que possa funcionar de forma plausível como imagem de perfil ou peça promocional antes de pagar por motion, narração ou uma stack maior de creator.",
    },
    creditNote: {
      eyebrow: "Crédito inicial por tempo limitado",
      title: "250 créditos grátis para novos cadastros",
      body: "Na atualização desta página, novos cadastros recebem 250 créditos grátis (valor de US$5) até 10 de abril. Isso já dá espaço para um pequeno loop de validação still-first antes de decidir se a persona merece mais investimento.",
      href: "/pricing",
      ctaLabel: "Ver preços",
    },
    proof: {
      eyebrow: "Prova gerada",
      title: "Uma imagem de ação é um teste barato melhor",
      intro:
        "Uma segunda imagem em que a mesma pessoa precisa segurar um produto diz mais do que outro retrato simples. Ela testa se a identidade sobrevive à interação com objetos antes de você gastar com mais variações, mais cenas ou motion.",
      promptLabel: "Prompt de validação de baixo custo",
      prompt:
        "preserve a mesma identidade fictícia de influenciadora de beleza da foto hero de referência e depois crie uma variação crível de UGC segurando produto sem perder a mesma pele quente, ondas castanho-espresso, maquiagem soft glam, joias douradas ou styling de tricô creme. Mantenha o produto sem rótulo, a mão natural e a luz fotorealista.",
      signalsLabel: "Por que essa prova importa",
      signals: [
        "O mesmo rosto, cabelo, suéter e joias ainda são lidos como uma única creator em vez de um render aleatório novo.",
        "Adicionar um frasco à cena pressiona o workflow em uma etapa muito mais barata do que vídeo ou uma sessão completa de marca.",
        "Se essa imagem quebra, você para cedo em vez de comprar mais complexidade.",
      ],
      caption:
        "Esse é o tipo de still de continuação que vale pagar primeiro. É simples, comercial o suficiente para ser útil e forte o bastante para revelar se a persona consegue sobreviver além de uma foto de perfil.",
      images: [
        {
          ...VALIDATION_IMAGE,
          alt: "A mesma influenciadora de beleza fictícia da foto hero segurando um frasco de skincare sem rótulo perto do rosto em um interior de apartamento claro.",
          label: "Imagem de validação",
        },
      ],
    },
    quickAnswer: {
      label: "Resposta rápida",
      title: "Grátis deve significar validação barata",
      body:
        "Um still realista de AI influencer consegue dizer quase tudo o que você precisa saber sobre se a direção vale continuar. O rosto vai parecer utilizável ou não. O nicho vai ficar claro ou não. O tom de marca vai encaixar ou não. Essas são decisões baratas na etapa do still e caras depois que você adiciona vídeo, voz ou distribuição.",
      takeaways: [
        "O movimento de baixo custo não é correr para uma plataforma completa de influencer. É provar a persona primeiro.",
        "A validação com still image é a etapa útil mais barata porque revela se rosto, nicho e enquadramento merecem seguir para vídeo.",
        "Nano Banana 2 é o melhor primeiro passe quando você precisa de várias opções realistas rapidamente. Nano Banana Pro é a etapa de limpeza quando uma opção já parece promissora.",
        "Nesta atualização, novos cadastros recebem 250 créditos grátis (US$5 em valor) até 10 de abril, o que deixa o primeiro loop de validação de still mais fácil de testar sem gasto inicial.",
      ],
    },
    workflow: {
      label: "Workflow",
      title: "Cinco passos para manter o teste barato e útil",
      stepLabelPrefix: "Passo",
      steps: [
        {
          title: "Defina um único briefing de persona, não dez estéticas",
          body: "Escolha primeiro nicho, faixa etária, tom da creator e tipo de cena. Quanto menor o briefing, menos dinheiro você desperdiça em geração sem foco.",
        },
        {
          title: "Gere de dois a quatro stills realistas",
          body: "Use um pequeno lote com Nano Banana 2 para comparar direções realistas, em vez de tentar perfeccionar o primeiro resultado.",
        },
        {
          title: "Escolha um vencedor e pare de ramificar",
          body: "A disciplina de baixo custo é matar direções fracas cedo. Fique com um still que já pareça crível e descarte o resto.",
        },
        {
          title: "Refine apenas o vencedor",
          body: "Se o rosto ou o enquadramento estiverem próximos do ideal, rode um passe de refinamento com Nano Banana Pro em vez de pagar por mais exploração ampla.",
        },
        {
          title: "Use QA antes de motion ou publicação",
          body: "Cheque o still final em busca de texto legível, detalhes estranhos de produto ou composição desalinhada à marca antes de gastar mais com animação ou compartilhamento.",
        },
      ],
    },
    costDiscipline: {
      label: "Disciplina de custo",
      titleLine1: "Gaste mais apenas",
      titleLine2: "quando o still sobreviver ao QA",
      rules: [
        "Trate `grátis` como orçamento de protótipo, não como promessa de que todo o pipeline da creator não vai custar nada.",
        "Limite o primeiro passe a still images. Vídeo vira a segunda compra, não a primeira.",
        "Mantenha o briefing da persona estreito o bastante para que um still vencedor realmente represente a direção.",
        "Use image reading como filtro para não continuar gastando em um still que já mostra problemas óbvios.",
      ],
    },
    validation: {
      label: "Validação em primeira mão",
      title: "O que verificamos antes de recomendar este caminho",
      cards: [
        {
          title: "Superfície de capacidades confirmada",
          body: "O status do AnyCap foi revisado novamente em 9 de abril de 2026 antes de construir esta página. Image generation, image editing, image reading, video generation, Drive e Page estavam disponíveis.",
        },
        {
          title: "Schema conferido",
          body: "Nano Banana 2 e Nano Banana Pro foram conferidos no schema ao vivo para que os exemplos usem o formato atual de parâmetros de text-to-image e image-to-image.",
        },
        {
          title: "A tese do workflow ficou estreita",
          body: "Esta página não trata `grátis` como uma alegação universal de preço. Ela trata grátis como a estratégia de validar a persona antes de comprar mais complexidade.",
        },
        {
          title: "Direção realista de imagem escolhida",
          body: "A direção do hero asset desta página foi intencionalmente limitada a uma saída realista do Nano Banana, e não a uma estética estilizada ou de avatar fantástico.",
        },
      ],
    },
    modelChoice: {
      label: "Escolha de modelo",
      title: "Escolha o modelo mais barato que ainda responde à pergunta",
      cards: [
        {
          title: "Nano Banana 2",
          label: "Melhor primeiro passe",
          body: "Use para exploração realista rápida quando quiser comparar algumas direções de creator antes de concentrar mais esforço em um vencedor.",
          href: "/models/nano-banana-2",
        },
        {
          title: "Nano Banana Pro",
          label: "Melhor passe de refinamento",
          body: "Use quando um still realista já estiver próximo e você quiser melhor retenção de identidade, mais polimento de cena ou um loop de limpeza via image-to-image.",
          href: "/models/nano-banana-pro",
        },
        {
          title: "Pricing",
          label: "Entenda a superfície de custo",
          body: "Confira o modelo de créditos antes de escalar de stills protótipo para motion, entrega ou produção repetida de conteúdo.",
          href: "/pricing",
        },
      ],
    },
    comparison: {
      label: "Comparação",
      title: "Plataforma completa primeiro vs validação de baixo custo primeiro",
      columns: {
        lens: "Lente",
        generic: "Plataforma completa primeiro",
        workflow: "Validação de baixo custo primeiro",
      },
      rows: [
        {
          lens: "Primeiro gasto",
          generic: "Você paga imediatamente por uma stack completa de avatar ou influencer.",
          workflow: "Você usa o primeiro orçamento em alguns stills realistas e valida se a persona merece mais trabalho.",
        },
        {
          lens: "Custo do erro",
          generic: "Você descobre o problema de identidade só depois de já ter tentado voz, lip-sync ou publicação.",
          workflow: "Você mata direções fracas ainda na etapa do still, quando são mais baratas de descartar.",
        },
        {
          lens: "Escolha de modelo",
          generic: "A ferramenta esconde a troca entre iteração rápida e preservação mais rígida da identidade.",
          workflow: "Você pode usar Nano Banana 2 para explorar e Nano Banana Pro para o passe de limpeza que realmente importa.",
        },
        {
          lens: "Próximo movimento",
          generic: "O workflow tenta te manter dentro do mesmo destino funcione ou não a persona.",
          workflow: "Se o still falha, você para. Se funciona, ramifica naturalmente para vídeo ou entrega.",
        },
      ],
    },
    commands: {
      label: "Exemplos de comando",
      title: "O loop de baixo custo em comandos",
      ctaLabel: "Ver Image Generation",
      examples: [
        {
          title: "Gere os primeiros stills de baixo custo",
          code: [
            "anycap image generate \\",
            "  --model nano-banana-2 \\",
            '  --prompt "creator virtual fictícia, retrato realista de lifestyle influencer, iluminação interna suave, textura natural de pele, styling casual crível, cenário de casa de creator, sem texto legível, sem marca d\'água" \\',
            "  --param aspect_ratio=4:3 \\",
            "  --param resolution=2k \\",
            "  -o influencer-free-first-pass.png",
          ].join("\n"),
        },
        {
          title: "Refine a direção vencedora",
          code: [
            "anycap image generate \\",
            "  --model nano-banana-pro \\",
            "  --mode image-to-image \\",
            '  --prompt "preserve a mesma identidade fictícia da creator, deixe o retrato mais realista e polido, com luz mais limpa e enquadramento mais forte de foto de perfil, sem texto legível, sem marca d\'água" \\',
            "  --param images=./influencer-free-first-pass.png \\",
            "  --param aspect_ratio=4:3 \\",
            "  --param resolution=2k \\",
            "  -o influencer-free-refined.png",
          ].join("\n"),
        },
        {
          title: "Faça QA antes de gastar mais",
          code: [
            "anycap actions image-read \\",
            "  --file ./influencer-free-refined.png \\",
            '  --instruction "Descreva a creator, diga se a imagem parece realista o suficiente para uso em perfil ou peça promocional e mencione qualquer texto visível ou marca d\'água."',
          ].join("\n"),
        },
      ],
    },
    faq: {
      label: "FAQ",
      title: "Perguntas comuns sobre a busca por `grátis`",
      items: [
        {
          question: "Grátis significa que eu consigo montar uma conta ilimitada de AI influencer sem gastar nada?",
          answer:
            "Não. A leitura útil de `grátis` aqui é que você consegue validar a direção da persona sem se comprometer antes com uma plataforma dedicada de influencer. Comece com um pequeno loop de still image e depois decida se o vencedor merece mais geração, motion ou distribuição.",
        },
        {
          question: "Por que começar com stills em vez de um vídeo de AI influencer?",
          answer:
            "Porque o ponto de falha mais barato é a própria identidade. Se rosto, styling e nicho não funcionam em uma still image, o vídeo normalmente amplia o problema em vez de corrigi-lo.",
        },
        {
          question: "Qual modelo de imagem do AnyCap combina melhor com esta página?",
          answer:
            "Use Nano Banana 2 para exploração realista rápida quando quiser testar várias direções. Use Nano Banana Pro quando precisar que o still vencedor se sustente melhor ou quando quiser refinar um rascunho existente via image-to-image.",
        },
        {
          question: "Posso usar minha própria foto de origem em vez de começar do zero?",
          answer:
            "Sim. Muitas vezes esse é o caminho mais barato. Se você já tiver um rascunho ou imagem de referência útil, mude para um passe image-to-image com Nano Banana Pro e preserve a identidade enquanto melhora cena, luz e enquadramento.",
        },
        {
          question: "Existe alguma oferta de créditos grátis por tempo limitado agora?",
          answer:
            "Na atualização desta página, novos cadastros receberam 250 créditos grátis (US$5 em valor) até 10 de abril. O melhor uso desse bônus é testar cedo o workflow still-first em vez de gastá-lo todo de uma vez em uma stack completa de creator.",
        },
      ],
    },
    nextStep: {
      label: "Próximo passo",
      title: "Siga para o ramo que justifica mais gasto",
      cards: [
        {
          title: "Como criar AI influencers",
          href: "/learn/how-to-make-ai-influencers",
          body: "Volte para o workflow âncora se quiser a visão completa de persona pack, motion, QA e entrega.",
        },
        {
          title: "Como fazer vídeos de AI influencer",
          href: "/learn/how-to-make-ai-influencer-videos",
          body: "Vá para lá quando o still estiver funcionando e a próxima decisão for como animá-lo sem perder a identidade.",
        },
        {
          title: "O que é um AI influencer?",
          href: "/learn/what-is-an-ai-influencer",
          body: "Leia o explicador quando precisar da definição do conceito antes de decidir se vale a pena montar esse workflow.",
        },
        {
          title: "Install AnyCap",
          href: "/guides/install-anycap",
          body: "Use isto quando quiser o caminho mais curto desta página até um setup funcional de CLI.",
        },
        {
          title: "Pricing",
          href: "/pricing",
          body: "Veja o modelo de créditos antes de sair dos stills protótipo para um loop de conteúdo com frequência maior.",
        },
        {
          title: "Image Generation",
          href: "/capabilities/image-generation",
          body: "Explore a capability que sustenta o loop de geração e refinamento de stills realistas desta página.",
        },
      ],
    },
  },
  id: {
    metadata: {
      title: "Buat AI influencer gratis dengan agen AI",
      description:
        "Buat prototipe AI influencer yang realistis tanpa terlebih dahulu membayar platform khusus: hasilkan beberapa still, refine yang terbaik, dan baru lanjut ke motion setelah personanya benar-benar bekerja.",
      openGraphTitle: "Buat AI influencer gratis dengan agen AI",
      openGraphDescription:
        "Workflow berbiaya rendah untuk menguji arah AI influencer yang realistis melalui AnyCap sebelum kamu berkomitmen ke platform avatar atau influencer khusus.",
      articleHeadline: "Buat AI influencer gratis dengan agen AI",
      articleDescription:
        "Panduan praktis untuk menguji arah persona AI influencer dengan biaya rendah: mulai dari still image, membatasi cakupan iterasi, dan hanya mendorong hasil terkuat ke motion.",
      articleAbout: [
        "AI influencer",
        "creator virtual",
        "image generation",
        "image editing",
        "validasi berbiaya rendah",
      ],
      articleKeywords: [
        "buat ai influencer gratis",
        "generator ai influencer gratis",
        "buat ai influencer",
        "cara membuat ai influencer gratis",
        "workflow ai influencer realistis",
      ],
    },
    breadcrumbItems: [
      { name: "Beranda", href: "/" },
      { name: "Pelajari", href: "/learn" },
      { name: "Buat AI influencer gratis", href: CREATE_AI_INFLUENCER_FOR_FREE_PATH },
    ],
    eyebrow: "Pelajari",
    lastUpdatedLabel: "Diperbarui 9 April 2026",
    hero: {
      titleLine1: "Buat AI influencer gratis",
      titleLine2: "dengan memvalidasi still lebih dulu",
      introBeforeLink:
        "Jika kamu ingin membuat AI influencer secara gratis, langkah praktisnya bukan membeli stack influencer penuh terlebih dahulu. Langkah yang lebih masuk akal adalah memakai loop still-image realistis yang kecil untuk membuktikan personanya, lalu baru menambah biaya jika identitasnya benar-benar bertahan. Itulah workflow berguna termurah yang bisa didukung oleh",
      linkLabel: "AnyCap image generation",
      afterLink: ".",
      summaryLabel: "Ringkasan cepat",
      summaryText:
        "Pembacaan yang tepat atas kata `gratis` adalah `jangan bayar kompleksitas tambahan sebelum still-nya bekerja.` Mulailah dengan beberapa potret realistis. Simpan satu pemenang. Refine hanya pemenang itu. Lalu putuskan apakah hasil itu layak naik ke video, publishing, atau iterasi tambahan. Pendekatan ini lebih berguna daripada berpura-pura bahwa seluruh pipeline creator seharusnya gratis selamanya. Saat ini, 250 kredit gratis dalam periode terbatas untuk pengguna baru juga membuat loop validasi pertama itu lebih mudah diuji.",
      imageAlt:
        "Potret siap profil dari AI beauty influencer fiktif dengan rambut bergelombang mengilap sebahu, makeup soft glam, dan atasan rajut warna krem di interior apartemen netral yang terang.",
      imageCaption:
        "Gambar ini ada untuk menunjukkan rekomendasi nyata dari halaman ini: mulai dari satu still realistis yang masuk akal dipakai sebagai gambar profil atau promo sebelum membayar motion, narasi, atau creator stack yang lebih besar.",
    },
    creditNote: {
      eyebrow: "Kredit awal terbatas",
      title: "250 kredit gratis untuk pendaftar baru",
      body: "Pada saat halaman ini diperbarui, pendaftar baru menerima 250 kredit gratis (senilai $5) hingga 10 Apr. Itu cukup untuk menjalankan loop validasi still-first kecil sebelum memutuskan apakah persona ini pantas mendapat budget lebih besar.",
      href: "/pricing",
      ctaLabel: "Lihat pricing",
    },
    proof: {
      eyebrow: "Bukti hasil generasi",
      title: "Satu action shot adalah tes murah yang lebih baik",
      intro:
        "Gambar kedua di mana orang yang sama harus memegang produk memberi informasi lebih banyak daripada satu potret polos lagi. Gambar ini menguji apakah identitasnya bertahan ketika berinteraksi dengan objek sebelum kamu mengeluarkan biaya untuk lebih banyak variant, adegan, atau motion.",
      promptLabel: "Prompt validasi berbiaya rendah",
      prompt:
        "pertahankan identitas AI beauty influencer fiktif yang sama dari hero shot referensi, lalu buat satu varian UGC product-hold yang meyakinkan tanpa kehilangan complexion hangat yang sama, rambut bergelombang cokelat espresso, makeup soft glam, perhiasan emas, atau styling rajut krem. Jaga produk tetap tanpa label, tangan tetap alami, dan pencahayaan tetap fotorealistis.",
      signalsLabel: "Mengapa bukti ini penting",
      signals: [
        "Wajah, rambut, sweater, dan perhiasan yang sama masih terbaca sebagai satu creator, bukan render acak yang baru.",
        "Menambahkan satu botol ke adegan menekan workflow ini di tahap yang jauh lebih murah daripada video atau brand shoot penuh.",
        "Jika shot ini rusak, kamu berhenti lebih awal alih-alih membeli kompleksitas tambahan.",
      ],
      caption:
        "Inilah jenis still lanjutan yang layak dibayar terlebih dahulu. Sederhana, cukup komersial untuk berguna, dan cukup kuat untuk mengungkap apakah persona ini bisa bertahan lebih jauh daripada sekadar foto profil.",
      images: [
        {
          ...VALIDATION_IMAGE,
          alt: "AI beauty influencer fiktif yang sama dari hero shot memegang botol skincare tanpa label di dekat wajahnya dalam interior apartemen yang terang.",
          label: "Shot validasi",
        },
      ],
    },
    quickAnswer: {
      label: "Jawaban cepat",
      title: "Gratis seharusnya berarti validasi murah",
      body:
        "Satu still AI influencer yang realistis bisa memberi tahu hampir semua hal penting tentang apakah arah ini layak diteruskan. Wajahnya akan terasa usable atau tidak. Nichenya akan terbaca jelas atau tidak. Tone brand-nya akan pas atau tidak. Semua itu adalah keputusan murah di tahap still dan menjadi mahal setelah kamu menambahkan video, voice, atau distribution.",
      takeaways: [
        "Langkah berbiaya rendah bukan langsung mengejar platform influencer penuh. Langkahnya adalah membuktikan persona terlebih dahulu.",
        "Validasi still-image adalah langkah berguna termurah karena mengungkap apakah wajah, niche, dan framing pantas dibawa ke video.",
        "Nano Banana 2 adalah first pass terbaik ketika kamu memerlukan beberapa opsi realistis dengan cepat. Nano Banana Pro adalah tahap cleanup ketika satu opsi sudah terlihat menjanjikan.",
        "Pada saat pembaruan ini, pendaftar baru menerima 250 kredit gratis (senilai $5) hingga 10 Apr, sehingga loop validasi still pertama lebih mudah diuji tanpa biaya di muka.",
      ],
    },
    workflow: {
      label: "Workflow",
      title: "Lima langkah agar tes tetap murah dan berguna",
      stepLabelPrefix: "Langkah",
      steps: [
        {
          title: "Tentukan satu brief persona, bukan sepuluh estetika",
          body: "Pilih niche, rentang usia, tone creator, dan tipe adegan terlebih dahulu. Makin sempit brief-nya, makin sedikit uang yang terbuang untuk generasi yang tidak fokus.",
        },
        {
          title: "Hasilkan dua sampai empat still yang realistis",
          body: "Gunakan batch kecil Nano Banana 2 untuk membandingkan beberapa arah realistis, alih-alih mencoba menyempurnakan hasil pertama.",
        },
        {
          title: "Pilih satu pemenang dan hentikan percabangan",
          body: "Disiplin biaya rendah berarti mematikan arah yang lemah sejak awal. Simpan satu still yang sudah terlihat meyakinkan dan buang sisanya.",
        },
        {
          title: "Refine hanya pemenangnya",
          body: "Jika wajah atau framing-nya sudah mendekati, jalankan refinement pass Nano Banana Pro daripada membayar lebih banyak eksplorasi yang luas.",
        },
        {
          title: "Gunakan QA sebelum motion atau publishing",
          body: "Periksa still final untuk teks yang terbaca, detail produk yang janggal, atau komposisi yang melenceng dari brand sebelum kamu mengeluarkan biaya lagi untuk animasi atau berbagi.",
        },
      ],
    },
    costDiscipline: {
      label: "Disiplin biaya",
      titleLine1: "Belanjakan lebih banyak hanya",
      titleLine2: "ketika still lolos QA",
      rules: [
        "Perlakukan `gratis` sebagai budget prototipe, bukan janji bahwa seluruh pipeline creator tidak akan menelan biaya sama sekali.",
        "Batasi pass pertama ke still image saja. Video menjadi pembelian kedua, bukan yang pertama.",
        "Jaga brief persona cukup sempit agar satu still pemenang benar-benar bisa mewakili arahnya.",
        "Gunakan image reading sebagai filter agar kamu tidak terus menghabiskan biaya pada still yang sudah menunjukkan masalah yang jelas.",
      ],
    },
    validation: {
      label: "Validasi langsung",
      title: "Yang kami cek sebelum merekomendasikan rute ini",
      cards: [
        {
          title: "Capability surface terkonfirmasi",
          body: "Status AnyCap dicek ulang pada 9 April 2026 sebelum halaman ini dibangun. Image generation, image editing, image reading, video generation, Drive, dan Page tersedia.",
        },
        {
          title: "Schema sudah dicek",
          body: "Nano Banana 2 dan Nano Banana Pro dicek terhadap schema live sehingga contoh command memakai bentuk parameter text-to-image dan image-to-image yang berlaku sekarang.",
        },
        {
          title: "Klaim workflow dijaga tetap sempit",
          body: "Halaman ini tidak memperlakukan `gratis` sebagai klaim pricing universal. Halaman ini memperlakukan gratis sebagai strategi memvalidasi persona sebelum kamu membeli kompleksitas tambahan.",
        },
        {
          title: "Arah gambar realistis dipilih",
          body: "Arah hero asset untuk halaman ini sengaja dibatasi ke output Nano Banana yang realistis, bukan ke estetika avatar fantasi atau stylized.",
        },
      ],
    },
    modelChoice: {
      label: "Pilihan model",
      title: "Pilih model termurah yang masih menjawab pertanyaannya",
      cards: [
        {
          title: "Nano Banana 2",
          label: "First pass terbaik",
          body: "Gunakan untuk eksplorasi realistis yang cepat ketika kamu ingin membandingkan beberapa arah creator sebelum menghabiskan lebih banyak effort pada satu pemenang.",
          href: "/models/nano-banana-2",
        },
        {
          title: "Nano Banana Pro",
          label: "Refinement pass terbaik",
          body: "Gunakan ketika still realistis sudah hampir jadi dan kamu ingin identity hold yang lebih baik, polesan adegan yang lebih kuat, atau cleanup loop image-to-image.",
          href: "/models/nano-banana-pro",
        },
        {
          title: "Pricing",
          label: "Pahami surface budget",
          body: "Periksa model kredit sebelum kamu naik dari still prototipe ke motion, delivery, atau produksi konten berulang.",
          href: "/pricing",
        },
      ],
    },
    comparison: {
      label: "Perbandingan",
      title: "Platform penuh lebih dulu vs validasi biaya rendah lebih dulu",
      columns: {
        lens: "Sudut pandang",
        generic: "Platform penuh lebih dulu",
        workflow: "Validasi biaya rendah lebih dulu",
      },
      rows: [
        {
          lens: "Pengeluaran pertama",
          generic: "Kamu langsung membayar stack avatar atau influencer yang lengkap.",
          workflow: "Kamu memakai budget pertama untuk beberapa still realistis dan memvalidasi apakah persona ini pantas mendapat pekerjaan lebih lanjut.",
        },
        {
          lens: "Biaya kegagalan",
          generic: "Kamu baru menemukan masalah identitas setelah mencoba voice, lip-sync, atau publishing.",
          workflow: "Kamu mematikan arah persona yang lemah pada tahap still ketika biaya membuangnya masih paling murah.",
        },
        {
          lens: "Pilihan model",
          generic: "Tool-nya menyembunyikan trade-off antara iterasi cepat dan preservasi identitas yang lebih ketat.",
          workflow: "Kamu bisa memakai Nano Banana 2 untuk eksplorasi dan Nano Banana Pro untuk cleanup pass yang benar-benar penting.",
        },
        {
          lens: "Langkah berikutnya",
          generic: "Workflow-nya mencoba menahanmu di satu tujuan yang sama terlepas dari apakah personanya bekerja atau tidak.",
          workflow: "Jika still gagal, kamu berhenti. Jika berhasil, kamu bercabang secara alami ke video atau delivery.",
        },
      ],
    },
    commands: {
      label: "Contoh command",
      title: "Loop biaya rendah dalam bentuk command",
      ctaLabel: "Lihat Image Generation",
      examples: [
        {
          title: "Hasilkan still awal berbiaya rendah",
          code: [
            "anycap image generate \\",
            "  --model nano-banana-2 \\",
            '  --prompt "creator virtual fiktif, potret lifestyle influencer realistis, pencahayaan indoor yang lembut, tekstur kulit alami, styling kasual yang meyakinkan, setting rumah creator, tanpa teks yang terbaca, tanpa watermark" \\',
            "  --param aspect_ratio=4:3 \\",
            "  --param resolution=2k \\",
            "  -o influencer-free-first-pass.png",
          ].join("\n"),
        },
        {
          title: "Refine arah yang menang",
          code: [
            "anycap image generate \\",
            "  --model nano-banana-pro \\",
            "  --mode image-to-image \\",
            '  --prompt "pertahankan identitas creator fiktif yang sama, buat potret lebih realistis dan polished, pencahayaan lebih bersih, framing foto profil lebih kuat, tanpa teks yang terbaca, tanpa watermark" \\',
            "  --param images=./influencer-free-first-pass.png \\",
            "  --param aspect_ratio=4:3 \\",
            "  --param resolution=2k \\",
            "  -o influencer-free-refined.png",
          ].join("\n"),
        },
        {
          title: "QA sebelum kamu mengeluarkan biaya lebih banyak",
          code: [
            "anycap actions image-read \\",
            "  --file ./influencer-free-refined.png \\",
            '  --instruction "Deskripsikan creator-nya, sebutkan apakah gambar ini terasa cukup realistis untuk dipakai sebagai profil atau materi promo, dan sebutkan teks yang terlihat atau watermark jika ada."',
          ].join("\n"),
        },
      ],
    },
    faq: {
      label: "FAQ",
      title: "Pertanyaan umum tentang kueri `gratis`",
      items: [
        {
          question: "Apakah gratis berarti saya bisa membangun akun AI influencer tanpa batas tanpa biaya sama sekali?",
          answer:
            "Tidak. Pembacaan yang berguna atas kata `gratis` di sini adalah bahwa kamu bisa memvalidasi arah persona tanpa langsung berkomitmen ke platform influencer khusus. Mulailah dengan loop still-image kecil, lalu putuskan apakah pemenangnya layak mendapat generasi, motion, atau distribusi tambahan.",
        },
        {
          question: "Mengapa memulai dari still, bukan dari video AI influencer?",
          answer:
            "Karena titik kegagalan termurah adalah identitas itu sendiri. Jika wajah, styling, dan niche tidak bekerja di still image, video biasanya memperbesar masalahnya alih-alih memperbaikinya.",
        },
        {
          question: "Model gambar AnyCap mana yang paling cocok untuk halaman ini?",
          answer:
            "Gunakan Nano Banana 2 untuk eksplorasi realistis yang cepat ketika kamu ingin beberapa arah sekaligus. Gunakan Nano Banana Pro ketika kamu butuh still pemenang yang lebih rapi atau ketika ingin refine draft yang sudah ada melalui image-to-image.",
        },
        {
          question: "Bisakah saya memakai source photo saya sendiri alih-alih mulai dari nol?",
          answer:
            "Ya. Itu sering kali menjadi rute termurah. Jika kamu sudah punya draft atau reference image yang usable, pindahlah ke image-to-image pass Nano Banana Pro dan pertahankan identitas sambil memperbaiki adegan, pencahayaan, dan framing.",
        },
        {
          question: "Apakah sekarang ada penawaran kredit gratis terbatas?",
          answer:
            "Pada saat halaman ini diperbarui, pendaftar baru menerima 250 kredit gratis (senilai $5) hingga 10 Apr. Cara terbaik memanfaatkan bonus itu adalah menguji workflow still-first lebih awal, bukannya langsung menghabiskannya untuk creator stack end-to-end yang lebih besar.",
        },
      ],
    },
    nextStep: {
      label: "Langkah berikutnya",
      title: "Masuk ke cabang yang memang layak mendapat biaya lebih banyak",
      cards: [
        {
          title: "Cara membuat AI influencer",
          href: "/learn/how-to-make-ai-influencers",
          body: "Kembali ke workflow anchor jika kamu ingin gambaran lengkap tentang persona pack, motion, QA, dan delivery.",
        },
        {
          title: "Cara membuat video AI influencer",
          href: "/learn/how-to-make-ai-influencer-videos",
          body: "Pindah ke sana ketika still-nya sudah bekerja dan keputusan berikutnya adalah bagaimana menganimasikannya tanpa kehilangan identitas.",
        },
        {
          title: "Apa itu AI influencer?",
          href: "/learn/what-is-an-ai-influencer",
          body: "Baca explainernya ketika kamu membutuhkan definisi konsep sebelum memutuskan apakah workflow ini layak dibangun.",
        },
        {
          title: "Install AnyCap",
          href: "/guides/install-anycap",
          body: "Gunakan ini jika kamu ingin jalur tercepat dari halaman ini menuju setup CLI yang berfungsi.",
        },
        {
          title: "Pricing",
          href: "/pricing",
          body: "Periksa model kredit sebelum kamu bergerak dari still prototipe ke loop konten yang frekuensinya lebih tinggi.",
        },
        {
          title: "Image Generation",
          href: "/capabilities/image-generation",
          body: "Lihat capability surface yang menjalankan loop generasi dan refinement still realistis pada halaman ini.",
        },
      ],
    },
  },
} as const;

export function getCreateAIInfluencerForFreeMetadata(locale: SiteLocale): Metadata {
  const content = contentByLocale[locale] ?? contentByLocale.en;

  return {
    title: content.metadata.title,
    description: content.metadata.description,
    alternates: { canonical: CREATE_AI_INFLUENCER_FOR_FREE_PATH },
    openGraph: {
      type: "website",
      locale: getLocaleConfig(locale).ogLocale,
      url: CREATE_AI_INFLUENCER_FOR_FREE_PATH,
      siteName: siteConfig.siteName,
      title: content.metadata.openGraphTitle,
      description: content.metadata.openGraphDescription,
    },
  };
}

export function getCreateAIInfluencerForFreePageData(locale: SiteLocale) {
  const content = contentByLocale[locale] ?? contentByLocale.en;

  return {
    ...content,
    articleJsonLd: createTechArticleJsonLd({
      headline: content.metadata.articleHeadline,
      description: content.metadata.articleDescription,
      path: CREATE_AI_INFLUENCER_FOR_FREE_PATH,
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
