import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { fileURLToPath } from "node:url";

const pagePath = fileURLToPath(new URL("../src/app/(seo)/models/page.tsx", import.meta.url));
const pageSource = readFileSync(pagePath, "utf8");
const llmsPath = fileURLToPath(new URL("../public/llms.txt", import.meta.url));
const llmsSource = readFileSync(llmsPath, "utf8");
const statusPath = fileURLToPath(new URL("../../docs/anycap-current-status.md", import.meta.url));
const statusSource = readFileSync(statusPath, "utf8");

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
  assert.match(statusSource, /> Last updated: 2026-07-19/);
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
