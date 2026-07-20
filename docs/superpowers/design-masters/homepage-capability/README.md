# Homepage Capability Design Master

This package is a design approval surface. It does not modify the production homepage.

## Review

Run `python3 -m http.server 62894 --directory docs/superpowers/design-masters/homepage-capability` and open `http://localhost:62894/review.html`.

## Contract

Run `node docs/superpowers/demos/verify-homepage-capability-design-master.mjs all`.

## Approval Boundary

Do not begin production integration until the final master, five keyframes, and component breakdown are explicitly approved.
