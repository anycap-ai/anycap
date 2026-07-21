# Homepage Agent Core Procedural 3D Design Specification

## Intent

Replace only the existing 2.5D robot inside the already integrated Agent Core
homepage section with a true interactive 3D upper-body robot. The section copy,
telemetry, homepage position, typography, paper background, grain, and olive
brand language remain unchanged.

The experience communicates one product idea: an agent can observe before it is
equipped, then installing the AnyCap Core activates its complete capability
layer. Tripo, Meshy, Spline, remote model generation, GLB assets, and runtime
model services are not part of the solution.

## Design Read

This is a preserve-mode landing-page upgrade for technical users. The visual
language is restrained industrial product design, with `DESIGN_VARIANCE: 6`,
`MOTION_INTENSITY: 7`, and `VISUAL_DENSITY: 4`.

## Composition

- Keep the approved three-column desktop composition: copy, telemetry, robot.
- Keep the robot as a cropped upper body, framed from the table line upward.
- Keep the AnyCap Core resting on the table before installation.
- Render the WebGL canvas with an alpha background so the main-site background
  and grain remain visible without a seam.
- Preserve the approved ivory shell, charcoal joints, and muted olive accent.
- Do not add a new section background, card, glow field, hero, navigation item,
  model cloud, or decorative copy.

## Procedural Robot

The robot is constructed from reusable Three.js geometry, not an imported
model. The scene graph must expose these semantic groups:

```text
RobotRoot
|- Torso
|- NeckPivot
|  `- Head
|     `- Visor
|- ChestSocket
`- AnyCapCore
```

The silhouette should follow the approved master: broad rounded shoulders,
narrower lower torso, dark articulated neck, elongated helmet, horizontal dark
visor, and a square nested chest socket. Geometry may use rounded boxes,
spheres, cylinders, capsules, and bevelled extrusions. Materials use physically
based rough surfaces rather than chrome or neon.

## Interaction Narrative

1. Awaiting: the Core is on the table, telemetry reads `00`, visor cells are dim.
2. Observe: on fine pointers, the head follows the pointer with capped yaw and
   pitch while the neck and torso remain fixed.
3. Pickup: pointer, touch, Enter, or Space uses the same accessible Core control.
4. Dock: the Core travels from table position to the chest socket in 3D space.
5. Activate: nested socket layers contract, the Core emits a restrained olive
   pulse, and visor cells illuminate from the centre.
6. Capabilities: existing source-backed telemetry reaches `04`, `03`, `03`,
   `01`, `01` using the existing GSAP sequence.
7. Hold: the installed pose remains still. No perpetual loop is introduced.

The installation timeline is single-shot. Reduced motion renders the connected
state immediately. Rejected drag returns the Core to the table.

## Runtime Architecture

- `three@0.185.1`
- `@react-three/fiber@9.6.1`
- `@react-three/drei@10.7.7`
- `@types/three@0.185.1`
- Existing `gsap@3.15.0` and `@gsap/react@2.1.2`
- Next.js dynamic client loading with `ssr: false`
- Transparent R3F canvas and an existing-image fallback before WebGL loads
- `frameloop="demand"` while idle, invalidated only by pointer smoothing or
  installation progress
- Desktop DPR capped at 1.5 and mobile DPR capped at 1.25
- No physics engine, postprocessing package, external HDR, or remote 3D service

GSAP owns narrative progress and DOM telemetry. R3F owns Object3D transforms,
materials, lighting, camera, pointer smoothing, and the 3D Core path. A mutable
bridge carries continuous values without React state updates per frame.

## Accessibility And Fallbacks

- The Core remains a native button with the existing accessible name and focus
  ring. WebGL raycasting is not the only activation path.
- Pointer capture, touch, click, Enter, and Space converge on one install action.
- `prefers-reduced-motion: reduce` starts connected and disables tracking.
- If WebGL or lazy loading fails, retain the current approved WebP composition.
- The semantic copy, telemetry, live announcement, and no-JavaScript state stay
  in the DOM.

## Acceptance

- The homepage hero and all surrounding sections are byte-for-byte untouched.
- The new canvas has no opaque background and introduces no visible seam.
- The head has real side volume, lighting, and occlusion when following pointer.
- The torso remains fixed and the character does not drift.
- The 3D Core begins visibly on the table and visibly occupies the socket after
  installation.
- Desktop, mobile, keyboard, touch, reduced motion, and fallback paths work.
- No Tripo-related package, API key, network request, copy, or asset exists.
- Focused tests, TypeScript, production build, and visual comparison pass.
