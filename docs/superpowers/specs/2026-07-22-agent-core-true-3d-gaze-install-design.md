# Agent Core True-3D Gaze and Autonomous Installation Design

**Status:** Draft for written-spec review

**Approved direction:** true three-dimensional gaze with a custom rigged robot, natural head limits, and autonomous Core installation

**Target branch:** `codex/doubao-audio-positioning`

## 1. Intent

Upgrade only the robot stage inside the existing homepage Agent Core section so
the agent has genuine three-dimensional presence and agency:

1. its head and neck look toward the user's pointer with visible side volume;
2. selecting the tabletop AnyCap Core causes the robot to reach for it;
3. the hand physically carries the Core into the chest socket;
4. the existing capability telemetry activates after the Core locks in place.

The section remains a mid-page product narrative, not a second hero. The
existing homepage hero, navigation, copy, telemetry, paper surface, grain,
typography, color system, section position, and surrounding sections remain
unchanged.

This specification supersedes the 2026-07-21 procedural-3D proposal and the
`no GLB assets` constraint in the later master-restoration plan only for this
new user-approved feature. It does not weaken the restoration plan's visual
fidelity gate: an unapproved or visibly inferior 3D model must never replace
the current master.

## 2. Product Narrative

The interaction communicates one idea: installing AnyCap gives an agent the
ability to complete work, and the agent participates in that installation.

The robot must not feel like a passive image while the Core flies by itself.
The user initiates the event, but the agent notices the Core, reaches for it,
grips it, carries it, installs it, and then becomes capable.

## 3. Non-Negotiable Visual Lock

The current approved 1672-by-941 composition is the source of truth. The new
3D stage must preserve:

- the exact three-zone desktop read: copy, capability telemetry, robot;
- the existing page surface, grain, fonts, ink, olive accents, divider, and
  tabletop line;
- the current upper-body crop and camera-facing scale;
- the matte ivory helmet and torso shell;
- the black segmented flexible neck;
- the horizontal black pixel-visor with restrained olive sensor cells;
- the thin olive shell seams;
- the square, nested chest socket with visible depth;
- the physical tabletop dock and seated Core in the awaiting state;
- the current copy and source-backed values `04 / 03 / 03 / 01 / 01`.

The scene may not introduce a second background, gradient, glass card, neon
halo, floating model cloud, full-body robot, hero CTA, chrome sci-fi material,
or uncontrolled idle loop. The character must remain an abstract AnyCap agent,
not Iron Man or another recognizable character.

Only the robot scene becomes WebGL. Copy and telemetry stay in accessible DOM.
The canvas uses a transparent background so the existing page surface and
grain remain continuous.

## 4. Considered Approaches

### 4.1 Expanded 2D layer rotation — rejected

The current head is a single transparent front-view image. Increasing its CSS
`rotationY` cannot reveal a real cheek, helmet side, or back surface, and no
jointed arm exists. This approach cannot satisfy true 3D gaze or autonomous
installation.

### 4.2 Runtime primitive robot — rejected

Rounded boxes, capsules, and generic procedural materials can provide bones and
IK quickly, but they do not reproduce the approved silhouette, panel design,
camera, material response, or product-photography quality. This is the source
of the previously rejected generic/low-fidelity result.

### 4.3 Custom rigged GLB in a DOM/3D hybrid — selected

A purpose-built, rigged upper-body GLB provides real side volume, stable brand
geometry, head/neck articulation, and a deterministic arm chain. React Three
Fiber hosts the transparent scene; Three.js owns bones, quaternions, camera,
materials, and IK; GSAP owns the narrative timeline and existing DOM telemetry.

The user-supplied Tripo GLB may be used as an offline high-poly reference asset.
It is not production-ready geometry and may not be shipped directly. A new
credit-consuming remote generation is a separate source route that requires
explicit user authorization before it runs. No remote model generator, runtime
model service, or remote asset URL is permitted in the browser. Any generated
source must first pass local source-selection, topology, semantic-part, rig,
material, size, and visual-fidelity gates.

## 5. Asset Production and Approval Gate

### 5.1 Authoring

The production model is finished offline in Blender and exported as GLB.
Blender is an authoring dependency only; it is not shipped to the browser. The
local Blender runtime is `/Applications/Blender.app/Contents/MacOS/Blender`.

Choose one source route. The supplied high-poly file is reference-only and must
not be remeshed again; its overlapping open patches already failed the visual
gate. A separately user-authorized clean low-poly generation must be generated
or retopologized before rigging. Remeshing a rigged result is not an allowed
shortcut because it destroys the skeleton and skin bindings. Blender still owns
semantic separation, the square socket/Core/dock rebuild, hand and grip
controls, final rig/weights, materials, optimization, and export.

The approved front-view master and the four current WebP layers are the visual
references. The model must be newly authored to match them; the WebP body may
not simply be placed on a flat plane and called 3D.

### 5.2 Required GLB scene graph

The exported asset must expose stable semantic names:

```text
AgentRoot
|- torso
|  `- chest_socket
|- clavicle_R
|  `- upper_arm_R
|     `- forearm_R
|        `- hand_R
|           `- core_grip_R
|- ik_target_R
|- neck_lower
|  `- neck_upper
|     `- head
|        `- visor
|- core
`- core_dock
```

The robot's right arm appears on the viewer's left and is closest to the Core.
It is the installation arm. The opposite arm remains posed and does not cross
the telemetry panel.

### 5.3 Material requirements

- ivory shell: high roughness, near-zero metalness, subtle micro-normal;
- black joints and neck: rubberized, visibly segmented, no wet gloss;
- olive seams and sensor pixels: restrained color, limited emissive response;
- chest socket: nested dark layers with readable depth at homepage scale;
- Core: matches the approved nested-square module and fits the socket exactly;
- shadows: soft contact shadows only, with no studio-floor gradient.

Lighting is local and deterministic: one large soft key from upper-left, a
low-intensity neutral fill, and a restrained rim sufficient to reveal side
volume. No remote HDR environment is loaded.

### 5.4 Model gate before homepage integration

The model must pass an isolated review page before it may replace the current
WebP composition. Required review captures:

- front awaiting pose aligned to the current master;
- yaw at `-70°`, `-45°`, `0°`, `45°`, and `70°`;
- pitch at `-25°`, `0°`, and `25°`;
- arm reach, grasp, carry, dock, and return key poses;
- desktop and mobile crops.

The current 2D master stays as the production primary surface until this gate
passes. A merely functional model is not sufficient.

## 6. Camera and Composition

- Use one fixed perspective camera with a narrow product-photography field of
  view, initially targeted at approximately `28°–34°`.
- No OrbitControls, user camera movement, parallax camera drift, or zoom.
- Calibrate camera position, target, and robot scale against the approved
  1672-by-941 screenshot.
- Keep the chest socket and tabletop Core at the same normalized anchors as the
  current asset manifest unless fresh comparison proves a correction is needed.
- Keep the table line continuous with the DOM section.
- Use alpha rendering and fixed tone mapping/exposure so canvas edges do not
  reveal a color or grain seam.

The camera and lights are visual constants. Pointer movement rotates bones; it
does not move the camera or translate the robot root.

## 7. True 3D Gaze

### 7.1 Pointer target mapping

Pointer coordinates are normalized over the full Agent Core section, then
projected onto a virtual target plane in front of the robot. The head aims at
that world-space point; it does not map the pointer directly to CSS Euler
angles.

The targeting function must be pure and unit-testable:

```ts
type GazeInput = {
  pointer: { x: number; y: number };
  sectionBounds: { left: number; top: number; width: number; height: number };
  mode: "user" | "core" | "socket" | "neutral";
};

type GazeTarget = {
  worldTarget: [number, number, number];
  yaw: number;
  pitch: number;
};
```

### 7.2 Natural limits

- combined horizontal yaw: approximately `-70°` to `70°`;
- combined vertical pitch: approximately `-25°` to `25°`;
- optional roll: no more than `±3°` and never pointer-driven one-to-one;
- neck carries roughly 30 percent of the rotation;
- head carries roughly 70 percent;
- torso and robot root remain fixed.

The head may reveal its side and rear-side volume near the horizontal limit,
but it must never spin continuously or cross the shortest quaternion path in a
way that resembles a rotating display stand.

### 7.3 Motion quality

- use quaternion interpolation or a critically damped angular response;
- target settling time: roughly 160–240 ms for normal pointer movement;
- clamp maximum angular velocity to avoid snapping across the viewport;
- use a small central dead zone to prevent sensor jitter;
- continue invalidating frames only until the head converges;
- on pointer leave, return to the neutral attentive pose in 350–500 ms;
- when connected, pointer tracking resumes at approximately 60 percent of the
  awaiting amplitude.

During installation, raw pointer tracking is suspended. Narrative gaze owns the
head in this order: Core, grasping hand, chest socket, then user.

## 8. Autonomous Core Installation

Selecting the Core by click, tap, Enter, or Space triggers the same one-shot
sequence. Precision drag is no longer the primary narrative; the robot must do
the work. The Core remains a native DOM-accessible control even though its
visible 3D counterpart is rendered in WebGL.

### 8.1 State machine

```text
awaiting
  -> targeting
  -> reaching
  -> grasping
  -> carrying
  -> docking
  -> activating
  -> connected
```

The sequence is idempotent. Inputs after `targeting` cannot start a second
installation. Reload resets to `awaiting`.

### 8.2 Choreography

Target duration is approximately 2.6–3.0 seconds:

1. **Targeting (0.00–0.25 s):** visor focus tightens and gaze moves to Core.
2. **Reaching (0.18–0.85 s):** right clavicle, shoulder, elbow, and wrist bring
   the palm toward the seated Core along a weighted arc.
3. **Grasping (0.78–1.05 s):** the palm settles; Core attaches to
   `core_grip_R`; the dock remains on the table.
4. **Carrying (1.00–1.75 s):** hand lifts and transports the Core toward the
   chest while the head follows the hand.
5. **Docking (1.68–2.05 s):** wrist squares to the socket, the final travel
   slows, and the hand presses the Core inward.
6. **Activating (2.00–2.45 s):** Core reparents to the socket, nested socket
   layers settle, visor cells wake, and one restrained olive confirmation pulse
   plays.
7. **Capabilities (2.15–2.75 s):** DOM values and cells fill in the existing
   Create → Understand → Search → Manage → Deliver order.
8. **Return (2.35–3.00 s):** the arm returns to its authored rest pose and gaze
   returns to the user.

The Core may not animate independently from dock to socket. From grasp until
docking it is parented to the hand grip. At docking it transfers exactly once
from hand ownership to socket ownership.

### 8.3 Arm IK

Use Three.js `CCDIKSolver` or an equivalent deterministic two-bone IK solver on
the right-arm chain. The moving IK target follows authored GSAP waypoints; IK
solves shoulder and elbow articulation each rendered frame.

Joint limits must prevent anatomical inversion, elbow popping, shoulder
collapse, wrist twisting, and the hand intersecting the torso. A clavicle
helper may contribute a small authored rotation, but no physics engine is
required.

The final palm-to-Core and Core-to-socket tolerances are measured from named
anchors in the GLB, not hard-coded screen distances.

## 9. Runtime Architecture

### 9.1 Ownership

- `AgentCoreInstallSection`: DOM semantics, lifecycle, phase, and live status;
- `AgentCoreStage3D`: lazy client-only transparent R3F canvas and fallback;
- `AgentCoreRobot`: GLB loading, semantic node/bone validation, materials, and
  rest pose;
- `useAgentGaze`: pointer/world mapping, constraints, smoothing, and ownership;
- `useAgentInstallMotion`: phase timeline, IK target path, Core parenting, and
  completion callbacks;
- `CapabilityTelemetry`: unchanged source-backed DOM rows;
- pure math/state modules: gaze clamps, state transitions, anchors, and
  deterministic installation waypoints.

### 9.2 Technology

- React 19 and Next.js 15, matching the existing application;
- compatible stable releases of `three`, `@react-three/fiber`,
  `@react-three/drei`, and `@types/three` selected during implementation;
- existing `gsap` and `@gsap/react` for deterministic sequencing;
- local optimized GLB only;
- no physics engine, remote HDR, remote 3D service, smooth-scroll dependency,
  or perpetual render loop.

### 9.3 Bridge

GSAP writes narrative progress and authored targets into mutable bridge values.
R3F consumes those values during active frames and updates bones, IK, and Core
ownership. Continuous pointer and bone data must not trigger React state updates
on every frame.

DOM phase changes occur only at named boundaries. The existing telemetry
animation begins from the `activating` boundary and reaches the source-backed
final values once.

## 10. Responsive Behavior

### Desktop, 1280 px and wider

- preserve the approved three-column layout and current robot scale;
- enable continuous pointer gaze across the full section;
- keep the complete right-arm reach and installation visible;
- do not allow the arm or Core to overlap the telemetry column.

### Tablet, 768–1279 px

- preserve the current copy/scene and telemetry arrangement;
- use the same 3D model and state machine with a recalibrated fixed camera;
- reduce reach amplitude only through camera/world anchors, never by skipping
  the grasp or carrying stages;
- reduce gaze amplitude slightly if required to avoid neck silhouette clipping.

### Mobile, below 768 px

- retain the current copy → scene → telemetry stack;
- use tap to initiate autonomous installation;
- do not run continuous cursor gaze on coarse-pointer devices;
- keep the complete head, socket, active arm, dock, and Core inside the crop;
- if the approved mobile camera cannot retain all five, the scene must grow
  vertically rather than crop a required object;
- no horizontal overflow.

## 11. Accessibility and Reduced Motion

- Core activation remains a native button with the existing accessible name
  and a visible focus treatment.
- Click, tap, Enter, and Space converge on one installation action.
- Decorative WebGL objects are hidden from assistive technology; copy,
  telemetry, and live status remain DOM.
- Announce `AnyCap Core connected` once after docking; do not announce every
  capability counting frame.
- With `prefers-reduced-motion: reduce`, disable pointer gaze and articulated
  travel. Show the connected model and final telemetry as a stable state.
- Without JavaScript, retain the current semantic connected fallback.

## 12. Loading, Failure, and Context Recovery

- Render the current approved WebP master while the GLB and WebGL runtime load.
- Do not hide the fallback until the first correct 3D frame is rendered with
  model, materials, camera, lights, and awaiting pose ready.
- If model loading, bone validation, WebGL creation, or context recovery fails,
  keep the WebP master visible and preserve the existing accessible install
  behavior.
- A context loss after connection must restore the connected pose and telemetry,
  not restart the installation.
- No error state may leave both the fallback and canvas invisible.

The fallback is a reliability path, not evidence that the true-3D requirement
has been completed.

## 13. Performance Budget

- use `frameloop="demand"` while idle;
- invalidate only while gaze is converging, an install phase is active, or a
  context restoration frame is required;
- cap effective DPR at 1.5 desktop and 1.25 mobile;
- target optimized GLB plus local textures at no more than 3 MB initial
  transfer, with a stretch target below 2 MB;
- use a 2K maximum texture dimension and prefer shared material maps;
- keep draw calls below 45 for the robot stage;
- avoid post-processing passes;
- pause gaze and animation work when the section is not visible;
- dispose model clones, materials, observers, GSAP timelines, and animation
  handles on unmount.

## 14. Verification and Acceptance

### 14.1 Asset contracts

Automated validation must prove:

- the GLB is local and within the size budget;
- every required node and bone name exists exactly once;
- head, neck, arm, hand grip, chest socket, Core, and dock anchors are finite;
- material and texture references are local;
- no Tripo, Meshy, Spline, remote model endpoint, or runtime asset URL exists in
  the shipped browser implementation;

### 14.2 Pure behavior tests

- nine pointer positions map to expected world targets;
- yaw never exceeds `±70°`, pitch never exceeds `±25°`, and roll never exceeds
  `±3°`;
- quaternion interpolation takes the shortest path and cannot spin;
- pointer leave returns to neutral;
- installation gaze overrides raw pointer gaze;
- the phase machine is one-shot and idempotent;
- the Core owns exactly one parent in each phase;
- reduced motion creates no tracking or articulated timeline;
- model/context failure leaves the fallback visible.

### 14.3 IK and animation checks

- hand grip reaches the Core anchor within the authored tolerance before grasp;
- Core remains attached to `core_grip_R` throughout carrying;
- Core reaches the chest socket anchor before ownership transfer;
- right-arm joint angles remain within authored limits;
- the hand, forearm, Core, and chest avoid visible self-intersection at the
  required keyframes;
- the arm returns to the authored rest pose after installation;
- telemetry finishes at `04 / 03 / 03 / 01 / 01` once.

### 14.4 Browser verification

Use the user's Codex in-app browser and fresh runtime evidence:

- inspect awaiting, left-look, right-look, up-look, down-look, reaching,
  grasping, carrying, docking, connected, reduced-motion, and fallback states;
- verify mouse gaze over the full section and natural clamping at the edges;
- verify click, touch, Enter, and Space installation paths;
- verify no camera movement, torso drift, head detachment, elbow inversion,
  Core self-flight, canvas seam, console error, or perpetual animation;
- verify widths 390, 768, 1280, and 1672 with no overflow or required-object
  crop.

### 14.5 Visual comparison gate

At 1672 by 941, compare a fresh production screenshot with the current approved
master in one side-by-side image. Also compare focused robot and Core crops.
Review at original detail and fix all P0, P1, and P2 differences in:

- camera, scale, crop, and normalized anchors;
- helmet and torso silhouette;
- visor, neck, shell seams, chest socket, Core, dock, and table line;
- ivory/black/olive materials, light direction, contrast, and shadow softness;
- page surface, grain continuity, typography, telemetry, and spacing.

The turntable and install-keyframe review artifacts are additional gates. A
front-view screenshot alone cannot prove true 3D gaze or arm installation.

## 15. Completion Definition

The feature is complete only when all of the following are proven:

1. the approved main visual and homepage composition remain intact;
2. the real 3D head reveals side volume and follows pointer targets naturally;
3. yaw, pitch, roll, smoothing, return, and narrative gaze ownership meet this
   specification;
4. selecting the Core causes the robot arm to reach, grasp, carry, install, and
   release it;
5. the Core never self-flies during the primary 3D experience;
6. telemetry activates once and reaches source-backed values;
7. desktop, tablet, mobile, keyboard, touch, reduced-motion, loading, fallback,
   and context-recovery paths pass;
8. isolated model review, turntable review, keyframe review, master comparison,
   automated tests, TypeScript, production build, and independent final review
   contain no remaining Critical, Important, P0, P1, or P2 finding.

## 16. Out of Scope

- redesigning the homepage hero or surrounding sections;
- a full-body robot or free camera orbit;
- literal continuous 360-degree head spinning;
- facial expressions, speech, audio, lip sync, or autonomous chat;
- multiple Core types, replay controls, personalization, or model selection;
- runtime procedural replacement of the approved robot;
- a Tripo, Meshy, Spline, remote generation, or hosted model dependency in the
  shipped browser implementation.
