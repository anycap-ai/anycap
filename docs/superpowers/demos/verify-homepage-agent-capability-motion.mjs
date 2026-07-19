import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const directory = fileURLToPath(new URL(".", import.meta.url));
const sourcePath = `${directory}/homepage-agent-capability-motion.source.html`;
const planPath = `${directory}/../plans/2026-07-19-homepage-agent-install-capability-motion.md`;
const builtPath = process.argv[2];
const pixelFontReference = "vendor/geist-pixel-square.woff2";
const interFontReference = "vendor/inter-latin.woff2";

assert.ok(builtPath, "pass the absolute built companion path");

const builtDirectory = dirname(builtPath);
const [source, built, plan, gsapRuntime, scrollTriggerRuntime, pixelFont, interFont] = await Promise.all([
  readFile(sourcePath, "utf8"),
  readFile(builtPath, "utf8"),
  readFile(planPath, "utf8"),
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
assert.ok(plan.includes("reduced motion 1440x900: final static state, three representative model anchors, 13 artifacts"), "plan reduced-motion acceptance matches the intentional representative final state");
assert.ok(!plan.includes("reduced motion 1440x900: final static state, seven model anchors"), "plan no longer requires hidden non-representative anchors in the final state");
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

const authoredDocuments = [
  { name: "source", value: source },
  { name: "built", value: built },
];

const narrativeText = [
  "One capability layer.",
  "Every way to finish.",
  "Human + agent",
  "Create. Understand. Find. Manage. Deliver.",
  "anycap install",
  "Codex · Claude Code · Cursor · any agent",
  "More models. More capabilities. Continuously added.",
  "Nano Banana 2 Lite",
  "Seedance 2.0 Mini",
  "Kling 3.0",
  "Mureka V8",
  "Suno V5.5",
  "Doubao Seed Audio 1.0",
  "GPT Image 2",
  "Research",
  "Editorial image",
  "Screenshot analysis",
  "Vision crop",
  "Cinematic video",
  "Audio",
  "Transcript",
  "Share link",
  "Music track",
  "Search result",
  "Code snippet",
  "Generated variants",
  "Delivered",
];

const authoredContracts = [
  'class="agent-install-layer"',
  'class="model-field"',
  'class="horizon-field"',
  'class="noscript-capability-proof"',
  "const narrativeRanges",
  "const modelAnchorDefinitions",
  "const capabilityWaveOrder",
  "const routeProgressState",
  "const artifactArrivalThreshold = 0.84",
  "const installPulseBounds",
  "const desktopCopyClearance = 28",
  "const portalParticleExtent = 0.61",
  "const standardDesktopLayout = viewportWidth >= 1280 && viewportWidth < 1707",
  "function phaseProgress",
  "function endpointRouteProgress",
  "function updateRouteProgress",
  "function resolveDesktopPortalCenter",
  "function modelWaveProgress",
  "function layout(force = false)",
  "function buildLimitedAgentPoint",
  "function buildModelRoutePoint",
  "function buildContinuationPoint",
  "function resolveParticlePosition",
  "function installPulseScale",
  "function drawPartialQuadratic",
  "function drawModelConnections",
  "splitControlX",
  "particle.endpointIndex",
  "particle.modelActiveIndex",
  "particle.modelWave",
  "particle.renderX",
  "activeIndex",
  "representative: true",
  "routeProgress: endpointRouteProgress",
  "capabilityHeading.getBoundingClientRect()",
  "phaseSnapshot",
  'trigger: ".capability-stage"',
  'start: "top top"',
  "pin: true",
  "scrub: 0.72",
  "prefers-reduced-motion: reduce",
];

for (const document of authoredDocuments) {
  for (const text of narrativeText) {
    assert.ok(document.value.includes(text), `${document.name} contains ${text}`);
  }
  for (const contract of authoredContracts) {
    assert.ok(document.value.includes(contract), `${document.name} contains ${contract}`);
  }
  assert.doesNotMatch(document.value, /<button[^>]*>[\s\S]*?anycap install[\s\S]*?<\/button>/i, `${document.name} install proof is not a button`);
  assert.doesNotMatch(document.value, /Try AnyCap/i, `${document.name} middle section has no hero CTA`);
  assert.doesNotMatch(document.value, /radial-gradient/i, `${document.name} has no independent gradient wash`);
  assert.match(document.value, /\.waveform\s*\{[^}]*?(?:^|[;{\s])height:\s*68px;/ms, `${document.name} waveform has an explicit height for percentage-based bars`);
}

assert.doesNotMatch(source, /window\.addEventListener\(["']scroll["']/, "no custom scroll listener");
assert.doesNotMatch(source, /function buildModelClusterPoint/, "model evidence uses connected directional streams, not detached circular clusters");
assert.equal((source.match(/representative: true/g) ?? []).length, 3, "exactly three representative final model anchors");
assert.match(source, /function resolveParticlePosition\([^)]*\)\s*\{[\s\S]*?particle\.renderX\s*=[\s\S]*?particle\.renderY\s*=/, "particle resolution reuses cached scalar fields");
assert.match(source, /const localRouteProgress = routeProgressState\[particle\.endpointIndex\]/, "particle interpolation consumes endpoint-local route progress");
assert.match(source, /const localRouteProgress = routeProgressState\[index\][\s\S]*?artifactReveal = smoothstep\(artifactArrivalThreshold, 1, localRouteProgress\)/, "artifact readability is gated by its exact route arrival");
assert.match(source, /drawPartialQuadratic\(center, path\.control, path\.endpoint, routeProgressState\[index\]/, "outbound path consumes the same endpoint-local route progress");
assert.match(source, /const activeIndex = active \? activeAnchorIndex\+\+ : -1/, "model wave ownership uses contiguous visible indices");
assert.match(source, /compressed:\s*0\.98[\s\S]*released:\s*1\.03/, "install pulse stays within the approved three-percent bound");
assert.match(source, /<noscript>[\s\S]*?noscript-capability-proof[\s\S]*?<\/noscript>/, "one-section no-JS fallback is present");
assert.match(source, /const standardDesktopCenterX = resolveDesktopPortalCenter\([\s\S]*?compactDesktop \? bounds\.width \* 0\.56 : standardDesktopCenterX/, "standard desktop portal center uses measured copy clearance while compact geometry stays unchanged");
assert.match(source, /: Math\.min\(bounds\.width \* 0\.25, bounds\.height \* 0\.34, 320\)/, "standard desktop portal remains substantial with an explicit size cap");
assert.match(source, /type: "audio"[^\n]*standardX: 0\.70, standardY: 0\.68/, "standard desktop Audio uses the lower-right route endpoint");
assert.match(source, /type: "video"[^\n]*standardY: 0\.435/, "standard desktop Cinematic label clears Editorial image");
assert.match(source, /type: "transcript"[^\n]*standardY: 0\.565/, "standard desktop Transcript clears the lower Audio endpoint");
assert.match(source, /type: "music"[^\n]*standardY: 0\.795/, "standard desktop Music preserves its label footprint below Audio");
assert.match(source, /type: "code"[^\n]*standardY: 0\.935/, "standard desktop Code preserves its label footprint below Music");
assert.match(source, /type: "variants"[^\n]*standardY: 0\.93/, "standard desktop Generated variants label clears Search result");
assert.match(source, /type: "vision"[^\n]*standardX: 0\.932, standardY: 0\.10/, "standard desktop Vision crop clears Screenshot analysis deterministically");
assert.match(source, /standardDesktopLayout \? \(endpoint\.standardX \?\? endpoint\.x\) : endpoint\.x/, "standard desktop endpoint x overrides are isolated from wide defaults");
assert.match(source, /standardDesktopLayout \? \(endpoint\.standardY \?\? endpoint\.y\) : endpoint\.y/, "standard desktop endpoint y overrides are isolated from wide defaults");
assert.match(source, /if \(!force && !layoutChanged\)/, "layout cache can be explicitly invalidated after fonts resolve");
assert.match(source, /function initializeMotion\(forceLayout = false\)[\s\S]*?layout\(forceLayout\)[\s\S]*?ScrollTrigger\.refresh\(\)[\s\S]*?let resizeFrame/, "motion initialization refreshes ScrollTrigger after a forced geometry rebuild");
assert.match(source, /fontsReady\.then\([\s\S]*?initializeMotion\(true\)/, "font readiness forces copy-aware geometry invalidation");
assert.match(source, /const modelWave = activeIndex < 0 \? -1 : Math\.min\(2, Math\.floor\(activeIndex \/ 3\)\)/, "desktop model owners resolve into three ordered waves");
assert.match(source, /modelActiveIndex:\s*anchor\.activeIndex[\s\S]*?modelWave:\s*anchor\.modelWave/, "routed particles cache their owning model index and wave");
assert.match(source, /const localModelProgress = particle\.modelActiveIndex < 0[\s\S]*?modelWaveProgress\(particle\.modelWave, progress\)[\s\S]*?resolveParticlePosition\(particle, phases, localRouteProgress, localModelProgress, pulseScale\)/, "routed particles consume their owning model-local progress");
assert.match(source, /function drawModelConnections\(progress\)[\s\S]*?modelWaveProgress\(path\.modelWave, progress\)/, "model paths consume the same model-local progress");
assert.match(source, /modelReveal = activeIndex < 0[\s\S]*?modelWaveProgress\(modelState\.modelWave, progress\)/, "model text consumes the same model-local progress");
assert.doesNotMatch(source, /mix\(x, particle\.connected\.x, phases\.models\)/, "routed particles no longer connect on one global model phase");

const standardViewportCases = [
  { width: 1280, height: 800, portalCenter: 725 },
  { width: 1366, height: 768, portalCenter: 748 },
  { width: 1440, height: 900, portalCenter: 800 },
];
for (const { width, height, portalCenter } of standardViewportCases) {
  const audioWidth = Math.min(246, width * 0.17);
  const audioLeft = width * 0.70 - audioWidth / 2;
  assert.ok(audioLeft - (portalCenter + 74 / 2) >= 20, `${width}px Audio keeps at least 20px from portal figures`);
  assert.ok(height * (0.68 - 0.565) > (70 + 92) / 2, `${width}px Audio clears a wrapped Transcript vertically`);
  assert.ok(height * (0.795 - 0.68) > (70 + 62) / 2, `${width}px Audio clears Music vertically`);
  assert.ok(height * (0.935 - 0.795) > (78 + 62) / 2, `${width}px Music remains clear of Code`);
}
for (const height of [720, 768, 800]) {
  const labelHeight = 10;
  const labelOffset = 4;
  const editorialBodyBottom = height * 0.30 + 88 / 2;
  const cinematicLabelTop = height * 0.435 - 74 / 2 - labelOffset - labelHeight;
  const transcriptBodyBottom = height * 0.565 + 92 / 2;
  const audioBodyTop = height * 0.68 - 70 / 2;
  const searchBodyBottom = height * 0.83 + 56 / 2;
  const variantsLabelTop = height * 0.93 - 56 / 2 - labelOffset - labelHeight;
  assert.ok(cinematicLabelTop - editorialBodyBottom >= 2, `${height}px Cinematic label clears Editorial body`);
  assert.ok(audioBodyTop - transcriptBodyBottom >= 1.5, `${height}px Audio body clears wrapped Transcript body`);
  assert.ok(variantsLabelTop - searchBodyBottom >= 1.5, `${height}px Generated variants label clears Search result body`);
}
for (const height of [720, 768, 800, 900]) {
  const labelHeight = 10;
  const labelOffset = 4;
  const audioBodyBottom = height * 0.68 + 70 / 2;
  const musicLabelTop = height * 0.795 - 62 / 2 - labelOffset - labelHeight;
  const musicBodyBottom = height * 0.795 + 62 / 2;
  const codeLabelTop = height * 0.935 - 78 / 2 - labelOffset - labelHeight;
  const codeBodyBottom = height * 0.935 + 78 / 2;
  assert.ok(musicLabelTop - audioBodyBottom >= 2, `${height}px Music label clears the Audio body`);
  assert.ok(codeLabelTop - musicBodyBottom >= 12, `${height}px Code label clears the Music body`);
  assert.ok(height - codeBodyBottom >= 6, `${height}px Code body remains inside the stage`);
}
for (const width of [1599, 1600]) {
  const defaultCardWidth = Math.min(176, width * 0.11);
  const horizontalGap = width * (0.932 - 0.82) - defaultCardWidth;
  const verticalGap = 900 * (0.20 - 0.10) - (78 + 88) / 2;
  assert.ok(horizontalGap >= 3 && verticalGap >= 7, `${width}px Vision and Screenshot retain deterministic x/y gaps`);
}

const portalCenterFunctionMatch = source.match(/function resolveDesktopPortalCenter\([^)]*\)\s*\{[\s\S]*?\n    \}/);
assert.ok(portalCenterFunctionMatch, "desktop portal center resolver is extractable for numeric verification");
const resolveDesktopPortalCenter = new Function(
  "desktopCopyClearance",
  "portalParticleExtent",
  `${portalCenterFunctionMatch[0]}; return resolveDesktopPortalCenter;`,
)(28, 0.61);
const standardDesktopCenter = resolveDesktopPortalCenter(1440 * 0.43, 306, 1440, 586);
assert.ok(Math.abs(standardDesktopCenter - 306 * 0.61 - 586 - 28) < Number.EPSILON, "1440px portal particle extent clears the measured headline by 28px");
assert.equal(resolveDesktopPortalCenter(1920 * 0.43, 320, 1920, 536), 1920 * 0.43, "wide desktop keeps its safe preferred portal center");

const modelWaveFunctionMatch = source.match(/function modelWaveProgress\([^)]*\)\s*\{[\s\S]*?\n    \}/);
assert.ok(modelWaveFunctionMatch, "model wave progress is extractable for numeric verification");
const modelWaveProgress = new Function(
  "narrativeRanges",
  "clamp01",
  "smoothstep",
  `${modelWaveFunctionMatch[0]}; return modelWaveProgress;`,
)(
  { models: [0.36, 0.62] },
  (value) => Math.min(1, Math.max(0, value)),
  (from, to, value) => {
    const amount = Math.min(1, Math.max(0, (value - from) / (to - from)));
    return amount * amount * (3 - 2 * amount);
  },
);
assert.equal(modelWaveProgress(0, 0.36), 0, "first model wave begins at the model act boundary");
assert.equal(modelWaveProgress(0, 0.46), 1, "first model wave reaches the portal before later waves");
assert.ok(modelWaveProgress(1, 0.40) <= Number.EPSILON, "second model wave waits for its owner anchors");
assert.ok(modelWaveProgress(2, 0.44) <= Number.EPSILON, "third model wave waits for its owner anchors");

const pulseStart = source.indexOf("function installPulseScale(progress)");
const pulseEnd = source.indexOf("\n\n    let particles", pulseStart);
assert.ok(pulseStart >= 0 && pulseEnd > pulseStart, "install pulse function is extractable for numeric verification");
const pulseFunctionSource = source.slice(pulseStart, pulseEnd);
const clamp = (value) => Math.min(1, Math.max(0, value));
const interpolate = (from, to, amount) => from + (to - from) * amount;
const easing = (from, to, value) => {
  const amount = clamp((value - from) / (to - from));
  return amount * amount * (3 - 2 * amount);
};
const pulseScale = new Function(
  "phaseProgress",
  "mix",
  "smoothstep",
  "installPulseBounds",
  `${pulseFunctionSource}; return installPulseScale;`,
)(
  (_name, progress) => easing(0.18, 0.36, progress),
  interpolate,
  easing,
  { compressed: 0.98, released: 1.03 },
);
const pulseSamples = Array.from({ length: 401 }, (_, index) => pulseScale(index / 400));
assert.ok(Math.min(...pulseSamples) >= 0.98, "install pulse compression is no more than two percent");
assert.ok(Math.max(...pulseSamples) <= 1.03, "install pulse overshoot is no more than three percent");
assert.equal(pulseScale(0.36), 1, "install pulse settles exactly before the model phase");

console.log("homepage agent install capability motion contract: pass");
