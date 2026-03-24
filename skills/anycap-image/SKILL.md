---
name: anycap-image
description: Generate images through AnyCap. Use when the agent needs AI image generation, listing image models, or creating images from text prompts.
---

# AnyCap Image Capability

Use this skill when the agent needs image generation through AnyCap.

## Discovery

List available models:

```bash
anycap image models
```

## Generate

Generate an image from a text prompt:

```bash
anycap image generate --prompt "cyberpunk city" --model flux-dev
```

### Options

- `--prompt` (required): Text description of the image to generate
- `--model`: Model to use (run `anycap image models` to see available options)

## Notes

- AnyCap returns JSON-first responses. Pipe output through `jq` for human-readable formatting.
- The current repository skeleton routes image requests through the AnyCap Server stub.
