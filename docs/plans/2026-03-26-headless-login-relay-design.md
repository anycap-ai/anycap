# AnyCap Headless Login Relay Design

> Date: 2026-03-26  
> Scope: decide the authoritative implementation direction for `anycap login --headless`

## 1. Decision

`anycap login --headless` should use a **server-hosted device login page / callback relay**.

It should **not** depend on Auth0 native Device Authorization Grant as the primary
design direction.

## 2. Why This Matches the Existing Architecture

The current architecture already established these rules:

- CLI only talks to AnyCap Server
- Server handles Auth0 internally
- Server creates or looks up local users
- Server issues AnyCap API keys back to CLI

This is the same model used by the localhost/browser login flow. A relay-based
headless flow keeps that model intact instead of introducing a second,
incompatible login architecture.

## 3. Why We Are Not Choosing "Auth0 Native App + Device Flow"

Although Auth0 native apps are the natural home for provider-native device flow,
that option does not fit the current AnyCap implementation cleanly.

Main reasons:

- The current browser login path is implemented as a server-orchestrated
  confidential-client flow.
- The current Auth0 integration assumes server-side token exchange and
  application credentials.
- A native-app device flow would push the system toward a second auth client type
  with different token endpoint assumptions and different grant-type rules.
- This would split the implementation between:
  - browser login using a Regular Web Application style flow
  - headless login using a Native App style flow

That split increases operational complexity and weakens the "server as the only
auth orchestrator" principle.

## 4. Recommended Headless Flow

The intended headless flow is:

1. CLI requests `POST /v1/auth/device-code`
2. Server creates a login session and generates:
   - `login_session_id`
   - `user_code`
   - `verification_uri`
   - `interval`
   - `expires_in`
3. User opens the verification page in any browser
4. User enters the `user_code`
5. Server resolves the login session and sends the user into the normal
   Auth0-backed browser login flow
6. After login completes, server marks the session as authorized
7. CLI polls `POST /v1/auth/device-poll`
8. Server returns:
   - `status=complete`
   - `api_key`
   - `api_key_id`
   - `user`

## 4.1 Expiry And Polling Rules

Headless relay should use two related but distinct timers:

- `login_session.expires_at`: 15 minutes
- `user_code.expires_at`: 5 minutes

Rationale:

- the overall login session should stay aligned with a 15-minute login window
- the user-facing verification code should expire faster to reduce replay and
  stale-code confusion

This means:

- the CLI may continue polling for up to 15 minutes
- the verification page must reject code entry after 5 minutes
- if the user code has expired and the session is not complete, polling should
  resolve to `expired` rather than continue forever

Recommended polling behavior:

- default poll interval: 5 seconds
- the server returns `interval=5`
- the CLI must respect the server-provided interval
- if the server returns `slow_down`, the CLI doubles the interval

Server-side polling semantics:

- if `login_session` has expired: return `status=expired`
- if `user_code` has expired and the session is not yet authorized: return `status=expired`
- if polling is too frequent: return `status=slow_down`
- otherwise return `pending` until login completes

## 5. User-Facing Properties

This gives us the right UX for headless environments:

- terminal stays headless
- browser can be on another device or another machine
- CLI never needs to hold Auth0 refresh tokens
- login result remains an AnyCap API key

## 6. Implementation Consequences

The headless implementation should eventually converge on:

- server-managed `user_code` lookup
- verification page owned by AnyCap
- standard browser login after code entry
- session-based polling back to CLI
- explicit session expiry enforcement
- explicit short-lived user-code expiry enforcement
- server-controlled polling interval and optional `slow_down` protection

The server should remain the single place that:

- talks to Auth0
- maps external identity to local user
- issues API keys

## 7. Migration Guidance

Until relay-based headless login is implemented:

- `anycap login` (browser + localhost callback) is the primary supported path
- `anycap login --headless` should be treated as incomplete / non-authoritative
  if it relies on auth-provider-native device grant behavior

## 8. Summary

The authoritative direction is:

- `localhost login` -> server-managed web auth -> API key
- `headless login` -> server-hosted device verification page -> server-managed web auth -> API key

This keeps CLI, dashboard, and future auth flows on one consistent BFF-style
authentication model.
