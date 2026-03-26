# Web Auth Implementation Tasks

> Date: 2026-03-26
> Status: Draft
> Depends on: [web-auth-flows.md](2026-03-26-web-auth-flows.md)
> References: [anycap-auth-bff-design.md](2026-03-25-anycap-auth-bff-design.md) Section 7.2, [headless-login-relay-design.md](2026-03-26-headless-login-relay-design.md)

## Design Decisions

1. **Device flow is self-hosted** — Server self-generates `user_code`, does NOT call Auth0's native Device Authorization Grant. Per BFF design doc 7.2 and headless relay design.
2. **Code first, login second** — User enters device code FIRST on the verification page, then is guided through Auth0 login. Login completion automatically authorizes the device. One seamless step.
3. **Verification page lives in Next.js** — The `/device` page is part of the Next.js web app (`anycap.ai/device`), not hosted by AnyCap Server.
4. **No Auth0 SDK on frontend** — Reuse existing Server endpoints. Next.js only does fetch calls.
5. **API key in httpOnly cookie** — Browser JS never sees the API key.
6. **Dual expiry** — `user_code` expires in 5 minutes, `login_session` expires in 15 minutes (per headless relay design 4.1).

---

## Backend Tasks (AnyCap Server)

### B1. `POST /v1/auth/login` — support `method: "web"`

Reuse the existing localhost flow logic, but accept a full redirect URL instead of a port.

**Files to change:**

| File | Change |
|------|--------|
| `internal/domain/model/login_session.go` | Add `LoginFlowWeb = "web"` constant |
| `internal/transport/http/dto/login.go` | `LoginInitRequest` add `RedirectURL string` field |
| `internal/transport/http/handlers/login.go` | `Init()` handler: pass `RedirectURL` to service |
| `internal/application/login/service.go` | `Init()`: add `case model.LoginFlowWeb` branch |

**Service logic for `LoginFlowWeb`** (mirrors localhost flow):

```go
case model.LoginFlowWeb:
    if redirectURL == "" {
        return ..., model.ErrInvalidParam
    }
    // Validate redirectURL against allowlist (security: prevent open redirect)
    session.FlowType = model.LoginFlowWeb
    session.State = s.stateGenerator()
    session.RedirectURI = redirectURL
    session.CodeVerifier = "pkce-" + session.ID
    authURL, err := s.authClient.BuildLoginURL(ctx, session.State, session.RedirectURI)
    // ... same as localhost from here
```

**`Init()` method signature change:**

Current: `Init(ctx, method string, redirectPort int)`
New: `Init(ctx, method string, redirectPort int, redirectURL string)`

Or use an options struct to keep it clean.

**Security:** `redirectURL` must be validated against a whitelist of allowed origins
(e.g., `https://anycap.ai`, `http://localhost:3000`). Reject arbitrary URLs to prevent
open redirect attacks.

---

### B2. `POST /v1/auth/callback` — accept `flow_type: "web"`

Currently hardcoded to reject non-localhost flows.

**File:** `internal/application/login/service.go`

**Change line 176:**

```go
// Before
if session.ID == "" || session.FlowType != model.LoginFlowLocalhost {

// After
if session.ID == "" || (session.FlowType != model.LoginFlowLocalhost && session.FlowType != model.LoginFlowWeb) {
```

No other changes needed — the rest of the Callback logic (code exchange, user
provisioning, API key creation) is identical for localhost and web.

---

### B3. Auth0 Dashboard — register web callback URL

Add to the existing Auth0 Application's Allowed Callback URLs:

- `https://anycap.ai/auth/callback`
- `http://localhost:3000/auth/callback` (for local dev)

---

### B4. Device code — self-hosted, no Auth0 dependency

Per BFF design doc 7.2 and headless relay design, the device flow should NOT call
Auth0's `/oauth/device/code`.

**File:** `internal/application/login/service.go`

**Change `Init()` device branch:**

```go
// Before (current — calls Auth0)
case model.LoginFlowDevice:
    deviceAuth, err := s.authClient.StartDeviceFlow(ctx)
    session.DeviceCode = deviceAuth.DeviceCode
    session.UserCode = deviceAuth.UserCode
    ...

// After (self-hosted — no Auth0 call)
case model.LoginFlowDevice:
    session.UserCode = s.userCodeGenerator()
    session.UserCodeExpiresAt = now.Add(5 * time.Minute)  // 5 min code expiry
    session.ExpiresAt = now.Add(15 * time.Minute)          // 15 min session expiry
    if err := s.sessions.CreateSession(ctx, session); err != nil { ... }
    return model.LoginInitResult{
        FlowType:        model.LoginFlowDevice,
        LoginSessionID:  session.ID,
        VerificationURI: s.deviceVerificationURL,
        UserCode:        session.UserCode,
        ExpiresIn:       int(session.ExpiresAt.Sub(now).Seconds()),
        Interval:        5,
    }, nil
```

**Model change:** Add `UserCodeExpiresAt time.Time` field to `LoginSession`.

---

### B5. Device poll — self-hosted, no Auth0 dependency

**File:** `internal/application/login/service.go`

**Change `Poll()` method** to remove Auth0 calls and add self-hosted logic:

```go
func (s *Service) Poll(ctx context.Context, sessionID string) (model.LoginPollResult, error) {
    session, err := s.sessions.GetByID(ctx, sessionID)
    // ... validation ...

    now := s.now().UTC()

    // Session-level expiry
    if now.After(session.ExpiresAt) {
        return model.LoginPollResult{Status: model.LoginSessionStatusExpired}, nil
    }

    // User code expiry: if code expired and not yet authorized, treat as expired
    if !session.UserCodeExpiresAt.IsZero() && now.After(session.UserCodeExpiresAt) &&
        session.Status == model.LoginSessionStatusPending {
        return model.LoginPollResult{Status: model.LoginSessionStatusExpired}, nil
    }

    // TODO: rate-limit polling — return slow_down if too frequent

    switch session.Status {
    case model.LoginSessionStatusPending:
        return model.LoginPollResult{Status: model.LoginSessionStatusPending}, nil
    case model.LoginSessionStatusCompleted:
        // Return stored API key + user (see B6 for how these get stored)
        ...
    }
}
```

**Polling slow_down** (per headless relay design 4.1):
- Track `last_polled_at` on the session or use rate limiter
- If interval between polls < server-specified interval → return `slow_down`
- CLI must double its interval on `slow_down`

---

### B6. `POST /v1/auth/device-verify` — new endpoint

Allows a logged-in web user to authorize a CLI device code session. Called by Next.js
after the user completes web login.

**Request:**

```jsonc
POST /v1/auth/device-verify
Authorization: Bearer <api_key>

{ "user_code": "ABCD-1234" }
```

**Logic:**
1. Auth middleware validates API key, extracts principal (user_id)
2. Look up LoginSession by `user_code` where `flow_type == "device"` and `status == "pending"`
3. Validate session not expired
4. Validate user_code not expired (`user_code_expires_at`)
5. Create API key for CLI (using principal's user_id)
6. Store created API key + user info on session (so Poll can return them)
7. Mark session as completed
8. Return success

**Response:**

```jsonc
{ "data": { "message": "authorized" } }
```

**Files to change:**

| File | Change |
|------|--------|
| `internal/domain/model/login_session.go` | Add `UserCodeExpiresAt` field |
| `internal/domain/port/login_session.go` | Add `GetByUserCode(ctx, userCode)` to `LoginSessionRepo` |
| `internal/infrastructure/apikey/` | Implement `GetByUserCode` for memory + postgres repos |
| `internal/application/login/service.go` | Add `DeviceVerify(ctx, userCode, userID)` method |
| `internal/transport/http/dto/login.go` | Add `DeviceVerifyRequest` struct |
| `internal/transport/http/handlers/login.go` | Add `DeviceVerify()` handler |
| Route registration | Register `POST /auth/device-verify` as **protected** route (with auth middleware) |

---

### B7. `POST /v1/auth/device-code-check` — new endpoint

Lightweight endpoint for the `/device` page to validate a user_code before starting
the login flow. Public (no auth required).

**Request:**

```jsonc
POST /v1/auth/device-code-check
{ "user_code": "ABCD-1234" }
```

**Logic:**
1. Look up LoginSession by `user_code`
2. Check session exists, is pending, and user_code not expired
3. Return validity

**Response:**

```jsonc
// Valid
{ "data": { "valid": true } }

// Invalid or expired
{ "data": { "valid": false, "reason": "expired" } }
```

---

### B8. `deviceVerificationURL` — update to production URL

**File:** `internal/app/bootstrap.go`

Change `"https://anycap.local/device"` to `"https://anycap.ai/device"` (or make it
configurable via environment variable).

---

## Frontend Tasks (Next.js)

### F1. Auth route handlers

Create Next.js route handlers for the web login flow. No auth SDK needed — just fetch
calls to AnyCap Server.

**New files:**

| File | Purpose |
|------|---------|
| `web/src/app/auth/login/route.ts` | GET handler: call Server `/v1/auth/login`, store session_id + `return_to` in cookie, redirect to Auth0 |
| `web/src/app/auth/callback/route.ts` | GET handler: receive Auth0 callback, call Server `/v1/auth/callback`, store api_key in cookie. **If `device_user_code` cookie present → auto-call device-verify, clear cookie.** Redirect to `return_to` (default: `/dashboard`). |
| `web/src/app/auth/logout/route.ts` | GET handler: call Server `/v1/auth/logout`, clear cookie, redirect home |

**Cookie strategy:**
- `anycap_session` httpOnly cookie containing `{api_key, user}` (encrypted or signed)
- `anycap_login` httpOnly cookie for `login_session_id` + `return_to` during login flow (temp, deleted after callback)
- `device_user_code` httpOnly cookie for device code during login-for-device flow (temp, deleted after callback)

### F2. Landing page login button

**File:** `web/src/app/for-human/page.tsx`

Add "Login" link in the header that navigates to `/auth/login`.
Show user info + "Logout" when logged in.

### F3. Dashboard route protection

**File:** `web/src/middleware.ts`

Add logic: if request path matches `/(dashboard)/*` and no valid session cookie,
redirect to `/auth/login`.

### F4. Dashboard layout — user info

**File:** `web/src/app/(dashboard)/layout.tsx`

Read user info from session cookie. Display email in sidebar. Add logout link.

### F5. `/device` page (for CLI device code flow)

The verification page lives in Next.js. User enters code FIRST, then is guided
through login. Login completion automatically authorizes the device.

**New files:**
- `web/src/app/device/page.tsx` — Code input form
- `web/src/app/device/complete/page.tsx` — Success page ("Device authorized")
- `web/src/app/api/device-code-check/route.ts` — Proxy to Server `device-code-check`

**Page flow:**

```
1. User opens /device (or /device?code=ABCD-1234)
2. Page shows code input form (prefilled if code in URL)
3. User submits code
4. Next.js calls POST /v1/auth/device-code-check {user_code} → validate
5. If invalid/expired → show error
6. If valid:
   a. If already logged in (session cookie exists):
      → Next.js calls POST /v1/auth/device-verify {user_code} with API key
      → Redirect to /device/complete
   b. If not logged in:
      → Store user_code in device_user_code cookie
      → Redirect to /auth/login?return_to=/device/complete
      → After login, /auth/callback reads device_user_code cookie
      → Auto-calls POST /v1/auth/device-verify
      → Clears device_user_code cookie
      → Redirects to /device/complete
7. /device/complete shows "Device authorized. You can close this page."
```

**Page UX states:**

| State | Page shows |
|-------|-----------|
| No code in URL | Code input form (empty) |
| Code in URL | Code input form (prefilled) |
| Code submitted, valid, not logged in | Redirect to Auth0 login (transparent) |
| Code submitted, valid, logged in | Redirect to /device/complete |
| Code invalid | Error: "Invalid code" + retry |
| Code expired (> 5 min) | Error: "Code expired. Please request a new one in your terminal." |
| Authorization complete | "Device authorized. You can close this page." |

---

## Dependency Order

```
B1 (auth/login web method)
  └── B2 (auth/callback accept web)
        └── B3 (Auth0 config)
              └── F1 (route handlers)
                    ├── F2 (login button)
                    ├── F3 (route protection)
                    └── F4 (dashboard user info)

B4 (device self-hosted) + B5 (device poll) + B6 (device-verify) + B7 (device-code-check) + B8 (verification URL)
  └── F5 (/device page)
```

Web login (B1→B2→B3→F1→F2→F3→F4) and device page (B4-B8→F5) can be developed in
parallel.

---

## Out of Scope

- Auth0 native Device Authorization Grant (replaced by self-hosted device flow)
- JWT validation on server (not needed — web uses API key via server-to-server calls)
- CORS (not needed — Next.js server calls AnyCap Server, not browser)
- `@auth0/nextjs-auth0` SDK (not needed — reusing existing server endpoints)
- Token refresh (MVP uses API keys, not OAuth tokens)
