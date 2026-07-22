# Agent Core Master-Fidelity Design QA

## Comparison Target

- Source visual truth: `/Users/tyluo/.codex/attachments/ed59bf85-9416-4ba6-bb01-754206c753e5/image-1.png`
- Fresh current-runtime master capture: `.superpowers/design-qa/agent-core-master-restored-2229.png`
- Same-input comparison: `.superpowers/design-qa/agent-core-master-restored-comparison.png`
- Fresh live awaiting capture: `.superpowers/design-qa/agent-core-awaiting-live-final.png`
- Fresh live connected capture: `.superpowers/design-qa/agent-core-connected-live.png`
- Fresh responsive captures: `.superpowers/design-qa/agent-core-responsive-{390,768,1280,1672}.png`
- Canonical viewport and state: 2229 by 1255 screenshot output from a fresh 1672-by-941 CSS content viewport, awaiting, homepage header visible, Agent Core section aligned to the viewport top
- Fresh Codex in-app-browser viewport: 1913 by 1685, awaiting and connected states, section top within 1 CSS pixel of the viewport top

## Evidence

### Fresh same-input comparison

The selected source and the fresh current-runtime capture are both 2229 by 1255. The current image was captured from `http://localhost:3010/` after the implementation was loaded in a clean Codex in-app-browser tab at a measured 1672-by-941 CSS content viewport. The browser's 0.75 device scale and 4/3 capture compositor produce the required 2229-by-1255 output. The measured section top was 1.802 CSS pixels, `scrollWidth` equalled `clientWidth` at 1672, all four production image layers were complete, and the page was in Awaiting state.

The fresh combined comparison was opened at original detail, followed by focused original-detail comparisons for typography/telemetry and robot/Core:

- `.superpowers/design-qa/agent-core-focused-copy-telemetry-comparison.png`
- `.superpowers/design-qa/agent-core-focused-robot-core-comparison.png`

ImageMagick reports a fresh current-runtime RMSE of `3425.73 (0.0522733)` against the selected JPEG. The remaining decoded-pixel delta is fine-grained browser/JPEG capture noise rather than a visible layout, type, asset, color or crop difference. The full and focused side-by-side comparisons show no actionable P0, P1 or P2 difference.

The earlier canonical capture produced immediately after commit `1b31d7d2` remains decoded-pixel identical to the selected target (`RMSE 0 (0)`), but is used only as corroborating history. The pass gate above is based on the fresh current runtime. A scoped source diff from that commit to the current production source is also empty for the section, scene, head tracker, Core control, telemetry, CSS, and four visual assets; later procedural Three/R3F files were removed in `9ee3ee2f`.

### Fresh current-runtime evidence

The user-opened Codex in-app browser was claimed at `http://localhost:3010/`. A fresh awaiting screenshot and a fresh connected screenshot were captured and opened at original detail. The current browser has a taller 1913-by-1685 viewport than the canonical 16:9 target, so this evidence is used to validate the live responsive composition and interaction states rather than replace the canonical same-input comparison.

The fresh awaiting state preserves the approved background/grain, site header, display and mono fonts, three-zone layout, upper-body robot crop, empty socket, seated Core, dock and tabletop. The connected state seats the real Core in the chest socket and fills the telemetry to `04 / 03 / 03 / 01 / 01` without moving the robot identity or replacing it with a lower-fidelity procedural model.

### Responsive browser verification

Four fresh browser runs covered the required width classes. The Codex viewport capability works in physical pixels at a 0.75 device scale, so the nominal 390 run resolves to the nearest representable content width, 391 CSS pixels. At every width, the section existed exactly once, `scrollWidth <= clientWidth`, the heading and primary Core control had finite in-bounds rectangles, and all four image layers reported `complete: true` with nonzero natural widths. Each responsive screenshot was opened at original detail.

| Nominal width | Measured CSS viewport | Horizontal overflow | Visual result |
|---|---:|---:|---|
| 390 | 391 by 844 | none (`391 = 391`) | stacked mobile composition; copy and Core control remain visible |
| 768 | 768 by 900 | none (`768 = 768`) | compact two-zone composition; typography and robot remain legible |
| 1280 | 1280 by 900 | none (`1280 = 1280`) | desktop three-zone composition remains balanced |
| 1672 | 1672 by 941 | none (`1672 = 1672`) | canonical desktop composition matches the selected master |

## Required Fidelity Surfaces

- Typography: passed. Headline, body, command, telemetry labels and values match the canonical family, weight, line height and wrapping.
- Layout and spacing: passed. Canonical screenshot is pixel-identical; fresh tall-viewport evidence remains balanced and unclipped.
- Colors and tokens: passed. Background tone/grain, black ink, olive accent, borders and table line match.
- Image quality and assets: passed. The four real transparent WebP layers remain sharp and correctly composited; no CSS-art or WebGL replacement is present.
- Copy and content: passed. Approved copy and telemetry groups are unchanged.
- Responsiveness: passed by fresh browser measurements and original-detail captures at nominal 390, 768, 1280 and 1672 widths; no horizontal overflow or missing primary control was observed.
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
3. A fresh 2229-by-1255 current-runtime capture was made from the exact 1672-by-941 CSS viewport and compared side by side with the selected target at original detail.
4. Responsive browser runs were completed at nominal 390, 768, 1280 and 1672 widths, including DOM overflow, image-load and control-bound checks.
5. Historical pixel identity (`RMSE 0 (0)`) and an empty scoped source diff corroborate the result but are not used in place of the fresh-runtime gate.
6. Full-view and focused comparison images were opened at original detail. No P0/P1/P2 differences remain.

final result: passed
