# AnyCap — Current Product Status

> Last updated: 2026-04-09

## 1. Capabilities (Cap)

### Media Generation

| Capability | CLI Command | Description |
|------------|-------------|-------------|
| Image generation | `anycap image generate` | Text-to-image with model selection, negative prompt, aspect ratio, resolution, reference images |
| Video generation | `anycap video generate` | Text-to-video and image-to-video with duration, aspect ratio, resolution, reference images |
| Music generation | `anycap music generate` | Instrumental and custom modes, vocal synthesis (gender selection), tags/title/lyrics, continuation from existing clip |

Generation outputs are published as AnyCap short links on `artifact.anycap.{dev,cloud}`. Provider origin URLs are not exposed in API responses. Link tokens are short-lived and resolve to internally managed R2 objects.

### Media Understanding

| Capability | CLI Command | Description |
|------------|-------------|-------------|
| Image read | `anycap actions image-read` | Analyze up to 10 images (URL or local file), custom instructions, model selection, fixed price 5 credits on success |
| Video read | `anycap actions video-read` | Analyze video (URL or local file), custom instructions, model selection, fixed price 10 credits on success |
| Audio read | `anycap actions audio-read` | Analyze audio (URL or local file), custom instructions, model selection, fixed price 10 credits on success |

### Model Catalog

Each capability has a dynamic model catalog. Agents can:

- **List models**: `anycap {image,video,music} models` — see all available models with their supported operations
- **Inspect a model**: `anycap {image,video,music} models <model>` — view model details
- **Discover parameters**: `anycap {image,video,music} models <model> schema --operation <op>` — get the request schema for a specific operation

### Operation Types

Models advertise which operations they support. Schema discovery works for all, but only `generate` has a full execution flow today.

| Operation | Description | Execution |
|-----------|-------------|-----------|
| `generate` | Create new media from prompt | Full (server + CLI) |
| `edit` | Edit existing image (inpaint, etc.) | Schema only, no execution |
| `upscale` | Upscale image resolution | Schema only, no execution |
| `from_image` | Generate video from a reference image | Handled via reference images in `generate` |
| `speak` | Text-to-speech | Schema only, no execution |

### Web Search and Crawl

| Capability | CLI Command | Description |
|------------|-------------|-------------|
| Web search (general) | `anycap search` | General web search returning results with title, URL, description, and full page content. Supports domain filtering, time range, crawl control. 1 credit |
| Web search (grounding) | `anycap search --grounding` | LLM-powered search with real-time web grounding, returns synthesized answer with citations, 5 credits |
| Web crawl | `anycap crawl` | Convert any web page to clean Markdown, 1 credit |

Search has two modes:
- **General** (default) -- returns a list of results with titles, URLs, descriptions, and full page content.
- **Grounding** -- LLM synthesizes an answer with per-segment source attribution using Google Search grounding via Gemini. Response excludes model and usage details (internal implementation details).

### Interactive Tools (Local, No Server Required)

| Tool | CLI Command | Description |
|------|-------------|-------------|
| Annotate | `anycap annotate` | Browser-based visual annotation and feedback. Supports images, URLs, videos, audio. Multi-user real-time collaboration. Screen recording with narration. |
| Draw | `anycap draw` | Browser-based interactive whiteboard (Excalidraw). Supports Mermaid input (auto-converted), Excalidraw JSON, blank canvas. Agent can push updates via `draw update`. Multi-user collaboration. |

Both tools run entirely locally (no server connection needed). Non-blocking mode (`--no-wait`) is recommended for agent workflows -- start a session, let the human interact, poll for results, and push updates without restarting.

### File Upload

Local files can be used directly in CLI commands (`--file`). The CLI handles upload automatically via presigned URLs. Upload limits: images 20 MB, audio 50 MB, video 200 MB.

## 2. Infrastructure (Infra)

### Drive — Cloud File Storage

| Feature | CLI Command | Description |
|---------|-------------|-------------|
| List files | `anycap drive ls` | Browse by ID or path |
| Create folder | `anycap drive mkdir` | Create folder by name, supports nested paths |
| Upload file | `anycap drive upload` | Upload local file to drive |
| Move / rename | `anycap drive mv` | Move to different folder or rename |
| Delete | `anycap drive rm` | Delete file or folder (recursive) |
| Share | `anycap drive share` | Create share link with optional password and expiry |
| Dashboard preview/download | Dashboard Drive UI | File preview and direct download via short-lived edge access links (`/v1/drive/nodes/:id/access-links`) |

Supports both ID-based (`--parent dn_xxx`) and path-based (`--parent-path /folder/sub`) addressing.

### Page — Static Site Hosting

| Feature | CLI Command | Description |
|---------|-------------|-------------|
| Deploy | `anycap page deploy` | Deploy HTML/static files as a new version |
| List sites | `anycap page list` | List all hosted sites |
| Site info | `anycap page info` | View site details |
| Update settings | `anycap page set` | Name, access mode (public/password), SPA fallback, badge |
| Delete site | `anycap page delete` | Remove site entirely |
| Publish | `anycap page publish` | Publish a specific version |
| Unpublish | `anycap page unpublish` | Take site offline |
| Version history | `anycap page versions` | List all versions |
| Rollback | `anycap page rollback` | Clone a historical version |
| Unpublished preview | Dashboard Pages UI | Verified/unpublished versions can open temporary preview host (`/v1/pages/:id/versions/:vid/preview-host`) |

Deploy supports concurrent asset uploads. Sites support password-protected access and SPA mode.

### Agent Control — IM Command Surface

| Feature | Surface | Description |
|---------|---------|-------------|
| Preferred local daemon | `anycap agent daemon start --platform feishu --executor codex --workspace /path/to/repo --feishu-app-id <app_id> --feishu-app-secret <app_secret>` | Start the preferred local AnyCap agent for Feishu chat, open the user's personal Feishu bot long connection locally, and connect the current machine for execution |
| Claude Code local daemon | `anycap agent daemon start --platform feishu --executor claude_code --workspace /path/to/repo --feishu-app-id <app_id> --feishu-app-secret <app_secret>` | Run the same personal Feishu bot path with Claude Code as the local executor |
| Optional unrestricted Codex mode | `anycap agent daemon start --platform feishu --executor codex --codex-exec-mode danger-full-access --workspace /path/to/repo --feishu-app-id <app_id> --feishu-app-secret <app_secret>` | Explicitly run the local Codex executor without Codex sandbox/approval restrictions when the user wants real local-network or VPN-only access |
| Optional Claude Code permission/tool mode | `anycap agent daemon start --platform feishu --executor claude_code --claude-permission-mode bypassPermissions --claude-allowed-tools Read,Edit,Bash --workspace /path/to/repo --feishu-app-id <app_id> --feishu-app-secret <app_secret>` | Explicitly pass Claude Code permission/tool settings for broader local execution |
| Daemon status | `anycap agent daemon status --platform feishu` | Show which local machine is currently connected for the signed-in user on the selected IM platform |
| Runner list | `anycap agent runners list` | Inspect registered runners visible to the current user |
| Runner low-level loop | `anycap agent runners serve --name mac-mini --platform feishu --executor codex|claude_code` | Low-level/debug entry point for direct runner registration and polling without daemon-first primary-runner claim |
| Conversation list/get | `anycap agent conversations list|get <agc_...>` | Inspect protected conversation state, including the latest session summary |
| Conversation control | `anycap agent conversations stop|reset|fork|fire <agc_...>` | Stop an active conversation, reset it into a new session, fork it into a new branch, or manually consume pending mailbox results and continue |
| Task inspect | `anycap agent task get <agt_...>` | View a remote agent task and its lifecycle state |
| Task cancel | `anycap agent task cancel <agt_...>` | Cancel a queued/dispatched/running remote agent task |
| Feishu long connection | local daemon runtime | Preferred personal-bot ingress; local daemon owns Feishu App ID/App Secret, receives IM events without公网 webhook, forwards structured Feishu message context to server for normal chat turns, and sends replies back to Feishu |
| Feishu resource artifacts/actions | `.anycap/feishu-downloads/`, `.anycap/feishu-actions/` | Personal-bot daemon reads explicit Feishu docx/wiki/sheet/bitable URLs into local artifacts and consumes a workspace-scoped action context/outbox/results protocol for constrained online writes to current-turn resources |
| Conversation inspect | `/v1/agent/conversations*` | Protected server APIs for listing active conversations, session history, and mailbox entries |
| Runner control API | `/v1/agent/*` | Protected server APIs for bindings, runners, heartbeats, session polling, session status lookup, and updates |

### Agent Control — Legacy Compatibility

| Feature | Surface | Description |
|---------|---------|-------------|
| IM binding token | `anycap agent im-bindings token create --platform feishu` | Legacy/debug fallback for explicit IM sender -> AnyCap account binding when testing old shared-bot flows |
| IM binding list | `anycap agent im-bindings list` | Inspect IM bindings recorded by legacy/debug flows |
| Feishu webhook | `POST /im/events/feishu` | Legacy shared-bot webhook compatibility path with platform verification, bind command handling, and command intake |

Current Phase 1 behavior:

- Feishu is the first wired IM adapter.
- Feishu ingress now prefers the local personal-bot daemon path. The old server-owned shared-bot long connection runtime is disabled; only its webhook/debug compatibility surfaces remain in code.
- `/bind <token>` remains available only as a legacy/debug fallback for old shared-bot flows. It is not the main personal-bot setup path.
- IM chat intake is conversation-first: daemon keeps command parsing on raw text, but normal chat turns now forward structured Feishu message context (`message_id`, `chat_type`, thread/reply IDs, mentions, resolved text) into the session input, and can enrich the current turn with quoted-message context plus bounded thread/chat history before it reaches the selected local executor.
- Personal-bot daemon ingress no longer drops non-text Feishu messages. `image` and `file` turns now try to download the Feishu message resource into the local workspace under `.anycap/feishu-downloads/` and expose the resulting `local_path` to the selected local executor; if download fails, the daemon falls back to metadata-only context with `message_type`, original `content_json`, and resource keys.
- Personal-bot daemon ingress detects explicit Feishu `docx`, `wiki`, `sheets`, and `base` URLs in the current message. It reads supported resources with the local Feishu app credentials, writes markdown previews/artifacts under `.anycap/feishu-downloads/resources/`, and injects `<feishu-resource>` plus `<feishu-resource-actions>` metadata into local executor input. The daemon watches `.anycap/feishu-actions/outbox/`, executes `.json` actions against URLs listed in the current `.anycap/feishu-actions/context.json` or resources created by earlier successful create actions in the same action context, and writes results under `.anycap/feishu-actions/results/`; Feishu credentials are not written into the workspace. Create actions can create new `docx`, `sheet`, and `bitable` resources without an existing resource URL, optionally using a folder token; `sheet.create` can write initial range values after creation, and `bitable.create` can write initial records to the created app's default table. Docx writes convert markdown to Feishu docx blocks before writing, including constrained `docx.create`, `docx.append_under_heading`, and `docx.replace_heading_section` operations. Existing-doc positioning writes locate a unique root-level heading and use the section boundary before the next peer heading; those positioning writes include a non-blocking read-back verification result when possible. Docx positioning can also be inspected with read-only `docx.inspect_headings`, which returns heading levels, root indexes, section bounds, and duplicate headings. Sheet writes use direct OpenAPI value append/update calls.
- Structured Feishu follow-ups now reuse the active server-side conversation when `thread_id`, `root_id`, or `parent_id` matches a prior session message. If the current session is still running, the follow-up is stored in a server-side conversation follow-up inbox and drained into the next continue-mode local executor session before mailbox auto-fire.
- Personal-bot daemon ingress keeps the short local burst-turn merge only as a fallback when no Feishu thread/reply structure is available: back-to-back text messages, or media followed immediately by clarifying text, can still be held briefly and sent to Codex as a single latest turn while earlier inputs remain visible through Feishu context enrichment.
- Personal-bot daemon ingress now uses a single immediate text receipt (`会话已接收，正在处理中`) and suppresses repeated burst follow-up receipts while the current conversation is still busy. Reaction-based immediate acknowledgements are disabled.
- Personal-bot daemon replies send Markdown-like agent output as Feishu `post` rich-text messages when basic Markdown markers are present, while plain replies stay as `text` messages. The current rich-text conversion supports line breaks, bullet-style list lines, headings, bold spans, and stripping inline-code backticks.
- Chat control commands support `/new`, `/reset`, `/status`, `/stop`, `/fork`, and `/fire`.
- Feishu chat routing now prefers a per-user primary runner mapping instead of requiring per-user `bot -> runner_id` server env wiring.
- Runner execution uses polling-style session dispatch: Feishu ingress persists the next session, runner fetches it from the protected API, and reports running / committed / failed / interrupted states.
- `anycap agent daemon start` is the preferred single-machine setup path: user logs in locally, starts the daemon with their personal Feishu bot App ID/App Secret, and the daemon owns bot ingress while the server stores conversation/session/mailbox state.
- `anycap agent daemon start` defaults to Codex safe mode (`--full-auto`). Operators can explicitly opt into `--codex-exec-mode danger-full-access` when they need the local Codex subprocess to bypass sandbox restrictions.
- `anycap agent daemon start --executor claude_code` runs Claude Code with `claude -p --output-format json`; it defaults to `--claude-permission-mode acceptEdits` and accepts explicit `--claude-permission-mode`, `--claude-allowed-tools`, and `--claude-bin` settings.
- The CLI runner supports real local `codex` and `claude_code` executors. Non-interactive runs capture Codex `thread_id` or Claude Code `session_id` and persist it as `executor_ref`.
- Continue-mode sessions inherit the parent `executor_ref`, so the runner can resume the existing Codex thread with `codex exec resume` or the existing Claude Code session with `claude -p --resume`.
- Fire-mode sessions inherit the parent `executor_ref`, so pending mailbox results can be fed back into the same local executor conversation context.
- Protected mailbox APIs support creating and listing undelivered mailbox entries. By default, mailbox writes auto-fire into a new fire-mode session whenever the current front session is idle; if a session is still `created` or `running`, mailbox entries stay queued and are auto-fired after that session reaches `committed` or `failed`.
- Runtime now emits a lightweight conversation notification on session terminal updates; the Feishu layer translates that structured notification into a stage-style reply, including a short summary when an async mailbox result triggers auto-fire continuation.
- Manual `/fire` and `anycap agent conversations fire ...` remain available as operator/debug fallbacks.
- `/stop` is end-to-end: it marks the active session interrupted on the server, runner detects that state, and the local executor subprocess is canceled.
- Conversation list/detail APIs now include a `last_session` summary with mode, status, executor reuse marker, timestamps, and final message when available.
- The same stop/reset/fork/fire controls are exposed through protected HTTP APIs and the `anycap agent conversations ...` CLI group, not only through Feishu slash-style commands.
- Outbound Feishu replies can use either the legacy reply proxy API or direct Feishu OpenAPI send with App ID/App Secret.

## 3. CLI

### Full Command Tree

```
anycap
├── image
│   ├── generate              Generate image from prompt
│   └── models                List models / show detail / fetch schema
├── video
│   ├── generate              Generate video from prompt
│   └── models                List models / show detail / fetch schema
├── music
│   ├── generate              Generate music from prompt
│   └── models                List models / show detail / fetch schema
├── actions
│   ├── image-read            Analyze images
│   ├── video-read            Analyze video
│   └── audio-read            Analyze audio
├── annotate                  Interactive visual annotation
│   ├── poll / stop / list
├── draw                      Interactive whiteboard (Excalidraw)
│   ├── poll / update / stop / list
├── search                    Web search (--grounding for LLM mode)
├── crawl                     Convert web page to Markdown
├── drive
│   ├── ls / mkdir / upload / mv / rm / share
├── page
│   ├── list / info / set / deploy / delete
│   ├── publish / unpublish / versions / rollback
├── login                     Auth (browser OAuth + device code)
├── logout                    Remove credentials
├── status                    Check server status
├── credentials
│   ├── show                  Show current credential
│   └── set-key               Set API key directly
├── config
│   ├── show / keys / get / set / unset
├── feedback                  Submit bug report / feature request
├── agent
│   ├── daemon
│   │   ├── start             Start and connect the preferred local IM agent loop
│   │   ├── status            Show the currently connected local machine for a platform
│   │   └── stop              Explain foreground-mode stop behavior
│   ├── im-bindings
│   │   ├── token create      Create short-lived IM bind token
│   │   └── list              List current IM bindings
│   ├── runners
│   │   ├── list              List registered runners
│   │   └── serve             Run a polling runner loop (stub or local codex executor)
│   ├── conversations
│   │   ├── list / get        Inspect conversation state
│   │   └── stop / reset / fork / fire
│   └── task
│       ├── get               Get remote agent task details
│       └── cancel            Cancel remote agent task
├── skill
│   ├── check / install / update
├── update                    Self-update CLI binary
└── download                  Download file from URL
```

### Authentication

Three methods supported:

1. **Browser OAuth**: `anycap login` — opens browser, receives callback
2. **Device code**: `anycap login --headless` — prints a code, user approves in browser
3. **API key**: `anycap credentials set-key <key>` — direct key input, or `ANYCAP_API_KEY` env var

Credentials stored in system keychain (file fallback at `~/.anycap/credentials`).

### Output

- JSON to stdout by default (non-TTY), human-readable in TTY
- `--json` / `--pretty` to override
- All responses include `request_id` for debugging and feedback

### Feature Gating

CLI always shows all commands. Feature gating is enforced on the server side. When a capability or control surface is disabled, the server returns a structured error and hint.

## 4. Skill Files

Agent-facing skill documentation, following the entry skill + on-demand loading pattern.

**Entry point**: `SKILL.md` — global overview, installation guide, authentication, capability index.

**On-demand references** (agent loads only what it needs):

| Reference | Covers |
|-----------|--------|
| CLI reference | Full command reference, auth methods, config |
| Image generation | Prompting, model selection, parameters |
| Video generation | Text-to-video, image-to-video workflows |
| Music generation | Instrumental, custom mode, vocal synthesis |
| Media analysis | Image/video/audio understanding |
| Drive | File storage and sharing |
| Page | Static site deployment and management |
| Web | Web search (grounding) and crawl |

Distributed via GitHub. Agents install with `anycap skill install`.

## 5. Dashboard

### User Dashboard

| Page | Function |
|------|----------|
| Overview | Credit balance, recent activity, error summary |
| Usage | Usage statistics |
| Logs | Detailed call logs |
| Billing | Credit balance, modal-based credit pack purchase, transactions, payment result feedback |
| API Keys | Create, disable, delete API keys |
| Drive | Visual file browser |
| Pages | Site management with version history, published Open, and verified version Preview |
| Playground | Interactive capability testing |
| Settings | User preferences |

### Auth Flows

- Browser OAuth login
- CLI-initiated login (redirect flow)
- Device code flow (for headless environments)

## 6. Website

### Landing

Localized landing page with a separate `/for-human` variant. Supports i18n routing.

Home and `/agent` keep HTML as the default human-facing response. Markdown negotiation for agent-readable content is still available through `/llms.txt`, explicit markdown `Accept` headers, or `view=agent`.

### SEO Content (32 pages)

| Category | Pages |
|----------|-------|
| Capabilities | Overview, image generation, image understanding, video generation, video analysis |
| For agents | Claude Code (+ image-generation, video-generation sub-pages), Cursor, Codex, Manus |
| Guides | Install AnyCap, agent skills, context engineering, workspace context, agent harness, add tools to Claude Code |
| Glossary | Agent capability runtime, agent harness, context engineering |
| Compare | AnyCap vs Composio, AnyCap vs OpenAI Agent Builder, AnyCap vs Replicate, AnyCap vs fal.ai |
| Models | Overview, Seedream 5, Nano Banana Pro, Veo 3.1 |
| Learn | What agents can't do |
| Top-level | Start, CLI, Skills, About |

### AI Discoverability

- `llms.txt` for AI crawlers (GPTBot, ClaudeBot, PerplexityBot, etc.)
- `robots.ts` with explicit AI bot allow rules
- Auto-discovery sitemap
- Dynamic OG image generation

## 7. Billing & Usage

- **Credit-based billing**: each capability call has a credit cost
- **Model direct-output pricing**: image/video/music direct-output capabilities use upstream `nexus_cost` with `1 credit = $0.02`, rounded up, minimum 1 credit
- **Action read pricing**: `image.read` costs 5 credits on success, `video.read` costs 10 credits on success, and `audio.read` costs 10 credits on success
- **Web pricing**: `web.search` (grounding) costs 5 credits, `web.crawl` costs 1 credit
- **Balance check**: enforced before every execution
- **Billing truth source**: `billing_intents` is the local source of truth for whether a capability call should be charged and whether credit consume has finalized
- **Synchronous request behavior**: CLI/server request flow remains synchronous; successful calls still return inline instead of switching to async polling UX
- **Intent-first billing flow**: billed generate/read requests now create a local billing intent before upstream execution, record provider success before deduct, then finalize to `deducted` after Credit Service consume succeeds
- **Idempotent consume key**: billing consume uses a persisted `deduct_source_id` built from `anycap-<capability>-<trace_id>`
- **Recovery worker**: uncertain billing intents are retried in the background on a fixed `1 / 3 / 5 / 10 / 20 / 30` minute schedule, with a `30` minute recovery window
- **Recoverable states**: if AnyCap already persisted provider success and cost, the worker can complete delayed credit consume without re-calling the provider
- **NexusHub trace propagation**: generate requests send `trace_id` plus `biz_id=anycap` in `X-Nexus-Extra` for future task reverse lookup and offline reconciliation
- **Current recovery limitation**: the concrete NexusHub reverse-lookup HTTP path for `trace_id + biz_id -> task_id` is not wired yet, so requests that lose the local `provider_task_id` before persistence still fall back to the existing degraded path instead of full automatic lookup recovery
- **Signup reward**: optional credit signup reward can be granted to newly created users at login, with package-based credit issuance and an env-configurable deadline cutoff
- **Call logging**: every invocation logged with user, model, cost, duration, request ID
- **Usage reporting**: aggregated statistics available in dashboard and via API
- **One-time credit purchase API**: authenticated users can list configured credit packs via `GET /v1/pricing/credit-packs` and create checkout sessions via `POST /v1/billing/checkout`
- **Payment integration boundary**: AnyCap server maps internal `pack_id -> price_id` and calls the external Payment Service; web clients never talk to Payment directly
- **Payment callback foundation**: AnyCap now has a configurable RocketMQ consumer foundation for Payment callback events, with idempotent `payment_event_receipts` storage for `credits_granted` and `payment_failed`
- **Credit authority**: Payment remains the source of truth for post-payment credit grants; AnyCap does not grant credits again on callback
- **Rate limiting**: per-user, per-capability

## 8. Feedback

Built-in feedback loop via `anycap feedback`:

- **Types**: bug report, feature request, general
- **Context**: can attach request ID from a previous call
- **Notifications**: feedback forwarded to team via Lark webhook

## 9. Distribution

| Channel | What |
|---------|------|
| GitHub Releases | CLI binaries (linux/darwin/windows, amd64/arm64) |
| npm | `@anycap/cli` with platform-specific packages (auto-selects binary) |
| GitHub repo | Skill files (latest `main`) |
| anycap.ai | Website (Cloudflare Pages) |
| `curl \| sh` | One-line install (guided in skill files) |
