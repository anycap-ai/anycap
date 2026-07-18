# Doubao Seed Audio AnyCap Integration Design

## Goal

Expose the live NexusHub `doubao-seed-audio-1-0` scheduler node through the
existing AnyCap media capability architecture without leaking NexusHub wire
formats into the public HTTP or CLI contracts.

## Evidence

| Source | Verified fact |
|---|---|
| NexusHub Discovery `doubao-seed-audio-1-0` | Active `audio` scheduler node |
| NexusHub Discovery `ark-doubao-seed-audio-1-0` | Active Ark direct node |
| Persisted Tool Definition | `txt_2_audio`, `audio_2_audio`, and `image_2_audio` |
| Live text-to-audio schema | Optional speaker reference plus speech rate, pitch, loudness, and subtitle controls |
| Live Core smoke task `atomic_78e5e6d3-a2c3-44d5-8f8c-06eb422fa69c` | 10.5-second MP3 succeeded through scheduler and Ark |
| Live signed artifact | Range GET returned `206` and `audio/mpeg` for 84,524 bytes |
| AnyCap image/video/music services | Existing domain -> application -> infrastructure -> transport pattern |

## Public Contract

The public operation remains `audio.generate`, not `audio.speak`. Seed Audio is
speech-centric audio generation: it covers speech synthesis and dialogue while
also being able to orchestrate complete audio scenes that include voice,
background music, ambience, and sound effects. It is broader than classic TTS
and must not be positioned as an environmental-sound or SFX-only model.

`POST /v1/audio/generate` accepts:

```json
{
  "model": "doubao-seed-audio-1-0",
  "mode": "text-to-audio",
  "prompt": "A calm narrator welcomes listeners while soft morning ambience plays",
  "format": "mp3",
  "sample_rate": 24000,
  "speech_rate": 0,
  "loudness_rate": 0,
  "pitch_rate": 0,
  "enable_subtitle": false,
  "speaker_ids": [],
  "audios": [],
  "images": []
}
```

Mode mapping:

| AnyCap mode | NexusHub algo type | Reference rule |
|---|---|---|
| `text-to-audio` | `txt_2_audio` | At most one optional speaker ID |
| `audio-to-audio` | `audio_2_audio` | One to three audio URLs |
| `image-to-audio` | `image_2_audio` | Exactly one image URL |

The domain request owns these stable public concepts. The NexusHub adapter
constructs the generic gateway envelope with `gen_type`, `prompt`, and
`audio_option`; transport and CLI never expose raw `audio_option.references`.

## Product Positioning

AnyCap groups the capability under audio generation because the same model can
produce speech, dialogue, and complete mixed audio scenes. User-facing copy
should lead with speech and dialogue, then describe music, ambience, and sound
effects as parts of the broader scene-generation capability.

The canonical English model description is:

> Doubao Seed Audio 1.0 generates speech, multi-speaker dialogue, and complete
> audio scenes from text, audio, or image references.

CLI and agent documentation should use speech-first examples, keep the three
verified modes discoverable, and tell callers to inspect the live schema before
using speaker references or voice controls. No route, mode, request field, or
response shape changes as part of this positioning correction.

## Architecture

Dependencies remain inward-only:

```text
transport/http -> application/audio -> domain model and ports
                                    <- infrastructure/nexushub
```

- Domain owns audio request/result validation and the capability-scoped
  `AudioGenerationClient` port.
- Application owns catalog routing, upload-reference resolution, execution,
  billing, usage, call logs, and artifact publication.
- Infrastructure owns the typed NexusHub request and response mapping.
- Transport owns DTO parsing, principal extraction, route registration, and
  error-to-HTTP mapping.
- CLI calls AnyCap Server through shared `pkg/api` paths and stays JSON-first.

## Catalog and Discovery

Embedded and DConf curation map public model/mode pairs to the scheduler
ability and exact algo types. Discovery remains authoritative for formats,
sample rates, and numeric control ranges. The public reference cardinalities
are pinned to the verified Seed Audio contract and enforced in both schema and
domain validation so an upstream change cannot silently alter the AnyCap API.

Audio references are arrays of structured objects and cannot be represented by
the current scalar/array `ResourceTarget` vocabulary. A capability-aware audio
schema projector therefore flattens `audio_option`, drops upstream-only
`type`/`references`, and adds public `speaker_ids`, `audios`, or `images`
parameters according to the selected algo type. This is an infrastructure
adapter, not an ability-key override.

Route type is derived from the Discovery provider: scheduler nodes produce
`RouteTypeScheduler`; all other nodes produce `RouteTypeDirect`.

## Execution and Artifacts

`GenerateAudio` uses a typed `atomicAudioOption` and typed references. The audio
adapter reuses an infrastructure-private helper for the common NexusHub submit
envelope, HTTP/error mapping, and base response decode. Existing
image/video/music behavior remains protected by its characterization tests.

The public output is typed:

```go
type AudioArtifact struct {
	Artifact
	DurationSeconds         float64
	OriginalDurationSeconds float64
	SizeBytes               int64
	Subtitle                json.RawMessage
}
```

`log_id` remains internal. `subtitle` is response-scoped JSON metadata. The
artifact publisher receives the embedded `Artifact` values and the application
merges published URL/MIME values back by position without losing audio
metadata. `CapsArtifactMediaTypeAudio` uses audio filename and MIME fallbacks.

## Feature, Rate Limit, and Rollout

- Add the stable capability name `audio.generate`.
- Include `audio` in dynamic feature-gate capability prefixes.
- Register the endpoint with `CapabilityPOST`.
- Add feature-access and rate-limit examples.
- Keep server fallback disabled unless the catalog and execution client are
  configured; live DConf controls rollout.
- Treat a live `model_curation` DConf value as a complete replacement snapshot;
  production rollout must add the audio model entry because it does not merge
  with the embedded default.

NexusHub currently returns a live `nexus_cost` value consistent with USD
normalization. AnyCap continues to use the existing `CreditsFromUSD` contract,
and tests pin the received cost-to-credit behavior. Explicit upstream currency
metadata remains a NexusHub contract improvement, not a reason to duplicate FX
logic in AnyCap.

## Error Handling

- Invalid mode/reference combinations fail before provider invocation.
- `anycap://upload/...` values are resolved before NexusHub receives them.
- Provider errors retain invocation diagnostics and standard AnyCap mapping.
- Successful provider responses without a usable audio URL fail with
  `UPSTREAM_EMPTY_RESULT`.
- Artifact publication failure prevents credit deduction, matching current
  media services.

## Verification

- Domain validation and mode inference unit tests.
- Catalog projector and scheduler route-type tests using complete Discovery
  structures.
- NexusHub payload/response characterization tests including metadata, signed
  URLs, MIME inference, status, usage, and cost.
- Application tests for upload resolution, empty output, artifact metadata,
  billing, usage, and call logs.
- Handler/router tests for capability registration and feature denial.
- CLI command tests for schema discovery, local file upload, JSON output, and
  download behavior.
- Catalog tests pin the speech-first public description so it cannot regress to
  SFX-only wording.
- Focused package tests, `go test ./...`, `go vet ./...`, and a dev smoke test.

## Constraints

- Preserve the released `audio.generate` HTTP and CLI contracts.
- Keep catalog, distributed skill, embedded skill, and current-product status
  copy aligned.
- Do not push, merge, tag, release, or deploy without explicit user approval.
- Preserve unrelated user changes.
