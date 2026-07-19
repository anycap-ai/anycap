import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const directory = fileURLToPath(new URL(".", import.meta.url));
const sourcePath = `${directory}/homepage-agent-capability-motion.source.html`;
const [mode, targetPath] = process.argv.slice(2);
const GSAP_MARKER = "/*__INLINE_GSAP__*/";
const SCROLLTRIGGER_MARKER = "/*__INLINE_SCROLLTRIGGER__*/";
const PIXEL_FONT_REFERENCE = "vendor/geist-pixel-square.woff2";
const INTER_FONT_REFERENCE = "vendor/inter-latin.woff2";

function fontDataUrl(font) {
  return `data:font/woff2;base64,${font.toString("base64")}`;
}

assert.ok(mode === "extract" || mode === "build", "mode must be extract or build");
assert.ok(targetPath?.startsWith("/"), "target path must be absolute");

if (mode === "extract") {
  const outputDirectory = dirname(targetPath);
  const [built, gsap, scrollTrigger, pixelFont, interFont] = await Promise.all([
    readFile(targetPath, "utf8"),
    readFile(`${outputDirectory}/vendor/gsap.min.js`, "utf8"),
    readFile(`${outputDirectory}/vendor/ScrollTrigger.min.js`, "utf8"),
    readFile(`${outputDirectory}/${PIXEL_FONT_REFERENCE}`),
    readFile(`${outputDirectory}/${INTER_FONT_REFERENCE}`),
  ]);
  assert.ok(built.includes(gsap), "built companion is missing GSAP runtime");
  assert.ok(built.includes(scrollTrigger), "built companion is missing ScrollTrigger runtime");
  assert.ok(built.includes(fontDataUrl(pixelFont)), "built companion is missing the pixel font");
  assert.ok(built.includes(fontDataUrl(interFont)), "built companion is missing the Inter font");
  const source = built
    .replace(gsap, GSAP_MARKER)
    .replace(scrollTrigger, SCROLLTRIGGER_MARKER)
    .replace(fontDataUrl(pixelFont), PIXEL_FONT_REFERENCE)
    .replace(fontDataUrl(interFont), INTER_FONT_REFERENCE);
  await writeFile(sourcePath, source);
  console.log(`extracted tracked source: ${sourcePath}`);
} else {
  const outputDirectory = dirname(targetPath);
  const [source, gsap, scrollTrigger, pixelFont, interFont] = await Promise.all([
    readFile(sourcePath, "utf8"),
    readFile(`${outputDirectory}/vendor/gsap.min.js`, "utf8"),
    readFile(`${outputDirectory}/vendor/ScrollTrigger.min.js`, "utf8"),
    readFile(`${outputDirectory}/${PIXEL_FONT_REFERENCE}`),
    readFile(`${outputDirectory}/${INTER_FONT_REFERENCE}`),
  ]);
  assert.ok(source.includes(GSAP_MARKER), "source is missing GSAP marker");
  assert.ok(source.includes(SCROLLTRIGGER_MARKER), "source is missing ScrollTrigger marker");
  const built = source
    .replace(GSAP_MARKER, () => gsap)
    .replace(SCROLLTRIGGER_MARKER, () => scrollTrigger)
    .replace(PIXEL_FONT_REFERENCE, () => fontDataUrl(pixelFont))
    .replace(INTER_FONT_REFERENCE, () => fontDataUrl(interFont));
  await writeFile(targetPath, built);
  console.log(`built standalone companion: ${targetPath}`);
}
