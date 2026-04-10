import type { Metadata } from "next";
import { createFaqPageJsonLd, createTechArticleJsonLd } from "@/lib/schema";
import { getLocaleConfig, siteConfig, type SiteLocale } from "@/lib/site";

export const AI_VIDEO_GENERATOR_FROM_IMAGE_PATH = "/learn/ai-video-generator-from-image";

const LAST_UPDATED_ISO = "2026-04-09";

const contentByLocale = {
  en: {
    metadata: {
      title: "AI Video Generator from Image with an AI Agent",
      description:
        "Use AnyCap to turn one strong still into motion, inspect the clip, and branch into new variants without losing the connection to the source image.",
      openGraphTitle: "AI Video Generator from Image with an AI Agent",
      openGraphDescription:
        "A still-first image-to-video workflow for teams that want more control than a generic AI video generator from image tool usually provides.",
      articleHeadline: "AI Video Generator from Image with an AI Agent",
      articleDescription:
        "A practical guide to image-to-video workflows where the source image, motion prompt, clip QA, and delivery handoff stay inside one agent workflow.",
      articleAbout: [
        "AI video generator from image",
        "Image-to-video",
        "Video generation",
        "Still-first workflow",
        "AI agents",
      ],
      articleKeywords: [
        "ai video generator from image",
        "image to video ai",
        "image to video workflow",
        "image to video generator",
        "still to video ai",
      ],
    },
    breadcrumbItems: [
      { name: "Home", href: "/" },
      { name: "Learn", href: "/learn" },
      { name: "AI Video Generator from Image", href: AI_VIDEO_GENERATOR_FROM_IMAGE_PATH },
    ],
    eyebrow: "Learn",
    lastUpdatedLabel: "Last updated April 9, 2026",
    hero: {
      titleLine1: "AI video generator from image",
      titleLine2: "starts with the image, not the video",
      introBeforeFirstLink:
        "If you are looking for an AI video generator from image, the source image is the whole point. It sets the subject, the framing, and the mood. The motion layer should extend that frame, not fight it. That is why a still-first workflow around",
      firstLinkLabel: "image generation",
      betweenLinks: "and",
      secondLinkLabel: "video generation",
      afterSecondLink:
        "is more useful than a black-box `upload image, get video` promise.",
      summaryLabel: "Answer-first summary",
      summaryText:
        "Treat the image like the creative anchor. Use AnyCap to make or refine the still first, animate it second, and inspect the clip third. That gives the agent more control than a generic image-to-video tool that treats the source image as disposable.",
    },
    quickAnswer: {
      label: "Quick answer",
      title: "Motion should protect the still",
      body:
        "The job of image-to-video is not to reinvent the scene. It is to add controlled movement to a frame that already deserves attention. When the source image is weak, the motion layer usually spreads the weakness. When the source image is strong, the motion layer becomes a multiplier.",
      takeaways: [
        "Image-to-video is most useful when the still already works. Motion should add life, not rescue a weak frame.",
        "The shortest reliable workflow is source still, small motion brief, clip QA, then branch only if the result survives review.",
        "AnyCap matters because the source image, video generation, QA, and delivery surfaces can stay in one command flow.",
      ],
    },
    workflow: {
      label: "Workflow",
      title: "Five steps from still to motion",
      stepLabelPrefix: "Step",
      steps: [
        {
          title: "Start with a still that deserves motion",
          body: "Use an existing image or generate one first. The subject, crop, and background should already be good enough to keep.",
        },
        {
          title: "Write a small motion brief",
          body: "Describe only the movement you want: camera drift, head turn, cloth motion, hand gesture, or subtle environmental change.",
        },
        {
          title: "Generate one short clip first",
          body: "Use the shortest duration that can answer the question. Longer clips multiply drift and cost before you know whether the base idea works.",
        },
        {
          title: "Inspect the output",
          body: "Check whether the motion supports the original image or fights it. Look for subject drift, awkward warping, or a crop that no longer reads well.",
        },
        {
          title: "Branch into variants only after review",
          body: "Once one clip survives, then expand into other aspect ratios, stronger motion, or adjacent scenes from the same source family.",
        },
      ],
    },
    validation: {
      label: "First-hand validation",
      title: "What we checked before writing this page",
      cards: [
        {
          title: "Capability surface confirmed",
          body: "AnyCap status was rechecked on April 9, 2026 before expanding this workflow. Image generation, video generation, image reading, video reading, Drive, and Page were available.",
        },
        {
          title: "Schema checked",
          body: "Nano Banana Pro, Nano Banana 2, and Seedance 1.5 Pro were checked against the live schema before the command examples were written.",
        },
        {
          title: "Still-first position held",
          body: "This page treats source-image quality as a prerequisite rather than pretending motion models should solve a weak frame on their own.",
        },
        {
          title: "Cluster fit confirmed",
          body: "The page was written to support the AI influencer cluster while remaining broad enough to serve adjacent image-to-video use cases too.",
        },
      ],
    },
    modelChoice: {
      label: "Model choice",
      title: "Separate the source-image job from the motion job",
      cards: [
        {
          title: "Nano Banana Pro",
          label: "Best source still",
          body: "Use this when the source image needs stronger realism or tighter identity preservation before motion begins.",
          href: "/models/nano-banana-pro",
        },
        {
          title: "Nano Banana 2",
          label: "Best for source-image iteration",
          body: "Use this when you need to compare several source frames quickly before choosing the one worth animating.",
          href: "/models/nano-banana-2",
        },
        {
          title: "Seedance 1.5 Pro",
          label: "Best motion layer",
          body: "Use this for the image-to-video step once the source frame already answers the visual question.",
          href: "/models/seedance-1-5-pro",
        },
      ],
    },
    comparison: {
      label: "Comparison",
      title: "Generic image-to-video tool vs agent workflow",
      columns: {
        lens: "Lens",
        generic: "Generic tool",
        workflow: "Agent workflow",
      },
      rows: [
        {
          lens: "What the source image means",
          generic: "The source image is treated like raw input that will be overwritten by the model.",
          workflow: "The source image is treated like a creative constraint that the motion layer should respect.",
        },
        {
          lens: "Prompt scope",
          generic: "The prompt tries to describe the whole scene and the whole video again.",
          workflow: "The prompt focuses on movement because the still already carries the composition.",
        },
        {
          lens: "Review step",
          generic: "You export and hope it worked.",
          workflow: "The agent can read the clip and tell you whether the motion matched the intent.",
        },
        {
          lens: "Reuse",
          generic: "One still becomes one clip and the workflow stops there.",
          workflow: "One source still can branch into several clips, crops, or channel-specific edits after the first one works.",
        },
      ],
    },
    commands: {
      label: "Command examples",
      title: "The image-to-video loop in commands",
      ctaLabel: "Browse Video Generation",
      examples: [
        {
          title: "Generate the source image first",
          code: [
            "anycap image generate \\",
            "  --model nano-banana-2 \\",
            '  --prompt "realistic creator portrait, clean home-studio setup, direct-to-camera framing, no readable text, no watermark" \\',
            "  --param aspect_ratio=9:16 \\",
            "  --param resolution=2k \\",
            "  -o image-to-video-source.png",
          ].join("\n"),
        },
        {
          title: "Animate the source image",
          code: [
            "anycap video generate \\",
            "  --model seedance-1.5-pro \\",
            "  --mode image-to-video \\",
            '  --prompt "subtle camera drift, natural head movement, gentle hand gesture, realistic motion, keep the identity and framing stable" \\',
            "  --param images=./image-to-video-source.png \\",
            "  --param aspect_ratio=9:16 \\",
            "  --param duration=5 \\",
            "  --param resolution=720p \\",
            "  -o image-to-video-short.mp4",
          ].join("\n"),
        },
        {
          title: "Review the motion result",
          code: [
            "anycap actions video-read \\",
            "  --file ./image-to-video-short.mp4 \\",
            '  --instruction "Describe the clip, explain whether the motion matched the original still, and mention any visible text overlays or visual artifacts."',
          ].join("\n"),
        },
      ],
    },
    faq: {
      label: "FAQ",
      title: "Common questions about image-to-video",
      items: [
        {
          question: "What makes an image-to-video workflow actually good?",
          answer:
            "The source image has to be strong before motion starts. Image-to-video works best when the still already nails the subject, framing, and mood. Then the motion prompt only has to describe the change.",
        },
        {
          question: "Should I use a separate image generator first?",
          answer:
            "Often yes. If the input image is weak, image-to-video becomes an expensive way to animate a weak frame. AnyCap is useful because the same workflow can generate the source still and animate it later.",
        },
        {
          question: "Which AnyCap models fit this workflow best?",
          answer:
            "Use Nano Banana Pro when the source still must hold together tightly, Nano Banana 2 for faster source-image exploration, and Seedance 1.5 Pro when the next step is controlled image-to-video motion.",
        },
        {
          question: "Can AnyCap review the generated clip too?",
          answer:
            "Yes. After generation, use video reading to summarize what happened, inspect whether the motion matches the prompt, and catch obvious overlays or visual artifacts.",
        },
      ],
    },
    nextStep: {
      label: "Next step",
      title: "Move into the narrower workflow if needed",
      cards: [
        {
          title: "How to Make AI Influencer Videos",
          href: "/learn/how-to-make-ai-influencer-videos",
          body: "Use the narrower page when the image-to-video workflow is specifically for a virtual creator or influencer clip.",
        },
        {
          title: "How to Make AI Influencers",
          href: "/learn/how-to-make-ai-influencers",
          body: "Go back to the anchor page for the full still, motion, QA, and delivery cluster.",
        },
        {
          title: "Image Generation",
          href: "/capabilities/image-generation",
          body: "Browse the capability surface for creating or refining the source still before motion.",
        },
        {
          title: "Video Generation",
          href: "/capabilities/video-generation",
          body: "Browse the capability surface that handles the motion layer described on this page.",
        },
        {
          title: "Install AnyCap",
          href: "/guides/install-anycap",
          body: "Use this when you want to run the full still-plus-motion workflow locally.",
        },
        {
          title: "Drive",
          href: "/capabilities/drive",
          body: "Use Drive when the finished clip needs to be reviewed by humans outside your local session.",
        },
      ],
    },
  },
  "pt-br": {
    metadata: {
      title: "Gerador de vídeo por IA a partir de imagem com um agente de IA",
      description:
        "Use o AnyCap para transformar um still forte em motion, inspecionar o clipe e abrir novas variantes sem perder a ligação com a imagem de origem.",
      openGraphTitle: "Gerador de vídeo por IA a partir de imagem com um agente de IA",
      openGraphDescription:
        "Um workflow image-to-video still-first para times que querem mais controle do que uma ferramenta genérica de AI video generator from image costuma oferecer.",
      articleHeadline: "Gerador de vídeo por IA a partir de imagem com um agente de IA",
      articleDescription:
        "Um guia prático para workflows image-to-video em que a imagem de origem, o prompt de motion, o QA do clipe e o handoff de entrega ficam dentro do mesmo workflow do agente.",
      articleAbout: [
        "gerador de vídeo por IA a partir de imagem",
        "image-to-video",
        "geração de vídeo",
        "workflow still-first",
        "agentes de IA",
      ],
      articleKeywords: [
        "gerador de vídeo ia por imagem",
        "imagem para vídeo ia",
        "workflow image to video",
        "gerador image to video",
        "still para vídeo ia",
      ],
    },
    breadcrumbItems: [
      { name: "Início", href: "/" },
      { name: "Aprender", href: "/learn" },
      { name: "Gerador de vídeo por IA a partir de imagem", href: AI_VIDEO_GENERATOR_FROM_IMAGE_PATH },
    ],
    eyebrow: "Aprender",
    lastUpdatedLabel: "Atualizado em 9 de abril de 2026",
    hero: {
      titleLine1: "Gerador de vídeo por IA a partir de imagem",
      titleLine2: "começa pela imagem, não pelo vídeo",
      introBeforeFirstLink:
        "Se você está procurando um gerador de vídeo por IA a partir de imagem, a imagem de origem é o ponto principal. Ela define o sujeito, o enquadramento e o clima. A camada de motion deve estender esse frame, não lutar contra ele. É por isso que um workflow still-first em torno de",
      firstLinkLabel: "image generation",
      betweenLinks: "e",
      secondLinkLabel: "video generation",
      afterSecondLink:
        "é mais útil do que a promessa de caixa-preta `suba a imagem, receba o vídeo`.",
      summaryLabel: "Resumo direto",
      summaryText:
        "Trate a imagem como a âncora criativa. Use o AnyCap para gerar ou refinar o still primeiro, animá-lo depois e inspecionar o clipe em seguida. Isso dá ao agente mais controle do que uma ferramenta genérica de image-to-video que trata a imagem-fonte como descartável.",
    },
    quickAnswer: {
      label: "Resposta rápida",
      title: "O motion deve proteger o still",
      body:
        "O trabalho do image-to-video não é reinventar a cena. É adicionar movimento controlado a um frame que já merece atenção. Quando a imagem-fonte é fraca, a camada de motion normalmente espalha essa fraqueza. Quando a imagem-fonte é forte, a camada de motion vira multiplicador.",
      takeaways: [
        "Image-to-video é mais útil quando o still já funciona. O motion deve acrescentar vida, não resgatar um frame fraco.",
        "O workflow confiável mais curto é still de origem, pequeno briefing de motion, QA do clipe e só então ramificar se o resultado sobreviver à revisão.",
        "O AnyCap importa porque a imagem-fonte, a geração de vídeo, o QA e as superfícies de entrega podem permanecer dentro do mesmo fluxo de comandos.",
      ],
    },
    workflow: {
      label: "Workflow",
      title: "Cinco passos do still ao motion",
      stepLabelPrefix: "Passo",
      steps: [
        {
          title: "Comece com um still que mereça motion",
          body: "Use uma imagem existente ou gere uma primeiro. O sujeito, o crop e o fundo já devem estar bons o bastante para valer a pena manter.",
        },
        {
          title: "Escreva um pequeno briefing de motion",
          body: "Descreva apenas o movimento desejado: deriva de câmera, giro de cabeça, movimento de roupa, gesto de mão ou uma mudança sutil de ambiente.",
        },
        {
          title: "Gere primeiro um clipe curto",
          body: "Use a menor duração capaz de responder à pergunta. Clipes mais longos multiplicam drift e custo antes de você saber se a ideia base funciona.",
        },
        {
          title: "Inspecione a saída",
          body: "Verifique se o motion apoia a imagem original ou briga com ela. Procure drift do sujeito, deformações estranhas ou um crop que já não funciona bem.",
        },
        {
          title: "Abra variantes só depois da revisão",
          body: "Depois que um clipe sobreviver, aí sim expanda para outras proporções, motion mais forte ou cenas adjacentes dentro da mesma família de origem.",
        },
      ],
    },
    validation: {
      label: "Validação em primeira mão",
      title: "O que verificamos antes de escrever esta página",
      cards: [
        {
          title: "Superfície de capacidades confirmada",
          body: "O status do AnyCap foi revisto em 9 de abril de 2026 antes de ampliar este workflow. Image generation, video generation, image reading, video reading, Drive e Page estavam disponíveis.",
        },
        {
          title: "Schema conferido",
          body: "Nano Banana Pro, Nano Banana 2 e Seedance 1.5 Pro foram conferidos no schema ao vivo antes de os comandos de exemplo serem escritos.",
        },
        {
          title: "Posição still-first mantida",
          body: "Esta página trata a qualidade da imagem-fonte como pré-requisito, em vez de fingir que modelos de motion deveriam resolver um frame fraco sozinhos.",
        },
        {
          title: "Aderência ao cluster confirmada",
          body: "A página foi escrita para apoiar o cluster de AI influencer e, ao mesmo tempo, continuar ampla o suficiente para outros casos de image-to-video.",
        },
      ],
    },
    modelChoice: {
      label: "Escolha de modelo",
      title: "Separe o trabalho da imagem-fonte do trabalho do motion",
      cards: [
        {
          title: "Nano Banana Pro",
          label: "Melhor still de origem",
          body: "Use quando a imagem-fonte precisar de mais realismo ou de preservação mais rígida da identidade antes de o motion começar.",
          href: "/models/nano-banana-pro",
        },
        {
          title: "Nano Banana 2",
          label: "Melhor para iterar a imagem-fonte",
          body: "Use quando precisar comparar rapidamente vários frames de origem antes de escolher qual vale animar.",
          href: "/models/nano-banana-2",
        },
        {
          title: "Seedance 1.5 Pro",
          label: "Melhor camada de motion",
          body: "Use para a etapa image-to-video quando o frame de origem já responder à pergunta visual.",
          href: "/models/seedance-1-5-pro",
        },
      ],
    },
    comparison: {
      label: "Comparação",
      title: "Ferramenta genérica de image-to-video vs workflow com agente",
      columns: {
        lens: "Lente",
        generic: "Ferramenta genérica",
        workflow: "Workflow com agente",
      },
      rows: [
        {
          lens: "O que a imagem-fonte significa",
          generic: "A imagem-fonte é tratada como matéria-prima que será sobrescrita pelo modelo.",
          workflow: "A imagem-fonte é tratada como uma restrição criativa que a camada de motion deve respeitar.",
        },
        {
          lens: "Escopo do prompt",
          generic: "O prompt tenta descrever a cena inteira e o vídeo inteiro outra vez.",
          workflow: "O prompt se concentra no movimento porque o still já carrega a composição.",
        },
        {
          lens: "Etapa de revisão",
          generic: "Você exporta e torce para ter funcionado.",
          workflow: "O agente consegue ler o clipe e dizer se o motion correspondeu à intenção.",
        },
        {
          lens: "Reutilização",
          generic: "Um still vira um clipe e o workflow termina ali.",
          workflow: "Um still de origem pode se ramificar em vários clipes, crops ou edições por canal depois que o primeiro funciona.",
        },
      ],
    },
    commands: {
      label: "Exemplos de comando",
      title: "O loop image-to-video em comandos",
      ctaLabel: "Ver Video Generation",
      examples: [
        {
          title: "Gere primeiro a imagem de origem",
          code: [
            "anycap image generate \\",
            "  --model nano-banana-2 \\",
            '  --prompt "retrato realista de creator, setup limpo de home studio, enquadramento direto para a câmera, sem texto legível, sem marca d\'água" \\',
            "  --param aspect_ratio=9:16 \\",
            "  --param resolution=2k \\",
            "  -o image-to-video-source.png",
          ].join("\n"),
        },
        {
          title: "Anime a imagem de origem",
          code: [
            "anycap video generate \\",
            "  --model seedance-1.5-pro \\",
            "  --mode image-to-video \\",
            '  --prompt "deriva sutil de câmera, movimento natural de cabeça, gesto suave de mão, motion realista, mantenha a identidade e o enquadramento estáveis" \\',
            "  --param images=./image-to-video-source.png \\",
            "  --param aspect_ratio=9:16 \\",
            "  --param duration=5 \\",
            "  --param resolution=720p \\",
            "  -o image-to-video-short.mp4",
          ].join("\n"),
        },
        {
          title: "Revise o resultado do motion",
          code: [
            "anycap actions video-read \\",
            "  --file ./image-to-video-short.mp4 \\",
            '  --instruction "Descreva o clipe, explique se o motion corresponde ao still original e mencione quaisquer overlays de texto visíveis ou artefatos visuais."',
          ].join("\n"),
        },
      ],
    },
    faq: {
      label: "FAQ",
      title: "Perguntas comuns sobre image-to-video",
      items: [
        {
          question: "O que faz um workflow image-to-video realmente ser bom?",
          answer:
            "A imagem de origem precisa ser forte antes do motion começar. Image-to-video funciona melhor quando o still já acerta sujeito, enquadramento e clima. Aí o prompt de motion só precisa descrever a mudança.",
        },
        {
          question: "Devo usar primeiro um gerador de imagem separado?",
          answer:
            "Frequentemente sim. Se a imagem de entrada for fraca, image-to-video vira uma forma cara de animar um frame fraco. O AnyCap é útil porque o mesmo workflow consegue gerar o still de origem e animá-lo depois.",
        },
        {
          question: "Quais modelos do AnyCap combinam melhor com esse workflow?",
          answer:
            "Use Nano Banana Pro quando o still de origem precisar se manter mais rígido, Nano Banana 2 para explorar a imagem-fonte com mais velocidade e Seedance 1.5 Pro quando o próximo passo for motion image-to-video controlado.",
        },
        {
          question: "O AnyCap também consegue revisar o clipe gerado?",
          answer:
            "Sim. Depois da geração, use video reading para resumir o que aconteceu, inspecionar se o motion corresponde ao prompt e capturar overlays ou artefatos visuais óbvios.",
        },
      ],
    },
    nextStep: {
      label: "Próximo passo",
      title: "Siga para o workflow mais estreito se precisar",
      cards: [
        {
          title: "Como fazer vídeos de AI influencer",
          href: "/learn/how-to-make-ai-influencer-videos",
          body: "Use a página mais específica quando o workflow image-to-video for direcionado a um clipe de creator virtual ou influencer.",
        },
        {
          title: "Como criar AI influencers",
          href: "/learn/how-to-make-ai-influencers",
          body: "Volte para a página âncora para ver o cluster completo de still, motion, QA e entrega.",
        },
        {
          title: "Image Generation",
          href: "/capabilities/image-generation",
          body: "Veja a capability que cria ou refina o still de origem antes do motion.",
        },
        {
          title: "Video Generation",
          href: "/capabilities/video-generation",
          body: "Veja a capability que cuida da camada de motion descrita nesta página.",
        },
        {
          title: "Install AnyCap",
          href: "/guides/install-anycap",
          body: "Use isto quando quiser rodar localmente o workflow completo de still mais motion.",
        },
        {
          title: "Drive",
          href: "/capabilities/drive",
          body: "Use o Drive quando o clipe final precisar ser revisado por humanos fora da sua sessão local.",
        },
      ],
    },
  },
  id: {
    metadata: {
      title: "Generator video AI dari gambar dengan agen AI",
      description:
        "Gunakan AnyCap untuk mengubah satu still yang kuat menjadi motion, memeriksa clip, lalu bercabang ke varian baru tanpa kehilangan hubungan dengan source image.",
      openGraphTitle: "Generator video AI dari gambar dengan agen AI",
      openGraphDescription:
        "Workflow image-to-video still-first untuk tim yang menginginkan kontrol lebih besar daripada yang biasanya diberikan tool AI video generator from image yang generik.",
      articleHeadline: "Generator video AI dari gambar dengan agen AI",
      articleDescription:
        "Panduan praktis untuk workflow image-to-video di mana source image, prompt motion, clip QA, dan delivery handoff tetap berada di satu workflow agen.",
      articleAbout: [
        "generator video AI dari gambar",
        "image-to-video",
        "video generation",
        "workflow still-first",
        "agen AI",
      ],
      articleKeywords: [
        "generator video ai dari gambar",
        "image to video ai",
        "workflow image to video",
        "generator image to video",
        "still ke video ai",
      ],
    },
    breadcrumbItems: [
      { name: "Beranda", href: "/" },
      { name: "Pelajari", href: "/learn" },
      { name: "Generator video AI dari gambar", href: AI_VIDEO_GENERATOR_FROM_IMAGE_PATH },
    ],
    eyebrow: "Pelajari",
    lastUpdatedLabel: "Diperbarui 9 April 2026",
    hero: {
      titleLine1: "Generator video AI dari gambar",
      titleLine2: "dimulai dari gambarnya, bukan videonya",
      introBeforeFirstLink:
        "Jika kamu mencari generator video AI dari gambar, source image adalah inti dari semuanya. Gambar itu menentukan subjek, framing, dan mood. Layer motion seharusnya memperpanjang frame tersebut, bukan melawannya. Itulah sebabnya workflow still-first di sekitar",
      firstLinkLabel: "image generation",
      betweenLinks: "dan",
      secondLinkLabel: "video generation",
      afterSecondLink:
        "lebih berguna daripada janji kotak hitam `unggah gambar, dapat video`.",
      summaryLabel: "Ringkasan cepat",
      summaryText:
        "Perlakukan gambar sebagai creative anchor. Gunakan AnyCap untuk membuat atau me-refine still terlebih dahulu, menganimasikannya kedua, lalu memeriksa clip ketiga. Itu memberi agen lebih banyak kontrol daripada tool image-to-video generik yang memperlakukan source image sebagai sesuatu yang disposable.",
    },
    quickAnswer: {
      label: "Jawaban cepat",
      title: "Motion seharusnya melindungi still",
      body:
        "Tugas image-to-video bukan menciptakan ulang adegan dari awal. Tugasnya adalah menambahkan gerakan yang terkontrol ke frame yang memang sudah layak mendapat perhatian. Ketika source image lemah, layer motion biasanya menyebarkan kelemahan itu. Ketika source image kuat, layer motion menjadi pengganda.",
      takeaways: [
        "Image-to-video paling berguna ketika still-nya sudah bekerja. Motion seharusnya menambah kehidupan, bukan menyelamatkan frame yang lemah.",
        "Workflow andal yang paling singkat adalah source still, motion brief kecil, clip QA, lalu baru bercabang jika hasilnya lolos review.",
        "AnyCap penting karena source image, video generation, QA, dan surface delivery bisa tetap berada dalam satu flow command.",
      ],
    },
    workflow: {
      label: "Workflow",
      title: "Lima langkah dari still ke motion",
      stepLabelPrefix: "Langkah",
      steps: [
        {
          title: "Mulai dari still yang memang pantas diberi motion",
          body: "Gunakan gambar yang sudah ada atau hasilkan dulu satu. Subjek, crop, dan background-nya seharusnya sudah cukup baik untuk dipertahankan.",
        },
        {
          title: "Tulis motion brief yang kecil",
          body: "Jelaskan hanya gerakan yang diinginkan: pergeseran kamera, putaran kepala, gerakan kain, gestur tangan, atau perubahan lingkungan yang halus.",
        },
        {
          title: "Hasilkan satu clip pendek terlebih dahulu",
          body: "Gunakan durasi terpendek yang masih bisa menjawab pertanyaannya. Clip yang lebih panjang memperbanyak drift dan biaya sebelum kamu tahu apakah ide dasarnya bekerja.",
        },
        {
          title: "Periksa output-nya",
          body: "Cek apakah motion mendukung gambar asli atau justru melawannya. Cari drift pada subjek, distorsi aneh, atau crop yang tidak lagi terbaca dengan baik.",
        },
        {
          title: "Buka varian hanya setelah review",
          body: "Setelah satu clip lolos, baru perluas ke rasio lain, motion yang lebih kuat, atau adegan-adegan yang berdekatan dari keluarga source yang sama.",
        },
      ],
    },
    validation: {
      label: "Validasi langsung",
      title: "Yang kami cek sebelum menulis halaman ini",
      cards: [
        {
          title: "Capability surface terkonfirmasi",
          body: "Status AnyCap dicek ulang pada 9 April 2026 sebelum workflow ini diperluas. Image generation, video generation, image reading, video reading, Drive, dan Page tersedia.",
        },
        {
          title: "Schema sudah dicek",
          body: "Nano Banana Pro, Nano Banana 2, dan Seedance 1.5 Pro dicek ke schema live sebelum contoh command ditulis.",
        },
        {
          title: "Posisi still-first dipertahankan",
          body: "Halaman ini memperlakukan kualitas source image sebagai prasyarat, bukan berpura-pura bahwa model motion seharusnya bisa memperbaiki frame yang lemah sendirian.",
        },
        {
          title: "Kesesuaian dengan cluster terkonfirmasi",
          body: "Halaman ini ditulis untuk mendukung cluster AI influencer sambil tetap cukup luas untuk use case image-to-video lain yang berdekatan.",
        },
      ],
    },
    modelChoice: {
      label: "Pilihan model",
      title: "Pisahkan pekerjaan source image dari pekerjaan motion",
      cards: [
        {
          title: "Nano Banana Pro",
          label: "Source still terbaik",
          body: "Gunakan ketika source image membutuhkan realisme yang lebih kuat atau preservasi identitas yang lebih ketat sebelum motion dimulai.",
          href: "/models/nano-banana-pro",
        },
        {
          title: "Nano Banana 2",
          label: "Terbaik untuk iterasi source image",
          body: "Gunakan ketika kamu perlu membandingkan beberapa source frame dengan cepat sebelum memilih mana yang layak dianimasikan.",
          href: "/models/nano-banana-2",
        },
        {
          title: "Seedance 1.5 Pro",
          label: "Layer motion terbaik",
          body: "Gunakan untuk langkah image-to-video setelah source frame sudah menjawab pertanyaan visualnya.",
          href: "/models/seedance-1-5-pro",
        },
      ],
    },
    comparison: {
      label: "Perbandingan",
      title: "Tool image-to-video generik vs workflow agen",
      columns: {
        lens: "Sudut pandang",
        generic: "Tool generik",
        workflow: "Workflow agen",
      },
      rows: [
        {
          lens: "Apa arti source image",
          generic: "Source image diperlakukan seperti input mentah yang akan ditimpa oleh model.",
          workflow: "Source image diperlakukan seperti batasan kreatif yang harus dihormati oleh layer motion.",
        },
        {
          lens: "Cakupan prompt",
          generic: "Prompt mencoba mendeskripsikan seluruh adegan dan seluruh video dari awal lagi.",
          workflow: "Prompt berfokus pada gerakan karena still-nya sudah membawa komposisinya.",
        },
        {
          lens: "Langkah review",
          generic: "Kamu mengekspor hasilnya dan berharap semuanya berhasil.",
          workflow: "Agen bisa membaca clip dan memberi tahu apakah motion-nya sesuai dengan niat awal.",
        },
        {
          lens: "Reuse",
          generic: "Satu still menjadi satu clip lalu workflow berhenti di sana.",
          workflow: "Satu source still bisa bercabang ke beberapa clip, crop, atau edit khusus channel setelah clip pertama berhasil.",
        },
      ],
    },
    commands: {
      label: "Contoh command",
      title: "Loop image-to-video dalam command",
      ctaLabel: "Lihat Video Generation",
      examples: [
        {
          title: "Hasilkan source image terlebih dahulu",
          code: [
            "anycap image generate \\",
            "  --model nano-banana-2 \\",
            '  --prompt "potret creator yang realistis, setup home-studio yang bersih, framing langsung ke kamera, tanpa teks yang terbaca, tanpa watermark" \\',
            "  --param aspect_ratio=9:16 \\",
            "  --param resolution=2k \\",
            "  -o image-to-video-source.png",
          ].join("\n"),
        },
        {
          title: "Animasikan source image",
          code: [
            "anycap video generate \\",
            "  --model seedance-1.5-pro \\",
            "  --mode image-to-video \\",
            '  --prompt "pergeseran kamera yang halus, gerakan kepala alami, gestur tangan lembut, motion realistis, jaga identitas dan framing tetap stabil" \\',
            "  --param images=./image-to-video-source.png \\",
            "  --param aspect_ratio=9:16 \\",
            "  --param duration=5 \\",
            "  --param resolution=720p \\",
            "  -o image-to-video-short.mp4",
          ].join("\n"),
        },
        {
          title: "Tinjau hasil motion",
          code: [
            "anycap actions video-read \\",
            "  --file ./image-to-video-short.mp4 \\",
            '  --instruction "Deskripsikan clip-nya, jelaskan apakah motion sesuai dengan still asli, dan sebutkan overlay teks yang terlihat atau artefak visual jika ada."',
          ].join("\n"),
        },
      ],
    },
    faq: {
      label: "FAQ",
      title: "Pertanyaan umum tentang image-to-video",
      items: [
        {
          question: "Apa yang membuat workflow image-to-video benar-benar bagus?",
          answer:
            "Source image harus kuat sebelum motion dimulai. Image-to-video bekerja paling baik ketika still-nya sudah berhasil mengunci subjek, framing, dan mood. Setelah itu prompt motion hanya perlu mendeskripsikan perubahannya.",
        },
        {
          question: "Apakah saya sebaiknya memakai image generator terpisah terlebih dahulu?",
          answer:
            "Sering kali ya. Jika gambar input lemah, image-to-video menjadi cara yang mahal untuk menganimasikan frame yang lemah. AnyCap berguna karena workflow yang sama bisa menghasilkan source still dan menganimasikannya kemudian.",
        },
        {
          question: "Model AnyCap mana yang paling cocok untuk workflow ini?",
          answer:
            "Gunakan Nano Banana Pro ketika source still harus benar-benar stabil, Nano Banana 2 untuk eksplorasi source image yang lebih cepat, dan Seedance 1.5 Pro ketika langkah berikutnya adalah motion image-to-video yang terkontrol.",
        },
        {
          question: "Bisakah AnyCap juga meninjau clip yang dihasilkan?",
          answer:
            "Ya. Setelah generation, gunakan video reading untuk merangkum apa yang terjadi, memeriksa apakah motion sesuai prompt, dan menangkap overlay atau artefak visual yang jelas.",
        },
      ],
    },
    nextStep: {
      label: "Langkah berikutnya",
      title: "Masuk ke workflow yang lebih sempit bila diperlukan",
      cards: [
        {
          title: "Cara membuat video AI influencer",
          href: "/learn/how-to-make-ai-influencer-videos",
          body: "Gunakan halaman yang lebih sempit ini ketika workflow image-to-video secara khusus ditujukan untuk clip creator virtual atau influencer.",
        },
        {
          title: "Cara membuat AI influencer",
          href: "/learn/how-to-make-ai-influencers",
          body: "Kembali ke halaman anchor untuk melihat cluster lengkap still, motion, QA, dan delivery.",
        },
        {
          title: "Image Generation",
          href: "/capabilities/image-generation",
          body: "Lihat capability surface untuk membuat atau me-refine source still sebelum motion.",
        },
        {
          title: "Video Generation",
          href: "/capabilities/video-generation",
          body: "Lihat capability surface yang menangani layer motion pada halaman ini.",
        },
        {
          title: "Install AnyCap",
          href: "/guides/install-anycap",
          body: "Gunakan ini ketika kamu ingin menjalankan workflow lengkap still plus motion secara lokal.",
        },
        {
          title: "Drive",
          href: "/capabilities/drive",
          body: "Gunakan Drive ketika clip final perlu ditinjau oleh manusia di luar sesi lokalmu.",
        },
      ],
    },
  },
} as const;

export function getAiVideoGeneratorFromImageMetadata(locale: SiteLocale): Metadata {
  const content = contentByLocale[locale] ?? contentByLocale.en;

  return {
    title: content.metadata.title,
    description: content.metadata.description,
    alternates: { canonical: AI_VIDEO_GENERATOR_FROM_IMAGE_PATH },
    openGraph: {
      type: "website",
      locale: getLocaleConfig(locale).ogLocale,
      url: AI_VIDEO_GENERATOR_FROM_IMAGE_PATH,
      siteName: siteConfig.siteName,
      title: content.metadata.openGraphTitle,
      description: content.metadata.openGraphDescription,
    },
  };
}

export function getAiVideoGeneratorFromImagePageData(locale: SiteLocale) {
  const content = contentByLocale[locale] ?? contentByLocale.en;

  return {
    ...content,
    articleJsonLd: createTechArticleJsonLd({
      headline: content.metadata.articleHeadline,
      description: content.metadata.articleDescription,
      path: AI_VIDEO_GENERATOR_FROM_IMAGE_PATH,
      locale,
      about: [...content.metadata.articleAbout],
      keywords: [...content.metadata.articleKeywords],
      datePublished: LAST_UPDATED_ISO,
      dateModified: LAST_UPDATED_ISO,
    }),
    faqJsonLd: createFaqPageJsonLd(content.faq.items),
  };
}
