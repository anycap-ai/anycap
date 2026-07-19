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
  "function phaseProgress",
  "function endpointRouteProgress",
  "function updateRouteProgress",
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
