# Models Hub Refresh Design

## Purpose

Refresh the existing `/models` hub so it reflects the models that are currently
available through AnyCap and helps visitors notice the most recently added or
materially updated models first.

The page currently says it was last updated on 2026-04-05 and omits several
models that are already present in the public production catalog. The refresh
must correct that drift without expanding into a new model-detail-page project.

## Approved Scope

Update the existing `/models` hub and the shared inventory needed to render it:

- update the page modification date and localized visible date labels;
- include every model currently returned by the public AnyCap image, video,
  music, and audio model catalogs;
- add audio generation to the hub;
- show recent additions before the full comparison tables;
- sort models within each capability by their most recent AnyCap availability
  or material capability-update date, newest first;
- reflect current modes, including first/last-frame, multi-shot,
  multi-modal-reference, and audio generation modes;
- preserve English, Portuguese, Indonesian, and German route parity;
- add focused automated checks for completeness and ordering;
- run the existing SEO and production-build checks that cover this route.

No new model detail pages, slugs, localized route files, showcase assets, or
provider integrations are part of this change. Models without a detail page
link to the relevant capability page rather than to a route that does not
exist.

## Source-Of-Truth Boundaries

Availability and supported modes come from the public production model APIs:

- `/v1/image/models`;
- `/v1/video/models`;
- `/v1/music/models`;
- `/v1/audio/models`.

The repository's embedded curation and `docs/anycap-current-status.md` are used
to verify recent integration dates and the intended current product surface.
The web implementation remains static and build-safe: it does not fetch the API
while rendering the SEO page.

`web/src/lib/capability-inventory.ts` remains the shared public inventory for
the model comparison data. The change extends the existing records with a
machine-sortable update date instead of introducing a second independent model
list. Existing model-detail guidance in `web/src/lib/seo/model-catalog.ts` is
reused where a detail page exists.

## Recency Semantics

Each model record has an ISO `updatedAt` date. The date means the most recent of:

1. the model becoming available through AnyCap; or
2. a material user-visible capability change, such as a newly supported mode.

Copy-only edits, internal route-key corrections, test changes, and unrelated
provider maintenance do not change `updatedAt`.

Models are sorted by `updatedAt` descending. Ties are resolved by display name
ascending so builds remain deterministic. The page must not infer recency from
array position or provider marketing release dates.

Known recent entries include:

- Doubao Seed Audio 1.0 and Seedance 2.0 Mini on 2026-07-18;
- Kling 3.0 and Seedance 2.0 on 2026-07-14 for their material mode additions;
- Gemini Omni Flash Preview and Nano Banana 2 Lite on 2026-07-04;
- Kling 3.0 Omni on 2026-06-24.

Older entries retain their verified AnyCap availability date and sort below
these additions.

## Page Structure

The existing hero, visual guide, comparison tables, model-guide cards, FAQ, and
footer CTA remain. The layout and design language do not change.

A compact **Latest additions** section appears before the full comparison. It
shows the newest records across all capabilities, ordered by `updatedAt`, with:

- display name;
- capability;
- visible update date;
- current modes;
- a concise best-fit description;
- a safe link to an existing model-detail or capability route.

The full comparison continues to group models by capability. Within Image,
Video, Music, and Audio, rows are sorted newest first. The Audio table uses a
per-call variable-price label because current direct-output billing is based on
upstream cost and no stable public estimate is available.

The existing curated model-guide cards remain below the comparison. They are
not expanded into fake guides for models without detail pages.

## Copy And Localization

The hero summary and visual-guide body are updated to mention image, video,
music, and audio generation. The comparison introduction states that the list
reflects the active production catalog as of the page modification date.

All new visible labels and recent-model descriptions are supplied for English,
Portuguese, Indonesian, and German. Model IDs and mode identifiers remain the
exact CLI/API values and are not translated.

The FAQ is updated where it currently frames the catalog as only a small set of
older models. It continues to teach selection principles rather than making
unsupported provider benchmark claims.

## Failure And Drift Handling

The page does not perform a runtime API request, so an upstream outage cannot
break the SEO route.

Focused source-contract tests verify:

- the four capability groups are present;
- all production model IDs captured for this refresh appear in the hub
  inventory;
- each record has a valid ISO update date;
- sorting is descending and deterministic;
- recent additions appear ahead of older entries;
- models without detail pages use existing capability routes.

Future model integrations still require a deliberate web inventory update, but
the checks make omissions and accidental manual reordering visible during the
web build workflow.

## Verification

Implementation verification includes:

- the focused model-hub contract test, first observed failing before the page
  change and then passing;
- TypeScript/Next production build;
- existing SEO breadcrumb, information-architecture, locale-rollout, and hub
  locale-rollout checks;
- rendered inspection of `/models` in the default locale and one localized
  route at desktop and mobile widths;
- confirmation that every new link resolves to an existing route.

## Non-Goals

- adding Seedream 5.0 Pro before it is available in the AnyCap production
  catalog;
- creating new model detail pages;
- changing model pricing or provider routing;
- changing the landing page or navigation;
- fetching the model catalog dynamically at request time;
- redesigning the models hub.
