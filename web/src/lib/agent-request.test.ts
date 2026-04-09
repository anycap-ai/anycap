import test from "node:test";
import assert from "node:assert/strict";

import { shouldServeAgentMarkdown } from "./agent-request";

const baseInput = {
  pathname: "/",
  searchParams: new URLSearchParams(),
};

test("known AI agents still negotiate to markdown on the home route", () => {
  assert.equal(
    shouldServeAgentMarkdown({
      ...baseInput,
      userAgent: "Mozilla/5.0 (compatible; GPTBot/1.0; +https://openai.com/gptbot)",
      accept: "*/*",
    }),
    true
  );
});

test("generic programmatic clients no longer get markdown by default", () => {
  assert.equal(
    shouldServeAgentMarkdown({
      ...baseInput,
      userAgent: "curl/8.7.1",
      accept: "*/*",
    }),
    false
  );
});

test("generic programmatic clients can still opt in via markdown accept headers", () => {
  assert.equal(
    shouldServeAgentMarkdown({
      ...baseInput,
      userAgent: "curl/8.7.1",
      accept: "text/plain",
    }),
    true
  );
});

test("view=agent still forces markdown", () => {
  assert.equal(
    shouldServeAgentMarkdown({
      ...baseInput,
      searchParams: new URLSearchParams("view=agent"),
      userAgent: "curl/8.7.1",
      accept: "*/*",
    }),
    true
  );
});
