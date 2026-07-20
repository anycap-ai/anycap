# Homepage Capability Design Master

## Status

Approved direction for a new visual master. This specification replaces the
current procedural demo as the visual source of truth. The existing demo stays
available as a technical experiment, but no production integration or further
renderer tuning is part of this design phase.

## Objective

Create a near-1:1 AnyCap adaptation of the user-approved reference composition:
a deep particle tunnel at center-left, a human and an agent inside it, and a
dense directional particle avalanche carrying real output surfaces toward the
right edge.

The frame must communicate one sentence without requiring explanatory UI:
installing AnyCap gives a human or agent one connected path through current
models, production capabilities, and delivery.

## Deliverables

The design phase produces three reviewable output groups before implementation:

1. one canonical `1672 × 941` final-state design master;
2. five `1672 × 941` motion keyframes using the same scene and camera, with
   keyframe five sharing the exact final composition of the clean master;
3. one component and layer breakdown showing implementation boundaries.

The final master is the primary approval artifact. Keyframes and component
boundaries must conform to it rather than introducing alternate compositions.

## Fidelity Contract

The approved reference is a strict composition target, not loose inspiration.
The AnyCap adaptation preserves the reference's dominant proportions,
perspective, density, visual hierarchy, and artifact distribution. Only product
content, labels, imagery, and brand colors change.

The following relationships are mandatory in the canonical frame:

- copy occupies the left 21 to 22 percent of the artboard;
- the tunnel center is near 39.5 percent of artboard width and 52 percent of
  artboard height;
- the tunnel outer wall spans about 25.5 percent of artboard width;
- the inner opening is narrower and taller than a square;
- the particle field begins before the tunnel, crosses its floor and walls,
  and continues beyond the right, top, and bottom crop;
- the right half is visually occupied by directional particle mass, not an
  even noise cloud or a set of clean connector lines;
- artifact surfaces sit inside that mass with foreground and background
  particles creating real depth.

## Brand Alignment

The design uses current AnyCap landing tokens:

- surface: `#f4f5f0`;
- primary dark: `#1c1f17`;
- olive: `#6b7d3a`;
- supporting text: `#4d5145`;
- pale sage: `#c8d4a0`;
- fixed multiply grain at approximately 7 percent opacity;
- GeistPixelSquare for the two-line headline;
- system sans-serif for the supporting sentence;
- Inter or a restrained monospaced face for artifact chrome and labels.

The visible copy remains:

- `One capability layer.`
- `Every way to finish.`
- `Human + agent`
- `Create. Understand. Find. Manage. Deliver.`

No hero, logo, navigation, CTA, independent glow, neon treatment, glass panel,
or blue prototype background is added.

## Canonical Final Composition

### Left Narrative

The headline begins on the landing page grid and uses exactly two lines. The
supporting text sits below with enough separation that the incoming ground
particles never reduce legibility. The copy is the calm counterweight to the
high-density scene and must not compete with model or capability labels.

### Portal Tunnel

The portal is a tunnel volume, not a stack of square outlines. Its outer frame
is heavy and near-black, its inner opening is a tall rectangular doorway, and
seven to nine receding wall slices establish the vanishing point. The floor
continues toward the viewer as a particle plane. Large foreground cubes,
medium wall particles, and fine interior dust establish scale.

A human and an olive agent stand on the inner floor. Their feet share the same
ground plane and their scale decreases naturally with depth. They are visual
subjects, not interface icons.

### Particle Avalanche

One dense trunk exits the portal before separating into six to eight broad,
overlapping streams. Each stream has a distinct trajectory, but neighboring
streams overlap enough to read as one connected capability layer. White space
appears as shaped channels between volumes, not as evenly distributed gaps.

Particle scale is depth-driven:

- far dust: subpixel to 2 pixels;
- middle field: 2 to 5 pixels;
- foreground cubes: 6 to 12 pixels;
- rare crop-edge cubes may exceed 12 pixels.

The avalanche contains dark near particles, olive middle particles, and pale
distance particles. It must never resolve into uniform green noise.

### Artifact Surfaces

The right side includes the reference's visual evidence, adapted to AnyCap:

- Research;
- Editorial image;
- Screenshot analysis;
- Vision crop;
- Published page;
- Cinematic video;
- Audio;
- Transcript;
- Share link;
- Music track;
- Search result;
- Generated variants;
- Code snippet;
- Delivered.

Every surface uses designed local content rather than a generic gradient
placeholder. Visual outputs use coherent nature/editorial imagery. Functional
outputs use restrained dark interfaces, real waveform or transcript structure,
and legible hierarchy.

The surfaces vary in size, depth, and rotation. Their edges are partially
occluded by foreground particles while their primary content remains readable.
They must not form a card grid.

### Models And Capability Narrative

`Latest models`, `Core capabilities`, and `Delivery layer` remain part of the
story but stop behaving as three floating headings. They become secondary
annotations embedded in relevant streams:

- latest model names occupy the upper incoming and upper-right streams;
- Image, Video, Audio, Music, Understanding, and Search annotate the middle
  capability streams;
- Drive, Share, Page, Publish, and Delivered converge near the far-right
  delivery surfaces;
- `More models. More capabilities. Continuously added.` sits near the final
  cropped horizon at the lowest contrast.

Labels never overlap artifact captions or become the first visual read.

## Five Motion Keyframes

All five frames use the canonical camera and artboard.

### Frame 1 — Limited

The copy is present. Human and agent exist on a short, sparse path. The future
portal position is suggested only by distant dust. No artifact is readable.

### Frame 2 — Install

A restrained `anycap install` proof reaches the agent. Fine particles contract
toward the doorway and the deepest tunnel slices begin to resolve from inside
out.

### Frame 3 — Portal

The full tunnel locks into place. Latest-model annotations arrive through the
upper streams. Human and agent share the same lit floor, establishing AnyCap
as their common capability layer.

### Frame 4 — Avalanche

The exit trunk expands into broad directional streams. Core capability
surfaces become readable only after their surrounding particle volumes arrive.
Foreground particles begin crossing artifact edges.

### Frame 5 — Delivered

The canonical final master holds. The right edge contains the full artifact
field, delivery convergence, and cropped continuation beyond the viewport.
Ambient movement is implied but the composition is stable enough for reading.
This frame is exported with motion annotations, while the separate final master
is the same scene without storyboard annotations.

## Component Boundaries

The visual is decomposed into independently understandable components:

- `CapabilityScene`: owns the canonical camera, artboard mapping, progress,
  and responsive scene manifest;
- `PortalTunnel`: owns tunnel geometry, depth slices, floor, and portal-specific
  particles;
- `HumanAgentPair`: owns the two subjects and their shared floor alignment;
- `ParticleFlow`: owns background trunk, branch volumes, horizon scatter, and
  foreground occlusion particles;
- `ArtifactSurface`: a typed surface component with variants for image, video,
  audio, transcript, page, search, code, share, music, and delivery;
- `CapabilityAnnotations`: owns model, capability, delivery, and horizon labels;
- `SceneAtmosphere`: owns background, grain, distance haze, and non-interactive
  finishing treatments.

No component stores independent percentages in CSS. A single scene manifest
provides canonical x, y, z, scale, rotation, reveal phase, and mobile policy.

## Scene Data Flow

The final implementation will derive one normalized progress value from the
section controller. `CapabilityScene` converts progress into a named phase and
passes it to the portal, particle, artifact, and annotation layers. All layers
use the same camera and artboard transform.

The design master and five keyframes define the scene manifest before any
renderer is selected. This prevents implementation constraints from silently
changing the approved composition.

## Implementation Direction

The expected implementation is hybrid:

- WebGL or Three.js for the tunnel and particle volumes;
- two particle depth passes, background and foreground, so artifacts can sit
  between them;
- componentized DOM surfaces for text-critical artifacts and annotations;
- local image assets or generated visual assets for photographic surfaces;
- one scene manifest shared by every layer;
- GSAP ScrollTrigger may drive progress, but it does not own layout.

Pre-rendered motion is an acceptable fallback only for low-power devices or
reduced motion. A single flat background video is not the primary desktop
implementation because it would weaken responsive composition and semantic
content.

## Responsive Policy

Desktop uses the canonical 16:9 composition. Taller viewports center the
artboard vertically without changing internal geometry. Wider viewports crop
the open horizon rather than stretching the tunnel.

Mobile is a separate composition derived from the same manifest: copy appears
first, the portal follows, and a reduced set of representative artifacts flows
downward. Mobile does not shrink the desktop master until labels and cards are
unreadable.

## Fallback And Error Handling

- missing photographic assets fall back to a designed neutral editorial
  placeholder, never a broken image;
- unavailable WebGL renders the approved final keyframe as a responsive static
  composition;
- reduced motion renders the final composition without pinning or particle
  travel;
- loading delays keep surfaces hidden until their local assets are ready,
  avoiding mismatched empty cards;
- the semantic summary remains available outside decorative visual layers.

## Acceptance Criteria

The design phase is approved only when:

- the final master is recognizably near-1:1 with the approved reference at a
  glance;
- the portal reads as a deep tunnel before it reads as particles;
- the right field reads as directional volume before it reads as individual
  squares;
- artifacts look like real outputs, not UI placeholders;
- the human and agent share one believable spatial scene;
- annotations are legible but remain secondary;
- all five keyframes preserve the same camera and composition;
- the component breakdown maps every visible element to one owner;
- no implementation code or production homepage change is required for design
  approval.

## Out Of Scope

- modifying the homepage hero;
- integrating the section into production;
- choosing final renderer libraries before the master is approved;
- adding provider logos or unsupported model claims;
- inventing new landing copy;
- further tuning the existing procedural demo as a substitute for the master.
