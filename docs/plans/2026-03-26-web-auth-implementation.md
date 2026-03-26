# Web Auth Implementation Tasks

> Date: 2026-03-26
> Status: Draft
> Depends on: [web-auth-flows.md](2026-03-26-web-auth-flows.md)

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

### B4. `POST /v1/auth/device-verify` (for /device page, separate from web login)

New endpoint. Allows a logged-in web user to authorize a CLI device code session.

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
4. Mark session as authorized + completed with principal's user_id
5. Create API key for CLI
6. Return success

**Response:**

```jsonc
{ "data": { "message": "authorized" } }
```

**Files to change:**

| File | Change |
|------|--------|
| `internal/domain/port/login_session.go` | Add `GetByUserCode(ctx, userCode)` to `LoginSessionRepo` |
| `internal/infrastructure/apikey/` | Implement `GetByUserCode` for memory + postgres repos |
| `internal/application/login/service.go` | Add `DeviceVerify(ctx, userCode, userID)` method |
| `internal/transport/http/dto/login.go` | Add `DeviceVerifyRequest` struct |
| `internal/transport/http/handlers/login.go` | Add `DeviceVerify()` handler |
| `internal/transport/http/handlers/login.go` | Register `POST /auth/device-verify` as protected route |

**Note:** This is a protected route (requires auth middleware), unlike the other login
endpoints which are public. Register it alongside `/v1/auth/logout` in the protected
route group.

---

### B5. `deviceVerificationURL` — update to production URL

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
| `web/src/app/auth/callback/route.ts` | GET handler: receive Auth0 callback, call Server `/v1/auth/callback`, store api_key in cookie, redirect to `return_to` (default: `/dashboard`) |
| `web/src/app/auth/logout/route.ts` | GET handler: call Server `/v1/auth/logout`, clear cookie, redirect home |

**Cookie strategy:**
- `anycap_session` httpOnly cookie containing `{api_key, user}` (encrypted or signed)
- `anycap_login` httpOnly cookie for `login_session_id` during login flow (temp, deleted after callback)

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

**New files:**
- `web/src/app/device/page.tsx` — Device code verification page
- `web/src/app/api/device-verify/route.ts` — API route proxying to AnyCap Server

**Page UX states:**

| State | Page shows |
|-------|-----------|
| Not logged in, no code in URL | "Please log in to authorize a device" + Login button |
| Not logged in, code in URL | Same message + Login button (code preserved via `return_to`) |
| Logged in, no code | Code input form (empty) |
| Logged in, code in URL | Code input form (prefilled), user clicks "Authorize" |
| Success | "Device authorized. You can close this page." |
| Error | Code invalid / expired / already used — show error + option to retry |

**Key behavior:**
- Not logged in → show message prompting login, do NOT show code input form
- Login button links to `/auth/login?return_to=/device?code=ABCD-1234`
- After login, `/auth/callback` reads `return_to` and redirects back to `/device?code=...`
- Logged in + submit code → Next.js API route calls `POST /v1/auth/device-verify`
  with user's API key from session cookie

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

B4 (device-verify endpoint) + B5 (verification URL)
  └── F5 (/device page)
```

Web login (B1→B2→B3→F1→F2→F3→F4) and device page (B4→B5→F5) can be developed in
parallel.

---

## Out of Scope

- JWT validation on server (not needed — web uses API key via server-to-server calls)
- CORS (not needed — Next.js server calls AnyCap Server, not browser)
- `@auth0/nextjs-auth0` SDK (not needed — reusing existing server endpoints)
- Token refresh (MVP uses API keys, not OAuth tokens)
