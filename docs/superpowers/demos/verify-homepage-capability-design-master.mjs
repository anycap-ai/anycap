import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const directory = dirname(fileURLToPath(import.meta.url));
const packageDirectory = resolve(directory, "../design-masters/homepage-capability");
const mode = process.argv[2] ?? "all";
const validModes = new Set(["manifest", "final", "keyframes", "breakdown", "all"]);
assert.ok(validModes.has(mode), `mode must be one of ${[...validModes].join(", ")}`);

const canonicalArtifacts = ["Research", "Editorial image", "Screenshot analysis", "Vision crop", "Published page", "Cinematic video", "Audio", "Transcript", "Share link", "Music track", "Search result", "Generated variants", "Code snippet", "Delivered"];
const canonicalAnnotationGroups = ["latest-models", "core-capabilities", "delivery-layer", "horizon-continuation"];
const canonicalAnnotationLabels = new Map([
  ["latest-models", ["Latest models", "Seedance 2.0 Mini", "Doubao Seed Audio 1.0", "Kling 3.0"]],
  ["core-capabilities", ["Core capabilities", "Image", "Video", "Audio", "Music", "Understanding", "Search"]],
  ["delivery-layer", ["Delivery layer", "Drive", "Share", "Page", "Publish", "Delivered"]],
  ["horizon-continuation", ["More models. More capabilities. Continuously added."]],
]);
const canonicalOwners = new Set(["CapabilityScene", "PortalTunnel", "HumanAgentPair", "ParticleFlow", "ArtifactSurface", "CapabilityAnnotations", "SceneAtmosphere"]);
const canonicalRevealPhases = new Set(["limited", "install", "portal", "avalanche", "delivered"]);

async function pngDimensions(path) {
  const bytes = await readFile(path);
  assert.equal(bytes.subarray(1, 4).toString("ascii"), "PNG", `${path} is a PNG`);
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

async function assertCanonicalPng(relativePath) {
  const dimensions = await pngDimensions(resolve(packageDirectory, relativePath));
  assert.deepEqual(dimensions, { width: 1672, height: 941 }, `${relativePath} is 1672×941`);
}

async function verifyManifest() {
  const manifest = JSON.parse(await readFile(resolve(packageDirectory, "scene-manifest.json"), "utf8"));
  assert.equal(manifest.version, 1);
  assert.deepEqual(manifest.artboard, { width: 1672, height: 941, aspect: "16:9" });
  assert.ok(manifest.camera, "manifest has a canonical camera contract");
  assert.deepEqual(manifest.camera.artboardMapping, {
    coordinateSpace: "normalized",
    referenceWidth: 1672,
    referenceHeight: 941,
    fit: "canonical-16:9",
  });
  assert.deepEqual(manifest.camera.desktopCropPolicy, {
    tallerViewport: "center-artboard-vertically",
    widerViewport: "crop-open-horizon",
    stretch: false,
  });
  assert.ok(manifest.mobile, "manifest has a mobile composition contract");
  assert.deepEqual(manifest.mobile.sequence, ["copy", "portal", "representative-artifacts"]);
  assert.equal(manifest.mobile.derivedFromCanonicalManifest, true);
  assert.equal(manifest.mobile.shrinkDesktopMaster, false);
  assert.ok(Array.isArray(manifest.mobile.representativeArtifactIds), "mobile contract names representative artifacts");
  assert.ok(manifest.mobile.representativeArtifactIds.length > 0 && manifest.mobile.representativeArtifactIds.length < canonicalArtifacts.length, "mobile uses a reduced representative artifact set");
  assert.deepEqual(manifest.layerOrder, ["background", "copy", "backgroundParticles", "portalTunnel", "humanAgentPair", "artifactSurfaces", "capabilityAnnotations", "foregroundParticles", "atmosphere"]);
  assert.deepEqual(manifest.components, ["CapabilityScene", "PortalTunnel", "HumanAgentPair", "ParticleFlow", "ArtifactSurface", "CapabilityAnnotations", "SceneAtmosphere"]);
  assert.equal(manifest.artifacts.length, 14);
  assert.equal(new Set(manifest.artifacts).size, 14);
  assert.deepEqual(manifest.artifacts, canonicalArtifacts);

  const entries = manifest.sceneEntries;
  assert.ok(Array.isArray(entries), "manifest has canonical scene entries");
  assert.equal(entries.length, 25, "manifest has seven structural entries, four annotation groups, and fourteen artifacts");
  assert.equal(new Set(entries.map((entry) => entry.id)).size, entries.length, "scene entry ids are unique");
  for (const entry of entries) {
    for (const field of ["id", "owner", "x", "y", "z", "scale", "rotation", "revealPhase", "mobilePolicy"]) assert.ok(Object.hasOwn(entry, field), `${entry.id ?? "scene entry"} has ${field}`);
    assert.ok(canonicalOwners.has(entry.owner), `${entry.id} has a canonical owner component`);
    assert.ok(Number.isFinite(entry.x) && entry.x >= 0 && entry.x <= 1, `${entry.id} x is normalized`);
    assert.ok(Number.isFinite(entry.y) && entry.y >= 0 && entry.y <= 1, `${entry.id} y is normalized`);
    assert.ok(Number.isFinite(entry.z), `${entry.id} z is numeric`);
    assert.ok(Number.isFinite(entry.scale) && entry.scale > 0, `${entry.id} scale is positive`);
    assert.ok(Number.isFinite(entry.rotation), `${entry.id} rotation is numeric`);
    assert.ok(canonicalRevealPhases.has(entry.revealPhase), `${entry.id} has a canonical reveal phase`);
    assert.ok(["keep", "reposition", "representative", "hide"].includes(entry.mobilePolicy), `${entry.id} has an explicit mobile policy`);
  }

  const requiredKinds = ["copy", "portal", "human", "agent", "background-particles", "foreground-particles", "atmosphere"];
  const requiredOwnerByKind = new Map([
    ["copy", "CapabilityScene"],
    ["portal", "PortalTunnel"],
    ["human", "HumanAgentPair"],
    ["agent", "HumanAgentPair"],
    ["background-particles", "ParticleFlow"],
    ["foreground-particles", "ParticleFlow"],
    ["atmosphere", "SceneAtmosphere"],
  ]);
  for (const kind of requiredKinds) {
    const matches = entries.filter((entry) => entry.kind === kind);
    assert.equal(matches.length, 1, `manifest has one ${kind} entry`);
    assert.equal(matches[0].owner, requiredOwnerByKind.get(kind), `${matches[0].id} has the canonical owner`);
  }

  const artifactEntries = entries.filter((entry) => entry.kind === "artifact");
  assert.equal(artifactEntries.length, canonicalArtifacts.length, "manifest maps fourteen artifact entries");
  assert.ok(artifactEntries.every((entry) => entry.owner === "ArtifactSurface"), "ArtifactSurface owns every artifact entry");
  assert.deepEqual(artifactEntries.map((entry) => entry.artifact).sort(), [...canonicalArtifacts].sort(), "artifact entries map one-to-one to the canonical artifact list");
  assert.deepEqual(manifest.mobile.representativeArtifactIds.sort(), artifactEntries.filter((entry) => entry.mobilePolicy === "representative").map((entry) => entry.id).sort(), "mobile representative ids match artifact policies");

  const annotationEntries = entries.filter((entry) => entry.kind === "annotation");
  assert.equal(annotationEntries.length, canonicalAnnotationGroups.length, "manifest has four annotation groups");
  assert.ok(annotationEntries.every((entry) => entry.owner === "CapabilityAnnotations"), "CapabilityAnnotations owns every annotation entry");
  assert.deepEqual(annotationEntries.map((entry) => entry.group).sort(), [...canonicalAnnotationGroups].sort(), "annotation entries cover the canonical narrative groups");
  for (const entry of annotationEntries) assert.deepEqual(entry.labels, canonicalAnnotationLabels.get(entry.group), `${entry.id} uses only the verified annotation strings`);
  assert.deepEqual(manifest.keyframes.map((frame) => frame.id), ["limited", "install", "portal", "avalanche", "delivered"]);
  assert.equal(manifest.finalMaster, "final-master.png");
  return manifest;
}

async function verifyFinal() {
  await assertCanonicalPng("reference-target.png");
  await assertCanonicalPng("final-master.png");
}

async function verifyKeyframes() {
  const manifest = await verifyManifest();
  for (const frame of manifest.keyframes) await assertCanonicalPng(frame.file);
}

async function verifyBreakdown() {
  const svg = await readFile(resolve(packageDirectory, "component-breakdown.svg"), "utf8");
  const review = await readFile(resolve(packageDirectory, "review.html"), "utf8");
  for (const component of ["CapabilityScene", "PortalTunnel", "HumanAgentPair", "ParticleFlow", "ArtifactSurface", "CapabilityAnnotations", "SceneAtmosphere"]) assert.ok(svg.includes(component), `component diagram includes ${component}`);
  for (const section of ["Reference target", "Final master", "Motion keyframes", "Component breakdown"]) assert.ok(review.includes(section), `review page includes ${section}`);
  assert.equal((review.match(/<img\b/g) ?? []).length, 8, "review page exposes eight images");
}

if (mode === "manifest" || mode === "all") await verifyManifest();
if (mode === "final" || mode === "all") await verifyFinal();
if (mode === "keyframes" || mode === "all") await verifyKeyframes();
if (mode === "breakdown" || mode === "all") await verifyBreakdown();
console.log(`homepage capability design master ${mode}: pass`);
