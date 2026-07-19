import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const directory = fileURLToPath(new URL(".", import.meta.url));
const sourcePath = `${directory}/homepage-agent-capability-motion.source.html`;
const builtPath = process.argv[2];

assert.ok(builtPath, "pass the absolute built companion path");

const source = await readFile(sourcePath, "utf8");
const built = await readFile(builtPath, "utf8");
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
  "function buildLimitedAgentPoint",
  "function buildModelRoutePoint",
  "function buildContinuationPoint",
  "function resolveParticlePosition",
  "function installPulseScale",
  "function drawPartialQuadratic",
  "function drawModelConnections",
  "splitControlX",
  "particle.endpointIndex",
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
assert.match(source, /const modelReveal = activeIndex < 0[\s\S]*?activeIndex \* 0\.025/, "model staggering uses active visible indices");
assert.match(source, /compressed:\s*0\.98[\s\S]*released:\s*1\.03/, "install pulse stays within the approved three-percent bound");
assert.match(source, /<noscript>[\s\S]*?noscript-capability-proof[\s\S]*?<\/noscript>/, "one-section no-JS fallback is present");
assert.match(source, /const standardDesktopCenterX = resolveDesktopPortalCenter\([\s\S]*?compactDesktop \? bounds\.width \* 0\.56 : standardDesktopCenterX/, "standard desktop portal center uses measured copy clearance while compact geometry stays unchanged");
assert.match(source, /: Math\.min\(bounds\.width \* 0\.25, bounds\.height \* 0\.34, 320\)/, "standard desktop portal remains substantial with an explicit size cap");
assert.match(source, /type: "audio"[^\n]*standardX: 0\.70, standardY: 0\.68/, "standard desktop Audio uses the lower-right route endpoint");
assert.match(source, /type: "music"[^\n]*standardY: 0\.767/, "standard desktop Music preserves clearance below Audio and above Code");
assert.match(source, /type: "vision"[^\n]*standardX: 0\.932, standardY: 0\.10/, "standard desktop Vision crop clears Screenshot analysis deterministically");
assert.match(source, /standardDesktopLayout \? \(endpoint\.standardX \?\? endpoint\.x\) : endpoint\.x/, "standard desktop endpoint x overrides are isolated from wide defaults");
assert.match(source, /standardDesktopLayout \? \(endpoint\.standardY \?\? endpoint\.y\) : endpoint\.y/, "standard desktop endpoint y overrides are isolated from wide defaults");

const standardViewportCases = [
  { width: 1280, height: 800, portalCenter: 725 },
  { width: 1366, height: 768, portalCenter: 748 },
  { width: 1440, height: 900, portalCenter: 800 },
];
for (const { width, height, portalCenter } of standardViewportCases) {
  const audioWidth = Math.min(246, width * 0.17);
  const audioLeft = width * 0.70 - audioWidth / 2;
  assert.ok(audioLeft - (portalCenter + 74 / 2) >= 20, `${width}px Audio keeps at least 20px from portal figures`);
  assert.ok(height * (0.68 - 0.59) > (70 + 64) / 2, `${width}px Audio clears Transcript vertically`);
  assert.ok(height * (0.767 - 0.68) > (70 + 62) / 2, `${width}px Audio clears Music vertically`);
  assert.ok(height * (0.86 - 0.767) > (78 + 62) / 2, `${width}px Music remains clear of Code`);
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
