# AnyCap Seedance Video Production Skill Design

## Purpose

Adapt the open-source `Emily2040/seedance-2.0` skill system into an
AnyCap-native distributed skill package. The goal is to bring Seedance-specific
video production judgment into AnyCap without importing provider-specific API
surfaces, stale platform facts, or non-AnyCap execution paths.

This is a complete adaptation, not a thin pointer to the upstream repository:
agents should be able to use AnyCap to plan, prompt, generate, review, continue,
and repair Seedance video work from this repo's skills alone.

## Scope

Create a new distributed skill:

```text
skills/anycap-seedance-video-production/
  SKILL.md
  references/
    operating-loop.md
    prompt-workflow.md
    reference-roles.md
    sequence-continuation.md
    retake-troubleshooting.md
    camera-light-motion-audio.md
    safety-and-rights.md
    multilingual-prompts.md
    professional-production.md
    anycap-command-patterns.md
    upstream-adaptation-notes.md
```

Update existing AnyCap skills so agents can discover the new workflow:

- `skills/anycap-media-production/SKILL.md` routes Seedance-specific video work
  to the new skill.
- `skills/anycap-cli/references/video-generation.md` points advanced Seedance
  prompt, reference, continuation, and retake workflows to the new skill while
  keeping CLI syntax source-of-truth in live model schemas.
- `docs/anycap-current-status.md` records the new distributed skill as current
  product surface if the final implementation makes it user-facing.

No server, CLI, provider catalog, pricing, route, or web landing-page behavior
changes are included in this design.

## Source Adaptation

Use the upstream project as conceptual source material for:

- intent-first operating loop and fast lane for simple clips
- compact prompt construction
- reference role mapping for image, video, audio, first-frame, and last-frame
  assets
- sequence state, continuation, and retake workflow
- camera, lighting, motion, audio, VFX, and character consistency language
- anti-slop prompt cleanup
- IP, likeness, brand, voice, and reference-rights safety boundaries
- multilingual prompt vocabulary for English, Chinese, Japanese, Korean,
  Spanish, and Russian
- professional production objects such as shot lists, continuity ledgers, post
  handoffs, and QC checklists

Do not vendor the upstream repository wholesale. Do not copy its assets, README
gallery, GitHub workflows, validation scripts, provider pricing tables, or
platform-specific API matrices.

## AnyCap-Native Execution Contract

Every executable example must use AnyCap CLI commands:

```bash
anycap video models
anycap video models <model-id> schema --operation generate --mode <mode>
anycap video generate --model <model-id> --mode <mode> --prompt "<prompt>" -o <file>.mp4
```

The skill must teach agents to:

1. discover available models with `anycap video models`;
2. select a Seedance model from the live catalog when present;
3. inspect the selected model and mode schema before using mode-specific
   parameters;
4. pass references using parameters that the live schema exposes;
5. use `-o` with descriptive output paths;
6. review generated outputs and adjust prompts through the retake workflow.

Examples may mention `seedance-2` and `seedance-2-fast` as illustrative model
IDs only when paired with a reminder to verify the live catalog first.

## Fact And Claim Boundaries

The new skill must not hard-code:

- provider endpoint URLs as execution paths;
- provider-specific request fields unless clearly marked as upstream context and
  not used in AnyCap examples;
- pricing, credit cost, regional availability, quota, upload limits, duration
  limits, or account requirements;
- model IDs beyond illustrative AnyCap examples;
- surface-specific safety or authorization behavior as a universal rule.

For facts that change, the skill must direct agents to use the current AnyCap
sources of truth:

- `anycap video models`
- `anycap video models <model-id>`
- `anycap video models <model-id> schema --operation generate --mode <mode>`
- existing AnyCap CLI skill references
- current product status when product-surface language is needed

## Skill Behavior

The root skill routes requests by production need:

- simple standalone Seedance clip
- vague idea needing a brief
- text-to-video
- image-to-video
- multi-reference video generation when the live schema supports it
- first-frame or last-frame style workflows when the live schema supports the
  required reference parameters
- continuation or next-part requests
- generated take review and retake
- troubleshooting failed or low-quality output
- multilingual prompt drafting
- professional film, client, campaign, or delivery work
- IP, likeness, brand, voice, or reference-rights risk

For simple clips, the skill should keep the flow short: infer the brief, compile
a compact prompt, verify schema, and generate. For complex or high-risk work, it
should load the relevant reference files and ask only for missing information
that materially affects the result or safety.

## Reference Design

`operating-loop.md` defines the AnyCap Seedance workflow gates and when to load
other references.

`prompt-workflow.md` explains how to turn a user brief into a compact prompt:
one visible beat, one motivated camera move, one motivated light source, sound
intent, preservation constraints, and delivery caveats when needed.

`reference-roles.md` maps references to roles: identity, product, environment,
style, motion, timing, first frame, last frame, audio tempo, or accepted previous
footage. It must warn against letting one reference control incompatible roles.

`sequence-continuation.md` defines project state, clip IDs, accepted footage,
observed end state, canonical references, and when to re-anchor instead of
continuing from drifted output.

`retake-troubleshooting.md` defines result triage: keep, fix in post, edit when
supported, re-roll, or rewrite. It should require changing one variable at a
time when repairing prompts.

`camera-light-motion-audio.md` gives production language for camera, lighting,
motion, audio, characters, and VFX without turning into a generic film-school
catalog.

`safety-and-rights.md` handles protected IP, public figures, private people,
brands, logos, voices, songs, exact scenes, and user-supplied references. It
must not infer authorization from an upload.

`multilingual-prompts.md` provides compact prompt patterns and reference-tag
rules for English, Chinese, Japanese, Korean, Spanish, and Russian.

`professional-production.md` defines role-specific outputs: treatment, shot
list, continuity ledger, prompt batch, post handoff, localization plan, and QC
checklist.

`anycap-command-patterns.md` contains AnyCap CLI patterns for discovery, schema
inspection, generation, output paths, and result review.

`upstream-adaptation-notes.md` records what was adapted from the upstream
project, what was intentionally excluded, and why.

## Safety And Rights

The adapted skill must preserve a strict rights boundary:

- Use owned, licensed, public-domain, or clearly authorized references.
- Do not assume an uploaded image, video, or audio file proves permission.
- For public figures, private people, voices, brands, logos, songs, exact
  scenes, or protected characters, either ask for authorization context or offer
  a safe original rewrite.
- Never frame false-positive safety wording as evasion. Safe rewrites clarify
  benign production intent; unsafe intent is refused or redirected.

## Verification

Implementation should include docs-focused checks:

- scan the new skill for non-AnyCap execution commands such as direct provider
  API calls;
- scan for hard-coded pricing, region, quotas, and provider endpoint guidance;
- verify all executable examples use `anycap video ...`;
- verify links between `SKILL.md` and references resolve;
- verify existing media and CLI skill references point to the new skill without
  duplicating large content;
- run the repository's relevant docs or skill sync checks when available, and
  report any skipped checks.

Pressure scenarios for manual review:

1. Standalone text-to-video ad prompt.
2. Product image-to-video with strict preservation.
3. Continuation from an accepted generated clip.
4. Retake after identity drift or camera jump.
5. Chinese prompt with unchanged reference tags.
6. Protected IP or likeness request requiring safe rewrite.
7. Professional campaign request requiring shot list and QC output.

## Out Of Scope

- Adding or changing AnyCap server capabilities.
- Adding provider adapters.
- Changing feature gates or rate limits.
- Updating web landing-page copy.
- Publishing release branches, tags, or deploy branches.
- Importing upstream assets, GitHub workflows, or validation scripts.

## Approval

This design is ready for an implementation plan once reviewed. The recommended
execution path is a docs-only implementation with focused verification and no
runtime code changes.
