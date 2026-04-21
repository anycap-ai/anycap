# AnyCap Chrome Extension

See `docs/superpowers/specs/2026-04-21-chrome-extension-design.md` for spec.

## Development

    pnpm install
    pnpm dev          # starts WXT dev server + auto-reload
    pnpm test         # vitest unit + integration
    pnpm e2e          # playwright
    pnpm build        # .output/chrome-mv3/ production bundle

## Load unpacked

1. `pnpm dev`
2. Chrome -> chrome://extensions -> Developer mode -> Load unpacked -> `.output/chrome-mv3-dev`
