---
name: make-release
description: Use when preparing AnyCap CLI or skill releases. This skill tells the agent how to draft `releases/v<semver>.md` and `releases/skills-v<semver>.md`, track the compare baseline and version in repo files, ask the user to approve the notes, then ask again before publishing the release branches that trigger CI.
---

# Release

Use this skill when the user wants to prepare or publish a new AnyCap CLI release, a new skill release, or both.

## Source Of Truth

- Follow the release rules in `AGENTS.md`.
- CLI release notes live in `releases/v<semver>.md`.
- Skill release notes live in `releases/skills-v<semver>.md`.
- The agent should maintain two small repo files when running this workflow:
  - `releases/version.json`
  - `releases/release-state.json`

If these tracking files do not exist yet, create them during the release-prep turn. Keep them minimal and readable.

## What To Track

In `releases/version.json`, track:

- latest released CLI version
- latest released skill version
- current draft version, if any

In `releases/release-state.json`, track per release track (`cli`, `skills`):

- the baseline commit the next draft should compare from
- the version currently being drafted
- the source `HEAD` commit covered by the draft notes
- whether the draft is only drafted, user-approved, or already published

Track the source `HEAD` that the notes cover, not the later release-note-only commit. This keeps future compare ranges clean.

## Release Workflow

1. Read `AGENTS.md`, `.gitlab-ci.yml`, and the latest relevant files under `releases/`.
2. Read `releases/version.json` and `releases/release-state.json` if they exist.
3. Determine the next version with the user if it is not already clear.
4. Compute the compare range from the tracked baseline. If no state file exists yet, bootstrap from the latest release-note commit already in git history.
5. Review commits and changed files in that range.
6. Draft:
   - `releases/v<semver>.md` for CLI, user-facing Markdown
   - `releases/skills-v<semver>.md` for skills, full commit-message format
7. Update the tracking files with the new draft version and covered source `HEAD`.
8. Show the drafted notes to the user and ask whether the wording is okay.
9. Only after explicit approval, mark the draft as approved in the tracking file.
10. Ask again whether to publish.
11. Only after explicit publish approval, push:
   - `release/cli-v<semver>` for CLI
   - `release/skills-v<semver>` for skills
12. After publish succeeds, update the tracking files so the released version and next compare baseline are correct.

## Note Style

CLI notes:

- audience is CLI users
- Markdown is allowed
- summarize user-visible changes only
- do not dump raw commit logs

Skill notes:

- the whole file is the git commit message used by sync
- first line is a conventional-commit style subject
- second line is blank
- body is short bullets
- no Markdown headings
- no code fences

## Guardrails

- Do not publish before the user approves the wording.
- Do not publish before the user explicitly says to publish.
- Keep CLI and skill versions in sync unless the user explicitly wants a different workflow.
- If the tracked baseline looks wrong, stop and explain the mismatch before drafting.
- If there are existing unrelated working-tree changes, do not revert them.
