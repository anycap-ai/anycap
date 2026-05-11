# AnyCap — Current Product Status

> Last updated: 2026-05-11

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

## 2. Chrome Extension

The Chrome extension is a Manifest V3 side-panel client for the same AnyCap server API used by the CLI and dashboard.

| Surface | Current status |
|---------|----------------|
| Side panel | 7 tabs: Vary, Image, Video, Music, Search, Crawl, Settings |
| Context menus | 7 right-click flows: image variation, image/video/music from selected text, search selected text, crawl current page, crawl link |
| First run | Onboarding overlay is shown until dismissed and can be replayed from Settings |
| Anonymous mode | Extension sends `X-Anycap-Source: chrome-extension` plus `X-Anycap-Install-Id` when no auth token is present |
| Authenticated mode | If an auth token exists, extension requests use the normal `Authorization: Bearer ...` path |
| Release package | `extension/releases/anycap-extension-0.2.0-chrome.zip` is the current Chrome Web Store-ready package |
| Release checks | `pnpm preflight:local` runs the browser-free release rebuild, release zip SHA-256 doc sync, unit/type, and release-verifier gate; `pnpm verify:release` validates the CWS zip, `.output`/`releases` zip sync, CWS submission hash, extension icon dimensions, runtime manifest entrypoints and referenced runtime files, content script `file://` exclusion, support scripts, local preflight, dev/staging leakage, store asset dimensions, demo MP4 metadata, headless CWS/demo renderer wiring, listing copy, permission justifications, CWS submission guide including demo-video YouTube instructions, Chrome extension launch dconf examples, production launch runbook, visible Chrome approval docs, and final launch docs requiring `--abuse-control-passed --real-e2e-passed`; `pnpm render:cws` refreshes CWS screenshots and promo assets without opening a visible browser; `pnpm render:demo` creates `store-assets/demo.mp4` without opening a visible browser; `pnpm smoke:server` validates required feature flags, deployed anonymous extension server/dconf paths, and extension config/search/crawl response shapes without opening a browser, with optional image-only or media-only provider checks that stay within the 3-run anonymous trial; `pnpm launch:audit` aggregates browser-free launch blockers, GETs the live Chrome Web Store privacy policy URL and validates the page body is not a Next.js 404 fallback, requires `--abuse-control-passed`, and accepts `--real-e2e-passed` after the approved headed E2E run completes |

Server code supports hybrid authenticated/anonymous Chrome extension calls for image generation, video generation, music generation, web search, and web crawl. Anonymous extension principals use an `anon:<install-id>` user ID and skip normal credit balance/consume flows. Server middleware now normalizes install IDs before using them in anonymous principals or trial buckets, accepting only 1-128 characters from `[A-Za-z0-9_-]`, and consumes both an install-ID trial bucket plus a hashed TCP remote-address client bucket so rotating `X-Anycap-Install-Id` or spoofing `X-Forwarded-For` does not bypass the local anonymous trial gate. Stub mode uses the in-memory trial store; persistent runtime modes use the `anonymous_trial_buckets` Postgres table so trial consumption survives server restarts. Targeted local Go tests cover the anonymous extension router, middleware, client-bucket abuse control, and image/video/music/web application paths. The extension search client now sends `max_results` to match the server contract and maps server `description` fields into the UI `snippet` field. Production rollout still requires deploying the server changes and configuring feature-access dconf so anonymous extension users are allowed for the enabled capabilities; pass `--abuse-control-passed` only after the deployed server contains the dual-bucket anonymous trial middleware or an equivalent gateway rule is active. The web source now explicitly registers `/privacy/extension` in SEO route definitions and IA, the page includes breadcrumb JSON-LD, and `web/.node-version` pins builds to Node 22.16.0; browser-free web checks and a Node 22.16.0 production build include both `/privacy/extension` and `/[locale]/privacy/extension`. Latest browser-free production smoke on 2026-05-11 with install ID `codex-smoke-20260511-final-recheck` still fails before media generation: `/v1/features` returns the required feature flags as enabled, `/v1/extension/config` returns `404`, and anonymous web search/crawl return `401 AUTH_INVALID`. Latest launch audit on 2026-05-11 with install ID `codex-audit-20260511133000` confirms release artifacts and required feature flags, then reports blockers for production extension config deploy, anonymous web auth deploy, the live privacy URL returning HTTP 200 with a Next.js 404 fallback body, missing deployed abuse-control acknowledgement, and approved real-mode E2E. `extension/docs/COMPLETION-AUDIT.md` records the prompt-to-artifact completion audit; `extension/docs/PRODUCTION-LAUNCH-RUNBOOK.md` is the current deploy/dconf/smoke/CWS/rollback runbook.

Chrome release host permissions are limited to `https://api.anycap.ai/*` and `https://anycap.ai/*`. Non-release builds add the `WXT_API_BASE` origin to host permissions so staging smoke tests can target a non-production API. OAuth `identity` permission is optional and only requested when login UI is enabled.

## 3. Infrastructure (Infra)

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
Path-based addressing is resolved server-side via direct drive path lookup (`/v1/drive/resolve-path`) instead of client-side directory traversal.

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

### Snapshot — Portable Project Handoff

| Feature | CLI Command | Description |
|---------|-------------|-------------|
| Create named snapshot | `anycap snapshot create` | Package one or more local targets into a single tar archive, upload to Drive under `/_snapshots/{name}.snapshot.tar`, create a password-protected expiring share link |
| Restore snapshot | `anycap snapshot restore` | Restore from a single share URL into a local target directory using raw share download plus `X-Anycap-Share-Password` |

Snapshot behavior:

- Snapshot names are stable within `/_snapshots`
- Same-name snapshots fail by default
- `--overwrite` replaces an existing snapshot intentionally
- Snapshot path checks use direct drive path resolution
- Snapshot share expiration defaults to `12h` and should stay short unless explicitly requested otherwise
- Create blocks on sensitive-file matches unless `--force` is set
- Technical directories such as common caches/build outputs are skipped during packing
- Restore rejects unsafe tar entries and only extracts into an empty or non-existent target directory

### Agent Control — IM Command Surface

| Feature | Surface | Description |
|---------|---------|-------------|
| Feishu connection credentials | `anycap connect credentials set feishu --app-id <FEISHU_APP_ID> --app-secret <FEISHU_APP_SECRET>` | Store the user's personal Feishu bot App ID/App Secret locally in the AnyCap config dir with 0600 permissions so an already-running coding agent can start the connection later |
| Feishu credential status | `anycap connect credentials show feishu` | Show whether local personal-bot credentials are configured without printing the App Secret |
| Preferred Feishu connection | `anycap connect feishu --agent codex --workspace /path/to/repo` | Start the preferred local AnyCap connection for Feishu chat, reading personal-bot credentials from local daemon credential storage, opening the user's personal Feishu bot long connection locally, and connecting the current machine for execution |
| Claude Code Feishu connection | `anycap connect feishu --agent claude-code --workspace /path/to/repo` | Run the same personal Feishu bot path with Claude Code as the local agent |
| Cursor Feishu connection | `anycap connect feishu --agent cursor --workspace /path/to/repo` | Run the same personal Feishu bot path with Cursor Agent as the local agent; the user-facing connect path enables Cursor `--force` by default and reports a warning in startup/status output |
| Optional unrestricted Codex mode | `anycap connect feishu --agent codex --codex-exec-mode danger-full-access --workspace /path/to/repo` | Explicitly run the local Codex agent with broader local access when the human needs MCP, plugins, Computer Use, Figma, or custom MCP servers |
| Optional Claude Code permission/tool mode | `anycap connect feishu --agent claude-code --claude-permission-mode bypassPermissions --claude-allowed-tools Read,Edit,Bash --workspace /path/to/repo` | Explicitly pass Claude Code permission/tool settings for broader local execution |
| Optional Cursor model mode | `anycap connect feishu --agent cursor --cursor-model <model> --workspace /path/to/repo` | Explicitly pass Cursor Agent model selection |
| Connection status | `anycap connect status feishu` | Show which local machine is currently connected for the signed-in user on the selected IM platform |
| Connection stop | `anycap connect stop feishu` | Stop the local background connection process for the selected IM platform |
| Daemon compatibility | `anycap agent daemon start --platform feishu --executor codex --workspace /path/to/repo` | Lower-level compatibility and debugging path behind the `connect` user-facing command |
| Runner list | `anycap agent runners list` | Inspect registered runners visible to the current user |
| Runner low-level loop | `anycap agent runners serve --name mac-mini --platform feishu --executor codex|claude-code|cursor` | Low-level/debug entry point for direct runner registration and polling without daemon-first primary-runner claim |
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
- Registered runners carry the selected local agent identity (`codex`, `claude-code`, `cursor`, or `stub`; Claude Code is persisted internally as `claude_code`). New conversations and sessions use that runner identity, and existing active conversations are updated when a different primary runner/agent takes over the chat.
- `anycap connect feishu` is the preferred single-machine setup path: user logs in locally, stores personal Feishu bot credentials with `anycap connect credentials set feishu`, starts the connection without credential flags, and the local daemon owns both bot ingress and final Feishu reply egress while the server stores conversation/session/mailbox state.
- `anycap connect feishu --agent codex` now defaults to `--codex-exec-mode safe`, which maps to Codex `--full-auto`. If the human needs MCP/plugin access, such as Computer Use, Figma, Canva, or custom MCP servers, the agent should ask whether to restart with `--codex-exec-mode danger-full-access` before launching the daemon.
- `anycap connect feishu --agent claude-code` runs Claude Code with `claude -p --output-format json`; it defaults to `--claude-permission-mode acceptEdits` and accepts explicit `--claude-permission-mode`, `--claude-allowed-tools`, and `--claude-bin` settings.
- `anycap connect feishu --agent cursor` runs Cursor Agent with `cursor-agent -p --output-format json --trust --force`; it accepts explicit `--cursor-bin` and `--cursor-model` settings, and startup/status output warns that Cursor may execute local commands and network requests unless Cursor explicitly denies them. The lower-level `agent daemon start --executor cursor` path still requires explicit `--cursor-force`.
- The CLI runner supports real local `codex`, `claude-code`, and `cursor` executors. Non-interactive runs capture Codex `thread_id`, Claude Code `session_id`, or Cursor Agent `session_id` and persist it as `executor_ref`.
- Continue-mode sessions inherit the parent `executor_ref`, so the runner can resume the existing Codex thread with `codex exec resume`, the existing Claude Code session with `claude -p --resume`, or the existing Cursor Agent session with `cursor-agent -p --resume`.
- Local executor session prompts include an `anycap-local-session` context block with the current agent, workspace, conversation/session IDs, and `executor_ref` when available. Codex requests that explicitly say "continue/resume the local session" scan local Codex session metadata, pick the most recent non-`exec` session for the daemon workspace, and resume it by explicit session id; Codex "open/view/recover this conversation on my Mac" requests use the current `executor_ref` when present, otherwise inject the latest matching local Codex session as `local_resume_ref`, so the agent can return a precise `codex resume <id>` command instead of using `--last` or falling back to a conversation list.
- Fire-mode sessions inherit the parent `executor_ref`, so pending mailbox results can be fed back into the same local executor conversation context.
- Protected mailbox APIs support creating and listing undelivered mailbox entries. By default, mailbox writes auto-fire into a new fire-mode session whenever the current front session is idle; if a session is still `created` or `running`, mailbox entries stay queued and are auto-fired after that session reaches `committed` or `failed`.
- Runtime now emits a lightweight conversation notification on session terminal updates. For daemon-owned Feishu sessions, the server returns that notification as an `outbound_reply` payload and the local daemon sends it through the user's personal bot; fallback server-owned outbound still translates the same notification into a stage-style reply, including a short summary when an async mailbox result triggers auto-fire continuation.
- Manual `/fire` and `anycap agent conversations fire ...` remain available as operator/debug fallbacks.
- `/stop` is end-to-end: it marks the active session interrupted on the server, runner detects that state, and the local executor subprocess is canceled.
- Conversation list/detail APIs now include a `last_session` summary with mode, status, executor reuse marker, timestamps, and final message when available.
- The same stop/reset/fork/fire controls are exposed through protected HTTP APIs and the `anycap agent conversations ...` CLI group, not only through Feishu slash-style commands.
- Fallback server-owned outbound Feishu replies can use either the legacy reply proxy API or direct Feishu OpenAPI send with App ID/App Secret.

## 4. CLI

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
├── snapshot
│   ├── create / restore
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
│   │   └── serve             Run a polling runner loop (stub, Codex, Claude Code, or Cursor)
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

Auth0 JWT users are mapped to local AnyCap users through `auth_identities`. The Auth0 Universal Login template supports Google and database email/password login. Verified Auth0 database/password identities can be re-keyed by email during tenant migration, while social identities such as Google remain separate identities even when the email matches.

### Output

- JSON to stdout by default (non-TTY), human-readable in TTY
- `--json` / `--pretty` to override
- All responses include `request_id` for debugging and feedback

### Feature Gating

CLI always shows all commands. Feature gating is enforced on the server side. When a capability or control surface is disabled, the server returns a structured error and hint.

## 5. Skill Files

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

## 6. Dashboard

### User Dashboard

Dashboard pages share a unified light olive/sage control-surface shell with consistent navigation, table, modal, badge, pagination, and action feedback patterns.

| Page | Function |
|------|----------|
| Overview | Credit balance, recent activity, guided setup CTA, and direct billing entry |
| Usage | Usage statistics |
| Logs | Detailed capability call logs with status, cost, and request ID visibility |
| Billing | Credit balance, modal-based credit pack purchase, transactions, payment result feedback |
| API Keys | Create, rename, set expiry (1-3650 days or never), renew expiry, disable, and delete keys. CLI-managed key (`cli`) is read-only here. |
| Drive | Visual file browser with breadcrumb path navigation, preview/download, share, rename, move, and delete actions |
| Pages | Site management with version history, published Open, and verified version Preview |
| Playground | Interactive capability testing |
| Settings | User preferences |

### Auth Flows

- Browser OAuth login
- CLI-initiated login (redirect flow)
- Device code flow (for headless environments)

## 7. Website

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

## 8. Billing & Usage

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
- **Rate limiting**: per-user, per-capability; Chrome extension anonymous requests also have an install-ID trial budget with Postgres persistence in persistent runtime modes

## 9. Feedback

Built-in feedback loop via `anycap feedback`:

- **Types**: bug report, feature request, general
- **Context**: can attach request ID from a previous call
- **Notifications**: feedback forwarded to team via Lark webhook

## 10. Distribution

| Channel | What |
|---------|------|
| GitHub Releases | CLI binaries (linux/darwin/windows, amd64/arm64) |
| npm | `@anycap/cli` with platform-specific packages (auto-selects binary) |
| GitHub repo | Skill files (latest `main`) |
| anycap.ai | Website (Cloudflare Pages) |
| `curl \| sh` | One-line install (guided in skill files) |
| Chrome extension zip | Current CWS-ready package under `extension/releases/` |
