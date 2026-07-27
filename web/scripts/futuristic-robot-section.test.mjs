import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { fileURLToPath } from "node:url";

import contract from "../public/visuals/futuristic-robot/model-contract.json" with { type: "json" };

const assetDirectory = fileURLToPath(
  new URL("../public/visuals/futuristic-robot/", import.meta.url),
);

async function readGlbJson() {
  const bytes = await readFile(`${assetDirectory}${contract.asset.file}`);
  assert.equal(bytes.subarray(0, 4).toString(), "glTF", "asset is a binary glTF");
  const jsonLength = bytes.readUInt32LE(12);
  const json = JSON.parse(
    bytes
      .subarray(20, 20 + jsonLength)
      .toString("utf8")
      .replace(/\0+$/, ""),
  );
  return { bytes, json };
}

test("keeps the futuristic robot inside its web asset contract", async () => {
  const { bytes, json } = await readGlbJson();
  assert.ok(bytes.byteLength <= contract.asset.maxBytes, "asset byte budget");
  const reference = await readFile(`${assetDirectory}${contract.asset.reference}`);
  assert.ok(
    reference.byteLength <= contract.asset.maxReferenceBytes,
    "reference image byte budget",
  );
  assert.equal(
    reference.subarray(0, 8).toString("hex"),
    "89504e470d0a1a0a",
    "reference is a PNG",
  );

  const nodeNames = new Set(json.nodes.map((node) => node.name));
  for (const name of contract.requiredNodes) {
    assert.ok(nodeNames.has(name), `required node ${name}`);
  }

  const triangles = json.meshes
    .flatMap((mesh) => mesh.primitives)
    .reduce((total, primitive) => {
      const accessor = json.accessors[primitive.indices];
      return total + accessor.count / 3;
    }, 0);
  assert.ok(triangles <= contract.asset.maxTriangles, "triangle budget");
  assert.ok(json.skins?.length > 0, "robot keeps its exported skin");
  const headNode = json.nodes.findIndex((node) => node.name === "Head");
  const neckNode = json.nodes.findIndex((node) => node.name === "neck");
  assert.ok(
    json.skins.some(
      (skin) => skin.joints.includes(headNode) && skin.joints.includes(neckNode),
    ),
    "Head and neck remain skin joints",
  );
});

test("keeps the cinematic loop and poster deployable", async () => {
  const video = await readFile(`${assetDirectory}futuristic-agent-loop.mp4`);
  const installVideo = await readFile(
    `${assetDirectory}futuristic-agent-reactor-stable-install-v3.mp4`,
  );
  const uninstallVideo = await readFile(
    `${assetDirectory}futuristic-agent-reactor-stable-uninstall-v3.mp4`,
  );
  const poster = await readFile(
    `${assetDirectory}futuristic-agent-stable-idle-poster-v2.png`,
  );
  const crispFinalFrame = await readFile(
    `${assetDirectory}futuristic-agent-reactor-latch-crisp-final.png`,
  );

  assert.ok(video.byteLength <= 5_000_000, "video stays within its web byte budget");
  assert.ok(
    installVideo.byteLength <= 5_000_000,
    "install video stays within its web byte budget",
  );
  assert.ok(
    uninstallVideo.byteLength <= 5_000_000,
    "uninstall video stays within its web byte budget",
  );
  assert.equal(video.subarray(4, 8).toString(), "ftyp", "video is an MP4");
  assert.equal(
    installVideo.subarray(4, 8).toString(),
    "ftyp",
    "install video is an MP4",
  );
  assert.equal(
    uninstallVideo.subarray(4, 8).toString(),
    "ftyp",
    "uninstall video is an MP4",
  );
  assert.equal(
    poster.subarray(0, 8).toString("hex"),
    "89504e470d0a1a0a",
    "poster is a PNG",
  );
  assert.ok(
    crispFinalFrame.byteLength <= 3_000_000,
    "crisp final frame stays within its web byte budget",
  );
  assert.equal(
    crispFinalFrame.subarray(0, 8).toString("hex"),
    "89504e470d0a1a0a",
    "crisp final frame is a PNG",
  );
});

test("reveals below-fold landing sections only when they enter the viewport", async () => {
  const reveal = await readFile(
    new URL("../src/components/ui/ScrollReveal.tsx", import.meta.url),
    "utf8",
  );
  const homepage = await readFile(
    new URL("../src/components/landing/HumanHomePage.tsx", import.meta.url),
    "utf8",
  );
  const workflow = await readFile(
    new URL(
      "../src/components/landing/TerminalWorkflowSection.tsx",
      import.meta.url,
    ),
    "utf8",
  );

  assert.match(reveal, /ScrollTrigger/);
  assert.match(reveal, /start: "top 88%"/);
  assert.match(reveal, /once: true/);
  assert.match(reveal, /prefers-reduced-motion: reduce/);
  assert.match(reveal, /transform,opacity,visibility,willChange/);
  assert.doesNotMatch(reveal, /addEventListener\(["']scroll/);
  assert.match(homepage, /<ScrollReveal[\s>]/);
  assert.match(homepage, /<ScrollReveal delay=\{80\}>\s*<CapabilityMarquee \/>/);
  assert.doesNotMatch(homepage, /<FadeIn[\s>]/);
  assert.match(workflow, /<ScrollReveal from="left">/);
  assert.match(workflow, /<ScrollReveal from="right" delay=\{120\}>/);
});

test("section defers video loading and keeps the 3D fallback implementation", async () => {
  const section = await readFile(
    new URL(
      "../src/components/landing/futuristic-robot/FuturisticRobotSection.tsx",
      import.meta.url,
    ),
    "utf8",
  );
  const stage = await readFile(
    new URL(
      "../src/components/landing/futuristic-robot/FuturisticRobotStage.tsx",
      import.meta.url,
    ),
    "utf8",
  );
  const cinematic = await readFile(
    new URL(
      "../src/components/landing/futuristic-robot/FuturisticRobotCinematic.tsx",
      import.meta.url,
    ),
    "utf8",
  );
  const rig = await readFile(
    new URL(
      "../src/components/landing/futuristic-robot/FuturisticRobotRig.tsx",
      import.meta.url,
    ),
    "utf8",
  );
  const styleSheet = await readFile(
    new URL(
      "../src/components/landing/futuristic-robot/futuristic-robot.module.css",
      import.meta.url,
    ),
    "utf8",
  );
  const homepage = await readFile(
    new URL("../src/components/landing/HumanHomePage.tsx", import.meta.url),
    "utf8",
  );
  const workflow = await readFile(
    new URL(
      "../src/components/landing/TerminalWorkflowSection.tsx",
      import.meta.url,
    ),
    "utf8",
  );
  const terminal = await readFile(
    new URL("../src/components/landing/TerminalDemo.tsx", import.meta.url),
    "utf8",
  );
  const particleAgent = await readFile(
    new URL("../src/components/landing/ParticleAgent.tsx", import.meta.url),
    "utf8",
  );
  const marqueeController = await readFile(
    new URL(
      "../src/components/landing/CapabilityMarqueeActivityController.tsx",
      import.meta.url,
    ),
    "utf8",
  );
  const marqueeStyleSheet = await readFile(
    new URL(
      "../src/components/landing/capability-marquee.module.css",
      import.meta.url,
    ),
    "utf8",
  );
  const rootPage = await readFile(
    new URL("../src/app/page.tsx", import.meta.url),
    "utf8",
  );
  const agentBubble = await readFile(
    new URL("../src/components/landing/AgentBubble.tsx", import.meta.url),
    "utf8",
  );

  assert.match(
    section,
    /futuristic-agent-reactor-stable-install-v3\.mp4/,
  );
  assert.match(
    section,
    /futuristic-agent-reactor-stable-uninstall-v3\.mp4/,
  );
  assert.match(section, /futuristic-agent-stable-idle-poster-v2\.png/);
  assert.match(section, /futuristic-agent-reactor-latch-crisp-final\.png/);
  assert.match(section, /agentCoreCapabilityGroups/);
  assert.match(section, /pricingGenerationGroups/);
  assert.match(section, /GENERATION_MODEL_TOTAL/);
  assert.match(section, /GENERATION_MODE_TOTAL/);
  assert.match(section, /CAPABILITY_TOTAL/);
  assert.doesNotMatch(section, /CAPABILITY_SIGNAL_SEGMENTS/);
  assert.doesNotMatch(section, /telemetryBlocks/);
  assert.match(section, /Models, APIs, and runtimes/);
  assert.match(section, /FEATURED_MODEL_BRANDS/);
  assert.match(section, /Seedance/);
  assert.match(section, /Kling/);
  assert.match(section, /Suno/);
  assert.match(section, /Gemini Omni/);
  assert.match(section, /GPT Image 2/);
  assert.match(section, /revealAt/);
  assert.match(section, /metricProgress >= brand\.revealAt/);
  assert.match(section, /featuredModelBrands/);
  assert.doesNotMatch(section, /of \{String\(CAPABILITY_TOTAL\)/);
  assert.match(section, /media readers/);
  assert.match(section, /retrieval routes/);
  assert.match(section, /Drive runtime/);
  assert.match(section, /Page runtime/);
  assert.match(section, /REACTOR_LATCH_SECONDS = 4\.85/);
  assert.match(section, /CAPABILITY_LOAD_SECONDS = 1\.45/);
  assert.match(section, /CAPABILITY_UNLOAD_START_SECONDS = 1\.9/);
  assert.match(section, /CAPABILITY_UNLOAD_SECONDS = 1\.35/);
  assert.match(section, /capabilityLoadProgress/);
  assert.match(section, /activeCapabilityCount/);
  assert.match(section, /getCapabilityLoadProgress/);
  assert.match(section, /getCapabilityUnloadProgress/);
  assert.match(section, /onTimeUpdate/);
  assert.match(section, /coreOnline/);
  assert.match(section, /AnyCap capability core/);
  assert.match(section, /Loading/);
  assert.match(section, /Unloading/);
  assert.match(section, /featuredCapability/);
  assert.match(section, /capabilityIndexItem/);
  assert.doesNotMatch(section, /Synchronizing/);
  assert.doesNotMatch(section, /capability paths/);
  assert.match(section, /placement\?: "hero" \| "section"/);
  assert.match(section, /Your agent/);
  assert.match(section, /can do more\./);
  assert.match(section, /It just needs/);
  assert.match(section, /AnyCap\./);
  assert.doesNotMatch(section, /Give your agent/);
  assert.match(homepage, /FuturisticRobotSection placement="hero"/);
  assert.match(homepage, /TerminalWorkflowSection/);
  assert.match(workflow, /id="agent-with-anycap"/);
  assert.match(workflow, /AgentBubble placement="workflow"/);
  assert.match(homepage, /heroVariant === "terminal"/);
  assert.match(rootPage, /hero === "terminal" \? "terminal" : "robot"/);
  assert.match(agentBubble, /placement\?: "hero" \| "workflow"/);
  assert.match(agentBubble, /transform-origin: top right/);
  assert.match(agentBubble, /right-6 top-2/);
  assert.match(agentBubble, /prefers-reduced-motion: reduce/);
  assert.doesNotMatch(section, /A live 3D agent/);
  assert.match(section, /\{reduceMotion \? \(/);
  assert.match(section, /equipped \? styles\.crispFinalFrameVisible/);
  assert.match(section, /preload=\{shouldLoad && !reduceMotion \? "auto" : "none"\}/);
  assert.match(
    section,
    /preload=\{shouldLoad && !reduceMotion \? "metadata" : "none"\}/,
  );
  assert.match(section, /video\.playbackRate = 1/);
  assert.doesNotMatch(section, /requestAnimationFrame/);
  assert.doesNotMatch(section, /SOFT_LANDING/);
  assert.match(section, /REACTOR_MOTION_SECONDS = 6\.666667/);
  assert.match(
    section,
    /Math\.min\(video\.currentTime, REACTOR_MOTION_SECONDS\)/,
  );
  assert.match(
    section,
    /uninstallVideo\.currentTime = \(1 - progress\) \* REACTOR_MOTION_SECONDS/,
  );
  assert.doesNotMatch(section, /currentTime \s*\/\s*installVideo\.duration/);
  assert.doesNotMatch(section, /currentTime \s*\/\s*uninstallVideo\.duration/);
  assert.doesNotMatch(section, /FINAL_FRAME_CROSSFADE_SECONDS/);
  assert.doesNotMatch(section, /REACTOR_LATCH_TIME/);
  assert.match(particleAgent, /new IntersectionObserver/);
  assert.match(particleAgent, /visibilitychange/);
  assert.match(particleAgent, /1000 \/ 30/);
  assert.doesNotMatch(terminal, /setMousePos/);
  assert.match(terminal, /tooltip\.style\.transform/);
  assert.match(marqueeController, /marqueeActive/);
  assert.doesNotMatch(marqueeController, /edgeVisible/);
  assert.doesNotMatch(marqueeController, /edgeGuarded/);
  assert.doesNotMatch(marqueeController, /FULLY_VISIBLE_THRESHOLD/);
  assert.doesNotMatch(marqueeStyleSheet, /translateY\(-1px\)/);
  assert.match(
    marqueeStyleSheet,
    /box-shadow: inset 0 0 0 1px rgb\(143 163 78 \/ 18%\)/,
  );
  assert.match(section, /<video/);
  assert.match(section, /muted/);
  assert.match(section, /playsInline/);
  assert.match(section, /prefers-reduced-motion/);
  assert.match(section, /IntersectionObserver/);
  assert.match(section, /HERO_AUTOPLAY_DELAY_MS = 900/);
  assert.match(section, /HERO_EXPLICIT_INTERACTION_GRACE_MS = 1800/);
  assert.match(section, /heroAutoplayStartedRef/);
  assert.match(section, /equippedRef/);
  assert.match(section, /explicitInteractionAtRef/);
  assert.match(section, /commitEquipped/);
  assert.match(section, /heroAutoplayStartedRef\.current = true/);
  assert.match(section, /installReactor\(\)/);
  assert.match(section, /entry\.intersectionRatio < 0\.72/);
  assert.match(section, /scrollingPastHero/);
  assert.match(section, /explicitInteractionIsRecent/);
  assert.match(section, /onMouseEnter=\{isHero \? undefined : installReactor\}/);
  assert.match(section, /onMouseLeave=\{isHero \? undefined : uninstallReactor\}/);
  assert.match(section, /onFocus=\{isHero \? undefined : installReactor\}/);
  assert.match(section, /Online\. Choose a capability/);
  assert.match(section, /agentCoreCapabilityPresentation/);
  assert.match(section, /coreOnline && isHero/);
  assert.match(section, /aria-pressed=\{equipped\}/);
  assert.doesNotMatch(section, /motionPhase === "locking"/);
  assert.match(styleSheet, /overflow: clip/);
  assert.match(styleSheet, /contain: paint/);
  assert.match(styleSheet, /--robot-backdrop: #efe9e6/);
  assert.match(styleSheet, /--robot-headroom: clamp\(5\.5rem, 7vw, 8rem\)/);
  assert.match(styleSheet, /min-height: clamp\(62rem, 72vw, 76rem\)/);
  assert.match(
    styleSheet,
    /\.heroSection\s*\{[\s\S]*?--robot-headroom: clamp\(7rem, 10vh, 9rem\)/,
  );
  assert.match(
    styleSheet,
    /min-height: max\(calc\(100dvh - 5rem\), 62rem\)/,
  );
  assert.match(section, /text="Your agent can do more\."/);
  assert.match(section, /className=\{styles\.heroTitleLine\}/);
  assert.match(
    styleSheet,
    /\.heroTelemetry \.capabilityStage\s*\{[\s\S]*?grid-template-columns: repeat\(4, minmax\(0, 1fr\)\)/,
  );
  assert.match(
    styleSheet,
    /\.heroTelemetry \.featuredModelBrands\s*\{[\s\S]*?grid-template-columns: repeat\(3, minmax\(0, 1fr\)\)[\s\S]*?gap: 0\.55rem 0\.8rem/,
  );
  assert.match(
    section,
    /isHero \? `\$\{styles\.heroSection\} items-start md:items-center` : "items-start md:items-center"/,
  );
  assert.match(styleSheet, /inset: var\(--robot-headroom\) 0 0 auto/);
  assert.match(
    styleSheet,
    /height: calc\(100% - var\(--robot-headroom\)\)/,
  );
  assert.match(styleSheet, /\.sectionVisual::after/);
  assert.match(styleSheet, /rgb\(244 245 240 \/ 94%\)/);
  assert.match(styleSheet, /transparent 1rem/);
  assert.match(styleSheet, /transparent calc\(100% - 3\.5rem\)/);
  assert.match(styleSheet, /\.telemetryPanel/);
  assert.match(styleSheet, /\.telemetryInner\\?\[data-online="true"\\?\]/);
  assert.match(styleSheet, /font-variant-numeric: tabular-nums/);
  assert.match(styleSheet, /object-fit: contain/);
  assert.match(styleSheet, /mask-image: linear-gradient/);
  assert.match(styleSheet, /rgb\(0 0 0 \/ 38%\) 9%/);
  assert.match(styleSheet, /#000 21%/);
  assert.match(
    styleSheet,
    /@media \(max-width: 767px\)[\s\S]*?object-fit: cover/,
  );
  assert.match(
    styleSheet,
    /@media \(max-width: 767px\)[\s\S]*?mask-image: none/,
  );
  assert.doesNotMatch(styleSheet, /scale\(1\.055\)/);
  assert.doesNotMatch(styleSheet, /transform-origin: 50% 47%/);
  assert.match(stage, /prefers-reduced-motion/);
  assert.match(stage, /IntersectionObserver/);
  assert.match(stage, /webglcontextlost/);
  assert.match(stage, /frameloop="demand"/);
  assert.match(stage, /onPointerMove=\{handlePointerMove\}/);
  assert.match(stage, /window\.addEventListener\("pointermove"/);
  assert.match(stage, /window\.addEventListener\("mousemove"/);
  assert.match(stage, /invalidateRef\.current\?\.\(\)/);
  assert.match(stage, /pointer=\{pointerRef\}/);
  assert.match(cinematic, /FuturisticRobotRig/);
  assert.match(cinematic, /Environment/);
  assert.match(cinematic, /ContactShadows/);
  assert.match(cinematic, /CoreDevice/);
  assert.match(cinematic, /StudioSet/);
  assert.match(rig, /scene\.getObjectByName\("Head"\)/);
  assert.match(rig, /scene\.getObjectByName\("neck"\)/);
  assert.match(rig, /SHOWCASE_POSE/);
  assert.match(rig, /onBeforeCompile/);
  assert.match(rig, /rig\.head\.quaternion\.slerp/);
  assert.match(rig, /rig\.neck\.quaternion\.slerp/);
  assert.match(rig, /MAX_YAW/);
  assert.match(rig, /MAX_PITCH/);
});
