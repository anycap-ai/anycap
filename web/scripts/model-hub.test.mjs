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
