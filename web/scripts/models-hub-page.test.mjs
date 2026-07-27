import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { fileURLToPath } from "node:url";

const pagePath = fileURLToPath(new URL("../src/app/(seo)/models/page.tsx", import.meta.url));
const pageSource = readFileSync(pagePath, "utf8");
const metadataPath = fileURLToPath(new URL("../src/app/(seo)/models/metadata.ts", import.meta.url));
const metadataSource = readFileSync(metadataPath, "utf8");
const llmsPath = fileURLToPath(new URL("../public/llms.txt", import.meta.url));
const llmsSource = readFileSync(llmsPath, "utf8");
const statusPath = fileURLToPath(new URL("../../docs/anycap-current-status.md", import.meta.url));
const statusSource = readFileSync(statusPath, "utf8");

function sourceBlock(source, startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  assert.notEqual(start, -1, `missing start marker: ${startMarker}`);
  const end = source.indexOf(endMarker, start + startMarker.length);
  assert.notEqual(end, -1, `missing end marker: ${endMarker}`);
  return source.slice(start, end);
}

test("marks the models hub as updated on July 19, 2026", () => {
  assert.match(pageSource, /const lastUpdatedIso = "2026-07-19"/);
  for (const label of ["July 19, 2026", "19 de julho de 2026", "19 Juli 2026", "19. Juli 2026"]) {
    assert.equal(pageSource.includes(label), true, label);
  }
});

test("keeps localized metadata descriptions aligned with audio-capable model coverage", () => {
  const expectedByLocale = [
    [
      "en",
      "  en: {",
      '  "pt-br": {',
      "Multimodal models available through AnyCap for AI agent workflows, including active image, video, music, and audio models with CLI IDs, modes, and workflow guidance.",
    ],
    [
      "pt-br",
      '  "pt-br": {',
      "  id: {",
      "Modelos multimodais disponíveis no AnyCap para fluxos de agentes de IA, incluindo modelos ativos de imagem, vídeo, música e áudio, com IDs de CLI, modos e orientação de fluxo.",
    ],
    [
      "id",
      "  id: {",
      "  de: {",
      "Model multimodal yang tersedia melalui AnyCap untuk alur kerja agen AI, termasuk model gambar, video, musik, dan audio aktif, dengan ID CLI, mode, dan panduan alur kerja.",
    ],
    [
      "de",
      "  de: {",
      "};\n\nexport function getModelsMetadata",
      "Multimodale Modelle über AnyCap für KI-Agenten-Workflows, einschließlich aktiver Bild-, Video-, Musik- und Audiomodelle mit CLI-IDs, Modi und Workflow-Anleitung.",
    ],
  ];

  for (const [locale, startMarker, endMarker, description] of expectedByLocale) {
    const localeBlock = sourceBlock(metadataSource, startMarker, endMarker);
    assert.equal(localeBlock.includes(description), true, `${locale}: ${description}`);
  }
  assert.match(metadataSource, /description: meta\.description/);
});

test("keeps each localized TechArticle schema explicit about audio generation", () => {
  const expectedByLocale = [
    [
      "en",
      "const contentByLocale: Record<SiteLocale, PageContent> = {\n  en: {",
      '  "pt-br": {',
      "Comparison hub for the multimodal models available through AnyCap, including image, video, music, and audio models, with workflow guidance and current credit ranges.",
      "Audio generation",
      "audio generation models",
    ],
    [
      "pt-br",
      '  "pt-br": {',
      "  id: undefined as never,",
      "Hub de comparação para os modelos multimodais disponíveis no AnyCap, incluindo modelos de imagem, vídeo, música e áudio, com orientação de fluxo e faixas atuais de crédito.",
      "Geração de áudio",
      "modelos de geração de áudio",
    ],
    [
      "id",
      "contentByLocale.id = {",
      "contentByLocale.de = {",
      "Hub perbandingan untuk model multimodal yang tersedia melalui AnyCap, termasuk model gambar, video, musik, dan audio, dengan panduan alur kerja dan rentang kredit saat ini.",
      "Pembuatan audio",
      "model pembuatan audio",
    ],
    [
      "de",
      "contentByLocale.de = {",
      "export const metadata: Metadata",
      "Vergleichshub für die multimodalen Modelle, die über AnyCap verfügbar sind, einschließlich Bild-, Video-, Musik- und Audiomodelle, mit Workflow-Anleitung und aktuellen Credit-Bereichen.",
      "Audiogenerierung",
      "audiogenerierungsmodelle",
    ],
  ];

  for (const [locale, startMarker, endMarker, description, about, keyword] of expectedByLocale) {
    const localeBlock = sourceBlock(pageSource, startMarker, endMarker);
    assert.equal(localeBlock.includes(description), true, `${locale}: ${description}`);
    assert.equal(localeBlock.includes(`\"${about}\"`), true, `${locale}: ${about}`);
    assert.equal(localeBlock.includes(`\"${keyword}\"`), true, `${locale}: ${keyword}`);
  }
});

test("preserves the original publication date while recording the current modification date", () => {
  assert.equal(pageSource.includes('const publishedIso = "2026-04-05"'), true, "publishedIso");
  assert.equal(pageSource.includes('const lastUpdatedIso = "2026-07-19"'), true, "lastUpdatedIso");
  assert.equal((pageSource.match(/datePublished: publishedIso/g) ?? []).length, 4);
  assert.equal((pageSource.match(/dateModified: lastUpdatedIso/g) ?? []).length, 4);
});

test("renders latest additions before the current model comparison", () => {
  const latestIndex = pageSource.indexOf("{content.latestTitle}");
  const comparisonIndex = pageSource.indexOf("{content.comparisonTitle}");
  assert.notEqual(latestIndex, -1);
  assert.notEqual(comparisonIndex, -1);
  assert.ok(latestIndex < comparisonIndex);
});

test("provides localized latest-additions copy", () => {
  for (const label of ["Latest additions", "Adições mais recentes", "Pembaruan terbaru", "Neueste Ergänzungen"]) {
    assert.equal(pageSource.includes(label), true, label);
  }
});

test("includes audio in the first model-selection step for every locale", () => {
  for (const label of [
    "Start with the output type: image, video, music, or audio.",
    "Comece pelo tipo de saída: imagem, vídeo, música ou áudio.",
    "Mulai dari jenis output: gambar, video, musik, atau audio.",
    "Beginnen Sie mit dem Output-Typ: Bild, Video, Musik oder Audio.",
  ]) {
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

test("explicitly localizes music and preserves unknown comparison groups", () => {
  assert.equal((pageSource.match(/group\.title === "Music generation"/g) ?? []).length, 3);
  assert.match(pageSource, /return group;/);
});

test("keeps public model-hub descriptions aligned", () => {
  assert.match(
    llmsSource,
    /- \[Models overview\]\(https:\/\/anycap\.ai\/models\): Current image, video, music, and audio generation models, with the newest AnyCap additions and capability updates shown first\./,
  );
  assert.match(
    statusSource,
    /\| Models \| Newest-first models hub across image, video, music, and audio generation, plus existing model detail guides \|/,
  );
  assert.match(
    statusSource,
    /The `\/models` hub is sourced from the current web capability inventory, includes all production generation models verified on 2026-07-19, and orders both recent additions and capability tables by AnyCap availability or material capability-update date\./,
  );
  for (const path of [
    "/models/nano-banana-2-lite",
    "/models/kling-3-0-omni",
    "/models/seedance-2-0-mini",
    "/models/doubao-seed-audio-1-0",
  ]) {
    assert.equal(llmsSource.includes(path), false, path);
  }
});
