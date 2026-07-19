import assert from "node:assert/strict";
import test from "node:test";

import { legacyRouteRedirects } from "../src/lib/legacy-route-redirects.ts";

test("redirects the stale Kling guide to the maintained video-agent guide", () => {
  assert.equal(
    legacyRouteRedirects.get("/guides/how-to-use-kling-in-ai-agent"),
    "/guides/how-to-add-video-generation-to-ai-agent",
  );
});

test("preserves the existing legacy redirect contracts", () => {
  assert.deepEqual(
    [...legacyRouteRedirects],
    [
      ["/for-human", "/"],
      ["/capabilities/image-read", "/capabilities/image-understanding"],
      ["/glossary/agent-capability-runtime", "/glossary/agent-harness"],
      [
        "/guides/how-to-use-kling-in-ai-agent",
        "/guides/how-to-add-video-generation-to-ai-agent",
      ],
    ],
  );
});
