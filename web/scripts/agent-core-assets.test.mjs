import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { fileURLToPath } from "node:url";

const assetDirectory = fileURLToPath(new URL("../public/visuals/agent-core/", import.meta.url));
const manifestPath = `${assetDirectory}asset-manifest.json`;

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
  }
});

test("records the stable scene anchors", async () => {
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  assert.deepEqual(manifest.artboard, { width: 1672, height: 941 });
  for (const key of ["headPivot", "socketCenter", "dockCenter"]) {
    assert.equal(typeof manifest.anchors[key].x, "number", `${key}.x`);
    assert.equal(typeof manifest.anchors[key].y, "number", `${key}.y`);
    assert.ok(manifest.anchors[key].x >= 0 && manifest.anchors[key].x <= 1, `${key}.x normalized`);
    assert.ok(manifest.anchors[key].y >= 0 && manifest.anchors[key].y <= 1, `${key}.y normalized`);
  }
});
