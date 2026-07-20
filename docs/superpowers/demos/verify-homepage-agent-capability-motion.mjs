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
assert.ok(source.includes("const RIBBON_PARTICLE_ROLES = [1, 1, 2, 2, 2, 3, 4]"), "ribbons map deterministically to latest, core, delivery, and horizon arrivals");
assert.ok(source.includes("RIBBON_PARTICLE_ROLES[wave]"), "ribbon role mapping is written into particle data");
const particleCompletion = Object.fromEntries(
  [...source.matchAll(/const (LATEST|CORE|DELIVERY|HORIZON)_PARTICLE_COMPLETE = (0\.\d+);/g)]
    .map((match) => [match[1].toLowerCase(), Number(match[2])]),
);
assert.deepEqual(particleCompletion, { latest: 0.5, core: 0.74, delivery: 0.88, horizon: 0.97 }, "cluster particle completion thresholds stay explicit");
for (const constant of ["LATEST", "CORE", "DELIVERY", "HORIZON"]) {
  assert.ok(source.includes(`\${${constant}_PARTICLE_COMPLETE.toFixed(2)}`), `${constant.toLowerCase()} particle completion drives the vertex shader`);
}
assert.ok(particleCompletion.latest < 0.53, "latest particles arrive before latest labels finish revealing");
assert.ok(particleCompletion.core < 0.78, "core particles arrive before core labels finish revealing");
assert.ok(particleCompletion.delivery < 0.92, "delivery particles arrive before delivery labels finish revealing");
assert.ok(particleCompletion.horizon < 1, "horizon particles arrive before horizon copy finishes revealing");
assert.ok(source.includes("latest: [0.32, 0.53]"), "latest DOM reveal uses the specified interval");
assert.ok(source.includes("core: [0.48, 0.78]"), "core DOM reveal uses the specified interval");
assert.ok(source.includes("delivery: [0.72, 0.92]"), "delivery DOM reveal uses the specified interval");
assert.ok(source.includes("horizon: [0.90, 1.00]"), "horizon DOM reveal uses the specified interval");
assert.match(source, /const artifactStart = 0\.48 \+ \(index % 5\) \* 0\.01;/, "artifacts start inside the core interval");
assert.match(source, /const artifactComplete = 0\.72 \+ \(index % 5\) \* 0\.012;/, "artifacts complete no later than 0.768 inside the core interval");
assert.match(source, /count = width < 768 \? 9000 : DESKTOP_PARTICLE_MIN;/, "static fallback retains the desktop particle minimum");
assert.match(source, /: reducedMotion \|\| lowPower\s*\? DESKTOP_PARTICLE_MIN/, "desktop reduced and low-power WebGL paths retain the desktop particle minimum");
assert.doesNotMatch(source, /\b14000\b/, "no desktop path drops below the 18k minimum");
assert.ok(source.includes("gl_PointSize = clamp(aSize, 0.8, 4.8) * uDpr;"), "effective CSS point size is clamped to 0.8-4.8 before DPR scaling");
assert.ok(source.includes("Math.max(0.8, size * 0.76)"), "scatter particles retain the 0.8 CSS-pixel floor");
assert.match(source, /function handleMotionPreferenceChange\(\)/, "motion preference listener has a removable named callback");
assert.ok(source.includes('reduceMotionQuery.addEventListener("change", handleMotionPreferenceChange)'), "named motion preference listener is installed");
assert.ok(source.includes('reduceMotionQuery.removeEventListener("change", handleMotionPreferenceChange)'), "named motion preference listener is removed at teardown");
assert.match(source, /destroy\(\) \{[\s\S]*?cancelAnimationFrame\(resizeFrame\);[\s\S]*?resizeObserver\.disconnect\(\);[\s\S]*?renderer\.destroy\(\);/, "demo teardown cancels queued resize work before destroying the renderer");
assert.match(source, /\.capability-field \{[\s\S]*?height: 340dvh;/, "desktop wrapper keeps the 340dvh narrative height");
assert.match(source, /@media \(max-width: 767px\) \{[\s\S]*?\.capability-field \{ height: 240dvh; \}/, "mobile wrapper keeps the 240dvh narrative height");
assert.ok(source.includes('const capabilityField = document.querySelector(".capability-field")'), "dynamic end reads the actual capability field");
assert.match(source, /function capabilityScrollDistance\(\) \{\s*return Math\.max\(1, capabilityField\.offsetHeight - window\.innerHeight\);\s*\}/, "dynamic end derives the positive scrollable field distance");
assert.ok(source.includes('end: () => `+=${capabilityScrollDistance()}`'), "ScrollTrigger refresh resolves a reachable end for the current viewport");
assert.doesNotMatch(source, /end:\s*["'][^"']*%["']/, "ScrollTrigger does not use a fixed percentage end");
assert.ok(plan.includes('end: () => `+=${capabilityScrollDistance()}`'), "implementation plan records the dynamic reachable ScrollTrigger end");
assert.ok(plan.includes("field.offsetHeight - window.innerHeight"), "implementation plan derives the end from actual wrapper and viewport heights");
assert.match(source, /<noscript>[\s\S]*?noscript-capability-proof[\s\S]*?<\/noscript>/, "one-section no-JS fallback is present");
assert.doesNotMatch(source, /<button[^>]*>[\s\S]*?anycap install[\s\S]*?<\/button>/i, "install proof is not a button");
assert.doesNotMatch(source, /Try AnyCap/i, "middle section has no hero CTA");
assert.doesNotMatch(source, /radial-gradient/i, "source has no independent gradient wash");
assert.match(source, /prefers-reduced-motion: reduce/, "source declares reduced-motion behavior");
assert.match(source, /window\.__ANYCAP_DEMO__\s*=\s*\{[\s\S]*?renderAt/, "deterministic browser inspection API exposes renderAt");

console.log("homepage dense particle clusters contract: pass");
