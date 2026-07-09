# Seedance 2 Patterns

Use these patterns to move from a user goal to a compact Seedance prompt quickly. Put the reference contract first, then the scene action. Keep the final command parameters controlled by live AnyCap schema.

## Product Hero

Use for product reveals, ecommerce clips, launch visuals, and website hero video.

```text
[Image1] controls product identity. The product sits on [surface/environment] as [one physical change] reveals its key feature. Camera: slow push-in or orbit no more than 20 degrees. Light: one clean highlight travels across the label/shape. Sound: subtle room tone or silent. Stop when the product is centered, readable, and still. Do not change product shape, logo, label, or color.
```

Default mode: `image-to-video` when product image exists; otherwise generate a still first, then animate it.

## UGC-Style Clip

Use for casual social ads, creator-style demos, handheld product moments, and "real phone video" briefs.

```text
[Image1] controls product identity if provided. A casual handheld shot shows [person/hand/product] doing [one simple demo action]. Camera: slight natural handheld push, not shaky. Light: ordinary window or room light. Sound: natural ambience or off. Stop when the benefit is visually obvious. Do not add captions, fake UI text, or brand claims inside the video.
```

Keep motion simple. Put captions in post, not the generated video.

## Character Intro

Use for a person, mascot, fictional character, or recurring subject. Avoid protected likeness unless authorized.

```text
[Image1] controls character identity and wardrobe. The character performs [one readable action] in [setting]. Camera: medium shot with a slow push or hold. Light: [physical source]. Sound: [ambience/silence]. Stop when the expression or pose clearly lands. Preserve face, wardrobe, and body proportions; do not copy any unapproved real person or franchise character.
```

For consistency across clips, keep the same identity image and only change action/environment.

## Transformation

Use for before/after, material change, seasonal shift, cleaning, assembly, repair, and VFX reveal.

```text
[Image1] is the starting state. This clip only transforms [one element] from [before] to [after] through [physical mechanism]. Camera: locked-off or slow push. Light: motivated by [source]. Stop when the final state is complete and still. Do not transform unrelated objects or change the camera angle drastically.
```

If the transformation has several stages, split it into sequence clips.

## Motion Transfer

Use when a donor video should provide movement while an image locks identity/product.

```text
[Image1] controls subject identity. [Video1] controls motion timing and camera rhythm only. The subject from [Image1] performs the same broad movement pattern in [new setting]. Do not transfer performer, costume, room, logo, face, voice, or background from [Video1]. Stop when the movement reaches [endpoint].
```

Use owned, licensed, or clearly authorized donor videos.

## Continuation

Use after an accepted take exists.

```text
[Video1] is the accepted previous clip and controls the actual opening state, camera phase, motion phase, ambience, and environment arrangement. This clip only continues with [next action]. Do not replay [completed action]. Do not show [reserved future action] yet. Stop when [new endpoint].
```

Never write continuation from the original plan if the generated footage or final frame is available.

## Atmospheric Insert

Use for mood shots, interstitials, backgrounds, and establishing details.

```text
[Subject/detail] holds in [place] while [one environmental motion] changes the scene. Camera: locked-off or slow drift. Light: [weather/practical/source] shifts subtly. Sound: ambience or silent. Stop on a clean loopable frame. No characters, no text, no extra story beat.
```

Good for cheap drafts and transitions between more important clips.

## App Or Interface Demo

Use for SaaS/product UI motion, but avoid asking video generation to invent exact text.

```text
[Image1] controls the interface layout. Only the cursor/selection/highlight moves to demonstrate [one action]. Camera: locked screen capture feel, no perspective warp. Light/style: clean digital presentation. Stop when the target panel is highlighted. Preserve UI layout; do not rewrite labels or invent new text.
```

For exact UI text, create the screen as an image first and animate only simple highlights.
