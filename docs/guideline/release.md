# Release and Deploy Guidelines

## Purpose

Use this before preparing release notes, pushing release branches, publishing
skills, building CLI artifacts, or deploying server/web/worker surfaces.

## Source of Truth

- GitLab pipeline: `.gitlab-ci.yml`
- Goreleaser config: `.goreleaser.yml`
- Release scripts: `scripts/release/`
- Release notes: `releases/`
- npm package template: `npm/anycap/`
- Web deploy helper: `web/Makefile`
- Edge worker deploy helper: `workers/edge/Makefile`

## Safety Rules

- Do not push release branches, deploy branches, or tags unless the user has
  explicitly asked for that action.
- Do not proceed with a CLI release branch until the user explicitly approves
  the CLI release notes.
- Do not publish secrets, tokens, or provider credentials in release notes,
  logs, or scripts.
- Keep release notes user-facing and scoped to what changed.

## CLI Release

The CLI release flow is driven by `release/cli-v<semver>` branches and the
GitLab pipeline. Before pushing:

- Write release notes in `releases/v<semver>.md`.
- Present them to the user and get explicit approval.
- Ensure CLI-facing changes are verified.
- Ensure matching skill release work is considered.

## Skills Release

Skills release branches use `release/skills-v<semver>`. The release note file
is used as the sync commit message, so keep it in commit-message format:

- Conventional subject line.
- Blank line.
- Body describing skill-facing changes.
- No markdown headers or code fences unless the sync script is changed to
  support them.

CLI and skills versions should stay aligned for normal releases.

## Server Deploy

Server deploys are branch-driven through GitLab CI. Use deploy branches only
when the user explicitly asks for deployment.

## Web and Worker Deploy

Web deploys primarily flow through the configured GitHub/Cloudflare Pages
integration. `web/Makefile` is a manual fallback.

Edge worker deploys use `workers/edge/Makefile`. Production deploys require
extra care and explicit user intent.

## Final Reporting

When release/deploy actions are performed, report:

- branch/tag pushed
- release notes file used
- checks run
- artifact or deploy URL when available
- anything intentionally skipped
