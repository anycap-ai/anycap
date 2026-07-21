import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import * as agentCore3DState from "../src/components/landing/agent-core/agent-core-3d-state.ts";
import {
  AGENT_CORE_SCENE_ASPECT,
  AGENT_CORE_WORLD_SPAN,
  agentCoreOrthographicZoom,
  createAgentCore3DBridge,
  mapAgentCorePointerDeltaToWorld,
  mapCoreInstallPose,
  mapHeadTarget,
  projectAgentCoreInteractiveTargets,
  projectAgentCorePoseToScene,
} from "../src/components/landing/agent-core/agent-core-3d-state.ts";

const robotSourceUrl = new URL(
  "../src/components/landing/agent-core/AgentCoreRobot3D.tsx",
  import.meta.url,
);
const canvasSourceUrl = new URL(
  "../src/components/landing/agent-core/AgentCoreCanvas.tsx",
  import.meta.url,
);

test("head targets clamp normalized pointers to the approved rotation bounds", () => {
  assert.deepEqual(mapHeadTarget({ x: 4, y: -3 }), {
    yaw: 0.16,
    pitch: -0.09,
  });
  assert.deepEqual(mapHeadTarget({ x: -4, y: 3 }), {
    yaw: -0.16,
    pitch: 0.09,
  });
  assert.deepEqual(mapHeadTarget({ x: 0.5, y: -0.5 }), {
    yaw: 0.08,
    pitch: -0.045,
  });
});

test("Core installation clamps progress and preserves the approved endpoint poses", () => {
  const tablePose = mapCoreInstallPose(0);
  const socketPose = mapCoreInstallPose(1);

  assert.deepEqual(mapCoreInstallPose(-2), tablePose);
  assert.deepEqual(mapCoreInstallPose(3), socketPose);
  assert.deepEqual(tablePose, {
    position: [0.38, -2.08, 0.72],
    rotation: [-0.12, 0.08, -0.04],
    scale: 0.82,
  });
  assert.deepEqual(socketPose, {
    position: [0, -0.34, 1.18],
    rotation: [0, 0, 0],
    scale: 0.72,
  });
});

test("each 3D bridge begins in the awaiting state without shared mutable values", () => {
  const first = createAgentCore3DBridge();
  const second = createAgentCore3DBridge();

  assert.notEqual(first, second);
  assert.notEqual(first.pointerTarget, second.pointerTarget);
  assert.deepEqual(first.pointerTarget, { x: 0, y: 0 });
  assert.deepEqual(first.pointerCurrent, { yaw: 0, pitch: 0 });
  assert.equal(first.installProgress, 0);
  assert.equal(first.activationProgress, 0);
  assert.equal(first.connected, false);
  assert.deepEqual(first.dragOffset, { x: 0, y: 0, z: 0 });
  assert.equal(first.sceneActive, false);
  assert.equal(first.invalidate, null);
});

test("activation stays dormant before activate, pulses once, and settles connected", () => {
  assert.equal(
    typeof agentCore3DState.mapAgentCoreActivation,
    "function",
    "pure activation mapping helper",
  );

  const awaiting = agentCore3DState.mapAgentCoreActivation(0);
  const midpoint = agentCore3DState.mapAgentCoreActivation(0.5);
  const connected = agentCore3DState.mapAgentCoreActivation(1);

  assert.equal(awaiting.socketScale, 1, "no socket contraction before activate");
  assert.equal(awaiting.coreEmissiveIntensity, 0.02, "no Core glow before activate");
  assert.deepEqual(
    awaiting.visorEmissiveIntensities,
    Array.from({ length: 11 }, () => 0.04),
    "no visor glow before activate",
  );
  assert.ok(
    midpoint.coreEmissiveIntensity > connected.coreEmissiveIntensity,
    "bounded Core pulse peaks above its settled connected intensity",
  );
  assert.equal(connected.socketScale, 0.92, "socket finishes contracted");
  assert.ok(
    midpoint.visorEmissiveIntensities[5] > awaiting.visorEmissiveIntensities[5],
    "centre visor cell has activated by the midpoint",
  );
  assert.equal(
    agentCore3DState.mapAgentCoreActivation(0.15).visorEmissiveIntensities[0],
    awaiting.visorEmissiveIntensities[0],
    "edge visor cell remains dormant after the centre begins",
  );
  assert.ok(
    connected.visorEmissiveIntensities.every(
      (intensity) => intensity > awaiting.visorEmissiveIntensities[0],
    ),
    "all visor cells finish illuminated",
  );
});

test("procedural overlays project the table Core and chest socket from one 4.8-world-unit contract", () => {
  assert.equal(AGENT_CORE_WORLD_SPAN, 4.8);
  assert.equal(AGENT_CORE_SCENE_ASPECT, 0.94);

  for (const sceneWidth of [320, 499, 640]) {
    const targets = projectAgentCoreInteractiveTargets(sceneWidth);
    const tableProjection = projectAgentCorePoseToScene(mapCoreInstallPose(0), sceneWidth);
    const socketProjection = projectAgentCorePoseToScene(mapCoreInstallPose(1), sceneWidth);

    assert.deepEqual(targets.tableCore, tableProjection, `${sceneWidth}px table Core`);
    assert.deepEqual(targets.chestSocket, socketProjection, `${sceneWidth}px chest socket`);
    assert.equal(targets.tableCore.css.width, targets.tableCore.css.height);
    assert.equal(targets.chestSocket.css.width, targets.chestSocket.css.height);
  }
});

test("manifest fallback groups shift their physical anchors onto the procedural targets", async () => {
  assert.equal(
    typeof agentCore3DState.deriveAgentCoreFallbackShifts,
    "function",
    "pure fallback alignment helper",
  );

  const manifest = JSON.parse(
    await readFile(
      new URL("../public/visuals/agent-core/asset-manifest.json", import.meta.url),
      "utf8",
    ),
  );
  const targets = projectAgentCoreInteractiveTargets(100);
  const sceneLeft = manifest.assets.body.canonicalPlacement.x;
  const sceneWidth = manifest.artboard.width - sceneLeft;
  const normalizedAnchor = (placement, anchor) => ({
    x: (placement.x + anchor.x * placement.scale - sceneLeft) / sceneWidth,
    y: (placement.y + anchor.y * placement.scale) / manifest.artboard.height,
  });
  const robotSocket = normalizedAnchor(
    manifest.assets.body.canonicalPlacement,
    manifest.assets.body.localAnchors.socketCenter,
  );
  const dockSeat = normalizedAnchor(
    manifest.assets.dock.canonicalPlacement,
    manifest.assets.dock.localAnchors.coreSeat,
  );
  const shifts = agentCore3DState.deriveAgentCoreFallbackShifts({
    artboard: manifest.artboard,
    sceneLeft,
    robotSocket: {
      placement: manifest.assets.body.canonicalPlacement,
      localAnchor: manifest.assets.body.localAnchors.socketCenter,
    },
    dockSeat: {
      placement: manifest.assets.dock.canonicalPlacement,
      localAnchor: manifest.assets.dock.localAnchors.coreSeat,
    },
    targets,
  });
  const closeTo = (actual, expected, label) => {
    assert.ok(Math.abs(actual - expected) < 1e-12, `${label}: ${actual} !== ${expected}`);
  };

  closeTo(
    robotSocket.x + shifts.robot.x,
    targets.chestSocket.normalized.centerX,
    "fallback chest socket x",
  );
  closeTo(
    robotSocket.y + shifts.robot.y,
    targets.chestSocket.normalized.centerY,
    "fallback chest socket y",
  );
  closeTo(
    dockSeat.x + shifts.dock.x,
    targets.tableCore.normalized.centerX,
    "fallback dock seat x",
  );
  closeTo(
    dockSeat.y + shifts.dock.y,
    targets.tableCore.normalized.centerY,
    "fallback dock seat y",
  );
});

test("100px pointer deltas produce exactly 100px of projected Core movement at every scene width", () => {
  const closeTo = (actual, expected, label) => {
    assert.ok(Math.abs(actual - expected) < 1e-9, `${label}: ${actual} !== ${expected}`);
  };

  for (const sceneWidth of [320, 499, 640]) {
    const tablePose = mapCoreInstallPose(0);
    const before = projectAgentCorePoseToScene(tablePose, sceneWidth);
    const worldDelta = mapAgentCorePointerDeltaToWorld({ x: 100, y: 100 }, sceneWidth);
    const after = projectAgentCorePoseToScene(
      {
        ...tablePose,
        position: [
          tablePose.position[0] + worldDelta.x,
          tablePose.position[1] + worldDelta.y,
          tablePose.position[2],
        ],
      },
      sceneWidth,
    );

    closeTo(agentCoreOrthographicZoom(sceneWidth), sceneWidth / 4.8, `${sceneWidth}px zoom`);
    closeTo(after.css.centerX - before.css.centerX, 100, `${sceneWidth}px horizontal delta`);
    closeTo(after.css.centerY - before.css.centerY, 100, `${sceneWidth}px vertical delta`);
  }
});

test("procedural scene exposes semantic groups and contains no model service path", async () => {
  const [robotSource, canvasSource] = await Promise.all([
    readFile(robotSourceUrl, "utf8"),
    readFile(canvasSourceUrl, "utf8"),
  ]);
  const sceneSource = `${robotSource}\n${canvasSource}`;

  for (const groupName of [
    "RobotRoot",
    "Torso",
    "NeckPivot",
    "Head",
    "Visor",
    "ChestSocket",
    "AnyCapCore",
  ]) {
    assert.match(sceneSource, new RegExp(`name=[{]?['\"]${groupName}['\"]`));
  }

  assert.doesNotMatch(sceneSource, /useGLTF|\.glb\b|tripo/i);
});

test("Canvas is lazy, transparent, demand-rendered, and caps desktop and mobile DPR", async () => {
  const [robotSource, canvasSource] = await Promise.all([
    readFile(robotSourceUrl, "utf8"),
    readFile(canvasSourceUrl, "utf8"),
  ]);
  const sceneSource = `${robotSource}\n${canvasSource}`;

  assert.match(canvasSource, /dynamic\s*\(/);
  assert.match(canvasSource, /ssr:\s*false/);
  assert.match(sceneSource, /alpha:\s*true/);
  assert.match(sceneSource, /frameloop=["']demand["']/);
  assert.match(canvasSource, /DESKTOP_DPR_CAP\s*=\s*1\.5/);
  assert.match(canvasSource, /MOBILE_DPR_CAP\s*=\s*1\.25/);
  assert.match(robotSource, /size\.width\s*\/\s*AGENT_CORE_WORLD_SPAN/);
  assert.match(robotSource, /camera\.updateProjectionMatrix\(\)/);
  assert.match(robotSource, /invalidate\(\)/);
});

test("the procedural projection contract matches an axis-aligned R3F camera and root", async () => {
  const robotSource = await readFile(robotSourceUrl, "utf8");

  assert.match(
    robotSource,
    /camera=\{\{\s*position:\s*\[0,\s*0,\s*8\],\s*rotation:\s*\[0,\s*0,\s*0\]/,
  );
  assert.match(robotSource, /<group name="RobotRoot" position=\{\[0,\s*0,\s*0\]\}>/);
  assert.match(robotSource, /camera\.zoom\s*=\s*size\.width\s*\/\s*AGENT_CORE_WORLD_SPAN/);
});

test("R3F activation reads only activation progress and retains all eleven visor materials", async () => {
  const robotSource = await readFile(robotSourceUrl, "utf8");
  const activationFrame = robotSource.slice(
    robotSource.indexOf("const activation ="),
    robotSource.indexOf("const headIsMoving"),
  );

  assert.match(activationFrame, /bridge\.activationProgress/);
  assert.doesNotMatch(activationFrame, /bridge\.installProgress|bridge\.connected/);
  assert.match(robotSource, /visorMaterialRefs/);
  assert.match(robotSource, /Array\.from\(\{ length: 11 \}/);
  assert.match(robotSource, /visorEmissiveIntensities\[index\]/);
});

test("the caller owns one stable fallback layer and only toggles its visibility", async () => {
  const [robotSource, canvasSource] = await Promise.all([
    readFile(robotSourceUrl, "utf8"),
    readFile(canvasSourceUrl, "utf8"),
  ]);
  const sceneSource = await readFile(
    new URL("../src/components/landing/agent-core/AgentCoreScene.tsx", import.meta.url),
    "utf8",
  );
  const timelineSource = await readFile(
    new URL("../src/components/landing/agent-core/useAgentCoreTimeline.ts", import.meta.url),
    "utf8",
  );

  assert.equal((sceneSource.match(/data-agent-core-fallback(?:\s|>)/g) ?? []).length, 1);
  assert.match(sceneSource, /const \[canvasReady, setCanvasReady\] = useState\(false\)/);
  assert.match(sceneSource, /className=\{`\$\{styles\.fallbackVisual\}[\s\S]*styles\.fallbackHidden/);
  assert.match(sceneSource, /<AgentCoreCanvas[\s\S]*onReady=\{showCanvas\}[\s\S]*onUnavailable=\{showFallback\}/);
  assert.doesNotMatch(sceneSource, /fallback=\{fallback\}/);
  assert.doesNotMatch(canvasSource, /fallback:\s*ReactNode|AgentCoreCanvasErrorBoundary\s+fallback=/);
  const canvasOpening = robotSource.slice(
    robotSource.indexOf("<Canvas"),
    robotSource.indexOf("onCreated="),
  );
  assert.doesNotMatch(canvasOpening, /fallback=/);
  assert.match(robotSource, /<Suspense[\s\S]*<AgentCoreRobot3D[\s\S]*<SceneReadyReporter/);
  assert.match(timelineSource, /querySelector<HTMLElement>\("\[data-agent-core-fallback-core\]"\)/);
  assert.match(timelineSource, /coreVisualTargets:\s*HTMLElement\[\][\s\S]*fallbackCore/);
  assert.doesNotMatch(robotSource, /onCreated=\{\([\s\S]{0,160}setReady\(true\)/);
});

test("dynamic, render, and context failures keep the stable caller fallback visible until a frame restores it", async () => {
  const [robotSource, canvasSource] = await Promise.all([
    readFile(robotSourceUrl, "utf8"),
    readFile(canvasSourceUrl, "utf8"),
  ]);

  assert.match(canvasSource, /componentDidCatch[\s\S]*this\.props\.onUnavailable\(\)/);
  assert.match(canvasSource, /if \(this\.state\.failed\) return null/);
  assert.match(robotSource, /handleContextLost[\s\S]*onUnavailable\(\)/);
  assert.match(robotSource, /handleContextRestored[\s\S]*invalidate\(\)/);
  assert.match(robotSource, /useFrame\(\(\) => \{[\s\S]*reportReadyAfterRestoreRef[\s\S]*onReady\(\)/);
});

test("demand rendering continues only for internal smoothing convergence", async () => {
  const robotSource = await readFile(robotSourceUrl, "utf8");

  assert.match(robotSource, /if \(headIsMoving\) invalidate\(\)/);
  assert.doesNotMatch(robotSource, /installProgress\s*>\s*0\s*&&\s*bridge\.installProgress\s*<\s*1/);
});

test("WebGL context lifecycle restores the fallback and cleans up listeners", async () => {
  const robotSource = await readFile(robotSourceUrl, "utf8");

  assert.match(robotSource, /webglcontextlost/);
  assert.match(robotSource, /webglcontextrestored/);
  assert.match(robotSource, /onUnavailable\(\)/);
  assert.match(robotSource, /removeEventListener\(\s*["']webglcontextlost["']/);
  assert.match(robotSource, /removeEventListener\(\s*["']webglcontextrestored["']/);
});

test("DPR cap follows the mobile breakpoint after mount", async () => {
  const canvasSource = await readFile(canvasSourceUrl, "utf8");

  assert.match(canvasSource, /addEventListener\(\s*["']change["']/);
  assert.match(canvasSource, /removeEventListener\(\s*["']change["']/);
});
