# Models Hub Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refresh `/models` from the current AnyCap production catalog, add audio generation, and put the most recently added or materially updated models first.

**Architecture:** Move the hub's generation-model records into a focused typed inventory with explicit `updatedAt` dates and one deterministic sort helper. Keep the SEO page static at render time, derive the shared pricing/comparison groups from that inventory, and add a localized latest-additions section without creating new detail routes.

**Tech Stack:** Next.js 15, React 19, TypeScript, Node's built-in test runner, pnpm, existing AnyCap SEO build scripts.

## Global Constraints

- Only refresh the existing `/models` hub and the shared inventory needed to render it; do not create new model detail routes.
- Availability and modes must match the public production image, video, music, and audio model catalogs verified on 2026-07-19.
- Sort by the most recent AnyCap availability or material user-visible capability update, never by provider marketing release date.
- Sort descending by ISO `updatedAt`, then ascending by display name for deterministic ties.
- Do not perform a runtime catalog fetch from the SEO page.
- Models without a detail page must link to an existing capability route; Doubao Seed Audio 1.0 links to `/capabilities` because no audio-generation detail route exists.
- Keep English, Portuguese, Indonesian, and German visible copy in parity.
- Follow `web/docs/design-guideline.md`; keep sentence case, existing colors, spacing, borders, and typography.
- Do not change the landing page, navigation, model pricing, provider routes, or Seedream 5.0 Pro availability.
- Add tests before production changes and observe each focused test fail for the intended missing behavior.

---

## File Structure

- Create `web/src/lib/model-hub.ts`: typed current model inventory, update dates, safe links, best-fit fallback text, and deterministic sorting.
- Modify `web/src/lib/capability-inventory.ts`: derive `pricingGenerationGroups` from the model-hub inventory and add the audio group.
- Create `web/scripts/model-hub.test.mjs`: inventory completeness, mode, date, sort, and safe-link contract tests.
- Create `web/scripts/models-hub-page.test.mjs`: source-level route contract for current dates, localized latest-additions copy, and inventory-driven rendering.
- Modify `web/src/app/(seo)/models/page.tsx`: localized latest-additions section, current copy/date, audio localization, full-mode rendering, and fallback links.
- Modify `web/package.json`: add the focused model-hub check and run it in both production build paths.
- Modify `web/public/llms.txt`: describe the overview as the current four-capability catalog without inventing model-detail links.
- Modify `docs/anycap-current-status.md`: record the refreshed models hub and current website surface.

### Task 1: Establish the typed current model inventory

**Files:**
- Create: `web/scripts/model-hub.test.mjs`
- Create: `web/src/lib/model-hub.ts`
- Modify: `web/src/lib/capability-inventory.ts:5-69`
- Modify: `web/package.json:5-21`

**Interfaces:**
- Produces: `ModelHubCapability`, `ModelHubModel`, `modelHubModels`, `getModelHubModels(capability)`, and `sortModelHubModels(models)` from `web/src/lib/model-hub.ts`.
- Produces: `GenerationModel` as an alias of `ModelHubModel` and four sorted `pricingGenerationGroups` from `web/src/lib/capability-inventory.ts`.
- Consumed by: Task 2's `/models` route rendering.

- [ ] **Step 1: Write the failing inventory contract test**

Create `web/scripts/model-hub.test.mjs` with the exact production IDs and deterministic-order checks:

```js
import assert from "node:assert/strict";
import test from "node:test";

async function loadInventory() {
  try {
    return await import("../src/lib/model-hub.ts");
  } catch (error) {
    assert.fail(`model hub inventory must exist: ${error.message}`);
  }
}

const expectedByCapability = {
  image: [
    "flux-kontext-max",
    "gpt-image-2",
    "nano-banana-2",
    "nano-banana-lite",
    "nano-banana-pro",
    "qwen-image",
    "seedream-4.5",
    "seedream-5",
  ],
  video: [
    "gemini-omni-flash-preview",
    "hailuo-2.3",
    "kling-3.0",
    "kling-3.0-omni",
    "kling-o1",
    "seedance-1.5-pro",
    "seedance-2",
    "seedance-2-fast",
    "seedance-2-mini",
    "sora-2-pro",
    "veo-3.1",
    "veo-3.1-fast",
  ],
  music: ["elevanlabs-music", "mureka-v8", "suno-v5", "suno-v5.5"],
  audio: ["doubao-seed-audio-1-0"],
};

test("contains the complete production generation catalog", async () => {
  const { modelHubModels } = await loadInventory();

  for (const [capability, expected] of Object.entries(expectedByCapability)) {
    const actual = modelHubModels
      .filter((model) => model.capability === capability)
      .map((model) => model.modelId)
      .sort();
    assert.deepEqual(actual, [...expected].sort(), capability);
  }
});

test("uses valid ISO dates and deterministic newest-first ordering", async () => {
  const { modelHubModels, sortModelHubModels } = await loadInventory();

  for (const model of modelHubModels) {
    assert.match(model.updatedAt, /^2026-\d{2}-\d{2}$/);
    assert.equal(Number.isNaN(Date.parse(`${model.updatedAt}T00:00:00Z`)), false);
  }

  const sorted = sortModelHubModels(modelHubModels);
  assert.deepEqual(
    sorted.slice(0, 6).map((model) => model.modelId),
    [
      "doubao-seed-audio-1-0",
      "seedance-2-mini",
      "kling-3.0",
      "seedance-2",
      "gemini-omni-flash-preview",
      "nano-banana-lite",
    ],
  );
});

test("captures the current extended modes", async () => {
  const { modelHubModels } = await loadInventory();
  const byId = Object.fromEntries(modelHubModels.map((model) => [model.modelId, model]));

  assert.deepEqual(byId["doubao-seed-audio-1-0"].modes, [
    "text-to-audio",
    "audio-to-audio",
    "image-to-audio",
  ]);
  assert.deepEqual(byId["seedance-2-mini"].modes, [
    "text-to-video",
    "image-to-video",
    "first-last-frame-to-video",
    "multi-modal-reference",
  ]);
  assert.deepEqual(byId["kling-3.0"].modes, [
    "text-to-video",
    "image-to-video",
    "first-last-frame-to-video",
    "multi-shot-video",
  ]);
});

test("uses only existing fallback routes", async () => {
  const { modelHubModels } = await loadInventory();
  const allowedFallbacks = new Set([
    "/capabilities",
    "/capabilities/image-generation",
    "/capabilities/video-generation",
    "/capabilities/music-generation",
  ]);

  for (const model of modelHubModels) {
    assert.equal(model.href.startsWith("/models/") || allowedFallbacks.has(model.href), true, model.modelId);
  }

  const byId = Object.fromEntries(modelHubModels.map((model) => [model.modelId, model]));
  assert.equal(byId["nano-banana-lite"].href, "/capabilities/image-generation");
  assert.equal(byId["kling-3.0-omni"].href, "/capabilities/video-generation");
  assert.equal(byId["seedance-2-mini"].href, "/capabilities/video-generation");
  assert.equal(byId["doubao-seed-audio-1-0"].href, "/capabilities");
});
```

- [ ] **Step 2: Run the test and verify the intentional failure**

Run:

```bash
cd web && node --test ./scripts/model-hub.test.mjs
```

Expected: FAIL with `model hub inventory must exist` because `src/lib/model-hub.ts` has not been created.

- [ ] **Step 3: Create the typed inventory and sort helper**

Create `web/src/lib/model-hub.ts` with this interface and helper:

```ts
export type ModelHubCapability = "image" | "video" | "music" | "audio";

export type ModelHubModel = {
  modelId: string;
  model: string;
  capability: ModelHubCapability;
  modes: string[];
  credits: string;
  updatedAt: string;
  href: string;
  bestFor: string;
};

export function sortModelHubModels<T extends Pick<ModelHubModel, "model" | "updatedAt">>(
  models: readonly T[],
): T[] {
  return [...models].sort(
    (left, right) =>
      right.updatedAt.localeCompare(left.updatedAt) || left.model.localeCompare(right.model),
  );
}

export function getModelHubModels(capability: ModelHubCapability): ModelHubModel[] {
  return sortModelHubModels(modelHubModels.filter((model) => model.capability === capability));
}
```

Define `modelHubModels` with these exact records and dates. Keep the shown modes and safe links verbatim:

```ts
export const modelHubModels: readonly ModelHubModel[] = [
  { modelId: "nano-banana-lite", model: "Nano Banana 2 Lite", capability: "image", modes: ["text-to-image", "image-to-image"], credits: "varies", updatedAt: "2026-07-04", href: "/capabilities/image-generation", bestFor: "Fast, cost-efficient drafts, variants, and high-volume visual iteration." },
  { modelId: "flux-kontext-max", model: "FLUX.1 Kontext Max", capability: "image", modes: ["text-to-image", "image-to-image"], credits: "varies", updatedAt: "2026-05-12", href: "/models/flux-kontext-max", bestFor: "Design-heavy generation and contextual edits with strong creative control." },
  { modelId: "gpt-image-2", model: "GPT Image 2", capability: "image", modes: ["text-to-image", "image-to-image"], credits: "varies", updatedAt: "2026-05-12", href: "/models/gpt-image-2", bestFor: "General-purpose image generation and prompt-driven edits." },
  { modelId: "qwen-image", model: "Qwen Image", capability: "image", modes: ["text-to-image", "image-to-image"], credits: "varies", updatedAt: "2026-05-12", href: "/models/qwen-image", bestFor: "Bilingual and instruction-heavy visual generation and editing." },
  { modelId: "nano-banana-2", model: "Nano Banana 2", capability: "image", modes: ["text-to-image", "image-to-image"], credits: "~4", updatedAt: "2026-03-30", href: "/models/nano-banana-2", bestFor: "Fast, scalable image generation and high-volume iteration." },
  { modelId: "nano-banana-pro", model: "Nano Banana Pro", capability: "image", modes: ["text-to-image", "image-to-image"], credits: "~7", updatedAt: "2026-03-30", href: "/models/nano-banana-pro", bestFor: "Higher-fidelity revision loops and commercial image edits." },
  { modelId: "seedream-4.5", model: "Seedream 4.5", capability: "image", modes: ["text-to-image", "image-to-image"], credits: "varies", updatedAt: "2026-03-30", href: "/models/seedream-4-5", bestFor: "Stable everyday image generation, transformation, and refinement." },
  { modelId: "seedream-5", model: "Seedream 5", capability: "image", modes: ["text-to-image", "image-to-image"], credits: "~2", updatedAt: "2026-03-30", href: "/models/seedream-5", bestFor: "Polished first-pass generation and controlled visual refinement." },

  { modelId: "seedance-2-mini", model: "Seedance 2.0 Mini", capability: "video", modes: ["text-to-video", "image-to-video", "first-last-frame-to-video", "multi-modal-reference"], credits: "varies", updatedAt: "2026-07-18", href: "/capabilities/video-generation", bestFor: "Efficient video drafts with text, image, first/last-frame, or multimodal references." },
  { modelId: "kling-3.0", model: "Kling 3.0", capability: "video", modes: ["text-to-video", "image-to-video", "first-last-frame-to-video", "multi-shot-video"], credits: "~9", updatedAt: "2026-07-14", href: "/models/kling-3-0", bestFor: "Cinematic motion, first/last-frame transitions, and multi-shot video workflows." },
  { modelId: "seedance-2", model: "Seedance 2.0", capability: "video", modes: ["text-to-video", "image-to-video", "first-last-frame-to-video", "multi-modal-reference"], credits: "varies", updatedAt: "2026-07-14", href: "/models/seedance-2", bestFor: "High-quality video with first/last-frame and multimodal-reference control." },
  { modelId: "gemini-omni-flash-preview", model: "Gemini Omni Flash Preview", capability: "video", modes: ["edit-video"], credits: "varies", updatedAt: "2026-07-04", href: "/models/gemini-omni-flash-preview", bestFor: "Natural-language editing and refinement of existing footage." },
  { modelId: "seedance-2-fast", model: "Seedance 2.0 Fast", capability: "video", modes: ["text-to-video", "image-to-video", "multi-modal-reference"], credits: "varies", updatedAt: "2026-06-25", href: "/models/seedance-2-fast", bestFor: "Fast previews and multimodal-reference video iteration." },
  { modelId: "kling-3.0-omni", model: "Kling 3.0 Omni", capability: "video", modes: ["text-to-video", "image-to-video", "multi-shot-video"], credits: "varies", updatedAt: "2026-06-24", href: "/capabilities/video-generation", bestFor: "Flexible text, image, and multi-shot video generation." },
  { modelId: "hailuo-2.3", model: "Hailuo 2.3", capability: "video", modes: ["text-to-video", "image-to-video"], credits: "varies", updatedAt: "2026-05-12", href: "/models/hailuo-2-3", bestFor: "Short narrative clips, character motion, and reference-image animation." },
  { modelId: "kling-o1", model: "Kling O1", capability: "video", modes: ["image-to-video"], credits: "varies", updatedAt: "2026-05-12", href: "/models/kling-o1", bestFor: "Animating a source image when the reference frame should drive the clip." },
  { modelId: "seedance-1.5-pro", model: "Seedance 1.5 Pro", capability: "video", modes: ["text-to-video", "image-to-video"], credits: "~14", updatedAt: "2026-05-12", href: "/models/seedance-1-5-pro", bestFor: "Repeatable production-friendly text-to-video and image-to-video work." },
  { modelId: "sora-2-pro", model: "Sora 2 Pro", capability: "video", modes: ["text-to-video", "image-to-video"], credits: "varies", updatedAt: "2026-05-12", href: "/models/sora-2-pro", bestFor: "High-end narrative, cinematic, and realistic video generation." },
  { modelId: "veo-3.1", model: "Veo 3.1", capability: "video", modes: ["text-to-video", "image-to-video"], credits: "~20", updatedAt: "2026-05-12", href: "/models/veo-3-1", bestFor: "Premium story-driven video when the first pass needs strong polish." },
  { modelId: "veo-3.1-fast", model: "Veo 3.1 Fast", capability: "video", modes: ["text-to-video", "image-to-video"], credits: "varies", updatedAt: "2026-05-12", href: "/models/veo-3-1-fast", bestFor: "Faster Veo-family previews and creative iteration." },

  { modelId: "mureka-v8", model: "Mureka V8", capability: "music", modes: ["text-to-music"], credits: "varies", updatedAt: "2026-05-12", href: "/models/mureka-v8", bestFor: "Vocal-oriented songwriting and instrumental composition." },
  { modelId: "suno-v5.5", model: "Suno V5.5", capability: "music", modes: ["text-to-music"], credits: "varies", updatedAt: "2026-05-12", href: "/models/suno-v5-5", bestFor: "Current Suno track drafts, vocal concepts, and song iteration." },
  { modelId: "elevanlabs-music", model: "ElevenLabs Music", capability: "music", modes: ["text-to-music"], credits: "~1", updatedAt: "2026-03-30", href: "/models/elevenlabs-music", bestFor: "Prompt-based background tracks and soundtrack drafts." },
  { modelId: "suno-v5", model: "Suno V5", capability: "music", modes: ["text-to-music"], credits: "varies", updatedAt: "2026-03-30", href: "/models/suno-v5", bestFor: "Structured song and vocal-demo concepts from prompts." },

  { modelId: "doubao-seed-audio-1-0", model: "Doubao Seed Audio 1.0", capability: "audio", modes: ["text-to-audio", "audio-to-audio", "image-to-audio"], credits: "varies", updatedAt: "2026-07-18", href: "/capabilities", bestFor: "Speech, dialogue, sound effects, and complete audio scenes from text, audio, or image input." },
] as const;
```

- [ ] **Step 4: Derive the shared comparison groups from the inventory**

In `web/src/lib/capability-inventory.ts`, import and re-export the new model type:

```ts
import {
  getModelHubModels,
  type ModelHubModel,
} from "@/lib/model-hub";

export type GenerationModel = ModelHubModel;
```

Replace the four model arrays in `pricingGenerationGroups` with:

```ts
models: getModelHubModels("image"),
models: getModelHubModels("video"),
models: getModelHubModels("music"),
models: getModelHubModels("audio"),
```

Add this fourth group after Music generation:

```ts
{
  title: "Audio generation",
  description: "Charged per successful generated output from text, audio, or image input.",
  unitLabel: "/call",
  headers: ["Model", "Modes", "Credits / call"],
  models: getModelHubModels("audio"),
},
```

- [ ] **Step 5: Wire the focused test into web scripts**

Add to `web/package.json`:

```json
"check:model-hub": "node --test ./scripts/model-hub.test.mjs"
```

Do not add `check:model-hub` to `build` or `build:cf` until Task 2 creates the page contract test.

- [ ] **Step 6: Run the focused inventory test and type check**

Run:

```bash
cd web && node --test ./scripts/model-hub.test.mjs
cd web && pnpm exec tsc --noEmit
```

Expected: both commands PASS with no TypeScript errors.

- [ ] **Step 7: Commit the inventory slice**

```bash
git add web/src/lib/model-hub.ts web/src/lib/capability-inventory.ts web/scripts/model-hub.test.mjs web/package.json
git commit -m "feat(web): centralize current model hub inventory"
```

### Task 2: Render recent additions and the complete current comparison

**Files:**
- Create: `web/scripts/models-hub-page.test.mjs`
- Modify: `web/src/app/(seo)/models/page.tsx:1-1048`
- Modify: `web/package.json:5-21`

**Interfaces:**
- Consumes: `GenerationModel.updatedAt`, `.href`, `.bestFor`, `.capability`, and `sortModelHubModels()` from Task 1.
- Produces: a localized latest-additions section and newest-first four-capability comparison on `/models`.

- [ ] **Step 1: Write the failing page contract test**

Create `web/scripts/models-hub-page.test.mjs`:

```js
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { fileURLToPath } from "node:url";

const pagePath = fileURLToPath(new URL("../src/app/(seo)/models/page.tsx", import.meta.url));
const pageSource = readFileSync(pagePath, "utf8");

test("marks the models hub as updated on July 19, 2026", () => {
  assert.match(pageSource, /const lastUpdatedIso = "2026-07-19"/);
  for (const label of ["July 19, 2026", "19 de julho de 2026", "19 Juli 2026", "19. Juli 2026"]) {
    assert.equal(pageSource.includes(label), true, label);
  }
});

test("provides localized latest-additions copy", () => {
  for (const label of ["Latest additions", "Adições mais recentes", "Pembaruan terbaru", "Neueste Ergänzungen"]) {
    assert.equal(pageSource.includes(label), true, label);
  }
});

test("renders recency from the shared model inventory", () => {
  assert.match(pageSource, /sortModelHubModels/);
  assert.match(pageSource, /model\.updatedAt/);
  assert.match(pageSource, /model\.href/);
  assert.match(pageSource, /model\.bestFor/);
});

test("localizes the audio generation comparison group", () => {
  for (const label of ["Audio generation", "Geração de áudio", "Pembuatan audio", "Audiogenerierung"]) {
    assert.equal(pageSource.includes(label), true, label);
  }
});
```

- [ ] **Step 2: Run the page contract and verify the intentional failure**

Run:

```bash
cd web && node --test ./scripts/models-hub-page.test.mjs
```

Expected: FAIL because the page still contains `2026-04-05` and has no latest-additions copy.

- [ ] **Step 3: Add the recency interfaces and localized labels**

In `web/src/app/(seo)/models/page.tsx`, import the helper and extend `PageContent`:

```ts
import { sortModelHubModels } from "@/lib/model-hub";

const lastUpdatedIso = "2026-07-19";

type PageContent = {
  // existing fields stay unchanged
  latestTitle: string;
  latestIntro: string;
  updatedLabel: string;
};
```

Add these exact localized values to the four page-content objects:

```ts
// en
lastUpdatedLabel: "July 19, 2026",
latestTitle: "Latest additions",
latestIntro: "The newest AnyCap model additions and material capability updates, ordered by when they became usable through AnyCap.",
updatedLabel: "Updated",

// pt-br
lastUpdatedLabel: "19 de julho de 2026",
latestTitle: "Adições mais recentes",
latestIntro: "As adições mais recentes ao catálogo AnyCap e as atualizações materiais de capability, ordenadas pela data em que passaram a ser utilizáveis pelo AnyCap.",
updatedLabel: "Atualizado",

// id
lastUpdatedLabel: "19 Juli 2026",
latestTitle: "Pembaruan terbaru",
latestIntro: "Model AnyCap terbaru dan pembaruan kapabilitas yang penting, diurutkan berdasarkan waktu mulai dapat digunakan melalui AnyCap.",
updatedLabel: "Diperbarui",

// de
lastUpdatedLabel: "19. Juli 2026",
latestTitle: "Neueste Ergänzungen",
latestIntro: "Die neuesten AnyCap-Modelle und wesentlichen Capability-Updates, sortiert nach ihrer tatsächlichen Verfügbarkeit über AnyCap.",
updatedLabel: "Aktualisiert",
```

Use these exact summary and visual-guide replacements so all four locales name
the current capability surface without claiming that audio generation has a
dedicated detail page:

```ts
// en
summaryBody:
  "The current public AnyCap generation catalog spans image, video, music, and audio. Recent additions include Doubao Seed Audio 1.0 and Seedance 2.0 Mini, while Kling 3.0 and Seedance 2.0 now expose additional control modes. Choose by output type, input and reference requirements, first-pass quality, iteration speed, and the live model schema.",
visualGuideBody:
  "This illustration remains a quick map of the catalog's media lanes. The live hub below now covers image, video, music, and audio generation, with the newest AnyCap additions shown before the full capability comparison.",

// pt-br
summaryBody:
  "O catálogo público atual de geração do AnyCap cobre imagem, vídeo, música e áudio. As adições recentes incluem Doubao Seed Audio 1.0 e Seedance 2.0 Mini, enquanto Kling 3.0 e Seedance 2.0 agora expõem modos adicionais de controle. Escolha pelo tipo de saída, requisitos de entrada e referência, qualidade da primeira versão, velocidade de iteração e schema atual do modelo.",
visualGuideBody:
  "Esta ilustração continua sendo um mapa rápido das trilhas de mídia do catálogo. O hub abaixo agora cobre geração de imagem, vídeo, música e áudio, com as adições mais recentes do AnyCap antes da comparação completa por capability.",

// id
summaryBody:
  "Katalog generasi publik AnyCap saat ini mencakup gambar, video, musik, dan audio. Penambahan terbaru termasuk Doubao Seed Audio 1.0 dan Seedance 2.0 Mini, sementara Kling 3.0 dan Seedance 2.0 kini menyediakan mode kontrol tambahan. Pilih berdasarkan jenis output, kebutuhan input dan referensi, kualitas hasil awal, kecepatan iterasi, dan schema model langsung.",
visualGuideBody:
  "Ilustrasi ini tetap menjadi peta singkat jalur media dalam katalog. Hub di bawah kini mencakup generasi gambar, video, musik, dan audio, dengan penambahan AnyCap terbaru sebelum perbandingan kapabilitas lengkap.",

// de
summaryBody:
  "Der aktuelle öffentliche AnyCap-Generierungskatalog umfasst Bild, Video, Musik und Audio. Zu den neuesten Ergänzungen gehören Doubao Seed Audio 1.0 und Seedance 2.0 Mini; Kling 3.0 und Seedance 2.0 bieten inzwischen zusätzliche Steuerungsmodi. Entscheidend sind Ausgabetyp, Eingabe- und Referenzanforderungen, Qualität des ersten Ergebnisses, Iterationsgeschwindigkeit und das aktuelle Modellschema.",
visualGuideBody:
  "Die Illustration bleibt eine schnelle Karte der Medienbereiche im Katalog. Der Hub darunter umfasst jetzt Bild-, Video-, Musik- und Audiogenerierung und zeigt die neuesten AnyCap-Ergänzungen vor dem vollständigen Capability-Vergleich.",
```

Extend each locale's existing `guideLookup` with localized best-fit text and
safe links for every newly visible model that lacks complete localized hub
guidance:

```ts
// guideLookupEn
"Nano Banana 2 Lite": { href: "/capabilities/image-generation", bestFor: "Fast, cost-efficient drafts, variants, and high-volume visual iteration." },
"Kling 3.0 Omni": { href: "/capabilities/video-generation", bestFor: "Flexible text, image, and multi-shot video generation." },
"Seedance 2.0": { href: "/models/seedance-2", bestFor: "High-quality video with first/last-frame and multimodal-reference control." },
"Seedance 2.0 Mini": { href: "/capabilities/video-generation", bestFor: "Efficient video drafts with text, image, first/last-frame, or multimodal references." },
"Gemini Omni Flash Preview": { href: "/models/gemini-omni-flash-preview", bestFor: "Natural-language editing and refinement of existing footage." },
"Doubao Seed Audio 1.0": { href: "/capabilities", bestFor: "Speech, dialogue, sound effects, and complete audio scenes from text, audio, or image input." },

// guideLookupPtBr
"Nano Banana 2 Lite": { href: "/capabilities/image-generation", bestFor: "Rascunhos rápidos e econômicos, variantes e iteração visual em alto volume." },
"Kling 3.0 Omni": { href: "/capabilities/video-generation", bestFor: "Geração flexível de vídeo por texto, imagem e múltiplas tomadas." },
"Seedance 2.0": { href: "/models/seedance-2", bestFor: "Vídeo de alta qualidade com controle por quadro inicial e final e referências multimodais." },
"Seedance 2.0 Mini": { href: "/capabilities/video-generation", bestFor: "Rascunhos eficientes de vídeo com texto, imagem, quadros inicial e final ou referências multimodais." },
"Gemini Omni Flash Preview": { href: "/models/gemini-omni-flash-preview", bestFor: "Edição e refinamento de vídeos existentes com linguagem natural." },
"Doubao Seed Audio 1.0": { href: "/capabilities", bestFor: "Fala, diálogo, efeitos sonoros e cenas de áudio completas a partir de texto, áudio ou imagem." },

// guideLookupId
"Nano Banana 2 Lite": { href: "/capabilities/image-generation", bestFor: "Draft cepat dan hemat biaya, varian, serta iterasi visual bervolume tinggi." },
"Kling 3.0 Omni": { href: "/capabilities/video-generation", bestFor: "Generasi video fleksibel dari teks, gambar, dan beberapa shot." },
"Seedance 2.0": { href: "/models/seedance-2", bestFor: "Video berkualitas tinggi dengan kontrol frame awal-akhir dan referensi multimodal." },
"Seedance 2.0 Mini": { href: "/capabilities/video-generation", bestFor: "Draft video efisien dengan teks, gambar, frame awal-akhir, atau referensi multimodal." },
"Gemini Omni Flash Preview": { href: "/models/gemini-omni-flash-preview", bestFor: "Pengeditan dan penyempurnaan footage yang ada dengan bahasa natural." },
"Doubao Seed Audio 1.0": { href: "/capabilities", bestFor: "Ucapan, dialog, efek suara, dan adegan audio lengkap dari input teks, audio, atau gambar." },

// guideLookupDe
"Nano Banana 2 Lite": { href: "/capabilities/image-generation", bestFor: "Schnelle, kosteneffiziente Entwürfe, Varianten und visuelle Iteration in hohem Volumen." },
"Kling 3.0 Omni": { href: "/capabilities/video-generation", bestFor: "Flexible Videogenerierung aus Text, Bild und mehreren Einstellungen." },
"Seedance 2.0": { href: "/models/seedance-2", bestFor: "Hochwertige Videos mit Start-/Endbild- und multimodaler Referenzsteuerung." },
"Seedance 2.0 Mini": { href: "/capabilities/video-generation", bestFor: "Effiziente Videoentwürfe aus Text, Bild, Start-/Endbild oder multimodalen Referenzen." },
"Gemini Omni Flash Preview": { href: "/models/gemini-omni-flash-preview", bestFor: "Natürlichsprachige Bearbeitung und Verfeinerung bestehenden Videomaterials." },
"Doubao Seed Audio 1.0": { href: "/capabilities", bestFor: "Sprache, Dialog, Soundeffekte und vollständige Audioszenen aus Text-, Audio- oder Bildeingaben." },
```

Append one current-catalog FAQ item per locale:

```ts
// en
{ question: "What are the newest model updates in AnyCap?", answer: "As of July 19, 2026, the newest additions are Doubao Seed Audio 1.0 and Seedance 2.0 Mini. Kling 3.0 and Seedance 2.0 also gained additional control modes. This hub orders updates by AnyCap availability or material capability change, not provider announcement date." },

// pt-br
{ question: "Quais são as atualizações de modelos mais recentes no AnyCap?", answer: "Em 19 de julho de 2026, as adições mais recentes são Doubao Seed Audio 1.0 e Seedance 2.0 Mini. Kling 3.0 e Seedance 2.0 também ganharam modos adicionais de controle. Este hub ordena as atualizações pela disponibilidade no AnyCap ou por mudanças materiais de capability, não pela data do anúncio do provedor." },

// id
{ question: "Apa pembaruan model terbaru di AnyCap?", answer: "Per 19 Juli 2026, penambahan terbaru adalah Doubao Seed Audio 1.0 dan Seedance 2.0 Mini. Kling 3.0 dan Seedance 2.0 juga mendapatkan mode kontrol tambahan. Hub ini mengurutkan pembaruan berdasarkan ketersediaan di AnyCap atau perubahan kapabilitas yang penting, bukan tanggal pengumuman penyedia." },

// de
{ question: "Welche Modell-Updates sind in AnyCap am neuesten?", answer: "Am 19. Juli 2026 sind Doubao Seed Audio 1.0 und Seedance 2.0 Mini die neuesten Ergänzungen. Kling 3.0 und Seedance 2.0 haben außerdem zusätzliche Steuerungsmodi erhalten. Der Hub sortiert nach AnyCap-Verfügbarkeit oder wesentlichen Capability-Änderungen, nicht nach dem Ankündigungsdatum des Anbieters." },
```

- [ ] **Step 4: Localize the new audio comparison group**

Refactor `localizePricingGroups()` so it branches on all four English source titles. Add these localized Audio generation values:

```ts
// pt-br
title: "Geração de áudio",
description: "Cobrado por saída gerada com sucesso a partir de texto, áudio ou imagem.",
headers: ["Modelo", "Modos", "Créditos / chamada"],

// id
title: "Pembuatan audio",
description: "Dikenakan biaya per output yang berhasil dibuat dari input teks, audio, atau gambar.",
headers: ["Model", "Mode", "Kredit / panggilan"],

// de
title: "Audiogenerierung",
description: "Abrechnung pro erfolgreich generierter Ausgabe aus Text-, Audio- oder Bildeingaben.",
headers: ["Modell", "Modi", "Credits / Aufruf"],
```

Preserve model IDs and mode strings exactly; do not translate the new audio mode identifiers.

- [ ] **Step 5: Derive and render the latest six updates**

Inside the page component, after locale selection, derive the latest records from the same groups rendered by the comparison:

```ts
const latestModels = sortModelHubModels(
  content.pricingGroups.flatMap((group) =>
    group.models.map((model) => ({ ...model, capabilityLabel: group.title })),
  ),
)
  .slice(0, 6)
  .map((model) => ({
    ...model,
    ...(content.guideLookup[model.model] ?? {}),
  }));

const dateLocaleBySiteLocale: Record<SiteLocale, string> = {
  en: "en-US",
  "pt-br": "pt-BR",
  id: "id-ID",
  de: "de-DE",
};
```

Render this section immediately before `content.comparisonTitle`:

```tsx
<FadeIn>
  <section className="mt-16 md:mt-24">
    <h2 className="text-lg md:text-xl text-[#1c1f17] mb-3" style={pixel}>
      {content.latestTitle}
    </h2>
    <p className="mb-8 max-w-[760px] text-sm leading-6 text-[#4d5145]">
      {content.latestIntro}
    </p>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {latestModels.map((model) => (
        <Link
          key={model.modelId}
          href={model.href}
          className="rounded-xl border border-[#d4dbb8] bg-[#f9faf5]/80 p-5 transition-colors hover:border-[#6b7d3a]"
        >
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-[15px] font-bold text-[#1c1f17]" style={mono}>{model.model}</h3>
            <span className="text-[10px] text-[#6b7d3a]" style={mono}>{model.capabilityLabel}</span>
          </div>
          <p className="mt-3 text-[11px] text-[#5a5e52]" style={mono}>
            {content.updatedLabel} {new Intl.DateTimeFormat(dateLocaleBySiteLocale[locale], { dateStyle: "medium", timeZone: "UTC" }).format(new Date(`${model.updatedAt}T00:00:00Z`))}
          </p>
          <p className="mt-3 text-sm leading-6 text-[#4d5145]">{model.bestFor}</p>
          <p className="mt-4 text-[11px] leading-5 text-[#5a5e52]" style={mono}>{model.modes.join(", ")}</p>
        </Link>
      ))}
    </div>
  </section>
</FadeIn>
```

Add a divider between this section and the comparison using the existing `mt-16 md:mt-24` and `border-[#d4dbb8]` pattern.

- [ ] **Step 6: Make comparison fallback information inventory-driven**

Replace the existing comparison fallback with:

```ts
const modelGuide = guide ?? {
  href: catalogModel?.path ?? model.href,
  bestFor: catalogModel?.bestFor ?? model.bestFor,
};
```

This ensures Nano Banana 2 Lite, Kling 3.0 Omni, Seedance 2.0 Mini, and Doubao Seed Audio 1.0 never link to missing detail pages and never reuse the entire page summary as their best-fit copy.

- [ ] **Step 7: Run focused tests and TypeScript validation**

Run:

```bash
cd web && node --test ./scripts/model-hub.test.mjs ./scripts/models-hub-page.test.mjs
cd web && pnpm exec tsc --noEmit
```

Expected: all tests PASS and TypeScript exits 0.

- [ ] **Step 8: Add the focused check to both build paths**

First expand the focused command now that the page test exists:

```json
"check:model-hub": "node --test ./scripts/model-hub.test.mjs ./scripts/models-hub-page.test.mjs"
```

Then update `web/package.json` so both build scripts run `pnpm run check:model-hub` after locale synchronization and before the other SEO checks:

```json
"build": "pnpm run sync:seo-locales && pnpm run check:model-hub && pnpm run check:edge-runtime && pnpm run check:seo-breadcrumbs && pnpm run check:seo-ia && pnpm run check:seo-locale-rollout && pnpm run check:seo-hub-locale-rollout && pnpm run generate:sitemap-lastmod && next build",
"build:cf": "pnpm run sync:seo-locales && pnpm run check:model-hub && pnpm run check:seo-breadcrumbs && pnpm run check:seo-ia && pnpm run check:seo-locale-rollout && pnpm run check:seo-hub-locale-rollout && pnpm run generate:sitemap-lastmod && node ./scripts/pages-build.mjs && pnpm run publish:indexnow"
```

- [ ] **Step 9: Commit the route slice**

```bash
git add 'web/src/app/(seo)/models/page.tsx' web/scripts/models-hub-page.test.mjs web/package.json
git commit -m "feat(web): refresh models hub by recency"
```

### Task 3: Align public discoverability and current-status documentation

**Files:**
- Modify: `web/scripts/models-hub-page.test.mjs`
- Modify: `web/public/llms.txt:49-57`
- Modify: `docs/anycap-current-status.md:1-2,340-350`

**Interfaces:**
- Consumes: the four-capability current hub from Tasks 1 and 2.
- Produces: consistent AI-crawler and current-product descriptions without adding nonexistent model detail links.

- [ ] **Step 1: Extend the contract test before changing public copy**

Append to `web/scripts/models-hub-page.test.mjs`:

```js
const llmsPath = fileURLToPath(new URL("../public/llms.txt", import.meta.url));
const llmsSource = readFileSync(llmsPath, "utf8");
const statusPath = fileURLToPath(new URL("../../docs/anycap-current-status.md", import.meta.url));
const statusSource = readFileSync(statusPath, "utf8");

test("keeps public model-hub descriptions aligned", () => {
  assert.match(llmsSource, /image, video, music, and audio generation models/);
  assert.match(statusSource, /> Last updated: 2026-07-19/);
  assert.match(statusSource, /Models hub.*newest-first/i);
});
```

- [ ] **Step 2: Run the focused test and verify it fails on stale copy**

Run:

```bash
cd web && node --test ./scripts/models-hub-page.test.mjs
```

Expected: FAIL because `llms.txt` and the current-status website section do not yet contain the new descriptions.

- [ ] **Step 3: Update `llms.txt` without inventing detail links**

Replace the Models overview line with:

```md
- [Models overview](https://anycap.ai/models): Current image, video, music, and audio generation models, with the newest AnyCap additions and capability updates shown first.
```

Keep the existing detail-page links below it unchanged. Do not add links for Nano Banana 2 Lite, Kling 3.0 Omni, Seedance 2.0 Mini, or Doubao Seed Audio 1.0 because this task does not create those routes.

- [ ] **Step 4: Update the current product status snapshot**

Set the document date to:

```md
> Last updated: 2026-07-19
```

Replace the Models row in the website section with:

```md
| Models | Newest-first models hub across image, video, music, and audio generation, plus existing model detail guides |
```

Add this sentence immediately below the SEO content table:

```md
The `/models` hub is sourced from the current web capability inventory, includes all production generation models verified on 2026-07-19, and orders both recent additions and capability tables by AnyCap availability or material capability-update date.
```

- [ ] **Step 5: Run the focused checks**

Run:

```bash
cd web && pnpm run check:model-hub
```

Expected: PASS.

- [ ] **Step 6: Commit the public-copy slice**

```bash
git add web/scripts/models-hub-page.test.mjs web/public/llms.txt docs/anycap-current-status.md
git commit -m "docs(web): align current models hub copy"
```

### Task 4: Run full verification and inspect the rendered hub

**Files:**
- Verify only; modify prior task files only if a focused failure identifies a real defect.

**Interfaces:**
- Consumes: all implementation slices.
- Produces: verified build output and rendered-page evidence.

- [ ] **Step 1: Run focused and SEO checks**

Run:

```bash
cd web && pnpm run check:model-hub
cd web && pnpm run check:edge-runtime
cd web && pnpm run check:seo-breadcrumbs
cd web && pnpm run check:seo-ia
cd web && pnpm run check:seo-locale-rollout
cd web && pnpm run check:seo-hub-locale-rollout
```

Expected: every command exits 0.

- [ ] **Step 2: Run the production build**

Run:

```bash
cd web && pnpm run build
```

Expected: Next.js build completes successfully; `/models` and localized models routes are generated without TypeScript, metadata, breadcrumb, or locale errors.

- [ ] **Step 3: Start a bounded local preview**

Run:

```bash
cd web && pnpm run dev
```

Expected: the server reports a local URL. Keep the session open only for inspection and terminate it afterward with Ctrl-C.

- [ ] **Step 4: Inspect default and localized rendering**

Open `/models` and `/de/models` at desktop and mobile widths. Confirm:

- the visible date is July 19, 2026 in each locale;
- Latest additions appears before Current model comparison;
- Doubao Seed Audio 1.0 and Seedance 2.0 Mini are first;
- all four capability tables render newest first;
- long multimodal mode strings wrap without horizontal page overflow;
- audio rows link to `/capabilities`, not a nonexistent audio-generation route;
- existing model-detail links still resolve;
- the current olive/sage design, border rhythm, and typography remain unchanged.

- [ ] **Step 5: Verify repository cleanliness and diff scope**

Run:

```bash
git status --short
git diff --check HEAD~3..HEAD
```

Expected: no uncommitted files, no whitespace errors, and only the plan-approved web inventory, models hub, tests, `llms.txt`, and current-status files changed after the plan commit.

- [ ] **Step 6: Record final verification commit only if fixes were needed**

If Step 1-5 required code fixes, stage only those exact files and commit:

```bash
git add web/src/lib/model-hub.ts web/src/lib/capability-inventory.ts 'web/src/app/(seo)/models/page.tsx' web/scripts/model-hub.test.mjs web/scripts/models-hub-page.test.mjs web/package.json web/public/llms.txt docs/anycap-current-status.md
git commit -m "fix(web): complete models hub verification"
```

If no fixes were needed, do not create an empty commit.
