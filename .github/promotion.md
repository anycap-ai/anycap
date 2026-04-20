# Promotion guide

A reference for anyone helping AnyCap reach more developers — maintainers, contributors, or community members producing release notes, demo assets, or social posts. Pair it with the [README](../README.md) and [CONTRIBUTING guidelines](../CONTRIBUTING.md) (if present).

The repo home is <https://github.com/anycap-ai/anycap>. Capability source of truth is [`skills/anycap-cli/SKILL.md`](../skills/anycap-cli/SKILL.md). Positioning source of truth is <https://anycap.ai>.

## Repository topics

GitHub allows up to 20 topics per repo. The set below covers AnyCap's primary discovery surfaces — agent runtimes, named coding agents, and multimodal capabilities — without diluting relevance.

```
ai-agent
agent-runtime
coding-agent
claude-code
cursor
codex
multimodal
image-generation
video-generation
ai-tools
developer-tools
cli-tool
agent-tools
automation
```

Maintainers can edit topics at <https://github.com/anycap-ai/anycap/settings>. The named-agent topics (`claude-code`, `cursor`, `codex`) tend to drive the highest-intent traffic and are worth keeping pinned.

## Social preview image

GitHub renders a preview image when the repo URL is shared on X, Slack, Discord, Telegram, LinkedIn, and similar platforms. Without one, GitHub falls back to a generic placeholder with noticeably lower click-through.

**Spec**

- Recommended size: 1280×640 (minimum 640×320)
- Suggested path: `docs/images/social-preview.png`
- Upload location: <https://github.com/anycap-ai/anycap/settings> → Social preview
- GitHub reference: [Customizing your repository's social media preview](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/customizing-your-repositorys-social-media-preview)

**Suggested copy**

- Title: `Give your coding agent real-world capabilities`
- Subtitle: `Image, video, vision, search, publishing — one install`
- Visual cue: a four-step workflow strip — `prompt → generate → revise → ship`
- Footer mark: `anycap.ai` with a small `github.com/anycap-ai/anycap`

The preview tends to perform better when it leads with the workflow rather than the logo, since most viewers are scanning for what the tool actually does.

## Image and demo assets

The README includes commented-out image slots. To activate one, add a file at the path below and uncomment the matching `<!-- ![...](...) -->` line in [`README.md`](../README.md).

| Slot                  | Path                                  | Size       | Format      | Source material                                                                                                                  |
| --------------------- | ------------------------------------- | ---------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Hero (and social)     | `docs/images/hero.png`                | 1280×640   | PNG         | Generated with `anycap image generate` using the social-preview copy above. Reusable as the next release graphic.                |
| Workflow 1: meme      | `docs/images/workflow-meme.gif`       | 1200×~675  | GIF or MP4  | Terminal recording (vhs / asciinema → gif) of the meme command sequence in the README "Make a meme end-to-end" section, 20–30 s. |
| Workflow 2: page      | `docs/images/workflow-page.gif`       | 1200×~675  | GIF or MP4  | Terminal recording of `anycap page deploy ./dist --publish`, ending on the live URL, 15–25 s.                                    |
| Workflow 3: annotate  | `docs/images/workflow-annotate.gif`   | 1200×~675  | GIF or MP4  | Screen capture of `anycap annotate` showing a human marking issues, then `actions image-read` returning the summary.             |

**Guidelines**

- Keep each animated asset under ~5 MB so GitHub mobile previews render inline.
- Record the real CLI rather than reconstructing terminal output in a graphics tool — viewers are quick to spot staged demos and trust drops accordingly.
- One job per asset. A single demo that does one thing well is more useful than a montage.
- Create `docs/images/` on the first asset commit and check it into the repo so forks and mirrors render correctly.

## Release titles

Release titles surface in the GitHub Releases page, RSS feeds, social cards, and changelog aggregators. Outcome-led titles tend to communicate value to readers who are not already familiar with the codebase.

**Format**

```
vX.Y.Z — <what the agent can now do for the human>
```

**Examples**

- `v0.2.1 — Agent whiteboards humans can edit live`
- `v0.2.0 — Agent annotation loop for screenshot, URL, and video feedback`
- `v0.1.2 — Multi-reference image edits in one shot`

**Suggested approach**

- Lead the title with the user-visible outcome, not the internal noun or subcommand name.
- Keep the full changelog in the body. The outcome framing only needs to apply to the title and the opening paragraph.
- If a release ships two equally important features, pick the one that demos best in 30 seconds for the title — the other still gets full coverage in the body.

## Per-release distribution checklist

After publishing each `vX.Y.Z`, this checklist helps the release reach existing users and new audiences.

- [ ] Update the README "What your agent can do" section if the release adds a workflow worth featuring.
- [ ] Record a 15–30 s demo of the headline workflow (terminal or screen capture) and post once on X / Discord / Slack with the release URL.
- [ ] Reference the release in the next blog or Medium post, linking back to the GitHub release page.

## Useful links

- Repo home: <https://github.com/anycap-ai/anycap>
- Latest release (preferred URL for external posts): <https://github.com/anycap-ai/anycap/releases/latest>
- Website: <https://anycap.ai>
- Capability reference: [`skills/anycap-cli/SKILL.md`](../skills/anycap-cli/SKILL.md)
