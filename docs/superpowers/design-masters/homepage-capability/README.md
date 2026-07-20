# Homepage Capability Design Master

This package is a design approval surface. It does not modify the production homepage.

## Review

Run `python3 -m http.server 62894 --directory docs/superpowers/design-masters/homepage-capability` and open `http://localhost:62894/review.html`.

## Contract

Run `node docs/superpowers/demos/verify-homepage-capability-design-master.mjs all`.

Annotation entry `x`/`y` coordinates are normalized to the canonical 1672×941 artboard and use the top-left of the full annotation group. Annotation entries encode this explicitly with `"anchor": "top-left"`.

## Approval Boundary

Do not begin production integration until the final master, five keyframes, and component breakdown are explicitly approved.
