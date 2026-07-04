import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { EarlyAccessBanner } from "@/components/landing/EarlyAccessBanner";
import { FadeIn } from "@/components/ui/FadeIn";
import { catalogModels, type CatalogModel, type CatalogModelCapability } from "@/lib/seo/model-catalog";
import { createFaqPageJsonLd, createTechArticleJsonLd } from "@/lib/schema";
import type { SiteLocale } from "@/lib/site";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;
const lastUpdatedIso = "2026-05-13";

type CatalogModelDetailCopy = {
  home: string;
  models: string;
  eyebrow: string;
  lastUpdated: string;
  h1Suffix: string;
  introSuffix: string;
  fitLabels: {
    bestFit: string;
    tradeoff: string;
    anycapFit: string;
  };
  anycapFitBody: (model: CatalogModel) => string;
  shortAnswerTitle: string;
  shortAnswer: (model: CatalogModel, capabilityOutput: string) => string;
  catalogTitle: string;
  tableLabels: {
    modelId: string;
    displayName: string;
    provider: string;
    capability: string;
    operation: string;
    supportedModes: string;
    catalogStatus: string;
    creditEstimate: string;
  };
  workflowTitle: (model: CatalogModel) => string;
  workflowSteps: (model: CatalogModel, noun: string) => readonly { title: string; body: string }[];
  workflowNote: string;
  modeGuideTitle: string;
  modeUseCase: (mode: string) => string;
  callTitle: (model: CatalogModel) => string;
  commandLabels: {
    discover: string;
    schema: string;
    generate: (model: CatalogModel) => string;
    reference: string;
  };
  agentBriefTitle: string;
  agentBrief: (model: CatalogModel, noun: string) => string;
  agentBriefNote: string;
  relatedTitle: string;
  faqTitle: string;
  faqItems: (model: CatalogModel) => readonly { question: string; answer: string }[];
  allModels: string;
  nouns: Record<CatalogModelCapability, string>;
  outputs: Record<CatalogModelCapability, string>;
};

const copyByLocale: Record<SiteLocale, CatalogModelDetailCopy> = {
  en: {
    home: "Home",
    models: "Models",
    eyebrow: "Model",
    lastUpdated: "Last updated May 13, 2026",
    h1Suffix: "for AI agents",
    introSuffix:
      "This page is grounded in the current AnyCap CLI catalog so agents can copy the exact model ID, operation, and modes instead of guessing from provider-facing names. It is meant to help a builder decide whether this model belongs in an agent workflow, then run it through AnyCap without wiring a one-off provider integration.",
    fitLabels: {
      bestFit: "Best fit",
      tradeoff: "Tradeoff",
      anycapFit: "AnyCap fit",
    },
    anycapFitBody: (model) =>
      `${model.displayName} is most useful when an agent needs the model choice, command, output file, and next step to stay inside one AnyCap-controlled workflow.`,
    shortAnswerTitle: "The short answer",
    shortAnswer: (model, capabilityOutput) =>
      `Use ${model.modelId} when an agent needs ${model.bestFor.toLowerCase()} The current AnyCap catalog lists it as ${model.status} for ${model.modes.join(", ")} through the ${model.operation} operation. The practical value is not only the model call; it is giving the agent a repeatable path from model discovery to generated ${capabilityOutput} and onward delivery.`,
    catalogTitle: "Current AnyCap catalog entry",
    tableLabels: {
      modelId: "Model ID",
      displayName: "Display name",
      provider: "Provider",
      capability: "Capability",
      operation: "Operation",
      supportedModes: "Supported modes",
      catalogStatus: "Catalog status",
      creditEstimate: "Credit estimate",
    },
    workflowTitle: (model) => `How ${model.displayName} fits an AnyCap workflow`,
    workflowSteps: (model, noun) => [
      {
        title: "Discover",
        body: `The agent lists active ${model.capabilityLabel.toLowerCase()} models and confirms that ${model.modelId} is available before it commits to a provider-specific path.`,
      },
      {
        title: "Generate",
        body: "The agent calls AnyCap with the exact model ID, prompt, mode, and output file instead of asking the user to leave the coding or planning session.",
      },
      {
        title: "Route",
        body: `The generated ${noun} can move into review, sharing, Drive delivery, Page publishing, or the next agent step from the same AnyCap workflow.`,
      },
    ],
    workflowNote:
      "This is the AnyCap-specific angle: the page does not ask an agent to memorize a provider dashboard. It shows the model ID, the supported modes, the schema command, and the next internal routes so the model can be used as part of a capability layer.",
    modeGuideTitle: "Mode guide for agents",
    modeUseCase: (mode) => {
      if (mode === "text-to-image") return "Start from a prompt when the agent needs a fresh visual direction, product mockup, or campaign asset.";
      if (mode === "image-to-image") return "Start from an uploaded image when the agent needs controlled refinement, style transfer, or iteration.";
      if (mode === "text-to-video") return "Start from a prompt when the agent needs a net-new launch clip, scene, product demo, or social video draft.";
      if (mode === "image-to-video") return "Start from a reference frame when the agent needs to animate a design still, screenshot, generated image, or product frame.";
      if (mode === "edit-video") return "Start from an existing clip when the agent needs natural-language edits, cleanup, or refinement.";
      if (mode === "text-to-music") return "Start from a prompt when the agent needs a soundtrack, song draft, intro bed, or audio concept.";
      return "Use this mode when the agent should keep model selection and asset delivery inside the AnyCap command surface.";
    },
    callTitle: (model) => `Call ${model.displayName} through AnyCap`,
    commandLabels: {
      discover: "Discover models",
      schema: "Inspect schema",
      generate: (model) => `Generate with ${model.displayName}`,
      reference: "Use a reference asset",
    },
    agentBriefTitle: "Copy-ready agent brief",
    agentBrief: (model, noun) => `Use AnyCap with ${model.displayName}.
Model ID: ${model.modelId}
Capability: ${model.capabilityLabel}
Modes: ${model.modes.join(", ")}
Best fit: ${model.bestFor}
Output: ${model.outputFile}
After generation, return the ${noun} path and suggest the next review or publishing step.`,
    agentBriefNote:
      "This brief is intentionally plain so it can be dropped into Claude Code, Codex, Cursor, or another agent prompt before the agent calls AnyCap.",
    relatedTitle: "Compare nearby AnyCap models",
    faqTitle: "FAQ",
    faqItems: (model) => [
      {
        question: `What is ${model.displayName} best for in AnyCap?`,
        answer: `${model.displayName} is best for ${model.bestFor.toLowerCase()} AnyCap exposes it as an active ${model.capabilityLabel.toLowerCase()} model with the model ID ${model.modelId}.`,
      },
      {
        question: `What AnyCap CLI model ID should agents use for ${model.displayName}?`,
        answer: `Use ${model.modelId}. Agents can discover the current catalog entry with anycap ${model.capability} models and inspect its schema with anycap ${model.capability} models ${model.modelId} schema --operation generate.`,
      },
      {
        question: `Which modes does ${model.displayName} support through AnyCap?`,
        answer: `The current AnyCap CLI catalog lists ${model.displayName} as active for ${model.modes.join(", ")} under the generate operation.`,
      },
      {
        question: `When should an agent avoid ${model.displayName}?`,
        answer: `${model.tradeoff} The model page is intentionally grounded in the AnyCap catalog entry rather than broad provider claims, so teams can choose based on the workflow they can run today.`,
      },
      {
        question: `How does ${model.displayName} fit into the broader AnyCap site?`,
        answer: `${model.displayName} is one model-level route inside AnyCap's ${model.capabilityLabel.toLowerCase()} capability. Use this page for model-specific commands, then use the capability page to compare adjacent models and plan the complete agent workflow.`,
      },
    ],
    allModels: "All models",
    nouns: { image: "visual", video: "clip", music: "track" },
    outputs: { image: "image file", video: "video file", music: "audio file" },
  },
  "pt-br": {
    home: "Inicio",
    models: "Modelos",
    eyebrow: "Modelo",
    lastUpdated: "Atualizado em 13 de maio de 2026",
    h1Suffix: "para agentes de IA",
    introSuffix:
      "Esta pagina se baseia no catalogo atual do AnyCap CLI para que agentes copiem o ID exato do modelo, a operacao e os modos sem adivinhar nomes de fornecedores. Ela ajuda builders a decidir se o modelo pertence ao workflow do agente e a executa-lo pelo AnyCap sem integrar um provedor pontual.",
    fitLabels: { bestFit: "Melhor uso", tradeoff: "Tradeoff", anycapFit: "Fit no AnyCap" },
    anycapFitBody: (model) =>
      `${model.displayName} e mais util quando o agente precisa manter escolha de modelo, comando, arquivo de saida e proximo passo dentro de um workflow controlado pelo AnyCap.`,
    shortAnswerTitle: "Resposta curta",
    shortAnswer: (model, capabilityOutput) =>
      `Use ${model.modelId} quando o agente precisar de ${model.bestFor.toLowerCase()} O catalogo atual do AnyCap lista este modelo como ${model.status} para ${model.modes.join(", ")} pela operacao ${model.operation}. O valor pratico nao e apenas chamar o modelo, mas dar ao agente um caminho repetivel da descoberta do modelo ate o ${capabilityOutput} gerado e a entrega seguinte.`,
    catalogTitle: "Entrada atual no catalogo AnyCap",
    tableLabels: {
      modelId: "ID do modelo",
      displayName: "Nome exibido",
      provider: "Fornecedor",
      capability: "Capacidade",
      operation: "Operacao",
      supportedModes: "Modos suportados",
      catalogStatus: "Status no catalogo",
      creditEstimate: "Estimativa de creditos",
    },
    workflowTitle: (model) => `Como ${model.displayName} entra em um workflow AnyCap`,
    workflowSteps: (model, noun) => [
      { title: "Descobrir", body: `O agente lista modelos ativos de ${model.capabilityLabel.toLowerCase()} e confirma que ${model.modelId} esta disponivel antes de seguir por um caminho de provedor especifico.` },
      { title: "Executar", body: "O agente chama o AnyCap com o ID do modelo, prompt, modo e arquivo de saida corretos, sem pedir que o usuario saia da sessao de codigo ou planejamento." },
      { title: "Roteirizar", body: `O ${noun} gerado pode seguir para revisao, compartilhamento, Drive, Page ou o proximo passo do agente no mesmo workflow AnyCap.` },
    ],
    workflowNote:
      "Este e o angulo especifico do AnyCap: a pagina nao pede que o agente memorize um dashboard de provedor. Ela mostra o ID do modelo, os modos suportados, o comando de schema e as rotas internas seguintes para que o modelo vire parte de uma camada de capacidades.",
    modeGuideTitle: "Guia de modos para agentes",
    modeUseCase: (mode) => {
      if (mode === "edit-video") return "Comece de um clipe existente quando o agente precisar de edicoes em linguagem natural, limpeza ou refinamento.";
      if (mode === "text-to-video") return "Comece de um prompt quando o agente precisar de um clipe, cena, demo de produto ou video social do zero.";
      if (mode === "image-to-video") return "Comece de um frame de referencia quando o agente precisar animar uma imagem, screenshot ou quadro de produto.";
      if (mode === "text-to-image") return "Comece de um prompt quando o agente precisar de uma direcao visual, mockup ou asset de campanha.";
      if (mode === "image-to-image") return "Comece de uma imagem enviada quando o agente precisar de refinamento controlado ou iteracao.";
      if (mode === "text-to-music") return "Comece de um prompt quando o agente precisar de trilha, musica ou conceito de audio.";
      return "Use este modo quando selecao de modelo e entrega de assets devem ficar dentro do AnyCap.";
    },
    callTitle: (model) => `Chame ${model.displayName} pelo AnyCap`,
    commandLabels: {
      discover: "Descobrir modelos",
      schema: "Inspecionar schema",
      generate: (model) => `Gerar com ${model.displayName}`,
      reference: "Usar asset de referencia",
    },
    agentBriefTitle: "Brief pronto para agente",
    agentBrief: (model, noun) => `Use AnyCap com ${model.displayName}.
ID do modelo: ${model.modelId}
Capacidade: ${model.capabilityLabel}
Modos: ${model.modes.join(", ")}
Melhor uso: ${model.bestFor}
Saida: ${model.outputFile}
Depois da geracao, retorne o caminho do ${noun} e sugira o proximo passo de revisao ou publicacao.`,
    agentBriefNote:
      "O brief e propositalmente simples para entrar em Claude Code, Codex, Cursor ou outro prompt de agente antes da chamada ao AnyCap.",
    relatedTitle: "Compare modelos AnyCap proximos",
    faqTitle: "Perguntas frequentes",
    faqItems: (model) => [
      { question: `Para que ${model.displayName} e melhor no AnyCap?`, answer: `${model.displayName} e melhor para ${model.bestFor.toLowerCase()} O AnyCap o expõe como modelo ativo de ${model.capabilityLabel.toLowerCase()} com o ID ${model.modelId}.` },
      { question: `Qual ID do AnyCap CLI usar para ${model.displayName}?`, answer: `Use ${model.modelId}. Agentes podem descobrir a entrada atual com anycap ${model.capability} models e inspecionar o schema com anycap ${model.capability} models ${model.modelId} schema --operation generate.` },
      { question: `Quais modos ${model.displayName} suporta pelo AnyCap?`, answer: `O catalogo atual do AnyCap CLI lista ${model.displayName} como ativo para ${model.modes.join(", ")} na operacao generate.` },
      { question: `Quando evitar ${model.displayName}?`, answer: `${model.tradeoff} A pagina se ancora no catalogo AnyCap em vez de claims amplos de fornecedor, para que times escolham pelo workflow executavel hoje.` },
      { question: `Como ${model.displayName} se conecta ao site AnyCap?`, answer: `${model.displayName} e uma rota de modelo dentro da capacidade de ${model.capabilityLabel.toLowerCase()} do AnyCap. Use esta pagina para comandos especificos e a pagina de capacidade para comparar modelos e planejar o workflow completo.` },
    ],
    allModels: "Todos os modelos",
    nouns: { image: "visual", video: "clipe", music: "audio" },
    outputs: { image: "arquivo de imagem", video: "arquivo de video", music: "arquivo de audio" },
  },
  id: {
    home: "Beranda",
    models: "Model",
    eyebrow: "Model",
    lastUpdated: "Diperbarui 13 Mei 2026",
    h1Suffix: "untuk agen AI",
    introSuffix:
      "Halaman ini bersandar pada katalog AnyCap CLI saat ini agar agen dapat menyalin ID model, operasi, dan mode yang tepat tanpa menebak nama dari provider. Tujuannya membantu builder memutuskan apakah model ini cocok untuk workflow agen, lalu menjalankannya melalui AnyCap tanpa integrasi provider satuan.",
    fitLabels: { bestFit: "Paling cocok", tradeoff: "Tradeoff", anycapFit: "Fit AnyCap" },
    anycapFitBody: (model) =>
      `${model.displayName} paling berguna saat agen perlu menjaga pilihan model, command, file output, dan langkah berikutnya tetap dalam workflow yang dikontrol AnyCap.`,
    shortAnswerTitle: "Jawaban singkat",
    shortAnswer: (model, capabilityOutput) =>
      `Gunakan ${model.modelId} saat agen membutuhkan ${model.bestFor.toLowerCase()} Katalog AnyCap saat ini mencantumkannya sebagai ${model.status} untuk ${model.modes.join(", ")} melalui operasi ${model.operation}. Nilai praktisnya bukan hanya pemanggilan model, tetapi jalur berulang dari discovery model ke ${capabilityOutput} yang dihasilkan dan pengiriman berikutnya.`,
    catalogTitle: "Entri katalog AnyCap saat ini",
    tableLabels: {
      modelId: "ID model",
      displayName: "Nama tampilan",
      provider: "Provider",
      capability: "Kapabilitas",
      operation: "Operasi",
      supportedModes: "Mode didukung",
      catalogStatus: "Status katalog",
      creditEstimate: "Estimasi kredit",
    },
    workflowTitle: (model) => `Bagaimana ${model.displayName} masuk ke workflow AnyCap`,
    workflowSteps: (model, noun) => [
      { title: "Discover", body: `Agen mencantumkan model ${model.capabilityLabel.toLowerCase()} yang aktif dan memastikan ${model.modelId} tersedia sebelum memilih jalur provider tertentu.` },
      { title: "Generate", body: "Agen memanggil AnyCap dengan ID model, prompt, mode, dan file output yang tepat tanpa meminta pengguna keluar dari sesi coding atau planning." },
      { title: "Route", body: `${noun} yang dihasilkan dapat masuk ke review, sharing, Drive delivery, Page publishing, atau langkah agen berikutnya dalam workflow AnyCap yang sama.` },
    ],
    workflowNote:
      "Sudut AnyCap-nya jelas: halaman ini tidak meminta agen menghafal dashboard provider. Halaman menampilkan ID model, mode yang didukung, command schema, dan rute internal berikutnya agar model dapat dipakai sebagai bagian dari layer kapabilitas.",
    modeGuideTitle: "Panduan mode untuk agen",
    modeUseCase: (mode) => {
      if (mode === "edit-video") return "Mulai dari klip yang sudah ada saat agen perlu edit bahasa natural, cleanup, atau refinement.";
      if (mode === "text-to-video") return "Mulai dari prompt saat agen perlu membuat klip, scene, demo produk, atau video sosial dari nol.";
      if (mode === "image-to-video") return "Mulai dari frame referensi saat agen perlu menganimasikan gambar, screenshot, atau frame produk.";
      if (mode === "text-to-image") return "Mulai dari prompt saat agen perlu arah visual baru, mockup produk, atau asset campaign.";
      if (mode === "image-to-image") return "Mulai dari gambar upload saat agen perlu refinement terkontrol atau iterasi.";
      if (mode === "text-to-music") return "Mulai dari prompt saat agen perlu soundtrack, draft lagu, atau konsep audio.";
      return "Gunakan mode ini saat pemilihan model dan pengiriman asset harus tetap di AnyCap.";
    },
    callTitle: (model) => `Panggil ${model.displayName} melalui AnyCap`,
    commandLabels: {
      discover: "Discover model",
      schema: "Inspeksi schema",
      generate: (model) => `Generate dengan ${model.displayName}`,
      reference: "Gunakan asset referensi",
    },
    agentBriefTitle: "Brief siap pakai untuk agen",
    agentBrief: (model, noun) => `Gunakan AnyCap dengan ${model.displayName}.
ID model: ${model.modelId}
Kapabilitas: ${model.capabilityLabel}
Mode: ${model.modes.join(", ")}
Paling cocok: ${model.bestFor}
Output: ${model.outputFile}
Setelah generasi, kembalikan path ${noun} dan sarankan langkah review atau publishing berikutnya.`,
    agentBriefNote:
      "Brief ini sengaja polos agar bisa dimasukkan ke Claude Code, Codex, Cursor, atau prompt agen lain sebelum agen memanggil AnyCap.",
    relatedTitle: "Bandingkan model AnyCap terdekat",
    faqTitle: "FAQ",
    faqItems: (model) => [
      { question: `${model.displayName} paling cocok untuk apa di AnyCap?`, answer: `${model.displayName} paling cocok untuk ${model.bestFor.toLowerCase()} AnyCap mengeksposnya sebagai model ${model.capabilityLabel.toLowerCase()} aktif dengan ID model ${model.modelId}.` },
      { question: `ID model AnyCap CLI apa yang digunakan untuk ${model.displayName}?`, answer: `Gunakan ${model.modelId}. Agen dapat menemukan entri katalog saat ini dengan anycap ${model.capability} models dan memeriksa schema dengan anycap ${model.capability} models ${model.modelId} schema --operation generate.` },
      { question: `Mode apa yang didukung ${model.displayName} melalui AnyCap?`, answer: `Katalog AnyCap CLI saat ini mencantumkan ${model.displayName} aktif untuk ${model.modes.join(", ")} pada operasi generate.` },
      { question: `Kapan agen sebaiknya menghindari ${model.displayName}?`, answer: `${model.tradeoff} Halaman model ini sengaja bersandar pada katalog AnyCap, bukan klaim provider yang terlalu luas, agar tim memilih berdasarkan workflow yang bisa dijalankan hari ini.` },
      { question: `Bagaimana ${model.displayName} masuk ke situs AnyCap yang lebih luas?`, answer: `${model.displayName} adalah rute level model di dalam kapabilitas ${model.capabilityLabel.toLowerCase()} AnyCap. Gunakan halaman ini untuk command spesifik, lalu halaman kapabilitas untuk membandingkan model dan merencanakan workflow lengkap.` },
    ],
    allModels: "Semua model",
    nouns: { image: "visual", video: "klip", music: "track" },
    outputs: { image: "file gambar", video: "file video", music: "file audio" },
  },
  de: {
    home: "Startseite",
    models: "Modelle",
    eyebrow: "Modell",
    lastUpdated: "Zuletzt aktualisiert am 13. Mai 2026",
    h1Suffix: "fuer KI-Agenten",
    introSuffix:
      "Diese Seite basiert auf dem aktuellen AnyCap CLI Katalog, damit Agenten die exakte Modell-ID, Operation und Modi kopieren koennen, statt Provider-Namen zu erraten. Sie hilft Buildern zu entscheiden, ob dieses Modell in einen Agenten-Workflow gehoert, und es dann ueber AnyCap ohne einmalige Provider-Integration auszufuehren.",
    fitLabels: { bestFit: "Beste Eignung", tradeoff: "Tradeoff", anycapFit: "AnyCap Fit" },
    anycapFitBody: (model) =>
      `${model.displayName} ist besonders nuetzlich, wenn Modellauswahl, Befehl, Ausgabedatei und naechster Schritt in einem von AnyCap kontrollierten Workflow bleiben sollen.`,
    shortAnswerTitle: "Kurzantwort",
    shortAnswer: (model, capabilityOutput) =>
      `Nutzen Sie ${model.modelId}, wenn ein Agent ${model.bestFor.toLowerCase()} benoetigt. Der aktuelle AnyCap Katalog fuehrt es als ${model.status} fuer ${model.modes.join(", ")} ueber die Operation ${model.operation}. Der praktische Wert liegt nicht nur im Modellaufruf, sondern im wiederholbaren Weg von der Modellentdeckung bis zur erzeugten ${capabilityOutput} und zur weiteren Auslieferung.`,
    catalogTitle: "Aktueller AnyCap Katalogeintrag",
    tableLabels: {
      modelId: "Modell-ID",
      displayName: "Anzeigename",
      provider: "Provider",
      capability: "Faehigkeit",
      operation: "Operation",
      supportedModes: "Unterstuetzte Modi",
      catalogStatus: "Katalogstatus",
      creditEstimate: "Credit-Schaetzung",
    },
    workflowTitle: (model) => `Wie ${model.displayName} in einen AnyCap Workflow passt`,
    workflowSteps: (model, noun) => [
      { title: "Entdecken", body: `Der Agent listet aktive Modelle fuer ${model.capabilityLabel.toLowerCase()} auf und bestaetigt, dass ${model.modelId} verfuegbar ist, bevor er einen providerspezifischen Weg waehlt.` },
      { title: "Ausfuehren", body: "Der Agent ruft AnyCap mit der exakten Modell-ID, dem Prompt, dem Modus und der Ausgabedatei auf, ohne dass der Nutzer die Coding- oder Planungssitzung verlassen muss." },
      { title: "Weiterleiten", body: `Der erzeugte ${noun} kann im selben AnyCap Workflow in Review, Sharing, Drive-Auslieferung, Page Publishing oder den naechsten Agentenschritt gehen.` },
    ],
    workflowNote:
      "Das ist der AnyCap-spezifische Blickwinkel: Die Seite verlangt nicht, dass ein Agent ein Provider-Dashboard auswendig kennt. Sie zeigt Modell-ID, unterstuetzte Modi, Schema-Befehl und interne Folgerouten, damit das Modell Teil einer Faehigkeitsschicht wird.",
    modeGuideTitle: "Modus-Leitfaden fuer Agenten",
    modeUseCase: (mode) => {
      if (mode === "edit-video") return "Starten Sie mit einem bestehenden Clip, wenn der Agent natuerlichsprachliche Bearbeitung, Cleanup oder Verfeinerung benoetigt.";
      if (mode === "text-to-video") return "Starten Sie mit einem Prompt, wenn der Agent einen Clip, eine Szene, eine Produktdemo oder ein Social Video neu erzeugen soll.";
      if (mode === "image-to-video") return "Starten Sie mit einem Referenzframe, wenn der Agent ein Bild, Screenshot oder Produktframe animieren soll.";
      if (mode === "text-to-image") return "Starten Sie mit einem Prompt, wenn der Agent eine neue visuelle Richtung, ein Mockup oder Kampagnen-Asset benoetigt.";
      if (mode === "image-to-image") return "Starten Sie mit einem hochgeladenen Bild, wenn kontrollierte Verfeinerung oder Iteration noetig ist.";
      if (mode === "text-to-music") return "Starten Sie mit einem Prompt, wenn der Agent Soundtrack, Songentwurf oder Audiokonzept benoetigt.";
      return "Nutzen Sie diesen Modus, wenn Modellauswahl und Asset-Auslieferung in AnyCap bleiben sollen.";
    },
    callTitle: (model) => `${model.displayName} ueber AnyCap aufrufen`,
    commandLabels: {
      discover: "Modelle entdecken",
      schema: "Schema pruefen",
      generate: (model) => `Mit ${model.displayName} generieren`,
      reference: "Referenz-Asset nutzen",
    },
    agentBriefTitle: "Agenten-Brief zum Kopieren",
    agentBrief: (model, noun) => `Nutze AnyCap mit ${model.displayName}.
Modell-ID: ${model.modelId}
Faehigkeit: ${model.capabilityLabel}
Modi: ${model.modes.join(", ")}
Beste Eignung: ${model.bestFor}
Ausgabe: ${model.outputFile}
Gib nach der Generierung den Pfad zum ${noun} zurueck und schlage den naechsten Review- oder Publishing-Schritt vor.`,
    agentBriefNote:
      "Der Brief ist bewusst schlicht, damit er vor dem AnyCap Aufruf in Claude Code, Codex, Cursor oder einen anderen Agenten-Prompt eingefuegt werden kann.",
    relatedTitle: "Nahe AnyCap Modelle vergleichen",
    faqTitle: "FAQ",
    faqItems: (model) => [
      { question: `Wofuer eignet sich ${model.displayName} in AnyCap am besten?`, answer: `${model.displayName} eignet sich besonders fuer ${model.bestFor.toLowerCase()} AnyCap stellt es als aktives Modell fuer ${model.capabilityLabel.toLowerCase()} mit der Modell-ID ${model.modelId} bereit.` },
      { question: `Welche AnyCap CLI Modell-ID sollten Agenten fuer ${model.displayName} nutzen?`, answer: `Nutzen Sie ${model.modelId}. Agenten koennen den aktuellen Katalogeintrag mit anycap ${model.capability} models finden und das Schema mit anycap ${model.capability} models ${model.modelId} schema --operation generate pruefen.` },
      { question: `Welche Modi unterstuetzt ${model.displayName} ueber AnyCap?`, answer: `Der aktuelle AnyCap CLI Katalog fuehrt ${model.displayName} als aktiv fuer ${model.modes.join(", ")} unter der Operation generate.` },
      { question: `Wann sollte ein Agent ${model.displayName} vermeiden?`, answer: `${model.tradeoff} Die Modellseite ist bewusst am AnyCap Katalog ausgerichtet, nicht an breiten Provider-Claims, damit Teams anhand des heute ausfuehrbaren Workflows entscheiden.` },
      { question: `Wie passt ${model.displayName} in die breitere AnyCap Site?`, answer: `${model.displayName} ist eine Modellroute innerhalb der AnyCap Faehigkeit ${model.capabilityLabel.toLowerCase()}. Nutzen Sie diese Seite fuer modellspezifische Befehle und die Faehigkeitsseite, um benachbarte Modelle und den kompletten Workflow zu planen.` },
    ],
    allModels: "Alle Modelle",
    nouns: { image: "Visual", video: "Clip", music: "Track" },
    outputs: { image: "Bilddatei", video: "Videodatei", music: "Audiodatei" },
  },
};

function getCapabilityPath(model: CatalogModel) {
  if (model.capability === "image") return "/capabilities/image-generation";
  if (model.capability === "video") return "/capabilities/video-generation";
  return "/capabilities/music-generation";
}

function getModeCommand(model: CatalogModel, mode: string) {
  const base = `anycap ${model.capability} generate --model ${model.modelId} --mode ${mode}`;

  if (mode === "image-to-image") {
    return `${base} --prompt "refine this visual for a cleaner launch asset" --param images=./input.png -o ${model.outputFile}`;
  }
  if (mode === "image-to-video") {
    return `${base} --prompt "animate this reference frame with subtle camera motion" --param images=./frame.png -o ${model.outputFile}`;
  }
  if (mode === "edit-video") {
    return `${base} --prompt "${model.examplePrompt}" --param videos=./source.mp4 -o ${model.outputFile}`;
  }

  return getGenerateCommand(model);
}

function getGenerateCommand(model: CatalogModel) {
  const base = `anycap ${model.capability} generate --model ${model.modelId}`;
  if (model.capability === "music") {
    return `${base} --prompt "${model.examplePrompt}" -o ${model.outputFile}`;
  }

  return `${base} --prompt "${model.examplePrompt}" -o ${model.outputFile}`;
}

function getReferenceCommand(model: CatalogModel) {
  if (model.capability === "image" && model.modes.includes("image-to-image")) {
    return `anycap image generate --model ${model.modelId} --mode image-to-image --prompt "refine this visual for a cleaner launch asset" --param images=./input.png -o ${model.outputFile}`;
  }

  if (model.capability === "video" && model.modes.includes("image-to-video")) {
    return `anycap video generate --model ${model.modelId} --mode image-to-video --prompt "animate this reference frame with subtle camera motion" --param images=./frame.png -o ${model.outputFile}`;
  }

  return null;
}

function getRelatedModels(model: CatalogModel) {
  return catalogModels
    .filter((candidate) => candidate.capability === model.capability && candidate.slug !== model.slug)
    .slice(0, 3);
}

function getFitSignals(model: CatalogModel, copy: CatalogModelDetailCopy) {
  return [
    [copy.fitLabels.bestFit, model.bestFor],
    [copy.fitLabels.tradeoff, model.tradeoff],
    [
      copy.fitLabels.anycapFit,
      copy.anycapFitBody(model),
    ],
  ] as const;
}

export function getCatalogModelFaqItems(model: CatalogModel, locale: SiteLocale = "en") {
  return copyByLocale[locale].faqItems(model);
}

export function createCatalogModelArticleJsonLd(model: CatalogModel, locale: SiteLocale) {
  return createTechArticleJsonLd({
    headline: `${model.displayName} ${copyByLocale[locale].h1Suffix} through AnyCap`,
    description: model.description,
    path: model.path,
    locale,
    about: [model.displayName, model.provider, model.capabilityLabel, "AnyCap", "AI agents"],
    keywords: [
      model.displayName.toLowerCase(),
      `${model.displayName.toLowerCase()} api`,
      model.modelId,
      model.capabilityLabel.toLowerCase(),
      "anycap models",
      "ai agent model",
    ],
    datePublished: lastUpdatedIso,
    dateModified: lastUpdatedIso,
  });
}

export function CatalogModelDetailPage({
  model,
  locale,
}: {
  model: CatalogModel;
  locale: SiteLocale;
}) {
  const copy = copyByLocale[locale];
  const faqItems = getCatalogModelFaqItems(model, locale);
  const referenceCommand = getReferenceCommand(model);
  const articleJsonLd = createCatalogModelArticleJsonLd(model, locale);
  const faqJsonLd = createFaqPageJsonLd(faqItems);
  const capabilityPath = getCapabilityPath(model);
  const capabilityNoun = copy.nouns[model.capability];
  const capabilityOutput = copy.outputs[model.capability];
  const workflowSteps = copy.workflowSteps(model, capabilityNoun);
  const relatedModels = getRelatedModels(model);
  const fitSignals = getFitSignals(model, copy);
  const schemaCommand = `anycap ${model.capability} models ${model.modelId} schema --operation generate${
    model.modes.length === 1 ? ` --mode ${model.modes[0]}` : ""
  }`;

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: copy.home, href: "/" },
          { name: copy.models, href: "/models" },
          { name: model.displayName, href: model.path },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <article className="px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[1280px] py-12 md:py-20 lg:py-24">
          <FadeIn>
            <p className="mb-4 text-[11px] tracking-[0.8px] text-[#6b7d3a]" style={mono}>
              {copy.eyebrow}
            </p>
            <p className="mb-3 text-[11px] tracking-[0.5px] text-[#5a5e52]" style={mono}>
              {copy.lastUpdated}
            </p>
            <h1
              className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(32px, 6vw, 72px)" }}
            >
              {model.displayName}{" "}
              <br />
              {copy.h1Suffix}
            </h1>
            <p className="mt-6 max-w-[760px] text-base leading-7 text-[#4d5145] md:text-lg">
              {model.description} {copy.introSuffix}
            </p>
            <div className="mt-8 grid max-w-[1040px] gap-4 md:grid-cols-3">
              {fitSignals.map(([label, body]) => (
                <div key={label} className="border-l-[3px] border-[#6b7d3a] pl-5">
                  <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                    {label}
                  </p>
                  <p className="text-sm leading-6 text-[#4d5145]">{body}</p>
                </div>
              ))}
            </div>
          </FadeIn>

          <FadeIn className="mt-8">
            <EarlyAccessBanner />
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-6 leading-[1.1] text-[#1c1f17]" style={{ ...pixel, fontSize: "clamp(26px, 3.8vw, 48px)" }}>
                {copy.shortAnswerTitle}
              </h2>
              <div className="max-w-[920px] border border-[#d4dbb8] bg-[#f9faf5]/80 p-6 md:p-8">
                <p className="text-base leading-7 text-[#4d5145] md:text-lg">
                  {copy.shortAnswer(model, capabilityOutput)}
                </p>
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-6 leading-[1.1] text-[#1c1f17]" style={{ ...pixel, fontSize: "clamp(26px, 3.8vw, 48px)" }}>
                {copy.catalogTitle}
              </h2>
              <div className="overflow-x-auto rounded-xl border border-[#d4dbb8] bg-[#f9faf5]/80">
                <table className="w-full text-left">
                  <tbody>
                    {[
                      [copy.tableLabels.modelId, model.modelId],
                      [copy.tableLabels.displayName, model.displayName],
                      [copy.tableLabels.provider, model.provider],
                      [copy.tableLabels.capability, model.capabilityLabel],
                      [copy.tableLabels.operation, model.operation],
                      [copy.tableLabels.supportedModes, model.modes.join(", ")],
                      [copy.tableLabels.catalogStatus, model.status],
                      [copy.tableLabels.creditEstimate, model.creditEstimate],
                    ].map(([label, value]) => (
                      <tr key={label} className="border-b border-[#d4dbb8]/60 last:border-b-0">
                        <th className="w-[190px] bg-[#f4f5f0] px-5 py-4 align-top text-[11px] tracking-[0.5px] text-[#5a5e52]" style={mono}>
                          {label}
                        </th>
                        <td className="px-5 py-4 align-top text-sm leading-6 text-[#4d5145]">
                          {value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-4 max-w-[760px] text-sm leading-6 text-[#4d5145]">
                {model.evidenceNote}
              </p>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-6 leading-[1.1] text-[#1c1f17]" style={{ ...pixel, fontSize: "clamp(26px, 3.8vw, 48px)" }}>
                {copy.workflowTitle(model)}
              </h2>
              <div className="grid max-w-[1100px] gap-4 md:grid-cols-3">
                {workflowSteps.map((step, index) => (
                  <div key={step.title} className="border border-[#d4dbb8] bg-[#fffffc]/70 p-5">
                    <p className="mb-4 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                      0{index + 1} / {step.title}
                    </p>
                    <p className="text-sm leading-6 text-[#4d5145]">{step.body}</p>
                  </div>
                ))}
              </div>
              <p className="mt-6 max-w-[820px] text-sm leading-6 text-[#4d5145]">
                {copy.workflowNote}
              </p>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-6 leading-[1.1] text-[#1c1f17]" style={{ ...pixel, fontSize: "clamp(26px, 3.8vw, 48px)" }}>
                {copy.modeGuideTitle}
              </h2>
              <div className="grid max-w-[1100px] gap-4 md:grid-cols-2">
                {model.modes.map((mode) => (
                  <div key={mode} className="border border-[#d4dbb8] bg-[#fffffc]/70 p-5">
                    <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                      {mode}
                    </p>
                    <p className="mb-4 text-sm leading-6 text-[#4d5145]">{copy.modeUseCase(mode)}</p>
                    <div className="bg-[#1c1f17] px-4 py-3">
                      <p className="break-all text-[12px] leading-5 text-[#d4e0a4]" style={mono}>
                        {getModeCommand(model, mode)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-6 leading-[1.1] text-[#1c1f17]" style={{ ...pixel, fontSize: "clamp(26px, 3.8vw, 48px)" }}>
                {copy.callTitle(model)}
              </h2>
              <div className="max-w-[860px] space-y-6">
                {[
                  [copy.commandLabels.discover, `anycap ${model.capability} models`],
                  [copy.commandLabels.schema, schemaCommand],
                  [copy.commandLabels.generate(model), getGenerateCommand(model)],
                  ...(referenceCommand ? [[copy.commandLabels.reference, referenceCommand]] : []),
                ].map(([label, command]) => (
                  <div key={label}>
                    <p className="mb-3 text-[11px] tracking-[0.5px] text-[#5a5e52]" style={mono}>
                      {label}
                    </p>
                    <div className="bg-[#1c1f17] px-5 py-4">
                      <p className="break-all text-[13px] text-[#d4e0a4]" style={mono}>
                        {command}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-6 leading-[1.1] text-[#1c1f17]" style={{ ...pixel, fontSize: "clamp(26px, 3.8vw, 48px)" }}>
                {copy.agentBriefTitle}
              </h2>
              <div className="max-w-[900px] bg-[#1c1f17] px-5 py-5 md:px-6 md:py-6">
                <p className="whitespace-pre-wrap text-[13px] leading-6 text-[#d4e0a4]" style={mono}>
                  {copy.agentBrief(model, capabilityNoun)}
                </p>
              </div>
              <p className="mt-4 max-w-[760px] text-sm leading-6 text-[#4d5145]">
                {copy.agentBriefNote}
              </p>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-8 leading-[1.1] text-[#1c1f17]" style={{ ...pixel, fontSize: "clamp(26px, 3.8vw, 48px)" }}>
                {copy.relatedTitle}
              </h2>
              <div className="grid max-w-[1100px] gap-4 md:grid-cols-3">
                {relatedModels.map((related) => (
                  <Link
                    key={related.slug}
                    href={related.path}
                    className="group border border-[#d4dbb8] bg-[#fffffc]/70 p-5 transition-colors hover:border-[#6b7d3a] hover:bg-[#f9faf5]"
                  >
                    <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                      {related.provider}
                    </p>
                    <h3 className="mb-3 text-[16px] text-[#1c1f17] group-hover:text-[#6b7d3a]" style={pixel}>
                      {related.displayName}
                    </h3>
                    <p className="text-sm leading-6 text-[#4d5145]">{related.bestFor}</p>
                  </Link>
                ))}
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-8 leading-[1.1] text-[#1c1f17]" style={{ ...pixel, fontSize: "clamp(26px, 3.8vw, 48px)" }}>
                {copy.faqTitle}
              </h2>
              <div className="max-w-[860px] space-y-6">
                {faqItems.map((item) => (
                  <div key={item.question} className="border border-[#d4dbb8] p-5">
                    <h3 className="mb-2 text-[14px] font-bold text-[#1c1f17]" style={mono}>
                      {item.question}
                    </h3>
                    <p className="text-sm leading-6 text-[#4d5145]">{item.answer}</p>
                  </div>
                ))}
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24 mb-8">
              <div className="flex flex-wrap gap-4">
                <Link
                  href={capabilityPath}
                  className="inline-block rounded-lg bg-[#6b7d3a] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#f4f5f0] transition-colors hover:bg-[#1c1f17]"
                  style={mono}
                >
                  {model.capabilityLabel}
                </Link>
                <Link
                  href="/models"
                  className="inline-block rounded-lg border border-[#1c1f17] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                  style={mono}
                >
                  {copy.allModels}
                </Link>
              </div>
            </section>
          </FadeIn>
        </div>
      </article>
    </>
  );
}
