# AnyCap

This repository provides Agent Skills and documentation for accessing multimodal AI capabilities through the AnyCap CLI.

For full CLI skill instructions, see [`skills/anycap-cli/SKILL.md`](skills/anycap-cli/SKILL.md).

## Documentation

The public documentation site lives in [`docs/`](docs/) and uses Astro Starlight. Its canonical URL is `https://docs.anyware.ai`.

- Use the root `Makefile`: run `make docs-check` and `make docs-audit` after documentation changes; use `make docs-dev` or `make docs-worker-preview` for local review.
- Keep user-facing documentation in English.
- Treat the live CLI model catalog and schema commands as authoritative; do not hard-code fast-changing model availability.
- Keep one canonical page per concept and use internal links instead of duplicating long explanations.
- Deployment uses `.github/workflows/docs.yml`, the GitHub Environment `docs`, and Cloudflare Workers Static Assets.
- The first `wrangler deploy` creates the `anycap-docs` Worker. Custom-domain binding remains a manual Cloudflare step.
- Repository-level public artwork belongs in [`assets/`](assets/), not inside the docs source tree.
