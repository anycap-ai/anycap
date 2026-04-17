import type { Metadata } from "next";
import { createFaqPageJsonLd, createTechArticleJsonLd } from "@/lib/schema";
import { getLocaleConfig, siteConfig, type SiteLocale } from "@/lib/site";

export const HOW_TO_MAKE_A_PHOTO_INTO_A_DRAWING_PATH =
  "/learn/how-to-make-a-photo-into-a-drawing";

const LAST_UPDATED_ISO = "2026-04-11";

type BreadcrumbItem = {
  name: string;
  href?: string;
};

type FaqItem = {
  question: string;
  answer: string;
};

type StyleFamilyCard = {
  eyebrow: string;
  title: string;
  body: string;
};

type WorkflowStep = {
  title: string;
  body: string;
};

type ComparisonRow = {
  lens: string;
  shallow: string;
  workflow: string;
};

type ModelCard = {
  title: string;
  label: string;
  body: string;
  href: string;
};

type CliExample = {
  title: string;
  code: string;
};

type NextStepCard = {
  title: string;
  body: string;
  href: string;
};

type PhotoToDrawingPageContent = {
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
    title: string;
    intro: string;
    summaryLabel: string;
    summaryText: string;
  };
  styleFamiliesTitle: string;
  styleFamilies: readonly StyleFamilyCard[];
  workflowTitle: string;
  workflowSteps: readonly WorkflowStep[];
  comparisonTitle: string;
  comparisonRows: readonly ComparisonRow[];
  modelChoiceTitle: string;
  modelCards: readonly ModelCard[];
  cliTitle: string;
  cliExamples: readonly CliExample[];
  faqTitle: string;
  faqItems: readonly FaqItem[];
  nextStepsTitle: string;
  nextStepCards: readonly NextStepCard[];
};

const enContent: PhotoToDrawingPageContent = {
  metadata: {
    title: "How to turn a photo into a drawing with an AI agent",
    description:
      "Use AnyCap to turn an existing photo into a sketch, cartoon, anime-style image, or caricature through one image-to-image workflow instead of separate apps.",
    openGraphTitle: "How to turn a photo into a drawing with an AI agent",
    openGraphDescription:
      "A workflow guide for converting a photo into a drawing-style image with AnyCap while keeping the subject recognizable and the output reusable.",
    articleHeadline: "How to turn a photo into a drawing with an AI agent",
    articleDescription:
      "A practical workflow for converting an existing photo into a drawing-style image through AnyCap image editing.",
    articleAbout: [
      "Photo to drawing",
      "Sketch conversion",
      "Cartoon style",
      "Anime style",
      "Caricature",
      "AI agents",
    ],
    articleKeywords: [
      "how to turn a photo into a drawing",
      "photo to drawing ai",
      "convert photo to sketch",
      "cartoon photo generator",
      "anime photo effect",
      "caricature generator online",
    ],
  },
  breadcrumbItems: [
    { name: "Home", href: "/" },
    { name: "Learn", href: "/learn" },
    { name: "How to turn a photo into a drawing", href: HOW_TO_MAKE_A_PHOTO_INTO_A_DRAWING_PATH },
  ],
  eyebrow: "Learn",
  lastUpdatedLabel: "Last updated April 11, 2026",
  hero: {
    title: "How to turn a photo into a drawing",
    intro:
      "If you want to turn a photo into a drawing, the useful question is not whether another filter exists. It is whether the agent can preserve the subject, choose a style family, and keep the result reusable for social posts, profile images, concept art, or a lightweight editorial graphic. That is where AnyCap gives the workflow more control than a one-click app.",
    summaryLabel: "Answer-first summary",
    summaryText:
      "Use image-to-image editing when you already have a source photo. Ask the model to preserve the subject, specify the style family you want, and inspect the result before you publish it. The same pattern covers sketch, cartoon, anime, caricature, and rough line-drawing outputs.",
  },
  styleFamiliesTitle: "Choose a style family, not just an effect",
  styleFamilies: [
    {
      eyebrow: "Sketch",
      title: "Pencil or ink drawing",
      body:
        "Best when you want a clean line drawing, a hand-drawn portrait, or a simple sketch that still keeps the original likeness readable.",
    },
    {
      eyebrow: "Cartoon",
      title: "Cartoon or comic style",
      body:
        "Best when the image should feel more playful, with simplified shapes, stronger outlines, and a lighter internet-friendly tone.",
    },
    {
      eyebrow: "Anime",
      title: "Anime-style conversion",
      body:
        "Best when the destination should look like a stylized illustration instead of a literal photo edit, especially for social or fandom-driven use cases.",
    },
    {
      eyebrow: "Caricature",
      title: "Exaggerated caricature",
      body:
        "Best when the goal is a funny portrait that keeps the subject recognizable while exaggerating expression, proportions, or attitude.",
    },
  ],
  workflowTitle: "Five steps from photo to drawing-style result",
  workflowSteps: [
    {
      title: "Start with the photo that matters",
      body:
        "Use the real source image you want to transform. The better the subject, the easier it is to keep the final drawing readable and reusable.",
    },
    {
      title: "Pick the style family before you prompt",
      body:
        "Decide whether you want a sketch, cartoon, anime, caricature, or rough line-drawing result. The style decision should come first so the model is not guessing your intent.",
    },
    {
      title: "Run an image-to-image edit",
      body:
        "Use the photo as a reference image and ask for the drawing effect explicitly. That keeps the transformation tied to the source instead of drifting into a random new illustration.",
    },
    {
      title: "Check identity drift and line quality",
      body:
        "Review whether the face, pose, clothes, or key objects still look like the original photo. Then check whether the lines, shading, and outlines match the style you asked for.",
    },
    {
      title: "Branch into the right final use case",
      body:
        "From the same source, you can produce a profile image, social post, concept sketch, or a comic-style variant without rebuilding the prompt from scratch.",
    },
  ],
  comparisonTitle: "Why this is stronger than a generic photo effect app",
  comparisonRows: [
    {
      lens: "Subject control",
      shallow: "The app changes the photo, but the face or object can drift in ways that are hard to predict.",
      workflow:
        "The agent keeps the source image in the loop and asks the model to preserve the same subject while changing only the visual style.",
    },
    {
      lens: "Style precision",
      shallow: "The result looks 'artistic' but not clearly sketch, cartoon, anime, or caricature.",
      workflow:
        "The style family is explicit, so the page can describe and reuse the exact output type people are actually searching for.",
    },
    {
      lens: "Reuse",
      shallow: "You export one finished image and start over if you want another version.",
      workflow:
        "The same photo can branch into several style families or channel-specific variants from one workflow.",
    },
    {
      lens: "Delivery",
      shallow: "You download an image and then manually share it somewhere else.",
      workflow:
        "The agent can keep the file local, store it in Drive, or hand it off into a broader content workflow.",
    },
  ],
  modelChoiceTitle: "Pick the model by workflow, not by hype",
  modelCards: [
    {
      title: "Nano Banana Pro",
      label: "Best first choice for source-photo remixing",
      body:
        "Use this when the photo already exists and the main task is preserving the subject while applying a clear drawing style.",
      href: "/models/nano-banana-pro",
    },
    {
      title: "Nano Banana 2",
      label: "Best for fast style exploration",
      body:
        "Use this when you want to test sketch, cartoon, anime, or caricature directions quickly before choosing the final look.",
      href: "/models/nano-banana-2",
    },
    {
      title: "Seedream 5",
      label: "Best when you still need a source image",
      body:
        "Use this when the initial photo is missing and you need a stronger first-pass image before applying the drawing transformation.",
      href: "/models/seedream-5",
    },
  ],
  cliTitle: "CLI examples",
  cliExamples: [
    {
      title: "Turn a photo into a clean sketch",
      code: `anycap image generate \\
  --model nano-banana-pro \\
  --mode image-to-image \\
  --prompt "turn this photo into a clean pencil sketch, preserve the same subject, keep the outline readable, use light shading, avoid extra objects, no text, no watermark" \\
  --param images=./source-photo.png \\
  --param aspect_ratio=4:3 \\
  --param resolution=2k \\
  -o photo-sketch.png`,
    },
    {
      title: "Turn a photo into a cartoon",
      code: `anycap image generate \\
  --model nano-banana-2 \\
  --mode image-to-image \\
  --prompt "convert this photo into a cartoon illustration, keep the same subject identity, use bold outlines, simplified shapes, bright but controlled color, no text, no watermark" \\
  --param images=./source-photo.png \\
  --param aspect_ratio=1:1 \\
  --param resolution=2k \\
  -o photo-cartoon.png`,
    },
    {
      title: "QA the drawing-style output",
      code: `anycap actions image-read \\
  --file ./photo-sketch.png \\
  --instruction "Describe the style family, confirm whether the same subject is preserved, and say whether the result reads more like a sketch, cartoon, anime, or caricature."`,
    },
  ],
  faqTitle: "FAQ",
  faqItems: [
    {
      question: "Is this the same thing people mean when they search 'how to make a photo into a drawing in ChatGPT'?",
      answer:
        "Yes. The search intent is the same, but the more reliable workflow is to treat it as image-to-image editing, preserve the source subject, choose the style family explicitly, and QA the result before publishing.",
    },
    {
      question: "Can this also create cartoon, anime, and caricature versions?",
      answer:
        "Yes. Those are just different style families on top of the same transformation workflow. The key is to say which style you want instead of leaving the model to infer it.",
    },
    {
      question: "Which model should I use first?",
      answer:
        "Use Nano Banana Pro first when the photo already exists and you want a stronger subject-preserving remix. Use Nano Banana 2 when you want to move quickly across several visual styles. Use Seedream 5 when you still need to create the source image first.",
    },
    {
      question: "Can I use the result for a profile picture or social post?",
      answer:
        "Yes. This workflow is especially useful for profile photos, social posts, creator branding, and lightweight editorial visuals because the final image keeps the subject recognisable while changing the style.",
    },
    {
      question: "Is a one-click photo effect app enough?",
      answer:
        "It is enough for a quick novelty edit, but not for repeatable workflows. AnyCap is better when you want control over the source photo, the style family, the QA step, and the final delivery path.",
    },
  ],
  nextStepsTitle: "Next steps",
  nextStepCards: [
    {
      title: "Image Generation",
      body:
        "See the capability page that powers the image-to-image workflow behind this transformation.",
      href: "/capabilities/image-generation",
    },
    {
      title: "Image Understanding",
      body:
        "Use this when you also need the agent to inspect whether the drawing-style output still preserves the source subject.",
      href: "/capabilities/image-understanding",
    },
    {
      title: "How to Change a Photo Background",
      body:
        "Move here when the next step is replacing the photo environment instead of changing the subject into a drawing.",
      href: "/learn/how-to-change-photo-background",
    },
    {
      title: "How to Make an Image Transparent",
      body:
        "Use this follow-on workflow when you want the subject isolated for reuse before styling or publishing.",
      href: "/learn/how-to-make-image-transparent",
    },
  ],
};

const ptBrContent: PhotoToDrawingPageContent = {
  metadata: {
    title: "Como transformar foto em desenho com IA",
    description:
      "Use o AnyCap para transformar uma foto existente em sketch, cartoon, anime ou caricatura em um único fluxo de image-to-image, sem depender de apps separados.",
    openGraphTitle: "Como transformar foto em desenho com IA",
    openGraphDescription:
      "Um guia de fluxo para converter uma foto em uma imagem com estilo de desenho usando AnyCap, mantendo o assunto reconhecível e reutilizável.",
    articleHeadline: "Como transformar foto em desenho com IA",
    articleDescription:
      "Um fluxo prático para converter uma foto existente em uma imagem com estilo de desenho usando edição de imagem do AnyCap.",
    articleAbout: [
      "Foto para desenho",
      "Conversão para sketch",
      "Estilo cartoon",
      "Estilo anime",
      "Caricatura",
      "Agentes de IA",
    ],
    articleKeywords: [
      "como fazer a foto virar desenho",
      "desenhar cartoon",
      "transformar foto em anime",
      "transformar foto em traços",
      "criar caricatura online",
      "como fazer a trend da foto em desenho",
    ],
  },
  breadcrumbItems: [
    { name: "Início", href: "/" },
    { name: "Learn", href: "/learn" },
    { name: "Como transformar foto em desenho", href: HOW_TO_MAKE_A_PHOTO_INTO_A_DRAWING_PATH },
  ],
  eyebrow: "Learn",
  lastUpdatedLabel: "Atualizado em 11 de abril de 2026",
  hero: {
    title: "Como transformar foto em desenho",
    intro:
      "Se você quer transformar uma foto em desenho, a pergunta útil não é só se existe mais um filtro. A pergunta é se o agente consegue preservar o assunto, escolher uma família de estilo e manter o resultado reutilizável para posts sociais, foto de perfil, concept art ou um visual editorial leve. É aí que o AnyCap dá mais controle do que um app de um clique.",
    summaryLabel: "Resposta direta",
    summaryText:
      "Use image-to-image quando você já tiver uma foto fonte. Peça para o modelo preservar o assunto, especifique a família de estilo desejada e revise o resultado antes de publicar. O mesmo padrão cobre sketch, cartoon, anime, caricatura e versões com traço mais solto.",
  },
  styleFamiliesTitle: "Escolha a família de estilo, não só o efeito",
  styleFamilies: [
    {
      eyebrow: "Sketch",
      title: "Desenho a lápis ou nanquim",
      body:
        "Melhor quando você quer um line drawing limpo, um retrato desenhado à mão ou um sketch simples que ainda mantenha a semelhança original legível.",
    },
    {
      eyebrow: "Cartoon",
      title: "Estilo cartoon ou quadrinhos",
      body:
        "Melhor quando a imagem precisa parecer mais divertida, com formas simplificadas, contornos mais fortes e uma linguagem mais leve e social-friendly.",
    },
    {
      eyebrow: "Anime",
      title: "Conversão para anime",
      body:
        "Melhor quando o destino precisa parecer uma ilustração estilizada em vez de uma edição literal de foto, especialmente para usos sociais ou fandom.",
    },
    {
      eyebrow: "Caricatura",
      title: "Caricatura exagerada",
      body:
        "Melhor quando o objetivo é um retrato engraçado que ainda mantém o assunto reconhecível enquanto exagera expressão, proporção ou atitude.",
    },
  ],
  workflowTitle: "Cinco passos da foto ao resultado em estilo desenho",
  workflowSteps: [
    {
      title: "Comece pela foto que realmente importa",
      body:
        "Use a imagem fonte real que você quer transformar. Quanto melhor o assunto, mais fácil fica manter o desenho final legível e reutilizável.",
    },
    {
      title: "Escolha a família de estilo antes do prompt",
      body:
        "Decida se você quer sketch, cartoon, anime, caricatura ou um line drawing mais solto. Essa decisão deve vir antes para o modelo não adivinhar a intenção.",
    },
    {
      title: "Rode a edição image-to-image",
      body:
        "Use a foto como referência e peça o efeito de desenho de forma explícita. Isso mantém a transformação ancorada na fonte, em vez de virar uma ilustração aleatória.",
    },
    {
      title: "Revise drift de identidade e qualidade do traço",
      body:
        "Confira se rosto, pose, roupa ou objetos-chave ainda parecem com a foto original. Depois revise se linhas, sombra e contornos batem com o estilo pedido.",
    },
    {
      title: "Ramifique para o uso final certo",
      body:
        "A partir da mesma fonte, você pode gerar uma foto de perfil, um post social, um sketch de conceito ou uma versão em estilo comic sem refazer tudo do zero.",
    },
  ],
  comparisonTitle: "Por que isso é mais forte do que um app genérico de efeito",
  comparisonRows: [
    {
      lens: "Controle do assunto",
      shallow:
        "O app muda a foto, mas o rosto ou o objeto podem desviar de um jeito difícil de prever.",
      workflow:
        "O agente mantém a imagem fonte no loop e pede para o modelo preservar o mesmo assunto enquanto muda só o estilo visual.",
    },
    {
      lens: "Precisão de estilo",
      shallow:
        "O resultado fica 'artístico', mas não fica claro se é sketch, cartoon, anime ou caricatura.",
      workflow:
        "A família de estilo é explícita, então a página pode descrever e reutilizar o tipo exato de saída que a busca está procurando.",
    },
    {
      lens: "Reuso",
      shallow: "Você exporta uma imagem e precisa recomeçar se quiser outra versão.",
      workflow:
        "A mesma foto pode se ramificar em várias famílias de estilo ou variações de canal a partir de um único fluxo.",
    },
    {
      lens: "Entrega",
      shallow: "Você baixa a imagem e depois compartilha manualmente em outro lugar.",
      workflow:
        "O agente pode manter o arquivo local, salvar no Drive ou repassar para um fluxo maior de conteúdo.",
    },
  ],
  modelChoiceTitle: "Escolha o modelo pelo fluxo, não pelo hype",
  modelCards: [
    {
      title: "Nano Banana Pro",
      label: "Melhor primeira escolha para remix de foto",
      body:
        "Use quando a foto já existe e a tarefa principal é preservar o assunto enquanto aplica um estilo claro de desenho.",
      href: "/models/nano-banana-pro",
    },
    {
      title: "Nano Banana 2",
      label: "Melhor para explorar estilos rápido",
      body:
        "Use quando você quer testar sketch, cartoon, anime ou caricatura rapidamente antes de escolher o visual final.",
      href: "/models/nano-banana-2",
    },
    {
      title: "Seedream 5",
      label: "Melhor quando a imagem fonte ainda não existe",
      body:
        "Use quando a foto inicial ainda precisa ser criada antes de aplicar a transformação para desenho.",
      href: "/models/seedream-5",
    },
  ],
  cliTitle: "Exemplos de CLI",
  cliExamples: [
    {
      title: "Transformar uma foto em sketch limpo",
      code: `anycap image generate \\
  --model nano-banana-pro \\
  --mode image-to-image \\
  --prompt "transforme esta foto em um desenho a lápis limpo, preserve o mesmo assunto, mantenha o contorno legível, use sombreamento leve, sem objetos extras, sem texto, sem watermark" \\
  --param images=./foto-fonte.png \\
  --param aspect_ratio=4:3 \\
  --param resolution=2k \\
  -o foto-sketch.png`,
    },
    {
      title: "Transformar uma foto em cartoon",
      code: `anycap image generate \\
  --model nano-banana-2 \\
  --mode image-to-image \\
  --prompt "converta esta foto em uma ilustração cartoon, mantenha a identidade do assunto, use contornos fortes, formas simplificadas, cor viva mas controlada, sem texto, sem watermark" \\
  --param images=./foto-fonte.png \\
  --param aspect_ratio=1:1 \\
  --param resolution=2k \\
  -o foto-cartoon.png`,
    },
    {
      title: "Fazer QA do resultado em estilo desenho",
      code: `anycap actions image-read \\
  --file ./foto-sketch.png \\
  --instruction "Descreva a família de estilo, confirme se o mesmo assunto foi preservado e diga se o resultado parece mais sketch, cartoon, anime ou caricatura."`,
    },
  ],
  faqTitle: "Perguntas frequentes",
  faqItems: [
    {
      question: "Isso é o mesmo que as pessoas procuram quando digitam 'como fazer a foto virar desenho no ChatGPT'?",
      answer:
        "Sim. A intenção de busca é a mesma, mas o fluxo mais confiável é tratar como image-to-image, preservar o assunto de origem, escolher a família de estilo explicitamente e revisar o resultado antes de publicar.",
    },
    {
      question: "Isso também cria versões cartoon, anime e caricatura?",
      answer:
        "Sim. Essas são só famílias de estilo diferentes sobre o mesmo fluxo de transformação. O ponto é dizer qual estilo você quer, em vez de deixar o modelo inferir sozinho.",
    },
    {
      question: "Qual modelo eu devo usar primeiro?",
      answer:
        "Use Nano Banana Pro primeiro quando a foto já existir e você quiser um remix com melhor preservação do assunto. Use Nano Banana 2 quando quiser avançar rápido entre vários estilos visuais. Use Seedream 5 quando ainda precisar criar a imagem fonte antes.",
    },
    {
      question: "Posso usar o resultado como foto de perfil ou post social?",
      answer:
        "Sim. Esse fluxo é especialmente útil para foto de perfil, posts sociais, branding de creator e visuais editoriais leves porque o resultado final continua reconhecível enquanto troca o estilo.",
    },
    {
      question: "Um app de efeito de foto de um clique já não basta?",
      answer:
        "Ele pode bastar para uma edição rápida e pontual, mas não para um fluxo repetível. O AnyCap é melhor quando você quer controle sobre a foto fonte, a família de estilo, a etapa de QA e o caminho final de entrega.",
    },
  ],
  nextStepsTitle: "Próximos passos",
  nextStepCards: [
    {
      title: "Geração de imagem",
      body:
        "Veja a página de capability que alimenta o fluxo image-to-image por trás dessa transformação.",
      href: "/capabilities/image-generation",
    },
    {
      title: "Compreensão de imagem",
      body:
        "Use este caminho quando você também quiser que o agente revise se o resultado ainda preserva o assunto da foto fonte.",
      href: "/capabilities/image-understanding",
    },
    {
      title: "Como trocar o fundo de uma foto",
      body:
        "Vá para cá quando o próximo passo for trocar o ambiente da foto em vez de transformar o assunto em desenho.",
      href: "/learn/how-to-change-photo-background",
    },
    {
      title: "Como deixar uma imagem transparente",
      body:
        "Use este fluxo complementar quando quiser isolar o assunto antes de estilizar ou publicar.",
      href: "/learn/how-to-make-image-transparent",
    },
  ],
};

const idContent: PhotoToDrawingPageContent = {
  metadata: {
    title: "Cara mengubah foto menjadi gambar bergaya menggambar dengan agen AI",
    description:
      "Gunakan AnyCap untuk mengubah foto yang sudah ada menjadi sketsa, kartun, bergaya anime, atau karikatur lewat satu alur image-to-image, bukan banyak aplikasi terpisah.",
    openGraphTitle: "Cara mengubah foto menjadi gambar bergaya menggambar dengan agen AI",
    openGraphDescription:
      "Panduan alur kerja untuk mengonversi foto menjadi gambar bergaya menggambar dengan AnyCap sambil menjaga subjek tetap dikenali dan output tetap bisa dipakai ulang.",
    articleHeadline: "Cara mengubah foto menjadi gambar bergaya menggambar dengan agen AI",
    articleDescription:
      "Alur praktis untuk mengonversi foto yang sudah ada menjadi gambar bergaya menggambar melalui pengeditan gambar AnyCap.",
    articleAbout: [
      "Foto ke gambar menggambar",
      "Konversi ke sketsa",
      "Gaya kartun",
      "Gaya anime",
      "Karikatur",
      "Agen AI",
    ],
    articleKeywords: [
      "cara mengubah foto menjadi gambar",
      "foto ke gambar ai",
      "ubah foto jadi sketsa",
      "generator foto kartun",
      "efek foto anime",
      "generator karikatur online",
    ],
  },
  breadcrumbItems: [
    { name: "Beranda", href: "/" },
    { name: "Learn", href: "/learn" },
    {
      name: "Cara mengubah foto menjadi gambar menggambar",
      href: HOW_TO_MAKE_A_PHOTO_INTO_A_DRAWING_PATH,
    },
  ],
  eyebrow: "Learn",
  lastUpdatedLabel: "Terakhir diperbarui 11 April 2026",
  hero: {
    title: "Cara mengubah foto menjadi gambar menggambar",
    intro:
      "Jika Anda ingin mengubah foto menjadi gambar menggambar, pertanyaan yang berguna bukan apakah ada filter lain. Yang penting adalah apakah agen bisa mempertahankan subjek, memilih keluarga gaya, dan menjaga hasil tetap bisa dipakai ulang untuk posting sosial, foto profil, concept art, atau grafis editorial ringan. Di situlah AnyCap memberi alur kerja lebih banyak kontrol daripada aplikasi sekali klik.",
    summaryLabel: "Ringkasan jawaban dulu",
    summaryText:
      "Gunakan pengeditan image-to-image ketika Anda sudah punya foto sumber. Minta model mempertahankan subjek, tentukan keluarga gaya yang Anda inginkan, dan periksa hasilnya sebelum mempublikasikan. Pola yang sama mencakup output sketsa, kartun, anime, karikatur, dan gambar garis kasar.",
  },
  styleFamiliesTitle: "Pilih keluarga gaya, bukan sekadar efek",
  styleFamilies: [
    {
      eyebrow: "Sketch",
      title: "Gambar pensil atau tinta",
      body:
        "Terbaik ketika Anda ingin gambar garis bersih, potret bergaya tangan, atau sketsa sederhana yang tetap membuat kemiripan asli mudah dibaca.",
    },
    {
      eyebrow: "Cartoon",
      title: "Gaya kartun atau komik",
      body:
        "Terbaik ketika gambar harus terasa lebih ceria, dengan bentuk disederhanakan, garis luar lebih tegas, dan nada yang lebih ringan dan ramah untuk internet.",
    },
    {
      eyebrow: "Anime",
      title: "Konversi bergaya anime",
      body:
        "Terbaik ketika hasil akhir harus terlihat seperti ilustrasi bergaya, bukan edit foto literal, terutama untuk penggunaan sosial atau berbasis fandom.",
    },
    {
      eyebrow: "Caricature",
      title: "Karikatur yang dilebih-lebihkan",
      body:
        "Terbaik ketika tujuannya adalah potret lucu yang tetap membuat subjek dikenali sambil melebih-lebihkan ekspresi, proporsi, atau sikap.",
    },
  ],
  workflowTitle: "Lima langkah dari foto ke hasil bergaya menggambar",
  workflowSteps: [
    {
      title: "Mulai dari foto yang memang penting",
      body:
        "Gunakan gambar sumber nyata yang ingin Anda ubah. Semakin jelas subjeknya, semakin mudah menjaga gambar akhir tetap terbaca dan bisa dipakai ulang.",
    },
    {
      title: "Pilih keluarga gaya sebelum menulis prompt",
      body:
        "Tentukan apakah Anda ingin sketsa, kartun, anime, karikatur, atau hasil gambar garis kasar. Keputusan gaya harus didahulukan agar model tidak menebak-nebak maksud Anda.",
    },
    {
      title: "Jalankan pengeditan image-to-image",
      body:
        "Gunakan foto sebagai gambar referensi dan minta efek menggambar secara eksplisit. Ini menjaga transformasi terikat pada sumber, bukan melayang ke ilustrasi acak.",
    },
    {
      title: "Periksa drift identitas dan kualitas garis",
      body:
        "Tinjau apakah wajah, pose, pakaian, atau objek penting masih terlihat seperti foto asli. Lalu periksa apakah garis, bayangan, dan garis luar sesuai gaya yang Anda minta.",
    },
    {
      title: "Cabangkan ke kasus penggunaan akhir yang tepat",
      body:
        "Dari sumber yang sama, Anda bisa menghasilkan gambar profil, posting sosial, sketsa konsep, atau varian bergaya komik tanpa membangun ulang prompt dari nol.",
    },
  ],
  comparisonTitle: "Mengapa ini lebih kuat daripada aplikasi efek foto generik",
  comparisonRows: [
    {
      lens: "Kontrol subjek",
      shallow:
        "Aplikasi mengubah foto, tetapi wajah atau objek bisa bergeser dengan cara yang sulit diprediksi.",
      workflow:
        "Agen menjaga gambar sumber dalam loop dan meminta model mempertahankan subjek yang sama sambil hanya mengubah gaya visual.",
    },
    {
      lens: "Presisi gaya",
      shallow:
        "Hasilnya terlihat 'artistik' tetapi tidak jelas apakah sketsa, kartun, anime, atau karikatur.",
      workflow:
        "Keluarga gaya eksplisit, sehingga halaman bisa menjelaskan dan memakai ulang jenis output persis yang orang cari.",
    },
    {
      lens: "Pemakaian ulang",
      shallow: "Anda mengekspor satu gambar jadi dan memulai lagi jika ingin versi lain.",
      workflow:
        "Foto yang sama bisa bercabang ke beberapa keluarga gaya atau varian khusus saluran dari satu alur kerja.",
    },
    {
      lens: "Pengiriman",
      shallow: "Anda mengunduh gambar lalu membagikannya secara manual ke tempat lain.",
      workflow:
        "Agen bisa menyimpan file secara lokal, menyimpannya di Drive, atau meneruskannya ke alur konten yang lebih luas.",
    },
  ],
  modelChoiceTitle: "Pilih model berdasarkan alur kerja, bukan hype",
  modelCards: [
    {
      title: "Nano Banana Pro",
      label: "Pilihan pertama terbaik untuk remix foto sumber",
      body:
        "Gunakan ini ketika foto sudah ada dan tugas utamanya adalah mempertahankan subjek sambil menerapkan gaya menggambar yang jelas.",
      href: "/models/nano-banana-pro",
    },
    {
      title: "Nano Banana 2",
      label: "Terbaik untuk eksplorasi gaya cepat",
      body:
        "Gunakan ini ketika Anda ingin menguji arah sketsa, kartun, anime, atau karikatur dengan cepat sebelum memilih tampilan akhir.",
      href: "/models/nano-banana-2",
    },
    {
      title: "Seedream 5",
      label: "Terbaik ketika Anda masih perlu gambar sumber",
      body:
        "Gunakan ini ketika foto awal belum ada dan Anda perlu gambar tahap pertama yang lebih kuat sebelum menerapkan transformasi menggambar.",
      href: "/models/seedream-5",
    },
  ],
  cliTitle: "Contoh CLI",
  cliExamples: [
    {
      title: "Ubah foto menjadi sketsa bersih",
      code: `anycap image generate \\
  --model nano-banana-pro \\
  --mode image-to-image \\
  --prompt "ubah foto ini menjadi sketsa pensil bersih, pertahankan subjek yang sama, jaga garis luar tetap terbaca, gunakan bayangan ringan, tanpa objek tambahan, tanpa teks, tanpa watermark" \\
  --param images=./source-photo.png \\
  --param aspect_ratio=4:3 \\
  --param resolution=2k \\
  -o photo-sketch.png`,
    },
    {
      title: "Ubah foto menjadi kartun",
      code: `anycap image generate \\
  --model nano-banana-2 \\
  --mode image-to-image \\
  --prompt "ubah foto ini menjadi ilustrasi kartun, pertahankan identitas subjek yang sama, gunakan garis luar tebal, bentuk disederhanakan, warna cerah tetapi terkendali, tanpa teks, tanpa watermark" \\
  --param images=./source-photo.png \\
  --param aspect_ratio=1:1 \\
  --param resolution=2k \\
  -o photo-cartoon.png`,
    },
    {
      title: "QA output bergaya menggambar",
      code: `anycap actions image-read \\
  --file ./photo-sketch.png \\
  --instruction "Jelaskan keluarga gayanya, konfirmasi apakah subjek yang sama dipertahankan, dan sebutkan apakah hasilnya lebih terbaca sebagai sketsa, kartun, anime, atau karikatur."`,
    },
  ],
  faqTitle: "FAQ",
  faqItems: [
    {
      question:
        "Apakah ini sama dengan yang dimaksud orang ketika mencari 'cara mengubah foto menjadi gambar di ChatGPT'?",
      answer:
        "Ya. Maksud pencarian sama, tetapi alur yang lebih andal adalah memperlakukannya sebagai pengeditan image-to-image, mempertahankan subjek sumber, memilih keluarga gaya secara eksplisit, dan melakukan QA pada hasil sebelum mempublikasikan.",
    },
    {
      question: "Apakah ini juga bisa membuat versi kartun, anime, dan karikatur?",
      answer:
        "Ya. Itu hanya keluarga gaya berbeda di atas alur transformasi yang sama. Kuncinya adalah menyebutkan gaya yang Anda inginkan, bukan membiarkan model menebak sendiri.",
    },
    {
      question: "Model mana yang harus saya pakai dulu?",
      answer:
        "Gunakan Nano Banana Pro terlebih dahulu ketika foto sudah ada dan Anda ingin remix yang lebih kuat mempertahankan subjek. Gunakan Nano Banana 2 ketika Anda ingin bergerak cepat melintasi beberapa gaya visual. Gunakan Seedream 5 ketika Anda masih perlu membuat gambar sumber terlebih dahulu.",
    },
    {
      question: "Bisakah saya memakai hasilnya untuk foto profil atau posting sosial?",
      answer:
        "Ya. Alur ini sangat berguna untuk foto profil, posting sosial, branding kreator, dan visual editorial ringan karena gambar akhir menjaga subjek tetap mudah dikenali sambil mengubah gaya.",
    },
    {
      question: "Apakah aplikasi efek foto sekali klik sudah cukup?",
      answer:
        "Cukup untuk edit sekadar coba-coba, tetapi tidak untuk alur yang bisa diulang. AnyCap lebih baik ketika Anda ingin kontrol atas foto sumber, keluarga gaya, langkah QA, dan jalur pengiriman akhir.",
    },
  ],
  nextStepsTitle: "Langkah berikutnya",
  nextStepCards: [
    {
      title: "Pembuatan gambar",
      body:
        "Lihat halaman kemampuan yang mendukung alur image-to-image di balik transformasi ini.",
      href: "/capabilities/image-generation",
    },
    {
      title: "Pemahaman gambar",
      body:
        "Gunakan ini ketika Anda juga perlu agen memeriksa apakah output bergaya menggambar masih mempertahankan subjek sumber.",
      href: "/capabilities/image-understanding",
    },
    {
      title: "Cara Mengganti Latar Foto",
      body:
        "Pindah ke sini ketika langkah berikutnya adalah mengganti lingkungan foto, bukan mengubah subjek menjadi gambar menggambar.",
      href: "/learn/how-to-change-photo-background",
    },
    {
      title: "Cara Membuat Gambar Transparan",
      body:
        "Gunakan alur lanjutan ini ketika Anda ingin subjek diisolasi untuk dipakai ulang sebelum menata gaya atau mempublikasikan.",
      href: "/learn/how-to-make-image-transparent",
    },
  ],
};

const contentByLocale = {
  en: enContent,
  "pt-br": ptBrContent,
  id: idContent,
} satisfies Record<SiteLocale, PhotoToDrawingPageContent>;

function getContent(locale: SiteLocale): PhotoToDrawingPageContent {
  return contentByLocale[locale] ?? contentByLocale.en;
}

export function getPhotoToDrawingMetadata(locale: SiteLocale): Metadata {
  const content = getContent(locale);

  return {
    title: content.metadata.title,
    description: content.metadata.description,
    alternates: { canonical: HOW_TO_MAKE_A_PHOTO_INTO_A_DRAWING_PATH },
    openGraph: {
      type: "website",
      locale: getLocaleConfig(locale).ogLocale,
      url: HOW_TO_MAKE_A_PHOTO_INTO_A_DRAWING_PATH,
      siteName: siteConfig.siteName,
      title: content.metadata.openGraphTitle,
      description: content.metadata.openGraphDescription,
    },
  };
}

export function getPhotoToDrawingPageData(locale: SiteLocale) {
  const content = getContent(locale);

  return {
    ...content,
    articleJsonLd: createTechArticleJsonLd({
      headline: content.metadata.articleHeadline,
      description: content.metadata.articleDescription,
      path: HOW_TO_MAKE_A_PHOTO_INTO_A_DRAWING_PATH,
      locale,
      about: [...content.metadata.articleAbout],
      keywords: [...content.metadata.articleKeywords],
      datePublished: LAST_UPDATED_ISO,
      dateModified: LAST_UPDATED_ISO,
    }),
    faqJsonLd: createFaqPageJsonLd(content.faqItems),
  };
}
