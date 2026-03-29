# CLI Login Spec

> Date: 2026-03-29
> Status: Draft

## 1. Overview

This document describes the current AnyCap CLI login architecture.

Authoritative login paths:

1. Browser poll flow (`anycap login` in browser-capable environments)
2. Device code flow (`anycap login --headless`)
3. Direct API key input (`anycap login --with-token`, `anycap credentials set-key`, `ANYCAP_API_KEY`)

The CLI stores an AnyCap API key. It does not store OAuth refresh tokens.

## 2. Authoritative Flows

| Flow | Trigger | Browser required | Server APIs | Result |
|---|---|---|---|---|
| Browser poll | `anycap login` with browser available | Yes | `/v1/auth/login`, `/v1/auth/browser-verify`, `/v1/auth/poll` | API key |
| Device code | `anycap login --headless` or no browser | No (on CLI host) | `/v1/auth/device-code`, `/v1/auth/device-code-check`, `/v1/auth/device-verify`, `/v1/auth/device-poll` | API key |
| Direct token | `--with-token`, `set-key`, env var | No | none | API key |

## 3. Browser Poll Flow

Sequence:

1. CLI calls `POST /v1/auth/login` with `{"method":"browser_poll"}`.
2. Server returns `login_session_id`, `browser_url`, `poll_token`, `interval`, `expires_in`.
3. CLI opens `browser_url`.
4. Web completes Auth0 login and then calls `POST /v1/auth/browser-verify` with `browser_token` using JWT bearer.
5. CLI polls `POST /v1/auth/poll` with `login_session_id` and `poll_token`.
6. Server returns API key once; subsequent polls return `status=complete` without re-issuing key.

## 4. Device Code Flow

Sequence:

1. CLI calls `POST /v1/auth/device-code`.
2. Server returns `login_session_id`, `user_code`, `verification_uri`, `interval`, `expires_in`.
3. User opens `verification_uri` in browser and signs in.
4. Web callback calls `POST /v1/auth/device-verify` with `user_code` using JWT bearer.
5. CLI polls `POST /v1/auth/device-poll` with `login_session_id`.
6. Server returns API key once; subsequent polls return `status=complete`.

## 5. Login Session State Machine

States:

- `pending`
- `authorized`
- `complete`
- `expired`
- `slow_down`

Transitions:

1. `init` -> `pending`
2. `browser-verify` or `device-verify` -> `authorized`
3. First successful `poll` on `authorized` -> issue API key -> `complete`
4. Repeated poll on `complete` -> `complete` without API key re-issuance
5. Expiration path -> `expired`
6. Poll too frequently -> `slow_down`

## 6. API Contracts

### 6.1 `POST /v1/auth/login`

Request:

```json
{"method":"browser_poll"}
```

Response data:

- `flow_type`
- `login_session_id`
- `browser_url`
- `poll_token`
- `interval`
- `expires_in`

### 6.2 `POST /v1/auth/poll`

Request:

```json
{"login_session_id":"...","poll_token":"..."}
```

Response data:

- Always includes `status`
- On first completion includes `credential_type=api_key`, `api_key`, `api_key_id`, `user`

### 6.3 `POST /v1/auth/device-code`

Request:

```json
{}
```

Response data:

- `flow_type=device`
- `login_session_id`
- `verification_uri`
- `user_code`
- `interval`
- `expires_in`

### 6.4 `POST /v1/auth/device-code-check`

Request:

```json
{"user_code":"..."}
```

Response data:

- `valid` (boolean)

### 6.5 `POST /v1/auth/device-poll`

Request:

```json
{"login_session_id":"..."}
```

Response data is the same shape as `/v1/auth/poll`.

## 7. CLI AutoFlow

`AutoFlow()` decision:

1. If browser is likely available (`HasBrowser()`): use browser poll.
2. Otherwise: use device code flow.

`--headless` always forces device code flow.
`--with-token` bypasses both interactive flows.

## 8. Credential Model

Credential model is API key-only:

- `credential_type=api_key`
- `api_key`
- `api_key_id`

No OAuth refresh semantics are part of the CLI credential lifecycle.

## 9. Security and Auth Boundaries

1. Browser and device verification endpoints require JWT bearer (identity token path).
2. CLI capability calls use API key bearer.
3. `/v1/auth/exchange` is JWT-only and can issue API keys for authenticated users.

## 10. Deprecated Paths

The following are not part of the current architecture:

- Localhost callback flow
- `redirect_port`
- `/v1/auth/callback`
- `browser-bind` / `browser-complete`
- OAuth refresh-token credential model in CLI

## 11. Recovery Behavior

When protected CLI API calls return `401`, CLI should prompt the user to run `anycap login` again.

Interactive login polling should respect server `interval` and `slow_down` responses.
