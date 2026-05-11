# Chrome Extension Launch Evidence

This file is the browser-free handoff artifact for the final Chrome Web Store
upload gate. Update it only after the evidence exists; `pnpm launch:audit` reads
these fields when `--dogfood-passed` and `--latency-passed` are used.

## Internal Dogfood

Dogfood status: pending
Dogfood participants: 0
Dogfood working days: 0
P0 bugs: pending

Required before changing this section to passed:

- 5 or more people dogfooded the production extension.
- Dogfood covered 2 working days.
- Zero P0 bugs are open or observed.
- Evidence source is linked or recorded in the notes below.

## P90 Generation Latency

P90 generation latency seconds: pending
Metrics source: pending

Required before recording a numeric latency:

- Metric comes from the deployed server, not a local mock build.
- P90 generation latency is below 15 seconds.
- Measurement window and query/dashboard source are recorded in the notes below.
- `pnpm smoke:server` per-check `in Nms` timings may be recorded below as
  browser-free spot-check evidence, but they do not replace the deployed-server
  P90 metric source.

## Notes

- Dogfood evidence:
- Latency evidence: record deployed-server P90 source/window and any relevant `pnpm smoke:server` per-check durations.
