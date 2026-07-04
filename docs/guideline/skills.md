# Skills Guidelines

## Purpose

Use this when changing agent-facing skill files under `skills/` or the embedded
CLI skill.

## Source of Truth

- Distributed skills: `skills/*/`
- CLI skill: `skills/anycap-cli/`
- Embedded CLI skill copy: `internal/cli/skill/embedded/`
- Skill sync target in Makefile: `sync-skills`
- Release sync script: `scripts/release/sync-skills.sh`
- Current CLI behavior: `internal/cli/command/`

## Rules

- Skill docs must describe actual verified behavior, not intended behavior.
- After changing CLI behavior, verify the CLI first, then update the relevant
  skill files.
- Keep skill examples executable and aligned with current flags.
- Do not duplicate large CLI help output. Teach the workflow and point to the
  exact command where useful.
- Do not turn skills into a second product catalog. Avoid hard-coded lists of
  current models, capabilities, feature names, routes, API paths, external ID
  prefixes, pricing, rate limits, product status, or web copy.
- For facts that change often, teach agents where to read the current source of
  truth and how to verify it. Prefer placeholders such as `<model-id>` in
  examples unless the task is documenting a specific verified behavior that
  requires a concrete value.
- Keep skill metadata and release notes aligned with release flow.
- Run or account for `make sync-skills` when embedded CLI skill content must be
  updated.

## Top-Level Skills

Do not assume `skills/` contains only `anycap-cli`. Multiple AnyCap skills are
distributed from this repo. When changing shared publishing behavior, consider
all directories under `skills/*`.

## Release Note Interaction

Skills release notes live under `releases/skills-v<semver>.md` and are used by
the sync flow. See `docs/guideline/release.md` before preparing release work.
