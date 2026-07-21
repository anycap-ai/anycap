import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const assetDirectory = fileURLToPath(new URL("../public/visuals/agent-core/", import.meta.url));
const manifestPath = `${assetDirectory}asset-manifest.json`;
const execFileAsync = promisify(execFile);

const expectedAnchors = {
  headPivot: { x: 0.706, y: 0.468 },
  socketCenter: { x: 0.697, y: 0.625 },
  dockCenter: { x: 0.637, y: 0.898 },
};

const expectedContracts = {
  body: {
    identity: "approved-agent-upper-body",
    role: "base",
    intendedUse: "Static torso, segmented neck, arms, and empty chest socket.",
    localAnchors: ["headPivot", "socketCenter"],
    placementAnchor: "socketCenter",
    placementTarget: { x: 1165, y: 588 },
  },
  head: {
    identity: "approved-agent-head",
    role: "articulated",
    intendedUse: "Rotates around the stable neck-facing head pivot.",
    localAnchors: ["headPivot"],
    placementAnchor: "headPivot",
    placementTarget: { x: 1180, y: 440 },
  },
  core: {
    identity: "approved-anycap-core",
    role: "interactive",
    intendedUse: "Moves from the physical dock to the chest socket during installation.",
    localAnchors: ["visualCenter", "socketAttachment", "dockContact"],
    placementAnchor: "visualCenter",
    placementTarget: { x: 1078, y: 829 },
  },
  dock: {
    identity: "approved-core-dock",
    role: "support",
    intendedUse: "Physically supports the Core in the awaiting state.",
    localAnchors: ["visualCenter", "coreSeat"],
    placementAnchor: "visualCenter",
    placementTarget: { x: 1075, y: 896 },
  },
};

function parseExtendedWebP(bytes, file) {
  assert.equal(bytes.subarray(0, 4).toString("ascii"), "RIFF", `${file}: RIFF`);
  assert.equal(bytes.subarray(8, 12).toString("ascii"), "WEBP", `${file}: WEBP`);
  const vp8x = bytes.indexOf(Buffer.from("VP8X"));
  assert.notEqual(vp8x, -1, `${file}: VP8X metadata`);
  const flags = bytes[vp8x + 8];
  const width = 1 + bytes.readUIntLE(vp8x + 12, 3);
  const height = 1 + bytes.readUIntLE(vp8x + 15, 3);
  return { hasAlpha: Boolean(flags & 0x10), width, height };
}

async function readAlphaExtrema(file) {
  const { stdout } = await execFileAsync("magick", [
    `${assetDirectory}${file}`,
    "-alpha",
    "extract",
    "-format",
    "%[fx:minima],%[fx:maxima]",
    "info:",
  ]);
  return stdout.trim().split(",").map(Number);
}

async function readSourceCrop(file) {
  const { stdout } = await execFileAsync("magick", [
    `${assetDirectory}${file}`,
    "-alpha",
    "extract",
    "-threshold",
    "0",
    "-trim",
    "-format",
    "%X,%Y,%w,%h",
    "info:",
  ]);
  const [x, y, width, height] = stdout.trim().split(",").map(Number);
  return { x, y, width, height };
}

function assertRasterPoint(actual, expected, label) {
  assert.ok(Math.abs(actual.x - expected.x) <= 1, `${label}.x reproduces within one pixel`);
  assert.ok(Math.abs(actual.y - expected.y) <= 1, `${label}.y reproduces within one pixel`);
}

test("ships the four transparent agent-core layers", async () => {
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  assert.deepEqual(Object.keys(manifest.assets), ["body", "head", "core", "dock"]);
  for (const [key, entry] of Object.entries(manifest.assets)) {
    const bytes = await readFile(`${assetDirectory}${entry.file}`);
    const parsed = parseExtendedWebP(bytes, entry.file);
    assert.equal(parsed.hasAlpha, true, `${key}: transparent`);
    assert.deepEqual(
      { width: parsed.width, height: parsed.height },
      { width: entry.width, height: entry.height },
      `${key}: dimensions match manifest`,
    );
    assert.ok(bytes.byteLength < entry.maxBytes, `${key}: below byte budget`);
    assert.deepEqual(entry.alpha, { required: true, mode: "straight" }, `${key}: alpha contract`);
    assert.deepEqual(await readAlphaExtrema(entry.file), [0, 1], `${key}: transparent and opaque content`);
    assert.deepEqual(await readSourceCrop(entry.file), entry.sourceCrop, `${key}: measured source crop`);
  }
});

test("records exact stable scene anchors at canonical artboard pixels", async () => {
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  assert.equal(manifest.version, 2);
  assert.deepEqual(manifest.artboard, { width: 1672, height: 941 });
  assert.deepEqual(manifest.anchors, expectedAnchors);
  for (const [key, anchor] of Object.entries(manifest.anchors)) {
    const expectedPixel = {
      x: Math.round(expectedAnchors[key].x * manifest.artboard.width),
      y: Math.round(expectedAnchors[key].y * manifest.artboard.height),
    };
    assertRasterPoint(
      { x: anchor.x * manifest.artboard.width, y: anchor.y * manifest.artboard.height },
      expectedPixel,
      key,
    );
  }
});

test("records the complete measured compositing contract", async () => {
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  for (const [key, expected] of Object.entries(expectedContracts)) {
    const entry = manifest.assets[key];
    assert.equal(entry.identity, expected.identity, `${key}: identity`);
    assert.equal(entry.role, expected.role, `${key}: role`);
    assert.equal(entry.intendedUse, expected.intendedUse, `${key}: intended use`);

    const crop = entry.sourceCrop;
    for (const field of ["x", "y", "width", "height"]) {
      assert.ok(Number.isInteger(crop[field]), `${key}: sourceCrop.${field} integer`);
    }
    assert.ok(crop.x > 0 && crop.y > 0, `${key}: transparent leading padding`);
    assert.ok(crop.width > 0 && crop.height > 0, `${key}: nontransparent object bounds`);
    assert.ok(crop.x + crop.width < entry.width, `${key}: transparent trailing x padding`);
    assert.ok(crop.y + crop.height < entry.height, `${key}: transparent trailing y padding`);

    assert.deepEqual(Object.keys(entry.localAnchors), expected.localAnchors, `${key}: local anchor names`);
    for (const [name, point] of Object.entries(entry.localAnchors)) {
      assert.ok(Number.isInteger(point.x) && Number.isInteger(point.y), `${key}.${name}: pixel coordinates`);
      assert.ok(point.x >= 0 && point.x < entry.width, `${key}.${name}.x on canvas`);
      assert.ok(point.y >= 0 && point.y < entry.height, `${key}.${name}.y on canvas`);
    }

    const placement = entry.canonicalPlacement;
    assert.equal(placement.anchor, expected.placementAnchor, `${key}: placement anchor`);
    assert.deepEqual(placement.target, expected.placementTarget, `${key}: measured target`);
    assert.equal(typeof placement.x, "number", `${key}: placement x`);
    assert.equal(typeof placement.y, "number", `${key}: placement y`);
    assert.ok(placement.scale > 0 && placement.scale <= 1, `${key}: placement scale`);
    const localAnchor = entry.localAnchors[placement.anchor];
    assertRasterPoint(
      {
        x: placement.x + localAnchor.x * placement.scale,
        y: placement.y + localAnchor.y * placement.scale,
      },
      placement.target,
      `${key}: canonical placement`,
    );
  }
});
