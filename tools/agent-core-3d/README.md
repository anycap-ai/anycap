# Agent Core 3D Asset Pipeline

This directory documents the offline authoring pipeline for the homepage Agent
Core scene. It does not contain a runtime model generator.

## Current source audit

The user-supplied source
`/Users/tyluo/Downloads/tripo_pbr_model_6a84a49b-ef6f-4ef0-9022-590ec68748b1.glb`
is reference-quality high-poly geometry, not a production asset:

- 43,213,012 bytes;
- 1,448,896 triangles and 744,421 vertices;
- one mesh, one primitive, one material, and no skeleton or animation;
- three embedded 4096-pixel PBR textures;
- overlapping open surface patches instead of a clean semantic shell;
- Core, dock, chest socket, visor, hands, head, and torso are not separate
  production objects.

Do not copy this file into `web/public` and do not attempt another automated
join/weld/decimate pass. Both a procedural reconstruction and a source-derived
remesh failed the approved original-detail visual gate.

## Source-selection gate

Choose one route; do not blend them implicitly:

- **Route A — supplied reference:** use the audited high-poly GLB only as a
  visual/proportion reference and manually author a clean shell in Blender. It
  may not be automatically remeshed again or shipped.
- **Route B — new low-poly generation:** use the workflow below only after the
  user explicitly authorizes a new credit-consuming Tripo call. The resulting
  source must pass the incoming gate before any semantic modeling or rigging.

## Route B replacement source

Create four consistent full-body views of the same neutral A-pose: front, left,
back, and right. Keep the head level, fingers separated, shoulders neutral, and
all limbs unobstructed. Remove the Core, dock, chest insert, cables, labels, and
floating accessories from the generated character. Those are rebuilt as
semantic hard-surface parts in Blender.

The preferred Route B base is Tripo P Series multiview output because the
official endpoint is explicitly optimized for low-poly clean topology. Use:

```json
{
  "inputs": [
    { "front": "<file_token>" },
    { "left": "<file_token>" },
    { "back": "<file_token>" },
    { "right": "<file_token>" }
  ],
  "model": "P1-20260311",
  "model_seed": 424242,
  "face_limit": 20000,
  "texture": true,
  "pbr": true,
  "texture_quality": "standard",
  "auto_size": true,
  "compress": "geometry",
  "export_uv": true
}
```

References:

- <https://developers.tripo3d.ai/en/docs/generation-multiview-to-model/p>
- <https://developers.tripo3d.ai/en/docs/animations-rig-check>
- <https://developers.tripo3d.ai/en/docs/animations-rig>
- <https://platform.tripo3d.ai/docs/animation>

The API consumes credits and requires the user's Tripo credentials. Do not run
it automatically. If the Studio UI exposes the same P Series, low-poly, and rig
controls, the same geometry and ordering constraints apply.

## Operation order

1. Generate or retopologize the unrigged low-poly base.
2. Download and archive the static GLB immediately.
3. Reject it if silhouette, hands, visor recess, shoulders, back, or exterior
   shell fail the visual gate. Do not repair a failed candidate by destructive
   simplification.
4. Run rig check. Continue only with `riggable: true` and `rig_type: "biped"`.
5. Auto-rig only as an editable intermediate. Prefer FBX for Blender editing.
6. Finish semantic objects, pivots, rigid weights, and the custom control rig in
   Blender.
7. Export the optimized production GLB from Blender.
8. Run the contract suite and isolated visual review before homepage wiring.

Retopology must happen before rigging. Tripo's official documentation states
that mesh segmentation, mesh completion, Smart LowPoly, and remeshing rebuild
geometry and remove skeleton data, skin weights, and animation bindings.

## Blender authoring environment

The verified local DCC is:

```text
/Applications/Blender.app/Contents/MacOS/Blender
Blender 5.2.0 LTS
```

Open the low-poly source in a quarantined working `.blend`. Keep the approved
1672-by-941 composition and the selected 2229-by-1255 browser capture visible
as the camera/silhouette reference.

Blender owns all project semantics that generic auto-rigging cannot infer:

- separate `head`, `visor`, `torso`, `chest_socket`, `core`, `core_dock`, and
  `core_grip_R` objects/transforms;
- `neck_lower`, `neck_upper`, `clavicle_R`, `upper_arm_R`, `forearm_R`,
  `hand_R`, and `ik_target_R` bones;
- exact dock, grip, socket, and insertion-axis pivots;
- rigid mechanical weighting and covered joint gaps;
- open/separable right hand or gripper with Core clearance;
- deterministic dock-to-hand-to-socket ownership transfer;
- matte ivory, black joint, olive detail, dark socket, and Core materials.

Do not use a preset retargeted animation for installation. The final motion is
driven by the project rig and runtime state machine so the Core has exactly one
owner in each phase.

## Incoming asset acceptance gate

Reject the next source before rig authoring unless all items pass:

- same neutral A-pose across all source views;
- head level, shoulders symmetric, elbows unbent, hands open and separable;
- no Core, dock, socket insert, arrow, label, or accessory fused to the body;
- crown, chin, visor, shoulders, back, and torso match the approved silhouette;
- one coherent exterior without ribbons, shredded cavities, duplicate shells,
  floaters, loose vertices, degenerate faces, or non-manifold branches;
- 12,000–20,000 generated faces and no more than about 40,000 triangles before
  authored modules;
- textures packed locally, standard quality, and usable UVs;
- positive applied scale and a neutral world orientation;
- rig check returns exactly `riggable: true` and `biped`.

## Production GLB acceptance gate

The final `web/public/visuals/agent-core-3d/agent-core-upper-body.glb` must meet
`model-contract.json` and additionally pass:

- no more than 100,000 triangles, 75,000 uploaded vertices, 45 draw calls, and
  32 bones;
- no more than four skin influences per vertex;
- no cameras, lights, external image URIs, or remote resources;
- textures no larger than 2048 pixels, normally 1024 pixels;
- total GLB size no larger than 3,145,728 bytes;
- head yaw `-70°`, `-45°`, `0°`, `45°`, and `70°` without collapse or spin;
- pitch `-25°`, `0°`, and `25°` without neck separation;
- no visible shell squash or joint exposure during reach, grasp, carry, dock,
  release, and return poses;
- Core final fit within 0.003 m position, 1 degree rotation, and scale exactly
  `1`;
- no arm/torso, hand/Core, or Core/socket penetration;
- isolated front, turntable, key-pose, desktop, and mobile visual comparisons
  approved before the 3D scene becomes primary.

## Verification

From the repository root:

```bash
cd web
pnpm run test:agent-core
pnpm exec tsc --noEmit
```

The existing WebP composition remains the production primary and load/error
fallback until the new GLB passes every structural and visual gate.
