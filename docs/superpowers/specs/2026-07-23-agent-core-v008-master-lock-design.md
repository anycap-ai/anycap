# Agent Core v008 Master-Locked Full-3D Design

**Status:** Approved for implementation

**Target branch:** `codex/doubao-audio-positioning`

## Visual source of truth

The selected 2229-by-1255 reference capture
`codex-clipboard-1b4b0f14-8ec8-46b1-b2fd-5c0f0efbd250.png` is the sole visual
acceptance target. The existing WebP composition remains the production
fallback until the full-3D stage passes the same-viewport comparison.

## Required awaiting composition

- Preserve the matte ivory helmet and torso, narrow black pixel visor,
  restrained olive cells and seams, continuous segmented black neck, slim
  shoulders and arms, square recessed chest socket, physical Core and dock.
- The robot remains an upper body on the right side of the existing three-zone
  layout. Copy, telemetry, background, grain, fonts, and surrounding sections
  do not change.
- One forearm and hand rest naturally on the tabletop beside the Core. The
  opposite arm stays relaxed and does not float or drift.
- The GLB exports with no world background, floor slab, camera, or light. The
  main-site paper field and table horizon own the presentation.

## Interaction

- Pointer gaze uses the real `neck_lower`, `neck_upper`, and `head` rig. It is
  smooth and bounded, never a flat-card transform or continuous spin.
- Selecting the Core makes the tabletop hand look at, reach, grasp, carry,
  dock, release, and return to the tabletop rest pose.
- The Core is rigidly owned by `core_dock`, then `core_grip_R`, then the chest
  socket. It never self-flies in the primary 3D path.
- The grasp frame visibly shows a black palm or gripper supporting the lower
  third or side of the Core while leaving its front face unobstructed.

## v008 asset corrections

- Remove the white neck/shoulder tear and every temporary black collar block,
  selection frame, guide, helper, or debug object from all rendered/exported
  frames.
- Preserve the source PBR shell detail and UVs. Use rigid semantic components
  for head, neck, upper arm, forearm, hand, and static torso; conceal rigid
  joints with black cuff/bellows geometry.
- Render native 1672-by-941 awaiting, reach, grasp, and installed frames with
  the same camera and warm paper presentation before promotion.

## Acceptance gates

1. Four native-size frames have no broken surface, helper geometry, floating
   Core, arm intersection, material drift, or background band.
2. Awaiting frame matches the approved robot silhouette, scale, placement,
   socket, Core, dock, and table contact closely enough for a near-1:1 overlay.
3. The production GLB passes the existing structural contract and fresh reopen
   validation.
4. R3F keeps the WebP fallback until the first correct 3D frame; the 3D stage
   becomes default only after visual, interaction, TypeScript, and focused test
   gates pass.

