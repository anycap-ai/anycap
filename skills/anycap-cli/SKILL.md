---
name: anycap-cli
description: AnyCap CLI for AI agents. Use when the agent needs image understanding, video analysis, or checking AnyCap service status.
metadata:
  version: 0.0.2
---

# AnyCap CLI

AnyCap is a capability runtime for AI agents. The `anycap` CLI provides access to image understanding, video analysis, and more.

## Keeping Up to Date

Check whether this skill file matches your CLI version:

```bash
anycap skill check --target <path-to-this-file>
```

Follow the output to update the skill or the CLI as needed.

## Setup

```bash
anycap login
anycap status
```

## Commands

### Status

```bash
anycap status
```

### Image Understanding

Analyze one or more images using vision models.

Single image:

```bash
anycap actions image-understand --url https://example.com/photo.jpg
anycap actions image-understand --file ./screenshot.png
anycap actions image-understand --url https://example.com/photo.jpg --instruction "What text is in this image?"
```

Multiple images (up to 10):

```bash
anycap actions image-understand --url https://example.com/p1.jpg --url https://example.com/p2.jpg --instruction "Compare these images"
anycap actions image-understand --url https://example.com/photo.jpg --file ./local.png --instruction "Describe each image"
```

Options:
- `--url`: Image URL to analyze (can be repeated)
- `--file`: Local image file to upload and analyze (can be repeated)
- `--instruction`: Custom instruction for analysis
- `--model`: Model ID to use

At least one `--url` or `--file` is required. Maximum 10 images per request.

### Video Analysis

Analyze a video:

```bash
anycap actions video-read --url https://example.com/clip.mp4
anycap actions video-read --file ./recording.mp4
anycap actions video-read --url https://example.com/clip.mp4 --instruction "Summarize the key events"
```

Options:
- `--url`: Video URL to analyze
- `--file`: Local video file to upload and analyze
- `--instruction`: Custom instruction for analysis
- `--model`: Model ID to use

Exactly one of `--url` or `--file` is required.

### Skill Management

```bash
anycap skill check --target <path>       # Check if skill is up to date
anycap skill install --target <path>     # Install/update skill files
anycap skill show                        # Print embedded skill content
```

## Notes

- All output is JSON-first. Pipe through `jq` for human-readable formatting.
- Local files (via `--file`) are automatically uploaded before analysis.
- Use `--instruction` to guide the model on what to focus on.
