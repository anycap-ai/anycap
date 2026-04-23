---
name: anycap-blog-production
description: "Turn user-provided data, notes, research, product facts, or structured inputs into AnyCap-style blog posts and then enrich those posts with first-party evidence blocks when needed. Use when a user wants a blog, article, tutorial, learn page, or SEO content draft written in the tone of the AnyCap website. Best fit when the input is data-first rather than prose-first: spreadsheets, JSON, bullets, notes, source URLs, benchmarks, product facts, or rough research. Trigger on: write blog from data, turn notes into article, blog drafting, article production, learn page drafting, SEO article in AnyCap tone, or requests to convert structured inputs into publish-ready content."
metadata:
  version: 0.3.5
  website: https://anycap.ai
  compatibility: Requires anycap CLI binary and internet access. Best for AnyCap website content, especially blog, learn, guide, glossary, and landing-page style articles authored from structured inputs.
license: MIT
---

# AnyCap Blog Production

> **Read this entire file before starting.** This skill is for turning user-fed data into AnyCap-style articles, then adding evidence where the article needs proof.

Use this skill when the user provides facts, notes, examples, benchmarks, product capabilities, or other raw inputs and wants a finished blog post that sounds like the AnyCap website. The core job is:

1. normalize the input data into a working brief
2. draft a page in AnyCap's website tone
3. decide whether the article needs first-party evidence blocks
4. add AnyCap-generated visuals only when they materially improve the page

This skill is about **blog production workflow**. For raw CLI syntax, authentication, and command behavior, read the `anycap-cli` skill. For broader search-intent planning, read the `anycap-ai-tool-seo` skill.

Read these reference files before drafting:
- [voice.md](references/voice.md)
- [patterns.md](references/patterns.md)
- [input-brief.md](references/input-brief.md)

## Best Fit

- data-driven blog drafting
- learn pages and tutorials built from research notes
- glossary or concept pages built from product facts and supporting examples
- SEO articles where the user feeds benchmarks, examples, or feature data first
- content workflows where the input is bullets, tables, JSON, spreadsheets, links, or rough notes
- AnyCap website content that should sound operational, answer-first, and product-literate instead of generic content-marketing prose

## Before You Start

1. Verify AnyCap is available:

```bash
anycap status
```

2. Inspect the page structure before editing:
   - find the base page
   - find the localized wrapper
   - check whether localized or duplicated routes simply re-export the base page

3. Normalize the input into a brief:
   - what is the article topic?
   - who is it for?
   - what does the data actually prove?
   - what is the one-sentence answer or promise?
   - what can be stated confidently, and what is still unknown?

4. Check the git worktree and do not overwrite unrelated user edits.

5. Read the tone and structure references before writing.

## Workflow

### 1. Build a working brief from the input data

The user may feed:
- bullets
- product facts
- competitive notes
- spreadsheet exports
- JSON
- URLs
- benchmarks
- rough observations

Your first job is to convert that into a compact internal brief:
- target reader
- search or page intent
- page thesis
- 3-6 supporting facts
- missing proof or uncertainty
- recommended page shape

If the input is sparse, infer carefully but keep the article scoped to what the data can actually support.

### 2. Draft in AnyCap website tone before expanding

Default AnyCap article pattern:

1. short eyebrow
2. direct H1 with one concrete promise
3. concise intro for readers who already know the general category
4. answer-first summary block near the top
5. one or more structured sections:
   - workflow
   - comparison
   - checklist
   - use cases
   - FAQ
6. CTA or internal links that move the reader to the next relevant page

Do not start with generic scene-setting. Start with the actual problem, constraint, or useful outcome.

### 3. Match the evidence type to the page's claim

- **Show the final outcome**: generate one polished hero or showcase image.
- **Show a transformation**: generate a rough source image, then a refined after-image from the same subject.
- **Show range or iteration**: generate a triptych or clean review board with multiple variations.
- **Support a time-based workflow**: generate a companion still or keyframe that represents the brief. Do not present a static image as the full video result.
- **Support an audio-based workflow**: generate a mood image or cover visual that supports the prompt. Do not imply the image is audio output.
- **Support a process explanation**: generate a clean step illustration or diagram-like visual that makes the written explanation easier to scan.

If the article already lands without media, do not force a proof block. This skill is for useful proof, not decorative filler.

### 4. Discover real model constraints before prompting

If the article needs media, inspect the live model catalog and schema first:

```bash
anycap image models
anycap image models <model> schema --operation generate --mode <mode>

anycap video models
anycap video models <model> schema --operation generate --mode <mode>

anycap music models
anycap music models <model> schema --operation generate
```

Never assume mode names, parameter names, or supported aspect ratios.

### 5. Generate assets into a reusable public path

Use descriptive filenames and keep related artifacts together:

```bash
mkdir -p web/public/content-evidence

anycap image generate \
  --model <model> \
  --prompt "<subject-specific brief> ... no readable text, no watermark" \
  --param aspect_ratio=16:9 \
  -o web/public/content-evidence/<page-slug>-hero.png
```

Rules:
- Always use `-o` with a descriptive filename.
- Prefer `16:9` for hero or showcase blocks unless the layout needs another ratio.
- Version or split files clearly for before/after workflows.
- Keep assets topic-specific at generation time, but keep the skill itself topic-agnostic.
- If the page is localized through wrapper files, keep assets shared unless a locale-specific image is genuinely needed.

### 6. Verify the generated asset before wiring it into the page

Use AnyCap vision to validate the artifact:

```bash
anycap actions image-read \
  --file web/public/content-evidence/<page-slug>-hero.png \
  --instruction "Describe this image, confirm it matches the intended page claim, and mention any visible text or watermark."
```

For edit workflows, compare source and revision:

```bash
anycap actions image-read \
  --file web/public/content-evidence/<page-slug>-before.png \
  --file web/public/content-evidence/<page-slug>-after.png \
  --instruction "Confirm whether the second preserves the same subject while improving composition and background cleanliness."
```

If verification reveals visible text, stray signage, wrong subject identity, or prompt drift, re-prompt and regenerate before editing code.

### 7. Optimize the asset and wire it into reusable code

- Compress oversized PNGs to JPG or WebP when the visual difference is acceptable.
- Prefer a reusable component plus a lookup table over duplicating large JSX blocks in every page.
- Keep captions factual:
  - static images can say the image was generated through AnyCap for the page
  - time-based or audio-based pages should explicitly label the visual as a companion still or cover visual
- If localized routes simply re-export the base page, edit the base page once instead of patching every localized copy.
- Keep the reusable block generic enough that it can be dropped into articles, guides, or landing pages without rewriting the component itself.

### 8. Verify the page integration

Run targeted checks on the files you touched:

```bash
pnpm exec eslint \
  'src/components/seo/ContentEvidenceBlock.tsx' \
  'src/lib/content-evidence.ts' \
  'src/app/(seo)/<section>/<page>/page.tsx'
```

If a full repo-wide typecheck fails because of pre-existing issues, record the exact blocking file and keep the skill output focused on what was actually validated.

## Output Expectations

Default deliverables:
- a compact brief distilled from the input data
- an article draft in AnyCap website tone
- generated assets in a stable public directory
- one reusable content or UI component if multiple pages need the same evidence pattern
- page copy that explains what the asset proves
- alt text, caption, and prompt block that match the real artifact
- concise validation notes covering generation, verification, and code checks

## Guardrails

- Do not write generic "AI blog" copy that could belong to any SaaS site.
- Do not let the article drift beyond what the provided data can support.
- Do not bury the answer under a long warm-up.
- Do not use stock art when the whole point is to show first-party AnyCap output.
- Do not present a static image as if it were the actual output of a video or music model.
- Do not leave visible text or watermarks in showcase assets unless the page specifically needs them.
- Do not duplicate localized page implementations when a wrapper already reuses the base page.
- Do not inflate pages with generic prose when the missing piece is proof.
- Do not bake page topic, keyword cluster, or niche-specific nouns into the skill itself. Those belong to the actual task input, not to the reusable workflow.

## Quick Reference

```bash
# Check auth and feature availability
anycap status

# Normalize the topic with a small brief before writing
# Then inspect model parameters only if the article truly needs media

# Discover image models and parameters
anycap image models
anycap image models <model> schema --operation generate --mode text-to-image

# Generate a page-specific artifact
anycap image generate --model <model> --prompt "..." -o web/public/content-evidence/<page-slug>-hero.png

# Validate the artifact with vision
anycap actions image-read --file web/public/content-evidence/<page-slug>-hero.png --instruction "Describe this image and mention visible text."

# Compress a heavy PNG to JPG
sips -s format jpeg -s formatOptions 80 web/public/content-evidence/<page-slug>-hero.png --out web/public/content-evidence/<page-slug>-hero.jpg
```
