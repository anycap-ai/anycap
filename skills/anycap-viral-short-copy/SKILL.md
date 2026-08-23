---
name: anycap-viral-short-copy
description: "Reproduce the transferable structure of a proven short-form reference with AnyCap before making creative changes, then enter a user-feedback-driven remix loop only when requested. Use when a user supplies a successful, viral, high-performing, or reference short and asks to copy, recreate, reproduce, adapt, iterate, or make a similar version. Covers reference analysis, copy blueprints, AnyCap video generation, human review, copy repair, remix branching, and version lineage across topics, platforms, durations, and supported models."
metadata:
  version: 0.6.0
  website: https://anycap.ai
  compatibility: Requires an authenticated AnyCap CLI and internet access. Works with agents that support shell commands.
license: MIT
---

# AnyCap Viral Short Copy

Turn a proven short-form reference into the closest safe copy first. Show that copy to the user. Do not remix automatically.

Read the `anycap-cli` skill before using AnyCap. Read the `anycap-media-production` skill for generation and delivery mechanics. Read [references/state-contract.md](references/state-contract.md) when recording the blueprint, user feedback, version lineage, or an executor handoff.

## Core Law

`reference -> copy -> user verdict -> accept | copy repair | remix`

- Produce the closest safe copy before proposing creative variation.
- Treat reference mismatch as copy repair, not remix.
- Enter remix only after the user reviews a copy and requests a preference-level change.
- Inherit every unmentioned decision from the previous version.
- Never overwrite the accepted or reviewed copy baseline.

## 1. Read The Reference

Use `anycap actions video-read` to inspect an accessible video reference. Do not infer its structure from a title, description, thumbnail, or memory. Use image-read or audio-read for additional supplied references when relevant.

Extract only observable evidence:

- duration and aspect ratio
- opening frame and first-second hook
- shot order, cut points, and camera relationship
- subject, action, consequence, and visible endpoint per beat
- information-release order
- escalation and emotional curve
- audio cues tied to visible changes
- payoff, reveal, release, and loop behavior
- title or thumbnail promise when supplied

Separate three classes before generating:

1. `transfer`: timing, functional composition, motion rhythm, narrative mechanism, reveal order, or other authorized structural elements.
2. `replace`: identity, product, setting, subject, or other elements the user explicitly wants changed.
3. `exclude`: unauthorized likeness, logos, protected characters, distinctive expression, exact frames, voices, music identity, or unrelated details.

## 2. Build The Copy Blueprint

Compile a content-neutral blueprint from the evidence. Describe functions rather than topic-specific nouns whenever possible.

Required fields:

- `promise`: what the viewer expects from the opening or title
- `hook_deadline`: when the first meaningful disruption lands
- `beats`: timed setup, escalation, payoff, and release
- `shot_contract`: shot count, framing function, movement, and cut logic
- `audio_contract`: cues that own timing
- `endpoint`: the visible final state or loop handoff
- `locks`: mechanisms that must match the reference
- `replacements`: user-authorized substitutions
- `exclusions`: elements that must not transfer

Do not add improvements, new beats, or personal taste during Copy.

## 3. Plan AnyCap Execution

Discover the current video models and inspect the selected model's schema. Do not hard-code model availability or parameters. Ask the user to select a model when they have not already chosen one.

Choose the least expensive test that can validate the riskiest beat. Use reference-led generation when the live schema supports it. If direct reference transfer is unavailable or fails, preserve the blueprint with the smallest viable substitute: extracted keyframes, motion timing, first and last frames, or a compact text contract. Report the fallback.

Pass the executor:

- the Copy Blueprint
- reference role map
- allowed transfer and exclusions
- requested output constraints
- one current objective

Use descriptive, non-destructive output names under the user's requested output directory. For durable AnyCap video tasks, save the task ID and resume the existing task instead of resubmitting it.

## 4. Produce And Review The Copy

The first deliverable is `copy_v1`, not a remix.

- Match the reference mechanism before raising production value.
- Prefer an inexpensive draft of the riskiest beat when generation is costly.
- Review the output with `anycap actions video-read` against the blueprint using visible evidence.
- Repair systematic mismatches before calling the result a copy.
- Do not silently change subject, pacing, camera grammar, payoff, or ending.

Before presenting the copy, verify:

- the hook lands by the reference deadline
- beat order and payoff match the blueprint
- reference roles and exclusions held
- required action and consequence are visible
- output constraints are satisfied

Present the copy and wait for the user's verdict. When spatial or time-coded feedback would be useful, start an AnyCap annotation session and ask the user to review there. Do not automatically generate alternatives.

## 5. Classify User Feedback

### Accept

The user is satisfied or asks for delivery. Lock the version and proceed only with requested packaging, sharing, publishing, metadata, or post-production.

### Copy Repair

Use when the output failed to reproduce the reference mechanism, for example:

- too slow or too early compared with the reference
- wrong camera angle or cut order
- missing action, consequence, payoff, or reveal
- incorrect reference identity or layout
- drift from an explicit lock

Repair the smallest failing contract. Keep the task in Copy state.

### Remix

Use only when the user requests a preference-level change after seeing the copy, for example:

- replace a subject, environment, style, or action mechanism
- make the performance stronger, calmer, faster, darker, or funnier
- change the framing, ending, language, or presentation
- combine the successful copy mechanism with a new creative direction

Create a delta containing:

- what the user likes and wants preserved
- what the user dislikes
- exact requested changes
- all inherited locks

Generate a new branch such as `remix_v1`; never relabel it as the copy baseline.

## 6. Remix Loop

For every remix:

1. Start from the latest user-reviewed version unless the user selects another baseline.
2. Apply only the latest requested delta.
3. Preserve all unmentioned elements.
4. Review whether the delta landed and inherited locks survived.
5. Show the result and wait again.

If feedback says the requested change did not land, repair that remix. If feedback introduces a new preference, create the next remix delta.

Before presenting a remix, verify:

- every requested change is observable
- every unmentioned lock remains intact
- no unrelated creative changes appeared
- the baseline remains available

## 7. Version Discipline

Maintain explicit lineage:

```text
reference
└── copy_v1
    ├── copy_v2-repair
    └── remix_v1
        └── remix_v2
```

- Keep accepted artifacts recoverable.
- Name outputs descriptively and non-destructively.
- Record the baseline and delta for every branch.
- Do not accumulate old feedback into a rewrite; compile only current locks plus the newest delta.
- Use AnyCap Drive only when the user needs a shareable link or remote handoff.

## Response Contract

Return compactly:

```text
State: copy | copy-repair | remix | accepted
Version: <id>
Baseline: <reference or prior version>
Preserved: <locks that held>
Changed: <current delta, or none for copy>
Take: <evidence-based review>
Artifact: <local path or AnyCap share URL>
Next: wait for user verdict
```

Do not call a result viral based only on visual similarity. Virality is an external outcome; report structural fidelity and observable quality instead.
