# Workflow Patterns

Use this file to choose the right pattern quickly and to connect the skill to viable use-case articles.

## Pattern Selection

| Pattern | Best for | AnyCap role | Local deterministic step |
| --- | --- | --- | --- |
| Text-first meme | Joke or punchline already exists | Generate base visual with safe text area | Add exact top and bottom text |
| Funny meme drawing | Humor carried by doodle style, pose, or absurd scene | Generate multiple rough-but-readable drawing variants | Optional caption only if wording matters |
| Reaction remix | User has screenshot or photo | Edit the source image into cleaner meme form | Overlay exact caption |
| Captioned photo | Quote card, blog image, social tile | Generate or refine the photo background | Render exact headline or caption |
| Meme-video concept | Short social clip | Generate still or motion base | Add subtitles or title card locally |

## Prompt Formulas

### Text-first meme

Use prompts like:

```text
reaction-image style visual, clear subject, simplified background, blank top and bottom caption-safe area, high contrast, internet-humor energy, readable at thumbnail size
```

### Reaction remix

Use prompts like:

```text
preserve the person and pose, clean the framing, exaggerate the expression slightly, simplify distracting background elements, keep empty space for exact meme text
```

### Funny meme drawing

Use prompts like:

```text
funny meme drawing, crude but charming internet doodle style, exaggerated expression, absurd tiny-problem energy, thick sketch lines, off-white paper texture, muted green accents, obvious blank space for optional caption, no words
```

### Captioned photo

Use prompts like:

```text
editorial social graphic, strong focal subject, clean negative space for headline, balanced composition, no text rendered inside the image
```

### Meme-video concept

Use prompts like:

```text
short looping social clip, exaggerated reaction, punchline-friendly pacing, first frame should work as a standalone meme image
```

## Recommended Model Defaults

| Need | Model |
| --- | --- |
| Better first-pass image | `seedream-5` |
| Edit existing screenshot or photo | `nano-banana-pro` |
| Fast variant generation | `nano-banana-2` |
| Funny meme drawings | `nano-banana-2` |

## Style Presets Worth Keeping

These presets are useful because they can do two jobs at once:

- give the skill a repeatable visual direction
- support more than one article without collapsing into template-spam

| Preset | Best use inside the skill | Search-fit verdict | Recommended SEO role | Model |
| --- | --- | --- | --- | --- |
| `classic-doodle` | broad doodle, blob, or stick-figure humor with clean negative space | strongest | core cluster + reusable examples | `nano-banana-2` |
| `bad-drawing` | intentionally clumsy meme art where the joke comes from low-fi execution | good | supporting page or subsection under doodle cluster | `nano-banana-2` |
| `rage-comic-adjacent` | black-and-white panel humor inspired by early internet comics without copying exact legacy faces | situational | heat-content or side article, not core cluster | `nano-banana-2` |

### Why this split

- `classic-doodle` maps best to workflow-led queries like `funny meme drawings`, `meme drawings`, and `easy memes to draw`
- `bad-drawing` is still a workable subworkflow, but the SERP tends to skew toward UGC, image collections, and meme dumps
- `rage-comic-adjacent` has cultural recognition, but the live SERP tends to be dominated by lore, archives, Wikipedia-style explainers, and image collections instead of product-friendly tutorials

## Funny Meme Drawings

This is one of the highest-fit subworkflows for AnyCap because the image itself can carry the joke even before a caption is added.

### Why it fits

- doodle humor tolerates stylization better than photoreal meme requests
- the page can show original generated examples without pretending they are canonical meme templates
- caption-safe empty space can still be requested if the user wants exact text later

### Recommended workflow

1. Start with `nano-banana-2`
2. Generate two to four variants with slightly different absurd situations
3. Keep the cleanest drawing-only winner
4. Add exact text only if the joke still needs wording

### Example command

```bash
anycap image generate \
  --model nano-banana-2 \
  --prompt "funny meme drawing, crude but charming internet doodle style, exhausted office goblin melting into an office chair while holding a tiny coffee cup, absurd tiny-problem energy, wildly exaggerated defeated expression, messy desk chaos without readable screens, thick sketch lines, off-white paper texture, muted green accents, obvious blank space for optional caption, no words, no letters, no watermark" \
  --param aspect_ratio=4:3 \
  --param resolution=2k \
  -o funny-meme-drawing.png
```

## Preset Prompt Starters

Use these as starting points, not fixed formulas.

### `classic-doodle`

```text
funny meme drawing, classic doodle internet-humor style, simple blob or stick-figure character, thick sketch lines, off-white paper texture, expressive face, absurd tiny-problem energy, clean negative space for optional caption, no words
```

### `bad-drawing`

```text
intentionally bad meme drawing, awkward anatomy, uneven hand-drawn lines, low-fi internet humor, simple white background, exaggerated emotion, funny because the drawing is clumsy, optional caption-safe space, no words
```

### `rage-comic-adjacent`

```text
black-and-white internet comic panel, early-web meme energy, expressive overreaction, simple inked linework, four-panel-friendly composition, avoid exact copyrighted or canonical meme faces, optional empty speech bubble area, no words
```

## Article Mapping

These are the strongest article candidates from the current keyword file if the goal is to map search intent to a repeatable AnyCap workflow.

### P1

- `how to make memes online`
- `funny meme drawings`
- `how to create memes on instagram`
- `how to make a meme video`
- `add caption to photo`
- `add caption to image`

### P2

- `how to add captions to pictures`
- `how do you put captions on photos`
- `put meme text on video`
- `easy memes to draw`
- `funny meme drawings easy`
- `bad drawing meme`

### Drop or deprioritize

- highly specific meme names like `4 hand meme`
- generic commercial tool-head terms like `caption generator`
- lore-heavy meme-history queries such as `rage comic` when the searcher clearly wants origins or archives
- unstable or unclear variants with weak product fit

## Why These Fit Better

- They describe a workflow the user wants to complete.
- AnyCap can credibly handle the visual generation or editing layer.
- The agent-plus-skill framing matches the current AnyCap site voice.
- The article can naturally route readers into image generation, image editing, Drive, or Page.

## Suggested Article URLs

Prefer `learn` pages, not a new top-level hub:

- `/learn/how-to-make-memes-online`
- `/learn/funny-meme-drawings`
- `/learn/easy-memes-to-draw`
- `/learn/how-to-make-bad-drawing-memes`
- `/learn/how-to-create-memes-on-instagram`
- `/learn/how-to-make-a-meme-video`
- `/learn/how-to-add-text-to-a-photo`

## Suggested CTA Targets

- `/capabilities/image-generation`
- `/capabilities/video-generation`
- `/skills`
- `/guides/install-anycap`
- `/for/codex`
- `/for/cursor`
- `/for/claude-code`
