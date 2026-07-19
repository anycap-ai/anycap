import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";

import nextConfig from "../next.config.ts";

const require = createRequire(import.meta.url);
const nextPackageRoot = path.dirname(require.resolve("next/package.json"));

const edgeSsrAppTemplates = [
  "dist/build/templates/edge-ssr-app.js",
  "dist/esm/build/templates/edge-ssr-app.js",
];

test("blocks streamed metadata for browsers and Googlebot", () => {
  assert.ok(nextConfig.htmlLimitedBots instanceof RegExp);
  assert.equal(
    nextConfig.htmlLimitedBots.test(
      "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    ),
    true,
  );
  assert.equal(
    nextConfig.htmlLimitedBots.test(
      "Mozilla/5.0 AppleWebKit/537.36 Chrome/136.0 Safari/537.36",
    ),
    true,
  );
});

for (const templatePath of edgeSsrAppTemplates) {
  test(`honors htmlLimitedBots in ${templatePath}`, async () => {
    const templateSource = await readFile(
      path.join(nextPackageRoot, templatePath),
      "utf8",
    );

    assert.match(
      templateSource,
      /const userAgent = req\.headers\.get\('User-Agent'\) \|\| '';/,
    );
    assert.equal(
      templateSource.match(/req\.headers\.get\('User-Agent'\)/g)?.length,
      1,
    );
    assert.match(templateSource, /getBotType\)?\(userAgent\)/);
    assert.match(
      templateSource,
      /shouldServeStreamingMetadata\)?\(\s*userAgent,\s*nextConfig\.htmlLimitedBots\s*\)/,
    );
    assert.doesNotMatch(templateSource, /serveStreamingMetadata:\s*true/);
  });
}
