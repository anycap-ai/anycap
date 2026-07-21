import assert from "node:assert/strict";
import test from "node:test";

async function loadState() {
  try {
    return await import("../src/components/landing/agent-core/agent-core-state.ts");
  } catch (error) {
    assert.fail(`agent core state must exist: ${error.message}`);
  }
}

test("clamps head rotation around a fixed pivot", async () => {
  const { clampHeadRotation } = await loadState();
  assert.deepEqual(
    clampHeadRotation({ x: 2000, y: -500 }, { left: 0, top: 0, width: 1000, height: 500 }),
    { yaw: 9, pitch: -5 },
  );
  assert.deepEqual(
    clampHeadRotation({ x: 500, y: 250 }, { left: 0, top: 0, width: 1000, height: 500 }),
    { yaw: 0, pitch: 0 },
  );
});

test("accepts a drop only when the Core center is inside the socket tolerance", async () => {
  const { isCoreDropAccepted } = await loadState();
  const socket = { left: 400, top: 200, width: 120, height: 120 };
  assert.equal(isCoreDropAccepted({ x: 460, y: 260 }, socket), true);
  assert.equal(isCoreDropAccepted({ x: 520, y: 260 }, socket), false);
});

test("commits installation once and ignores later drag events", async () => {
  const { nextAgentCorePhase } = await loadState();
  assert.equal(nextAgentCorePhase("awaiting", "drag-start"), "dragging");
  assert.equal(nextAgentCorePhase("dragging", "drop-rejected"), "awaiting");
  assert.equal(nextAgentCorePhase("dragging", "drop-accepted"), "installing");
  assert.equal(nextAgentCorePhase("installing", "install-complete"), "connected");
  assert.equal(nextAgentCorePhase("connected", "drag-start"), "connected");
});
