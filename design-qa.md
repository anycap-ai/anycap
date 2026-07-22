# Agent Core Master-Fidelity Design QA

## Comparison Target

- Source visual truth: `/Users/tyluo/.codex/attachments/ed59bf85-9416-4ba6-bb01-754206c753e5/image-1.png`
- Canonical implementation capture: `.superpowers/design-qa/agent-core-master-restored-2229.png`
- Same-input comparison: `.superpowers/design-qa/agent-core-master-restored-comparison.png`
- Fresh live awaiting capture: `.superpowers/design-qa/agent-core-awaiting-live-final.png`
- Fresh live connected capture: `.superpowers/design-qa/agent-core-connected-live.png`
- Canonical viewport and state: 2229 by 1255, awaiting, homepage header visible, Agent Core section aligned to the viewport top
- Fresh Codex in-app-browser viewport: 1913 by 1685, awaiting and connected states, section top within 1 CSS pixel of the viewport top

## Evidence

### Canonical same-input comparison

The selected source and canonical implementation capture are both 2229 by 1255. ImageMagick reports RMSE `0 (0)`: their decoded pixels are identical. The combined comparison was opened at original detail, followed by focused original-detail comparisons for typography/telemetry and robot/Core:

- `.superpowers/design-qa/agent-core-focused-copy-telemetry-comparison.png`
- `.superpowers/design-qa/agent-core-focused-robot-core-comparison.png`

The canonical capture was produced immediately after commit `1b31d7d2` (`fix(web): center agent core desktop scene`) at 2026-07-21 17:50 +0800. A scoped source diff from that commit to the current production source is empty for the section, scene, head tracker, Core control, telemetry, CSS, and four visual assets. The current runtime therefore uses the exact render source represented by the canonical capture; later procedural Three/R3F files were removed in `9ee3ee2f`.

### Fresh current-runtime evidence

The user-opened Codex in-app browser was claimed at `http://localhost:3010/`. A fresh awaiting screenshot and a fresh connected screenshot were captured and opened at original detail. The current browser has a taller 1913-by-1685 viewport than the canonical 16:9 target, so this evidence is used to validate the live responsive composition and interaction states rather than replace the canonical same-input comparison.

The fresh awaiting state preserves the approved background/grain, site header, display and mono fonts, three-zone layout, upper-body robot crop, empty socket, seated Core, dock and tabletop. The connected state seats the real Core in the chest socket and fills the telemetry to `04 / 03 / 03 / 01 / 01` without moving the robot identity or replacing it with a lower-fidelity procedural model.

## Required Fidelity Surfaces

- Typography: passed. Headline, body, command, telemetry labels and values match the canonical family, weight, line height and wrapping.
- Layout and spacing: passed. Canonical screenshot is pixel-identical; fresh tall-viewport evidence remains balanced and unclipped.
- Colors and tokens: passed. Background tone/grain, black ink, olive accent, borders and table line match.
- Image quality and assets: passed. The four real transparent WebP layers remain sharp and correctly composited; no CSS-art or WebGL replacement is present.
- Copy and content: passed. Approved copy and telemetry groups are unchanged.
- Responsiveness: passed by focused source contracts and fresh 1913-by-1685 browser rendering; no horizontal overflow or cropped primary control was observed.
- Accessibility and interaction: passed for the primary paths below.

## Primary Interactions Tested

- Pointer head tracking: passed. Moving the pointer changed the tracked head from approximately `rotateY(-8.35deg) rotateX(-4.29deg)` to `rotateY(7.28deg) rotateX(-5deg)` while the torso stayed fixed.
- Core click installation: passed. Awaiting transitioned to Connected with `04 / 03 / 03 / 01 / 01`.
- Core drag-to-socket installation: passed in the live browser with measured Core and socket centers.
- Keyboard installation: passed with Enter and the same connected telemetry.
- Rejected return, touch arbitration, pointer cancellation and reduced-motion lifecycle remain covered by the focused Agent Core reducer/timeline suite; the in-app browser's synthetic drag holds pointer capture on a rejected drop, so that synthetic edge was not used as a product failure signal.

## Console

- JavaScript errors: none.
- One development-only Next Image LCP warning was observed after reloading directly at the scrolled Agent Core section. The section is not above the fold during a normal page load, so this is not a production correctness or fidelity finding.

## Findings

No actionable P0, P1 or P2 fidelity findings remain.

P3 follow-up only: if the section later becomes an above-the-fold surface, consider marking the body image as priority after measuring real LCP rather than reacting to the scroll-restored development warning.

## Comparison History

1. Browser access was initially blocked, so the first QA result was correctly left blocked.
2. After the user opened the localhost tab, fresh awaiting/connected captures and pointer, click, drag and keyboard checks were completed.
3. The selected target was proven pixel-identical to the canonical capture (`RMSE 0 (0)`), and current scoped render source was proven identical to the commit that produced that capture.
4. Full-view and focused comparison images were opened at original detail. No P0/P1/P2 differences remain.

final result: passed
