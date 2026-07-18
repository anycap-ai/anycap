# Doubao Seed Audio Positioning Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Correct AnyCap's Doubao Seed Audio 1.0 positioning from SFX/environment-only audio to speech-first, full-scene audio generation without changing the released API contract.

**Architecture:** Keep `audio.generate`, all three modes, request fields, and response shapes unchanged. Update the embedded model curation as the public catalog source, pin the wording with a Go regression test, then align distributed and embedded skill documentation plus the current-product snapshot.

**Tech Stack:** Go 1.25 tests, embedded JSON curation, Markdown skills, Makefile skill synchronization.

## Global Constraints

- Preserve the released `audio.generate` HTTP and CLI contracts.
- Use this canonical description: `Doubao Seed Audio 1.0 generates speech, multi-speaker dialogue, and complete audio scenes from text, audio, or image references.`
- Lead examples with speech/dialogue while retaining music, ambience, and sound effects as complete-scene elements.
- Do not push release branches until the user approves both release notes and publication.

---

### Task 1: Pin and Correct the Public Catalog Description

**Files:**
- Modify: `internal/infrastructure/curatedcatalog/catalog_test.go`
- Modify: `internal/infrastructure/curatedcatalog/default_curation.json`

**Interfaces:**
- Consumes: embedded `defaultCurationJSON` decoded as `config.ModelCurationConfig`
- Produces: the speech-first `ModelDescription` returned by audio model catalog endpoints

- [ ] **Step 1: Add the failing regression assertion**

Add this assertion inside `TestDefaultCurationIncludesDoubaoSeedAudio` after the capability check:

```go
const wantDescription = "Doubao Seed Audio 1.0 generates speech, multi-speaker dialogue, and complete audio scenes from text, audio, or image references."
if curated.ModelDescription != wantDescription {
	t.Fatalf("model description = %q, want %q", curated.ModelDescription, wantDescription)
}
```

- [ ] **Step 2: Verify the test fails for the SFX-only wording**

Run: `go test ./internal/infrastructure/curatedcatalog -run TestDefaultCurationIncludesDoubaoSeedAudio -count=1`

Expected: FAIL with the existing `sound effects and environmental audio` description in the failure output.

- [ ] **Step 3: Replace the public curation description**

Set `model_description` for `doubao-seed-audio-1-0` to the canonical sentence from Global Constraints. Update the text-to-audio mode description to mention speech, dialogue, and complete scenes while keeping optional speaker IDs explicit.

- [ ] **Step 4: Verify the focused catalog test passes**

Run: `go test ./internal/infrastructure/curatedcatalog -run 'TestDefaultCurationIncludesDoubaoSeedAudio|TestCatalog_AudioSchedulerRouteAndSchemas' -count=1`

Expected: PASS.

- [ ] **Step 5: Commit the catalog correction**

Run: `git add internal/infrastructure/curatedcatalog/catalog_test.go internal/infrastructure/curatedcatalog/default_curation.json && git commit -m "fix(audio): correct Seed Audio model positioning"`

### Task 2: Align Agent and Product Documentation

**Files:**
- Modify: `skills/anycap-cli/SKILL.md`
- Modify: `skills/anycap-cli/references/audio-generation.md`
- Modify: `skills/anycap-media-production/SKILL.md`
- Modify: `docs/anycap-current-status.md`
- Regenerate: `internal/cli/skill/embedded/anycap-cli/SKILL.md`
- Regenerate: `internal/cli/skill/embedded/anycap-cli/references/audio-generation.md`

**Interfaces:**
- Consumes: verified `anycap audio models ... schema` and `anycap audio generate` behavior
- Produces: consistent speech-first instructions in distributed skills, embedded CLI skills, and current-product documentation

- [ ] **Step 1: Rewrite audio guidance without changing commands**

Describe audio generation as supporting speech synthesis, multi-speaker dialogue, and complete scenes. Replace SFX-only examples with a spoken introduction or dialogue that can include ambience; retain audio-to-audio and image-to-audio examples as reference-guided generation.

- [ ] **Step 2: Update the current-product snapshot**

Change the Audio generation row to say that text/audio/image modes support speech, dialogue, complete scenes, schema-driven voice controls, and local reference upload.

- [ ] **Step 3: Synchronize the embedded CLI skill**

Run: `make sync-skills`

Expected: distributed and embedded `anycap-cli` skill files are byte-for-byte identical.

- [ ] **Step 4: Verify documentation consistency**

Run: `diff -ru skills/anycap-cli internal/cli/skill/embedded/anycap-cli`

Expected: no output and exit code 0.

Run: `rg -n "sound effects and environmental audio|Audio generation is distinct from music composition\. Use it for environmental soundscapes" internal/infrastructure/curatedcatalog/default_curation.json skills docs/anycap-current-status.md`

Expected: no matches.

- [ ] **Step 5: Commit the aligned guidance**

Run: `git add docs/anycap-current-status.md skills/anycap-cli skills/anycap-media-production/SKILL.md internal/cli/skill/embedded/anycap-cli && git commit -m "docs(audio): describe speech-first audio generation"`

### Task 3: Verify and Prepare the Next Release Decision

**Files:**
- Inspect: `releases/version.json`
- Inspect: `releases/release-state.json`
- Inspect: `.gitlab-ci.yml`

**Interfaces:**
- Consumes: verified working tree plus the published v0.4.1 release state
- Produces: a v0.4.2 release recommendation; release notes are drafted only after the baseline is reconciled

- [ ] **Step 1: Run focused and full verification**

Run: `go test ./internal/infrastructure/curatedcatalog ./internal/cli/command/cap ./internal/cli/skill -count=1`

Run: `go test ./...`

Run: `go vet ./...`

Expected: all commands exit 0.

- [ ] **Step 2: Check release-state ancestry**

Confirm the v0.4.1 published source baseline is an ancestor of the source branch used for v0.4.2. If main lacks the published v0.4.1 tracking commits, report that reconciliation step instead of drafting against a false baseline.

- [ ] **Step 3: Present the release path**

Recommend v0.4.2 for CLI and skills together because the CLI embeds the corrected skill and the server catalog description also changes. Do not push `release/cli-v0.4.2` or `release/skills-v0.4.2` before explicit note approval followed by explicit publication approval.
