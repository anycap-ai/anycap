import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const directory = dirname(fileURLToPath(import.meta.url));
const packageDirectory = resolve(directory, "../design-masters/homepage-capability");
const mode = process.argv[2] ?? "all";
const validModes = new Set(["manifest", "final", "keyframes", "breakdown", "all"]);
assert.ok(validModes.has(mode), `mode must be one of ${[...validModes].join(", ")}`);

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
  assert.deepEqual(manifest.layerOrder, ["background", "copy", "backgroundParticles", "portalTunnel", "humanAgentPair", "artifactSurfaces", "capabilityAnnotations", "foregroundParticles", "atmosphere"]);
  assert.deepEqual(manifest.components, ["CapabilityScene", "PortalTunnel", "HumanAgentPair", "ParticleFlow", "ArtifactSurface", "CapabilityAnnotations", "SceneAtmosphere"]);
  assert.equal(manifest.artifacts.length, 14);
  assert.equal(new Set(manifest.artifacts).size, 14);
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
