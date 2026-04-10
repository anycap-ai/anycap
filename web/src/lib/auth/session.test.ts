import test from "node:test";
import assert from "node:assert/strict";

import { normalizeReturnTo } from "./session";

test("normalizeReturnTo keeps device completion callback", () => {
  assert.equal(normalizeReturnTo("/auth/device/complete"), "/auth/device/complete");
});

test("normalizeReturnTo still blocks other auth routes", () => {
  assert.equal(normalizeReturnTo("/auth/login"), "/dashboard");
});
