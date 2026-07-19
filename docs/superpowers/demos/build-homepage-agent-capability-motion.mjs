import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const directory = fileURLToPath(new URL(".", import.meta.url));
const sourcePath = `${directory}/homepage-agent-capability-motion.source.html`;
const [mode, targetPath] = process.argv.slice(2);
const GSAP_MARKER = "/*__INLINE_GSAP__*/";
const SCROLLTRIGGER_MARKER = "/*__INLINE_SCROLLTRIGGER__*/";

assert.ok(mode === "extract" || mode === "build", "mode must be extract or build");
assert.ok(targetPath?.startsWith("/"), "target path must be absolute");

if (mode === "extract") {
  const outputDirectory = dirname(targetPath);
  const [built, gsap, scrollTrigger] = await Promise.all([
    readFile(targetPath, "utf8"),
    readFile(`${outputDirectory}/vendor/gsap.min.js`, "utf8"),
    readFile(`${outputDirectory}/vendor/ScrollTrigger.min.js`, "utf8"),
  ]);
  assert.ok(built.includes(gsap), "built companion is missing GSAP runtime");
  assert.ok(built.includes(scrollTrigger), "built companion is missing ScrollTrigger runtime");
  const source = built
    .replace(gsap, GSAP_MARKER)
    .replace(scrollTrigger, SCROLLTRIGGER_MARKER);
  await writeFile(sourcePath, source);
  console.log(`extracted tracked source: ${sourcePath}`);
} else {
  const outputDirectory = dirname(targetPath);
  const [source, gsap, scrollTrigger] = await Promise.all([
    readFile(sourcePath, "utf8"),
    readFile(`${outputDirectory}/vendor/gsap.min.js`, "utf8"),
    readFile(`${outputDirectory}/vendor/ScrollTrigger.min.js`, "utf8"),
  ]);
  assert.ok(source.includes(GSAP_MARKER), "source is missing GSAP marker");
  assert.ok(source.includes(SCROLLTRIGGER_MARKER), "source is missing ScrollTrigger marker");
  const built = source
    .replace(GSAP_MARKER, () => gsap)
    .replace(SCROLLTRIGGER_MARKER, () => scrollTrigger);
  await writeFile(targetPath, built);
  console.log(`built standalone companion: ${targetPath}`);
}
