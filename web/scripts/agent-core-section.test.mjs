import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import { fileURLToPath } from "node:url";

const sectionPath = fileURLToPath(new URL("../src/components/landing/agent-core/AgentCoreInstallSection.tsx", import.meta.url));
const scenePath = fileURLToPath(new URL("../src/components/landing/agent-core/AgentCoreScene.tsx", import.meta.url));
const headPath = fileURLToPath(new URL("../src/components/landing/agent-core/AgentHeadTracker.tsx", import.meta.url));
const corePath = fileURLToPath(new URL("../src/components/landing/agent-core/AnyCapCoreControl.tsx", import.meta.url));
const telemetryPath = fileURLToPath(new URL("../src/components/landing/agent-core/CapabilityTelemetry.tsx", import.meta.url));
const stylesPath = fileURLToPath(new URL("../src/components/landing/agent-core/agent-core.module.css", import.meta.url));
const manifestPath = fileURLToPath(new URL("../public/visuals/agent-core/asset-manifest.json", import.meta.url));
const homepagePath = fileURLToPath(new URL("../src/components/landing/HumanHomePage.tsx", import.meta.url));
const agentCoreCanvasPath = fileURLToPath(
  new URL("../src/components/landing/agent-core/AgentCoreCanvas.tsx", import.meta.url),
);
const agentCoreRobot3DPath = fileURLToPath(
  new URL("../src/components/landing/agent-core/AgentCoreRobot3D.tsx", import.meta.url),
);
const agentCore3DStatePath = fileURLToPath(
  new URL("../src/components/landing/agent-core/agent-core-3d-state.ts", import.meta.url),
);
const hookPath = fileURLToPath(
  new URL("../src/components/landing/agent-core/useAgentCoreTimeline.ts", import.meta.url),
);
const packageJsonPath = fileURLToPath(new URL("../package.json", import.meta.url));
const lockfilePath = fileURLToPath(new URL("../pnpm-lock.yaml", import.meta.url));
const stagePath = fileURLToPath(
  new URL("../src/components/landing/agent-core/AgentCoreStage3D.tsx", import.meta.url),
);
const rigPath = fileURLToPath(
  new URL("../src/components/landing/agent-core/AgentCoreRig3D.tsx", import.meta.url),
);
const bridgePath = fileURLToPath(
  new URL("../src/components/landing/agent-core/agent-core-3d-bridge.ts", import.meta.url),
);
const modelContractPath = fileURLToPath(
  new URL("../public/visuals/agent-core-3d/model-contract.json", import.meta.url),
);

function source(path) {
  return readFileSync(path, "utf8");
}

test("locks the canonical master geometry and direct layout", () => {
  const manifest = JSON.parse(source(manifestPath));
  const css = source(stylesPath);

  assert.deepEqual(manifest.artboard, { width: 1672, height: 941 });
  assert.deepEqual(manifest.anchors.socketCenter, { x: 0.697, y: 0.625 });
  assert.deepEqual(manifest.anchors.dockCenter, { x: 0.637, y: 0.898 });
  assert.match(css, /grid-template-areas:\s*"copy telemetry scene"/);
  assert.match(
    css,
    /grid-template-columns:\s*minmax\(290px, 0\.78fr\)\s+minmax\(260px, 0\.58fr\)\s+minmax\(520px, 1\.28fr\)/,
  );
  assert.match(css, /font-family:\s*var\(--font-geist-pixel-square\), monospace/);
  assert.doesNotMatch(css, /\.(?:canvasLayer|fallbackHidden)\b/);
});

test("preserves the hero and inserts the agent Core section exactly once", () => {
  const homepage = source(homepagePath);
  assert.match(
    homepage,
    /<span\s+className="sr-only">\s*Your Agent can do anything\. It just needs AnyCap\.\s*<\/span>/,
  );
  assert.equal((homepage.match(/<AgentCoreInstallSection\s*\/>/g) ?? []).length, 1);
  assert.ok(homepage.indexOf("NOW IT CAN.") < homepage.indexOf("<AgentCoreInstallSection"));
  assert.ok(homepage.indexOf("<AgentCoreInstallSection") < homepage.indexOf("Any capability"));
});

test("fits the exact responsive tracks at every narrow boundary without clipping", () => {
  const styles = source(stylesPath);
  const baseSection = styles.match(/\.section\s*\{(?<body>[^}]*)\}/)?.groups?.body ?? "";
  const columns = [290, 260, 520];
  const requiredGridWidth = (viewport) => {
    const gap = Math.min(64, Math.max(28, viewport * 0.03));
    return columns.reduce((sum, width) => sum + width, 0) + gap * 2;
  };
  const availableWidth = (viewport) => viewport - (viewport <= 1342 ? 64 : 96) * 2;

  assert.match(
    styles,
    /grid-template-columns:\s*minmax\(290px,\s*0\.78fr\)\s+minmax\(260px,\s*0\.58fr\)\s+minmax\(520px,\s*1\.28fr\)\s*;/,
  );
  assert.match(styles, /gap:\s*clamp\(28px,\s*3vw,\s*64px\)\s*;/);
  assert.match(baseSection, /padding:\s*8rem\s+6rem\s*;/);
  assert.doesNotMatch(baseSection, /overflow-x:\s*clip\s*;/);
  assert.match(
    styles,
    /@media\s*\(min-width:\s*1280px\)\s*and\s*\(max-width:\s*1342px\)[\s\S]*?\.section\s*\{[^}]*padding-inline:\s*4rem\s*;[^}]*\}/,
  );
  assert.match(
    styles,
    /@media\s*\(min-width:\s*768px\)\s*and\s*\(max-width:\s*1279px\)[\s\S]*?\.section\s*\{[^}]*padding:\s*6rem\s+4rem\s*;[^}]*\}[\s\S]*?grid-template-columns:\s*minmax\(240px,\s*0\.78fr\)\s+minmax\(360px,\s*1\.22fr\)\s*;/,
  );
  assert.ok(768 - 64 * 2 >= 240 + 360 + 28, "768px tablet grid");
  for (const viewport of [1280, 1342, 1343]) {
    assert.ok(availableWidth(viewport) >= requiredGridWidth(viewport), `${viewport}px desktop grid`);
  }
});

test("keeps each approved headline span within the narrowest responsive copy track", () => {
  const styles = source(stylesPath);
  const copy = styles.match(/\.copy\s*\{(?<body>[^}]*)\}/)?.groups?.body ?? "";
  const heading = styles.match(/\.heading\s*\{(?<body>[^}]*)\}/)?.groups?.body ?? "";
  const headingSpans = styles.match(/\.heading\s+span\s*\{(?<body>[^}]*)\}/)?.groups?.body ?? "";
  const fallbackWidthEm = 12.2;
  const boundaryTracks = [
    { viewport: 320, width: 256 },
    { viewport: 768, width: 240 },
    { viewport: 1280, width: 290 },
  ];

  assert.match(copy, /container-type:\s*inline-size\s*;/);
  assert.match(heading, /font-size:\s*clamp\(19px,\s*8cqi,\s*42px\)\s*;/);
  assert.match(headingSpans, /white-space:\s*nowrap\s*;/);
  assert.equal((styles.match(/\.heading\s*\{/g) ?? []).length, 1);
  for (const { viewport, width } of boundaryTracks) {
    const fontSize = Math.min(42, Math.max(19, width * 0.08));
    assert.ok(fontSize * fallbackWidthEm <= width, `${viewport}px headline`);
  }
});

test("defines a stable scoped awaiting visual token for the no-script fallback", () => {
  const section = source(sectionPath);
  const scene = source(scenePath);
  const telemetry = source(telemetryPath);
  const styles = source(stylesPath);

  assert.match(styles, /\.awaitingVisual\s*\{[^}]+\}/);
  assert.equal((`${scene}\n${telemetry}`.match(/styles\.awaitingVisual/g) ?? []).length, 2);
  assert.match(
    section,
    /\[data-agent-core-section\]\s+\.\$\{styles\.awaitingVisual\}\s*\{\s*display:\s*none\s*!important;\s*\}/,
  );
});

test("keeps text in DOM and visuals in real image assets", () => {
  const section = source(sectionPath);
  const scene = `${source(scenePath)}\n${source(headPath)}\n${source(corePath)}`;
  const telemetry = source(telemetryPath);
  for (const text of [
    "One capability layer.",
    "Every way to finish.",
    "Human + agent",
    "Create. Understand. Find. Manage. Deliver.",
    "anycap install",
  ]) assert.ok(section.includes(text), text);
  for (const file of ["robot-body.webp", "robot-head.webp", "anycap-core.webp", "core-dock.webp"]) {
    assert.ok(scene.includes(file), file);
  }
  assert.match(scene, /from "next\/image"/);
  assert.match(telemetry, /getAgentCoreStats/);
  assert.match(section, /<noscript>/);
});

test("does not duplicate the page surface or draw fake visual assets", () => {
  const combined = `${source(sectionPath)}\n${source(scenePath)}\n${source(headPath)}\n${source(corePath)}\n${source(stylesPath)}`;
  assert.doesNotMatch(combined, /<svg\b|linear-gradient|radial-gradient|background-image/);
  assert.doesNotMatch(combined, /bg-\[#f4f5f0\]/);
});

test("locks telemetry, accessibility, manifest, and static-only source contracts", () => {
  const section = source(sectionPath);
  const scene = source(scenePath);
  const core = source(corePath);
  const telemetry = source(telemetryPath);
  const taskFourComponents = `${section}\n${scene}\n${source(headPath)}\n${core}\n${telemetry}`;

  assert.match(
    telemetry,
    /const\s+telemetryCells\s*=\s*Array\.from\(\s*\{\s*length:\s*12\s*\}\s*\)\s*;/,
  );
  assert.equal((telemetry.match(/telemetryCells\.map\(/g) ?? []).length, 1);
  assert.match(core, /aria-label="Install the AnyCap Core"/);
  assert.match(
    scene,
    /import\s+assetManifest\s+from\s+"\.\.\/\.\.\/\.\.\/\.\.\/public\/visuals\/agent-core\/asset-manifest\.json"\s*;/,
  );
  assert.match(scene, /const\s*\{\s*artboard,\s*assets,\s*anchors\s*\}\s*=\s*assetManifest\s*;/);
  assert.doesNotMatch(taskFourComponents, /\bgsap\b|ScrollTrigger|useGSAP/);
  assert.doesNotMatch(
    taskFourComponents,
    /setPhase|use(?:Effect|LayoutEffect)|setPointerCapture|releasePointerCapture|pointerId|client[XY]|requestAnimationFrame/,
  );
  assert.doesNotMatch(
    taskFourComponents,
    /\b(?:getContext|fillRect|strokeRect|clearRect|beginPath|moveTo|lineTo|arc|fill|stroke|drawImage|putImageData|createImageData)\s*\(/,
  );
});

test("keeps the approved master layers mounted as the guarded fallback surface", () => {
  const section = source(sectionPath);
  const scene = source(scenePath);
  const coreControl = source(corePath);
  const hook = source(hookPath);

  assert.match(scene, /robot-body\.webp/);
  assert.match(scene, /<AgentHeadTracker\s+headRef=\{headRef\}/);
  assert.match(scene, /core-dock\.webp/);
  assert.match(coreControl, /anycap-core\.webp/);
  assert.doesNotMatch(scene, /AgentCoreCanvas|fallbackHidden|canvasReady/);
  assert.match(section, /createAgentCore3DBridge/);
  assert.match(section, /bridge=\{bridge\}/);
  assert.match(section, /onPhaseChange:\s*handlePhaseChange/);
  assert.match(section, /updateBridgePhase\(bridge, nextPhase\)[\s\S]*bridge\.invalidate\?\.\(\)/);

  const directLayerOrder = [
    "<div className={styles.table}",
    "<div className={styles.body}",
    "<AgentHeadTracker headRef={headRef}",
    "<div ref={socketRef} className={styles.socket}",
    "<canvas",
    "<div ref={dockRef} className={styles.dock}",
    "<AnyCapCoreControl",
  ].map((marker) => scene.indexOf(marker));
  assert.ok(directLayerOrder.every((index) => index >= 0), "every approved direct layer exists");
  assert.deepEqual(directLayerOrder, [...directLayerOrder].sort((left, right) => left - right));
});

test("exposes every approved manifest placement as a scene CSS variable", () => {
  const scene = source(scenePath);

  for (const variable of [
    "--agent-body-left",
    "--agent-body-top",
    "--agent-body-width",
    "--agent-head-left",
    "--agent-head-top",
    "--agent-head-width",
    "--agent-core-left",
    "--agent-core-top",
    "--agent-core-width",
    "--agent-dock-left",
    "--agent-dock-top",
    "--agent-dock-width",
    "--agent-socket-left",
    "--agent-socket-top",
    "--agent-socket-size",
  ]) {
    assert.ok(scene.includes(`"${variable}"`), variable);
  }
});

test("loads the approved local GLB through a guarded demand-rendered stage", () => {
  const section = source(sectionPath);
  const scene = source(scenePath);
  const styles = source(stylesPath);
  const stage = source(stagePath);
  const rig = source(rigPath);
  const bridge = source(bridgePath);
  const packageJson = source(packageJsonPath);
  const lockfile = source(lockfilePath);
  const contract = JSON.parse(source(modelContractPath));
  const { forbidden: _forbiddenTokens, ...runtimeContract } = contract;
  const runtimeLockfile = lockfile
    .split("\n")
    .filter((line) => !/^\s*deprecated:/.test(line))
    .join("\n");

  assert.equal(existsSync(agentCoreCanvasPath), false);
  assert.equal(existsSync(agentCoreRobot3DPath), false);
  assert.equal(existsSync(agentCore3DStatePath), false);
  assert.match(section, /dynamic\(.*AgentCoreStage3D/);
  assert.match(section, /<AgentCoreScene/);
  assert.match(stage, /frameloop="demand"/);
  assert.match(stage, /alpha:\s*true/);
  assert.match(stage, /dpr=\{isMobile \? \[1, 1\.25\] : \[1, 1\.5\]\}/);
  assert.match(rig, /agent-core-upper-body\.glb/);
  assert.match(rig, /useGLTF/);
  assert.doesNotMatch(rig, /boxGeometry|sphereGeometry|capsuleGeometry|cylinderGeometry/);
  assert.match(bridge, /createAgentCore3DBridge/);
  assert.match(styles, /\.stageReady[\s\S]*\.fallbackVisual/);
  assert.match(scene, /styles\.fallbackVisual/);
  assert.match(packageJson, /"@react-three\/fiber":\s*"9\.6\.1"/);
  assert.match(packageJson, /"@react-three\/drei":\s*"10\.7\.7"/);
  assert.match(packageJson, /"three":\s*"0\.185\.1"/);
  assert.match(packageJson, /"@types\/three":\s*"0\.185\.1"/);
  assert.match(lockfile, /@react-three\/fiber/);
  assert.doesNotMatch(
    `${stage}\n${rig}\n${JSON.stringify(runtimeContract)}\n${packageJson}\n${runtimeLockfile}`,
    /https?:\/\//,
  );
});

test("keeps the fallback visible until rig readiness and restores it on failure", () => {
  const section = source(sectionPath);
  const scene = source(scenePath);
  const stage = source(stagePath);
  const styles = source(stylesPath);

  assert.match(section, /onReady=\{handleStageReady\}/);
  assert.match(section, /onError=\{handleStageError\}/);
  assert.match(section, /handleStageReady[\s\S]*setStageReady\(true\)/);
  assert.match(section, /handleStageError[\s\S]*setStageReady\(false\)/);
  assert.doesNotMatch(section, /(?:onLoad|onLoadStart)[\s\S]{0,120}setStageReady\(true\)/);
  assert.match(styles, /\.fallbackVisual\s*\{[^}]*opacity:\s*1\s*;/);
  assert.match(styles, /\.stageReady\s*\+\s*\.fallbackVisual\s*\{[^}]*opacity:\s*0\s*;/);
  assert.ok(scene.indexOf("{stage}") < scene.indexOf("styles.fallbackVisual"));
  assert.match(stage, /classList\.remove\(styles\.stageReady\)[\s\S]*onError\(\)/);
  assert.match(stage, /stageHealthy\.current\s*=\s*false[\s\S]*onError\(\)/);
  assert.match(stage, /if\s*\(stageHealthy\.current\)\s*onReady\(\)/);
});
