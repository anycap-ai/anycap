import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const errors = [];

function read(relativePath) {
  return readFileSync(path.join(rootDir, relativePath), "utf8");
}

function readOptional(label, relativePath) {
  const absolutePath = path.join(rootDir, relativePath);
  if (!existsSync(absolutePath)) {
    errors.push(`${label}: missing ${relativePath}`);
    return "";
  }
  return readFileSync(absolutePath, "utf8");
}

function requireTokens(label, source, tokens) {
  for (const token of tokens) {
    if (!source.includes(token)) errors.push(`${label}: missing ${token}`);
  }
}

function requireTokenCount(label, source, token, expectedCount) {
  const actualCount = source.split(token).length - 1;
  if (actualCount !== expectedCount) {
    errors.push(`${label}: expected ${expectedCount} occurrence(s) of ${token}; found ${actualCount}`);
  }
}

function requireSequence(label, source, tokens) {
  let cursor = 0;
  for (const token of tokens) {
    const index = source.indexOf(token, cursor);
    if (index === -1) {
      errors.push(`${label}: missing ordered token ${token}`);
      return;
    }
    cursor = index + token.length;
  }
}

function requireArrayEqual(label, actual, expected) {
  if (
    !Array.isArray(actual) ||
    actual.length !== expected.length ||
    actual.some((value, index) => value !== expected[index])
  ) {
    errors.push(`${label}: expected ${JSON.stringify(expected)}; found ${JSON.stringify(actual)}`);
  }
}

function requireEqual(label, actual, expected) {
  if (actual !== expected) {
    errors.push(`${label}: expected ${JSON.stringify(expected)}; found ${JSON.stringify(actual)}`);
  }
}

function requireNonEmpty(label, value) {
  if (typeof value !== "string" || value.length === 0) {
    errors.push(`${label}: expected a non-empty string`);
  }
}

function checkExactJsonObject(label, rawJson, expected) {
  const expectedKeys = Object.keys(expected);
  requireEqual(`${label} raw serialization`, rawJson, JSON.stringify(expected, null, 2));

  let result;
  try {
    result = JSON.parse(rawJson);
  } catch (error) {
    errors.push(
      `${label}: invalid JSON: ${error instanceof Error ? error.message : String(error)}`,
    );
    return;
  }

  requireArrayEqual(`${label} keys`, Object.keys(result), expectedKeys);
  for (const [key, value] of Object.entries(expected)) {
    requireEqual(`${label} ${key}`, result[key], value);
  }
}

function extractBetween(label, source, startToken, endToken) {
  const start = source.indexOf(startToken);
  if (start === -1) {
    errors.push(`${label}: missing start token ${startToken}`);
    return "";
  }

  const end = source.indexOf(endToken, start + startToken.length);
  if (end === -1) {
    errors.push(`${label}: missing end token ${endToken}`);
    return "";
  }

  return source.slice(start + startToken.length, end);
}

function forbidPattern(label, source, pattern) {
  if (pattern.test(source)) errors.push(`${label}: forbidden ${pattern}`);
}

function checkVideoGuideRepresentativeResult(page) {
  const blocks = [...page.matchAll(/\{`(\{[\s\S]*?\})`\}/g)];
  if (blocks.length !== 1) {
    errors.push(
      `video guide representative result: expected exactly 1 template-literal JSON block; found ${blocks.length}`,
    );
    return;
  }

  const expected = {
    status: "success",
    local_path: "/workspace/product-walkthrough.mp4",
    model: "<model-id>",
    credits_used: 20,
    request_id: "req_abc123",
  };
  const rawResult = blocks[0][1];
  checkExactJsonObject("video guide representative result", rawResult, expected);
}

const expectedCodexTaskDescriptionMarkers = {
  en: [
    "20-credit generation totals are illustrative",
    "every successful video-read request costs a fixed 10 credits",
  ],
  "pt-br": [
    "totais de 20 créditos nos exemplos de geração são ilustrativos",
    "cada solicitação video-read concluída com sucesso custa 10 créditos fixos",
  ],
  id: [
    "Total 20 kredit pada contoh generasi bersifat ilustratif",
    "setiap permintaan video-read yang berhasil dikenai biaya tetap 10 kredit",
  ],
  de: [
    "in den Generierungsbeispielen gezeigten 20 Credits sind Richtwerte",
    "jede erfolgreiche video-read-Anfrage kostet fest 10 Credits",
  ],
};

const expectedCodexTasks = {
  "generate-video": {
    command:
      'anycap video generate --model <model-id> --mode text-to-video --prompt "a short product walkthrough with a slow camera push-in" -o codex-demo.mp4',
    output: {
      status: "success",
      local_path: "/workspace/codex-demo.mp4",
      model: "<model-id>",
      credits_used: 20,
      request_id: "req_abc123",
    },
    additionalFieldKeys: ["url", "task_id", "trace_id", "hint"],
    authorityHref: "/capabilities/video-generation",
  },
  "image-to-video": {
    command:
      'anycap video generate --model <model-id> --mode image-to-video --prompt "animate this product frame with subtle camera movement" --param images=./product-frame.png -o animated-frame.mp4',
    output: {
      status: "success",
      local_path: "/workspace/animated-frame.mp4",
      model: "<model-id>",
      credits_used: 20,
      request_id: "req_def456",
    },
    additionalFieldKeys: ["url", "task_id", "trace_id", "hint"],
    authorityHref: "/guides/how-to-add-video-generation-to-ai-agent",
  },
  "analyze-video": {
    command:
      'anycap actions video-read --file ./recording.mp4 --instruction "Summarize the key events, QA findings, and recommended next action"',
    output: {
      status: "success",
      content:
        "The recording shows the checkout modal clipping its submit button on a narrow viewport.",
      credit_cost: 10,
      request_id: "req_ghi789",
    },
    additionalFieldKeys: ["trace_id"],
    authorityHref: "/capabilities/video-analysis",
  },
};

async function loadExecutableCodexModule() {
  const runtimeImports = [
    'import { createFaqPageJsonLd, createTechArticleJsonLd } from "@/lib/schema";',
    'import { getLocaleConfig, siteConfig } from "@/lib/site";',
  ].join("\n");
  const dependencies = [
    "const {",
    "  createFaqPageJsonLd,",
    "  createTechArticleJsonLd,",
    "  getLocaleConfig,",
    "  siteConfig,",
    "} = globalThis.__p0CodexDependencies;",
  ].join("\n");
  const transpiledContent = transpileTypeScript("src/app/(seo)/for/codex/content.ts");
  if (!transpiledContent.includes(runtimeImports)) {
    throw new Error("could not replace transpiled Codex runtime imports");
  }

  globalThis.__p0CodexDependencies = {
    createFaqPageJsonLd: (items) => ({ items }),
    createTechArticleJsonLd: (input) => ({ "@type": "TechArticle", ...input }),
    getLocaleConfig: (locale) => ({ ogLocale: locale }),
    siteConfig: { siteName: "AnyCap", url: "https://anycap.ai" },
  };

  try {
    return await importDataModule(transpiledContent.replace(runtimeImports, dependencies));
  } finally {
    delete globalThis.__p0CodexDependencies;
  }
}

async function checkExecutableCodex() {
  const contentModule = await loadExecutableCodexModule();
  const expectedOrder = Object.keys(expectedCodexTasks);

  for (const locale of videoLocales) {
    const data = contentModule.getForCodexPageData(locale);
    const tasks = data.taskPaths?.items ?? [];
    requireArrayEqual(
      `for/codex ${locale} runtime task order`,
      tasks.map((task) => task.key),
      expectedOrder,
    );
    requireTokens(
      `for/codex ${locale} credit description`,
      data.taskPaths?.description ?? "",
      expectedCodexTaskDescriptionMarkers[locale],
    );

    for (const task of tasks) {
      const expected = expectedCodexTasks[task.key];
      if (!expected) {
        errors.push(`for/codex ${locale} runtime task: unexpected ${task.key}`);
        continue;
      }
      requireEqual(`for/codex ${locale} ${task.key} command`, task.command, expected.command);
      checkExactJsonObject(
        `for/codex ${locale} ${task.key} result`,
        task.outputLines.join("\n"),
        expected.output,
      );
      requireArrayEqual(
        `for/codex ${locale} ${task.key} additional fields`,
        task.additionalFieldKeys,
        expected.additionalFieldKeys,
      );
      requireEqual(
        `for/codex ${locale} ${task.key} authority href`,
        task.authorityHref,
        expected.authorityHref,
      );
      requireEqual(`for/codex ${locale} ${task.key} install href`, task.installHref, "/start");
    }

    requireEqual(
      `for/codex ${locale} publication date`,
      data.capabilityGuideJsonLd?.datePublished,
      "2026-04-05",
    );
    requireEqual(
      `for/codex ${locale} modified date`,
      data.capabilityGuideJsonLd?.dateModified,
      "2026-07-11",
    );
  }
}

async function checkCodex() {
  const content = read("src/app/(seo)/for/codex/content.ts");
  const page = read("src/app/(seo)/for/codex/page.tsx");

  requireTokens("for/codex content", content, [
    '"generate-video"',
    '"image-to-video"',
    '"analyze-video"',
    "--mode text-to-video",
    "--mode image-to-video",
    "--param images=./product-frame.png",
    "anycap actions video-read",
    '"/capabilities/video-generation"',
    '"/capabilities/video-analysis"',
    '"/guides/how-to-add-video-generation-to-ai-agent"',
    "additionalFieldKeys: readonly string[];",
    "additionalFieldsLabel: string;",
    "additionalFieldsIntro: string;",
  ]);
  requireTokenCount(
    "for/codex content",
    content,
    'additionalFieldKeys: ["url", "task_id", "trace_id", "hint"],',
    2,
  );
  requireTokenCount(
    "for/codex content",
    content,
    'additionalFieldKeys: ["trace_id"],',
    1,
  );
  forbidPattern("for/codex content", content, /\banycap (?:image|video) read\b/);
  forbidPattern("for/codex content", content, /additionalFieldsNote/);
  forbidPattern(
    "for/codex content",
    content,
    /JSON shapes reflect the current AnyCap CLI|formatos JSON refletem a CLI atual do AnyCap|bentuk JSON mengikuti CLI AnyCap saat ini|JSON-Strukturen entsprechen der aktuellen AnyCap CLI/,
  );
  requireTokens("for/codex page", page, [
    "content.taskPaths.items.map",
    'className="flex min-w-0 flex-col',
    "task.authorityHref",
    "task.installHref",
    "content.taskPaths.additionalFieldsLabel",
    "content.taskPaths.additionalFieldsIntro",
    "task.additionalFieldKeys.map",
  ]);

  try {
    await checkExecutableCodex();
  } catch (error) {
    errors.push(`for/codex runtime: ${error instanceof Error ? error.message : String(error)}`);
  }
}

const videoLocales = ["en", "pt-br", "id", "de"];
const expectedVideoModes = ["text-to-video", "image-to-video", "edit-video"];
const expectedVideoModelIds = [
  "gemini-omni-flash-preview",
  "seedance-2",
  "kling-3.0",
  "veo-3.1",
];
const expectedVideoRelatedHrefs = [
  "/for/codex",
  "/capabilities/video-analysis",
  "/guides/how-to-add-video-generation-to-ai-agent",
];

const downloadFailureMarkers = {
  en: [
    "automatic-download error before the normal result",
    "Do not assume a URL or request ID was returned",
    "retain trace_id for support",
    "another clip may be created",
  ],
  "pt-br": [
    "erro do download automático antes do resultado normal",
    "Não presuma que uma URL ou um ID da solicitação foi retornado",
    "guarde o trace_id para suporte",
    "outro clipe pode ser criado",
  ],
  id: [
    "error unduhan otomatis sebelum hasil normal",
    "Jangan berasumsi bahwa URL atau ID permintaan telah dikembalikan",
    "simpan trace_id untuk dukungan",
    "dapat membuat klip lain",
  ],
  de: [
    "Fehler des automatischen Downloads vor dem normalen Ergebnis",
    "Gehen Sie nicht davon aus, dass eine URL oder Anfrage-ID zurückgegeben wurde",
    "bewahren Sie die trace_id für den Support auf",
    "ein weiterer Clip entstehen kann",
  ],
};

function splitVideoLocaleBlocks(content) {
  const starts = [
    ["en", "  en: {"],
    ["pt-br", '  "pt-br": {'],
    ["id", "  id: {"],
    ["de", "  de: {"],
  ];
  const blocks = new Map();

  starts.forEach(([locale, marker], index) => {
    const start = content.indexOf(marker);
    const nextMarker = starts[index + 1]?.[1] ?? "\n} as const satisfies Record<SiteLocale, VideoGenerationPageContent>;";
    const end = start === -1 ? -1 : content.indexOf(nextMarker, start + marker.length);
    if (start === -1 || end === -1) {
      errors.push(`video generation ${locale}: could not isolate locale source`);
      blocks.set(locale, "");
      return;
    }
    blocks.set(locale, content.slice(start, end));
  });

  return blocks;
}

function checkVideoLocaleSource(locale, block) {
  const inputModes = extractBetween(
    `video generation ${locale} input modes`,
    block,
    "    inputModes: [",
    "    variableCostLabel:",
  );
  requireTokenCount(`video generation ${locale} input modes`, inputModes, "mode:", 3);
  requireSequence(
    `video generation ${locale} input modes`,
    inputModes,
    expectedVideoModes.map((mode) => `mode: "${mode}"`),
  );

  const decisions = extractBetween(
    `video generation ${locale} decisions`,
    block,
    "    decisionCards: [",
    "    supportedModelsTitle:",
  );
  requireTokenCount(`video generation ${locale} decisions`, decisions, "modelId:", 4);
  requireSequence(
    `video generation ${locale} decisions`,
    decisions,
    expectedVideoModelIds.map((modelId) => `modelId: "${modelId}"`),
  );

  const failures = extractBetween(
    `video generation ${locale} failures`,
    block,
    "    failureItems: [",
    "    relatedTitle:",
  );
  requireTokenCount(`video generation ${locale} failures`, failures, "title:", 4);
  requireTokens(`video generation ${locale} download failure`, failures, downloadFailureMarkers[locale]);

  const related = extractBetween(
    `video generation ${locale} related cards`,
    block,
    "    relatedCards: [",
    "    faqTitle:",
  );
  requireTokenCount(`video generation ${locale} related cards`, related, "href:", 3);
  requireSequence(
    `video generation ${locale} related cards`,
    related,
    expectedVideoRelatedHrefs.map((href) => `href: "${href}"`),
  );

  requireTokenCount(`video generation ${locale} primary actions`, block, "primary: true", 2);
  requireTokenCount(
    `video generation ${locale} primary start actions`,
    block,
    'href: "/start", primary: true',
    2,
  );
}

function transpileTypeScript(relativePath) {
  return ts.transpileModule(read(relativePath), {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
}

async function importDataModule(source) {
  const dataUrl = `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;
  return import(dataUrl);
}

async function loadExecutableVideoModules() {
  const catalogModule = await importDataModule(transpileTypeScript("src/lib/seo/model-catalog.ts"));
  const contentImports = [
    'import { createFaqPageJsonLd, createTechArticleJsonLd } from "@/lib/schema";',
    'import { getLocaleConfig, siteConfig } from "@/lib/site";',
    'import { getCatalogModelsByCapability } from "@/lib/seo/model-catalog";',
  ].join("\n");
  const contentDependencies = [
    "const {",
    "  createFaqPageJsonLd,",
    "  createTechArticleJsonLd,",
    "  getLocaleConfig,",
    "  siteConfig,",
    "  getCatalogModelsByCapability,",
    "} = globalThis.__p0VideoDependencies;",
  ].join("\n");
  const transpiledContent = transpileTypeScript(
    "src/app/(seo)/capabilities/video-generation/content.ts",
  );
  if (!transpiledContent.includes(contentImports)) {
    throw new Error("could not replace transpiled video-generation runtime imports");
  }

  globalThis.__p0VideoDependencies = {
    createFaqPageJsonLd: (items) => ({ items }),
    createTechArticleJsonLd: (input) => input,
    getLocaleConfig: (locale) => ({ ogLocale: locale }),
    siteConfig: { siteName: "AnyCap" },
    getCatalogModelsByCapability: catalogModule.getCatalogModelsByCapability,
  };

  try {
    const contentModule = await importDataModule(
      transpiledContent.replace(contentImports, contentDependencies),
    );
    return { catalogModule, contentModule };
  } finally {
    delete globalThis.__p0VideoDependencies;
  }
}

async function checkExecutableVideoGeneration() {
  const { catalogModule, contentModule } = await loadExecutableVideoModules();
  const catalogModels = catalogModule.getCatalogModelsByCapability("video");
  const catalogById = new Map(catalogModels.map((model) => [model.modelId, model]));
  const availableModes = new Set(catalogModels.flatMap((model) => model.modes));

  for (const mode of expectedVideoModes) {
    if (!availableModes.has(mode)) {
      errors.push(`video catalog runtime: missing guidance mode ${mode}`);
    }
  }

  for (const modelId of expectedVideoModelIds) {
    const model = catalogById.get(modelId);
    if (!model) {
      errors.push(`video catalog runtime: missing featured model ${modelId}`);
      continue;
    }
    requireNonEmpty(`video catalog ${modelId} path`, model.path);
    requireNonEmpty(`video catalog ${modelId} credit estimate`, model.creditEstimate);
    if (!Array.isArray(model.modes) || model.modes.length === 0) {
      errors.push(`video catalog ${modelId}: expected at least one mode`);
    }
  }

  for (const locale of videoLocales) {
    const data = contentModule.getVideoGenerationPageData(locale);
    requireArrayEqual(
      `video generation ${locale} runtime input modes`,
      data.inputModes.map((item) => item.mode),
      expectedVideoModes,
    );
    requireEqual(`video generation ${locale} runtime failure count`, data.failureItems.length, 4);
    requireArrayEqual(
      `video generation ${locale} runtime decision cards`,
      data.decisionCards.map((card) => card.modelId),
      expectedVideoModelIds,
    );
    requireArrayEqual(
      `video generation ${locale} runtime decision models`,
      data.models.map((model) => model.modelId),
      expectedVideoModelIds,
    );
    requireArrayEqual(
      `video generation ${locale} runtime related hrefs`,
      data.relatedCards.map((card) => card.href),
      expectedVideoRelatedHrefs,
    );
    requireArrayEqual(
      `video generation ${locale} runtime primary hrefs`,
      [...data.heroActions, ...data.nextActions]
        .filter((action) => action.primary)
        .map((action) => action.href),
      ["/start", "/start"],
    );
    requireEqual(
      `video generation ${locale} publication date`,
      data.capabilityGuideJsonLd.datePublished,
      "2026-04-05",
    );
    requireEqual(
      `video generation ${locale} modified date`,
      data.capabilityGuideJsonLd.dateModified,
      "2026-07-11",
    );

    data.models.forEach((model) => {
      const catalogModel = catalogById.get(model.modelId);
      if (!catalogModel) return;
      const expectedCost =
        catalogModel.creditEstimate === "Varies by catalog pricing"
          ? data.variableCostLabel
          : catalogModel.creditEstimate;
      requireEqual(`video generation ${locale} ${model.modelId} name`, model.name, catalogModel.displayName);
      requireEqual(`video generation ${locale} ${model.modelId} path`, model.href, catalogModel.path);
      requireEqual(
        `video generation ${locale} ${model.modelId} modes`,
        model.modes,
        catalogModel.modes.join(", "),
      );
      requireEqual(`video generation ${locale} ${model.modelId} cost`, model.cost, expectedCost);
      requireNonEmpty(`video generation ${locale} ${model.modelId} best fit`, model.bestFor);
      requireNonEmpty(`video generation ${locale} ${model.modelId} tradeoff`, model.tradeoff);
    });
  }
}

async function checkVideoGeneration() {
  const content = read("src/app/(seo)/capabilities/video-generation/content.ts");
  const view = read("src/app/(seo)/capabilities/video-generation/VideoGenerationPageView.tsx");

  requireTokens("video generation content", content, [
    "inputModes",
    "failureItems",
    "creditEstimate",
    "tradeoff",
    "timingNote",
    '"/for/codex"',
    '"/capabilities/video-analysis"',
    '"/guides/how-to-add-video-generation-to-ai-agent"',
    "function getDecisionModels(",
    'getCatalogModelsByCapability("video").map',
    "model.displayName",
    "model.path",
    'model.modes.join(", ")',
    "model.creditEstimate",
    "function getAvailableInputModes(",
    'getCatalogModelsByCapability("video").flatMap',
  ]);
  requireTokens("video generation view", view, [
    "content.proofPoints",
    "content.fitSignals",
    "content.usageIntro",
    "content.final.title",
  ]);
  forbidPattern(
    "video generation content",
    content,
    /Hot model capture|The page is built for searches|Search demand is moving|Searchers often look/,
  );
  forbidPattern(
    "video generation content",
    content,
    /Use the returned URL or request ID|Use a URL ou o ID da solicitação retornado|Gunakan URL atau ID permintaan yang dikembalikan|Verwenden Sie die zurückgegebene URL oder Anfrage-ID/,
  );
  forbidPattern(
    "video generation view",
    view,
    /Trending now|Search intent|The page must prove|Searchers want|Page fit signals|We believe video generation pages/,
  );

  const localeBlocks = splitVideoLocaleBlocks(content);
  for (const locale of videoLocales) {
    checkVideoLocaleSource(locale, localeBlocks.get(locale));
  }

  try {
    await checkExecutableVideoGeneration();
  } catch (error) {
    errors.push(`video generation runtime: ${error instanceof Error ? error.message : String(error)}`);
  }
}

const expectedVideoAnalysisRelatedHrefs = [
  "/for/codex",
  "/capabilities/video-generation",
  "/guides/how-to-add-video-generation-to-ai-agent",
];
const expectedVideoAnalysisUseCaseMeanings = [
  "quality-review",
  "content-extraction",
  "workflow-checkpoint",
];
const expectedVideoAnalysisDemoLineTypes = [
  "header",
  "prompt",
  "text",
  "tool",
  "text",
  "analysis",
  "text",
  "cursor",
];
const expectedVideoAnalysisDemoCommand =
  'run("anycap actions video-read --file ./bug-report.mp4 --instruction \'Summarize key events and identify bug reproduction steps\'")';
const expectedVideoAnalysisLocales = {
  en: {
    accentTitle: "for AI agents.",
    lastUpdatedLabel: "Last updated July 11, 2026",
    searchIntentLabel: "Common tasks",
    responseContent:
      "The recording shows the checkout modal clipping its submit button on a narrow viewport.",
    responseTitle: "Representative successful response — 10 credits per request",
    fixedCostFaqMarker:
      "Every successful video-read request costs 10 credits and includes credit_cost: 10.",
    demoHeader: "agent with anycap",
    demoPrompt: "Summarize this bug recording and identify the reproduction steps",
    demoNarration: "I'll analyze the recording using AnyCap's video analysis.",
    demoCompletion: "Analysis complete — 12s recording, 4 key events detected.",
    demoCompletionSub: "✓",
    demoAnalysisLines: [
      "0:00 – User opens Settings panel from the sidebar.",
      '0:03 – Clicks "Theme" toggle to switch to dark mode.',
      "0:05 – Modal flashes white for ~200ms before applying the dark background.",
      "0:08 – User closes and reopens Settings — flash repeats on every toggle.",
      "",
      "Bug: theme transition applies to the page before the modal backdrop, causing a visible white flash.",
      "Root cause: likely CSS transition ordering — backdrop delay is longer than content swap.",
    ],
    demoConclusion:
      "The flash happens on every toggle. Looks like a CSS transition ordering issue.",
  },
  "pt-br": {
    accentTitle: "para agentes de IA.",
    lastUpdatedLabel: "Atualizado em 11 de julho de 2026",
    searchIntentLabel: "Tarefas comuns",
    responseContent:
      "A gravação mostra o modal de checkout cortando o botão de envio em uma viewport estreita.",
    responseTitle: "Resposta de sucesso representativa — 10 créditos por solicitação",
    fixedCostFaqMarker:
      "Toda solicitação video-read concluída com sucesso custa 10 créditos e inclui credit_cost: 10.",
    demoHeader: "agente com anycap",
    demoPrompt: "Resuma esta gravação de bug e identifique as etapas de reprodução",
    demoNarration: "Vou analisar a gravação usando a análise de vídeo do AnyCap.",
    demoCompletion: "Análise concluída — gravação de 12 s, 4 eventos principais detectados.",
    demoCompletionSub: "✓",
    demoAnalysisLines: [
      "0:00 – O usuário abre o painel Configurações pela barra lateral.",
      '0:03 – Clica no controle "Tema" para mudar para o modo escuro.',
      "0:05 – O modal pisca em branco por ~200 ms antes de aplicar o fundo escuro.",
      "0:08 – O usuário fecha e reabre Configurações — o flash se repete a cada alteração.",
      "",
      "Bug: a transição de tema é aplicada à página antes do backdrop do modal, causando um flash branco visível.",
      "Causa raiz: provavelmente a ordem das transições CSS — o atraso do backdrop é maior que o da troca de conteúdo.",
    ],
    demoConclusion:
      "O flash ocorre a cada alteração. Parece um problema na ordem das transições CSS.",
  },
  id: {
    accentTitle: "untuk agen AI.",
    lastUpdatedLabel: "Diperbarui 11 Juli 2026",
    searchIntentLabel: "Tugas umum",
    responseContent:
      "Rekaman menunjukkan modal checkout memotong tombol kirimnya pada viewport yang sempit.",
    responseTitle: "Respons berhasil representatif — 10 kredit per permintaan",
    fixedCostFaqMarker:
      "Setiap permintaan video-read yang berhasil dikenai biaya 10 kredit dan menyertakan credit_cost: 10.",
    demoHeader: "agen dengan anycap",
    demoPrompt: "Ringkas rekaman bug ini dan identifikasi langkah reproduksinya",
    demoNarration: "Saya akan menganalisis rekaman ini dengan analisis video AnyCap.",
    demoCompletion: "Analisis selesai — rekaman 12 detik, 4 peristiwa utama terdeteksi.",
    demoCompletionSub: "✓",
    demoAnalysisLines: [
      "0:00 – Pengguna membuka panel Pengaturan dari sidebar.",
      '0:03 – Mengklik toggle "Tema" untuk beralih ke mode gelap.',
      "0:05 – Modal berkedip putih selama ~200 ms sebelum menerapkan latar gelap.",
      "0:08 – Pengguna menutup dan membuka kembali Pengaturan — kilat putih berulang setiap kali tema diubah.",
      "",
      "Bug: transisi tema diterapkan ke halaman sebelum backdrop modal, sehingga menimbulkan kilat putih yang terlihat.",
      "Akar masalah: kemungkinan urutan transisi CSS — jeda backdrop lebih lama daripada pergantian konten.",
    ],
    demoConclusion:
      "Kilat putih terjadi setiap kali tema diubah. Ini tampak seperti masalah urutan transisi CSS.",
  },
  de: {
    accentTitle: "für KI-Agenten.",
    lastUpdatedLabel: "Aktualisiert am 11. Juli 2026",
    searchIntentLabel: "Häufige Aufgaben",
    responseContent:
      "Die Aufnahme zeigt, dass das Checkout-Modal seinen Absenden-Button in einem schmalen Viewport abschneidet.",
    responseTitle: "Repräsentative erfolgreiche Antwort — 10 Credits pro Anfrage",
    fixedCostFaqMarker:
      "Jede erfolgreiche video-read-Anfrage kostet 10 Credits und enthält credit_cost: 10.",
    demoHeader: "Agent mit AnyCap",
    demoPrompt: "Fasse diese Bug-Aufnahme zusammen und ermittle die Reproduktionsschritte",
    demoNarration: "Ich analysiere die Aufnahme mit der Videoanalyse von AnyCap.",
    demoCompletion: "Analyse abgeschlossen — 12-Sekunden-Aufnahme, 4 Schlüsselereignisse erkannt.",
    demoCompletionSub: "✓",
    demoAnalysisLines: [
      "0:00 – Der Nutzer öffnet den Bereich Einstellungen über die Seitenleiste.",
      '0:03 – Klickt auf den Schalter "Theme", um in den Dunkelmodus zu wechseln.',
      "0:05 – Das Modal blitzt für etwa 200 ms weiß auf, bevor der dunkle Hintergrund angewendet wird.",
      "0:08 – Der Nutzer schließt und öffnet Einstellungen erneut — der Blitz wiederholt sich bei jedem Umschalten.",
      "",
      "Bug: Der Theme-Übergang wird auf die Seite angewendet, bevor der Modal-Backdrop folgt; dadurch entsteht ein sichtbarer weißer Blitz.",
      "Ursache: wahrscheinlich die Reihenfolge der CSS-Übergänge — die Verzögerung des Backdrops ist länger als der Inhaltswechsel.",
    ],
    demoConclusion:
      "Der weiße Blitz tritt bei jedem Umschalten auf. Das deutet auf ein Problem mit der Reihenfolge der CSS-Übergänge hin.",
  },
};

function checkCapabilityDetailChrome() {
  const component = read("src/components/seo/CapabilityDetailPage.tsx");

  requireTokens("capability detail chrome", component, [
    "export type CapabilityDetailChrome = {",
    "searchIntentLabel: string;",
    "positioningLines: readonly [string, string];",
    "positioningSummary: string;",
    "chrome?: CapabilityDetailChrome;",
    "const defaultCapabilityDetailChrome: CapabilityDetailChrome = {",
    'searchIntentLabel: "Search intent",',
    '"Agents do not need another disconnected tool.",',
    '"They need the capability inside the workflow.",',
    'positioningSummary: "AnyCap turns capability access into agent action.",',
    "chrome = defaultCapabilityDetailChrome,",
    "{chrome.searchIntentLabel}",
    "{chrome.positioningLines[0]}",
    "{chrome.positioningLines[1]}",
    "{chrome.positioningSummary}",
    "{hasJsonLdContent(faqJsonLd) ? (",
    '<FadeIn className="min-w-0">',
    '<pre className="overflow-x-auto bg-[#1c1f17]',
    "<code style={mono}>{example.code}</code>",
  ]);
  forbidPattern("capability detail usage code", component, /<p className="break-all[^>]*>\s*\{example\.code\}/);
  requireTokenCount(
    "capability detail fallback",
    component,
    "Agents do not need another disconnected tool.",
    1,
  );
  requireTokenCount(
    "capability detail fallback",
    component,
    "They need the capability inside the workflow.",
    1,
  );
  requireTokenCount(
    "capability detail fallback",
    component,
    "AnyCap turns capability access into agent action.",
    1,
  );
}

async function loadExecutableVideoAnalysisModule() {
  const siteImport = 'import { getLocaleConfig, siteConfig } from "@/lib/site";';
  const schemaImport = 'import { createTechArticleJsonLd } from "@/lib/schema";';
  const dependencies = [
    "const {",
    "  createTechArticleJsonLd,",
    "  getLocaleConfig,",
    "  siteConfig,",
    "} = globalThis.__p0VideoAnalysisDependencies;",
  ].join("\n");
  let transpiledContent = transpileTypeScript(
    "src/app/(seo)/capabilities/video-analysis/content.ts",
  );

  if (!transpiledContent.includes(siteImport)) {
    throw new Error("could not replace transpiled video-analysis site import");
  }
  transpiledContent = transpiledContent.replace(siteImport, dependencies);
  if (transpiledContent.includes(schemaImport)) {
    transpiledContent = transpiledContent.replace(schemaImport, "");
  }

  globalThis.__p0VideoAnalysisDependencies = {
    createTechArticleJsonLd: (input) => ({ "@type": "TechArticle", ...input }),
    getLocaleConfig: (locale) => ({ ogLocale: locale }),
    siteConfig: { siteName: "AnyCap" },
  };

  try {
    return await importDataModule(transpiledContent);
  } finally {
    delete globalThis.__p0VideoAnalysisDependencies;
  }
}

async function checkExecutableVideoAnalysis() {
  const contentModule = await loadExecutableVideoAnalysisModule();
  const dataByLocale = new Map(
    videoLocales.map((locale) => [locale, contentModule.getVideoAnalysisPageData(locale)]),
  );
  const english = dataByLocale.get("en");

  for (const locale of videoLocales) {
    const expected = expectedVideoAnalysisLocales[locale];
    const data = dataByLocale.get(locale);
    const demoLines = data.demo?.lines ?? [];
    const schema = data.capabilityGuideJsonLd ?? {};
    const responseCode = data.responseExample?.code ?? "{}";
    checkExactJsonObject(`video analysis ${locale} response example`, responseCode, {
      status: "success",
      content: expected.responseContent,
      credit_cost: 10,
      request_id: "req_abc123",
    });

    requireEqual(
      `video analysis ${locale} search intent label`,
      data.chrome?.searchIntentLabel,
      expected.searchIntentLabel,
    );
    requireEqual(
      `video analysis ${locale} positioning line count`,
      data.chrome?.positioningLines?.length,
      2,
    );
    requireNonEmpty(
      `video analysis ${locale} positioning summary`,
      data.chrome?.positioningSummary,
    );
    requireEqual(
      `video analysis ${locale} visible date`,
      data.lastUpdatedLabel,
      expected.lastUpdatedLabel,
    );
    requireEqual(
      `video analysis ${locale} accent title`,
      data.accentTitle,
      expected.accentTitle,
    );
    requireEqual(
      `video analysis ${locale} demo header`,
      data.demo?.labels?.header,
      expected.demoHeader,
    );
    requireArrayEqual(
      `video analysis ${locale} demo line types`,
      demoLines.map((line) => line.type),
      expectedVideoAnalysisDemoLineTypes,
    );
    requireEqual(
      `video analysis ${locale} demo prompt`,
      demoLines[1]?.content,
      expected.demoPrompt,
    );
    requireEqual(
      `video analysis ${locale} demo narration`,
      demoLines[2]?.content,
      expected.demoNarration,
    );
    requireEqual(
      `video analysis ${locale} demo command`,
      demoLines[3]?.content,
      expectedVideoAnalysisDemoCommand,
    );
    requireEqual(
      `video analysis ${locale} demo completion`,
      demoLines[4]?.content,
      expected.demoCompletion,
    );
    requireEqual(
      `video analysis ${locale} demo completion marker`,
      demoLines[4]?.sub,
      expected.demoCompletionSub,
    );
    requireArrayEqual(
      `video analysis ${locale} demo analysis lines`,
      demoLines[5]?.analysisLines ?? [],
      expected.demoAnalysisLines,
    );
    requireEqual(
      `video analysis ${locale} demo conclusion`,
      demoLines[6]?.content,
      expected.demoConclusion,
    );
    requireArrayEqual(
      `video analysis ${locale} related hrefs`,
      data.relatedCards?.map((card) => card.href) ?? [],
      expectedVideoAnalysisRelatedHrefs,
    );
    requireArrayEqual(
      `video analysis ${locale} primary hrefs`,
      data.actions?.filter((action) => action.primary).map((action) => action.href) ?? [],
      ["/start"],
    );
    requireArrayEqual(
      `video analysis ${locale} use-case meanings`,
      data.useCases?.map((useCase) => useCase.meaning) ?? [],
      expectedVideoAnalysisUseCaseMeanings,
    );

    requireEqual(
      `video analysis ${locale} response usage inclusion`,
      data.usageExamples?.filter((example) => example.code === responseCode).length,
      1,
    );
    requireEqual(
      `video analysis ${locale} response title`,
      data.responseExample?.title,
      expected.responseTitle,
    );
    requireEqual(
      `video analysis ${locale} response usage title`,
      data.usageExamples?.find((example) => example.code === responseCode)?.title,
      expected.responseTitle,
    );
    requireEqual(
      `video analysis ${locale} fixed-cost FAQ`,
      data.faqItems?.some((item) => item.answer.includes(expected.fixedCostFaqMarker)),
      true,
    );

    requireEqual(`video analysis ${locale} schema type`, schema["@type"], "TechArticle");
    requireEqual(
      `video analysis ${locale} schema headline`,
      schema.headline,
      data.metadata?.articleHeadline,
    );
    requireEqual(
      `video analysis ${locale} schema description`,
      schema.description,
      data.metadata?.articleDescription,
    );
    requireEqual(`video analysis ${locale} schema path`, schema.path, "/capabilities/video-analysis");
    requireEqual(`video analysis ${locale} schema locale`, schema.locale, locale);
    requireArrayEqual(
      `video analysis ${locale} schema about`,
      schema.about,
      data.metadata?.articleAbout ?? [],
    );
    requireArrayEqual(
      `video analysis ${locale} schema keywords`,
      schema.keywords,
      data.metadata?.articleKeywords ?? [],
    );
    requireEqual(
      `video analysis ${locale} publication date`,
      schema.datePublished,
      "2026-04-13",
    );
    requireEqual(
      `video analysis ${locale} modified date`,
      schema.dateModified,
      "2026-07-11",
    );

    for (const [field, value] of [
      ["demo title", data.demo?.title],
      ["demo body", data.demo?.body],
      ["summary label", data.summary?.label],
      ["summary text", data.summary?.text],
      ["workflow title", data.workflow?.title],
      ["final title", data.final?.title],
      ["final body", data.final?.body],
    ]) {
      requireNonEmpty(`video analysis ${locale} ${field}`, value);
    }

    if (locale !== "en") {
      for (const [field, value, englishValue] of [
        ["chrome", data.chrome, english.chrome],
        ["summary", data.summary, english.summary],
        ["workflow", data.workflow, english.workflow],
        ["schema about", schema.about, english.capabilityGuideJsonLd?.about],
        ["schema keywords", schema.keywords, english.capabilityGuideJsonLd?.keywords],
      ]) {
        if (JSON.stringify(value) === JSON.stringify(englishValue)) {
          errors.push(`video analysis ${locale} ${field}: expected localized content`);
        }
      }
    }
  }
}

async function checkVideoAnalysis() {
  const content = read("src/app/(seo)/capabilities/video-analysis/content.ts");
  const page = read("src/app/(seo)/capabilities/video-analysis/page.tsx");

  checkCapabilityDetailChrome();
  requireTokens("video analysis content", content, [
    "type VideoAnalysisPageContent = {",
    "chrome: CapabilityDetailChrome;",
    "labels: { header: string };",
    "lines: readonly DemoLine[];",
    "responseExample:",
    "createTechArticleJsonLd({",
    "satisfies Record<SiteLocale, VideoAnalysisPageContent>",
  ]);
  requireTokens("video analysis page", page, [
    'import { CapabilityDemo } from "@/components/landing/CapabilityDemo";',
    "jsonLd={content.capabilityGuideJsonLd}",
    "chrome={content.chrome}",
    "lastUpdatedLabel={content.lastUpdatedLabel}",
    "accentTitle={content.accentTitle}",
    "searchIntents={content.searchIntents}",
    "demo={<CapabilityDemo lines={content.demo.lines} labels={content.demo.labels} />}",
    "demoTitle={content.demo.title}",
    "demoBody={content.demo.body}",
    "proofPoints={content.proofPoints}",
    "summaryLabel={content.summary.label}",
    "summaryText={content.summary.text}",
    "workflowTitle={content.workflow.title}",
    "workflowSteps={content.workflow.steps}",
    "usageExamples={content.usageExamples}",
    "useCases={content.useCases}",
    "relatedCards={content.relatedCards}",
    "finalTitle={content.final.title}",
    "finalBody={content.final.body}",
  ]);
  forbidPattern("video analysis page", page, /VideoReadDemo/);
  forbidPattern(
    "video analysis page",
    page,
    /Last updated April 13, 2026|Read the recording|The short answer|Let your agent understand video/,
  );
  forbidPattern(
    "video analysis schema",
    `${content}\n${page}`,
    /createFaqPageJsonLd|createHowToJsonLd|"@type":\s*"FAQPage"|"@type":\s*"HowTo"/,
  );
  forbidPattern(
    "video analysis FAQ rationale",
    content,
    /market language teams search for|common search and evaluation terms|linguagem de mercado que os times procuram|termos comuns de busca e avaliação|bahasa pasar yang dicari tim|istilah pencarian dan evaluasi yang umum|Marktsprache, nach der Teams suchen|Such- und Bewertungsbegriffe/,
  );
  forbidPattern("video analysis response example", content, /responseExample:\s*{[^}]*note:/s);
  forbidPattern(
    "video analysis fixed cost",
    content,
    /credits vary|os créditos variam|kredit bervariasi|Credits variieren/,
  );

  try {
    await checkExecutableVideoAnalysis();
  } catch (error) {
    errors.push(`video analysis runtime: ${error instanceof Error ? error.message : String(error)}`);
  }
}

const videoGuideLocales = ["en", "pt-br", "id", "de"];
const expectedVideoGuideSourcePaths = [
  {
    key: "text",
    mode: "text-to-video",
    requiredSchemaParam: null,
    schemaCommand:
      "anycap video models <model-id> schema --operation generate --mode text-to-video",
    generateCommand:
      'anycap video generate --model <model-id> --mode text-to-video --prompt "a short product walkthrough" -o product-walkthrough.mp4',
  },
  {
    key: "image",
    mode: "image-to-video",
    requiredSchemaParam: "images",
    schemaCommand:
      "anycap video models <model-id> schema --operation generate --mode image-to-video",
    generateCommand:
      'anycap video generate --model <model-id> --mode image-to-video --prompt "animate this still with subtle camera movement" --param images=./source.png -o animated-source.mp4',
  },
  {
    key: "footage",
    mode: "edit-video",
    requiredSchemaParam: "videos",
    schemaCommand:
      "anycap video models <edit-model-id> schema --operation generate --mode edit-video",
    generateCommand:
      'anycap video generate --model <edit-model-id> --mode edit-video --prompt "brighten the scene while preserving the subject and camera motion" --param videos=./source.mp4 -o edited-source.mp4',
  },
];
const expectedVideoGuideSetupTargets = [
  {
    key: "claude-code",
    agent: "Claude Code",
    command: "npx -y skills add anycap-ai/anycap -a claude-code -y",
  },
  {
    key: "cursor",
    agent: "Cursor",
    command: "npx -y skills add anycap-ai/anycap -a cursor -y",
  },
  {
    key: "codex",
    agent: "Codex",
    command: "npx -y skills add anycap-ai/anycap -a codex -y",
  },
];
const expectedVideoGuideWorkflowCommands = {
  cliInstall: "curl -fsSL https://anycap.ai/install.sh | sh",
  cliInstallAlternative: "npm install -g @anycap/cli",
  login: "anycap login",
  discover: "anycap video models",
};
const expectedVideoGuideRelatedHrefs = [
  "/for/codex",
  "/capabilities/video-generation",
  "/capabilities/video-analysis",
];
const expectedVideoGuideCreditNotes = {
  en: "credits_used: 20 is illustrative. Actual credits vary by model, duration, and output settings.",
  "pt-br":
    "credits_used: 20 é ilustrativo. Os créditos reais variam conforme o modelo, a duração e as configurações de saída.",
  id: "credits_used: 20 hanya ilustrasi. Kredit sebenarnya bervariasi menurut model, durasi, dan pengaturan output.",
  de: "credits_used: 20 ist nur ein Beispiel. Die tatsächlichen Credits variieren je nach Modell, Dauer und Ausgabeeinstellungen.",
};
const expectedVideoGuideStepCopyKeys = [
  "skillBody",
  "cliBody",
  "loginBody",
  "discoverBody",
  "schemaBody",
  "firstVideoBody",
  "workflowBody",
  "workflowFooter",
];
const expectedVideoGuideStepTitleKeys = [
  "skill",
  "cli",
  "login",
  "discover",
  "schema",
  "firstVideo",
  "workflow",
];
const expectedVideoGuideAbout = [
  "AI agent video generation",
  "AnyCap CLI",
  "video workflows",
];
const expectedVideoGuideKeywords = [
  "how to add video generation to ai agent",
  "ai agent video generation",
  "image to video agent workflow",
  "anycap video generate",
];
const expectedVideoGuideMetadata = {
  en: {
    title: "How to Add Video Generation to an AI Agent — Step-by-Step Setup Guide",
    description:
      "Step-by-step guide to adding video generation to Claude Code, Cursor, and Codex with the AnyCap CLI, including model and schema discovery plus practical workflow examples.",
  },
  "pt-br": {
    title: "Como adicionar geração de vídeo a um agente de IA — guia passo a passo",
    description:
      "Guia passo a passo para adicionar geração de vídeo ao Claude Code, Cursor e Codex com a CLI do AnyCap, incluindo descoberta de modelos e schemas e exemplos práticos de fluxo.",
  },
  id: {
    title: "Cara menambahkan generasi video ke agen AI — panduan langkah demi langkah",
    description:
      "Panduan langkah demi langkah untuk menambahkan generasi video ke Claude Code, Cursor, dan Codex dengan AnyCap CLI, termasuk penemuan model dan skema serta contoh alur praktis.",
  },
  de: {
    title: "Videogenerierung zu einem KI-Agenten hinzufügen — Einrichtungsanleitung",
    description:
      "Einrichtungsanleitung für Videogenerierung in Claude Code, Cursor und Codex mit der AnyCap CLI, einschließlich Modell- und Schemaermittlung sowie praktischer Workflow-Beispiele.",
  },
};

async function loadExecutableVideoGuideModule() {
  const catalogModule = await importDataModule(transpileTypeScript("src/lib/seo/model-catalog.ts"));
  const schemaImport = 'import { createTechArticleJsonLd } from "@/lib/schema";';
  const catalogImport =
    'import { getCatalogModelsByCapability } from "@/lib/seo/model-catalog";';
  const dependencies = [
    "const {",
    "  createTechArticleJsonLd,",
    "  getCatalogModelsByCapability,",
    "} = globalThis.__p0VideoGuideDependencies;",
  ].join("\n");
  let catalogModels = catalogModule.getCatalogModelsByCapability("video");
  let transpiledContent = transpileTypeScript(
    "src/app/(seo)/guides/how-to-add-video-generation-to-ai-agent/content.ts",
  );

  if (!transpiledContent.includes(schemaImport)) {
    throw new Error("could not replace transpiled video-guide schema import");
  }
  if (!transpiledContent.includes(catalogImport)) {
    throw new Error("could not replace transpiled video-guide catalog import");
  }
  transpiledContent = transpiledContent
    .replace(schemaImport, dependencies)
    .replace(catalogImport, "");

  globalThis.__p0VideoGuideDependencies = {
    createTechArticleJsonLd: (input) => ({ "@type": "TechArticle", ...input }),
    getCatalogModelsByCapability: (capability) =>
      capability === "video" ? catalogModels : [],
  };

  try {
    const contentModule = await importDataModule(transpiledContent);
    return {
      catalogModels,
      contentModule,
      setCatalogModels(models) {
        catalogModels = models;
      },
    };
  } finally {
    delete globalThis.__p0VideoGuideDependencies;
  }
}

async function loadExecutableVideoGuideMetadataModule() {
  const localizedMetadataImport =
    'import { createLocalizedMetadataForPath } from "@/lib/localized-metadata";';
  const siteImport = 'import { defaultLocale } from "@/lib/site";';
  const contentImport =
    'import { VIDEO_AGENT_GUIDE_PATH } from "./content";';
  const dependencies = [
    "const {",
    "  createLocalizedMetadataForPath,",
    "  defaultLocale,",
    "  VIDEO_AGENT_GUIDE_PATH,",
    "} = globalThis.__p0VideoGuideMetadataDependencies;",
  ].join("\n");
  let transpiledMetadata = transpileTypeScript(
    "src/app/(seo)/guides/how-to-add-video-generation-to-ai-agent/metadata.ts",
  );

  for (const [label, importSource] of [
    ["localized metadata", localizedMetadataImport],
    ["site", siteImport],
    ["content", contentImport],
  ]) {
    if (!transpiledMetadata.includes(importSource)) {
      throw new Error(`could not replace transpiled video-guide ${label} import`);
    }
  }
  transpiledMetadata = transpiledMetadata
    .replace(localizedMetadataImport, dependencies)
    .replace(siteImport, "")
    .replace(contentImport, "");

  globalThis.__p0VideoGuideMetadataDependencies = {
    createLocalizedMetadataForPath: (locale, path, input) => ({
      locale,
      path,
      ...input,
    }),
    defaultLocale: "en",
    VIDEO_AGENT_GUIDE_PATH: "/guides/how-to-add-video-generation-to-ai-agent",
  };

  try {
    return await importDataModule(transpiledMetadata);
  } finally {
    delete globalThis.__p0VideoGuideMetadataDependencies;
  }
}

async function checkExecutableVideoGuideMetadata() {
  const metadataModule = await loadExecutableVideoGuideMetadataModule();

  for (const locale of videoGuideLocales) {
    const metadata = metadataModule.getPageMetadata(locale);
    const expected = expectedVideoGuideMetadata[locale];
    requireEqual(`video guide ${locale} metadata locale`, metadata.locale, locale);
    requireEqual(
      `video guide ${locale} metadata path`,
      metadata.path,
      "/guides/how-to-add-video-generation-to-ai-agent",
    );
    requireEqual(`video guide ${locale} metadata title`, metadata.title, expected.title);
    requireEqual(
      `video guide ${locale} metadata description`,
      metadata.description,
      expected.description,
    );
    requireEqual(
      `video guide ${locale} Open Graph type`,
      metadata.openGraph?.type,
      "article",
    );
    requireEqual(
      `video guide ${locale} Open Graph title`,
      metadata.openGraph?.title,
      expected.title,
    );
    requireEqual(
      `video guide ${locale} Open Graph description`,
      metadata.openGraph?.description,
      expected.description,
    );
  }

  requireEqual(
    "video guide default metadata title",
    metadataModule.metadata.title,
    expectedVideoGuideMetadata.en.title,
  );
}

function requireVideoGuideLocalizedTree(locale, label, value, englishValue) {
  if (typeof value === "string" || typeof englishValue === "string") {
    requireNonEmpty(`video guide ${locale} ${label}`, value);
    if (value === englishValue) {
      errors.push(`video guide ${locale} ${label}: expected localized content`);
    }
    return;
  }

  if (Array.isArray(value) || Array.isArray(englishValue)) {
    requireEqual(`video guide ${locale} ${label} array`, Array.isArray(value), true);
    requireEqual(
      `video guide ${locale} ${label} English array`,
      Array.isArray(englishValue),
      true,
    );
    requireEqual(
      `video guide ${locale} ${label} length`,
      value?.length,
      englishValue?.length,
    );
    value?.forEach((item, index) =>
      requireVideoGuideLocalizedTree(
        locale,
        `${label}[${index}]`,
        item,
        englishValue?.[index],
      ),
    );
    return;
  }

  const valueKeys = Object.keys(value ?? {});
  const englishKeys = Object.keys(englishValue ?? {});
  requireArrayEqual(`video guide ${locale} ${label} keys`, valueKeys, englishKeys);
  valueKeys.forEach((key) =>
    requireVideoGuideLocalizedTree(
      locale,
      `${label}.${key}`,
      value?.[key],
      englishValue?.[key],
    ),
  );
}

async function checkExecutableVideoGuide() {
  const { catalogModels, contentModule, setCatalogModels } =
    await loadExecutableVideoGuideModule();
  const catalogHasEditVideo = catalogModels.some((model) =>
    model.modes.includes("edit-video"),
  );
  requireEqual("video guide catalog edit-video availability", catalogHasEditVideo, true);

  const dataByLocale = new Map(
    videoGuideLocales.map((locale) => [locale, contentModule.getVideoGuidePageData(locale)]),
  );
  const english = dataByLocale.get("en");
  const presentationCopy = (data) => ({
    eyebrow: data.eyebrow,
    title: data.title,
    intro: data.intro,
    neededTitle: data.neededTitle,
    neededItems: data.neededItems,
    callout: data.callout,
    steps: data.steps,
    useCasesTitle: data.useCasesTitle,
    useCases: data.useCases,
    promptsTitle: data.promptsTitle,
    promptsBody: data.promptsBody,
    mistakesTitle: data.mistakesTitle,
    mistakes: data.mistakes,
    faqTitle: data.faqTitle,
    ctas: data.ctas,
    breadcrumbLabel: data.breadcrumbLabel,
  });

  for (const locale of videoGuideLocales) {
    const data = dataByLocale.get(locale);
    requireNonEmpty(`video guide ${locale} eyebrow`, data.eyebrow);
    requireEqual(`video guide ${locale} two-line title`, data.title?.length, 2);
    data.title?.forEach((line, index) =>
      requireNonEmpty(`video guide ${locale} title line ${index}`, line),
    );
    requireEqual(`video guide ${locale} intro count`, data.intro?.length, 3);
    data.intro?.forEach((paragraph, index) =>
      requireNonEmpty(`video guide ${locale} intro ${index}`, paragraph),
    );
    requireNonEmpty(`video guide ${locale} prerequisites title`, data.neededTitle);
    requireEqual(`video guide ${locale} prerequisite count`, data.neededItems?.length, 4);
    data.neededItems?.forEach((item, index) =>
      requireNonEmpty(`video guide ${locale} prerequisite ${index}`, item),
    );
    requireNonEmpty(`video guide ${locale} completion callout`, data.callout);
    requireArrayEqual(
      `video guide ${locale} step title keys`,
      Object.keys(data.steps ?? {}),
      expectedVideoGuideStepTitleKeys,
    );
    expectedVideoGuideStepTitleKeys.forEach((key) =>
      requireNonEmpty(`video guide ${locale} ${key} step title`, data.steps?.[key]),
    );
    requireNonEmpty(`video guide ${locale} use cases title`, data.useCasesTitle);
    requireEqual(`video guide ${locale} use case count`, data.useCases?.length, 3);
    data.useCases?.forEach((item, index) => {
      requireNonEmpty(`video guide ${locale} use case ${index} title`, item.title);
      requireNonEmpty(`video guide ${locale} use case ${index} body`, item.body);
    });
    requireNonEmpty(`video guide ${locale} prompts title`, data.promptsTitle);
    requireEqual(`video guide ${locale} prompt guidance count`, data.promptsBody?.length, 3);
    data.promptsBody?.forEach((item, index) =>
      requireNonEmpty(`video guide ${locale} prompt guidance ${index}`, item),
    );
    requireNonEmpty(`video guide ${locale} mistakes title`, data.mistakesTitle);
    requireEqual(`video guide ${locale} mistake count`, data.mistakes?.length, 3);
    data.mistakes?.forEach((item, index) => {
      requireNonEmpty(`video guide ${locale} mistake ${index} title`, item.title);
      requireNonEmpty(`video guide ${locale} mistake ${index} body`, item.body);
    });
    requireNonEmpty(`video guide ${locale} FAQ title`, data.faqTitle);
    requireArrayEqual(
      `video guide ${locale} CTA keys`,
      Object.keys(data.ctas ?? {}),
      ["claude", "video", "start"],
    );
    Object.entries(data.ctas ?? {}).forEach(([key, label]) =>
      requireNonEmpty(`video guide ${locale} ${key} CTA`, label),
    );
    requireNonEmpty(`video guide ${locale} breadcrumb label`, data.breadcrumbLabel);
    requireEqual(
      `video guide ${locale} source decision array`,
      Array.isArray(data.sourceDecision.items),
      true,
    );
    requireEqual(
      `video guide ${locale} source copy record hidden`,
      Object.hasOwn(data.sourceDecision, "copy"),
      false,
    );
    requireArrayEqual(
      `video guide ${locale} source order`,
      data.sourceDecision.items.map((item) => item.key),
      expectedVideoGuideSourcePaths.map((item) => item.key),
    );
    expectedVideoGuideSourcePaths.forEach((expected, index) => {
      const actual = data.sourceDecision.items[index] ?? {};
      requireEqual(`video guide ${locale} ${expected.key} mode`, actual.mode, expected.mode);
      requireEqual(
        `video guide ${locale} ${expected.key} schema param`,
        actual.requiredSchemaParam ?? null,
        expected.requiredSchemaParam,
      );
      requireEqual(
        `video guide ${locale} ${expected.key} schema command`,
        actual.schemaCommand,
        expected.schemaCommand,
      );
      requireEqual(
        `video guide ${locale} ${expected.key} generate command`,
        actual.generateCommand,
        expected.generateCommand,
      );
      requireNonEmpty(`video guide ${locale} ${expected.key} title`, actual.title);
      requireNonEmpty(`video guide ${locale} ${expected.key} body`, actual.body);
      requireNonEmpty(`video guide ${locale} ${expected.key} fit`, actual.fit);
      requireNonEmpty(`video guide ${locale} ${expected.key} limitation`, actual.limitation);
    });

    requireEqual(`video guide ${locale} setup rows array`, Array.isArray(data.setupMatrix.rows), true);
    requireArrayEqual(
      `video guide ${locale} setup target order`,
      data.setupMatrix.rows.map((item) => item.key),
      expectedVideoGuideSetupTargets.map((item) => item.key),
    );
    expectedVideoGuideSetupTargets.forEach((expected, index) => {
      const actual = data.setupMatrix.rows[index] ?? {};
      requireEqual(`video guide ${locale} ${expected.key} agent`, actual.agent, expected.agent);
      requireEqual(`video guide ${locale} ${expected.key} command`, actual.command, expected.command);
    });
    requireEqual(
      `video guide ${locale} workflow commands`,
      JSON.stringify(data.workflowCommands),
      JSON.stringify(expectedVideoGuideWorkflowCommands),
    );

    requireEqual(
      `video guide ${locale} related links array`,
      Array.isArray(data.relatedP0.links),
      true,
    );
    requireEqual(
      `video guide ${locale} related label record hidden`,
      Object.hasOwn(data.relatedP0, "labels"),
      false,
    );
    requireArrayEqual(
      `video guide ${locale} related hrefs`,
      data.relatedP0.links.map((item) => item.href),
      expectedVideoGuideRelatedHrefs,
    );
    data.relatedP0.links.forEach((link) =>
      requireNonEmpty(`video guide ${locale} ${link.key} related label`, link.label),
    );

    requireNonEmpty(`video guide ${locale} result title`, data.resultExample.title);
    requireNonEmpty(`video guide ${locale} result output label`, data.resultExample.outputLabel);
    requireEqual(
      `video guide ${locale} credit note`,
      data.resultExample.description,
      expectedVideoGuideCreditNotes[locale],
    );
    requireArrayEqual(
      `video guide ${locale} step copy keys`,
      Object.keys(data.stepCopy),
      expectedVideoGuideStepCopyKeys,
    );
    expectedVideoGuideStepCopyKeys.forEach((key) =>
      requireNonEmpty(`video guide ${locale} ${key}`, data.stepCopy[key]),
    );
    requireEqual(`video guide ${locale} FAQ count`, data.faqItems.length, 4);
    const schema = data.guideJsonLd;
    requireEqual(
      `video guide ${locale} FAQ JSON-LD omitted`,
      Object.hasOwn(data, "faqJsonLd"),
      false,
    );
    requireEqual(`video guide ${locale} schema type`, schema["@type"], "TechArticle");
    requireEqual(`video guide ${locale} schema headline`, schema.headline, data.article.headline);
    requireEqual(
      `video guide ${locale} schema description`,
      schema.description,
      data.article.description,
    );
    requireEqual(
      `video guide ${locale} schema path`,
      schema.path,
      "/guides/how-to-add-video-generation-to-ai-agent",
    );
    requireEqual(`video guide ${locale} schema locale`, schema.locale, locale);
    requireEqual(`video guide ${locale} publication date`, schema.datePublished, "2026-04-14");
    requireEqual(`video guide ${locale} modified date`, schema.dateModified, "2026-07-11");
    requireArrayEqual(`video guide ${locale} schema about`, schema.about, expectedVideoGuideAbout);
    requireArrayEqual(
      `video guide ${locale} schema keywords`,
      schema.keywords,
      expectedVideoGuideKeywords,
    );

    if (/(?:\bpoll(?:s|ed|ing)?\b|status abfrag|abfrageschleife)/i.test(JSON.stringify(data))) {
      errors.push(`video guide ${locale}: found manual-polling guidance in runtime data`);
    }

    if (locale !== "en") {
      const sourceDecisionChrome = ({ items: _items, ...chrome }) => chrome;
      const setupMatrixChrome = ({ rows: _rows, ...chrome }) => chrome;
      const relatedP0Copy = (relatedP0) => ({
        title: relatedP0.title,
        description: relatedP0.description,
        labels: relatedP0.links.map((link) => link.label),
      });
      for (const [field, value, englishValue] of [
        ["retained presentation", presentationCopy(data), presentationCopy(english)],
        ["article", data.article, english.article],
        ["source decision chrome", sourceDecisionChrome(data.sourceDecision), sourceDecisionChrome(english.sourceDecision)],
        ["source copy", data.sourceDecision.items.map(({ title, body, fit, limitation }) => ({ title, body, fit, limitation })), english.sourceDecision.items.map(({ title, body, fit, limitation }) => ({ title, body, fit, limitation }))],
        ["setup matrix chrome", setupMatrixChrome(data.setupMatrix), setupMatrixChrome(english.setupMatrix)],
        ["step copy", data.stepCopy, english.stepCopy],
        ["result example", data.resultExample, english.resultExample],
        ["related P0 copy", relatedP0Copy(data.relatedP0), relatedP0Copy(english.relatedP0)],
        ["FAQ", data.faqItems, english.faqItems],
      ]) {
        requireVideoGuideLocalizedTree(locale, field, value, englishValue);
      }
    }
  }

  setCatalogModels(
    catalogModels.map((model) => ({
      ...model,
      modes: model.modes.filter((mode) => mode !== "edit-video"),
    })),
  );
  for (const locale of videoGuideLocales) {
    const data = contentModule.getVideoGuidePageData(locale);
    requireArrayEqual(
      `video guide ${locale} source order without edit-video`,
      data.sourceDecision.items.map((item) => item.key),
      ["text", "image"],
    );
  }
}

async function checkVideoAgentGuide() {
  const contentPath = "src/app/(seo)/guides/how-to-add-video-generation-to-ai-agent/content.ts";
  const content = readOptional("video guide content", contentPath);
  const page = read("src/app/(seo)/guides/how-to-add-video-generation-to-ai-agent/page.tsx");
  const metadata = read("src/app/(seo)/guides/how-to-add-video-generation-to-ai-agent/metadata.ts");

  requireTokens("video guide content", content, [
    'type SourcePathKey = "text" | "image" | "footage";',
    'type SetupTargetKey = "claude-code" | "cursor" | "codex";',
    'type RelatedP0Key = "codex" | "video-generation" | "video-analysis";',
    'type RelatedP0Href = "/for/codex" | "/capabilities/video-generation" | "/capabilities/video-analysis";',
    "type SourceDecisionCopy = {",
    "body: string;",
    "fit: string;",
    "limitation: string;",
    "type SourceDecisionFact = {",
    "type SetupTarget = {",
    "export type VideoGuidePageData =",
    "eyebrow: string;",
    "title: [string, string];",
    "intro: readonly string[];",
    "neededTitle: string;",
    "neededItems: readonly string[];",
    "callout: string;",
    "steps:",
    "useCasesTitle: string;",
    "useCases:",
    "promptsTitle: string;",
    "promptsBody: readonly string[];",
    "mistakesTitle: string;",
    "mistakes:",
    "faqTitle: string;",
    "ctas:",
    "breadcrumbLabel: string;",
    "stepCopy:",
    "resultExample:",
    "satisfies Record<SiteLocale, PageContent>",
    "export function getVideoGuidePageData(",
    'export const VIDEO_AGENT_GUIDE_START_HREF = "/start";',
    'modes.includes("edit-video")',
    "anycap video models <model-id> schema --operation generate --mode text-to-video",
    "anycap video models <model-id> schema --operation generate --mode image-to-video",
    "anycap video models <edit-model-id> schema --operation generate --mode edit-video",
    'anycap video generate --model <model-id> --mode text-to-video --prompt "a short product walkthrough" -o product-walkthrough.mp4',
    'anycap video generate --model <model-id> --mode image-to-video --prompt "animate this still with subtle camera movement" --param images=./source.png -o animated-source.mp4',
    'anycap video generate --model <edit-model-id> --mode edit-video --prompt "brighten the scene while preserving the subject and camera motion" --param videos=./source.mp4 -o edited-source.mp4',
    "--param images=./source.png",
    "--param videos=./source.mp4",
    "npx -y skills add anycap-ai/anycap -a claude-code -y",
    "npx -y skills add anycap-ai/anycap -a cursor -y",
    "npx -y skills add anycap-ai/anycap -a codex -y",
    '"/for/codex"',
    '"/capabilities/video-generation"',
    '"/capabilities/video-analysis"',
    'datePublished: "2026-04-14"',
    'dateModified: "2026-07-11"',
    'about: ["AI agent video generation", "AnyCap CLI", "video workflows"]',
    '"how to add video generation to ai agent"',
    '"ai agent video generation"',
    '"image to video agent workflow"',
    '"anycap video generate"',
  ]);
  requireTokens("video guide page", page, [
    "getVideoGuidePageData(locale)",
    "content.eyebrow",
    "content.title[0]",
    "content.title[1]",
    "content.intro.map",
    "content.neededTitle",
    "content.neededItems.map",
    "content.callout",
    "content.steps.skill",
    "content.steps.cli",
    "content.steps.login",
    "content.steps.discover",
    "content.steps.schema",
    "content.steps.firstVideo",
    "content.steps.workflow",
    "content.useCasesTitle",
    "content.useCases.map",
    "content.promptsTitle",
    "content.promptsBody.map",
    "content.mistakesTitle",
    "content.mistakes.map",
    "content.faqTitle",
    "content.ctas.claude",
    "content.ctas.video",
    "content.ctas.start",
    "content.breadcrumbLabel",
    "content.sourceDecision.title",
    "content.sourceDecision.description",
    "content.sourceDecision.fitLabel",
    "content.sourceDecision.limitationLabel",
    "content.sourceDecision.schemaLabel",
    "content.sourceDecision.generateLabel",
    "content.sourceDecision.schemaParamNote",
    "content.sourceDecision.items.map",
    "source.key",
    "source.mode",
    "source.title",
    "source.body",
    "source.fit",
    "source.limitation",
    "source.schemaCommand",
    "source.generateCommand",
    "content.setupMatrix.rows.map",
    "content.setupMatrix.title",
    "content.setupMatrix.description",
    "content.setupMatrix.agentHeader",
    "content.setupMatrix.commandHeader",
    "target.key",
    "target.agent",
    "target.command",
    "content.stepCopy.skillBody",
    "content.stepCopy.cliBody",
    "content.stepCopy.loginBody",
    "content.stepCopy.discoverBody",
    "content.stepCopy.schemaBody",
    "content.stepCopy.firstVideoBody",
    "content.stepCopy.workflowBody",
    "content.stepCopy.workflowFooter",
    "content.relatedP0.title",
    "content.relatedP0.description",
    "content.relatedP0.links.map",
    "link.key",
    "link.href",
    "link.label",
    "content.faqItems.map",
    "item.question",
    "item.answer",
    "content.resultExample.title",
    "content.resultExample.description",
    "content.resultExample.outputLabel",
    "source.requiredSchemaParam",
    "content.guideJsonLd",
    "href={VIDEO_AGENT_GUIDE_START_HREF}",
    '"status": "success",',
    '"local_path": "/workspace/product-walkthrough.mp4",',
    '"model": "<model-id>",',
    '"credits_used": 20,',
    '"request_id": "req_abc123"',
  ]);
  requireSequence("video guide body order", page, [
    "content.stepCopy.workflowFooter",
    "content.relatedP0.links.map",
  ]);
  checkVideoGuideRepresentativeResult(page);
  requireTokens("video guide metadata", metadata, [
    'import { VIDEO_AGENT_GUIDE_PATH } from "./content";',
    "Record<SiteLocale,",
    '"pt-br": {',
    "id: {",
    "de: {",
    'type: "article"',
    '"How to Add Video Generation to an AI Agent — Step-by-Step Setup Guide"',
    '"Como adicionar geração de vídeo a um agente de IA — guia passo a passo"',
    '"Cara menambahkan generasi video ke agen AI — panduan langkah demi langkah"',
    '"Videogenerierung zu einem KI-Agenten hinzufügen — Einrichtungsanleitung"',
  ]);
  forbidPattern("video guide inline locale branches", page, /localizedFaqItems|localizedCopy|locale\s*===/);
  forbidPattern(
    "video guide manual polling",
    `${content}\n${page}`,
    /\bpoll(?:s|ed|ing)?\b|status abfrag|abfrageschleife/i,
  );
  forbidPattern(
    "video guide schema",
    `${content}\n${page}`,
    /createFaqPageJsonLd|createHowToJsonLd|"@type":\s*"HowTo"|"@type":\s*"FAQPage"/,
  );
  forbidPattern(
    "video guide editorial rationale",
    `${content}\n${page}`,
    /search intent|search demand|searchers|market language|SEO rationale/i,
  );
  forbidPattern("video guide metadata branches", metadata, /if\s*\(locale\s*===/);

  if (content.length === 0) return;

  try {
    await checkExecutableVideoGuide();
  } catch (error) {
    errors.push(`video guide runtime: ${error instanceof Error ? error.message : String(error)}`);
  }
  try {
    await checkExecutableVideoGuideMetadata();
  } catch (error) {
    errors.push(
      `video guide metadata runtime: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

await checkCodex();
await checkVideoGeneration();
await checkVideoAnalysis();
await checkVideoAgentGuide();

if (errors.length > 0) {
  console.error("Main-site SEO P0 contract check failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Main-site SEO P0 contract check passed.");
