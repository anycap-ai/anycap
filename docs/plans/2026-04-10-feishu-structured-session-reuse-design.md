# Feishu Structured Session Reuse Design

Date: 2026-04-10

## 1. Problem

The current personal Feishu bot flow relies on a small local burst-merge timer in the daemon.

That helps for some "image + immediate text" cases, but it has two hard problems:

1. the product semantics are still timer-driven rather than structure-driven
2. once the human types slightly slower, the same logical turn is split into multiple Codex runs

This is the wrong long-term control point.

`present` uses a better model:

- reuse the same session when the new message is structurally related
- enrich context aggressively
- queue follow-up input inside the same session flow instead of letting every message become a fresh independent run

AnyCap should move in that direction.

## 2. Goal

For the personal Feishu bot path, the primary routing rule should become:

- **structure first**
- **active-conversation follow-up inbox second**
- **timer only as fallback**

That means:

1. if a new Feishu message clearly belongs to the current active conversation, do not immediately create another standalone session
2. enqueue it as a follow-up for the active conversation
3. when the active session finishes, create the next Codex run from the queued follow-up inputs in order

This should reduce fragmented replies without pretending that all nearby messages are one turn.

## 3. Scope

### In scope

- personal Feishu bot daemon path only
- `continue` chat flow only
- structural reuse based on:
  - `thread_id`
  - `root_id`
  - `parent_id`
  - quoted-message relation
- server-side follow-up inbox for active conversations
- runner-side serial consumption through normal session creation
- fixed-window burst merge reduced to fallback behavior

### Out of scope

- legacy shared-bot ingress
- `/new`, `/reset`, `/stop`, `/fork`, `/fire`
- generic "merge all consecutive text" semantics
- rewriting Codex prompt protocol
- replacing rich context enrichment

## 4. Product Semantics

### What should count as the same active interaction

The first phase should only treat follow-up messages as belonging to the same active interaction when there is explicit structure:

- the new message is in the same thread as the active conversation
- the new message replies to a message that belongs to the active conversation
- the new message quotes or points at a message already associated with the active conversation

This is deliberate.

For naked consecutive text such as:

- `你这样吧`
- `你说下原因`

without any thread/reply relationship, the system should **not** invent strong semantics yet. That can be a later policy decision.

## 5. Recommended Architecture

### 5.1 Keep daemon enrichment, weaken daemon merge

The daemon should continue to:

- normalize Feishu events
- enrich `quoted_message`, `thread_history`, `chat_history`, `file_info`, `local_path`

The daemon should stop being the main semantic authority for "is this the same turn".

The current fixed merge window can remain only as a narrow transport fallback for extremely tight local bursts, but it should no longer be the primary product behavior.

### 5.2 Add a server-side follow-up inbox for conversations

Add a lightweight server-side persistence layer for follow-up user inputs attached to an active conversation.

Suggested model:

- `conversation_id`
- `platform_message_id`
- `thread_id`
- `root_id`
- `parent_id`
- `payload`
- `delivered_to_session_id`
- `created_at`

This should be a new concept, separate from mailbox.

Mailbox already means:

- async agent/tool/subtask output that should later be fired back into the conversation

Follow-up inbox means:

- additional human input arriving while the active session is still in progress

The semantics are different, so the storage should stay distinct.

### 5.3 Reuse active conversation, not timer proximity

For inbound `continue` messages:

1. resolve the active conversation by `user_id + platform + bot_id + chat_id`
2. dedupe by inbound Feishu `message_id`
3. if no active conversation exists:
   - create conversation
   - create session immediately
4. if active conversation exists and is **not busy**:
   - create the next session immediately
5. if active conversation exists and **is busy**:
   - evaluate whether the new message is structurally attached to that active conversation
   - if yes:
     - persist follow-up inbox item
     - do **not** create a new session yet
   - if no:
     - keep current behavior for now
     - create a separate queued session

This keeps phase 1 conservative.

## 6. How Structure Matching Should Work

The matching rule should be deterministic and local to server/application logic.

### Priority order

1. **Thread root match**
   - if inbound `root_id` or `thread_id` matches the active conversation's current thread scope, reuse that conversation

2. **Parent message match**
   - if inbound `parent_id` points to a Feishu `message_id` already associated with a session in this conversation, treat as follow-up to that conversation

3. **Quoted relation match**
   - if the enriched context references a message already associated with the conversation, treat as follow-up

To support this, the server can continue using the message metadata already embedded in `session.UserMessage`.

The first phase does not require a separate message-mapping table if session scanning is sufficient.

## 7. Draining the Follow-up Inbox

When the active session transitions to a terminal state:

- `committed`
- `failed`
- `interrupted`

the conversation service should check for undelivered follow-up inbox items.

If any exist:

1. build the next `continue` session input from the pending follow-ups
2. mark those follow-up items as delivered to the new session
3. update `conversation.last_session_id`

This keeps the existing runner model intact:

- runner still fetches runnable sessions
- Codex still sees a normal next session
- no streaming protocol change is required

## 8. Input Shape for the Next Session

The next session should still look like one Codex run.

The minimal approach is:

- use the latest follow-up message as the primary message
- prepend a small structured section listing earlier undelivered follow-ups in order

Example shape:

```xml
<feishu-follow-up-burst>
  <item message_id="om_1">你这样吧</item>
  <item message_id="om_2">你说下原因</item>
</feishu-follow-up-burst>
```

This is preferable to creating multiple standalone sessions because:

- Codex runs once
- the supplemental inputs remain explicit
- existing `chat_history` and `thread_history` still provide additional context

## 9. Interaction With Existing Features

### Duplicate inbound dedupe

Keep the existing message-level dedupe by Feishu `message_id`.

### Rich context enrichment

Keep it. This design depends on it.

### Media entity download

Keep it. Follow-up inputs involving images/files should preserve local paths in the later session input.

### Mailbox auto-fire

Do not overload mailbox with human follow-ups.

The conversation service can run two separate checks after a session completes:

1. pending human follow-up inbox
2. pending mailbox async output

Human follow-up should take priority because it reflects the latest direct user input.

## 10. Risks

### Risk 1: over-reusing a conversation

If structural matching is too loose, unrelated messages can be appended to the active conversation.

Mitigation:

- phase 1 only accepts explicit thread/reply/quoted relationships
- naked consecutive text stays conservative

### Risk 2: inbox starvation

If terminal session transitions fail to trigger inbox draining, follow-up input can stall.

Mitigation:

- drain inbox from the same update path that already handles mailbox auto-fire
- test all terminal states

### Risk 3: duplicated semantics between daemon fallback and server reuse

If both layers are equally authoritative, behavior becomes hard to reason about.

Mitigation:

- daemon timer becomes fallback only
- server-side structured reuse is the primary authority

## 11. Recommendation

Implement in phases.

### Phase 1

- add server-side follow-up inbox
- add structural conversation reuse for thread/reply/quoted follow-ups
- drain follow-up inbox after active session reaches terminal state
- demote daemon fixed-window merge to fallback

### Phase 2

- evaluate whether some naked consecutive text should also be appended to the active conversation
- only after phase 1 proves stable

This gives AnyCap a path closer to `present` without rewriting the whole execution model.
