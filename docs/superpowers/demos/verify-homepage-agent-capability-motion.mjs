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
assert.match(source, /function createStaticFinalSvg\(width, height\)/, "fallback SVG is generated for the current layout dimensions");
assert.match(source, /viewBox="0 0 \$\{width\} \$\{height\}"/, "fallback SVG viewBox follows the current layout dimensions");
assert.match(source, /Array\.from\(\{ length: PORTAL_LAYER_COUNT \}/, "fallback creates all six portal depth layers");
assert.match(source, /Array\.from\(\{ length: RIBBON_COUNT \}/, "fallback creates all seven particle ribbons");
assert.match(source, /canvas\.dataset\.staticPortalLayers = String\(PORTAL_LAYER_COUNT\)/, "fallback exposes its real portal-layer structure");
assert.match(source, /canvas\.dataset\.staticRibbons = String\(RIBBON_COUNT\)/, "fallback exposes its real ribbon structure");
assert.match(source, /function createStaticFinalRenderer\(canvas\)[\s\S]*?get particleCount\(\) \{ return 0; \}/, "fallback reports no WebGL particles instead of fictitious telemetry");
assert.match(source, /if \(!gl\) return createStaticFinalRenderer\(canvas\);/, "WebGL-null creation reaches the responsive fallback");
assert.match(source, /stroke-dasharray="2\.6 6\.2"/, "fallback ribbons use broad square-dashed particle marks");
assert.match(source, /canvas\.style\.backgroundSize = "100% 100%";/, "fallback SVG fills the current canvas without fixed cover cropping");
assert.doesNotMatch(source, /viewBox=["']0 0 1200 800["']/, "fallback has no fixed desktop coordinate system");
assert.doesNotMatch(source, /count = width < 768 \? 9000 : DESKTOP_PARTICLE_MIN;/, "fallback does not fabricate WebGL particle counts");
const staticMobileEnds = JSON.parse(source.match(/const staticMobileEnds = (\[\[[^;]+\]\]);/)?.[1] ?? "[]");
assert.equal(staticMobileEnds.length, 7, "mobile fallback defines seven responsive ribbon destinations");
for (const [x, y] of staticMobileEnds) {
  assert.ok(x > 0 && x < 1 && y > 0 && y < 1, `mobile fallback ribbon destination ${x},${y} stays inside the canvas`);
}
const fallbackMobilePortalSize = Math.min(390 * 0.52, 844 * 0.27);
assert.ok(390 * 0.5 - fallbackMobilePortalSize * 0.5 > 0, "390px fallback portal left edge stays inside the canvas");
assert.ok(390 * 0.5 + fallbackMobilePortalSize * 0.5 < 390, "390px fallback portal right edge stays inside the canvas");
assert.ok(844 * 0.43 - fallbackMobilePortalSize * 0.5 > 0, "844px fallback portal top edge stays inside the canvas");
assert.ok(844 * 0.43 + fallbackMobilePortalSize * 0.5 < 844, "844px fallback portal bottom edge stays inside the canvas");
assert.match(source, /class="capability-semantic-summary visually-hidden"/, "an always-present semantic summary exists outside the decorative visual");
const semanticSummary = source.match(/<div class="capability-semantic-summary visually-hidden">([\s\S]*?)<\/div>\s*<\/div>\s*<noscript>/)?.[1] ?? "";
assert.ok(semanticSummary, "semantic summary is outside the aria-hidden particle visual");
for (const summaryEvidence of [
  "Latest models",
  "Seedance 2.0 Mini",
  "Doubao Seed Audio 1.0",
  "Kling 3.0",
  "Seedance 2.0",
  "Nano Banana 2 Lite",
  "Core capabilities",
  "Image",
  "Video",
  "Audio",
  "Music",
  "Understanding",
  "Search",
  "Delivery layer",
  "Drive",
  "Share",
  "Page",
  "Publish",
  "Delivered",
  "More models. More capabilities. Continuously added.",
  "Representative output evidence",
  "Research",
  "Editorial image",
  "Cinematic video",
  "Transcript",
  "Code snippet",
]) assert.ok(semanticSummary.includes(summaryEvidence), `semantic summary includes ${summaryEvidence}`);
assert.doesNotMatch(source, /cursor-lanes|cursor-lane|cursorLanes/, "obsolete cursor lanes are removed from markup, CSS, and JavaScript");
assert.doesNotMatch(source, /agent-proof|agentProof|Codex · Claude Code · Cursor · any agent/, "obsolete agent proof line is removed");
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
const revealWindows = Object.fromEntries(
  [...source.matchAll(/(latest|core|delivery|horizon): \[(0\.\d+), ((?:0\.\d+|1\.00))\]/g)]
    .map((match) => [match[1], [Number(match[2]), Number(match[3])]]),
);
assert.deepEqual(revealWindows, {
  latest: [0.505, 0.53],
  core: [0.745, 0.78],
  delivery: [0.885, 0.92],
  horizon: [0.975, 1],
}, "DOM reveal windows remain inside their phase endpoints");
for (const cluster of ["latest", "core", "delivery", "horizon"]) {
  assert.ok(particleCompletion[cluster] < revealWindows[cluster][0], `${cluster} particles arrive before its DOM reveal starts`);
}
const artifactTiming = Object.fromEntries(
  [...source.matchAll(/const ARTIFACT_(REVEAL_START|REVEAL_STAGGER|REVEAL_COMPLETE) = (0\.\d+);/g)]
    .map((match) => [match[1].toLowerCase(), Number(match[2])]),
);
assert.deepEqual(artifactTiming, { reveal_start: 0.748, reveal_stagger: 0.003, reveal_complete: 0.768 }, "artifact timing stays explicit");
assert.ok(particleCompletion.core < artifactTiming.reveal_start, "core particle mass arrives before artifacts start revealing");
assert.ok(artifactTiming.reveal_complete + artifactTiming.reveal_stagger * 4 <= revealWindows.core[1], "all artifact reveals finish inside the core phase endpoint");
assert.match(source, /const artifactStart = ARTIFACT_REVEAL_START \+ \(index % 5\) \* ARTIFACT_REVEAL_STAGGER;/, "artifact reveal start uses the causal timing constants");
assert.match(source, /const artifactComplete = ARTIFACT_REVEAL_COMPLETE \+ \(index % 5\) \* ARTIFACT_REVEAL_STAGGER;/, "artifact reveal completion uses the causal timing constants");
assert.match(source, /: reducedMotion \|\| lowPower\s*\? DESKTOP_PARTICLE_MIN/, "desktop reduced and low-power WebGL paths retain the desktop particle minimum");
assert.doesNotMatch(source, /\b14000\b/, "no desktop path drops below the 18k minimum");
assert.ok(source.includes("gl_PointSize = clamp(aSize, 0.8, 4.8) * uDpr;"), "effective CSS point size is clamped to 0.8-4.8 before DPR scaling");
assert.ok(source.includes("Math.max(0.8, size * 0.76)"), "scatter particles retain the 0.8 CSS-pixel floor");
const vertexShader = source.match(/const vertexSource = `([\s\S]*?)`;/)?.[1] ?? "";
assert.match(vertexShader, /in float aPortalLayer;/, "portal layer is a shader attribute");
assert.match(vertexShader, /float portalOrder = 1\.0 - aPortalLayer;/, "shader converts encoded depth into inner-first assembly order");
assert.match(vertexShader, /float assembleStart = 0\.16 \+ portalOrder \* 0\.035 \+ aDelay \* 0\.006;/, "inner portal layers begin assembling first after 0.16");
assert.match(vertexShader, /float assembleEnd = 0\.27 \+ portalOrder \* 0\.046 \+ aDelay \* 0\.004;/, "outer portal layers finish later and by 0.32");
assert.match(vertexShader, /float portalScale = 1\.0 - 0\.02 \* compressionWave \+ 0\.03 \* releaseWave;/, "portal pulse is bounded to 0.98 compression and 1.03 overshoot");
assert.match(vertexShader, /uPortalCenter \+ \(position - uPortalCenter\) \* portalScale/, "portal pulse scales particles around the portal center");
assert.match(source, /data\[base \+ 12\] = portalLayer;/, "portal layer is encoded in particle buffer data");
assert.match(source, /writeParticle\(data, index, source, final, final,[\s\S]*?final\.portalLayer\);/, "generated portal depth is written for portal particles");
assert.match(source, /gl\.uniform2f\(portalCenterLocation, geometry\.centerX, geometry\.centerY\);/, "responsive portal center reaches the shader");
assert.match(source, /function handleMotionPreferenceChange\(\)/, "motion preference listener has a removable named callback");
assert.ok(source.includes('reduceMotionQuery.addEventListener("change", handleMotionPreferenceChange)'), "named motion preference listener is installed");
assert.ok(source.includes('reduceMotionQuery.removeEventListener("change", handleMotionPreferenceChange)'), "named motion preference listener is removed at teardown");
assert.match(source, /function handleViewportResize\(\)/, "resize and DPR invalidation uses a named callback");
assert.ok(source.includes('window.addEventListener("resize", handleViewportResize, { passive: true })'), "resize and DPR invalidation callback is installed");
assert.ok(source.includes('window.removeEventListener("resize", handleViewportResize)'), "resize and DPR invalidation callback is removed at teardown");
assert.match(source, /destroy\(\) \{[\s\S]*?cancelAnimationFrame\(resizeFrame\);[\s\S]*?resizeObserver\.disconnect\(\);[\s\S]*?renderer\.destroy\(\);/, "demo teardown cancels queued resize work before destroying the renderer");
assert.match(source, /\.capability-field \{[\s\S]*?height: 340dvh;/, "desktop wrapper keeps the 340dvh narrative height");
assert.match(source, /@media \(max-width: 767px\) \{[\s\S]*?\.capability-field \{ height: 240dvh; \}/, "mobile wrapper keeps the 240dvh narrative height");
assert.ok(source.includes('const capabilityField = document.querySelector(".capability-field")'), "dynamic end reads the actual capability field");
assert.match(source, /function capabilityScrollDistance\(\) \{\s*return Math\.max\(1, capabilityField\.offsetHeight - window\.innerHeight\);\s*\}/, "dynamic end derives the positive scrollable field distance");
assert.ok(source.includes('end: () => `+=${capabilityScrollDistance()}`'), "ScrollTrigger refresh resolves a reachable end for the current viewport");
assert.doesNotMatch(source, /end:\s*["'][^"']*%["']/, "ScrollTrigger does not use a fixed percentage end");
assert.ok(plan.includes('end: () => `+=${capabilityScrollDistance()}`'), "implementation plan records the dynamic reachable ScrollTrigger end");
assert.ok(plan.includes("field.offsetHeight - window.innerHeight"), "implementation plan derives the end from actual wrapper and viewport heights");
assert.ok(plan.includes("18,000 to 30,000 particles applies only to WebGL"), "plan scopes particle telemetry to real WebGL paths");
assert.ok(plan.includes("fallback reports zero WebGL particles"), "plan requires honest fallback telemetry");
assert.ok(plan.includes("particle completion must be strictly earlier than the corresponding DOM reveal start"), "plan records causal particle-before-surface timing");
assert.match(source, /<noscript>[\s\S]*?noscript-capability-proof[\s\S]*?<\/noscript>/, "one-section no-JS fallback is present");
assert.doesNotMatch(source, /<button[^>]*>[\s\S]*?anycap install[\s\S]*?<\/button>/i, "install proof is not a button");
assert.doesNotMatch(source, /Try AnyCap/i, "middle section has no hero CTA");
assert.doesNotMatch(source, /radial-gradient/i, "source has no independent gradient wash");
assert.match(source, /prefers-reduced-motion: reduce/, "source declares reduced-motion behavior");
assert.match(source, /window\.__ANYCAP_DEMO__\s*=\s*\{[\s\S]*?renderAt/, "deterministic browser inspection API exposes renderAt");

console.log("homepage dense particle clusters contract: pass");
