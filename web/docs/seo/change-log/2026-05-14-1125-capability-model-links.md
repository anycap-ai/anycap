---
node_id: SEO-20260514-1125
type: change-log
topic: capability model links
date: 2026-05-14
---

# Capability Model Links

## Changes

- Updated image, video, and music generation capability pages to use the shared model catalog for supported model tables.
- Added internal links from capability model tables to the expanded model detail pages.
- Refreshed capability copy and FAQ answers that previously named only the older subset of models.
- Updated image-to-image and image-to-video CLI examples to use local file parameters (`--param images=...`) instead of old URL-array examples.
- Updated the capabilities hub music model summary to include the current music catalog.

## Verification

- `pnpm run build`
