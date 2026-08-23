# State Contract

Use these templates to persist the workflow without coupling it to a topic, platform, model, or duration.

## Copy Blueprint

```yaml
project_id: ""
reference:
  source: ""
  rights_or_transfer_scope: ""
output:
  platform: ""
  aspect_ratio: ""
  duration: ""
promise: ""
hook_deadline: ""
beats:
  - id: setup
    timing: ""
    function: ""
    visible_action: ""
    endpoint: ""
  - id: escalation
    timing: ""
    function: ""
    visible_action: ""
    endpoint: ""
  - id: payoff
    timing: ""
    function: ""
    visible_action: ""
    endpoint: ""
shot_contract:
  count: ""
  cuts: []
  camera_functions: []
audio_contract:
  timing_owner: ""
  cues: []
endpoint: ""
locks: []
replacements: []
exclusions: []
executor: "anycap"
```

## User Verdict

```yaml
reviewed_version: "copy_v1"
verdict: "accepted | copy_repair | remix"
evidence:
  likes: []
  mismatches_with_reference: []
  preference_changes: []
```

Decision rule:

- Populate `mismatches_with_reference` -> Copy Repair.
- Populate `preference_changes` after review -> Remix.
- If both exist, repair reference-critical failures first unless the user explicitly abandons Copy fidelity.

## Remix Delta

```yaml
version: "remix_v1"
baseline: "copy_v1"
preserve: []
change:
  - field: ""
    from: ""
    to: ""
exclude_new_changes: []
review_checks: []
```

## Executor Handoff

```yaml
state: "copy | copy_repair | remix"
baseline_assets: []
reference_roles: []
current_objective: ""
visible_endpoint: ""
locks: []
delta: []
exclusions: []
output_constraints: {}
```

The executor may translate this contract into current AnyCap model syntax but must not invent a new beat or broaden the delta.
