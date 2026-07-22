import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { fileURLToPath } from "node:url";

async function loadInventory() {
  try {
    return await import("../src/lib/model-hub.ts");
  } catch (error) {
    assert.fail(`model hub inventory must exist: ${error.message}`);
  }
}

const navigationPath = fileURLToPath(new URL("../src/lib/seo-navigation.ts", import.meta.url));
const navigationSource = readFileSync(navigationPath, "utf8");
const capabilitiesContentPath = fileURLToPath(
  new URL("../src/app/(seo)/capabilities/content.ts", import.meta.url),
);
const capabilitiesContentSource = readFileSync(capabilitiesContentPath, "utf8");

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

test("places audio generation after music with a safe capability fallback", () => {
  const musicIndex = navigationSource.indexOf('label: "Music Generation"');
  const audioIndex = navigationSource.indexOf('label: "Audio Generation"');
  const understandingIndex = navigationSource.indexOf('label: "Image Understanding"');

  assert.notEqual(musicIndex, -1);
  assert.equal(audioIndex > musicIndex, true, "Audio Generation must follow Music Generation");
  assert.equal(
    understandingIndex > audioIndex,
    true,
    "Audio Generation must remain inside the Generate section",
  );
  const audioBlock = navigationSource.slice(
    navigationSource.lastIndexOf("{", audioIndex),
    understandingIndex,
  );
  assert.match(audioBlock, /href: "\/capabilities"/);
  assert.match(audioBlock, /label: "Audio Generation"/);
  assert.match(audioBlock, /icon: "audio-generation"/);
  assert.match(audioBlock, /section: "Generate"/);
  assert.match(
    audioBlock,
    /description:\s*"Generate speech, dialogue, sound effects, and complete audio scenes from text, audio, or image input\."/,
  );
});

test("marks audio generation as available in the public capability inventory", () => {
  assert.match(capabilitiesContentSource, /audioGeneration: "Audio Generation"/);
  assert.match(
    capabilitiesContentSource,
    /audioGeneration:\s*"Generate speech, dialogue, sound effects, and complete audio scenes from text, audio, or image input\."/,
  );
  assert.match(
    capabilitiesContentSource,
    /name: n\.audioGeneration, category: "Audio", status: "available", description: d\.audioGeneration, models: "Doubao Seed Audio 1\.0", href: "\/models"/,
  );
  assert.doesNotMatch(capabilitiesContentSource, /n\.speech, category: "Audio", status: "coming_soon"/);
});
