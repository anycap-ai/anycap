# AnyCap CLI Headless Login Nonblocking Design

> Date: 2026-03-27  
> Scope: add a nonblocking headless login mode for agent / toolcall environments where blocking stdout is not visible in real time

## 1. Decision

`anycap login --headless` should gain a **nonblocking two-step mode** for agent usage.

Recommended first-phase shape:

1. `anycap login --headless --no-wait --json`
2. `anycap login poll --session <id> --json`

The existing blocking form:

```bash
anycap login --headless
```

should remain unchanged for normal human-operated terminals.

This design intentionally scopes the first change to **headless login only**.
Interactive `anycap login` remains browser-first and blocking.

## 2. Problem Statement

The current headless flow is terminal-friendly but agent-unfriendly.

Today, `anycap login --headless`:

- prints `verification_uri`
- prints `user_code`
- blocks while polling for completion

This works for a human directly watching the terminal.

However, in some agent / toolcall runtimes:

- blocking commands do not stream intermediate stdout back to the agent
- the agent therefore never sees the URL or code
- a human cannot take over the browser step
- the login flow becomes unusable even though the underlying server-side device flow is correct

The issue is therefore **not** the OAuth flow itself. The issue is the **CLI interaction contract**
for environments where long-running tool output is not surfaced incrementally.

## 3. Scope Clarification

### 3.1 Why `cli login` is not the first target

This design does **not** change the default `anycap login` browser flow in phase 1.

Reason:

- `anycap login` is intended for environments that already have browser capability
- it can automatically open the browser
- it does not rely on a human copying a URL from blocked stdout

So the current usability gap is concentrated in:

- `anycap login --headless`

### 3.2 Why `headless` is the real gap

Headless login explicitly depends on exposing:

- `verification_uri`
- `user_code`

If the agent cannot observe intermediate stdout, the human can never complete the login.

Therefore, the first design goal is to make **headless login resumable and nonblocking**.

## 4. Recommended User Flow

### 4.1 Nonblocking init

Agent executes:

```bash
anycap login --headless --no-wait --json
```

The command should return immediately with JSON:

```json
{
  "login_session_id": "lsn_123",
  "verification_uri": "https://preview.anycap-web.pages.dev/auth/device",
  "user_code": "ABCD-EFGH",
  "expires_in": 900,
  "interval": 5,
  "poll_command": "anycap login poll --session lsn_123 --json",
  "next_action_hint": "Show the verification URL and code to the user, ask them to complete login in a browser, and tell them to reply to the agent once they have finished. After the user confirms completion, run `poll_command`."
}
```

`next_action_hint` should be treated as orchestration guidance for the agent, not as an authoritative command string to copy literally.

### 4.2 Human handoff

After receiving the response, the agent should explicitly instruct the human. `next_action_hint` exists to remind the agent to do exactly that:

```text
请在浏览器打开以下链接并输入验证码完成登录。

URL: <verification_uri>
Code: <user_code>

完成后请回复一句确认已完成浏览器操作的话，例如：已完成，请继续
```

### 4.3 Human confirms completion

The agent should **not** assume completion immediately.

Instead, after the human replies with confirmation semantics such as:

```text
已完成，请继续
```

the agent proceeds to poll.

Important clarification:

- this is a recommended example, not a required fixed phrase
- replies such as `继续`, `好了`, `已完成`, `可以了`, `搞定了，继续吧` should all be treated as valid confirmation if the meaning is clearly “the browser step is done, please continue”
- the agent should judge by **user intent / confirmation semantics**, not exact string equality
- the wording inside `next_action_hint` is guidance, not a hard protocol token

### 4.4 Poll

Agent executes:

```bash
anycap login poll --session <id> --json
```

Possible responses:

- `pending`
- `complete + api_key`
- `expired`
- `slow_down`

If still pending, the agent may continue polling according to `interval`, or ask the human to confirm
that the browser flow was actually completed.

## 5. Why This Sequence Is Safe

The key property is:

**poll reads persisted server-side login session state.**

It does not require the agent to be continuously online between `init` and user completion.

Therefore, this order is valid:

1. agent runs `init`
2. human completes the browser step
3. agent runs `poll` later

This works as long as:

- the login session still exists
- the session has not expired
- the agent is polling the same `login_session_id`

So the design does **not** require the second command to run immediately after the first.

## 6. Recovery Semantics

The design should explicitly support delayed continuation.

### 6.1 Required state to continue

The minimal continuation handle is:

- `login_session_id`

The agent may also keep:

- `expires_in`
- `interval`

The CLI contract should not rely on `next_action_hint` as the only recovery mechanism.

Instead, recovery should rely on these structured fields directly:

- `login_session_id`
- `expires_in`
- `interval`
- `verification_uri`
- `user_code`
- `poll_command`

The response should also provide a ready-to-run `poll_command` with the real session ID already substituted. For example:

```bash
anycap login poll --session lsn_123 --json
```

This makes tool-call orchestration simpler:

- `next_action_hint` explains **when** to run the follow-up command
- `poll_command` gives the agent a near-directly executable next step

Even with `poll_command`, `login_session_id` remains the authoritative session identifier in the response model.

### 6.2 Guarantee

After `init` returns successfully, later `poll` calls should remain valid until the session reaches one of:

- `complete`
- `expired`

### 6.3 Implication for agent orchestration

This allows a natural human-in-the-loop workflow:

- agent starts login
- human leaves the tool context and completes browser auth
- human comes back and tells the agent to continue
- agent resumes using the saved `login_session_id`

## 7. Server Restart Semantics

This behavior depends on the login session store.

### 7.1 Persistent environments

If the server runs in an environment where `login_session` is persisted in Postgres
(`dev`, `prod`, `integration`), then:

- the agent may `init`
- the human may complete browser login
- the server may restart
- the agent may `poll` later

and the flow can still succeed, provided the session is not expired.

### 7.2 In-memory environments

If the server runs in an in-memory / stub environment, server restart will lose the session.

In that case:

- `poll` after restart cannot recover the flow

Therefore, this nonblocking design should explicitly require:

- **persistent login session storage** for reliable human-in-the-loop agent workflows

## 8. Existing Server Capabilities We Can Reuse

The current server already exposes the core device-flow primitives needed for this design:

- `POST /v1/auth/device-code`
- `POST /v1/auth/device-poll`

That means the server-side protocol is already very close to what we need.

The main change is at the **CLI contract layer**, not the OAuth layer.

## 9. CLI Shape Options

### Option A — Add flags to existing login command

Examples:

```bash
anycap login --headless --no-wait --json
anycap login poll --session <id> --json
```

Pros:

- minimal change to current mental model
- easiest migration
- keeps login-related commands grouped naturally

Cons:

- mixes interactive and resumable semantics into one command family

### Option B — Split into explicit subcommands

Examples:

```bash
anycap login headless init --json
anycap login headless poll --session <id> --json
```

Pros:

- very explicit semantics
- easier long-term expansion

Cons:

- larger CLI surface change
- less aligned with current UX

### Recommendation

Use **Option A** in phase 1:

```bash
anycap login --headless --no-wait --json
anycap login poll --session <id> --json
```

This keeps changes small while solving the actual agent/toolcall problem.

## 10. Compatibility Strategy

Keep the existing blocking form:

```bash
anycap login --headless
```

Add the new agent-friendly nonblocking form:

```bash
anycap login --headless --no-wait --json
```

This allows:

- humans to keep using the existing one-command blocking flow
- agents to adopt the resumable flow without regressions

## 11. Polling Strategy

The design should not force automatic polling immediately after `init`.

Recommended behavior:

- `init` returns immediately
- agent shows URL/code to human
- agent waits for explicit human confirmation
- agent then calls `poll`
- if still pending, agent can continue polling using the returned `interval`

This minimizes wasted tool occupancy and aligns with real human-assisted workflows.

## 12. Failure Modes To Document

The design doc should explicitly call out:

1. Human never completes the browser step
   - `poll` remains `pending` until timeout

2. Human completes too late
   - session becomes `expired`

3. Agent polls the wrong session
   - server returns invalid / not found semantics

4. Server restarts in a non-persistent environment
   - session is lost

5. Browser flow fails before completion
   - agent sees `pending` or eventual `expired`
   - human needs to retry from a fresh `init`

## 13. Success Criteria

The design is successful if:

- an agent can retrieve `verification_uri` and `user_code` without blocking
- a human can complete login in a separate browser-capable environment
- the agent can later resume with `login_session_id`
- `poll` can return the final API key after human completion
- the flow survives temporary agent inactivity
- the flow survives server restart in persistent environments
- existing `anycap login --headless` behavior does not regress
- existing `anycap login` browser flow does not regress

## 14. Non-Goals

This phase does not attempt to:

- redesign the default interactive browser login flow
- change Auth0 grant semantics
- remove the existing blocking headless login
- require browser/device login to share exactly the same CLI UX

The goal is narrower:

**make headless login safe and usable for agent / toolcall environments that cannot surface streaming stdout while blocked.**
