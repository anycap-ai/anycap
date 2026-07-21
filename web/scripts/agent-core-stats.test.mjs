import assert from "node:assert/strict";
import test from "node:test";

async function loadStats() {
  try {
    return await import("../src/components/landing/agent-core/agent-core-stats.ts");
  } catch (error) {
    assert.fail(`agent core stats must exist: ${error.message}`);
  }
}

test("derives the five connected values from the public capability inventory", async () => {
  const { getAgentCoreStats } = await loadStats();
  const stats = getAgentCoreStats();
  assert.deepEqual(
    stats.map(({ id, label, value }) => ({ id, label, value })),
    [
      { id: "create", label: "Create", value: 4 },
      { id: "understand", label: "Understand", value: 3 },
      { id: "search", label: "Search", value: 3 },
      { id: "manage", label: "Manage", value: 1 },
      { id: "deliver", label: "Deliver", value: 1 },
    ],
  );
  assert.equal(stats.flatMap((entry) => entry.capabilities).length, 12);
});

test("formats values as stable two-digit telemetry", async () => {
  const { formatAgentCoreValue } = await loadStats();
  assert.equal(formatAgentCoreValue(0), "00");
  assert.equal(formatAgentCoreValue(4), "04");
  assert.equal(formatAgentCoreValue(12), "12");
});
