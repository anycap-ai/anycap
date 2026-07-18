# Scenario Templates

Use these templates as starting points. Replace bracketed text with the user's actual assets and goal. Keep prompts in English unless the user has a strong reason to use another language.

## Product Replacement In Hand

Best for replacing a phone, cup, snack, tool, bottle, or package held by a person.

Prompt:

```text
Replace only the object held in the person's hands with the product from the reference image: [precise product description]. Keep the same person, face, body, hands, clothing, jewelry, background, camera motion, lighting, shadows, audio, and timing. Make the product naturally held with realistic scale, finger occlusion, contact shadows, and stable shape and color across frames. Keep everything else the same. Do not change the person's identity, do not warp hands, do not add text or graphics, and do not flicker.
```

Use:

```bash
anycap video generate \
  --model gemini-omni-flash-preview \
  --mode edit-video \
  --prompt "Replace only the object held in the person's hands with the product from the reference image: [product]. Keep the same person, face, body, hands, clothing, jewelry, background, camera motion, lighting, shadows, audio, and timing. Make the product naturally held with realistic scale, finger occlusion, contact shadows, and stable shape and color across frames. Keep everything else the same. Do not change the person's identity, do not warp hands, do not add text or graphics, and do not flicker." \
  --param videos=./source.mp4 \
  --param images=./product-reference.png \
  --param aspect_ratio=16:9 \
  --param duration=10 \
  --param resolution=720p \
  --param format=mp4 \
  -o ./product-replacement-v1.mp4
```

Failure fixes:

- Product looks generic: add visual anchors from the reference image, such as lid, handle, label placement, material, and color.
- Hands warp: simplify to "Replace the object; preserve hand pose and finger positions."
- Product flickers: add "stable silhouette, stable color, stable logo placement across all frames."

## Object Removal

Best for hiding a phone, logo, sign, bag, prop, or background item.

Prompt:

```text
Make [target object] invisible and fill the area naturally from the surrounding scene. Preserve the same person, motion, camera, lighting, shadows, background, audio, and timing. Keep everything else the same. Do not add new objects, do not change faces or clothing, and do not leave smears or flicker.
```

Use when the user wants "remove", "erase", "make it disappear", or "clean up this object." For complex removals near fingers or faces, expect a retry.

## Relighting Or Mood Change

Best for changing atmosphere while preserving content.

Prompt:

```text
Change the lighting to [desired lighting or mood]. Preserve all subjects, objects, actions, camera motion, framing, background layout, audio, and timing. Keep everything else the same. Do not change identity, clothing, props, or scene geometry.
```

Use for "make it cinematic", "golden hour", "dramatic lighting", "softer light", "night look", or "studio light." Avoid combining relighting with product replacement in the same first pass unless the user explicitly needs both.

## Style Transfer

Best for anime, claymation, watercolor, vintage film, product-ad look, or brand mood.

Prompt:

```text
Restyle the video as [style]. Preserve the subject identity, action, shot timing, composition, camera motion, and scene content. Keep everything else the same. Do not add extra characters, text overlays, logos, or scene cuts.
```

For brand style references, pass images as references and name their roles in the prompt:

```text
Use Image 1 as the visual style reference and Image 2 as the product reference. Restyle the video as [style] while preserving the same action and composition. Keep everything else the same.
```

## Text Or Sign Change

Best for changing a visible sign, poster, label, or screen in a short clip.

Prompt:

```text
Change only the text on [sign/screen/label] to read "[exact text]". Preserve the same sign position, camera motion, lighting, background, people, audio, and timing. Keep everything else the same. Do not change other text or add extra graphics.
```

Exact text may still need inspection. QA with frame samples and video-read.

## First Frame Or Reference Role Tags

Official Gemini Omni Flash prompting supports role tags such as `<FIRST_FRAME>` and `<IMAGE_REF_N>`. Through AnyCap, use them inside the prompt only when the image ordering is clear and the live schema accepts image references.

Example:

```text
[# References <IMAGE_REF_0>@Image1] Replace the product in the source video with <IMAGE_REF_0>. Use Image1 as the product reference, not as the first frame. Keep everything else the same.
```

Keep this optional. Simple natural language is often easier to debug.
