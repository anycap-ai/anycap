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

test("rejects auxiliary mouse without phase change or pointer capture", async () => {
  const { beginAgentCorePointerSession, nextAgentCorePhase } = await loadState();
  let phase = "awaiting";
  let captureCount = 0;
  const result = beginAgentCorePointerSession(null, {
    pointerId: 7,
    pointerType: "mouse",
    isPrimary: true,
    button: 1,
  });

  if (result.action === "capture-drag") {
    captureCount += 1;
    phase = nextAgentCorePhase(phase, "drag-start");
  }

  assert.deepEqual(result, { session: null, action: "ignore" });
  assert.equal(captureCount, 0);
  assert.equal(phase, "awaiting");
});

test("accepts only one primary pointer session at a time", async () => {
  const { beginAgentCorePointerSession } = await loadState();
  const first = beginAgentCorePointerSession(null, {
    pointerId: 11,
    pointerType: "mouse",
    isPrimary: true,
    button: 0,
  });
  const overlap = beginAgentCorePointerSession(first.session, {
    pointerId: 12,
    pointerType: "touch",
    isPrimary: true,
    button: 0,
  });

  assert.deepEqual(first, {
    session: { pointerId: 11, kind: "drag" },
    action: "capture-drag",
  });
  assert.deepEqual(overlap, { session: first.session, action: "ignore" });
});

test("requires a primary left mouse or pen pointer but accepts primary touch", async () => {
  const { beginAgentCorePointerSession } = await loadState();

  assert.equal(
    beginAgentCorePointerSession(null, {
      pointerId: 20,
      pointerType: "mouse",
      isPrimary: false,
      button: 0,
    }).action,
    "ignore",
  );
  assert.equal(
    beginAgentCorePointerSession(null, {
      pointerId: 21,
      pointerType: "pen",
      isPrimary: true,
      button: 2,
    }).action,
    "ignore",
  );
  assert.equal(
    beginAgentCorePointerSession(null, {
      pointerId: 22,
      pointerType: "mouse",
      isPrimary: true,
      button: 0,
    }).action,
    "capture-drag",
  );
  assert.equal(
    beginAgentCorePointerSession(null, {
      pointerId: 23,
      pointerType: "touch",
      isPrimary: true,
      button: 0,
    }).action,
    "capture-touch",
  );
});

test("pointer up, cancel, and lost capture each close a drag session once", async () => {
  const { finishAgentCorePointerSession } = await loadState();
  const reasons = [
    ["up", "install"],
    ["cancel", "return-dock"],
    ["lost-capture", "return-dock"],
  ];

  for (const [reason, action] of reasons) {
    const session = { pointerId: 31, kind: "drag" };
    const first = finishAgentCorePointerSession(session, {
      pointerId: 31,
      reason,
      moved: false,
      dropAccepted: false,
    });
    const duplicate = finishAgentCorePointerSession(first.session, {
      pointerId: 31,
      reason: "lost-capture",
      moved: false,
      dropAccepted: false,
    });

    assert.deepEqual(first, { session: null, action }, reason);
    assert.deepEqual(duplicate, { session: null, action: "ignore" }, `${reason} duplicate`);
  }
});

test("touch cancel and lost capture close without installing", async () => {
  const { finishAgentCorePointerSession } = await loadState();
  for (const reason of ["cancel", "lost-capture"]) {
    const result = finishAgentCorePointerSession(
      { pointerId: 41, kind: "touch" },
      {
        pointerId: 41,
        reason,
        moved: false,
        dropAccepted: false,
      },
    );
    assert.deepEqual(result, { session: null, action: "close" }, reason);
  }
});
