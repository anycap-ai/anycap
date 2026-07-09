# Reference Consistency

Use this reference when the task includes product identity, character consistency, multiple images, video motion transfer, audio references, first/last frames, continuation, or any risk that one reference will contaminate another.

## Contract First

Write the reference contract before scene prose:

```text
[Image1] controls product identity and label. [Video1] controls camera rhythm only. [Audio1] controls tempo only. Preserve product shape, color, logo, and label from [Image1]. Do not transfer people, room, costume, face, voice, music identity, or background from [Video1]/[Audio1].
```

The contract has five parts:

1. Exact tag: `[Image1]`, `[Video1]`, `[Audio1]`, or the user's provided label.
2. Primary role: one job per reference.
3. Stable fields: what must stay the same.
4. Allowed changes: what can move or transform.
5. Exclusions: what must not transfer.

## Role Matrix

| Reference | Strong roles | Weak roles |
|---|---|---|
| Product image | identity, label, shape, material, color, starting frame | detailed timing, choreography |
| Character image | face, wardrobe, body type, pose, first frame | complex acting arc, lip-sync |
| Environment image | location layout, color palette, first/last frame | product identity, camera rhythm |
| Motion video | camera rhythm, blocking, gesture timing, choreography | identity, costume, face, room, logo |
| Previous accepted clip | actual opening state, camera phase, motion phase, ambience | future story beats, rejected deviations |
| Audio | tempo, ambience, energy, cue timing | voice likeness, copyrighted song identity, exact dialogue authorization |

## Identity Locks

Use identity locks when product, character, or brand appearance matters:

```text
Preserve [Image1] product shape, label placement, color, material, and proportions. Only the highlight and camera movement may change.
```

For characters:

```text
Preserve [Image1] face structure, hairstyle, wardrobe, and body proportions. Only expression, small gesture, camera, and light may change.
```

If the user supplies an unauthorized celebrity, public figure, franchise character, logo, song, or private person, rewrite to a safer original equivalent before generation.

## Allowed Delta

Image-to-video prompts should describe the delta, not the whole source image:

```text
[Image1] preserved; only steam, window reflection, and slow camera push change.
```

For stylized references, allow physical conversion only where needed:

```text
The drawn steam becomes soft moving vapor while cup, table, window, and composition stay fixed.
```

## Multi-Reference Conflicts

Resolve conflicts before generating:

- If two images define identity, choose one as canonical and make the other style/environment only.
- If video motion conflicts with image identity, keep image identity and transfer only broad motion.
- If audio tempo conflicts with video pacing, state which one owns timing.
- If previous accepted footage conflicts with the plan, accepted footage wins.
- If exact text matters, create or preserve it in a source image and do not ask video generation to invent it.

## Continuity Chain

For continuation, attach the accepted previous clip when available:

```text
[Video1] is the accepted previous clip and controls only the actual opening state, camera phase, motion phase, ambience, and environment arrangement. This clip continues with [next action]. Do not replay [completed action]. Stop when [new endpoint].
```

Do not continue from rejected takes. Do not continue from the original plan if a generated clip or final frame is available.

## Repair Phrases

Use these as one-variable retakes:

| Problem | Add or replace with |
|---|---|
| Product changed | `Preserve [Image1] product shape, label, color, material, and proportions.` |
| Character drifts | `Preserve [Image1] face structure, hairstyle, wardrobe, and body proportions.` |
| Donor video copied too much | `[Video1] controls motion timing only; do not transfer performer, room, costume, face, logo, or background.` |
| Still image reimagined | `[Image1] preserved; only [specific delta] changes.` |
| Continuation repeats | `Do not replay [completed action]; begin from the actual final state of [Video1].` |
| Text changes | `Preserve existing text from [Image1]; do not invent, rewrite, or add text.` |
