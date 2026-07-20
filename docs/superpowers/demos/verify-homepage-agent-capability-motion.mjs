import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const directory = fileURLToPath(new URL(".", import.meta.url));
const sourcePath = `${directory}/homepage-agent-capability-motion.source.html`;
const planPath = `${directory}/../plans/2026-07-20-homepage-dense-particle-clusters.md`;
const modelHubPath = `${directory}/../../../web/src/lib/model-hub.ts`;
const builtPath = process.argv[2];
const pixelFontReference = "vendor/geist-pixel-square.woff2";
const interFontReference = "vendor/inter-latin.woff2";

assert.ok(builtPath, "pass the absolute built companion path");

const builtDirectory = dirname(builtPath);
const [source, built, plan, modelHub, gsapRuntime, scrollTriggerRuntime, pixelFont, interFont] = await Promise.all([
  readFile(sourcePath, "utf8"),
  readFile(builtPath, "utf8"),
  readFile(planPath, "utf8"),
  readFile(modelHubPath, "utf8"),
  readFile(`${builtDirectory}/vendor/gsap.min.js`, "utf8"),
  readFile(`${builtDirectory}/vendor/ScrollTrigger.min.js`, "utf8"),
  readFile(`${builtDirectory}/${pixelFontReference}`),
  readFile(`${builtDirectory}/${interFontReference}`),
]);
const pixelFontDataUrl = `data:font/woff2;base64,${pixelFont.toString("base64")}`;
const interFontDataUrl = `data:font/woff2;base64,${interFont.toString("base64")}`;
const expectedBuilt = source
  .replace("/*__INLINE_GSAP__*/", () => gsapRuntime)
  .replace("/*__INLINE_SCROLLTRIGGER__*/", () => scrollTriggerRuntime)
  .replace(pixelFontReference, () => pixelFontDataUrl)
  .replace(interFontReference, () => interFontDataUrl);
assert.equal(built, expectedBuilt, "built companion is exactly derived from tracked source and local script/font runtimes");
assert.ok(source.includes(pixelFontReference) && source.includes(interFontReference), "tracked source keeps readable local font references");
assert.ok(built.includes(pixelFontDataUrl) && built.includes(interFontDataUrl), "built companion embeds both exact WOFF2 font payloads");
assert.ok(!built.includes(pixelFontReference) && !built.includes(interFontReference), "built companion makes no standalone font requests");
assert.ok(plan.includes("Reduced motion renders the final clustered composition without pinning."), "plan requires the final clustered reduced-motion state");
const assetReferences = [
  ...[...built.matchAll(/\b(?:src|href|poster)\s*=\s*["']([^"']+)["']/gi)].map((match) => match[1]),
  ...[...built.matchAll(/url\(\s*["']?([^"')\s]+)["']?\s*\)/gi)].map((match) => match[1]),
];
const remoteAssetReferences = assetReferences.filter((reference) => /^https?:\/\//i.test(reference));

assert.ok(source.includes("/*__INLINE_GSAP__*/"), "tracked source has the GSAP marker");
assert.ok(source.includes("/*__INLINE_SCROLLTRIGGER__*/"), "tracked source has the ScrollTrigger marker");
assert.doesNotMatch(built, /\/\*__INLINE_(?:GSAP|SCROLLTRIGGER)__\*\//, "built file has no vendor markers");
assert.doesNotMatch(built, /<script\b[^>]*\bsrc\s*=/i, "built runtime is self-contained");
assert.equal((built.match(/<section\b/g) ?? []).length, 1, "exactly one section");
assert.equal((built.match(/<canvas\b/g) ?? []).length, 1, "exactly one canvas");
assert.doesNotMatch(built, /<(nav|footer|img)\b/i);
assert.deepEqual(remoteAssetReferences, [], "contains no remote assets");
assert.ok(built.includes("GSAP 3.13.0"), "contains GSAP 3.13.0");
assert.ok(built.includes("ScrollTrigger 3.13.0"), "contains ScrollTrigger 3.13.0");

for (const contract of [
  "function createDenseParticleRenderer(canvas)",
  'canvas.getContext("webgl2"',
  "#version 300 es",
  "gl.POINTS",
  "const DESKTOP_PARTICLE_MIN = 18000",
  "const DESKTOP_PARTICLE_MAX = 30000",
  "const PORTAL_LAYER_COUNT = 6",
  "const RIBBON_COUNT = 7",
  'class="cluster cluster-latest"',
  'class="cluster cluster-core"',
  'class="cluster cluster-delivery"',
  'class="cluster cluster-horizon"',
  "Latest models",
  "Core capabilities",
  "Delivery layer",
  "More models. More capabilities. Continuously added.",
  "Seedance 2.0 Mini",
  "Doubao Seed Audio 1.0",
  "Kling 3.0",
  "Seedance 2.0",
  "Nano Banana 2 Lite",
  "Image",
  "Video",
  "Audio",
  "Music",
  "Understanding",
  "Search",
  "Drive",
  "Share",
  "Page",
  "Publish",
  "Delivered",
]) assert.ok(source.includes(contract), `source contains ${contract}`);

for (const model of ["Seedance 2.0 Mini", "Doubao Seed Audio 1.0", "Kling 3.0", "Seedance 2.0", "Nano Banana 2 Lite"]) {
  assert.ok(modelHub.includes(`model: "${model}"`), `latest-model anchor ${model} exists in the current model hub`);
}

assert.equal((source.match(/ScrollTrigger\.create\(/g) ?? []).length, 1);
assert.doesNotMatch(source, /getContext\(["']2d["']\)/);
assert.doesNotMatch(source, /window\.addEventListener\(["']scroll["']/);
assert.match(source, /<noscript>[\s\S]*?noscript-capability-proof[\s\S]*?<\/noscript>/, "one-section no-JS fallback is present");
assert.doesNotMatch(source, /<button[^>]*>[\s\S]*?anycap install[\s\S]*?<\/button>/i, "install proof is not a button");
assert.doesNotMatch(source, /Try AnyCap/i, "middle section has no hero CTA");
assert.doesNotMatch(source, /radial-gradient/i, "source has no independent gradient wash");
assert.match(source, /prefers-reduced-motion: reduce/, "source declares reduced-motion behavior");
assert.match(source, /window\.__ANYCAP_DEMO__\s*=\s*\{[\s\S]*?renderAt/, "deterministic browser inspection API exposes renderAt");

console.log("homepage dense particle clusters contract: pass");
